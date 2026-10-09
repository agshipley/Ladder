Decomposition Backlog

Status: v0.4 (2026-07-15) · seeded at the 9E-b first fixture-validation triage. Ruled memorialization, operator 2026-07-11.

## Design position (ruled)

**The subcategory is the verdict unit for the pilot.** A criterion is judged whole
(fidelity position §1): one state per subcategory, per run. Element-level truth — the
constitutive parts of a multi-element criterion — lives in the **condition-applied**
field of the verdict, not in a proliferation of subcategories.

**Decomposition into new subcategories is decided on real-run evidence, never
speculatively.** The trigger is a *persistently ambiguous* `thin` verdict: a subcategory
that, across real corpus runs, keeps landing thin because two genuinely distinct
capabilities are being averaged into one score — where the operator cannot act on the
thin because it does not say *which* capability is missing. That recurring, decision-
blocking ambiguity is the evidence that justifies a split. Absent it, the compression is
a feature (a compact board), not a defect.

This file is the standing backlog of *split candidates*: capabilities that MIGHT warrant
their own subcategory, the specific evidence that would justify the split, and an open
disposition. Nothing here is a scheduled change. Entries are reviewed at the calibration
run (registered in REFRESH.md as `[refresh: calibration-run]` against the named
subcategories), which is what surfaces them by the repo's own logic.

Decomposition, when it happens, is a schema change under the normal amendment discipline
(CRITERIA-SCHEMA.yaml is the sole normative copy) — never an ad-hoc board edit.

## Split candidates

### DB-1 — FIN-01: basic-books vs. P&L-model are distinct capabilities
- **Split candidate:** FIN-01 currently scores accounting-system-of-record + owned books
  + spend tracking + monthly close + stated basis as one criterion. "Do you keep clean
  basic books" and "do you run a P&L / financial model you actually manage" are arguably
  two distinct maturity capabilities — a company can have the first cold and the second
  absent, or vice-versa. (Operator-named at 9E-b triage; observed alongside the
  FIN-01/FIN-02 `evidence-found -> thin` fixture tension, where partial coverage of a
  multi-element bar collapsed to thin.)
- **Evidence that would justify the split:** real corpus runs where FIN-01 persistently
  lands `thin` AND the condition-applied consistently isolates the *same* element
  (bookkeeping present / model absent, or the reverse) — i.e. the thin is systematically
  one-sided and the operator cannot act on it without knowing which side.
- **ref-board-002 element evidence (2026-07-13):** FIN-01 rollup `thin`, spread ✅✅🟠🟠🔴 —
  bookkeeping/ownership satisfied while close-discipline and stated-basis are thin/absent (see
  the Element-grain digest below). One run does not meet the "persistent, one-sided" bar; the
  spread is consistent with the split hypothesis but DB-1 stays OPEN pending repeat runs.
- **Disposition:** OPEN. No split until real-run evidence meets the bar above.

### DB-2 — GTM-03 / GTM-04: a mature sales motion has dozens of constitutive parts
- **Split candidate:** GTM-03 (pipeline system-of-record) and GTM-04 (talk-track /
  motion) compress what a mature go-to-market function realizes as dozens of distinct
  parts (ICP definition, qualification framework, stage exit criteria, forecasting
  discipline, call-recording/coaching loop, scheduler, CRM hygiene, ...) into two
  subcategories. The compression is deliberate (a Band-1 board is not a RevOps audit),
  but it is the most-compressed region of the model and the likeliest source of
  ambiguous thin verdicts once real GTM corpora run.
- **Evidence that would justify the split:** real-run `thin` verdicts on GTM-03/04 whose
  condition-applied repeatedly names different constitutive parts as the missing one —
  signalling that a single score cannot carry the motion's maturity and the operator
  needs part-level resolution to act. (Related: the existing GTM-03/06 six-element
  stage-bar verification rows already registered `[refresh: calibration-run]`.)
- **ref-board-002 element evidence (2026-07-13):** GTM-03 rollup `thin`, spread ✅✅✅🟠🟠🟠
  (system-of-record / qualification / scheduling thin); GTM-04 rollup `thin`, spread 🔴🟠🟠🟠🟠🔴
  (talk-track and win/loss absent). Both compress many constitutive parts; the per-element
  spreads (Element-grain digest below) are the part-level resolution the split would formalize.
  One run; DB-2 stays OPEN pending repeat-run consistency.
- **Disposition:** CLOSED (2026-07-15): resolved by operator adjudication of
  ref-board-002 (all five GTM grain-disputes, one cause); landed as GTM-07..22.

### DB-3 — FIN-06 / FIN-08: consolidation candidate
- Direction: MERGE (4b, consolidation). Operator observation at
  ref-board-002 adjudication (2026-07-15): FIN-08's scope reads
  as a FIN-06 element; both resolve to the same delegation-evidence
  test at Band 1.
- Evidence bar: repeat-run consistency (same as DB-2's bar) — one
  run's observation does not consolidate a tile.
- Disposition: OPEN.

## Change log
- v0.1 (2026-07-11): Created at 9E-b first-fixture-validation triage; design position
  ruled (operator 2026-07-11); seeded DB-1 (FIN-01) and DB-2 (GTM-03/04). Registered in
  REFRESH.md (FIN-01, GTM-03/04 `[refresh: calibration-run]`). Pointer in 9EA-STATE.md.
- v0.2 (2026-07-13): ref-board-002 (first element-grain run) element evidence appended for
  DB-1/DB-2 + every 4+-element subcategory (Element-grain digest below). Dispositions stay
  OPEN — one run is not the "persistent, one-sided" bar; this is the first data point.
- v0.3 (2026-07-15): DB-3 added (FIN-06/FIN-08 consolidation
  candidate, operator observation at board-002 adjudication).
- v0.4 (2026-07-15): DB-2 closed (GTM v2 landed).

---

## Element-grain digest — ref-board-002 (2026-07-13)

First run under the element-grain output contract. Per-element states below are the judge's element_findings (echoed labels), the decomposition-backlog evidence: a subcategory that repeatedly splits into a satisfied cluster and an unevidenced cluster is a split candidate. DB-1 = FIN-01; DB-2 = GTM-03/04.

### AIOPS-01 — rollup **thin** (4 elements)

| element | state |
|---|---|
| AI tools in business/revenue-ops use via the traces use naturally leaves | 🟠 thin |
| a reconstructible footprint via a lightweight inventory-class artifact | 🔴 absent |
| AI-use inventory | 🔴 absent |
| owner attribution for material uses | 🟠 thin |

### CAP-01 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A written capital plan exists connecting money to milestones | 🟠 thin |
| The plan evidences solvency awareness | 🟠 thin |
| Dilution planning exists at decision points | 🟠 thin |
| Instrument-selection reasoning is recorded when the company chooses SAFE vs priced vs debt | 🔴 absent |

### CAP-03 — rollup **thin** (5 elements)

| element | state |
|---|---|
| The equity incentive plan exists with board and stockholder approvals and form agreements | ✅ satisfied |
| A grant ledger reconciles grants to the plan reserve and to authorizing consents | 🟠 thin |
| An 83 | 🟠 thin |
| Exercise records are maintained within the grant ledger | 🟠 thin |
| Any equity loans to employees/directors documented | 🔴 absent |

### CAP-07 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A relationship record exists | 🟠 thin |
| An update practice exists and runs | 🟠 thin |
| Contractual deliverables | 🟠 thin |
| Board vs investor communication split documented at the level of a sentence | 🔴 absent |

### COMP-01 — rollup **evidence-found** (4 elements)

| element | state |
|---|---|
| Attestation artifacts | ✅ satisfied |
| Review-response record | 🟠 thin |
| Demanded-artifact match | 🟠 thin |
| above.] | 🔴 absent |

### COMP-02 — rollup **thin** (4 elements)

| element | state |
|---|---|
| Policy schedule exists | 🟠 thin |
| Trigger match | 🟠 thin |
| Currency | 🟠 thin |
| COI capability | 🔴 absent |

### ENG-01 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A current architecture overview a senior outside engineer can navigate the system from | 🟠 thin |
| Significant decisions carry recoverable rationale | 🔴 absent |
| The team can enumerate its deliberate shortcuts | 🔴 absent |
| Where the corpus holds a defensibility thesis | 🔴 absent |

### ENG-02 — rollup **evidence-found** (5 elements)

| element | state |
|---|---|
| Product code in version control, history intact, protected mainline | ✅ satisfied |
| Review in use | ✅ satisfied |
| Tests exist, run in CI on every change, and are trusted | ✅ satisfied |
| Integration convention evidenced by repo history itself | 🟠 thin |
| No secrets in the repository | 🔴 absent |

### ENG-03 — rollup **thin** (4 elements)

| element | state |
|---|---|
| The pipeline gates merges | ✅ satisfied |
| Deploys automated or fully scripted; deploy history shows the path in regular use | 🟠 thin |
| Rollback is a demonstrated capability | 🟠 thin |
| One path | 🟠 thin |

### ENG-04 — rollup **evidence-found** (4 elements)

| element | state |
|---|---|
| Failures reach a human | ✅ satisfied |
| A named reachable responder | ✅ satisfied |
| Incidents leave traces | ✅ satisfied |
| Where executed customer contracts promise availability | 🔴 absent |

### ENG-05 — rollup **thin** (4 elements)

| element | state |
|---|---|
| The environment is reconstructible | 🟠 thin |
| Production secrets live in a runtime secrets mechanism, not hand-managed files | 🟠 thin |
| A staging environment exists once real customers are served | 🔴 absent |
| Where load exists, the current bottleneck shows up in the team's own issues/docs; pre-load | 🔴 absent |

### ENG-06 — rollup **evidence-found** (4 elements)

| element | state |
|---|---|
| Data stores and flows identifiable from the system's own artifacts | ✅ satisfied |
| Backups automated; configuration is the evidence | ✅ satisfied |
| Redundancy substance | ✅ satisfied |
| Restorability verified | ✅ satisfied |

### ENG-07 — rollup **thin** (4 elements)

| element | state |
|---|---|
| Manifests with committed lockfiles | 🟠 thin |
| Updates flowing | 🟠 thin |
| Known-vulnerability response observable in the same stream | 🔴 absent |
| A license-bearing inventory of shipped components is producible from the manifests | 🟠 thin |

### ENG-08 — rollup **thin** (5 elements)

| element | state |
|---|---|
| Setup documentation that works | 🟠 thin |
| Deploy/incident runbooks multi-home from ENG-03/04 | 🔴 absent |
| Conditional | 🔴 absent |
| Contributor concentration | 🔴 absent |
| rests on demand-side convergence | 🔴 absent |

### FIN-01 *(DB-1)* — rollup **thin** (5 elements)

| element | state |
|---|---|
| an accounting system of record is set up and live | 🟠 thin |
| someone owns the books | ✅ satisfied |
| expenditures are tracked as they happen | ✅ satisfied |
| books are reconciled and closed monthly | 🟠 thin |
| the basis of accounting is stated and consistent | 🔴 absent |

### FIN-02 — rollup **genuine-absence** (5 elements)

| element | state |
|---|---|
| the P&L, balance sheet, and cash position come out of the system on a defined cadence | 🔴 absent |
| someone actually reviews them | 🔴 absent |
| a reporting pack in a consistent format goes to board/investors at least quarterly | 🔴 absent |
| headcount-vs-plan is a pack element | 🔴 absent |
| where an executed IRA imposes deliverables, production capability matches the covenant | 🔴 absent |

### FIN-05 — rollup **thin** (4 elements)

| element | state |
|---|---|
| a bank-account inventory exists with the FDIC-insurance posture of each balance stated | 🟠 thin |
| a cash-management/investment policy exists | 🔴 absent |
| a cash forecast runs on a defined cadence | 🔴 absent |
| concentration risk is addressed | 🟠 thin |

### FIN-06 — rollup **thin** (6 elements)

| element | state |
|---|---|
| a tax preparer / CPA firm is engaged and a named internal owner exists for the relationshi | 🟠 thin |
| filings are current | 🟠 thin |
| the compliance calendar exists or is demonstrably delegated to the engaged firm | 🔴 absent |
| the R&D-credit question has been answered | 🔴 absent |
| the Sec | 🔴 absent |
| Form 5471 conditional on foreign-corporation ownership; documented n/a otherwise | 🔴 absent |

### FIN-07 — rollup **thin** (6 elements)

| element | state |
|---|---|
| a payroll provider is set up | ✅ satisfied |
| contractor payments route through a system that produces 1099s | 🟠 thin |
| ISO-exercise reporting capability exists | 🔴 absent |
| if the Sec | 🔴 absent |
| payroll election was made, the credit is actually flowing through the payroll provider | 🔴 absent |
| ACA information filings conditional on ALE status; documented n/a below threshold | 🔴 absent |

### GTM-01 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A documented ICP | ✅ satisfied |
| A positioning thesis covering Dunford's five components in some written form | 🟠 thin |
| Market sizing and competitive view | 🟠 thin |
| Evidence the ICP is *derived*, not asserted | 🟠 thin |

### GTM-02 — rollup **evidence-found** (4 elements)

| element | state |
|---|---|
| Messaging assets exist and cohere with GTM-01 | ✅ satisfied |
| A documented demand motion | ✅ satisfied |
| Lead handling is defined | ✅ satisfied |
| Not required at Band 1, and affirmatively not gaps | ✅ satisfied |

### GTM-03 *(DB-2)* — rollup **thin** (6 elements)

| element | state |
|---|---|
| A single system of record for the pipeline | 🟠 thin |
| Evidence-based stage definitions | ✅ satisfied |
| A named qualification discipline | 🟠 thin |
| Scheduling infrastructure | 🟠 thin |
| The documented sales motion | ✅ satisfied |
| Forecast/commit discipline appropriate to stage | ✅ satisfied |

### GTM-04 *(DB-2)* — rollup **thin** (6 elements)

| element | state |
|---|---|
| A talk track / sales narrative | 🔴 absent |
| Objection handling | 🟠 thin |
| Discovery guide | 🟠 thin |
| Pricing documentation | 🟠 thin |
| Form customer agreement and order templates | 🟠 thin |
| Win/loss capture | 🔴 absent |

### GTM-05 — rollup **thin** (5 elements)

| element | state |
|---|---|
| A documented onboarding sequence | 🟠 thin |
| Defined success milestones | 🔴 absent |
| Churn and churn-reason capture | 🔴 absent |
| Founder-led CS is the compliant Band 1 state | 🟠 thin |
| Support handling defined | 🟠 thin |

### GTM-06 — rollup **thin** (6 elements)

| element | state |
|---|---|
| A metrics definitions document | 🔴 absent |
| The canonical KPI set tracked on a cadence | 🟠 thin |
| Targets segmented | 🟠 thin |
| The funnel-math operating model | 🟠 thin |
| Repeatability evidence | 🔴 absent |
| Benchmark values are context, never criteria | 🔴 absent |

### LEGAL-01 — rollup **thin** (10 elements)

| element | state |
|---|---|
| Certificate of incorporation, as currently amended/restated, present and matching the last | ✅ satisfied |
| bylaws present | ✅ satisfied |
| EIN record present | ✅ satisfied |
| Delaware annual report + franchise tax current | 🔴 absent |
| foreign qualification records for each state where the company has an office or W-2 employ | 🔴 absent |
| industry licensure record | 🟠 thin |
| federal ownership disclosure | 🔴 absent |
| a current Delaware registered-agent record | 🔴 absent |
| director indemnification agreements | 🟠 thin |
| assumed-name/DBA filings where the company operates under a name other than its legal name | 🔴 absent |

### LEGAL-02 — rollup **genuine-absence** (4 elements)

| element | state |
|---|---|
| A board action record | 🔴 absent |
| stockholder consents where DGCL requires stockholder action | 🔴 absent |
| consents carry their referenced exhibits | 🔴 absent |
| a single organized record system | 🔴 absent |

### LEGAL-05 — rollup **evidence-found** (5 elements)

| element | state |
|---|---|
| A PIIA/CIIA | ✅ satisfied |
| founder pre-formation IP assignment | 🟠 thin |
| registrations *if any* | ✅ satisfied |
| where an employee works in a state with an invention-assignment carve-out statute, the PII | ✅ satisfied |
| open-source and third-party license paperwork only where the corpus shows distribution obl | ✅ satisfied |

### LEGAL-06 — rollup **thin** (9 elements)

| element | state |
|---|---|
| Executed offer letter or employment agreement for every W-2 employee | ✅ satisfied |
| a completed, retained Form I-9 for every employee | 🔴 absent |
| executed contractor agreement for every 1099 contractor | ✅ satisfied |
| a worker-classification record | 🔴 absent |
| jurisdiction-conditioned statutory compliance | 🔴 absent |
| restrictive-covenant hygiene | 🟠 thin |
| contractor IP capture | ✅ satisfied |
| immigration sponsorship records | 🔴 absent |
| People-side criteria reference this subcategory generically for jurisdiction detail | 🔴 absent |

### LEGAL-07 — rollup **thin** (4 elements)

| element | state |
|---|---|
| Fully-executed | ✅ satisfied |
| executed vendor agreements material to operations, including benefit-carrier contracts | 🟠 thin |
| amendments and order forms attached to their parent agreements | 🟠 thin |
| executed DPAs are inventoried here as contracts but scored in LEGAL-09 | 🔴 absent |

### LEGAL-09 — rollup **thin** (9 elements)

| element | state |
|---|---|
| A posted, conspicuous privacy policy on the company's website/app | 🔴 absent |
| posted terms of service | 🔴 absent |
| a data-processing inventory | ✅ satisfied |
| a state-privacy-law applicability assessment | 🟠 thin |
| breach-notification readiness | 🔴 absent |
| executed DPAs | ✅ satisfied |
| sector-conditioned regimes | ✅ satisfied |
| an AI-regulatory applicability assessment | 🔴 absent |
| trade-controls applicability | 🟠 thin |

### LEGAL-10 — rollup **genuine-absence** (4 elements)

| element | state |
|---|---|
| CAN-SPAM mechanics | 🔴 absent |
| an ADA website-accessibility posture record | 🔴 absent |
| TCPA awareness record | 🔴 absent |
| marketing-claims discipline | 🔴 absent |

### PEOPLE-02 — rollup **genuine-absence** (4 elements)

| element | state |
|---|---|
| An articulated compensation philosophy | 🔴 absent |
| a leveling framework | 🔴 absent |
| salary and equity bands tied to levels | 🟠 thin |
| consistent application | 🔴 absent |

### PEOPLE-07 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A written leave/PTO policy | 🟠 thin |
| A documented benefits program | ✅ satisfied |
| Pre-hire communicability | 🔴 absent |
| Policy-instrument consistency | 🔴 absent |

### PRODUCT-01 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A product roadmap artifact exists and is discoverable | ✅ satisfied |
| Roadmap items trace to intended outcomes or customer problems, not only outputs | 🟠 thin |
| A stated prioritization method governs roadmap composition | 🟠 thin |
| The roadmap is dated/versioned and recognizably current; a long-stale roadmap is a thinnes | 🟠 thin |

### PRODUCT-02 — rollup **thin** (4 elements)

| element | state |
|---|---|
| A repeatable spec/PRD practice exists | 🟠 thin |
| A discovery→delivery distinction is documented or observable | 🔴 absent |
| Product decisions leave a trail | 🟠 thin |
| Design/UX evidence homes here and in PRODUCT-03 | 🔴 absent |

### PRODUCT-04 — rollup **genuine-absence** (4 elements)

| element | state |
|---|---|
| A PMF assessment exists with a defined, honest methodology | 🔴 absent |
| Any reported figure is honestly bounded | 🔴 absent |
| Segmentation is present or acknowledged where an aggregate would mislead | 🔴 absent |
| Retention | 🟠 thin |

### PRODUCT-06 — rollup **evidence-found** (4 elements)

| element | state |
|---|---|
| A product strategy artifact exists at the operational horizon | ✅ satisfied |
| A defensibility thesis is articulated and honestly reasoned | 🟠 thin |
| IP-moat *strategy* homes here; IP legal paperwork → Legal | ✅ satisfied |
| Pricing/packaging | ✅ satisfied |

### VIS-02 — rollup **thin** (4 elements)

| element | state |
|---|---|
| An enterprise-scoped, long-horizon | 🟠 thin |
| Scope discipline per B-1 | ✅ satisfied |
| Use per B-23's posture | 🔴 absent |
| Seams enforced, never re-scored | ✅ satisfied |

