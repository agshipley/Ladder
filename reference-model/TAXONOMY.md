Reference Model — Taxonomy
Status: v0.21 (2026-07-15) · Living document
Band declared: Band 1 — seed-funded B2B SaaS/infra, pre-Series A (reference-corpus-calibrated), US-jurisdiction scope (operator ruling 2026-07-08; non-US regulatory regimes out of scope at Band 1)
Governs: the category structure of the Ladder reference model. Category content lives in per-category directories; this document owns the roster, the boundary rules, the external-frame mapping, and the per-category status board. Boundary changes require an operator ruling recorded here. Per RESEARCH-PROTOCOL.md, every category receives its own deep research pass before it is finalized and pushed.

1. The eleven categories
CategoryOne-line mandate
VisionEnterprise-level strategic content: mission, long-range positioning strategy, company-level goals.
ProductWhat the company builds and why: roadmap, specs, user research, PMF evidence, product metrics, product-development strategy including IP-moat strategy.
EngineeringHow it is built and run: architecture, code, CI/CD, reliability, product infrastructure, technical documentation.
GTMHow it reaches and wins customers: market analysis (TAM, positioning, ICP), marketing, sales motion and pipeline, enablement, customer success (subcategory at Band 1), GTM KPIs and traction evidence.
PeopleThe talent function: hiring process, compensation philosophy, benefits and leave, onboarding, performance practice, org design, culture documentation, and the employee handbook / HR policy set.
FinanceMoney operations: bookkeeping and close, financial statements and reporting, budget/financial plan, tax compliance.
CapitalThe venture capital function: capital strategy and planning; cap table and securities records; equity/debt instruments and administration (409A, 83(b), plan admin); fundraising motion and materials; investor relations & reporting.
LegalThe legal record: entity/formation, corporate action record, financing closing sets, IP and employment paperwork, executed contracts, securities-law compliance, litigation/disputes; privacy and data-protection instruments and applicability records; marketing and accessibility compliance records (B-27).
OpsThe company's operating machinery: documented processes, internal tooling and IT, goal-setting and review cadence, vendor management, project/quality/change management, supply chain where applicable.
AI OperationsThe plan and practice for integrating AI across business and revenue operations, with its governance.
ComplianceDeliberately thin, detection-and-referral posture: presence/absence of compliance and security artifacts (SOC 2-class), insurance, certification-class regulatory posture (operating-law compliance instruments → Legal per B-27; cross-referenced, never re-scored). Refers outward; does not rebuild compliance frameworks.
2. Boundary registry
Numbered rules. New boundary questions are settled here by operator ruling, never re-litigated inside a category run. Status: ruled (operator) or provisional (researcher proposal pending the named run).

B-1 (ruled). Strategy divides by scope and horizon together: function-scoped, operational-horizon strategy belongs to the function (a quarterly/annual sales-motion document is GTM); enterprise-scoped, long-horizon strategy belongs to Vision (a two-to-five-year company positioning document is Vision).
B-2 (ruled 2026-07-09; per Vision-run delegation). Three-way planning split final: Vision owns strategic content (mission/identity, long-range positioning strategy, company-level goal content); Ops owns goal-setting and review machinery (cadence, rhythm, meeting architecture — the B-21 line one tier up); Finance owns the financial plan (FIN-04). Vision-side stress test: the strongest single-artifact challenge (the EOS V/TO, carrying content and machinery in one document) divides along the same line its own practitioners draw (Vision page vs. Traction page), corroborating the boundary; counterpart sides previously held (Ops 2026-07-08 with third-lineage corroboration; Finance 2026-07-09). Plan artifacts multi-home as evidence (B-17); requirement ownership never merges.
B-3 (ruled). IP splits: IP strategy and moat thinking → Product; IP legal paperwork (assignments, PIIAs, registrations) → Legal.
B-4 (ruled). IT splits (APQC 8.0): product infrastructure → Engineering; internal tooling, IT, and access management → Ops.
B-5 (ruled). Insurance → Compliance. (Scope clarified by B-26: corporate risk insurance only; employee-benefit insurance → People per B-26.)
B-6 (ruled). Supply chain → Ops (n/a at Band 1 SaaS; documented n/a, never scored absent).
B-7 (ruled). Market analysis, TAM, positioning → GTM.
B-8 (ruled 2026-07-08). Customer Success is a GTM subcategory at Band 1; promotion to its own category deferred until a real corpus demands it.
B-9 (ruled 2026-07-08). Form customer agreements and pricing/order templates → GTM (enablement assets); executed customer contracts → Legal (the legal record).
B-10 (ruled). Employment and contractor paperwork (offer letters, PIIAs, classification) → Legal; the People category owns the talent function itself, not its legal artifacts.
B-11 (ruled 2026-07-09). Litigation-hold / exclusion-class surfacing: where an instance's exclusion class keeps dispute materials out of the corpus by policy, every affected tile area renders a PLACEHOLDER state — "maintained outside the corpus by policy" — visible to board viewers, with neutral data-minimization framing (sensitive dispute materials are deliberately not routed through third-party processing services the instance cannot fully track). Never "absent," never green; never counts toward absence or completeness. The placeholder affirms the obligation to keep the files organized: scorable elements are the organization/hold process record and the affirmative none-record — never contents. Classifier evidence for the state is the ingest log's exclusion entry (B-13). One rule, both faces: LEGAL-08 and PEOPLE-04/08 render identically. (Legal run E-1; brief at legal/BRIEF.md §5.)
B-12 (ruled 2026-07-08). Capability, not performance: completeness criteria score whether an artifact, process, or measurement exists, is defined, and is honest — never whether metric values clear benchmark bands. Benchmarks render as dated, sourced context annotations; a non-scoring "metric distress" annotation layer is permitted. Applies to every metric-bearing category.
B-13 (ruled 2026-07-08). Calibration corpora are test cases, never oracles. No corpus is presumed complete. Classifier precision is measured against ingest-log ground truth only; genuine absence in a calibration corpus is a finding about the company. Derived board state: the four SDR-loop prerequisites (GTM-11 crm/system-of-record, GTM-12 scheduler, GTM-15 talk track, GTM-22 segmented KPIs) compute a displayed "loop-ready" indicator (per E-5).
- **B-14 (ruled 2026-07-08).** Product Design/UX is folded into Product subcategories PRODUCT-02 (delivery/spec quality) and PRODUCT-03 (design research) at Band 1; promotion to a dedicated subcategory deferred until a real corpus demands it (B-8 pattern).
- **B-15 (ruled 2026-07-08; refined 2026-07-15).** Retention/churn is a commercial GTM value: churn/retention RATES are scored in GTM-21 (KPI tracking / traction record), and churn-REASON capture is scored in GTM-17 (win/loss & churn-reason). PRODUCT-04 may cite retention only as a bounded, acknowledged-weak proxy for PMF, with a cross-reference to GTM-21. General rule: signals that are both product-health measures and commercial KPIs home with the commercial owner.
  2026-07-15: B-15 homes refined to GTM v2 (rates GTM-21, reason capture GTM-17); principle unchanged.
- **B-16 (ruled 2026-07-08; binds the Engineering run).** Technical defensibility splits: the defensibility thesis/strategy (which power, benefit, barrier) → PRODUCT-06, scored with a low-confidence flag; the architecture implementing it → Engineering.
- **B-17 (ruled 2026-07-08).** Evidence multi-homing: a single corpus artifact may establish completeness evidence across multiple categories. The boundary registry governs requirement ownership, never evidence exclusivity. Classifier and calibration plans treat cross-category evidence reuse as normal, not double-counting. (Protocol §9D companion.)
- **B-18 (ruled 2026-07-08).** Vendor management splits: the vendor OPERATING process
  (inventory, intake/approval, named owners, renewals, offboarding) → Ops (OPS-05);
  the vendor SECURITY-RISK-ASSESSMENT posture (TPRM: questionnaires, continuous
  monitoring, risk scoring; SOC 2 CC9.2 controls (citation verified against AICPA TSP §100 primary text, 2026-07-09)) → Compliance
  (detection-and-referral). The vendor inventory is multi-homed evidence (B-17).
  Binds the Compliance run.
- **B-19 (ruled 2026-07-08).** Change management splits three ways: the
  change-management OPERATING process (documented practice, risk-matched approval
  posture) → Ops (OPS-07); TECHNICAL change control (CI/CD gating, deploy automation)
  → Engineering; the SOC-2 change-management control → Compliance detection. Evidence
  multi-homes (B-17). Binds the Engineering run.
- **B-20 (ruled 2026-07-08).** Quality management is informational-only at Band 1
  (OPS-09): detection-level signal set cross-referencing Engineering; never a scored
  Ops tile. Promotable to scored if a real corpus shows quality machinery living
  outside Engineering.
- **B-21 (ruled 2026-07-08).** The management-rhythm machinery/content line (B-2
  pattern, one tier down): Ops owns the MACHINERY — that 1:1s exist on a cadence, that
  a review CYCLE exists with a defined process, the meeting architecture, and the
  ownership map (function → owner) as an operating artifact. People owns the PRACTICE
  CONTENT — how performance is evaluated, compensation philosophy, feedback quality,
  and org design (reporting structure). Evidence multi-homes heavily (B-17). Binds the
  People run.
- **B-22 (ruled 2026-07-08).** Physical operations (supply chain, real property,
  facilities, physical assets) is a first-class CONDITIONAL Ops subcategory (OPS-08),
  extending the B-6 pattern to assets/real property (APQC 10.0): a physical footprint
  activates it for scoring; a pure-SaaS instance renders documented-n/a, never absent,
  never red. First real exercise expected at the Customer A deployment. Also conditions the
  PEOPLE-08 workplace-safety & injury-reporting handbook element (9EA-B-PEOPLE-01, ruled
  2026-07-10): a physical footprint activates it, an office-only instance renders
  documented-n/a for that element.
  2026-07-16 refinement (operator-ruled): activation is GRADED TO THE FOOTPRINT — an office
  lease activates facilities-grade elements (scored), while supply-chain/inventory/physical-
  product elements outside the actual footprint render documented-n/a at ELEMENT scope; only a
  fully remote instance with no premises or physical assets renders documented-n/a at ENTRY
  scope. The OPS-08 `physical-footprint` trigger in CRITERIA-SCHEMA.yaml carries the operational
  detail of this ruling.
- **B-23 (ruled 2026-07-08).** Documentation-default with earned override (the C-3
  ruling; applies to every process-bearing tile): at Band 1 the reference direction is
  documentation — grounded product-constitutively (Ladder ingests, diagnoses, and
  automates a documented corpus), by canon weight, and by the counter-canon's own
  staging (context-not-control is an earned later-stage state per its author). A
  deliberate-lean posture converts a tile to complete-with-annotation only when the
  corpus contains BOTH an articulated operating-philosophy artifact AND the evidenced
  substitute machinery that philosophy calls for; a philosophy memo alone renders thin
  with annotation. The menu (draft the doc vs document the divergence) is offered in
  generation, never in diagnosis.
- **B-24 (ruled 2026-07-08; binds the Vision run).** Values split by scope and horizon (B-1/B-2/B-21 pattern): enterprise identity and mission → Vision; operationalized behavioral norms (operating principles, how-we-work content) → People (PEOPLE-06). One values artifact multi-homes (B-17).
- **B-25 (ruled 2026-07-08; binds the Capital completion pass).** Compensation philosophy, leveling, and bands — including the equity band by level — → People (PEOPLE-02). Equity instruments and their administration (option plan, 409A valuations, 83(b) elections, grant/cap-table administration) → Capital. The equity dataset multi-homes (B-17).
- **B-26 (ruled 2026-07-08; binds the Compliance run; clarifies B-5).** B-5's "Insurance → Compliance" scopes to corporate risk insurance (D&O, E&O/professional liability, cyber, general liability, workers' compensation). Employee-benefit insurance (health/dental/vision/life offered as compensation) is a People program (PEOPLE-07): executed carrier contracts → Legal (B-9 pattern); vendor operating process → Ops (B-18). The benefits package must be documented in employee-facing form communicable before/at offer (PEOPLE-07(c)).
- **B-27 (ruled 2026-07-09; per Legal-run E-3 delegation).** Operating-law compliance split: privacy and data-protection instruments and applicability assessments, and marketing/accessibility compliance records, → Legal (LEGAL-09/10). Compliance's "regulatory posture" scope is narrowed to certification-class detection-and-referral (SOC 2-class artifacts, insurance per B-5/B-26, vendor TPRM per B-18), which CROSS-REFERENCES LEGAL-09/10 and never re-scores their content. Evidence multi-homes (B-17); requirements never do. Binds the Compliance run.
- **B-28 (ruled 2026-07-09; proposed by the Legal run E-4, ratified as written by the AI Operations run).** AI split (B-3/B-19 pattern): the AI regulatory-applicability record (which statutes reach the company's development or deployment of automated decision-making technology, assessed and dated) → Legal (LEGAL-09(h)); the AI governance plan (where and how AI is applied, under what internal governance) → AI Operations. One AI-use inventory multi-homes both (B-17). Assessment-level criteria only with hard refresh flags — the state AI landscape is being rewritten annually (Colorado SB 24-205 repealed before effectiveness; SB 26-189 effective 2027-01-01, rulemaking pending).
- **B-29 (ruled 2026-07-09; per Capital-run E-1; binds the Finance run).** §6039/Form 3921 ISO information-return capability — the records-for-filing and the filing act — → Finance (Capital is not an administrative/ops category). The underlying grant/exercise records (dates, prices, FMV tied to the governing 409A) are Capital securities-record content (CAP-03) and multi-home as evidence (B-17).
- **B-30 (ruled 2026-07-09; per Capital-run R-1; binds the Vision run).** Fundraising-facing narrative and projection artifacts (pitch deck, fundraising projections) → Capital. Enterprise-identity content they draw on (mission → Vision; culture → People) is cross-referenced and multi-homed as evidence (B-17), never owned or re-scored by Capital.
- **B-31 (ruled 2026-07-09; per Finance-run E-2).** Payroll split: payroll-tax compliance records and filings → Finance (FIN-07); the payroll-vendor OPERATING process (selection, owner, offboarding) → Ops (OPS-05, B-18 pattern); compensation content → People (B-25). The payroll register multi-homes as evidence (B-17).
- **B-32 (ruled 2026-07-09; Engineering run; binds every operating category, the Compliance run, and the Sec. 9E audit).** Practice-over-policy: operating categories score practice-in-use through the artifacts the work naturally produces (repo state, CI configuration, deploy history, monitoring wiring, postmortem records, restore records); SOC 2-class policy documents are never a required artifact in an operating category — they home in Compliance detection, may corroborate, and never substitute for practice evidence; their absence never renders an operating tile thin or red. Substance extraction permitted: where a scrutiny-regime control encodes real operational substance (e.g., redundancy of production data, backup restore verification), the operating category adopts the substance as an observable practice criterion, never the policy artifact. Certification status itself (SOC 2 report, ISO 27001) is a Compliance-scored artifact, cross-referenced by operating categories as corroboration (B-17).
- **B-33 (ruled 2026-07-09; AI Operations run).** AI splits (B-4/B-19 pattern): AI in the product — features, models shipped to customers, and the engineering practice that builds and runs them — → Product/Engineering (per B-4, B-16, B-19; the Engineering run's deletion of AI-tool-policy criteria stands everywhere). AI applied to business and revenue operations — GTM, support, finance ops, people ops, internal admin — → AI Operations. A customer-facing AI system that IS a business operation (e.g., a support bot): the operating loop (ownership, escalation, outcomes) → AI Operations; its build and reliability → Product/Engineering. Evidence multi-homes (B-17).

3. External-frame mapping (stress test of 2026-07-08)
Frames used: APQC PCF v8.0 (13 categories); M&A twelve-workstream canon; VC business-DD frameworks; org-design/functional canon; EOS six components; Business Model Canvas. Findings:

All external elements map into the eleven categories. APQC 1.0 (Vision & Strategy) was the orphan that produced the Vision category; APQC 13.0 (Business Capabilities) strongly corroborates Ops; APQC 11.0 groups risk/compliance/resiliency, corroborating B-5.
Reverse coverage: nine of eleven categories corroborated across multiple frame families. Capital is uncorroborated as top-level in any external frame (finance canonically subsumes it) — tier-hood is venture-context expert-authored, justified by cap-table management existing as a named discipline in the venture ecosystem. AI Operations has zero external corroboration by design (authored tier per the concept doc's stated seam).
No-direct-canon condition: no established general-purpose startup operational maturity taxonomy exists (the literature is academic-niche or IT-centric). This taxonomy's authority is therefore triangulated from adjacent frames, per RESEARCH-PROTOCOL §2A.

4. Status board
CategoryStatusNotes
Vision**landed v1** (3 subcategories: VIS-01–03) · brief at vision/BRIEF.md · B-2 (final), B-24/B-30/B-1 enforced; C-1/C-2/E-1 + internal-anchor rule in brief · two-pass
Product**landed v1** (6 subcategories: PRODUCT-01–06) · brief at product/BRIEF.md · B-14/B-15/B-16/B-17 ruled; C-n/E-n in brief
Engineering**landed v1** (8 subcategories: ENG-01–08) · brief at engineering/BRIEF.md · B-32 ruled, B-4/B-16/B-19 enforced; C-1/C-2/C-3, E-1/E-2 in brief · weakest ENG-08
GTM**landed v2, 2026-07-15** (16 subcategories: GTM-07–22; GTM-01–06 retired, IDs never reused) · brief at gtm/BRIEF.md · B-8/B-9 ruled; C-n/E-n in brief
People**landed v1** (8 subcategories: PEOPLE-01–08) · brief at people/BRIEF.md · B-24/B-25/B-26 ruled, B-10/B-21 enforced; amended v1.1 2026-07-08 (PEOPLE-08); C-n/E-n in brief
Finance**landed v1** (8 subcategories: FIN-01–08) · brief at finance/BRIEF.md · B-29/B-31 ruled; C-1/C-2/E-1 in brief; R-3 (FIN-04), sales-tax nexus (FIN-08)
Capital**landed v1** (7 subcategories: CAP-01–07) · brief at capital/BRIEF.md · B-29/B-30 ruled, B-25 enforced; R-1/R-2/R-3, C-1/C-2/C-3, E-2 in brief; mandate amended · two-pass
Legal**landed v1** (10 subcategories: LEGAL-01–10) · brief at legal/BRIEF.md · B-11/B-27 ruled, B-28 proposed (ratified v0.17); C-1/C-2, E-1/E-2/E-3 in brief; LEGAL-09/10 added by correction
Ops**landed v1** (OPS-01–07 scored + OPS-08 conditional + OPS-09 informational) · brief at ops/BRIEF.md · B-18–B-23 ruled; C-1/C-2/C-3 in brief; OPS-05 cite-check resolved (CC9.2)
AI Operations**landed v1** (AIOPS-01–05: 3 scored, 1 conditional [03], 1 informational [05]) · brief at ai-operations/BRIEF.md · B-28 ratified, B-33 ruled; C-1/C-2 + capability-premise/adoption-screen in brief · weakest AIOPS-05
Compliance**landed v1** (3 subcategories: COMP-01–03) · brief at compliance/BRIEF.md · B-18 tightened (CC9.2), B-5/B-26/B-27/B-32 enforced; E-1 KEEP, C-1/C-2 + whole-artifact-grain rule in brief · weakest COMP-03
Run queue (order; marker updated at each landing): GTM [landed] → Product [landed] → Ops [landed] → People [landed] → Legal [landed] → Capital [landed] → Finance [landed] → Vision [landed] → Engineering [landed] → AI Operations [landed] → Compliance [landed] → **§9E-a retroactive audit [NEXT]** (audit proper + normalizations + CRITERIA.yaml schema v0 draft; LIFECYCLE §7) → §9E-b (schema population) (before model v1 / classifier consumption).
5. Change log

v0.1 (2026-07-08): Initial roster (11 categories), boundary registry B-1–B-11, external-frame mapping, status board.

- **v0.2 (2026-07-08):** GTM landed (6 subcategories). B-8, B-9 ruled; B-12 (capability-not-performance), B-13 (calibration demotion; loop-ready state) added.

- **v0.3 (2026-07-08):** Product landed (6 subcategories). B-14 (design/UX fold), B-15 (retention home = GTM-06), B-16 (technical-defensibility split; binds Engineering run), B-17 (evidence multi-homing) added. Header status line corrected (had lagged at v0.1 while the change log read v0.2; header now tracks the log).

- **v0.4 (2026-07-08):** Ops landed (OPS-01–09: 8 scored, 1 conditional, 1
  informational). B-18 (vendor split), B-19 (change split), B-20 (quality
  informational), B-21 (Ops/People machinery-content line), B-22 (physical-ops
  conditional activation), B-23 (documentation-default + earned override) added; B-2
  annotated with the Ops-side stress-test result. Status-board rows updated for Ops,
  People, Engineering, Compliance.

- **v0.5 (2026-07-08):** People landed (PEOPLE-01–08: 8 subcategories; two added by operator correction — benefits & leave, handbook & HR policy set). B-24 (values home), B-25 (comp/equity People–Capital line), B-26 (employee-benefit insurance; B-5 scope clarification) added. Band-1 declaration amended: US-jurisdiction scope. Ops status-board erratum fixed (scored count seven). SOC 2 CC9.1/CC9.2 cite-check recorded verified (superseded — corrected at v0.7). Status-board rows updated for People, Ops, Vision, Capital, Compliance.

- **v0.6 (2026-07-08):** Run-queue line added to §4 (queue position is now repo state per PROTOCOL §12 v0.8). Companion: RESEARCH-PROTOCOL v0.8 same commit.

- **v0.7 (2026-07-08):** Correction: the v0.5 entry's 'SOC 2 CC9.1/CC9.2 cite-check recorded verified' was based on a session relay contradicted by the landed artifact; true history per ops/BRIEF.md §6 (landing downgrade correct; CC9.1 mischaracterization; corrected to CC9.2; re-verified in-thread 2026-07-08). Ops status-board note corrected. Companion: RESEARCH-PROTOCOL v0.9 same commit.

- **v0.8 (2026-07-08):** Supersession marker added to the v0.5 entry's corrected clause; B-18 citation-precision check recorded as owed to the Compliance run. Companion: RESEARCH-PROTOCOL v0.10 same commit.

- **v0.9 (2026-07-08):** People amended to v1.1 (corrective-action & suspension element added to PEOPLE-08 by operator direction; roster unchanged). Companion: RESEARCH-PROTOCOL v0.11 same commit.

- **v0.10 (2026-07-08):** Dead inheritance pointer removed — the Tier-1/BG brief was rejected pre-landing; Legal/Capital/Finance are fresh runs. Companion: RESEARCH-PROTOCOL v0.12 same commit.

- **v0.11 (2026-07-09):** Legal landed (LEGAL-01–10: 10 subcategories; LEGAL-09/10 added by operator correction — conduct-based exposure frame). B-11 ruled (exclusion-class placeholder rendering, both faces). B-27 (operating-law compliance split; Compliance mandate narrowed) ruled per E-3 delegation. B-28 (AI regulatory/governance split) added provisional for the AI Operations run. Legal and Compliance mandate lines amended. Status-board rows updated for Legal, Compliance, AI Operations, Finance; run-queue marker advanced to Capital. Companion: RESEARCH-PROTOCOL v0.14 same commit.

- **v0.12 (2026-07-09):** Capital landed (CAP-01–07; roster rebuilt operating-side-first after operator correction). Mandate line amended (capital strategy added; investor relations & reporting per R-2). B-29 (§6039 reporting → Finance; Capital E-1) and B-30 (hard/soft fundraising-vision split; binds Vision) ruled. Status rows updated for Capital and Finance (R-3 model-decomposition hand-off); run-queue marker advanced to Finance. Companion: RESEARCH-PROTOCOL v0.16 same commit.

- **v0.13 (2026-07-09):** Finance landed (FIN-01–08; treasury subcategory added per E-1). B-31 (payroll split) ruled. Run-queue "(completion)" vestige removed (debt recorded on the prior Finance row); marker advanced to Vision. C-1/C-2 rulings recorded in finance/BRIEF.md. Companion: RESEARCH-PROTOCOL v0.17 same commit.

- **v0.14 (2026-07-09):** Vision landed (VIS-01–03: 3 subcategories). B-2 ruled final per Vision-run delegation (three-way planning split; Vision-side stress test corroborated the boundary). B-24/B-30 enforced; internal-anchor rule confirmed by operator (fundraising-only vision content renders thin-with-annotation, never absent). C-1/C-2 arbitrations ruled; E-1 ruled (VIS-03 scored). Status-board row updated for Vision; run-queue marker advanced to Engineering. Companion: RESEARCH-PROTOCOL v0.18 same commit.

- **v0.15 (2026-07-09):** Engineering landed (ENG-01–08: 8 subcategories; v1 draft rejected at operator review as audit-shaped, v2 rescored to practice-in-use). B-32 (practice-over-policy; substance-extraction clause; certification status homes in Compliance) ruled — binds every operating category, the Compliance run, and the Sec. 9E audit. C-1/C-2/C-3 rulings recorded in engineering/BRIEF.md; E-1 dissolved; E-2 withdrawn. Status-board row updated; run-queue marker advanced to AI Operations. Companion: RESEARCH-PROTOCOL v0.19 same commit.

- **v0.16 (2026-07-09):** Lifecycle layer landed (operator-directed): LIFECYCLE.md v0.1 (thread taxonomy T-1–T-5; change classes CL-1–CL-5; amendment/refresh procedures; consumption-contract seam; canonical-home rule; Sec. 9E split into 9E-a/9E-b) + REFRESH.md v0.1 (partial register). Hygiene: gtm/GTM-01–06.md legacy files deleted (Sec. 13 conformance); ops/BRIEF.md B-2 stale pointer corrected (CL-1); Sec. 1 and Sec. 4 tables reformatted one-row-per-line (no content change). No roster or boundary changes. Companion: RESEARCH-PROTOCOL v0.20 same commit.

- **v0.17 (2026-07-09):** AI Operations landed (AIOPS-01–05: 3 scored, 1 conditional, 1 informational). B-28 ratified as written (Legal E-4 delegation closed). B-33 ruled (product-AI/ops-AI split; support-bot class divides operating-loop/build). C-1/C-2 ruled excluded from criteria (performance-review AI metrics; headcount gate — context only). AIOPS-03 conditional (B-22 pattern); AIOPS-05 informational (B-20 pattern). Category semantics rule and customer-defense purpose recorded in brief. Status-board row updated; run-queue marker advanced to Compliance. Companion: RESEARCH-PROTOCOL v0.21 + REFRESH.md AI Operations rows same commit.

- **v0.18 (2026-07-09):** Compliance landed (COMP-01–03: security assurance & certification posture; corporate risk insurance; vendor TPRM posture). E-1 ruled: category KEPT as thin detection tile (fold/drop rejected; revisit at calibration-run). Whole-artifact detection-grain rule recorded (operator ruling): certifications and policies are single detection objects; the demand instrument defines required artifacts; the model carries no control catalog. B-18 tightened "CC9-class" → "CC9.2" (cite-check owed to this run resolved VERIFIED against AICPA TSP §100 primary text, retrieved 2026-07-09). C-1 (trigger-conditional certification) and C-2 (pen test trigger-conditional) recorded in compliance/BRIEF.md. Status-board row updated; run-queue marker advanced to §9E-a. CATEGORY QUEUE COMPLETE. Companion: RESEARCH-PROTOCOL v0.22 + REFRESH.md Compliance rows same commit.

- **v0.19 (2026-07-09):** §9E-a Pass A normalization batch (CL-1; no criterion/roster/boundary changes). Status-board rows trimmed to numbered pointers (LIFECYCLE §6 canonical-home rule). Brief normalizations: people §§ to ## headings; signal labels → "Classifier signals:"; ASCII arrows → Unicode (finance/compliance/engineering); refresh markers → LIFECYCLE §4 [refresh: <trigger>]. GTM stale DRAFT header corrected (9EA-09); GTM-03/06 gained [refresh: calibration-run] stage-bar verification flags (9EA-B-GTM-02). REFRESH.md consolidated (→ v0.4). Findings 9EA-02/03/04/05/06/08/09. Companion: RESEARCH-PROTOCOL v0.23 (§13 channel-integrity line) + REFRESH v0.4 same commit.

- **v0.20 (2026-07-10):** §9E-a Pass B People — B-22 entry cross-referenced to the PEOPLE-08 workplace-safety & injury-reporting handbook element (ruled 9EA-B-PEOPLE-01; physical-footprint-conditioned, office-only → documented-n/a). No new registry number; reuses B-22/B-17/B-26 and the finding ID. Companion: people/BRIEF.md v1.2 + 9EA-STATE.md Pass B update same commit.

- **v0.21 (2026-07-15):** B-13 prerequisite IDs remapped to GTM v2 (GTM-11/12/15/22); substance unchanged (GTM v2 decomposition, operator-ruled).
