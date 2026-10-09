/**
 * Deliverable-form transform (GENERATION-STANDARD.md deliverable-form rules, 2026-07-17).
 * DETERMINISTIC. Turns the pipeline's raw draft body into a clean deliverable a competent
 * operator could have written: chunk-level citations become numbered references resolving in a
 * title-only Sources section; authority tags move to External references; the section-coverage
 * table is extracted to the sidecar; fill-mode labels, routing language, PRIORITY-FLAG, and the
 * "Recommended — not currently evidenced" boilerplate are removed. Full provenance (reference →
 * document/slug/chunk) is returned for the sidecar, not deleted.
 */

export interface DeliverableRef { n: number; title: string; slug: string | null; chunks: string[]; }
export interface ExternalRef { n: number; label: string; url: string; }
export interface CoverageRow { section: string; status: string; reason: string; }
export interface DeliverableResult {
  deliverableMd: string;
  references: DeliverableRef[];
  externalReferences: ExternalRef[];
  coverage: CoverageRow[];
}

const PREFACE =
  "_Items marked **Recommended** are standard practice not yet reflected in your materials; " +
  "items marked **Decision required** await a company ruling._";

const normTitle = (t: string) => t.replace(/\s+/g, " ").trim().toLowerCase();

// The board's category prefixes — criterion/subcategory codes are built as PREFIX-NN.
const ID_PREFIXES = "GTM|OPS|PEOPLE|LEGAL|CAP|FIN|VIS|ENG|AIOPS|COMP|PRODUCT";
const CRITERION_ID = new RegExp(`\\b(?:${ID_PREFIXES})-\\d{2}\\b`, "g");

/**
 * Strip internal board/criterion codes (GTM-20, OPS-01, PRODUCT-01, …) from customer-facing prose
 * (07/18 rerun-closeout, defect a). These are never customer content; they leak in from
 * cross-references inside criterion text or retrieved evidence — the "no internal vocabulary" gate
 * catches them, but a competent operator's document simply would not print them. Removes bracketed,
 * connector-led, and bare forms, cleaning the punctuation each leaves behind. Idempotent.
 */
export function stripCriterionIds(md: string): string {
  return md
    // "(GTM-20)" / "[OPS-01]" — parenthetical/bracketed reference (drop with any leading space)
    .replace(new RegExp(`\\s*[([]\\s*(?:${ID_PREFIXES})-\\d{2}\\s*[)\\]]`, "gi"), "")
    // "per GTM-20", "see OPS-01", "under CAP-01", "criterion PRODUCT-01" — connector + code
    .replace(new RegExp(`\\s*\\b(?:per|see|cf\\.?|ref\\.?|under|criterion|subcategory)\\s+(?:${ID_PREFIXES})-\\d{2}\\b`, "gi"), "")
    // any remaining bare token, absorbing an adjacent list/clause separator
    .replace(new RegExp(`\\s*[,;:—-]?\\s*\\b(?:${ID_PREFIXES})-\\d{2}\\b`, "gi"), "")
    .replace(/ {2,}/g, " ")
    .replace(/\(\s*\)/g, "");
}

/**
 * Normalize the Decisions-required / Open-rulings questions to plain sentences (07/18
 * rerun-closeout, defect b — OPS-05's non-plain line). Strips a leading "§<section-ref> —" prefix
 * and any stray section symbols from each question so the QUESTION-LEGIBILITY harness sees plain,
 * standalone questions. Scoped to the question block only; leaves the rest of the document untouched.
 */
export function stripQuestionSectionRefs(md: string): string {
  const m = md.match(/^##[ \t]+(?:Decisions required|Open rulings)[^\n]*$/im);
  if (!m || m.index === undefined) return md;
  const headEnd = m.index + m[0].length;
  // Question block = from this heading to the next "## " heading (line-start) or end of document.
  const nextH = md.slice(headEnd).search(/\n##[ \t]/);
  const blockEnd = nextH >= 0 ? headEnd + nextH : md.length;
  const cleaned = md.slice(headEnd, blockEnd)
    .replace(/^(\s*(?:\d+\.|[-*])\s*)§[^\n—-]*(?:—|-)\s*/gm, "$1") // leading "§Ref —" prefix on a question
    .replace(/§\s*\d+(?:\.\d+)?/g, "")                              // stray "§3" / "§3.1" refs
    .replace(/§\s*/g, "");                                          // any remaining section symbol
  return md.slice(0, headEnd) + cleaned + md.slice(blockEnd);
}

function buildSources(refs: DeliverableRef[], ext: ExternalRef[]): string {
  const lines = ["## Sources"];
  for (const r of refs) lines.push(`${r.n}. ${r.title}`);
  if (ext.length) {
    lines.push("", "### External references");
    for (const e of ext) lines.push(`E${e.n}. ${e.label}${e.url ? ` — ${e.url}` : ""}`);
  }
  return lines.join("\n");
}

export function toDeliverable(
  rawBody: string,
  sourceDocuments: { title: string; slug: string | null }[],
  findings: { source: string; year: string; url: string }[] = [],
): DeliverableResult {
  let md = rawBody;

  // 1. Extract + remove the Section coverage table (bookkeeping -> sidecar). Slice from the
  //    "## Section coverage" heading to the next "## " heading (or end) — a multiline `$` lookahead
  //    would stop at the first line-end and leave the table body behind.
  const coverage: CoverageRow[] = [];
  const covStart = md.search(/^##\s+Section coverage/m);
  if (covStart >= 0) {
    const after = md.slice(covStart);
    const nextH = after.slice(4).search(/\n##\s/);
    const block = nextH >= 0 ? after.slice(0, nextH + 4) : after;
    for (const line of block.split("\n")) {
      const m = line.match(/^\|\s*(.+?)\s*\|\s*(filled|deferred|open-ruling|thin|fail|pass)\s*\|\s*(.+?)\s*\|/i);
      if (m) coverage.push({ section: m[1].trim(), status: m[2].toLowerCase(), reason: m[3].trim() });
    }
    md = md.slice(0, covStart) + md.slice(covStart + block.length);
  }

  // 2. Routing language -> gone; operator-required leads -> "Decision required".
  md = md.replace(/\*\*Operator (?:ruling|decision) required\*\*\s*[—-]?\s*/gi, "**Decision required:** ");
  md = md.replace(/\bOperator (?:ruling|decision) required\b\s*[—-]?\s*/gi, "**Decision required:** ");
  md = md.replace(/\s*(?:[—-]\s*)?[Rr]outed to [^.\n]*\.?/g, "");   // any "routed to …" routing sentence
  md = md.replace(/^All \w+ (?:operator )?items\.?\s*$/gim, ""); // dangling "All four operator items" leftover

  // 3. Strip fill-mode label lines / leading label prefixes.
  md = md.replace(/^(?:OPERATOR|CORPUS(?:\s*\+\s*(?:OPERATOR|RECOMMEND))?|RECOMMEND(?:\s*\+\s*OPERATOR)?|STRUCTURAL)\b[^\n[]*?\.?\s*$/gim, "");
  md = md.replace(/^(?:OPERATOR|CORPUS[^.\n(]*|RECOMMEND[^.\n(]*)[.—-]\s*(?=[([A-Z])/gim, "");

  // 4. PRIORITY-FLAG annotation.
  md = md.replace(/\s*\(PRIORITY-FLAG\)/g, "").replace(/PRIORITY[- ]FLAG:?\s*/g, "");

  // 4b. Reference-model band language that leaks from criterion text is a pipeline artifact, never
  //     customer content — normalize it ("Band-1" -> "the baseline"). Criterion-ids (GTM-20, …) are
  //     stripped here too (07/18 defect a); the deliverable lint remains the backstop.
  md = md.replace(/\bBand[- ]?1\b/gi, "the baseline");
  md = stripCriterionIds(md);

  // 5. Recommended boilerplate -> light lead-in.
  md = md.replace(/Recommended\s*[—-]\s*not currently evidenced(?:\s+in your materials)?:?\s*/gi, "**Recommended:** ");

  // 6. Authority inline tags -> External references [E n].
  const externalReferences: ExternalRef[] = [];
  const extIdx = new Map<string, number>();
  md = md.replace(/\[authority:\s*([^\]]+)\]/gi, (_w, inner) => {
    const key = String(inner).trim();
    if (!extIdx.has(key)) {
      const n = externalReferences.length + 1;
      const first = key.split(";")[0].trim().replace(/\s*\(([^)]*)\)/, " — $1");
      const kl = key.toLowerCase();
      const hit = findings.find((f) => f.source && kl.includes(f.source.toLowerCase().split(/[\s(]/)[0]));
      externalReferences.push({ n, label: first, url: hit?.url ?? "" });
      extIdx.set(key, n);
    }
    return `[E${extIdx.get(key)}]`;
  });

  // 7. Corpus [Document, chunk N] citations -> numbered [k] + title-only Sources.
  const references: DeliverableRef[] = [];
  const titleToN = new Map<string, number>();
  const slugOf = new Map(sourceDocuments.map((d) => [normTitle(d.title), d.slug]));
  md = md.replace(/\[([^\][]+)\]/g, (whole, inner) => {
    if (!/chunk\s*\d+/i.test(inner)) return whole; // leave [E1], [n], [Decision required] etc.
    const nums: number[] = [];
    for (const part of String(inner).split(";")) {
      const m = part.match(/(.+?),\s*chunk\s*(\d+)/i);
      if (!m) continue;
      const title = m[1].trim(), chunk = m[2];
      const key = normTitle(title);
      if (!titleToN.has(key)) {
        references.push({ n: references.length + 1, title, slug: slugOf.get(key) ?? null, chunks: [] });
        titleToN.set(key, references.length);
      }
      const ref = references[titleToN.get(key)! - 1];
      if (!ref.chunks.includes(chunk)) ref.chunks.push(chunk);
      nums.push(titleToN.get(key)!);
    }
    return nums.length ? nums.map((n) => `[${n}]`).join("") : "";
  });

  // 8. Whitespace cleanup.
  md = md.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();

  // 9. Preface after the title.
  md = md.replace(/^(#\s+.+\n)/, `$1\n${PREFACE}\n`);

  // 10. "Open rulings" -> "Decisions required" (question appendix); then normalize the questions to
  //     plain sentences (07/18 defect b — strip §-section-ref prefixes / stray section symbols).
  md = md.replace(/^##\s+Open rulings\b.*$/im, "## Decisions required");
  md = stripQuestionSectionRefs(md);

  // 11. Append Sources (+ External references) before the Decisions-required appendix.
  const sources = buildSources(references, externalReferences);
  if (/^##\s+Decisions required/m.test(md)) md = md.replace(/^(##\s+Decisions required)/m, `${sources}\n\n$1`);
  else md = `${md}\n\n${sources}`;

  return { deliverableMd: md, references, externalReferences, coverage };
}
