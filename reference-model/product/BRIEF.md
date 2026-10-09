# Reference-Model Category Brief — Product (FINAL, rulings applied)

**Tier/Category:** Product (TAXONOMY §1)
**Band declared:** Band 1 — seed-funded B2B SaaS/infra, pre-Series A
**Status:** Finalized 2026-07-08. Operator rulings on C-1…C-3 and E-1…E-4 applied; both `[cite-check]` flags resolved against primary-adjacent records. This file is the landing content for `reference-model/product/BRIEF.md`.

---

## 1. Method note

- **Retrieval date (all sources):** 2026-07-08.
- **Scoring principle:** capability, not performance (B-12 / protocol §9A). Product is the most benchmark-tempting category in the model (PMF %, retention curves, North-Star values); every criterion scores whether an artifact, process, or measurement exists, is defined, and is honest. Benchmark values render as dated, sourced context annotations only.
- **Calibration:** the reference company is a first test corpus, never an oracle (B-13 / §9B). Precision measured against ingest-log ground truth only.
- **Evidence multi-homing (operator ruling 2026-07-08, → B-17):** a single corpus artifact may establish completeness evidence across multiple categories (e.g., a strategy deck feeding both PRODUCT-06 and GTM; an executed agreement feeding both Legal and Compliance). The boundary registry governs which category owns a *requirement*; it never makes *evidence* exclusive. The classifier may cite one document under many tiles.
- **Genre-ladder shape:** the primary/statutory rung is **empty** — no regulator owns product-management practice — so no criterion in this category is unconditional; all are stage- or context-conditional (protocol §2 rule).
- **Weakest-provenance subcategory (§9C, named unprompted):** PRODUCT-06. Its moat criterion is scored with a low-confidence flag per the E-4 ruling.

## 2. Authority set

| Weight | Genre (Product instance) | Authorities |
|---|---|---|
| Highest | Primary / statutory | **NONE — rung empty by nature of the domain** |
| High | Named framework canon | A1 SVPG/Cagan (INSPIRED 2017; EMPOWERED 2020; TRANSFORMED 2024); A2 Torres, *Continuous Discovery Habits* (2021; OST 2016); A3 Amplitude *North Star Playbook* (2017, upd. 2019 — primary PDF retrieved); A4 Helmer *7 Powers* (Deep Strategy, **Nov 16, 2016** — resolved) |
| High | Demand-side request lists | A7 VC business-DD checklists (Kruze; WallStreetPrep; Qubit; OpenVC — 2024–26 eds.); A8 VC/M&A technical-product-DD checklists (Sphere; GainHQ; 4Degrees; Soreno — 2025–26 eds.) |
| Medium | Benchmark-market practice | A5 Sean Ellis 40% PMF survey (introduced ~2009; *Hacking Growth* 2017); SaaS retention/NRR bands (secondary, 2026) |
| Lowest | Practitioner canon | A6 Vohra, "How Superhuman Built an Engine to Find Product/Market Fit," **First Round Review, Nov 13, 2018** (resolved; interactive toolkit 2020); A9 prioritization + roadmap-format canon (RICE [Intercom]; Kano; MoSCoW; value/effort; now-next-later) — no formal source |

All rows retrieved 2026-07-08. Independence notes: A1/A2 are independent authors converging on outcomes-over-outputs (one authority + corroborator on that claim; two authorities on their non-overlapping content). A7/A8 are distinct diligence regimes (pre-term-sheet business vs. post-term-sheet technical), satisfying the §2A scrutiny-regime enumeration.

## 2A. Taxonomy reflection (§2A, executed)

Triangulated against a scrutiny-side frame (VC product + technical DD decomposition) and an operating-side frame (product operating model / product-trio self-decomposition). All scrutiny-side elements map into PRODUCT-01…06 or route correctly outward (architecture/tech-debt → Engineering per B-4; IP paperwork → Legal per B-3). Operating-side surfaced two candidates: **Product Design/UX** (→ E-1, ruled: folded) and **Product Operations** (documented n/a at Band 1, B-6 treatment — a named function that materially exists only at scale; its absence is never scored).

No-direct-canon condition holds: the Product roster's authority is triangulated from adjacent frames, consistent with TAXONOMY §3.

## 3. Subcategories

### PRODUCT-01 — Roadmap & Prioritization
**Provenance:** `authority-backed` (A1; A7/A8) + practitioner method (A9).
Normative criterion text: CRITERIA.yaml `PRODUCT-01` (as of v1.0)
Classifier signals: roadmap doc/board; horizon or outcome labels; a prioritization rubric or score column; revision dates.
**Not required and affirmatively not a gap at Band 1:** a dated 12–24-month feature-commitment plan (a Series A+ diligence artifact per A8); portfolio/multi-product roadmaps.

### PRODUCT-02 — Specs & Product-Development Process
**Provenance:** `authority-backed` (A1, A2).
Normative criterion text: CRITERIA.yaml `PRODUCT-02` (as of v1.0)
Classifier signals: PRD/spec templates or instances; discovery notes feeding specs; release/validation notes; design artifacts (mockups, usability notes).
**Boundary:** technical design docs and architecture → Engineering (B-4).
**Not required / not a gap at Band 1:** stage-gate process; a product-ops function.

### PRODUCT-03 — User Research & Continuous Discovery
**Provenance:** `authority-backed` (A2, A1) + practitioner method (JTBD/story-based interviewing).
Normative criterion text: CRITERIA.yaml `PRODUCT-03` (as of v1.0)
Classifier signals: interview notes; opportunity trees/lists; story-based prompts; design-partner records.
**Refresh note:** AI-assisted discovery practice is shifting fast (A2's 2026 guidance: AI synthesis can miss 20–40% of detail); re-audit the synthesis-artifact signal if AI-assisted discovery becomes the corpus norm. [refresh: classifier-consumption]
**Not required / not a gap at Band 1:** a dedicated research team; large-N quantitative studies.

### PRODUCT-04 — Product-Market-Fit Evidence
**Provenance:** `authority-backed` (A5 method; A7 demand-side) + practitioner (A6).
Normative criterion text: CRITERIA.yaml `PRODUCT-04` (as of v1.0)
Classifier signals: a survey instrument or results with a stated population; organic-acquisition-share evidence; design-partner conversion/renewal narratives; segmentation of responses.
**Not required and affirmatively not a gap at Band 1:** a *passing* PMF result. A seed company may honestly lack PMF; measuring honestly is the capability, having fit is performance (B-12). Statistically powered studies are likewise unrequired.

### PRODUCT-05 — Product Metrics & Analytics
**Provenance:** `authority-backed` (A3; A7/A8).
Normative criterion text: CRITERIA.yaml `PRODUCT-05` (as of v1.0)
Classifier signals: analytics tooling references; a North-Star/metric-tree doc; written metric definitions; vanity-vs-value framing.
**Not required / not a gap at Band 1:** a metric warehouse/BI stack. ARPU/MRR as the *product* North Star is correctly absent (lagging business metrics — A3).

### PRODUCT-06 — Product Strategy & Defensibility (incl. IP-moat strategy)
**Provenance:** `authority-backed` on the moat half (A4; A8); `expert-authored` on the strategy-boundary half (B-1 judgment + practitioner canon). **Weakest-provenance subcategory of this run.**
Normative criterion text: CRITERIA.yaml `PRODUCT-06` (as of v1.0)
Classifier signals: operational-horizon strategy doc; an explicit defensibility section naming power + benefit + barrier; competitive-differentiation framing; IP/FTO strategy narrative (FTO = freedom to operate — clearance that your product doesn't infringe existing patents).
**Not required / not a gap at Band 1:** a proven durable moat; granted patents (filings are Legal); enterprise vision content.

## 4. Conflicts — ruled arbitrations

- **C-1 (ruled: agree).** Outcome vs. feature/timeline roadmap format war is unscored; existence + prioritization method + currency + outcome-traceability score. Format debate reported as context.
- **C-2 (ruled: agree with qualifier).** A PMF *assessment* is required to exist with a defined method and honest bounding; no numeric threshold is scored. Thresholds are dated context annotations.
- **C-3 (ruled: agree).** Defensibility scores as a reasoned articulated thesis (power + benefit + barrier + erosion caveat); moat reality/durability is unscored. Refresh note attached.

## 5. Elevations — rulings recorded

- **E-1 (ruled):** Design/UX folded into PRODUCT-02/03 at Band 1; promotion deferred (B-8 pattern). → **B-14.**
- **E-2 (ruled):** pricing/packaging stays in GTM-16 (GTM v2; was GTM-04); B-9 unchanged; non-scoring cross-ref marker in PRODUCT-06.
- **E-3 (ruled — researcher lean reversed):** retention/churn is a GTM value, scored in GTM-21 (rates) with churn-reason in GTM-17 (GTM v2; was GTM-06); PRODUCT-04 cites it only as a bounded, acknowledged-weak proxy. → **B-15.** Derived rule to §10: a signal that is both product-health measure and commercial KPI homes with the commercial owner; other categories reference it as a bounded proxy.
- **E-4 (ruled):** defensibility thesis → PRODUCT-06 (scored, low-confidence-flagged); implementing architecture → Engineering. Binds the Engineering run. → **B-16.**

## 6. No-authority markers and cite-check resolution

**No-authority markers (kept, written defensively):**
- Prioritization methods and the now-next-later format (A9) are practitioner canon with no formal source; criteria require only that *a* stated method exists and accept any recognizable format.
- PRODUCT-06's strategy-scope line rests on B-1 judgment; tagged `expert-authored` on that half.

**`[cite-check]` — both resolved 2026-07-08, landing unblocked:**
- **A4:** *7 Powers: The Foundations of Business Strategy*, Hamilton Helmer, Deep Strategy, published **November 16, 2016** (publisher records; Goodreads/AbeBooks converge).
- **A6:** "How Superhuman Built an Engine to Find Product/Market Fit," Rahul Vohra, **First Round Review, November 13, 2018** (Superhuman's own republication attests the FRR first-publication date); interactive toolkit edition 2020. *(Correction from draft: originally asserted ~2019.)*

## 7. Calibration plan (reference corpus) — §9B three-outcome separation

The reference company is a first test corpus, never an oracle (B-13). Per subcategory: evidence found / genuine absence with clean ingest log (a finding about the reference company) / nothing found with skip-fail-exclusion log entry (not ingested; never scored absent). Precision is measured only against ingest-log ground truth.

| Subcat | Expectation | Designed-in note |
|---|---|---|
| P-01 | Some roadmap/planning artifact likely | Roadmap living in an un-ingested tool → "not ingested," logged |
| P-02 | Possibly thin/informal | Informal-but-present → thinness, never absence |
| P-03 | Design-partner-led, qualitative | Stage-appropriate; qualitative-only is not a gap |
| P-04 | **Genuine absence of a formal PMF survey expected** — the cleanest B-13 test in the run | Must render as "genuine absence (finding)" or "possibly-present-not-found," never classifier failure — unless the ingest log shows a PMF artifact ingested but unfound, which IS classifier error. Retention proxies route to GTM-06 per B-15 |
| P-05 | Instrumentation likely; formal NSM possibly informal | Undefined metric → thinness |
| P-06 | Strategy likely; explicit moat section possibly thin | Low-confidence flag on the moat criterion regardless (E-4) |

**Generality gate (roadmap gate 3):** re-run against Customer A's corpus after the reference corpus; over-firing on a different sector is the overfit signal.

## 8. Landing record

Landed with the coupled commit: protocol → v0.4 (§12 thread-handoff verbatim; §9D evidence multi-homing; §10 audit entry for the E-3 reversal; changelog); taxonomy → v0.3 (header corrected from stale v0.1 directly to v0.3; Product landed on the status board; B-14–B-17 recorded; changelog); gtm/BRIEF.md → dated B-15 addendum noting retention/churn scored under GTM-06 with PRODUCT-04 cross-reference.
