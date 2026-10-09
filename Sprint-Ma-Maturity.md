# Sprint Ma — Maturity: Reference Model, Gap Detection, Board

**Layer:** Maturity (Layer 2)
**Status: CLOSED 2026-07-16 — see runs-of-record/SPRINT-MA-CLOSE.md for the close record and post-close queue.**
**Goal:** score an ingested corpus against a four-tier reference model, diagnose absence / thinness / inconsistency, present the tile board, and generate missing documents or process from the corpus.
**Depends on:** Sprint M (a reliable, queryable heterogeneous corpus must exist first).
**Net-new:** this is mostly greenfield. The reference model is the product's intellectual core.

---

## Task 1 — Author the reference model (the intellectual core) — v2

Build the reference model as a versioned artifact in `reference-model/` in the
Ladder repo: one file per category, grouped by tier, each with machine-consumable
frontmatter (category id, tier, band, completeness criteria, classifier signals,
provenance, sources, confidence, arbitration log) and a human-reviewable prose body.

**Derivation — three strands, tagged by provenance.** The model is NOT derived
from the reference corpus. It is (a) *authored*: tier/category structure and judgment
from the operator's expertise; (b) *authority-grounded*: per-category completeness
criteria from citable third-party authorities (due-diligence request lists, model
document sets, practice frameworks, practitioner canon), gathered via structured
research runs; (c) *corpus-calibrated*: real corpora (the reference company first) sanity-check
criteria against actual company documents. Where a real corpus lacks something
authorities require, that is a finding about the company, not a defect in the
model. Every category carries a provenance tag — `authority-backed` /
`expert-authored` / `corpus-observed` — and claims only the provenance it has.
**Authority density is not importance density**: categories whose authorities are
practitioner canon rather than statutory checklists (GTM above all) are not
penalized for their genre; they take more `expert-authored` weight and more
operator arbitration, which is where the product's judgment lives.

**Tier structure and priority order (build in this order):**
1. **Business / Governance** — cap table, board, financials, entity docs.
   Richest authorities; table stakes; fast.
2. **GTM (Sales & Marketing)** — first-class tier, elevated from worked-example
   status: pipeline/CRM state, talk tracks and enablement, ICP and segmentation,
   marketing artifacts, KPIs and targets. The differentiating diagnosis — the
   tier the flagship SDR-loop example runs on.
3. **Engineering / Infrastructure** — as previously specified; softer
   authorities, more expert authorship expected.
4. **AI Operations** — authored, grounded where authorities exist (NIST AI RMF,
   emerging governance frameworks), tagged honestly where they don't.
5. **Compliance / Security — deliberately thin, detection-and-referral posture.**
   Mature dedicated products (Vanta/Drata-class) already are this category's
   Ladder. The model detects presence/absence of compliance artifacts and refers
   outward; it does not rebuild compliance frameworks. Rationale recorded so the
   thinness reads as a decision, not a gap.

**Bands.** Band-by-band, driven by corpora actually in hand (band 1: seed-funded
B2B SaaS/infra, pre-A — reference-corpus-calibrated). Categories declare band applicability;
band variants are added only when a real corpus forces one. No speculative stage
taxonomy. Client corpora require client consent before use as development bands;
previously excised material is never reconstructed.

**Process.** One research run per tier, in priority order, each in a fresh
conversation: the research agent (Claude, web-enabled) produces a *category
brief* — authority set with versions and dates recorded (for future manual
refresh), per-category criteria with citations, conflicts with proposed
arbitration, close calls elevated to the operator with both positions stated,
and explicit no-authority markers. Operator reviews and rules on elevations;
CC lands approved categories as repo files. The model is a static, versioned
artifact updated manually at the operator's discretion — never a runtime
dependency.

**Output:** the versioned `reference-model/` directory — the product's most
defensible asset; its citations make the board's verdicts defensible in front
of a customer.

---

## Task 2 — Classifier: map corpus → reference categories

Build the classifier that reads the ingested corpus and maps what exists to reference categories. For each category, determine: present / thin / absent, with the evidence (which corpus entries support the judgment).

**Reuse:** the evidence-weighted, attribution-disciplined approach from AbrainOAG's entity tiering. A category is "present" only with attributed evidence, not a bare keyword match — the same discipline that stopped false-confident entity profiles.

---

## Task 3 — Gap detection (the hard correctness problem)

Diagnose the three failure modes:

- **Absence** — a reference category with no corpus support.
- **Thinness** — a category present but underdeveloped vs. the reference completeness criteria.
- **Inconsistency** — corpus entries that contradict each other or a source of truth (headcount in deck ≠ org chart; valuation ≠ cap table).

**The central risk:** false positives. A board that flags "missing X" when X simply was not ingested destroys trust. The classifier must distinguish *genuine absence* from *un-ingested presence*. Mitigations to build in: confidence levels on every gap (not binary), a "possibly present, not found" state distinct from "absent," and a way for the user to mark a gap as a false positive (which feeds back into precision). **Verify precision against ingest-log ground truth** — an artifact the ingest log shows as ingested but the classifier fails to find is a classifier error; an absence with a clean ingest log is a finding about the company. No calibration corpus, including the reference company, is presumed complete (protocol §9B).

**Ingestion-state discipline.** Parse-level absence must not become a
maturity-absence verdict. The ingestion log's skip/fail lists are a mandatory
input to gap detection: a document that failed to parse (e.g. a scanned PDF
pre-OCR) or was excluded by policy (litigation hold) is "not ingested," never
"absent." The board must distinguish the three states.

---

## Task 4 — The board (interface)

Build the tile board: one tile per operational area, colored by state (green complete / orange thin / red absent), grouped by the four tiers. Legible at a glance, lightly gamified — a company should see its operational completeness and watch it improve.

Tile states should support the deeper progression the product is built toward: **absent → documented → automated.** In this sprint, tiles reach "documented." The "automated" state is owned by Sprint L (Leverage) and should be designed for now, not built.

**Build note:** this is a frontend surface. Follow the project's frontend-design conventions. Keep the board a thin, replaceable view over the classifier's output. The stored verdicts are what's versioned and owned; the board can be rebuilt from them at any time.

---

## Task 5 — Generation: close gaps from the corpus

Where a gap is a missing document or process that the corpus already has raw material for, generate a draft. The GTM example: transcripts in the corpus but no talk track → draft the talk track from the transcripts; targets but no segmented KPIs → generate them. This is memory and maturity working together.

**Discipline:** generated artifacts are drafts for human approval, sourced to the corpus entries they draw from — never presented as authoritative unreviewed. Same foil-clean, no-false-confidence, attribution rules as all generated prose in this project.

**Prove one generation flow first** (talk-track-from-transcripts is the clean candidate) before generalizing to other gap types.

Generation flows are gated by gap class per reference-model/GAP-CLASS-DOCTRINE.md: generated drafts close only artifact-sufficient gaps; system gaps take recommendation plus seeding; practice gaps take scaffold-only, with the tile flip deferred until naturally-produced evidence of the running practice appears in the corpus on a later run.

---

## Acceptance criteria

- The five-tier reference model is authored, authority-grounded, and corpus-calibrated per Task 1 v2, and versioned in the repo.
- The classifier maps the reference corpus to categories with attributed evidence.
- Gap detection runs on the reference company with a measured, low false-positive rate against ingest-log ground truth (an ingested-but-unfound artifact is the error metric; genuine absence is a finding about the company — protocol §9B).
- The board renders the four tiers with green/orange/red states over real classifier output.
- At least one generation flow (talk-track-from-transcripts) produces a sourced, human-reviewable draft.
- Reference-model generality is tested by running the board against Customer A's real corpus (decision gate 3 from the roadmap).

---

## Explicitly out of scope

- Any automation / live loops (Sprint L). The "automated" tile state is designed-for, not built.
- Multi-tenant anything.
- Perfecting every generation flow — prove one, then the pattern.
