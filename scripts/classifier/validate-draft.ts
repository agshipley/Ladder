/**
 * Mechanical validator — Stage 3 of the generation pipeline (GENERATION-STANDARD.md).
 * DETERMINISTIC: no model calls. It resolves citations against the live store but makes no
 * judgement — every check is a rule. A failure fails generation loudly (the draft never reaches
 * the review queue); the reason is returned for logging.
 */
import type { GbrainRetrievalClient } from "./retrieval.ts";

export interface ValidatorCheck { check: string; pass: boolean; detail: string; }
/** A citation logged for reviewer visibility (07/18 citation-truth check). `quoted` attributions
 *  are verbatim-verified against the cited source; `paraphrased` ones are logged, not asserted. */
export interface CitationLogEntry { kind: "quoted" | "paraphrased"; claim: string; title: string; chunk: string; verified?: boolean; }
export interface ValidatorResult { pass: boolean; checks: ValidatorCheck[]; failures: string[]; citationLog?: CitationLogEntry[]; }

export interface TemplateSectionLike { title: string; fill_mode: string[]; conditionality?: string; }

// Internal vocabulary that must never appear in a customer deliverable (seed list; extendable).
const INTERNAL_VOCAB: RegExp[] = [
  /\bB-\d+\b/,                              // ruling ids (B-11, B-32, ...)
  /\bgap[- ]class\b/i,                       // gap-class doctrine term
  /\b(artifact-sufficient|genuine-absence|not-ingested|documented-n-a)\b/i, // verdict/class states
  /\bcapability framing\b/i,
  /\breference model\b/i, /\breference-model\b/i,
  /\b(GTM|OPS|PEOPLE|LEGAL|CAP|FIN|VIS|ENG|AIOPS|COMP|PRODUCT)-\d{2}\b/, // criterion ids
  /\bBand[- ]?1\b/i,                          // reference-model band language
  /\btile\b/i,                               // board vocabulary
];
const TEST_ARTIFACT_RE = /probetest|test[-_ ]?artifact|\bprobe\b/i;

// STEP 3c: pipeline vocabulary that must not survive into the rendered DELIVERABLE. Checked
// post-render (after the deliverable-form transform); a hit is a generation FAILURE.
const DELIVERABLE_BANNED: { label: string; re: RegExp }[] = [
  ...INTERNAL_VOCAB.map((re) => ({ label: "internal vocab", re })),
  { label: "PRIORITY-FLAG", re: /PRIORITY[- ]FLAG/i },
  { label: "routing language", re: /routed to\b/i },
  { label: "fill-mode term", re: /fill[- _]mode/i },
  { label: "recommended boilerplate", re: /not currently evidenced/i },
  { label: "section-status term", re: /\bopen-ruling\b/i },
  { label: "coverage table", re: /##\s+Section coverage/i },
  { label: "fill-mode label line", re: /^(?:OPERATOR|CORPUS\s*\+|CORPUS\b|RECOMMEND\b|STRUCTURAL)\b/im },
];

/** Post-render deliverable lint (STEP 3c): returns pipeline-vocabulary violations, empty if clean. */
export function lintDeliverable(md: string): string[] {
  const out: string[] = [];
  for (const { label, re } of DELIVERABLE_BANNED) { const m = md.match(re); if (m) out.push(`${label} ("${m[0].trim().slice(0, 32)}")`); }
  return [...new Set(out)];
}

const citationRe = /\[[^\][]*?chunk\s*[0-9]+[^\][]*\]/i; // a bracket that carries "chunk N"

/** Extract (title, chunkId) citations, splitting compound `[A, chunk N; B, chunk M]` brackets. */
function citations(md: string): { title: string; chunk: string }[] {
  const out: { title: string; chunk: string }[] = [];
  const bracket = /\[([^\][]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = bracket.exec(md))) {
    const inner = m[1];
    if (!/chunk\s*\d+/i.test(inner)) continue;       // skips [authority: …], [added — not in corpus]
    for (const part of inner.split(";")) {
      const c = part.match(/(.+?),\s*chunk\s*(\d+)/i);
      if (c) out.push({ title: c[1].trim(), chunk: c[2] });
    }
  }
  return out;
}

/** Split a draft body into `## <section>` blocks (title -> body text). */
function sectionBlocks(md: string): Map<string, string> {
  const blocks = new Map<string, string>();
  const parts = md.split(/^##\s+/m).slice(1);
  for (const p of parts) { const nl = p.indexOf("\n"); const title = (nl < 0 ? p : p.slice(0, nl)).trim(); blocks.set(title, nl < 0 ? "" : p.slice(nl + 1)); }
  return blocks;
}
const norm = (s: string) => s.replace(/^\d+\.\s*/, "").trim().toLowerCase();
/** Whitespace-collapsing title normalizer (matches deliverable-form.ts) — for title->slug lookup. */
const normTitle = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();

/** Checks that BLOCK in plan mode (07/18): the fabrication-prevention set only. A gap-closure plan
 *  is an internal review artifact, not a customer deliverable, so the customer-deliverable checks
 *  (internal vocabulary, test-artifact sources, uncited-substantive, section coverage, open rulings)
 *  do NOT block it — per STEP 4, plan mode runs the citation-truth checks + the adversarial gate. */
const PLAN_BLOCKING_CHECKS = new Set([
  "citations resolve to real chunks",
  "cited quotes appear in the cited source",
  "no duplicate sections",
  "no future-dated citations",
]);

export async function validateDraft(
  bodyMd: string, sections: TemplateSectionLike[], retrieval: GbrainRetrievalClient,
  sourceDocuments: { title: string; slug: string | null }[] = [],
  planMode = false,
): Promise<ValidatorResult> {
  const checks: ValidatorCheck[] = [];
  const add = (check: string, pass: boolean, detail: string) => checks.push({ check, pass, detail });

  const blocks = sectionBlocks(bodyMd);
  const blockTitles = [...blocks.keys()].map(norm);

  // 1. Every template section present OR explicitly deferred with its conditionality reason.
  const missingSections: string[] = [];
  const badDefer: string[] = [];
  for (const s of sections) {
    const key = [...blocks.keys()].find((k) => norm(k).includes(norm(s.title)) || norm(s.title).includes(norm(k)));
    if (!key) { missingSections.push(s.title); continue; }
    const body = blocks.get(key) ?? "";
    if (/\bdeferred\b/i.test(body) && !s.conditionality) badDefer.push(s.title);
  }
  add("every section present", missingSections.length === 0, missingSections.length ? `missing: ${missingSections.join(", ")}` : "all sections present");

  // 2. Every cited chunk id must be a REAL chunk from one of the draft's actual source documents
  //    (hallucinated chunk ids FAIL). The check is on the chunk id, not the cited title — the model
  //    cites workbook tabs by shorthand ("Build", "Output"), but the id either exists in the
  //    source-document universe or it is fabricated. The universe = chunk ids of every source
  //    document's page, gathered from the store. (If the universe can't be built — no store slugs —
  //    the check is skipped rather than false-failing.)
  const cites = citations(bodyMd);
  const universe = new Set<string>();
  for (const d of sourceDocuments) if (d.slug) for (const id of await retrieval.getChunkIds(d.slug)) universe.add(id);
  const unresolved = universe.size === 0 ? [] : cites.filter((c) => !universe.has(c.chunk)).map((c) => `[${c.title}, chunk ${c.chunk}]`);
  add("citations resolve to real chunks", unresolved.length === 0,
    universe.size === 0 ? "skipped (no source-document slugs to resolve against)"
      : unresolved.length ? `${unresolved.length} unresolved of ${cites.length}: ${[...new Set(unresolved)].slice(0, 5).join("; ")}`
      : `${cites.length} citations resolved against ${universe.size} source chunks`);

  // 2b. CITATION TRUTH (07/18, the fabrication finding). For every QUOTED string attributed to a
  //     chunk, assert the quote (normalized whitespace) appears in the cited source's text — not
  //     merely that the chunk id resolves. PARAPHRASED citations (no adjacent quote) are logged as
  //     claim+chunk pairs for reviewer visibility, not asserted. Unverifiable citations (no
  //     source-document slug/body to check against) are skipped, never false-failed.
  const nw = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  const slugByTitle = new Map(sourceDocuments.map((d) => [normTitle(d.title), d.slug]));
  const bodyBySlug = new Map<string, string | null>();
  for (const d of sourceDocuments) {
    if (d.slug && !bodyBySlug.has(d.slug)) {
      const rec = await (retrieval as any).getPageRecord?.(d.slug).catch(() => null);
      bodyBySlug.set(d.slug, rec?.body ? nw(rec.body) : null);
    }
  }
  const citationLog: CitationLogEntry[] = [];
  const fabricatedQuotes: string[] = [];
  const citeScan = /\[([^\][]+)\]/g;
  let cm: RegExpExecArray | null;
  while ((cm = citeScan.exec(bodyMd))) {
    if (!/chunk\s*\d+/i.test(cm[1])) continue;
    const before = bodyMd.slice(Math.max(0, cm.index - 260), cm.index);
    // A quoted attribution: a "..."-quoted span (>= 12 chars) close before the citation.
    const q = before.match(/[“"]([^“”"]{12,}?)[”"]\s*[^“”"]{0,40}$/);
    for (const part of cm[1].split(";")) {
      const c = part.match(/(.+?),\s*chunk\s*(\d+)/i);
      if (!c) continue;
      const title = c[1].trim(), chunk = c[2];
      if (q) {
        const slug = slugByTitle.get(normTitle(title)) ?? null;
        const srcBody = slug ? bodyBySlug.get(slug) ?? null : null;
        const verified = srcBody != null;
        if (verified && !srcBody!.includes(nw(q[1]))) fabricatedQuotes.push(`"${q[1].slice(0, 48)}" not in [${title}, chunk ${chunk}]`);
        citationLog.push({ kind: "quoted", claim: q[1].slice(0, 160), title, chunk, verified });
      } else {
        citationLog.push({ kind: "paraphrased", claim: before.replace(/\s+/g, " ").trim().slice(-140), title, chunk });
      }
    }
  }
  add("cited quotes appear in the cited source", fabricatedQuotes.length === 0,
    fabricatedQuotes.length ? `${fabricatedQuotes.length} fabricated quote(s): ${fabricatedQuotes.slice(0, 3).join("; ")}`
      : `${citationLog.filter((e) => e.kind === "quoted").length} quoted attributions verified/unverifiable; ${citationLog.filter((e) => e.kind === "paraphrased").length} paraphrased logged`);

  // 2c. DUPLICATE SECTION (the doubled Decisions-Required defect). No `## <title>` may repeat.
  const hdrs = [...bodyMd.matchAll(/^##\s+(.+?)\s*$/gm)].map((m) => norm(m[1]));
  const seenH = new Set<string>(); const dupH = new Set<string>();
  for (const h of hdrs) { if (seenH.has(h)) dupH.add(h); seenH.add(h); }
  add("no duplicate sections", dupH.size === 0, dupH.size ? `duplicated: ${[...dupH].join(", ")}` : "no repeated section headers");

  // 2d. NO FUTURE-DATED CITATIONS (the fabricated-source defect). A parseable date strictly after
  //     today FAILS. Bare year == current year is not future (present); a bare year > current fails.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const curYear = today.getFullYear();
  const MONTHS: Record<string, number> = { january: 0, february: 1, march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9, november: 10, december: 11 };
  const future: string[] = [];
  for (const m of bodyMd.matchAll(/\b(\d{4})-(\d{2})-(\d{2})\b/g)) { if (new Date(+m[1], +m[2] - 1, +m[3]) > today) future.push(m[0]); }
  for (const m of bodyMd.matchAll(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\b/gi)) { if (new Date(+m[2], MONTHS[m[1].toLowerCase()], 1) > today) future.push(m[0]); }
  for (const m of bodyMd.matchAll(/\b(20\d{2})\b/g)) { if (+m[1] > curYear) future.push(m[1]); }
  add("no future-dated citations", future.length === 0, future.length ? `future date(s): ${[...new Set(future)].slice(0, 5).join(", ")}` : "no future dates");

  // 3. Zero internal vocabulary in the deliverable.
  const vocabHits: string[] = [];
  for (const re of INTERNAL_VOCAB) { const m = bodyMd.match(re); if (m) vocabHits.push(m[0]); }
  add("no internal vocabulary", vocabHits.length === 0, vocabHits.length ? `found: ${[...new Set(vocabHits)].join(", ")}` : "clean");

  // 4. No test-artifact sources.
  const testCites = cites.filter((c) => TEST_ARTIFACT_RE.test(c.title));
  add("no test-artifact sources", testCites.length === 0, testCites.length ? `found: ${[...new Set(testCites.map((c) => c.title))].join(", ")}` : "none");

  // 5. Uncited substantive claims carry a flag (Recommended / [formula added] / [authority]).
  //    Heuristic (deterministic): a bulletpoint with a numeric/formula claim but no citation and
  //    no flag is a violation. Conservative — only flags bullets containing "=" or a %/number
  //    definition without any citation or recognized flag.
  const flagRe = /\*\*Recommended:\*\*|\*\*Decision required:\*\*|Recommended — not currently evidenced|\[formula added\]|\[authority[:\]]|Operator decision required|Routed to Open rulings|DEFERRED/i;
  const unflagged: string[] = [];
  for (const line of bodyMd.split("\n")) {
    const t = line.trim();
    if (!/^[-*]\s/.test(t)) continue;
    const substantive = /=|÷|\bformula\b/.test(t) || /\b\d+%/.test(t);
    // "cited" = a bracket citation, a numbered ref, OR a parenthetical document reference.
    const cited = citationRe.test(t) || /\[\d+\]/.test(t) || /\([A-Z][^)]{6,}\)/.test(t);
    if (substantive && !cited && !flagRe.test(t)) unflagged.push(t.slice(0, 90));
  }
  add("uncited substantive claims are flagged", unflagged.length === 0, unflagged.length ? `${unflagged.length} unflagged: ${unflagged.slice(0, 3).join(" | ")}` : "all flagged/cited");

  // 6. Open Rulings non-empty when any operator-mode section exists.
  const hasOperator = sections.some((s) => s.fill_mode.includes("operator"));
  const openBlockKey = [...blocks.keys()].find((k) => /open rulings|decisions required/i.test(k));
  const openBody = openBlockKey ? (blocks.get(openBlockKey) ?? "") : "";
  const openNonEmpty = /(?:[-*]|\d+\.)\s+\S/.test(openBody); // bullets OR numbered questions
  add("Open Rulings non-empty when operator sections exist", !hasOperator || openNonEmpty, hasOperator ? (openNonEmpty ? "present + non-empty" : "operator sections exist but Open Rulings is empty") : "no operator sections");

  // In plan mode only the fabrication-prevention checks block; the rest are advisory (still recorded).
  const blocked = checks.filter((c) => !c.pass && (!planMode || PLAN_BLOCKING_CHECKS.has(c.check)));
  const failures = blocked.map((c) => `${c.check}: ${c.detail}`);
  return { pass: failures.length === 0, checks, failures, citationLog };
}

/**
 * Deterministic external-reference check (07/18). Runs after the deliverable-form transform (the
 * point external references exist): every external reference must carry a URL, and no authority
 * finding may be future-dated. No model spend. Returns failure strings (empty = clean).
 */
export function checkExternalRefs(
  externalReferences: { n: number; label: string; url: string }[],
  findings: { source: string; year: string }[] = [],
): string[] {
  const out: string[] = [];
  const noUrl = externalReferences.filter((e) => !e.url || !/^https?:\/\//i.test(e.url));
  if (noUrl.length) out.push(`external reference without a URL: ${noUrl.map((e) => `E${e.n} (${e.label.slice(0, 40)})`).join(", ")}`);
  const curYear = new Date().getFullYear();
  const futureYr = findings.filter((f) => /^\d{4}$/.test(f.year) && +f.year > curYear);
  if (futureYr.length) out.push(`future-dated authority source(s): ${futureYr.map((f) => `${f.source} (${f.year})`).join(", ")}`);
  return out;
}
