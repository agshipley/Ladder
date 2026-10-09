# Engineering — Category Brief v1 (Band 1)

Status: landed v1 (2026-07-09) · Run under RESEARCH-PROTOCOL v0.18 /
TAXONOMY v0.14 · Landed with TAXONOMY v0.15 / PROTOCOL v0.19

## 1. Method note

Fresh run (Sec. 12 inherited-material rule): no inherited brief; inherited
bindings only — B-4, B-16, B-19 (bind this run), B-12/B-13/B-17/B-23 as
everywhere, B-2 final. All retrievals 2026-07-09. Operating polarity,
practitioner-primary; empirical rung unusually strong (Accelerate/DORA);
statutory rung ABSENT (no regulator owns software construction; standards
bodies voluntary) — consequence: no unconditional criteria exist in this
category; every criterion is stage- or context-conditional.

Review history: the v1 draft converted operating practices into
written-policy requirements ("posture statements," "stated conventions")
and was rejected at operator review as audit-shaped ("reads like a SOC 2
checklist"). v2 (this brief) rescored every subcategory to
practice-in-use evidenced by the artifacts the work naturally produces.
The correction is codified as TAXONOMY B-32 (practice-over-policy with
substance-extraction clause) and a PROTOCOL Sec. 10 audit-trail entry.

Purpose of the tile: answer the question a technical reviewer — an
investor's technical advisor, an incoming senior engineer, an acquirer —
asks in the first week: is this a competent engineering shop? Can it ship,
recover, and survive a departure. Evidence is the working system's own
traces (repo state, CI configuration, deploy history, monitoring wiring,
postmortem records, lockfiles, restore records). A document is required
only where the document IS the engineering artifact (architecture
overview, ADR, runbook, README). SOC 2-class policy documents are never a
criterion here (B-32): they home in Compliance detection, may corroborate,
never substitute, and their absence never renders an Engineering tile thin
or red.

## 2. Authority set (genre ladder; retrieval date 2026-07-09 throughout)

- Primary/statutory: ABSENT — named per protocol Sec. 2.
- Model document sets (non-form shapes per Sec. 2 note): Google SRE Book
  (2016) / SRE Workbook (2018) / Building Secure & Reliable Systems (2020),
  maintained free at sre.google/books; PagerDuty Incident Response
  Documentation (response.pagerduty.com; company-internal docs open-sourced
  2017); Google eng-practices code-review canon (google.github.io/
  eng-practices; published 2019, CC-BY 3.0; repo archived Nov 2025, static
  site canonical); GitLab Handbook, Engineering division
  (handbook.gitlab.com/handbook/engineering) — the Ops-run handbook
  anchor's engineering face; ADR convention (Nygard 2011; adr.github.io;
  MADR 4.0.0, Sept 2024; adopted by AWS Prescriptive Guidance and Azure
  Well-Architected); minimumcd.org + trunkbaseddevelopment.com (community
  codification of the continuous-delivery minimum); OpenAPI Specification
  v3.2.0 (2025-09-19, OpenAPI Initiative / Linux Foundation).
- Demand-side: convergent technical-due-diligence checklist corpus —
  Kompella (named practitioner, 75+ assessments, seven-area framework) plus
  Sphere / Emizhi / GainHQ / ElifTech / VeryCreatives [content-grade;
  convergence-qualified; weight-marked]. Establishes the scrutiny
  decomposition: architecture, code quality, security, infrastructure,
  key-person risk, process, IP/dependencies/data.
- Empirical (B-12-bounded): Accelerate (Forsgren/Humble/Kim, 2018); DORA
  2024 Accelerate State of DevOps (39k respondents); DORA 2025 State of
  AI-assisted Software Development (Sept 2025; four keys evolved to five
  metrics; seven team archetypes replace elite/low tiers); DORA AI
  Capabilities Model (Dec 2025). Capabilities inform criteria; metric bands
  render only as dated context annotations, never tile inputs.
- Stage rung: YC stage definitions (seed = 2-10 people, pre-PMF) +
  convergent seed-stage practitioner canon (monolith-first,
  serverless-first, no premature Kubernetes/microservices/process)
  [content-grade; convergence-qualified].
- Dependency-hygiene canon: OWASP Dependency Graph/SBOM cheat sheet; OWASP
  Dependency-Track; lockfile/pinning + Dependabot/Renovate convergence.
- Scrutiny regime: SOC 2 / ISO 27001 — Compliance detection only,
  cross-referenced, never re-scored (B-19, B-27, B-32).

Independence (Sec. 3.3): SRE books, PagerDuty docs, and the Atlassian
Incident Management Handbook are three independent incident lineages.
minimumcd.org quotes Accelerate — one CD lineage with corroborators.
Tech-DD corpus supports category structure and artifact expectations,
never sole support for a scored criterion.

## 3. Subcategories ENG-01 – ENG-08

Band 1, US scope, vendor-agnostic (no criterion names a required host,
database, language, or tool). B-12: existence/definition/honesty/USE, never
metric bands. B-23: documentation-default with earned override; the menu
lives in generation. B-32: practice-in-use via naturally produced
artifacts; policy documents never required; scrutiny-regime substance
extractable as observable practice.

### ENG-01 — Architecture & technical decisions [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-01` (as of v1.0)
Classifier signals: architecture/system docs, docs/adr/ or decision logs, diagrams,
debt registers/labels, README architecture sections.
Not a gap at Band 1: architecture review boards, C4 completeness, ISO
42010 conformance.

### ENG-02 — Code & development practice [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-02` (as of v1.0)
Classifier signals: repo metadata/branch protection, PR/review artifacts, CI test
stages, contribution conventions, secret-scan results.
Not a gap: any particular branching religion, coverage thresholds,
style-guide formality.

### ENG-03 — CI/CD & deploy (B-19 technical face) [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-03` (as of v1.0)
Classifier signals: CI configs, required-check settings, deploy scripts/IaC, deploy
logs/history, migration tooling.
Not a gap: deploy-frequency counts, elite tiers, progressive delivery.

### ENG-04 — Reliability & incidents [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-04` (as of v1.0)
Classifier signals: alerting configs and routing, status-page wiring, incident
threads, postmortems with closed follow-ups.
Not a gap: rotations, error budgets, incident-command formality,
availability-nines targets.

### ENG-05 — Product infrastructure (B-4 product side) [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-05` (as of v1.0)
Classifier signals: IaC files, environment configs, secrets-manager references,
staging references.
Not a gap: multi-region, Kubernetes, formal capacity planning — stage
canon affirmatively counsels against premature versions of all three.

### ENG-06 — Data & continuity [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-06` (as of v1.0)
Classifier signals: backup configs/schedules, PITR settings, restore records,
schemas/migrations.
Not a gap: RTO/RPO commitments, warm standby, DR game-days.

### ENG-07 — Dependencies [authority-backed]
Normative criterion text: CRITERIA.yaml `ENG-07` (as of v1.0)
Classifier signals: lockfiles, manifests, merged update PRs, audit/scan outputs,
SBOM files.
Not a gap: signed SBOM attestation chains, private registries, SLSA
levels.

### ENG-08 — Knowledge transfer & developer docs [expert-authored —
weakest-provenance subcategory, named per Sec. 9C]
Normative criterion text: CRITERIA.yaml `ENG-08` (as of v1.0)
Classifier signals: README/setup docs, onboarding guides, API specs.
Not a gap: developer portals, docs-as-code toolchains, wiki shape.

### Stage-honesty summary
The Band-1 reference engineer maintains: an architecture overview; a
working CI pipeline and deploy path with rollback; version control with
review; monitoring that reaches a human; incident traces with closed
follow-ups on majors; automated, redundant, restore-verified backups;
lockfiles with flowing updates; a README a new hire can follow.
Affirmatively NOT gaps at Band 1: SLOs/error budgets, on-call rotations,
24/7 coverage, platform engineering, Kubernetes/microservices/
multi-region, capacity planning, coverage thresholds, DORA tier-chasing,
architecture review boards, written IR/DR/BCP policy documents. A red
tile for any of these on a seed corpus is a model error, not a finding.

## 4. Conflicts — arbitrations ruled 2026-07-09

C-1 (branching) RULED: score that a defined integration convention exists
and repo history evidences it is practiced; trunk-based vs. PR workflow
and integration frequency are dated context annotations. Neither workflow
renders the other's absence red.
C-2 (on-call) RULED: the bar is a named reachable responder and an alert
that reaches a human; rotations/24-7 coverage are later-stage context,
never a Band-1 gap.
C-3 (continuity) RULED: backups + redundancy substance + verified restore
is the bar; no written recovery policy; RTO/RPO figures and redundancy
architecture render as annotations.

## 5. Elevations — disposed 2026-07-09

E-1 (security homing): DISSOLVED under B-32 — hygiene items are
observable engineering facts living where the practices live
(ENG-02/05/07); certification-class artifacts remain Compliance
detection. No dedicated security subcategory at Band 1.
E-2 (AI coding-tool policy): WITHDRAWN with its criterion deleted —
operator ruling: a written AI-tool policy predicts nothing about
development velocity or quality at this stage; not a criterion in any
category at Band 1. (B-28's Legal/AI-Operations split is unaffected.)

## 6. No-authority markers and cite-check flags

No statutory rung exists; no [cite-check] flags were opened (no statutory
citation asserted). Book-publication facts (Continuous Delivery 2010;
Accelerate 2018) recorded as corroborated-secondary. No-authority
markers: ENG-08(a)/(d) per Sec. 3 above; ENG-05(d) demand-side-derived,
written as observable-fact criterion.

## 7. Calibration plan (reference corpus; B-13 three-outcome discipline)

The reference company is a test case, never an oracle. Structural note for the
classifier: Engineering evidence lives disproportionately in repo-native
artifacts (README, CI configs, lockfiles, ADR directories), so
detectability depends on whether code repos were ingested under Sprint
M's code tier; the ingest log — not the tile — distinguishes "no CI
config exists" from "the repo wasn't ingested." Expectations:
ENG-02/03/07 likely well-evidenced (open-source Rust infra culture);
ENG-01 partially (architecture material probable; formal ADR log less so
— a thin-not-absent test case); ENG-04 the most instructive B-19/B-32
test: a SOC 2-complete company will show Compliance-side incident POLICY;
whether operating incident PRACTICE (alert wiring, postmortems with
closed follow-ups) appears separately is exactly the policy/practice
separation under test; ENG-06 restore-verification records are a
predicted genuine-absence candidate at most seed companies — on a clean
ingest log that is a finding, not a false positive; ENG-08(c) activates
(developer-facing interfaces exist). No B-11 exclusion classes expected.
