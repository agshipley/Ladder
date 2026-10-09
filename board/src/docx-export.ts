import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { parseBlocks, type Block } from "./md-blocks";

/**
 * Render a remediation draft's Markdown to a clean DOCX (VOICE-DISCIPLINE: plain professional
 * register; no markdown artifacts in the output). Shares ONE parser with the HTML review
 * renderer (md-blocks.ts parseBlocks) — this file is the DOCX renderer of that block model.
 * Strips the metadata comment, the DRAFT banner, generation markers, and fences first; maps
 * headings/bold to real DOCX styles. Works in the browser (Packer.toBlob) and Node (toBuffer).
 */

function stripToClean(md: string): string {
  return md
    .replace(/<!--[^]*?-->/g, "")
    .replace(/^#\s*DRAFT FOR OPERATOR APPROVAL.*$/gim, "")
    .replace(/^>.*$/gm, "")                       // banner blockquotes
    .replace(/```[^]*?```/g, "")                  // code fences
    .replace(/\[added — not in corpus\]/g, "")
    .replace(/\*\*(\s*)\*\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Split a line into bold / superscript-reference / plain runs. **bold** -> bold; numbered
 *  references [1], [E1] -> superscript (no brackets), matching the deliverable-form reference style. */
function runs(line: string): TextRun[] {
  const out: TextRun[] = [];
  const re = /(\*\*(.+?)\*\*)|(\[(E?\d+)\])/g;
  let last = 0, m: RegExpExecArray | null;
  const clean = line.replace(/`/g, "");
  while ((m = re.exec(clean))) {
    if (m.index > last) out.push(new TextRun(clean.slice(last, m.index)));
    if (m[2] !== undefined) out.push(new TextRun({ text: m[2], bold: true }));
    else out.push(new TextRun({ text: m[4], superScript: true }));
    last = m.index + m[0].length;
  }
  if (last < clean.length) out.push(new TextRun(clean.slice(last)));
  return out.length ? out : [new TextRun(clean)];
}

const HEADING_LEVEL = { 1: HeadingLevel.HEADING_1, 2: HeadingLevel.HEADING_2, 3: HeadingLevel.HEADING_3 } as const;
const relabelHash = (c: string) => (c === "#" ? "No." : c); // the sources-appendix "#" column

/** Render one block to DOCX paragraph(s). */
function blockToParas(b: Block): Paragraph[] {
  switch (b.type) {
    case "heading": return [new Paragraph({ heading: HEADING_LEVEL[b.level], children: runs(b.text) })];
    case "list": return b.items.map((it) => new Paragraph({ bullet: { level: 0 }, children: runs(it) }));
    case "table": {
      const out: Paragraph[] = [];
      if (b.header) out.push(new Paragraph({ children: runs(b.header.map(relabelHash).join("   ")) }));
      for (const r of b.rows) out.push(new Paragraph({ children: runs(r.map(relabelHash).join("   ")) }));
      return out;
    }
    case "code": return b.text.split("\n").map((l) => new Paragraph({ children: [new TextRun(l)] }));
    case "quote": return [new Paragraph({ children: runs(b.text.replace(/\n/g, " ")) })];
    default: return [new Paragraph({ children: runs(b.text) })];
  }
}

export function buildDocx(markdown: string, title: string): Document {
  const blocks = parseBlocks(stripToClean(markdown));
  const paras: Paragraph[] = [new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] })];
  for (const b of blocks) paras.push(...blockToParas(b));
  return new Document({ sections: [{ children: paras }] });
}

/** Browser: trigger a .docx download of the rendered draft. */
export async function downloadDocx(markdown: string, title: string, filename: string): Promise<void> {
  const blob = await Packer.toBlob(buildDocx(markdown, title));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.replace(/\.md$/, ".docx");
  a.click();
}
