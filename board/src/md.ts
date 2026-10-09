// Minimal markdown -> HTML for board prose (criterion text, conditions, rationale).
// No dependency. Handles the subset the reference-model prose actually uses: **bold**,
// *italic*, `code`, bullet lists, and paragraphs. Everything is HTML-escaped first, so
// output is safe to inject. Also a stripMd() for one-line contexts (tiles never use it,
// but conditions/rationale in dense tables do).

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(s: string): string {
  return escapeHtml(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
}

/** Render a markdown block to an HTML string (for dangerouslySetInnerHTML). */
export function mdToHtml(src: string): string {
  const lines = String(src ?? "").split("\n");
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line.trim())}</p>`);
  }
  closeList();
  return out.join("\n");
}

/** Flatten markdown to plain text (strip markers) for compact one-line contexts. */
export function stripMd(src: string): string {
  return String(src ?? "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
