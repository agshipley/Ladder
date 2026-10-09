// Shared block-level Markdown parser (no dependency). ONE parser, TWO renderers: docx-export.ts
// renders these blocks to DOCX, and blocksToHtml() renders them to styled HTML for the review
// surface. Handles the subset our drafts use: # ## ### headings, - * / 1. lists, | tables |
// (with a separator row → header), ``` code fences, > blockquotes, and paragraphs. Inline
// (**bold**, *italic*, `code`) is applied per-renderer.

export type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; header: string[] | null; rows: string[][] }
  | { type: "code"; text: string }
  | { type: "quote"; text: string }
  | { type: "para"; text: string };

const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
const isSep = (l: string) => /^\s*\|[\s:|-]+\|\s*$/.test(l);
const cellsOf = (l: string) => l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

/** Parse markdown into a flat list of blocks. Order-preserving; groups list/table runs. */
export function parseBlocks(src: string): Block[] {
  const lines = String(src ?? "").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trimEnd();
    if (!line.trim()) { i++; continue; }

    // fenced code
    if (/^\s*```/.test(line)) {
      const buf: string[] = []; i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { buf.push(lines[i]); i++; }
      i++; // closing fence (if present)
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }
    // heading
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
      blocks.push({ type: "heading", level: m[1].length as 1 | 2 | 3, text: m[2].trim() });
      i++; continue;
    }
    // table (consecutive pipe rows)
    if (isTableRow(line)) {
      const tbl: string[] = [];
      while (i < lines.length && isTableRow(lines[i].trimEnd())) { tbl.push(lines[i].trim()); i++; }
      let header: string[] | null = null;
      let rows: string[][];
      if (tbl.length >= 2 && isSep(tbl[1])) { header = cellsOf(tbl[0]); rows = tbl.slice(2).filter((r) => !isSep(r)).map(cellsOf); }
      else rows = tbl.filter((r) => !isSep(r)).map(cellsOf);
      blocks.push({ type: "table", header, rows });
      continue;
    }
    // blockquote
    if (/^\s*>/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) { buf.push(lines[i].replace(/^\s*>\s?/, "")); i++; }
      blocks.push({ type: "quote", text: buf.join("\n") });
      continue;
    }
    // list (bullet or ordered)
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length) {
        const l = lines[i].trimEnd();
        const bm = l.match(/^\s*[-*]\s+(.*)$/);
        const om = l.match(/^\s*\d+\.\s+(.*)$/);
        if (ordered && om) items.push(om[1]);
        else if (!ordered && bm) items.push(bm[1]);
        else break;
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    // paragraph — gather until a blank line or the start of another block
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^\s*(#{1,3}\s|[-*]\s|\d+\.\s|\||>|```)/.test(lines[i])) {
      buf.push(lines[i].trim()); i++;
    }
    blocks.push({ type: "para", text: buf.join(" ") });
  }
  return blocks;
}

/**
 * Strip a draft's pipeline-provenance preamble for DISPLAY: the metadata comment, the
 * "DRAFT FOR OPERATOR APPROVAL" H1, and the leading blockquote block (purpose/doctrine) — so
 * the surface shows the document as it would be adopted. Inline honesty flags ([added — not in
 * corpus], [formula added]) and the sources appendix are body content and are KEPT.
 */
export function stripDraftPreamble(md: string): string {
  let s = String(md ?? "").replace(/<!--[^]*?-->/g, "").replace(/^﻿/, "").trimStart();
  s = s.replace(/^#\s*DRAFT FOR OPERATOR APPROVAL.*(?:\n|$)/i, "");
  const lines = s.split("\n");
  let i = 0;
  while (i < lines.length && (lines[i].trim() === "" || /^\s*>/.test(lines[i]) || /^-{3,}\s*$/.test(lines[i].trim()))) i++;
  return lines.slice(i).join("\n").trim();
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Inline markdown → safe HTML (escape first, then bold/italic/code + honesty-flag styling). */
export function inlineHtml(s: string): string {
  let h = esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  h = h.replace(/\[(added — not in corpus|formula added)\]/g, '<span class="flag-added">[$1]</span>');
  return h;
}

/** Render parsed blocks to an HTML string (real headings, lists, tables, code, blockquote). */
export function blocksToHtml(blocks: Block[]): string {
  const out: string[] = [];
  for (const b of blocks) {
    if (b.type === "heading") { const h = Math.min(b.level + 2, 6); out.push(`<h${h}>${inlineHtml(b.text)}</h${h}>`); }
    else if (b.type === "list") { const t = b.ordered ? "ol" : "ul"; out.push(`<${t}>${b.items.map((it) => `<li>${inlineHtml(it)}</li>`).join("")}</${t}>`); }
    else if (b.type === "code") out.push(`<pre class="md-code"><code>${esc(b.text)}</code></pre>`);
    else if (b.type === "quote") out.push(`<blockquote>${b.text.split("\n").map(inlineHtml).join("<br>")}</blockquote>`);
    else if (b.type === "table") {
      const thead = b.header ? `<thead><tr>${b.header.map((c) => `<th>${inlineHtml(c)}</th>`).join("")}</tr></thead>` : "";
      const tbody = `<tbody>${b.rows.map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      out.push(`<div class="md-table-wrap"><table class="md-table">${thead}${tbody}</table></div>`);
    }
    else out.push(`<p>${inlineHtml(b.text)}</p>`);
  }
  return out.join("\n");
}

/** Convenience: markdown → styled HTML, sharing parseBlocks with the DOCX exporter. */
export function richMdToHtml(md: string): string {
  return blocksToHtml(parseBlocks(md));
}
