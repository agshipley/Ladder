# AI Operations — Category Brief v1

Landed: 2026-07-09 · Run type: T-1 creation (fresh run; no inherited brief)
Governing state at research: RESEARCH-PROTOCOL v0.20 / TAXONOMY v0.16
Band: Band 1 — seed-funded B2B SaaS/infra, pre-Series A, US scope
All retrieval dates 2026-07-09 unless noted.

## 1. Method note

**Polarity and provenance story.** Authored tier — the concept doc's named
seam. The no-direct-canon condition applies in full and is named here: no
established authority canon exists for "AI operations maturity" as an
object. The category's authority is constructed by triangulation across
adjacent frames (NIST AI RMF functions and PE-advisory maturity dimensions
on the scrutiny side; DORA AI Capabilities Model and measured-implementation
exemplars on the operating side). Consequence: no criterion in this category
is unconditional; every bar is written stage-conditionally. Operator/
practitioner regime is primary for this operating category; scrutiny
frameworks corroborate only (B-32). There is no statutory rung by design —
statutes reaching AI use are Legal's per B-28. Zero [cite-check] flags were
issued this run.

**Capability premise (dated 2026-07; hard refresh at classifier
consumption).** Criteria presume no unsupervised AI competence. Current
measured reliability — ~66% agentic task success vs. ~72% human baseline
(Stanford AI Index 2026, OSWorld), best-model hallucination rates of roughly
1 in 5 (range 22–94% across 26 frontier models), 74% of organizations naming
inaccuracy their top AI risk, documented AI incidents rising (362 in 2025
vs. 233 prior) — keeps unsupervised operation in business/revenue
operations below any responsible deployment threshold. Supervision, human
checkpoints, and escalation are therefore criterial WHILE measured failure
rates remain material; the threshold is evidence-dated so the model updates
with the evidence rather than encoding a snapshot. Demonstrated-strength
profile: coding and code-adjacent work (near-solved benchmarks; Engineering
territory per B-33) and structured research; business-ops value concentrates
in supervised drafting, research, synthesis, and transcription embedded in
defined workflows. Provenance of the premise: operator-ruled; corpus-
observed (this project's own build history — high value under total
supervision); corroborated (Gartner on current model agency limits;
Stanford AI Index 2026 measurements).

**Adoption-agenda screen (RESEARCH-PROTOCOL §4, added this run).** Applied
throughout: adoption-evangelist sources hold no authority status; their
concrete practices were extracted as candidate ideas and individually
tested against Band-1 utility under the capability premise. Dispositions
recorded in §3 (authority set) and §9 (generation menu).

**Currency rule (this category only).** Every empirical annotation carries
its fielding/publication date. At classifier consumption, any annotation
older than 12 months is presumed stale and re-verified before the
classifier reads it ([refresh: classifier-consumption]). A rolling
semiannual empirical sweep is registered in REFRESH.md.

**Category semantics (operator-directed, 2026-07-09).** This tile diagnoses
the DISCIPLINE of AI practice. The unit of assessment is standardized
process integration; ad-hoc individual tool use never credits completeness
anywhere in this category. No tile state may treat the acquisition of AI or
automation as itself a completeness criterion, and the category must not
function as demand generation for the Leverage layer. The remedy menu
(including automation) is offered in generation only (B-23 pattern).

## 2. Category purpose

AI Operations exists to make a company a disciplined buyer and operator of
AI, and its completeness elements double as the company's defense against
the sales pressure that surrounds this domain. A company that maintains its
AI footprint with named owners, a working stance on tools and data, and a
habit of checking outcomes is equipped to put four questions to any vendor
promising automated operations: what does this integrate with, who owns it
when it breaks, what data does it see, and how will we know it worked. At
Band 1 the tile's value is substantially defensive. It measures the
discipline of AI practice; a company scores well by governing whatever AI
it has chosen — including very little — with clear ownership, clear data
boundaries, supervised use, and honest outcome checks. The board offers
automation as a choice in generation; diagnosis measures only the
discipline of choices already made.

## 3. Authority set

### 3a. Current empirical layer (2026-fielded or 2026-published)

| Source | Vintage | Establishes |
|---|---|---|
| Stanford AI Index 2026 (Stanford HAI; independent annual assessment) | data through 2026-03; pub. 2026-04 | Agent capability 12%–66.3% task success (OSWorld) vs. 72.35% human baseline; AI agent deployment single-digit across nearly all business functions; 74% cite inaccuracy as top AI risk (+14 pts YoY); hallucination range 22–94% across 26 frontier models; incidents 362 (2025) vs. 233; "jagged frontier"; SWE-bench 60%–near-100% in one year (coding is the solved domain). https://hai.stanford.edu/ai-index/2026-ai-index-report |
| Q1 2026 analyst wave — S&P Global 451 panel; Forrester (w/ Anaconda) | Q1 2026 | 31% of enterprises with any agent in production; 88% of agent pilots never reach production (top blockers: evaluation gaps, governance friction, model reliability). Partially via aggregators; weight-marked. |
| PwC Global CEO Survey 2026 | 2026 | 56% of CEOs report getting nothing from AI adoption efforts. Secondary-reported; weight-marked. |
| Ramp AI Index (monthly; 70k+ firms, transaction data) | through 2026-06 | ~50.6% of US businesses paying for ≥1 AI product (2026-04); median firm AI spend $11.38/employee/month; top-1% "AI-pilled" spend $7.45K/employee/month (overspend evidence); intensity tracking. https://ramp.com/data/ai-index |
| Gartner 2026 layer | 2026 | One-third of companies predicted to damage customer experience via premature AI deployment; agent-washing quantified (~130 real vendors of thousands claiming). |

### 3b. Annual-edition anchors (current editions, mid-2025 fielding — dates carried on every contributed number)

| Source | Fielding | Establishes |
|---|---|---|
| McKinsey State of AI (pub. 2025-11-05; n=1,993) | 2025-06/07 | Of 25 attributes tested, fundamental workflow redesign has the single biggest effect on AI bottom-line impact; 88% adoption vs. 39% any-EBIT impact; ~21% have redesigned any workflow; 23% scaling agents anywhere, ≤10% in any given function; high performers 65% vs. 23% on defined human-in-the-loop validation. |
| DORA 2025 State of AI-assisted Software Development + AI Capabilities Model (pub. 2025-09/12; n≈4,975) | 2025-06/07 | Communicated AI stance (expectations, permitted tools, sanctioned experimentation) amplifies value; AI amplifies existing organizational strengths and weaknesses. POPULATION CAVEAT: technology professionals; extension to business ops is an extrapolation, named in §7. |
| NIST AI RMF 1.0 (AI 100-1, 2023-01) + GenAI Profile (AI 600-1, 2024-07-26); ISO/IEC 42001:2023 | current | Corroborate-only per B-32. Substance extracted as observable practice: use inventory, decision ownership, human review on consequential outputs. Never a required artifact; certification status → Compliance. |

### 3c. Trend-establishment (superseded as frontier; retained as corroborated history)

MIT NANDA "The GenAI Divide" (2025-07/08): ~95% of GenAI pilots no
measurable P&L impact; the learning gap — integration is the divide;
budgets misallocated to demo-friendly pilots while back-office integration
carries ROI; buy-and-partner ~2x internal-build success; >90% of firms show
shadow AI. Methodology caveats (small interview base, directional) weight-
marked; headline findings independently confirmed by the 2026 layer.
S&P 2025 abandonment data (42% abandoned most initiatives; ~46% of PoCs
scrapped) superseded by the firm's Q1 2026 panel.

### 3d. Measured-implementation exemplars (model-document rung — the genre exists; §2 standing question answered)

- GitLab handbook AI guidance (handbook-transacted; per-function; review-
  required; AI operates inside existing controls — same approvals, same
  audit trail). https://handbook.gitlab.com/handbook/tools-and-tips/ai/ ;
  https://handbook.gitlab.com/handbook/support/ai/
- Anthropic published internal-usage study (surveyed, limitations-
  sectioned; honest that strength concentrates in coding) + published
  usage guidance. Weight-marked (self-interested publisher; retained for
  method). https://www.anthropic.com/research/how-ai-is-transforming-work-at-anthropic

### 3e. Reclassified under the adoption-agenda screen (genre evidence / cautionary exhibits; zero criterion weight)

- Shopify/Lütke memo (2025-04-07): genre evidence that the stance-artifact
  class exists; normative content (usage mandate, headcount gate,
  performance-review AI metrics) rejected as authority. Growth/public-scale
  source; band mismatch.
- Duolingo/von Ahn (2025-04 → 2026-05): cautionary — adopted usage-as-
  performance-metric, dropped it after producing performative use.
- Klarna/Siemiatkowski (2024 claim → 2025-05 reversal): cautionary —
  cost-only evaluation of automated support degraded quality and forced
  hybrid rehiring; informs the human-checkpoint substance.
- Zapier/Foster: mandate framing screened out; function-by-function
  use-case mapping method retained as an extracted idea (generation menu).
- Ramp "AI pilled" playbook (Charles, 2026-04): screened as authority; the
  sanctioned fast-path idea extracted (see AIOPS-02/04); the descriptive
  L0–L3 proficiency ladder extracted to the generation menu; adoption-
  percentage goals, "remove every constraint," and salary-scale token
  budgets rejected (the last refuted by the publisher's own spend data).

## 3f. Discarded

SEO-grade diligence content (fund blogs, tool-vendor guides). Retained
finding: no converged seed-stage investor request list for AI operations
exists as of 2026-07 — recorded honestly, revisited on refresh.

## 4. Subcategories

### AIOPS-01 — AI-use footprint & inventory (scored; expert-authored)

Unit of assessment: process-attached AI. Ad-hoc individual tool use is
inventoried as context and never credits completeness (operator ruling).
Normative criterion text: CRITERIA.yaml `AIOPS-01` (as of v1.0)
Classifier signals: AI vendor names in vendor/expense entries; provisioning
documents; tool lists; workflow-platform configurations.
Context annotations (dated): ~50.6% of US businesses pay for ≥1 AI product
(Ramp, 2026-04); median firm AI spend $11.38/employee/month (Ramp,
2026-06); 88% of organizations use AI in ≥1 business function (McKinsey,
fielded 2025-06/07; re-reported Stanford AI Index 2026).

### AIOPS-02 — Communicated stance & governed use-in-workflow (scored; expert-authored)

Normative criterion text: CRITERIA.yaml `AIOPS-02` (as of v1.0)
Classifier signals: guide/handbook artifacts; workflow documents naming AI
steps; reviewed-draft provenance; transcription outputs filed on a cadence.
Provenance note: strongest mixed support in the brief (DORA stance
evidence + exemplar class + shadow-AI risk data); tagged expert-authored
with the DORA population caveat named in §7.

### AIOPS-03 — Automation-in-operation (CONDITIONAL, B-22 pattern; authority-backed)

Normative criterion text: CRITERIA.yaml `AIOPS-03` (as of v1.0)
Classifier signals: workflow configurations; bot deployments with
escalation settings; run logs; recurring auto-generated corpus artifacts;
rollback or incident notes.

### AIOPS-04 — Working governance: data rules, decision ownership, intake record (scored; expert-authored; assessment-level with hard refresh flags per B-28)

Normative criterion text: CRITERIA.yaml `AIOPS-04` (as of v1.0)
Classifier signals: account-tier/provisioning records; a data-rule passage
in the usage guide; an identifiable approver in intake traces;
evaluation/decline notes.

### AIOPS-05 — Outcome awareness (INFORMATIONAL; ruled R-3, B-20 pattern; expert-authored — weakest provenance in this brief, named per §9C)

Normative criterion text: CRITERIA.yaml `AIOPS-05` (as of v1.0)

## 5. Conflicts and rulings (C-n)

- **C-1 — Performance-review integration of AI-use expectations.** Canon
  split (one growth-scale company embeds it; another adopted then dropped
  it after producing performative use). RULED (operator, 2026-07-09):
  excluded from criteria in both directions; reported as context only. The
  model scores the corpus-verifiable pair — stance artifact plus governed
  use traces.
- **C-2 — "Prove AI can't do it before hiring" headcount gate.** RULED
  (operator, 2026-07-09): excluded from the reference model entirely; no
  normative weight anywhere; where unavoidable, described only as an
  artifact of the 2025 memo genre.

## 6. Elevations and rulings record (E-n / R-n)

- R-1: B-28 RATIFIED as written (Legal-run E-4 delegation closed).
- R-2: B-33 ADOPTED (product-AI / ops-AI split; support-bot class divides:
  operating loop here, build in Product/Engineering). Registry text in
  TAXONOMY §2.
- R-3: AIOPS-05 informational at Band 1 (B-20 pattern).
- R-4 (operator ruling, reshaped the category): the unit of assessment is
  standardized process integration; scattered individual tool use never
  credits completeness and, ungoverned, renders AIOPS-02 red. Led to the
  AIOPS-03 conditional restructure (B-22 pattern).
- 2026-07-15: R-4's verdict clause SUPERSEDED by AIOPS-02 v1.1 — scattered
  individual tool use renders THIN (practice evidenced, integration
  immature); RED reserved for no adoption evidence anywhere. R-4's
  never-credits-completeness principle stands.
- Operator-directed (2026-07-09): adoption-agenda screen (PROTOCOL §4);
  capability premise as criterion filter; category semantics rule (§1);
  customer-defense purpose (§2).
- Provenance tags settled: AIOPS-03 authority-backed; all others
  expert-authored.
- 2026-07-15 — AIOPS-02 v1.1: guard verdict aligned to element grain
  (scattered-use = thin). Normative text: CRITERIA.yaml AIOPS-02 (as of
  v1.1).

## 7. Honesty markers

- Category-wide: under the no-direct-canon condition, no criterion is
  unconditional; all bars are triangulated and stage-conditional.
- Population-extension marker: DORA's empirical base is technology
  professionals; extension of the stance finding to whole-company business
  operations is an extrapolation, corroborated by exemplar practice but not
  itself measured.
- Specific no-authority bars (written defensively): AIOPS-01(c) owner
  attribution; AIOPS-03 one-loop bar; AIOPS-04(b)(c) decision ownership and
  intake record.
- [cite-check] flags: NONE. No statutory rung exists by design; framework
  dates (NIST AI 100-1; AI 600-1 2024-07-26) verified against nist.gov
  in-run, 2026-07-09.

## 8. Calibration plan (B-13 three-outcome separation)

- **The reference company** (test case, never oracle; the tier explicitly postdates it):
  expect evidence-found on engineering-adjacent AI tooling traces; the
  business-ops stance artifact and any loops plausibly genuinely thin —
  with a clean ingest log that is a finding about the reference company, not classifier
  error. Designed-in "not ingested (policy)" outcome: AI spend evidence
  frequently lives in un-ingested accounting systems; the classifier
  renders "possibly present, not found" for footprint claims whose natural
  evidence class is un-ingested, never "absent."
- **Customer A**: designed largest gaps in this tier; expect red/thin tiles
  with clean ingest logs — the tier's first real diagnostic exercise, and
  the first exercise of AIOPS-03's documented-n/a state.
- Precision is measured against ingest-log ground truth only; an artifact
  known-ingested but unfound is classifier error.

## 9. Generation menu (B-23 — the menu lives in generation, never diagnosis)

- **Vendor-evaluation one-pager** (primary flow): generated from the
  company's own corpus — its data rules and owner map operationalized into
  the four questions: what does this integrate with; who owns it when it
  breaks; what data does it see; how will we know it worked.
- Descriptive L0–L3 proficiency ladder (extracted idea, screened) as a way
  to describe where a team is; never a scored target.
- Lightweight per-function where-AI-helps / where-it-doesn't map (extracted
  method, screened), one page.
All generated artifacts are corpus-sourced drafts for human approval.

## 10. Horizon notes

- Product-principle draft for the concept-doc rewrite (now unblocked): the
  buyer's-side principle — Ladder's diagnosis layer serves the customer's
  judgment against the AI market, including against Ladder's own Leverage
  layer; no diagnostic state may generate demand for a remedy Ladder sells.
- Band-2 horizon: agent identity/access management; measurement machinery
  promotion path for AIOPS-05.

## Change log
- v1 (2026-07-09): initial landing. T-1 fresh run; rulings R-1–R-4 and
  operator directions incorporated; adoption-agenda screen applied;
  2026-current empirical layer.
