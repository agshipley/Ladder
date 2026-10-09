// docs.mjs — document-grained views over a verdict's cited chunks. Shared by the React
// board, build-data.mjs, and the static export so grouping is identical everywhere.
// A "document" is a source page: keyed by slug when present, else title, else the raw
// chunk id (malformed/unresolved ids each form their own singleton "document").

/** Fill each cited chunk's empty title from any titled chunk on the same document (slug);
 *  for a document titled nowhere, derive a short label from its first gist. Mutates in place.
 *  No bare slug is ever shown as a document's primary name (Board-v4 part 2). */
export function resolveTitles(records) {
  const titleBySlug = new Map();
  for (const r of records || []) for (const c of r.citedChunks || []) {
    if (c.slug && c.title && !titleBySlug.has(c.slug)) titleBySlug.set(c.slug, c.title);
  }
  const derivedBySlug = new Map();
  for (const r of records || []) for (const c of r.citedChunks || []) {
    if (c.slug && !titleBySlug.has(c.slug) && !derivedBySlug.has(c.slug)) {
      const g = String(c.gist || "").replace(/^\[[^\]]*\]\s*/, "").replace(/^#+\s*/, "").trim();
      if (g) derivedBySlug.set(c.slug, g.length > 52 ? g.slice(0, 52).replace(/\s\S*$/, "") + "…" : g);
    }
  }
  for (const r of records || []) for (const c of r.citedChunks || []) {
    if (!c.title && c.slug) c.title = titleBySlug.get(c.slug) || derivedBySlug.get(c.slug) || "";
  }
}

export function docKey(c) {
  if (c.slug) return `slug:${c.slug}`;
  if (c.title) return `title:${c.title}`;
  return `chunk:${c.id}`;
}
export function docLabel(c) {
  if (c.title) return c.title;
  if (c.slug) return `slug ${c.slug}`;
  return c.id;
}

/** Group a verdict's cited chunks by source document, first-seen order preserved. */
export function groupByDoc(chunks) {
  const map = new Map();
  for (const c of chunks || []) {
    const k = docKey(c);
    if (!map.has(k)) map.set(k, { key: k, title: c.title || null, slug: c.slug || null, label: docLabel(c), chunks: [] });
    map.get(k).chunks.push(c);
  }
  return [...map.values()];
}

/** Run-level index: every document cited anywhere -> the verdicts it supports.
 *  Sorted by number of verdicts (most-relied-on first), then label. */
export function buildDocIndex(records) {
  const map = new Map();
  for (const r of records || []) {
    const seen = new Set();
    for (const c of r.citedChunks || []) {
      const k = docKey(c);
      if (!map.has(k)) map.set(k, { key: k, title: c.title || null, slug: c.slug || null, label: docLabel(c), verdicts: [] });
      if (!seen.has(k)) { // one verdict counts a document once
        map.get(k).verdicts.push({ id: r.id, state: r.state });
        seen.add(k);
      }
    }
  }
  return [...map.values()].sort((a, b) => b.verdicts.length - a.verdicts.length || a.label.localeCompare(b.label));
}
