# TEMPLATE-METHOD-LOG.md — the protocol experiment record

This log is the raw material for TEMPLATE-PROTOCOL.md, to be codified after ~5 templates if the
method holds. Each entry records how one template was actually produced, so the repeatable
protocol can be distilled from evidence rather than asserted up front.

**Log format (every future template):** derivation trigger; authoring method; operator ruling
deltas (what the operator changed vs the proposed spine); authority-check findings; time cost.

---

## Entry 1 — revenue-metrics (v1), 2026-07-17

**Derivation trigger.** A live diagnostic result drove it: board-003 graded GTM-20 (metrics
definitions) a genuine-absence — the corpus carries the numbers (ARR figures, pipeline
assumptions, expense lines) but no document defining what they mean. The first remediation
attempt was template-less: the draft's outline came from whatever retrieval surfaced, and the
operator's critique named the failure precisely — *scope by corpus*. The draft presented only
the highest-level, broadly-known revenue outputs (ARR, CAC), and only a couple of them, because
the corpus happened to surface those; it never confronted retention, funnel, unit economics,
forecast discipline, or governance, because nothing in the corpus prompted them. A metrics
document's scope must come from what the document TYPE requires, not from what the company
happens to have written down.

**Authoring method.** The orchestrator authored the 12-section spine from domain expertise
(the standard shape of a SaaS revenue/GTM metrics definition: definitions → movement → retention
→ funnel → marketing → capacity → unit economics → forecast → targets → governance → source of
truth → open rulings), assigning each section a fill_mode (corpus / recommend / operator /
structural) and stage-conditionality where a section only applies under a condition (e.g. sales
capacity is deferred with no sales team). The operator ruled the spine.

**Operator ruling deltas (vs the proposed spine).** _(To be filled from the operator's edits.
As landed, the spine encodes: concentration-risk as a priority-flag for strategic-customer
motions with a stated threshold; unit economics with CAC payback primary and LTV caveated;
source-of-truth and governance as operator-owned; the exclusions — no benchmark pass/fail
values, no internal reference-model vocabulary in customer documents, no padding metrics.)_

**Authority-check findings.** _(Recorded at first full-pipeline run — see the draft's
`.review.json` authority report and the run report of 2026-07-17. The authority pass checks each
section against the current standard formulation from recognized external authorities, with a
check date and re-check interval per REFRESH.)_

**Time cost.** _(Record wall-clock for authoring + operator ruling + first authority pass.)_

---

## Entry 2 — revenue-metrics v2 (§9 efficiency stage-conditionality), 2026-07-17

**Derivation trigger.** Deliverable-readability review of the v1 GTM-20 output. Not a corpus or
authority finding — an operator ruling on template design.

**Ruling delta (what the operator changed).** §9 (Unit economics) becomes "Unit economics &
efficiency" and its efficiency metrics become STAGE-CONDITIONAL: CAC payback and burn multiple
apply at all stages, but **Rule of 40 and Magic Number are deferred below ~$20M ARR**, with the
deferral rendered as ONE sentence, not a filled subsection. This is a **stage-honesty principle
overriding the template's completeness reflex**: a metrics document for an early-stage company
should not carry a filled Rule-of-40 subsection that only becomes meaningful at scale — confronting
the metric with a one-line "deferred until ~$20M ARR" is more honest than fabricating coverage.
Logged as exactly that: completeness is the default, but stage-appropriateness can rule a section
down to a single deferral sentence.

**Authority-check findings.** N/A (design ruling, not a content standard).

**Time cost.** _(Record wall-clock for the ruling + version bump + regeneration.)_

---

## Entry 3 — revenue-metrics v3 (§9 Rule of 40 / Magic Number → informational), 2026-07-17

**Derivation trigger.** The v2 full-pipeline run surfaced an authority-vs-template conflict: the
stage-5 authority review pushed back on the v2 "defer below ~$20M ARR" ruling, recommending the
metrics be tracked as early-stage trends ([E6] in the GTM-20 sidecar). Operator ruling resolved it.

**Ruling delta (what the operator changed).** Neither full-defer (v2) nor benchmark-track (the
authority's push): Rule of 40 and Magic Number become **INFORMATIONAL** — shown as directional
trend lines with a one-line caveat ("Shown for directional awareness, not as targets — these
become meaningful benchmarks at ~$20M+ ARR"), never scored. This **mirrors the reference model's
informational state** (shown for awareness, never scored). Payback and burn multiple remain the
stage-appropriate primary measures. A new `informational` fill_mode was added to the generation
contract to render it.

**Authority-check findings.** The authority push ([E6]) is the trigger, not an adopted finding —
the operator overrode it with the informational-trend ruling.

**Time cost.** _(Ruling + version bump; applies on next generate, no regeneration triggered.)_

---

## Entry 4 — batch promotion, 14 provisional templates, 2026-07-17 (autonomous run)

**Derivation chain (all 14):** backlog proposal (generation-templates/proposals/) → autonomous
promotion to a live PROVISIONAL v1 template under autonomous-run rules → operator review by
exception pending. **Ruling deltas: none** (operator review pending). Templates: product-metrics,
sales-enablement, onboarding-success, pmf-assessment, product-process, operating-ownership-map,
operating-runbooks, vendor-inventory, compensation-framework, values-operating-principles,
hr-policy-handbook, legal-draftable-policies, capital-plan, engineering-reference-docs; plus
revenue-metrics v4 (GTM-22 segmented-targets extension folded in).

**Authority stamp:** deferred to per-deliverable stage-5 authority review at generation (Phase B),
not run as a separate 14-call template pass — conservative spend decision, see DECISIONS-THIS-RUN.md.

**Conservative gap-class / exclusion calls:** ENG-03, ENG-07 re-classed to `practice` (practice-
heavy; removes Approve path); LEGAL-01, LEGAL-06, COMP-02 generation-excluded (records = fabrication).

**Time cost:** _(batch authored + wired in one autonomous session.)_

---

## Entry 5 — the 07/18 five-fail operator review (ruling deltas of record), 2026-07-18

_(The 07/18 review prompt called this "entry 4"; appended as Entry 5 because the autonomous
batch-promotion already holds Entry 4. Same content, correct sequence.)_

**Derivation trigger.** An operator review of five generated deliverables (the
`Ladder_doc_generation_review` of 07/18) failed all five and produced the ruling deltas below.
Not a corpus or authority finding — a governance + type-fit review of the generation layer.

**Ruling deltas of record.**
- **(i) Autonomous template promotion is retired.** Promoting a template to a live provisional
  without a first-of-type read of the type it serves is no longer permitted. Template authoring
  AND type-fit are operator-ruled. (Directly retires the Entry-4 batch-promotion posture: the 14
  provisional templates now await operator type-fit review, not just review-by-exception.)
- **(ii) Magnitude / production classes exist.** One-click, one-shot generation was wrong for
  handbook-class documents. Production mode is now a schema-level concern that the generation
  service branches on. _(Landed as the MODE MATRIX, not the first-proposed `production_class` enum —
  see Entry 6 for the operator-ruled design: per-company `default_mode` + generation-time
  `mode_conditions` + a `professional_review` flag.)_
- **(iii) The interrogation is the correct phase 1 for judgment-heavy types.** For types that cannot
  be drafted well until the company answers key decisions (CAP-01 / PRODUCT-01 were the evidence),
  the deliverable is current state + gaps + the Decisions-required form, not a pseudo-document.
  _(Landed as PLAN mode in Entry 6; the target document is produced only in artifact mode / on
  regenerate-with-answers.)_
- **(iv) GTM-16 template-criterion mismatch recorded.** The sales-enablement template did not fit
  the GTM-16 criterion as generated; re-ruling is PENDING the operator session (no re-author here).
- **(v) LEGAL-09 false red corrected.** The posted, conspicuous privacy policy and posted terms of
  service live on the company's public website, which is not an ingested source (no crawler). Corpus
  silence about them is a not-ingested / "we couldn't see it" visibility gap, never genuine-absence.
  Implemented as the posted-web-evidence class at the harness/rollup layer (STEP 1); LEGAL-09's
  board-003 tile reframed (stays thin; the two web-homed elements reframed), false red corrected.

**Authority-check findings.** N/A (governance + type-fit rulings, not content standards).

**Time cost.** _(Record wall-clock for the review-driven fixes round 1.)_

---

## Entry 6 — the MODE MATRIX as ruled (07/18 operator ruling), 2026-07-18

**Derivation trigger.** The orchestrator proposed a production-class scheme (Entry 5 delta ii/iii);
the operator ruled on it and landed the mode matrix. This entry is the ruled design of record,
including the deltas from the proposal.

**The system as ruled.** A document TYPE resolves to a production MODE — a PER-COMPANY-RESOLVED
default, not a fixed verdict. Templates carry `default_mode` (artifact | plan), `mode_conditions`
(evidence tests, evaluated at generation time against the live corpus, that flip the default), and
`professional_review` (attorney | hr | none).
- **artifact mode** = produce the target document (the prior behavior; questions native via
  decisions-required).
- **plan mode** = produce a gap-closure PLAN (current state per criterion element -> gaps ->
  decisions required -> recommended path). NOT the target document; never presents as one.
- The resolved mode + its basis are recorded in the draft metadata and stated on the review surface
  ("produced as a plan because ..."); an operator override forces the other mode and regenerates.

**Universal invariants (never company-resolved).**
- Plan-mode outputs are approvable as WORKING only and NEVER flip a tile on adoption — zero grade
  movement, ANY gap class (wired beside the gap-class flip rules; `adopt-draft` refuses a plan).
- `professional_review != none` disables approve-as-final until a review attestation is recorded
  (an approval-log record noting reviewer type + date); the UI shows "requires attorney/HR review
  before finalize."

**Deltas from the orchestrator proposal (ruled).**
- CAP-01: plan -> **artifact**.
- PEOPLE-06: artifact -> **plan**.
- The "intake" mode was DISSOLVED into the `professional_review` flag (attorney/hr/none) — a mode is
  not a referral; referral is a gate on finalize.
- "plan never flips" was EXTENDED across all gap classes (not just artifact-sufficient).
- The universal-matrix design was REJECTED as reference-corpus-overfit — modes are per-company-resolved
  defaults with generation-time conditions, not a fixed global assignment.
- GTM-16's double queue entry was diagnosed as a QUEUE SUPERSESSION bug (pre-template smoke draft
  not retired), not criterion redundancy — fixed as queue hygiene (one draft per subcategory).

**Default-mode assignment (operator-ruled 2026-07-18; subject to generation-time resolution).**
- artifact: CAP-01, ENG-01 (condition docs-in-GitHub -> plan), GTM-18, GTM-20, LEGAL-09
  (professional_review attorney), OPS-01, OPS-04 (disaggregation ruled; not split until ruled),
  OPS-05, PEOPLE-02, PEOPLE-07 (professional_review hr; attorney logged as the ruled alternative),
  PRODUCT-05.
- plan: AIOPS-01, GTM-16, GTM-17 (condition win/loss-in-CRM -> artifact), PEOPLE-06, PRODUCT-01,
  PRODUCT-04. AIOPS-01 and GTM-17 generate via the generic plan skeleton (no bespoke template).

**mode_conditions authored this round:** ENG-01 (docs-live-in-GitHub -> plan), GTM-17
(win/loss-in-CRM -> artifact). All other templates' conditions are PROPOSED in the round-2 report
for operator ruling, not invented.

**Authority-check findings.** N/A (governance design). **Time cost.** _(mode matrix landed in one
session; no regeneration — modes apply on next generate.)_

---

_Next entries append below as templates are authored. After ~5, distil TEMPLATE-PROTOCOL.md._
