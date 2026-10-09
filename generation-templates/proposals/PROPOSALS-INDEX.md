# Template proposals — index (PROPOSED, awaiting operator ruling)

Read-only prep for the 27 artifact-sufficient red/thin backlog tiles (ref-board-003). **No
template here is authoritative.** Each file in this directory is a PROPOSED skeleton for operator
ruling. This index records the grouping re-examination (2a), the fabrication-risk flags, and the
per-type operator-ruling-point counts.

## Grouping re-examination (2a) — re-cut from the initial 8 groupings

The initial 8 groupings were a first pass. Re-reading each tile's criterion text, several
groupings mix distinct document types (a pre-sale enablement doc and a post-sale onboarding doc
are not the same artifact; a comp framework and a leave policy are not the same artifact). The
proposed re-cut is **17 document types**, below. Every re-cut carries a reason; the operator
re-cuts freely.

| # | Proposed type | Tiles | Fabrication risk | Operator-ruling points | Note |
|---|---|---|---|---|---|
| 1 | revenue-metrics *(landed v3)* | GTM-20 | low | (see live template) | Exists; not re-proposed. |
| 2 | gtm-targets-operating-model | GTM-22 | low | 4 | Targets + funnel-math model; distinct from metric *definitions* (GTM-20). |
| 3 | product-metrics | PRODUCT-05 | low | 4 | Product analytics (North-Star tree) — a different metrics family from revenue; moved OUT of the revenue group. |
| 4 | sales-enablement | GTM-16 | low | 4 | Discovery/objection/pricing — pre-sale; split from onboarding. |
| 5 | onboarding-success | GTM-18 | low | 3 | Signed-contract→first-value + success milestones — post-sale; split from enablement. |
| 6 | product-process | PRODUCT-01, PRODUCT-02 | low | 5 | Roadmap + prioritization + PRD/spec practice + decision trail. |
| 7 | pmf-assessment | PRODUCT-04 | low | 5 | An *assessment* (method + population), not a process doc — its own type. |
| 8 | operating-registers | OPS-01, OPS-04, OPS-05 | low | 6 | Ownership map + runbook set + vendor inventory. **RULING: one register-family type with three sub-artifacts, or three types?** |
| 9 | compensation-framework | PEOPLE-02 | low | 5 | Comp philosophy + leveling + bands. |
| 10 | values-operating-principles | PEOPLE-06 | low | 3 | Values artifact (multi-homes with Vision per B-24). |
| 11 | hr-policy-handbook | PEOPLE-07, PEOPLE-08 | **medium** | 5 | Leave/PTO + the five-policy HR starter set. Jurisdiction-conditional; **posted policy text is draftable, but stated legal minimums must be operator/counsel-confirmed, not asserted.** |
| 12 | legal-draftable-policies | LEGAL-09, LEGAL-10 | **medium** | 6 | Privacy policy, ToS, CAN-SPAM/ADA/TCPA posture — genuinely draftable *documents*, but legal-accuracy claims need counsel confirmation. |
| 13 | legal-records-and-forms | LEGAL-01, LEGAL-06, COMP-02 | **HIGH** | 5 | **See fabrication-risk flag below — blank-form/template-only or generation-excluded.** |
| 14 | capital-plan | CAP-01 | low | 4 | Money→milestones narrative; corpus-groundable from the burn model. |
| 15 | strategy-and-targets | VIS-02, VIS-03 | low | 6 | **Operator-content-heavy: the strategy/thesis and the long-range target are operator DECISIONS, not corpus artifacts — Ladder scaffolds the frame, the operator supplies the substance.** |
| 16 | engineering-reference-docs | ENG-01, ENG-08 | medium | 5 | Architecture overview + ADR + README/runbooks/API. **A generated README that doesn't match the real toolchain is "worse than none" (ENG-08 criterion) — must be operator-verified, not asserted.** |
| 17 | engineering-practice-evidence | ENG-03, ENG-07 | n/a | — | **MIS-CLASS FLAG: these are practice-heavy (deploy history in regular use; lockfile churn / updates flowing). A generated document cannot satisfy "the path in regular use." Likely NOT artifact-sufficient — re-examine the gap-class before authoring a template.** |

## Fabrication-risk flag — the "Legal filings & posted policies" group (2a, required)

The initial Legal group conflated three fundamentally different generation postures. Split:

- **Genuinely artifact-sufficient (draftable documents) — type 12 (legal-draftable-policies):**
  LEGAL-09 (a privacy policy and terms of service ARE documents Ladder can draft) and the posture
  documents inside LEGAL-10 (a CAN-SPAM compliance one-pager, an ADA-accessibility posture memo).
  Medium risk only because legal accuracy must be counsel-confirmed — flagged per section.

- **Blank-form / template-only or generation-excluded (HIGH fabrication risk) — type 13
  (legal-records-and-forms):**
  - **LEGAL-01** — certificate of incorporation, bylaws, EIN record, **Delaware franchise-tax /
    annual-report payment record**. These are RECORDS of events that either happened or did not; a
    generated "franchise-tax payment record" is fabrication of a legal fact. Generation is limited
    to BLANK forms / a filing checklist — never a populated record. Generalizes the LEGAL-02
    doctrine (a populated corporate record is fabrication).
  - **LEGAL-06** — **Form I-9 for every employee**, offer letters, worker-classification basis. I-9
    and executed offer letters are per-employee RECORDS — cannot be generated (fabrication). Only
    blank offer-letter / classification-analysis TEMPLATES are generable; the records are not.
  - **COMP-02** — a schedule of EXECUTED insurance policies. Ladder cannot generate insurance
    policies or a record that they were bound; only a blank policy-schedule TEMPLATE is generable.

  **RULING NEEDED:** confirm type 13 is TEMPLATE-ONLY (blank forms + checklists, LEGAL-02 doctrine
  generalized) or GENERATION-EXCLUDED entirely, per sub-tile. Proposed default: template-only
  blank forms + filing/records CHECKLISTS; never a populated record.

## Other stopped-and-flagged judgment calls (see per-type files)

- Type 8 (operating-registers): one type or three? (ownership map / runbooks / vendor inventory
  share a register shape but are distinct artifacts.)
- Type 15 (strategy-and-targets): how much may a template scaffold a strategy the operator has not
  yet decided, without manufacturing a thesis? Proposed heavy `operator` fill; flagged.
- Type 17 (engineering-practice-evidence): re-examine the gap-class — practice, not artifact — before
  authoring. Not proposed as a template here.

## Files

One skeleton per proposed type (types 2-16; type 1 is the live template, type 17 is flagged for
gap-class re-examination rather than authored). Each is headed "PROPOSED — awaiting operator
ruling" and lists sections, one-line required_content, proposed fill_mode, and the hard
per-section judgment calls needing a ruling.
