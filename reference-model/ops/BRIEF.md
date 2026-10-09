# Ops — Category Brief (v1, landed 2026-07-08)

**Category:** Ops — the company's operating machinery
**Band declared:** Band 1 — seed-funded B2B SaaS/infra, pre-Series A (reference-corpus-calibrated)
**Research run:** 2026-07-08 · All sources retrieved 2026-07-08
**Status:** Landed v1. All conflicts and elevations ruled by operator 2026-07-08.
**Governing docs at landing:** RESEARCH-PROTOCOL.md v0.5, TAXONOMY.md v0.4 (this commit)
**Revision history:** v1 draft was compliance-anchored (operator-corrected mid-run; see
protocol §10); v2 re-anchored on the operator/COO canon and expanded the subcategory
set; v3 (this landed text) added two operator lineages, the published-handbook genre
discovery, the C-3 conflict and ruling, and one bounded academic-empirical row.

## Ruling log (operator, 2026-07-08)
- C-1 (cadence idioms): score existence of a documented cadence + recurring review
  artifact; all framework numbers are dated context annotations (B-12). Extended to
  cover Amazon's explicit OKR rejection.
- C-2 (1:1 specifics): same pattern — practice existence evidenced; specifics context.
- C-3 (mechanisms vs talent-density): documentation-default at Band 1; deliberate-lean
  override EARNED via philosophy artifact + evidenced substitute machinery, never
  asserted; menu offered in generation, not diagnosis. Recorded as TAXONOMY B-23.
- E-1 (vendor split): operating process → Ops; TPRM security-risk posture → Compliance;
  inventory multi-homes (B-17). Recorded as B-18. Binds Compliance run.
- E-2 (change split): process → Ops; technical change control → Engineering; SOC-2
  detection → Compliance. Recorded as B-19. Binds Engineering run.
- E-3 (quality): OPS-09 informational-only at Band 1; promotable on corpus evidence.
  Recorded as B-20.
- E-4 (Ops/People line): machinery (1:1 existence, review cycle, meeting architecture,
  ownership map) → Ops; practice content (evaluation approach, comp philosophy, org
  design) → People. Recorded as B-21. Binds People run.
- E-5 (physical ops): first-class conditional subcategory; physical footprint activates,
  pure SaaS renders documented-n/a, never red. Recorded as B-22.
- 9EA-B-OPS-06 (device-inventory finding, 2026-07-11): OPS-06 carries a lightweight
  always-on device/asset-inventory element — a record of who holds what company
  hardware, issued when. A simple list satisfies at Band 1; MDM/asset-management
  tooling is annotation-only (401(k) treatment). Absence of this basic operating
  record renders thin on the element (review doctrine: a missing basic operating
  record is thin). Compliance references it per B-17 multi-homing (as COMP-03
  references OPS-05), never re-scored. Bumped OPS-06 to v1.1.

## 0. Derivation notes
**No-direct-canon condition:** no established general-purpose taxonomy of startup
operational maturity exists; this category is constructed by triangulation (protocol
§2A) across six independent operator lineages, standards bodies, demand-side lists,
a model-document-set genre, and one empirical row — the densest triangulation in the
roster, matching Ops's role as the Maturity layer's largest category and the Leverage
layer's primary input.

**Regime weighting:** the operator/COO discipline regime is PRIMARY (it owns the
category's essence); buyer-security/audit scrutiny corroborates the audit-visible
slice; operational due diligence is a later-band regime, noted not load-bearing.
Rationale: Sprint L automates processes; the Ops model must map the operational piping
the way a COO decomposes it, because that inventory — not the auditable slice — is what
the AE layer analyzes for enhancement/automation candidates.

**Genre ladder result:** the primary/statutory rung is absent by nature — no body owns
operational maturity, so NO Ops criterion is unconditional. The model-document-set rung
EXISTS in a non-form shape: the published company handbook (GitLab anchor; protocol §2
note, this commit). The named-practitioner operator canon is the load-bearing rung by
design. One bounded academic-empirical row (a genre this domain offers that the
Business-tier worked example did not).

## 1. Method note
Capability-not-performance throughout (B-12): every framework number in this brief
(weekly 1:1s, 90-minute meetings, 3–7 Rocks, 6-page narratives, weekly WBR) is a dated
context annotation, never a scored threshold. Cross-reference rule (§3.2) met per
subcategory or explicitly downgraded (§6). [Sprint-L prereq] marks criteria that are
Leverage-layer prerequisites (§9C downstream tracing). Independence per §3.3: sources
descending from one root are counted as one lineage with corroborators.

## 2. Authority set

### Named-practitioner operator canon — six independent lineages
- LINEAGE G — Grove/Intel. Andrew Grove, High Output Management (1983, rev. 1995,
  Vintage; canonized by Horowitz foreword, Andreessen, Collison, Zuckerberg). The
  meeting taxonomy: process-oriented (1:1s — regular cadence, report's agenda, ~hour;
  staff meetings; operation reviews) vs mission-oriented (ad hoc decision); output vs
  activity indicators; management-as-production. G-lineage corroborators (counted with
  Grove, not independent): Doerr, Measure What Matters / OKR (quarterly objectives +
  weekly/biweekly check-ins + annual layer; documented root: Drucker's MBO per
  whatmatters.com history, retrieved 2026-07-08); Mochary, The Great CEO Within
  (weekly 1:1s, exec meeting ~6–10, all-hands weekly–monthly, quarterly planning, top
  5–6 KPIs visible; cites Grove explicitly).
- LINEAGE W — Wickman/EOS. Traction (current). Six components; Accountability Chart
  (structure distinct from org chart; each seat's roles); Rocks (3–7/90d); Level 10
  Meeting (weekly 90-min); Scorecard (5–15); Meeting Pulse; documented core processes.
- LINEAGE H — Hughes Johnson/Google→Stripe. Scaling People (Stripe Press, 2023;
  Bloomberg/Economist best-of-2023; author was Stripe COO 2014–21, ~200→8,000
  employees; scope incl. biz ops, sales, support, risk, real estate, people functions).
  The company operating system — "norms and actions shared with everyone… keystones
  like an annual plan, quarterly goals, and regular communications" — run on an
  operating cadence, with strategy, accountability, and communication subsystems;
  founding documents; the formal review process; 100+ pages of operating templates.
- LINEAGE A — Apple DRI. Publicly documented practice (Forbes practitioner account
  2012; Kocienda on the original iPhone; per-agenda-item DRIs). Generalized in
  consulting canon as RACI's single-Accountable rule; adopted verbatim by GitLab
  ("every project is assigned a DRI") and HubSpot.
- LINEAGE B — Bezos/Amazon. Bryar & Carr, Working Backwards (St. Martin's, 2021;
  27 combined Amazon-leadership years incl. Bryar as Bezos's chief of staff). The
  mechanism doctrine ("Good intentions don't work. Mechanisms do."); single-threaded
  leader (STL) — independent convergence on single-owner accountability; Weekly
  Business Review (WBR) on DMAIC, centered on controllable input metrics over output
  metrics; OP1/OP2 annual planning; six-page narratives in place of decks. Amazon
  explicitly rejects OKRs (flat goal lists, single owner, pass/fail) — load-bearing
  for C-1: the canon converges on documented goal cadence with owners and review while
  diverging freely on idiom.
- LINEAGE N — Netflix/Hastings & Meyer (the deliberate counter-canon). No Rules Rules
  (Penguin Press, 2020; Meyer is an INSEAD professor). Context-not-control: build
  talent density, increase candor, then remove controls — "people over process,
  innovation over efficiency." Arbitrable because (1) Hastings states his own
  conditions (innovation-goal, high talent density, loosely coupled systems) and his
  own SEQUENCING (controls removed after talent density is built — a later-stage
  earned state), and (2) Netflix's freedom is deliberately designed and documented
  (culture memo, explicit team parameters, QBRs as context-distribution). See C-3.
- Cross-lineage synthesis corroborator (not an independent lineage): Elad Gil, High
  Growth Handbook (Stripe Press, 2018) — operator-authored synthesis; interview set
  (Rabois, Hughes Johnson, Collison, Altman, Hoffman, Andreessen, Naval) documents
  cross-lineage convergence on org process and executive operating practice.
- Named as further corroborators, not relied upon (no criterion rests on them):
  Horowitz, The Hard Thing About Hard Things; Slootman, Amp It Up; Dalio, Principles;
  the First Round Review essay archive. Stated per §5's no-silent-drop rule.

Six-lineage convergence: every load-bearing Ops concept carries ≥3 independent
lineages — single-owner accountability (A: DRI; B: STL; W: Accountability Chart; H:
accountability subsystem), documented goal cadence with review (G: OKR; W: Rocks/
Scorecard; B: OP1+WBR; H: annual plan/quarterly goals), meeting architecture (G; W;
B; H; Mochary instantiation), documented process (W: EOS Process; B: mechanisms;
GitLab: handbook-first) — with N as the bounded counter-position. This is the
practitioner genre's maximum attainable corroboration; it cannot produce unconditional
criteria and this brief does not pretend it does.

### Model-document-set rung (genre discovery, this run)
The GitLab Handbook — living document, handbook.gitlab.com, retrieved 2026-07-08;
2,000+ printed pages; the company's actual single source of truth ("handbook-first");
maintained via git merge-request workflow; peer-review-corroborated as an org-design
instance (Journal of Organization Design, 2020). Establishes the existence proof and
reference shape of a complete operating documentation set: DRI ownership, documented
meeting/async practice (the canonical documented standup replacement), IT/access,
vendor, and onboarding processes as maintained pages. Weight-marked: a model INSTANCE,
never a scored norm. Genre confirmed by other public operating docs (Basecamp/
37signals, PostHog, Sourcegraph; the Netflix Culture Memo as ancestor).

### Standards-body analog rung (corroborating)
APQC PCF v8.0 (current per APQC FAQ; 13.0 Develop & Manage Business Capabilities →
processes/capabilities; 8.0 Manage IT → internal IT; 10.0 Manage Assets → physical
ops) · ITIL 4 (2019 ed., 34 practices; change enablement; service request mgmt
covering access permissions) · ISO 9001:2015 (current; ISO 9001:2026 at FDIS,
publication expected Sept 2026, 3-yr transition — [refresh: date:2026-09];
detection-level vocabulary only) · PMBOK 7 (2021, 12 principles/8 domains; 8th ed.
emerging) / PRINCE2 7 (2023) — define the heavyweight forms Band-1 practice is a
subset of; neither required at Band 1.

### Demand-side rung (corroborating)
AICPA SOC 2 Trust Services Criteria (2017, rev. 2022 points of focus) — vendor/
third-party risk and change-management scrutiny structure. Cite-check record: see §6.
Seed-stage SOC-2 practitioner convergence (Vanta/Comp/Sprinto/Secureleap-class) —
content-marketing grade, usable as convergence only, weight-marked.

### Academic/empirical rung (one row, deliberately bounded)
Bloom & Van Reenen, "Measuring and Explaining Management Practices Across Firms and
Countries," QJE 122(4) 2007; extended by the World Management Survey program (Scur,
Sadun, Van Reenen, Lemos & Bloom, Oxford Rev. Econ. Policy 2021 / NBER WP 28524).
Peer-reviewed evidence that structured management practices — monitoring/process,
target-setting, people management — robustly predict firm productivity, profitability,
growth, and survival across firms and countries. Maps onto OPS-02/04 (monitoring/
review), OPS-03 (target-setting), and the People-adjacent incentive dimension. The
only category in the roster whose machinery carries an empirical performance
literature. Weight-marked medium: validates THAT the machinery matters, never WHICH
idiom a company must use (B-12-consistent).

## 3. Subcategories — eight scored, one conditional, one informational

### OPS-01 — Ownership & accountability map ("who owns what") [Sprint-L prereq]
Provenance: authority-backed — five independent lineages (EOS Accountability Chart;
Apple DRI; Hughes Johnson accountability subsystem; Amazon single-threaded leader;
GitLab DRI-per-project practice).
Normative criterion text: CRITERIA.yaml `OPS-01` (as of v1.0)
Classifier signals: accountability chart; DRI/owner register; "single-threaded owner/
leader" vocabulary; RACI matrices; owners columns in planning docs; org pages listing
function → owner; meeting agendas with per-item owners.
Boundary (B-21): the ownership map (function → owner, an operating artifact) is Ops;
the org chart / org design (reporting structure, team shape) is People.
Not required and affirmatively not a gap at Band 1: formal RACI coverage of routine
work; job-architecture leveling frameworks; a delegation-of-authority policy.

### OPS-02 — Management operating rhythm (meeting architecture & internal communication)
Provenance: authority-backed (Grove taxonomy; Mochary instantiation; EOS Meeting
Pulse/Level 10; Hughes Johnson communication subsystem; Amazon WBR & narratives;
GitLab async practice as the documented-replacement existence proof; WMS monitoring
dimension).
Normative criterion text: CRITERIA.yaml `OPS-02` (as of v1.0)
Classifier signals: recurring meeting agendas/notes (1:1 templates, leadership-meeting
notes, standup/async check-in records); WBR-style metrics-review docs; all-hands decks
or recordings; a how-we-meet/meeting-cadence page; written weekly updates/snippets;
narrative-memo artifacts.
Boundary (B-21): existence and structure of 1:1s and the review CYCLE (that reviews
happen, on a cadence, with a defined process) → Ops; evaluation content and practice
(how people are assessed, comp philosophy, feedback quality) → People. Evidence
multi-homes with People (B-17).
Not required and affirmatively not a gap at Band 1: operation reviews (a scale
artifact); skip-levels; formal office hours; any specific meeting frequency.

### OPS-03 — Goal-setting & review cadence
Provenance: authority-backed (upgraded from expert-authored at v3): four practitioner
lineages (G: OKR; W: Rocks/Scorecard; H: annual plan + quarterly goals; B: OP1/OP2 +
single-owner goals + WBR) plus the WMS target-setting dimension (academic rung) plus
the lineage's documented Drucker-MBO root — genre-diverse per §5. Idiom-level numbers
remain practitioner-only context annotations. Boundary: B-2 (ruled 2026-07-09; TAXONOMY Sec. 2)
— Ops owns the machinery; Vision owns strategic content; Finance owns the financial
plan. Ops-side stress test passed with third-lineage corroboration (Hughes Johnson's
OS definition independently separates cadence norms from strategy content); final
ruling stays with the Vision run; plan artifacts multi-home (B-17).
Normative criterion text: CRITERIA.yaml `OPS-03` (as of v1.0)
Classifier signals: OKR/Rocks/flat-goal-list docs; annual plan; scorecard/KPI review
sheets; quarterly-planning artifacts; V/TO (Vision/Traction Organizer) or equivalent.
Not required and affirmatively not a gap at Band 1: cascaded org-wide OKRs; a
goal-management platform; formal individual performance-goal trees.

### OPS-04 — Documented core processes [Sprint-L prereq]
Provenance: authority-backed (APQC 13.0; EOS Process; Hughes Johnson founding-docs/OS
norms; Amazon mechanism doctrine — the canon's sharpest statement of why this tile
exists; GitLab handbook-first as the complete-case reference shape; WMS monitoring/
process dimension).
Normative criterion text: CRITERIA.yaml `OPS-04` (as of v1.0)
Classifier signals: runbooks/SOPs/playbooks; a process index or handbook; ownership +
last-updated metadata; operational wiki pages; operating philosophy / culture memo /
how-we-work doc; explicit context-setting artifacts / stated team parameters (per
B-23 override test).
Not required and affirmatively not a gap at Band 1: exhaustive APQC-mapped coverage;
a BPMN (business-process-modeling-notation formal flowchart) library; a documented
process for every function. Per B-23, an evidenced deliberate-lean posture is
complete-with-annotation; UNDESIGNED absence is thin/absent per the documentation
default.

### OPS-05 — Vendor & procurement management (full lifecycle)
Provenance: authority-backed — SOC 2 CC9.2 (vendor and business partner risk management) verified in research thread 2026-07-08 against AICPA TSP Section 100, 2017 Trust Services Criteria (Revised Points of Focus — 2022); see the §6 resolution trail. +
seed-stage practitioner convergence + operator canon on vendor/spend ownership.
Boundaries: B-18 (ruled) — vendor OPERATING process → Ops; TPRM (third-party risk
management: security questionnaires, continuous monitoring, risk scoring) posture →
Compliance; the vendor inventory is multi-homed evidence (B-17). B-9 analog: EXECUTED
vendor contracts are Legal's record; the relationship and process are Ops. B-6/B-22:
physical-supplier criticality feeds OPS-08 when active.
Normative criterion text: CRITERIA.yaml `OPS-05` (as of v1.0)
Classifier signals: vendor/subprocessor register; procurement or vendor policy;
intake/approval records; renewal calendar or review notes; contract-owner lists (the
executed contracts themselves cite to Legal's record).
Not required and affirmatively not a gap at Band 1: TPRM platforms; security-rating
tooling; a procurement department; competitive-bid policies.

### OPS-06 — Internal tooling, IT & access management
Provenance: authority-backed (ITIL 4; APQC 8.0 Manage IT; convergent SOC-2 practitioner
canon). Boundary: B-4 — internal tooling/IT/access → Ops; product infrastructure →
Engineering, even where the same tool appears in both (multi-homed, B-17).
Normative criterion text: CRITERIA.yaml `OPS-06` (as of v1.1)
Classifier signals: SaaS/tool inventory or register; IT/access policy; onboarding/
offboarding checklist with access steps; SSO/identity-provider config references;
least-privilege or RBAC (role-based access control) language.
Not required and affirmatively not a gap at Band 1: a formal ITIL/ITSM implementation;
a dedicated service desk; a CMDB (configuration-management database — a formal
inventory of IT assets and their relationships).

### OPS-07 — Project & change management
Provenance: authority-backed for the practice's existence (ITIL 4 change enablement +
SOC-2 change-management practitioner canon); the Band-1 lightweight threshold is an
expert-authored calibration (PMBOK 7/PRINCE2 7 describe the heavyweight forms that are
not required at the band). Boundary: B-19 (ruled) — change-management operating
process → Ops; technical change control (CI/CD gating, deploy automation) →
Engineering; the SOC-2 change-management control → Compliance detection. Evidence
multi-homes (B-17).
Normative criterion text: CRITERIA.yaml `OPS-07` (as of v1.0)
Classifier signals: change log / RFC (request-for-change) records; deploy/release
records with reviewer + timestamp; a change-management policy; project tracker/board;
incident-linked change records.
Not required and affirmatively not a gap at Band 1: a formal PMBOK/PRINCE2 methodology;
a change-advisory board; documented SDLC (software-development-lifecycle) governance.

### OPS-08 — Physical operations (supply chain, real property, facilities, assets) — CONDITIONAL
Provenance: expert-authored, with APQC corroboration for the decomposition (10.0
Manage Assets; 4.0 Deliver Physical Products) and operator-canon support for tier-hood
(Hughes Johnson's Stripe COO scope explicitly included real estate; supply-chain
ownership is a named COO function wherever physical product exists).
Normative criterion text: CRITERIA.yaml `OPS-08` (as of v1.0)
Classifier signals: supply-chain/fulfillment runbooks; inventory records; supplier
lists with owners; facilities/lease-obligation trackers; equipment/asset registers.
Not required and affirmatively not a gap when active, at Band 1: ERP systems; formal
S&OP (sales-and-operations-planning) cycles; ISO-28000-class supply-chain security
frameworks.

### OPS-09 — Quality management (detection-level) — INFORMATIONAL (B-20, ruled)
Normative criterion text: CRITERIA.yaml `OPS-09` (as of v1.0)
Informational signal set: bug/issue tracker; QA or test-plan docs; code-review policy;
incident retrospective/postmortem docs; a defect log. At Band 1, essentially all real
quality evidence lives in Engineering (testing, code review, retros) or is
Compliance-referred; a standalone scored quality tile would either double-label
Engineering evidence or manufacture an empty-tile false positive — the precise
trust-eroding failure Sprint Ma Task 3 warns against.

## 4. Conflicts (ruled)
C-1 — Cadence idioms diverge across lineages (EOS weekly-L10/Rocks vs OKR quarterly/
check-ins vs Hughes Johnson annual+quarterly vs Amazon's explicit OKR rejection: flat
goals, single owners, pass/fail, WBR). RULED: score the existence of a documented
cadence + a recurring review artifact; every idiom-level number is dated context
(B-12). Holds across all four idioms.
C-2 — 1:1 specifics (Grove: ~hour, frequency by task-relevant maturity; Mochary:
standardized weekly). RULED: same pattern — score that the practice exists and is
evidenced; specifics are context.
C-3 — Mechanisms canon vs talent-density canon. Position M (Amazon/EOS/GitLab):
companies run on documented mechanisms; document everything. Position T (Netflix):
remove controls; lead with context, not control; process accretion is how companies
calcify (Hastings's own Pure Software lesson). RULED (documentation-default with an
earned override; TAXONOMY B-23):
  1. Default: documentation is the Band-1 reference direction. Grounds: (a)
     product-constitutive — Ladder's dependency chain (Memory → Maturity → Leverage)
     ingests, diagnoses, and automates a documented corpus; a context-not-control
     company has structurally less corpus and cannot climb the ladder, so a
     documentation-default reference model measures the precondition for everything
     the product does rather than imposing a culture preference; (b) evidence weight —
     five of six operator lineages plus the WMS empirical line sit on the mechanisms
     side; (c) the counter-canon's own sequencing — Hastings removes controls in
     explicit sequence AFTER talent density is built (Netflix's vacation policy fell
     in 2003, years and hundreds of top-of-market employees in); context-not-control
     is an earned later-stage state by its own author's account, and its stated
     preconditions largely post-date Band 1.
  2. The deliberate-lean override is earned, never asserted. A tile converts from thin
     to complete-with-annotation only when the corpus contains BOTH (i) an articulated
     operating-philosophy artifact (culture memo / how-we-work doc) AND (ii) the
     substitute machinery that philosophy calls for, actually evidenced (explicit
     context-setting artifacts, stated parameters, QBR-equivalents). A philosophy memo
     alone does NOT convert absences; it renders thin with the annotation "philosophy
     documented; substitute machinery not evidenced." Both trigger conditions are
     corpus-verifiable artifacts.
  3. The menu lives in generation, not diagnosis. Diagnosis defaults to documentation;
     the gap-closing flow (Sprint Ma Task 5) offers the choice — draft the missing
     runbook from the corpus, or document the deliberate divergence. Structural echo
     of Sprint L's restraint principle preserved: "we chose not to systematize X
     because Y, and here is the context that governs instead" remains a complete,
     first-class answer — it must be shown, not claimed.

## 5. No-authority markers
- All cadence/meeting numbers (weekly L10, hour-long 1:1s, 3–7 Rocks, weekly–monthly
  all-hands, weekly WBR): named-practitioner canon; encoded as context only, scored on
  documented existence.
- Band-1 lightweight thresholds (OPS-07 change practice, OPS-09 quality loop) and the
  OPS-08 activation rule: defensive expert judgment; the authorities describe the
  heavyweight forms these are subsets of.
- The B-21 machinery/content line and the B-23 two-condition override test:
  expert-authored constructs (ruled); the override is corpus-verifiable on both
  conditions and scores documentation of a philosophy plus matching machinery, never
  adherence to either canon.
- GitLab specifics (handbook-first, async-first): one company's choices — evidence of
  shape and existence, never a scored norm.

## 6. Cite-check record
[cite-check] SOC 2 CC9.2 control identifier (vendor/business-partner risk management), originally asserted from
convergent secondary sources (Vanta, Atlas Systems, soc2auditors, UpGuard).
CITE-CHECK RESOLUTION (landing commit): NOT VERIFIED against AICPA primary text at landing (primary unreachable or mismatch). (superseded — see resolution below)
Per protocol §8, OPS-05 provenance is DOWNGRADED to expert-authored; the vendor
criteria stand on practitioner convergence + operator canon; SOC 2 control
identifiers are removed from load-bearing use pending verification.
Resolution (corrected 2026-07-08, research thread): the landing branch NOT VERIFIED was CORRECT — it caught a mischaracterization of CC9.1 (business-disruption risk mitigation), which is not a vendor control. A session relay compressed the branch outcome to 'verified,' which the People-thread propagated into TAXONOMY v0.5 and an earlier version of this line; both are corrected this commit. The citation is corrected to CC9.2 (vendor and business partner risk) and re-verified in the research thread 2026-07-08 against AICPA TSP Section 100 (2017 TSC, Revised Points of Focus — 2022; primary publication identified, criterion text convergently corroborated). OPS-05 stands authority-backed on the corrected, in-thread-verified citation.

## 7. Calibration plan (§9B three-outcome separation)
Corpus: the reference company — a first test corpus, never a completeness oracle (B-13).
Genuine absence on the reference company is a finding about the reference company. Precision measured ONLY against
ingest-log ground truth: artifact known-ingested but unfound = classifier error;
absent with a clean ingest log = genuine absence (a real finding); absent with a
skip/fail/exclusion log entry = not ingested (excluded from precision).
Per-subcategory expectations (present-evidence / clean-log-absence finding / likely
not-ingested trap):
- OPS-01: accountability chart / DRI register / owners pages · no written ownership
  map · owner names scattered in docs — classifier must distinguish scattered owner
  MENTIONS (thin) from a MAP (present); require the artifact, not keyword density
  (evidence-weighted discipline per Sprint Ma Task 2).
- OPS-02: recurring 1:1/leadership/all-hands artifacts · no documented meeting rhythm ·
  meeting notes often live in un-ingested tools (calendar, Slack) — check ingest log
  before recording a finding; same artifact-not-density rule as OPS-01.
- OPS-03: annual plan + quarterly goals + review artifact · no documented goal rhythm.
- OPS-04: runbooks/SOPs with owner+date · tribal knowledge · process docs in an
  un-ingested wiki. Output preserved as structured inventory for Sprint L.
- OPS-05: register + owners + intake/renewal records · no vendor inventory
  (SOC-2-surprising for the reference company → re-examine ingest log first).
- OPS-06: tool inventory + JML access docs · no access process (SOC-2-surprising →
  check log first).
- OPS-07: change/deploy records with review · no change tracking · records often in
  un-ingested systems (git/CI).
- OPS-08: the reference company expected documented-n/a (pure SaaS); first real exercise of the B-22
  activation rule arrives at Customer A (roadmap gate 3).
- OPS-09: informational; no precision stake.
B-23 calibration behavior: where OPS-02/04/07 find little process documentation, apply
the two-condition override test before rendering thin: philosophy artifact present AND
substitute machinery evidenced → complete-with-annotation ("deliberately lean,
documented"); philosophy artifact alone → thin with annotation ("philosophy documented;
substitute machinery not evidenced"); neither → thin/absent per the documentation
default. The override's first real stress test arrives when a calibration corpus first
contains a philosophy artifact — watch for it at Customer A.

## 8. Sprint-L traceability
OPS-01 and OPS-04 are [Sprint-L prereq] criteria. The classifier's documented-process
inventory (OPS-04) and ownership map (OPS-01) are structured outputs consumed by
Sprint L as the automation-candidate universe: an undocumented process cannot be
assessed for automation; an unowned process cannot have a loop designed against it.
The B-23 "chose not to systematize X because Y" record is the Maturity-layer analog of
Sprint L's "chose not to automate" first-class output.

## 9. Weakest-provenance flag (§9C, named unprompted)
OPS-09 (Quality) — weakest in the brief; informational per B-20. Runner-up: OPS-08 —
decomposition is APQC-corroborated but the activation rule and criteria are expert
judgment; first evidence arrives at Customer A; honest to call it designed-for-the-
customer rather than derived-from-the-reference. Post-ruling note: the B-23
two-condition override remains the brief's most consequential expert-authored
construct — it governs how every process tile treats lean companies; its default has
three independent grounds (one constitutive of the product) and the override is
corpus-verifiable on both conditions.
