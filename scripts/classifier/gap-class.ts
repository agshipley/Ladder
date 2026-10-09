/**
 * Gap-class inference (GAP-CLASS-DOCTRINE). There is no per-subcategory gap_class field
 * in the schema yet (the checklist-annotation layer is unbuilt), so class is inferred from
 * the criterion prose + a small explicit override map for the well-known cases. Three
 * classes govern the remediation contract:
 *   - artifact-sufficient : the document IS the requirement; generation can close it.
 *   - system              : an operating system/tool must be adopted; recommend + seed only.
 *   - practice            : behavior must run; scaffold only, tile flips on later natural evidence.
 */

export type GapClass = "artifact-sufficient" | "system" | "practice";

// Explicit overrides where prose inference is ambiguous (operator-legible, editable).
const OVERRIDES: Record<string, GapClass> = {
  "GTM-11": "system",   // pipeline system of record (CRM)
  "GTM-12": "system",   // scheduling infrastructure
  "GTM-14": "practice", // pipeline review cadence (practice-in-use, B-32)
  "GTM-20": "artifact-sufficient", // metrics-definitions document
  "OPS-02": "practice",
  "FIN-03": "practice", // budget adopted AND used
  "GTM-19": "practice",          // override 2026-07-16, operator-ruled
  "PEOPLE-01": "practice",       // override 2026-07-16, operator-ruled
  "PEOPLE-04": "artifact-sufficient", // override 2026-07-16, operator-ruled
  "LEGAL-02": "practice",        // override 2026-07-16, operator-ruled
  "LEGAL-08": "practice",        // override 2026-07-16, operator-ruled
  "CAP-06": "artifact-sufficient", // override 2026-07-16, operator-ruled
  "AIOPS-02": "practice",        // override 2026-07-16, operator-ruled
  "ENG-03": "practice",          // conservative re-class this run, operator review pending (practice-heavy: deploy history in regular use)
  "ENG-07": "practice",          // conservative re-class this run, operator review pending (practice-heavy: lockfile churn / updates flowing)
};

/** Tiles where Ladder generates NOTHING (structural): no Generate button, endpoint refuses.
 *  LEGAL-08 — litigation/dispute materials are maintained outside the corpus by policy
 *  (B-11 placeholder ruling); generating them would be fabrication of a legal record. */
export const GENERATION_EXCLUDED = new Set<string>([
  "LEGAL-08",                                  // litigation/dispute materials (prior ruling)
  "LEGAL-01", "LEGAL-06", "COMP-02",           // records of executed instruments — a generated record is fabrication (2026-07-17)
]);

/** Tiles generated as BLANK FORM TEMPLATES only (no populated facts). LEGAL-02 — a corporate
 *  action record; a populated one is fabrication, so generation yields blank forms with
 *  instruction blocks where facts go. */
export const TEMPLATE_ONLY = new Set<string>(["LEGAL-02"]);

export function isGenerationExcluded(id: string): boolean { return GENERATION_EXCLUDED.has(id); }
export function isTemplateOnly(id: string): boolean { return TEMPLATE_ONLY.has(id); }

const SYSTEM_RE = /\b(system of record|CRM|scheduler|scheduling|tool is set up|provider is set up|accounting system|payroll provider|monitoring is owned|platform|Anrok|Gusto|billing integration|tooling)\b/i;
const PRACTICE_RE = /\b(practice-in-use|B-32|on a cadence|cadence|reviewed on|runs on a cadence|naturally-produced|review rhythm|budget-vs-actuals|in use|reforecast|actually reviews|demonstrably feeds|running)\b/i;

/** Infer the gap class for a subcategory from its id + criterion prose. */
export function inferGapClass(id: string, criterion: string): GapClass {
  if (OVERRIDES[id]) return OVERRIDES[id];
  if (SYSTEM_RE.test(criterion)) return "system";
  if (PRACTICE_RE.test(criterion)) return "practice";
  return "artifact-sufficient";
}

/** Whether a class permits an approved-draft ingestion + tile flip (doctrine). */
export function isFlippable(cls: GapClass): boolean {
  return cls === "artifact-sufficient";
}
