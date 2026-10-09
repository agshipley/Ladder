/**
 * Generation harness — deterministic checks for generated DELIVERABLES (Task 1, 2026-07-17).
 * Modeled on the golden-fixture pattern, but for generation. NO model calls, NO network: every
 * check is a rule with a pass/fail + offending location.
 *
 * SCOPE BOUNDARY: this harness checks STRUCTURE and FORM (does the document confront its type's
 * sections; is it free of pipeline vocabulary; do citations resolve; is gating correct; are the
 * questions legible). It does NOT judge PROSE QUALITY — whether the writing is good, whether a
 * recommendation is wise. That is the stage-4 model review's job and is out of harness scope.
 */

export interface CheckResult { check: string; pass: boolean; detail: string; }
export interface CheckCtx {
  templateSections?: string[];              // template section titles, for SCOPE
  meta?: Record<string, string>;            // parsed metadata comment, for GATING
  references?: { n: number; title: string }[]; // sidecar reference map, for CITATION cross-check
}

const CHUNK_CITE = /\[[^\][]*chunk\s*\d+[^\][]*\]/i;
const SLUG = /\b\d{2}-[a-z]+\/[a-z0-9-]+/i;                 // e.g. 06-sources/example-doc
const FILLMODE_LABEL = /^(?:OPERATOR|CORPUS\s*\+|CORPUS\b|RECOMMEND\b|STRUCTURAL)\b/im;
const INTERNAL_VOCAB: RegExp[] = [
  /\bB-\d+\b/, /\bgap[- ]class\b/i,
  /\b(?:GTM|OPS|PEOPLE|LEGAL|CAP|FIN|VIS|ENG|AIOPS|COMP|PRODUCT)-\d{2}\b/,
  /routed to\b/i, /fill[- _]mode/i, /PRIORITY[- ]FLAG/i,
  /Recommended\s*[—-]\s*not currently evidenced/i, /\bopen-ruling\b/i,
  /capability framing/i, /reference[- ]model/i,
];

const stripMeta = (md: string) => md.replace(/<!--[^]*?-->/g, "");
const headings = (md: string) => [...md.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
const bodyBeforeSources = (md: string) => md.split(/^##\s+Sources/m)[0];
// Only the Sources section itself — stop at the next "## " heading (### External references is
// kept; "## Decisions required" and its numbered questions are excluded).
const sourcesBlock = (md: string) => (md.split(/^##\s+Sources/m)[1] ?? "").split(/^##\s+/m)[0];
const STOP = new Set(["and", "the", "of", "for", "to", "in", "on", "required", "metrics", "quality", "revenue&"]);
const keywords = (title: string) => title.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

/** SCOPE — every template section is present (a heading matches), or explicitly deferred/informational. */
export function checkScope(md: string, ctx: CheckCtx): CheckResult {
  const tsec = ctx.templateSections ?? [];
  if (tsec.length === 0) return { check: "SCOPE", pass: true, detail: "no template for this type (skipped)" };
  const hs = headings(md).map((h) => h.toLowerCase());
  const missing: string[] = [];
  for (const s of tsec) {
    const kws = keywords(s);
    const aliases = /decision|ruling/i.test(s) ? [...kws, "decisions", "rulings"] : kws;
    const present = hs.some((h) => aliases.some((k) => h.includes(k)));
    const deferred = new RegExp(`(?:deferred|informational)[^.\\n]{0,60}${kws[0] ?? ""}`, "i").test(md);
    if (!present && !deferred) missing.push(s);
  }
  return { check: "SCOPE", pass: missing.length === 0, detail: missing.length ? `missing: ${missing.join(", ")}` : `all ${tsec.length} sections present` };
}

/** READABILITY — no chunk citations, slugs, internal vocabulary, or fill-mode labels in the prose. */
export function checkReadability(md: string): CheckResult {
  const body = stripMeta(md);
  const hits: string[] = [];
  if (CHUNK_CITE.test(body)) hits.push(`chunk citation ("${(body.match(CHUNK_CITE) || [""])[0].slice(0, 30)}")`);
  if (SLUG.test(body)) hits.push(`slug ("${(body.match(SLUG) || [""])[0]}")`);
  if (FILLMODE_LABEL.test(body)) hits.push(`fill-mode label ("${(body.match(FILLMODE_LABEL) || [""])[0]}")`);
  for (const re of INTERNAL_VOCAB) { const m = body.match(re); if (m) hits.push(`internal vocab ("${m[0]}")`); }
  return { check: "READABILITY", pass: hits.length === 0, detail: hits.length ? [...new Set(hits)].join("; ") : "clean prose" };
}

/** CITATION-INTEGRITY — every [n] in prose resolves in Sources; Sources titles are non-empty and
 *  (when a sidecar map is supplied) match it. */
export function checkCitationIntegrity(md: string, ctx: CheckCtx): CheckResult {
  const refs = [...bodyBeforeSources(md).matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]));
  const srcRows = [...sourcesBlock(md).matchAll(/^\s*(\d+)\.\s+(.+)$/gm)].map((m) => [Number(m[1]), m[2].trim()] as [number, string]);
  const srcNums = new Set(srcRows.map(([n]) => n));
  const srcTitle = new Map(srcRows);
  const probs: string[] = [];
  const unresolved = [...new Set(refs)].filter((n) => !srcNums.has(n));
  if (unresolved.length) probs.push(`prose refs missing in Sources: [${unresolved.join(",")}]`);
  const empty = srcRows.filter(([, t]) => t.length < 2).map(([n]) => n);
  if (empty.length) probs.push(`empty Sources titles: ${empty.join(",")}`);
  if (ctx.references) {
    const byN = new Map(ctx.references.map((r) => [r.n, r.title]));
    const mism = [...srcTitle.entries()].filter(([n, t]) => byN.has(n) && byN.get(n) && !t.toLowerCase().includes(String(byN.get(n)).toLowerCase().slice(0, 12)) && !String(byN.get(n)).toLowerCase().includes(t.toLowerCase().slice(0, 12))).map(([n]) => n);
    if (mism.length) probs.push(`Sources title != sidecar map for [${mism.join(",")}]`);
  }
  return { check: "CITATION-INTEGRITY", pass: probs.length === 0, detail: probs.length ? probs.join("; ") : (refs.length ? `${new Set(refs).size} references resolve` : "no numbered references (nothing to resolve)") };
}

/** GATING — approvability follows gap_class (artifact-sufficient ONLY), never field-presence. A
 *  draft presented approvable (flippable:true) without an artifact-sufficient gap_class is mis-gated. */
export function checkGating(ctx: CheckCtx): CheckResult {
  const meta = ctx.meta ?? {};
  const gc = meta.gap_class;
  const flippable = meta.flippable === "true";
  const correctlyApprovable = gc === "artifact-sufficient";
  const misgated = flippable && !correctlyApprovable;
  return { check: "GATING", pass: !misgated, detail: misgated ? `flippable:true but gap_class=${gc ?? "(absent)"} — must not be approvable` : `gap_class=${gc ?? "(absent)"} -> approvable=${correctlyApprovable}` };
}

/** QUESTION-LEGIBILITY — Decisions-required entries are standalone plain questions: no section-ref
 *  prefixes (§N), no "blocks X" suffixes, no template vocabulary. */
export function checkQuestionLegibility(md: string): CheckResult {
  const sec = md.split(/^##\s+(?:Decisions required|Open rulings)/m)[1] ?? "";
  const items = [...sec.matchAll(/^\s*(?:\d+\.|[-*])\s+(.+)$/gm)].map((m) => m[1].trim());
  const bad: string[] = [];
  for (const it of items) {
    if (/§|\bblocks\b|\bconflicts\b|fill[- _]mode|open-ruling|PRIORITY[- ]FLAG|gap[- ]class/i.test(it)) bad.push(it.slice(0, 48));
  }
  return { check: "QUESTION-LEGIBILITY", pass: bad.length === 0, detail: bad.length ? `${bad.length} non-plain: ${bad.slice(0, 2).join(" | ")}` : (items.length ? `${items.length} plain questions` : "no Decisions-required section") };
}

export const CHECK_NAMES = ["SCOPE", "READABILITY", "CITATION-INTEGRITY", "GATING", "QUESTION-LEGIBILITY"] as const;

/** Run all deterministic checks against a deliverable. */
export function runChecks(md: string, ctx: CheckCtx): CheckResult[] {
  return [
    checkScope(md, ctx),
    checkReadability(md),
    checkCitationIntegrity(md, ctx),
    checkGating(ctx),
    checkQuestionLegibility(md),
  ];
}

/** Parse a draft's metadata comment into a flat map (for GATING). */
export function parseMetaComment(md: string): Record<string, string> {
  const m = md.match(/<!--[^]*?-->/);
  const out: Record<string, string> = {};
  if (m) for (const line of m[0].split("\n")) { const kv = line.match(/^\s*([a-z_]+):\s*(.+)$/); if (kv) out[kv[1]] = kv[2].trim(); }
  return out;
}
