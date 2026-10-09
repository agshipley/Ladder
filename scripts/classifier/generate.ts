import "./env.ts";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, appendFileSync, rmSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCriteria } from "./loader.ts";
import { retrievalFromEnv, GbrainRetrievalClient } from "./retrieval.ts";
import { judgeConfigFromEnv } from "./judge.ts";
import { inferGapClass, isFlippable, isGenerationExcluded, isTemplateOnly, type GapClass } from "./gap-class.ts";
import { validateDraft, lintDeliverable, checkExternalRefs, type ValidatorResult, type CitationLogEntry } from "./validate-draft.ts";
import { reviewStructure, type StructureReview } from "./review-structure.ts";
import { reviewAuthority, type AuthorityReport, type AuthorityFinding } from "./review-authority.ts";
import { adversarialReview, type AdversarialResult } from "./adversarial.ts";
import { recordUsage } from "./usage-meter.ts";
import { toDeliverable, stripCriterionIds, stripQuestionSectionRefs, type DeliverableRef, type ExternalRef, type CoverageRow } from "./deliverable-form.ts";
import { runChecks, parseMetaComment } from "./generation-harness/checks.ts";
import type { Chunk } from "./types.ts";

/**
 * Remediation generation service (board-driven flow; template layer + contract inversion,
 * 2026-07-17). generate(subcategoryId) produces a draft the operator reviews.
 *
 * CONTRACT INVERSION: when a generation TEMPLATE exists for the subcategory (e.g. GTM-20 ->
 * revenue-metrics), the TEMPLATE drives the document outline section-by-section; the corpus is
 * queried PER SECTION for evidence and NEVER defines scope. Each section is filled per its
 * fill_mode (corpus | recommend | operator | structural). Coverage is a SECTION-coverage
 * contract: every template section must be present (filled / deferred / open-ruling); a missing
 * section is a generation FAILURE, not a thin draft.
 *
 * When no template exists, generation falls back to the gap-class contract (artifact-sufficient
 * -> draft; system -> recommendation; practice -> scaffold) and logs the subcategory to the
 * template-authoring backlog. Nothing is ingested here; the draft is written to generated-drafts/.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const SCHEMA = join(REPO, "reference-model", "CRITERIA-SCHEMA.yaml");
const RUN = join(REPO, "runs-of-record", "ref-board-003.rich.json");
const DRAFTS = join(REPO, "generated-drafts");
const TEMPLATE_DIR = join(REPO, "generation-templates");
const TEMPLATE_BACKLOG = join(TEMPLATE_DIR, "template-backlog.jsonl");

// MODEL ROUTING (07/18): generation, structural self-review, authority review, and the adversarial
// gate all run on claude-sonnet-4-6 (the cost point). Opus remains ONLY the diagnostic judge
// (scripts/classifier/judge.ts, CLASSIFIER_JUDGE_MODEL). Override the generation model with
// CLASSIFIER_GEN_MODEL. Recorded in reference-model/GENERATION-STANDARD.md.
const GEN_MODEL = process.env.CLASSIFIER_GEN_MODEL || "claude-sonnet-4-6";

/** subcategory -> template name mapping. Add a row here when a template is authored.
 *  Provisional templates landed under autonomous-run rules 2026-07-17 (see DECISIONS-THIS-RUN.md). */
const TEMPLATE_MAP: Record<string, string> = {
  "GTM-20": "revenue-metrics",
  "GTM-22": "revenue-metrics",          // folded in as the segmented-targets extension (v4)
  "GTM-16": "sales-enablement",
  "GTM-18": "onboarding-success",
  "PRODUCT-01": "product-process",
  "PRODUCT-02": "product-process",
  "PRODUCT-04": "pmf-assessment",
  "PRODUCT-05": "product-metrics",
  "OPS-01": "operating-ownership-map",  // OPS split 3 ways (grain test — straddle)
  "OPS-04": "operating-runbooks",
  "OPS-05": "vendor-inventory",
  "PEOPLE-02": "compensation-framework",
  "PEOPLE-06": "values-operating-principles",
  "PEOPLE-07": "hr-policy-handbook",
  "PEOPLE-08": "hr-policy-handbook",
  "LEGAL-09": "legal-draftable-policies",
  "LEGAL-10": "legal-draftable-policies",
  "CAP-01": "capital-plan",
  "ENG-01": "engineering-reference-docs",
  "ENG-08": "engineering-reference-docs",
};

interface TemplateSection {
  id: string; title: string; fill_mode: string[]; required_content: string[]; conditionality?: string;
}

/**
 * MODE MATRIX (operator-ruled 07/18). A document TYPE resolves to a production MODE — this is a
 * PER-COMPANY-RESOLVED default, not a fixed verdict (the universal-matrix design was rejected as
 * reference-corpus-overfit). Distinct from gap_class (which governs whether generation is legitimate at all).
 *   - artifact : produce the target document (the current template behavior; questions native via
 *                decisions-required).
 *   - plan     : produce a gap-closure PLAN — current state per criterion element, what is missing,
 *                the decisions required, and a recommended path. NOT the target document; never
 *                presents as one; approvable as WORKING only and NEVER flips a tile on adoption.
 *
 * default_mode is the operator-ruled default. mode_conditions are evidence tests, evaluated at
 * GENERATION time against the live corpus, that flip the default (e.g. ENG-01: docs-live-in-GitHub
 * -> plan; GTM-17: win/loss-in-CRM -> artifact). Where evidence cannot decide, the mode question
 * joins decisions-required and resolves from the answer. professional_review gates finalize.
 */
export type ProductionMode = "artifact" | "plan";
const PRODUCTION_MODES: ProductionMode[] = ["artifact", "plan"];
type ProfessionalReview = "attorney" | "hr" | "none";
const PROFESSIONAL_REVIEWS: ProfessionalReview[] = ["attorney", "hr", "none"];

/** An evidence test that can flip the default mode at generation time (probed against the corpus). */
interface ModeCondition {
  test: string;               // short slug, e.g. "docs-live-in-GitHub"
  description: string;        // human-legible statement of the test
  signals: string[];          // corpus probe terms
  resolves_to: ProductionMode; // the mode this condition selects when its evidence test is met
}

interface GenTemplate {
  template: string; version: number; title: string; deliverable?: string; exclusions: string[]; sections: TemplateSection[];
  default_mode: ProductionMode;
  mode_conditions: ModeCondition[];
  professional_review: ProfessionalReview;
}

/** How generate() rendered the output — governs whether the document-review pipeline runs. */
type GenMode = "document" | "plan";

/**
 * Plan-skeleton registry (07/18 STEP 3): subcategories that get PLAN generation from the generic
 * plan skeleton + their own criterion elements, WITHOUT a bespoke template. AIOPS-01 and GTM-17
 * were the operator's two named cases. GTM-17 carries the ruled win/loss-in-CRM -> artifact
 * condition; AIOPS-01's condition is PROPOSED in the report (not invented here).
 */
interface PlanRegistryEntry { default_mode: ProductionMode; mode_conditions: ModeCondition[]; professional_review: ProfessionalReview; }
const PLAN_SKELETON_REGISTRY: Record<string, PlanRegistryEntry> = {
  "AIOPS-01": { default_mode: "plan", mode_conditions: [], professional_review: "none" },
  "GTM-17": {
    default_mode: "plan",
    mode_conditions: [{
      test: "win/loss-in-CRM",
      description: "Win/loss reason fields are maintained in a CRM (closed-won/closed-lost reasons, opportunity records)",
      signals: ["win reason", "loss reason", "closed lost", "closed won", "CRM opportunity", "churn reason", "win/loss"],
      resolves_to: "artifact",
    }],
    professional_review: "none",
  },
};

/** Load a generation template (.yaml) via python3+PyYAML — same INFRA-clean path as loader.ts. */
function loadTemplate(name: string): GenTemplate {
  const path = join(TEMPLATE_DIR, `${name}.yaml`);
  const py = "import yaml,json,sys; json.dump(yaml.safe_load(open(sys.argv[1],encoding='utf-8')), sys.stdout, default=str)";
  const r = spawnSync("python3", ["-c", py, path], { encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`loadTemplate: YAML parse failed for ${path} (exit ${r.status}):\n${r.stderr}`);
  const t = JSON.parse(r.stdout);
  t.sections = (t.sections ?? []).map((s: any) => ({
    ...s,
    fill_mode: Array.isArray(s.fill_mode) ? s.fill_mode : [s.fill_mode],
    required_content: Array.isArray(s.required_content) ? s.required_content : [s.required_content],
  }));
  // default_mode defaults to artifact; an unrecognized value is a template DEFECT, not a silent fallback.
  const dm = t.default_mode ?? "artifact";
  if (!PRODUCTION_MODES.includes(dm))
    throw new Error(`loadTemplate: template ${name} has unknown default_mode "${dm}" (allowed: ${PRODUCTION_MODES.join(", ")})`);
  t.default_mode = dm;
  const pr = t.professional_review ?? "none";
  if (!PROFESSIONAL_REVIEWS.includes(pr))
    throw new Error(`loadTemplate: template ${name} has unknown professional_review "${pr}" (allowed: ${PROFESSIONAL_REVIEWS.join(", ")})`);
  t.professional_review = pr;
  t.mode_conditions = (t.mode_conditions ?? []).map((c: any) => ({
    test: String(c.test ?? ""), description: String(c.description ?? ""),
    signals: Array.isArray(c.signals) ? c.signals : (c.signals ? [c.signals] : []),
    resolves_to: c.resolves_to,
  }));
  return t as GenTemplate;
}

/** The template for a subcategory, or null (fall back to the gap-class contract). */
function templateFor(id: string): GenTemplate | null {
  const name = TEMPLATE_MAP[id];
  return name && existsSync(join(TEMPLATE_DIR, `${name}.yaml`)) ? loadTemplate(name) : null;
}

/** Retrieval hygiene: drop test/probe artifacts (PROBETEST etc.) from generation evidence. */
const TEST_ARTIFACT_RE = /probetest|test[-_ ]?artifact|\bprobe\b/i;
function isTestArtifact(c: Chunk): boolean {
  return TEST_ARTIFACT_RE.test(c.slug ?? "") || TEST_ARTIFACT_RE.test(c.title ?? "");
}

/** Generation FAILURE: a template section was missing from the output (not a thin draft). */
export class SectionCoverageError extends Error {
  constructor(msg: string) { super(msg); this.name = "SectionCoverageError"; }
}

function boardRecord(id: string): any {
  const { records, corrections } = JSON.parse(readFileSync(RUN, "utf8"));
  const rec = records.find((r: any) => r.id === id);
  const corr = Array.isArray(corrections) ? corrections.find((c: any) => c.tile === id && c.landed) : null;
  return corr ? { ...rec, state: corr.correctedState } : rec;
}

// THINNEST-USEFUL-ARTIFACT — REVISED 2026-07-17 (not repealed). Under a template, coverage is
// governed by the template, so "thin" means lean PROSE within each section, never skipping a
// section. The no-template path keeps the original leanest-artifact rule.
const THINNEST_USEFUL_TEMPLATE = `THINNEST-USEFUL (within a fixed template): write the LEANEST prose that covers each section's required_content — no padding, no restated boilerplate, no long-form narrative. But the TEMPLATE governs coverage: never skip, merge away, or thin a section out of existence. Thin prose, full coverage.`;
const THINNEST_USEFUL = `THINNEST-USEFUL-ARTIFACT (hard rule): produce the THINNEST artifact that addresses the listed MISSING ELEMENTS and nothing more — an outline, checklist, one-pager, or template. Do NOT produce a full pitch deck, financial model, exhaustive manual, or long-form narrative. If a section is not needed to close a missing element, omit it.`;

// TEMPLATE-ONLY contract (2026-07-16) for tiles that are corporate/legal records (LEGAL-02):
// a POPULATED record is fabrication, so we emit blank forms only.
function templateOnlyContract(): string {
  return `This gap is TEMPLATE-ONLY: the underlying artifact is a corporate/legal RECORD (e.g. a Delaware unanimous-written-consent, a minute-book entry). A populated record is FABRICATION. Produce BLANK FORM DOCUMENTS ONLY — the standard form structure with **explicit instruction blocks** marking where facts go, written as \`[INSTRUCTION: ...]\`.
HARD RULE — no populated factual fields: NO dates, NO party or person names, NO resolution text, NO transaction terms, NO dollar amounts. Every place a fact would appear must be an \`[INSTRUCTION: ...]\` block, never a filled value. If you are tempted to write a specific fact, write the instruction for it instead.`;
}

function contractFor(cls: GapClass): string {
  if (cls === "artifact-sufficient")
    return `This gap is ARTIFACT-SUFFICIENT: the document IS the requirement. Produce a DRAFT DOCUMENT that would satisfy the criterion.
- Source every factual claim inline to a named corpus document from the SUPPORTING MATERIAL, e.g. [Document Title, chunk N].
- Any content the corpus does NOT state, flag inline as **[added — not in corpus]**.
- End with an "## Element coverage" map: one row per criterion element -> addressed (yes/no) and where in the draft.`;
  if (cls === "system")
    return `This gap is a SYSTEM gap: an operating system/tool must be adopted; a document cannot satisfy it. Produce a RECOMMENDATION + SEED-CONFIGURATION MEMO, clearly labeled as such at the top ("RECOMMENDATION — not an adopted system; does not flip the tile"). Recommend a concrete tool and a seed configuration derived from what the corpus shows. Do NOT claim the system is in use.`;
  return `This gap is a PRACTICE gap: a behavior must run over time; no document flips it. Produce a SCAFFOLD (template + checklist), clearly labeled as such at the top ("SCAFFOLD — the practice must actually run; the tile flips only on later naturally-produced evidence"). Do NOT claim the practice is in use.`;
}

/** Structural refusal: generation is disabled for this tile (GENERATION-EXCLUDED). */
export class GenerationExcludedError extends Error {
  constructor(msg: string) { super(msg); this.name = "GenerationExcludedError"; }
}
/** Template-only safety refusal: the generated form contained a populated fact. */
export class TemplateFabricationError extends Error {
  constructor(msg: string) { super(msg); this.name = "TemplateFabricationError"; }
}

/**
 * TEMPLATE-ONLY guard. Returns a short description of the first populated FACT found OUTSIDE an
 * `[INSTRUCTION: ...]` block, or null if the form is clean. Targets the concrete fabrication
 * signatures — a specific date, a named legal entity, or a personal name — rather than any
 * capitalized phrase, so genuine template structure ("Governing Law", "General Corporation Law",
 * signature-line labels) does not false-positive.
 */
function scanTemplateForPopulatedFacts(md: string): string | null {
  // Remove instruction blocks (where facts are *described*, not filled) before scanning.
  const outside = md.replace(/\[INSTRUCTION:[^\]]*\]/gi, " ");
  // 1. Dates: 2026-07-16, 07/16/2026, "July 16, 2026", "16 July 2026".
  const dateRe = /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/;
  const dm = outside.match(dateRe);
  if (dm) return `date "${dm[0]}"`;
  // 2. Named legal entity: a proper token (not a generic/legal structure word) immediately
  //    before a corporate suffix — "Acme Holdings, Inc.", "Widgets LLC". "General Corporation
  //    Law", "the Corporation" are excluded by dropping Corporation/Company from the suffixes
  //    and by the negative lookbehind on structure words.
  const entityRe = /\b((?!General|Business|Nonstock|Public|Benefit)[A-Z][A-Za-z&]+(?:\s+[A-Z][A-Za-z&]+){0,3}),?\s+(Inc|LLC|Ltd|LLP|L\.?P|Co)\b\.?/;
  const em = outside.match(entityRe);
  if (em) return `named entity "${em[0].trim()}"`;
  // 3. Personal name with a middle initial — the unambiguous signature of a filled party field.
  const nameRe = /\b[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+\b/;
  const nm = outside.match(nameRe);
  if (nm) return `personal name "${nm[0]}"`;
  return null;
}

export interface GenerateResult {
  id: string;
  gapClass: GapClass;
  flippable: boolean;
  file: string;
  model: string;
  sourceDocuments: { title: string; slug: string | null }[];
  template?: string | null;
  /** Resolved production MODE (07/18 mode matrix): artifact | plan. */
  mode: ProductionMode;
  /** Human-legible basis for the resolved mode ("produced as a plan because ..."). */
  modeBasis: string;
  /** professional_review gate: attorney | hr | none. */
  professionalReview: ProfessionalReview;
  /** How the output was rendered — governs the document-review pipeline (document runs it; plan skips). */
  genMode: GenMode;
  /** Whether adoption may FLIP the tile. Plan mode NEVER flips (any gap class); artifact needs artifact-sufficient. */
  flips: boolean;
  /** Whether the draft is approvable as WORKING (plan: any class; artifact: artifact-sufficient only). */
  approvableWorking: boolean;
  /** Whether approve-as-final is permitted now (needs flips AND professional_review resolved). */
  approveFinal: boolean;
}

/** Per-section corpus retrieval (evidence is gathered PER SECTION; test artifacts excluded). */
async function sectionEvidence(
  retrieval: any, section: TemplateSection, entrySignals: string[],
): Promise<{ text: string; docs: { title: string; slug: string | null }[] }> {
  const signals = [section.title, ...section.required_content.slice(0, 3), ...entrySignals];
  const hits = (await retrieval.search(signals, 8)).filter((c: Chunk) => !isTestArtifact(c));
  const seen = new Map<string, Chunk>();
  for (const c of hits) if (!seen.has(c.id)) seen.set(c.id, c);
  const chunks = [...seen.values()].slice(0, 6);
  const text = chunks.length
    ? chunks.map((c) => `[${c.title || c.slug || c.id}, chunk ${c.id}] ${String(c.text).slice(0, 380)}`).join("\n\n")
    : "(no corpus evidence retrieved for this section)";
  const docs = chunks.map((c) => ({ title: c.title || (c.slug ?? c.id), slug: c.slug ?? null }));
  return { text, docs };
}

/**
 * Template-driven generation (contract inversion). The template is the fixed outline; the corpus
 * is queried per section and never defines scope. Returns the document body + aggregated sources.
 * Throws SectionCoverageError if the model drops any template section.
 */
async function generateFromTemplate(
  entry: { id: string; criterion: string; signals: string[] }, tmpl: GenTemplate, retrieval: any,
  client: Anthropic, model: string, answers: Record<string, string> = {},
): Promise<{ bodyMd: string; sourceDocuments: { title: string; slug: string | null }[] }> {
  // 1. Retrieve evidence PER SECTION.
  const evidence: { section: TemplateSection; text: string }[] = [];
  const docMap = new Map<string, { title: string; slug: string | null }>();
  for (const section of tmpl.sections) {
    const { text, docs } = await sectionEvidence(retrieval, section, entry.signals);
    evidence.push({ section, text });
    for (const d of docs) docMap.set(d.slug ?? d.title, d);
  }
  const sourceDocuments = [...docMap.values()];

  // 2. Build the template-driven prompt. The outline is the TEMPLATE; retrieval must not reshape it.
  const fillRules =
    `FILL MODES (obey per section, but NEVER print the mode label in the document):\n` +
    `- corpus: state only what the SECTION EVIDENCE supports, cited inline as [Document Title, chunk N]. If evidence does not cover a required item, say so plainly — never invent.\n` +
    `- recommend: give the standard practice; lead the item with "**Recommended:**". Do NOT write "not currently evidenced" or any variant.\n` +
    `- operator: do NOT answer. Lead the item with "**Decision required:**", state the question, and list the candidate answers found in the evidence. Do NOT write "routed to Open rulings" or any routing sentence. Resolve nothing.\n` +
    `- informational: show the item as a directional trend line, NEVER a target or benchmark, with a one-line caveat that it is informational (mirrors the reference model's informational state: shown for awareness, never scored).\n` +
    `- structural (Decisions required): aggregate EVERY "Decision required" item as a plain-language question, one per line, numbered — the register of a diligence questionnaire. No section-reference prefixes, no "blocks X" suffixes.`;
  const system =
    `You draft a customer-facing metrics-definitions document by FILLING A FIXED TEMPLATE. It must ` +
    `read as a document a competent operator wrote — NO pipeline vocabulary. ` +
    `The TEMPLATE drives the outline: produce every section in order, one "## <section title>" heading each. ` +
    `You MUST NOT derive the outline from the retrieved evidence, add sections, reorder, or drop sections, ` +
    `and you MUST NOT print fill-mode labels (CORPUS/RECOMMEND/OPERATOR) anywhere. ` +
    `NEVER print an internal board/criterion code — codes shaped like GTM-20, OPS-01, PRODUCT-01 (any ` +
    `of GTM/OPS/PEOPLE/LEGAL/CAP/FIN/VIS/ENG/AIOPS/COMP/PRODUCT followed by two digits), not only this ` +
    `document's own code — and NEVER use a section symbol (§) or a "§N" cross-reference; every question ` +
    `in Decisions required is a plain standalone sentence with no code and no § prefix. ` +
    `${fillRules}\n` +
    `Express emphasis in PLAIN ENGLISH — never annotations like "PRIORITY-FLAG" (e.g. write "Given the Strategic Customer concentration in the model, this is the most important addition in this section."). ` +
    `EXCLUSIONS (hard): ${tmpl.exclusions.join(" ")} ` +
    `${THINNEST_USEFUL_TEMPLATE} ` +
    `Start with "# ${tmpl.title}". End with a "## Section coverage" table (one row per template section -> status: filled | deferred | open-ruling, + a one-line reason), followed by a "## Decisions required" section (numbered plain-language questions). Output Markdown only.`;
  const spine = tmpl.sections.map((s, i) =>
    `### ${i + 1}. ${s.title}\nfill_mode: ${s.fill_mode.join(" + ")}` +
    (s.conditionality ? `\nconditionality: ${s.conditionality.trim()}` : "") +
    `\nrequired_content: ${s.required_content.join("; ")}`,
  ).join("\n\n");
  const evidenceBlock = evidence.map(({ section, text }) => `== ${section.title} ==\n${text}`).join("\n\n");
  // Operator answers (regenerate-with-answers): a settled decision becomes a RULE stated as fact
  // in the relevant section (not a question); it is NOT listed in Decisions required.
  const answerEntries = Object.entries(answers).filter(([, a]) => a && a.trim());
  const rulingsBlock = answerEntries.length
    ? `\n\nCOMPANY RULINGS (the operator has ANSWERED these decisions — treat each as a settled rule: ` +
      `state it as fact in the relevant section, do NOT phrase it as a question, and do NOT list it in ` +
      `Decisions required):\n${answerEntries.map(([q, a]) => `- Q: ${q}\n  RULING: ${a}`).join("\n")}`
    : "";
  const user =
    `TEMPLATE (the fixed outline — fill it section by section; do NOT derive an outline from the evidence):\n\n${spine}\n\n` +
    `CRITERION (context only, ${entry.id}):\n${entry.criterion}\n\n` +
    `PER-SECTION EVIDENCE (from the company's live corpus; test/probe artifacts excluded):\n\n${evidenceBlock}` +
    rulingsBlock;

  // max_tokens 8000: the largest template (revenue-metrics, 12 sections) truncated at 6000 on
  // sonnet-4-6, dropping the closing "## Section coverage" table -> a false section-coverage failure.
  const res = await client.messages.create({ model, max_tokens: 8000, system, messages: [{ role: "user", content: user }] });
  recordUsage(res.usage);
  const bodyMd = res.content.filter((b) => b.type === "text").map((b) => (b as any).text).join("\n").trim();

  // 3. SECTION-coverage contract: every template section must be present. Missing = FAILURE.
  const missing = tmpl.sections.filter((s) => !new RegExp(`^#{1,3}\\s+.*${escapeRe(s.title)}`, "im").test(bodyMd));
  if (missing.length)
    throw new SectionCoverageError(
      `template ${tmpl.template}: generated draft is missing ${missing.length} section(s): ` +
      `${missing.map((s) => s.title).join(", ")}. A missing section is a generation failure.`);
  if (!/##\s+Section coverage/i.test(bodyMd))
    throw new SectionCoverageError(`template ${tmpl.template}: generated draft has no "## Section coverage" map.`);

  return { bodyMd, sourceDocuments };
}

function escapeRe(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/**
 * MODE RESOLUTION (07/18 STEP 1). Resolve the production mode for a subcategory at generation time:
 * an explicit operator override wins; otherwise the default_mode, possibly FLIPPED by a mode_condition
 * whose evidence test is met against the live corpus. Where a condition is inconclusive, the mode
 * question is deferred to decisions-required (noted in the basis) and the default stands. Returns null
 * when the subcategory has neither a template nor a plan-registry entry (the gap-class fallback path).
 */
export interface ModeResolution { mode: ProductionMode; basis: string; professionalReview: ProfessionalReview; }
export async function resolveMode(
  entry: { id: string; signals: string[] }, tmpl: GenTemplate | null, retrieval: any,
  override?: ProductionMode,
): Promise<ModeResolution | null> {
  const reg = PLAN_SKELETON_REGISTRY[entry.id];
  const defaultMode = tmpl?.default_mode ?? reg?.default_mode;
  const professionalReview = tmpl?.professional_review ?? reg?.professional_review ?? "none";
  if (!defaultMode) return null; // no template, not registered -> gap-class contract fallback
  if (override && PRODUCTION_MODES.includes(override))
    return { mode: override, basis: `operator override -> ${override}`, professionalReview };
  const conditions = tmpl?.mode_conditions ?? reg?.mode_conditions ?? [];
  let mode = defaultMode;
  let basis = `operator-ruled default_mode: ${defaultMode}`;
  for (const cond of conditions) {
    // Evidence probe (generation time). A hit flips the mode to the condition's resolves_to.
    const hits = (await retrieval.search(cond.signals, 6)).filter((c: Chunk) => !isTestArtifact(c));
    if (hits.length > 0 && cond.resolves_to !== mode) {
      mode = cond.resolves_to;
      basis = `${cond.description} -> ${cond.resolves_to} (condition "${cond.test}" met in corpus)`;
    } else if (hits.length === 0) {
      basis += `; condition "${cond.test}" inconclusive from corpus -> mode question deferred to decisions-required`;
    }
  }
  return { mode, basis, professionalReview };
}

/**
 * PLAN-MODE skeleton (07/18 STEP 3). ONE generic plan structure driven by the subcategory's CRITERION
 * ELEMENTS (not a template): current state per element (corpus-evidenced) -> gaps -> decisions required
 * -> recommended path (authority-backed recommendations flow through the existing stage-5 authority
 * review). The output is a gap-closure PLAN, explicitly NOT the target document — it never presents as
 * one, is approvable as WORKING only, and NEVER flips a tile on adoption.
 */
async function generatePlan(
  entry: { id: string; criterion: string; signals: string[]; elements: string[] }, retrieval: any,
  client: Anthropic, model: string,
): Promise<{ bodyMd: string; sourceDocuments: { title: string; slug: string | null }[] }> {
  const hits = (await retrieval.search(entry.signals, 12)).filter((c: Chunk) => !isTestArtifact(c));
  const seen = new Map<string, Chunk>();
  for (const c of hits) if (!seen.has(c.id)) seen.set(c.id, c);
  const support = [...seen.values()];
  const supportText = support.length
    ? support.map((c) => `[${c.title || c.slug || c.id}, chunk ${c.id}] ${String(c.text).slice(0, 380)}`).join("\n\n")
    : "(no supporting material retrieved)";
  const sourceDocuments = [...new Map(support.map((c) => [c.slug ?? c.title ?? c.id, { title: c.title || (c.slug ?? c.id), slug: c.slug ?? null }])).values()];
  const system =
    `You produce a GAP-CLOSURE PLAN, NOT the target document. It must NEVER read as the finished ` +
    `artifact and must never claim the work is done. Structure (exactly these four top-level sections):\n` +
    `"## Current state" — per criterion element, one line on what the corpus does and does not show, ` +
    `corpus evidence cited inline as [Document Title, chunk N]. No invention.\n` +
    `"## Gaps" — what is missing for each element, plainly.\n` +
    `"## Decisions required" — numbered plain-language questions the company must answer, a diligence ` +
    `questionnaire. One per line.\n` +
    `"## Recommended path" — the concrete steps to close the gap, standard practice led with ` +
    `"**Recommended:**". Do NOT assert the company has done any of it.\n` +
    `Start with "# Gap-closure plan". Under the title add "**This is a plan for closing the gap, not ` +
    `the finished document.**" Do NOT use ANY internal/board identifier — not only this plan's own ` +
    `code (${entry.id}) but any code shaped like GTM-20, OPS-01, PRODUCT-01 (GTM/OPS/PEOPLE/LEGAL/CAP/` +
    `FIN/VIS/ENG/AIOPS/COMP/PRODUCT + two digits), and no tile/band vocabulary — and never use a ` +
    `section symbol (§) or "§N" cross-reference; questions are plain standalone sentences. Output Markdown only.`;
  const elements = entry.elements.map((e, i) => `${i + 1}. ${e}`).join("\n");
  const user =
    `CRITERION (verbatim, ${entry.id}):\n${entry.criterion}\n\n` +
    `CRITERION ELEMENTS (report current state + gap per element):\n${elements}\n\n` +
    `SUPPORTING MATERIAL (from the live corpus; test/probe artifacts excluded):\n${supportText}`;
  const res = await client.messages.create({ model, max_tokens: 4000, system, messages: [{ role: "user", content: user }] });
  recordUsage(res.usage);
  const bodyMd = res.content.filter((b) => b.type === "text").map((b) => (b as any).text).join("\n").trim();
  if (!/##\s+Decisions required/i.test(bodyMd))
    throw new SectionCoverageError(`plan for ${entry.id} has no "## Decisions required" section.`);
  return { bodyMd, sourceDocuments };
}

export async function generate(subcategoryId: string, answers: Record<string, string> = {}, overrideMode?: ProductionMode): Promise<GenerateResult> {
  const entry = loadCriteria(SCHEMA).find((e) => e.id === subcategoryId);
  if (!entry) throw new Error(`generate: unknown subcategory ${subcategoryId}`);
  // GENERATION-EXCLUDED (2026-07-16): Ladder generates nothing here — refuse before any API call.
  if (isGenerationExcluded(entry.id))
    throw new GenerationExcludedError(
      `Generation is disabled for ${entry.id}. Litigation and dispute materials are maintained ` +
      `outside the corpus by policy; Ladder does not generate legal-record drafts in this area.`);
  const rec = boardRecord(subcategoryId);
  const gapClass = inferGapClass(entry.id, entry.criterion);
  const templateOnly = isTemplateOnly(entry.id);
  const missing: string[] = (rec?.missingElements ?? []) as string[];
  const cfg = judgeConfigFromEnv();
  const client = new Anthropic();
  const tmpl = templateFor(entry.id);

  let bodyMd: string;
  let sourceDocuments: { title: string; slug: string | null }[];
  let genMode: GenMode = "document";
  let productionMode: ProductionMode = "artifact";
  let modeBasis = "artifact (no template / gap-class fallback)";
  let professionalReview: ProfessionalReview = "none";

  const retrieval = retrievalFromEnv();
  try {
    // Resolve the production MODE (07/18 matrix): default_mode, possibly flipped by a mode_condition
    // probed against the corpus; an operator override wins. null => no template/registry (fallback).
    const resolution = await resolveMode(entry, tmpl, retrieval, overrideMode);
    if (resolution) { productionMode = resolution.mode; modeBasis = resolution.basis; professionalReview = resolution.professionalReview; }

    if (productionMode === "plan" && (tmpl || PLAN_SKELETON_REGISTRY[entry.id])) {
      // PLAN mode: the generic plan skeleton over the criterion elements. Template-independent — a
      // plan is a gap-closure plan, never the target document; approvable working-only, never flips.
      const out = await generatePlan(entry, retrieval, client, GEN_MODEL);
      bodyMd = out.bodyMd; sourceDocuments = out.sourceDocuments; genMode = "plan";
    } else if (tmpl) {
      // ARTIFACT mode with a template: CONTRACT INVERSION — the template drives the outline; corpus
      // queried per section (current behavior; questions native via decisions-required).
      const out = await generateFromTemplate(entry, tmpl, retrieval, client, GEN_MODEL, answers);
      bodyMd = out.bodyMd; sourceDocuments = out.sourceDocuments; genMode = "document";
    } else {
      // No template, not plan-registered: fall back to the gap-class contract; log the backlog.
      logTemplateBacklog(entry.id, gapClass);
      const hits = (await retrieval.search(entry.signals, 10)).filter((c: Chunk) => !isTestArtifact(c));
      const seen = new Map<string, Chunk>();
      for (const c of hits) if (!seen.has(c.id)) seen.set(c.id, c);
      const support = [...seen.values()];
      const supportText = support.length
        ? support.map((c) => `[${c.title || c.slug || c.id}, chunk ${c.id}] ${String(c.text).slice(0, 400)}`).join("\n\n")
        : "(no supporting material retrieved)";
      sourceDocuments = [...new Map(support.map((c) => [c.slug ?? c.title ?? c.id, { title: c.title || (c.slug ?? c.id), slug: c.slug ?? null }])).values()];

      const contract = templateOnly ? templateOnlyContract() : contractFor(gapClass);
      const system = `You draft remediation artifacts for a company-maturity board. Follow the gap-class contract EXACTLY. Never claim evidence the SUPPORTING MATERIAL does not contain; flag added content. Never print an internal board/criterion code (e.g. GTM-20, OPS-01) or a section symbol (§). ${THINNEST_USEFUL} Output Markdown only.`;
      const user = `CRITERION (verbatim, ${entry.id}):\n${entry.criterion}\n\n` +
        `ELEMENTS:\n${entry.elements.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n\n` +
        `MISSING ELEMENTS (the gap to close):\n${missing.length ? missing.map((m) => `- ${m}`).join("\n") : "(none listed)"}\n\n` +
        `GAP CLASS: ${gapClass}${templateOnly ? " (TEMPLATE-ONLY)" : ""}\n${contract}\n\n` +
        `${THINNEST_USEFUL}\n\n` +
        `SUPPORTING MATERIAL (from the live corpus):\n${supportText}`;
      const res = await client.messages.create({ model: GEN_MODEL, max_tokens: 3000, system, messages: [{ role: "user", content: user }] });
      recordUsage(res.usage);
      bodyMd = res.content.filter((b) => b.type === "text").map((b) => (b as any).text).join("\n").trim();

      // TEMPLATE-ONLY post-generation check: reject a populated corporate record (fabrication).
      if (templateOnly) {
        const violation = scanTemplateForPopulatedFacts(bodyMd);
        if (violation)
          throw new TemplateFabricationError(
            `TEMPLATE-ONLY check failed for ${entry.id}: generated form contains a populated fact ` +
            `outside an instruction block (${violation}). Draft not written.`);
      }
    }
  } finally {
    if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();
  }

  // SANITIZE (07/18 rerun-closeout, defects a+b) — strip internal board/criterion codes and
  // §-section-ref prefixes BEFORE the draft is written, so the mechanical validator (which runs on
  // this raw body, pre-deliverable-transform) sees clean text. The deliverable transform re-applies
  // the same strips (idempotent) as the customer-output backstop. Prompts also forbid both; this is
  // the deterministic guarantee behind the one-attempt rule.
  bodyMd = stripQuestionSectionRefs(stripCriterionIds(bodyMd));

  // INVARIANTS (07/18, universal — never company-resolved):
  //  - PLAN mode NEVER flips a tile on adoption (zero grade movement, any gap class).
  //  - ARTIFACT mode flips only for an artifact-sufficient gap (the gap-class doctrine).
  const flips = productionMode !== "plan" && isFlippable(gapClass);
  //  - Approvable-as-WORKING: plan for ANY class; artifact only when artifact-sufficient.
  const approvableWorking = productionMode === "plan" ? true : gapClass === "artifact-sufficient";
  //  - approve-as-final needs a flip-eligible draft AND no pending professional review (attestation
  //    lifts the professional-review gate at the board/server, recorded in the approval log).
  const approveFinal = flips && professionalReview === "none";

  // The deliverable body carries NO pipeline provenance; the metadata COMMENT stays (parseMeta reads
  // approvability). The body is the document/plan as adopted.
  mkdirSync(DRAFTS, { recursive: true });
  const stamp = new Date().toISOString();
  const header =
    `<!-- REMEDIATION DRAFT — metadata\n` +
    `subcategory: ${entry.id}\n` +
    `gap_class: ${gapClass}\n` +
    `mode: ${productionMode}\n` +
    `mode_basis: ${modeBasis}\n` +
    `flippable: ${flips}\n` +
    `approvable_working: ${approvableWorking}\n` +
    `professional_review: ${professionalReview}\n` +
    `approve_final: ${approveFinal}\n` +
    `template: ${tmpl ? `${tmpl.template} v${tmpl.version}` : "(none — no document template for this type yet)"}\n` +
    `timestamp: ${stamp}\n` +
    `model: ${GEN_MODEL}\n` +
    `source_documents: ${sourceDocuments.map((d) => d.title).join(" | ") || "(none)"}\n` +
    `-->\n\n`;
  // Plan-mode drafts get a distinct filename stem so they never overwrite an artifact draft in place.
  const file = genMode === "plan"
    ? join(DRAFTS, `${entry.id}-gap-closure-plan-DRAFT.md`)
    : tmpl
      ? join(DRAFTS, `${entry.id}-${tmpl.deliverable ?? tmpl.template}-DRAFT.md`) // overwrites the prior draft in place
      : join(DRAFTS, `${entry.id}-remediation-DRAFT.md`);
  writeFileSync(file, header + bodyMd + "\n", "utf8");

  return { id: entry.id, gapClass, flippable: flips, file, model: GEN_MODEL, sourceDocuments,
    template: tmpl?.template ?? null, mode: productionMode, modeBasis, professionalReview, genMode, flips, approvableWorking, approveFinal };
}

/** Append a subcategory to the template-authoring backlog (drafts generated without a template). */
function logTemplateBacklog(id: string, gapClass: GapClass): void {
  try {
    mkdirSync(TEMPLATE_DIR, { recursive: true });
    appendFileSync(TEMPLATE_BACKLOG, JSON.stringify({ id, gap_class: gapClass, timestamp: new Date().toISOString() }) + "\n");
  } catch { /* backlog logging is best-effort; never block generation */ }
}

/** Stage-3 gate failure: the mechanical validator rejected the draft (never reaches the queue). */
export class ValidatorFailure extends Error {
  readonly failures: string[];
  constructor(msg: string, failures: string[]) { super(msg); this.name = "ValidatorFailure"; this.failures = failures; }
}
const VALIDATOR_LOG = join(DRAFTS, "GENERATION-FAILURES.jsonl");
function logValidatorFailure(id: string, failures: string[]): void {
  try { mkdirSync(DRAFTS, { recursive: true }); appendFileSync(VALIDATOR_LOG, JSON.stringify({ id, stage: "validator", failures, timestamp: new Date().toISOString() }) + "\n"); } catch { /* best-effort */ }
}

export interface ReviewedResult extends GenerateResult {
  pipeline: boolean;
  validator?: ValidatorResult;
  structure?: StructureReview;
  authority?: AuthorityReport;
  adversarial?: AdversarialResult;
  citationLog?: CitationLogEntry[];
  references?: DeliverableRef[];
  externalReferences?: ExternalRef[];
  coverage?: CoverageRow[];
  reviewFile?: string;
}

/** Authority-cache reuse (07/18): reuse cached findings when the sidecar was produced for the SAME
 *  template version (no fresh web search on regenerate). Fresh search only when the version changed. */
function cachedAuthorityFindings(reviewFile: string, template: string, version: number): AuthorityFinding[] | null {
  if (!existsSync(reviewFile)) return null;
  try {
    const s = JSON.parse(readFileSync(reviewFile, "utf8"));
    // Reuse when the sidecar is for the SAME template and its version matches — OR the version was
    // not recorded (legacy sidecar from before versioning; the template version is unchanged this
    // round, so its findings are still valid). Fresh search only when the version demonstrably changed.
    const versionOk = s.templateVersion == null || s.templateVersion === version;
    if (s.template === template && versionOk && Array.isArray(s.authority?.findings) && s.authority.findings.length)
      return s.authority.findings as AuthorityFinding[];
  } catch { /* ignore unreadable sidecar */ }
  return null;
}

/**
 * FULL generation pipeline (GENERATION-STANDARD.md). Stage 2 = generate(). ARTIFACT-mode template
 * output then runs the mechanical validator (stage 3, BLOCKING — now incl. citation-truth,
 * duplicate-section, and future-date checks), structural self-review (stage 4), authority review
 * (stage 5, cached-findings reuse per template version), deliverable-form + lint + external-ref
 * check + harness. PLAN-mode output runs the citation-truth validator (BLOCKING). BOTH modes then
 * pass the ADVERSARIAL GATE (stage 6): a blind persona review that BLOCKS on not-client-ready.
 * No-template / gap-class fallback subcategories skip the pipeline (pipeline: false).
 */
export async function generateReviewed(subcategoryId: string, answers: Record<string, string> = {}, overrideMode?: ProductionMode): Promise<ReviewedResult> {
  const gen = await generate(subcategoryId, answers, overrideMode);          // stage 2 (writes the draft)
  const tmpl = templateFor(subcategoryId);
  const reg = PLAN_SKELETON_REGISTRY[subcategoryId];
  if (!tmpl && !reg) return { ...gen, pipeline: false }; // gap-class fallback: no review pipeline

  const full = readFileSync(gen.file, "utf8");
  const headerMatch = full.match(/^<!--[^]*?-->\n*/);
  const header = headerMatch ? headerMatch[0] : "";
  const bodyMd = full.slice(header.length);
  const client = new Anthropic();
  const reviewFile = gen.file.replace(/\.md$/, ".review.json");

  let validator: ValidatorResult | undefined, structure: StructureReview | undefined, authority: AuthorityReport | undefined;
  let deliverable: ReturnType<typeof toDeliverable> | undefined;
  let citationLog: CitationLogEntry[] | undefined;
  let reviewText: string; // the artifact the adversarial gate sees (a recipient's view)

  if (gen.genMode === "document" && tmpl) {
    // ===== ARTIFACT MODE: stages 3-5 + deliverable-form + external-ref + harness =====
    const retrieval = retrievalFromEnv();
    let finalBody = bodyMd;
    try {
      validator = await validateDraft(bodyMd, tmpl.sections, retrieval as any, gen.sourceDocuments);
      citationLog = validator.citationLog;
      if (!validator.pass) {
        rmSync(gen.file, { force: true });
        logValidatorFailure(subcategoryId, validator.failures);
        throw new ValidatorFailure(`validator failed for ${subcategoryId}: ${validator.failures.join(" | ")}`, validator.failures);
      }
      structure = await reviewStructure(bodyMd, tmpl.sections, client, GEN_MODEL);
      // Authority: reuse cached findings for the same template version (no fresh web search).
      const cached = cachedAuthorityFindings(reviewFile, tmpl.template, tmpl.version);
      const auth = await reviewAuthority(bodyMd, tmpl.sections, client, GEN_MODEL, cached ?? undefined);
      authority = auth.report; finalBody = auth.revisedMd;
    } finally {
      if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();
    }

    deliverable = toDeliverable(finalBody, gen.sourceDocuments, authority?.findings ?? []);
    const lintHits = lintDeliverable(deliverable.deliverableMd);
    if (lintHits.length) {
      writeFileSync(gen.file.replace(/\.md$/, ".rejected.md"), deliverable.deliverableMd, "utf8");
      rmSync(gen.file, { force: true });
      logValidatorFailure(subcategoryId, [`deliverable lint: ${lintHits.join("; ")}`]);
      throw new ValidatorFailure(`deliverable lint failed for ${subcategoryId}: ${lintHits.join("; ")}`, lintHits);
    }
    // Deterministic external-reference check (07/18): every external ref has a URL; no future source.
    const extHits = checkExternalRefs(deliverable.externalReferences, authority?.findings ?? []);
    if (extHits.length) {
      rmSync(gen.file, { force: true });
      logValidatorFailure(subcategoryId, extHits.map((h) => `external-ref: ${h}`));
      throw new ValidatorFailure(`external-reference check failed for ${subcategoryId}: ${extHits.join("; ")}`, extHits);
    }
    const harness = runChecks(deliverable.deliverableMd, {
      templateSections: tmpl.sections.map((s) => s.title),
      meta: parseMetaComment(header),
      references: deliverable.references,
    }).filter((r) => !r.pass);
    if (harness.length) {
      writeFileSync(gen.file.replace(/\.md$/, ".rejected.md"), deliverable.deliverableMd, "utf8");
      rmSync(gen.file, { force: true });
      const reasons = harness.map((r) => `${r.check}: ${r.detail}`);
      logValidatorFailure(subcategoryId, reasons.map((r) => `harness ${r}`));
      throw new ValidatorFailure(`generation harness failed for ${subcategoryId}: ${harness.map((r) => r.check).join(", ")}`, reasons);
    }
    reviewText = deliverable.deliverableMd;
  } else if (gen.genMode === "plan") {
    // ===== PLAN MODE: citation-truth validator only (no template sections) =====
    const retrieval = retrievalFromEnv();
    try {
      validator = await validateDraft(bodyMd, [], retrieval as any, gen.sourceDocuments, /* planMode */ true);
      citationLog = validator.citationLog;
      if (!validator.pass) {
        rmSync(gen.file, { force: true });
        logValidatorFailure(subcategoryId, validator.failures);
        throw new ValidatorFailure(`validator failed for ${subcategoryId} (plan): ${validator.failures.join(" | ")}`, validator.failures);
      }
    } finally {
      if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();
    }
    reviewText = bodyMd;
  } else {
    return { ...gen, pipeline: false };
  }

  // ===== STAGE 6: ADVERSARIAL GATE (blind persona; BLOCKING on not-client-ready) =====
  const purports = tmpl ? tmpl.title : "a gap-closure plan";
  const adversarial = await adversarialReview(reviewText, subcategoryId, purports, client);
  if (adversarial.verdict === "not-client-ready") {
    writeFileSync(gen.file.replace(/\.md$/, ".rejected.md"), reviewText, "utf8"); // keep the blocked artifact for review
    rmSync(gen.file, { force: true });                                            // never reaches the queue
    logValidatorFailure(subcategoryId, ["adversarial gate: not-client-ready", ...adversarial.reservations.slice(0, 6)]);
    throw new ValidatorFailure(`adversarial gate BLOCKED ${subcategoryId} (not-client-ready)`, ["adversarial: not-client-ready", ...adversarial.reservations.slice(0, 6)]);
  }

  // Passed (client-ready or adequate-with-reservations). Write deliverable (artifact) + sidecar.
  if (gen.genMode === "document" && deliverable) {
    writeFileSync(gen.file, header + deliverable.deliverableMd.trim() + "\n", "utf8");
  }
  const answeredRulings = Object.entries(answers).filter(([, a]) => a && a.trim())
    .map(([question, answer]) => ({ question, answer, ruledAt: new Date().toISOString().slice(0, 10) }));
  writeFileSync(reviewFile, JSON.stringify({
    id: subcategoryId, template: tmpl?.template ?? "(plan-skeleton)", templateVersion: tmpl?.version ?? null,
    mode: gen.mode, modeBasis: gen.modeBasis, professionalReview: gen.professionalReview,
    generatedAt: new Date().toISOString(),
    validator, structure, authority, adversarial, citationLog,
    references: deliverable?.references ?? [], externalReferences: deliverable?.externalReferences ?? [], coverage: deliverable?.coverage ?? [],
    answeredRulings,
  }, null, 2) + "\n", "utf8");

  return { ...gen, pipeline: true, validator, structure, authority, adversarial, citationLog, reviewFile,
    references: deliverable?.references, externalReferences: deliverable?.externalReferences, coverage: deliverable?.coverage };
}

export function listDrafts(): { file: string; name: string }[] {
  if (!existsSync(DRAFTS)) return [];
  // Only pending REVIEW drafts. Exclude derived artifacts: .ADOPTED.md (clean adopted output) and
  // .rejected.md (lint/harness debug dumps) are not drafts and must never enter the pending queue.
  return readdirSync(DRAFTS)
    .filter((f) => f.endsWith(".md") && !/\.(ADOPTED|rejected)\.md$/.test(f))
    .map((f) => ({ file: join(DRAFTS, f), name: f }));
}

// CLI: `node generate.ts <SUBCAT>` (stage 2 only) or `node generate.ts --pipeline <SUBCAT>`
// (full pipeline, stages 2-5).
if (process.argv[1] && process.argv[1].endsWith("generate.ts")) {
  const args = process.argv.slice(2);
  const pipeline = args.includes("--pipeline");
  const id = args.find((a) => !a.startsWith("--"));
  if (id) {
    const run = pipeline ? generateReviewed(id) : generate(id);
    run.then((r) => console.log(JSON.stringify(r, null, 2)))
      .catch((e) => { console.error("generate FAILED:", e.message); process.exit(1); });
  }
}
