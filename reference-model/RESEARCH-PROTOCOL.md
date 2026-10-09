Reference-Model Research Protocol
Status: Living document, v0.24 (2026-07-16)
Governs: the authority-grounded strand of reference-model derivation (Sprint Ma Task 1 v2) — every tier research run, and any future band expansion.
Companion: Task 1 v2 in Sprint-Ma-Maturity.md defines what the three strands are; this document defines how the authority-grounded strand is executed so that (a) any brief's authority set can be audited after the fact and (b) the process replicates across domains whose authority genres differ.
Maintenance rule: This document lives at reference-model/RESEARCH-PROTOCOL.md in the Ladder repo. Any CC commit that lands a new or amended research framework (tier category files, band expansions, protocol-derived tooling) MUST include a corresponding update to this document in the same commit — at minimum a change-log entry. The operator may also direct standalone updates based on new learning.

1. Scope and non-scope
This protocol covers the research run that produces a category brief for one tier: gathering authorities, deriving per-category completeness criteria, logging conflicts, and packaging operator decisions. It does not cover the expert-authored strand (operator judgment applied during review and arbitration) or the corpus-calibrated strand (running the resulting categories against a real corpus), except where those strands impose requirements on the brief's format.
One run per tier, in a fresh conversation, per Task 1 v2. The brief is a review artifact; nothing lands in reference-model/ until the operator has ruled on elevations and arbitrations.
Post-landing lifecycle — amendments, refreshes, structural changes, calibration feedback, and their thread types — is governed by reference-model/LIFECYCLE.md. This protocol governs creation runs (T-1) only.

2. Authority genre taxonomy
Every domain has its own authority genres, but the weighting logic transfers. Before searching, enumerate the genres the domain offers and place each on this ladder:
WeightGenre classBusiness-tier instance (worked example)What it establishesHighestPrimary / statutory — the rule itself, from the body that owns itDelaware Div. of Corporations; IRC §§83(b), 409A, 1202; SEC Rule 701; DGCLHard requirements with deadlines and consequences; the only genre that can make a criterion unconditionalHighModel / standard document sets — maintained forms the market actually transacts onNVCA model docs; Series Seed; YC SAFE; Orrick forms libraryWhat "the artifact" canonically looks like; version history mattersHighDemand-side request lists — what a counterparty with leverage asks to seeVC due-diligence request lists (law-firm and investor-side)The category structure of scrutiny; what absence gets flaggedMediumContractual-market practice — what executed agreements actually obligateIRA information-rights cadence via firm commentary + filed exemplarsMarket-standard numbers (deadlines, thresholds) distinct from the maximal genre listLowestPractitioner canon — converged norms with no formal sourceInvestor-update cadence; board-cadence conventionsSoft criteria only; never sole support for a scored requirement
Rules that fall out of the ladder:

A criterion is only unconditional if primary authority makes it so. Everything sourced below primary is stage-, covenant-, or context-conditional and the criterion text must say what conditions it.
Practitioner canon can inform a category but a category resting on it alone is tagged expert-authored and (default) scored soft.
When mapping a new domain (e.g., Engineering/Infrastructure: standards bodies, vendor-neutral frameworks, postmortem/SRE canon; AI Operations: NIST AI RMF, emerging governance frameworks), fill this table first. The genre enumeration is the run's plan.
Note (Ops run, 2026-07-08): a domain's model-document-set genre may take non-form
shapes. For company operations, the maintained model document set is the PUBLISHED
COMPANY HANDBOOK (anchor: the GitLab Handbook — a complete public operating system
transacted on daily by the company itself, maintained under a git workflow, and
peer-review-corroborated as an organizational-design instance). Before marking the
model-document-set rung absent in a new domain, ask what non-form artifact the
domain's best practitioners publish and transact on.

2A. Scrutiny regimes and taxonomy reflection (mandatory pre-steps)
Enumerate scrutiny regimes and lifecycle stages before genres. A domain's scrutiny of a company arrives in stages (e.g., business diligence before a term sheet, legal diligence after), and each stage has its own authority genres. Enumerating genres without first mapping the stages risks anchoring on the final stage's checklists and missing everything the earlier stages examine. (Rule added 2026-07-08 after operator correction: the Business-tier sweep built its category set from post-term-sheet legal-DD checklists, missing the pre-term-sheet business-diligence regime entirely. See §10.)
Taxonomy reflection duty. Operator directives about the category structure are strong priors, never terminal authority. Every research run includes an independent reflection pass on the taxonomy itself: triangulate the current roster against at least two external frame families — one scrutiny-side (what examiners decompose a company into) and one operating-side (what functional organizations decompose themselves into) — check coverage in both directions, surface missing functions, and log proposals with rationale. Taxonomy changes are elevated to the operator and recorded in TAXONOMY.md's boundary registry; the researcher proposes, the operator rules.
No-direct-canon condition. Where no established taxonomy exists for the object being modeled (as with startup operational maturity), the taxonomy's authority is constructed by triangulation across adjacent frames rather than adopted from a canon. Name this condition explicitly in the output; it changes the provenance story of the whole model.
**Regime weight-ranking (rule added 2026-07-08 after operator correction on the Ops
run).** Enumerating regimes is not sufficient; the run must WEIGHT-RANK them and
allocate sourcing effort to the regime that owns the category's essence. For operating
categories the operator/practitioner regime is primary and scrutiny regimes
corroborate; for legal/compliance categories the reverse. A regime enumerated but not
sourced is a §2A violation in effect: the Ops v1 draft listed the operator regime,
sourced predominantly from audit-scrutiny checklists, and produced a compliance-shaped
category until corrected. See §10.
Disposition-and-inventory rule (added 2026-07-08 after operator correction on the People run). The taxonomy-reflection pass must carry every external-frame element to an explicit disposition — owned subcategory, Band-1 fold with deferred promotion, or cross-referenced home in another category — and record the table in the brief. For documentation-heavy categories (any category whose completeness is primarily artifact existence), the run drafts an expected-artifact inventory from the demand-side and statutory genres before writing criteria. Surfacing a frame element in the reflection table without dispositioning it is the failure this rule prevents. The inventory is checked against a full practitioner table of contents for the domain's model document (for People, a standard employee-handbook ToC), not only against frame-element names — element-level artifacts can hide inside a dispositioned frame element.
Conduct-based exposure frame (added 2026-07-09 after operator correction on the Legal run). For legal/compliance-polarity categories, the taxonomy-reflection frame families must include a conduct-based regulatory-exposure frame — the law that applies to a company because it exists, employs, operates a website, markets, and processes data — in addition to event-scrutiny frames (diligence lists, transaction practice). Event-scrutiny frames alone systematically miss operating-law exposure. See §10.
Per-polarity sourcing rule (added 2026-07-09 after operator correction on the Capital run). Under mixed regime polarity, every practitioner-primary subcategory receives a named-lineage canon sweep before criteria are drafted, at the same depth the statutory-primary subcategories receive from their regulators. A polarity declared in the pre-step but not sourced to its own genre's depth is the §2A weight-ranking violation in per-polarity form.

3. The sweep procedure

1. Anchor search per genre. One search establishing the current canonical instance of each genre (e.g., "NVCA model documents current version"). Record the version/date immediately — the anchor's currency is the first auditable fact.
2. Cross-reference rule (mandatory). Every category in the brief carries at least two independent authorities, or an explicit provenance downgrade with a no-authority marker. A single source — however prestigious — establishes a candidate criterion, never a criterion. (Rule added 2026-07-08 after operator correction: the first Business-tier sweep anchored the DD-list genre on one source and moved on. See §10.)
3. Independence test. Two sources are independent if neither derives from the other and they don't share a sole underlying source. Two law-firm posts summarizing the same NVCA update are one authority (the update) with two corroborators — cite them as such, not as two authorities.
4. Fetch load-bearing artifacts verbatim. When a source's structure will shape the category set (a DD list's section layout, a model form's covenant list), fetch the primary artifact rather than trusting secondhand summaries. Secondhand is acceptable for corroboration; never for structure.
5. Breadth before depth. Cover every genre before deepening any category. A category with four sources in one genre and zero in another is worse-grounded than one with one source per genre — genre coverage is what catches conflicts.
6. Search hygiene. Short queries; current-year terms for anything rate-of-change-sensitive; note when a result's date predates a known change to the thing it describes (a 2023 explainer of a document set updated in 2025 corroborates the old version, not the current one).
7. Per-subcategory anchor sweeps (added 2026-07-08 after operator correction on the People run). Category-level genre anchoring is not sufficient. Before criteria are drafted, every subcategory receives its own anchor sweep: its best-practice canon, its empirical base, and its stage calibration (what companies at the declared band actually do). A criterion whose stage-bar was never checked against band reality encodes a later-stage norm as a Band-1 requirement. Under legal polarity, the per-subcategory statutory sweep must reach each subcategory's own regulator; a statutory rung sourced only for the transaction-heavy subcategories is the §2A-addendum violation in per-subcategory form (added 2026-07-09, Legal run). See §10.

4. Source-quality heuristics

Rank within genre: primary body > major firm / named practitioner with stated credentials > platform education centers (Carta-class) > content-marketing (SEO-grade). Content-marketing sources are usable only where several converge independently, and are always weight-marked in the authority table.
Recency beats prestige for market practice; primary text beats recency for rules. A 2026 market survey outranks a 2020 firm memo on what's standard; the statute outranks both on what's required.
Convergence and conflict are both signal. Independent convergence upgrades confidence; conflict between sound sources is never smoothed over — it goes to the conflict log (§6).
Numbers are quoted with their conditions. A threshold, deadline, or dollar figure enters the brief only attached to what triggers it and what modifies it (e.g., a deadline "unless a material event," a cap "greatest of" three tests).
**Adoption-agenda screen (hype-cycle domains; added 2026-07-09, AI Operations run, failure-forced).** A source whose function is to promote adoption of the domain's subject matter never receives authority status: its claims cannot support a criterion, and its prominence is irrelevant. Test: would the source's credibility survive the conclusion that adoption is premature? Such sources remain usable at the idea level — a concrete practice they describe may enter the model only after an individual test: would adopting this practice genuinely serve a company at the declared band, given current, dated capability evidence? Passing ideas enter with honest provenance (typically the generation menu rather than diagnosis criteria); failing ideas are rejected with the reason recorded. Genre evidence and cautionary exhibits remain citable as such.

5. Provenance assignment
Per Task 1 v2, every category carries exactly one primary tag; the brief may note mixed support in prose.

authority-backed: criteria trace to genre-diverse citable sources, meeting the cross-reference rule.
expert-authored: criteria rest on operator/researcher judgment or practitioner canon alone. This is a description, never a penalty — per Task 1 v2, authority density is not importance density, and domains whose canon is practitioner-grade (GTM above all) will legitimately run heavy on this tag.
corpus-observed: criteria whose support is a real corpus rather than external authority. Rare in the brief stage; more common after calibration runs feed back.

Downgrades are explicit: if the cross-reference rule fails for a claim, either cut the claim or tag it down and add a no-authority marker. Silent single-sourcing is the failure mode this document exists to prevent.

6. Conflict logging and arbitration
When sound authorities disagree:

Log the conflict with both positions and their sources — never pick silently.
Propose an arbitration whose test is: can the corpus itself hold the evidence the criterion demands? Prefer arbitrations that score against hard, corpus-verifiable facts (an executed covenant, a signed record) and demote genre norms to reported context. (Business-tier example: board-cadence sources conflicted; the arbitration scored the completeness of the signed action record and reported cadence as context.)
Arbitrations are proposals. The operator's ruling is recorded in the category file's arbitration log at landing.

7. Elevation criteria
A call is elevated to the operator, with both positions stated, when any of:

It binds a future tier run (a boundary question between tiers);
It sets scored-vs-informational status for a weak-provenance category;
It interacts with an instance-level policy (e.g., a corpus exclusion class) such that correct model behavior needs explicit sign-off;
Sources are balanced and the choice is taste or product judgment rather than evidence.

Researcher leans are stated but never pre-decide. Elevations are numbered (E-n) so rulings are citable.

8. Honesty markers

No-authority markers: any criterion or basis lacking formal authority is listed in a dedicated brief section, tagged, and (if kept) written defensively so it doesn't encode a rule no source supports.
[cite-check] flags: any claim asserted from professional knowledge and corroborated only by secondary sources — typically a specific statutory citation — is flagged and must be verified against the primary text before the category lands. Cite-checks resolve IN THE RESEARCH THREAD, against the primary text, before the landing package is issued; the brief records the resolution and its retrieval date. CC landing prompts contain only mechanical repository operations — no verification, research, judgment, or network-dependent steps. Landing with an unresolved flag remains a protocol violation; delegating the resolution to the landing agent is now also one.
Retrieval dating: every authority row carries version/date and retrieval date. The brief must be re-auditable after the sources drift.

9. Output contract (the brief)
Every tier brief has these sections, in order, so briefs are comparable across tiers:

Method note (dates, flags legend, landing disclaimer)
Authority set — the genre-grouped table with versions, retrieval dates, weights
Categories — id, provenance tag, Band-scoped completeness criteria with conditions inline, classifier signals, refresh notes where sources are volatile
Conflicts and proposed arbitrations (C-n)
Elevations (E-n), both positions + researcher lean
No-authority markers and [cite-check] flags
Calibration plan — per-category expectations against the calibration corpus, including any designed-in "not ingested (policy)" outcomes
Landing spec — exactly what CC lands on approval

Band scoping is declared in the header; criteria are written for the declared band with later-stage deltas noted only where sources state them. No speculative stage taxonomy.

9A. Scoring principle (capability, not performance)
Completeness criteria score whether an artifact, process, or measurement exists, is defined, and is honest — never whether metric values clear benchmark bands. Benchmark values appear only as dated, sourced context annotations. A non-scoring distress-annotation layer is permitted. (Operator ruling on GTM E-1, 2026-07-08; TAXONOMY B-12.)
9B. Calibration discipline
Calibration corpora are test cases, never oracles; no corpus is presumed complete, including the one the model was designed against. Every calibration plan separates three outcomes: evidence found; nothing found with a clean ingest log (genuine absence — a finding about the company); nothing found with a skip/fail/exclusion log entry (not ingested). Classifier precision is measured only against ingest-log ground truth: an artifact known ingested but unfound is classifier error. (Operator correction, 2026-07-08; TAXONOMY B-13.)
9C. Quality bar (the GTM-run standard)
Every category run meets the bar set by the GTM run of 2026-07-08: research frontloaded into one pass; the genre ladder enumerated before searching; every subcategory carrying ≥2 independent authorities or an explicit downgrade; conflicts logged with arbitrations whose tests are corpus-verifiable; downstream-sprint prerequisites traced into first-class marked criteria; stage-honest criteria including explicit "not required and affirmatively not a gap" statements; the weakest-provenance subcategory named to the operator unprompted; boundary resolutions delivered with ratification evidence, not assertions.

## 9D. Evidence multi-homing

A single corpus artifact may establish completeness evidence across multiple categories (a strategy deck feeding Product and GTM; an executed agreement feeding Legal and Compliance). The boundary registry governs which category owns a requirement; it never makes evidence exclusive. Classifiers may cite one document under many tiles, and calibration plans must not treat cross-category reuse of evidence as double-counting. (Operator ruling, 2026-07-08; TAXONOMY B-17.)

## 9E. Retroactive audit gate (added 2026-07-08)
Rules derived mid-queue apply retroactively. Before the classifier (Sprint Ma Task 2) consumes the reference model, every category landed under an earlier protocol version receives a bounded completeness audit applying the then-current rules: (a) disposition-completeness — the category's roster triangulated against one operating-side and one scrutiny-side frame family, every element dispositioned; (b) stage-bar spot-check — each subcategory's Band-1 bar confirmed against a per-subcategory anchor (canon + empirical + stage). Findings route to the operator as numbered elevations; the audit never silently reopens a landed category. Default queue position: one bounded audit thread after the category queue completes and before the model is declared v1; the operator may pull it earlier. Categories not yet landed inherit the current rules in full and need no audit. The audit additionally performs a one-time liveness sweep: every repo claim asserting an artifact's existence or inheritance (status-board notes, boundary entries, brief cross-references) is resolved to a live repo path or corrected; unresolved claims render 'presumed dead' findings for operator ruling. (Derived from the 2026-07-08 Tier-1 dead-pointer incident; see §10.)

10. Failure modes observed → rules derived (audit trail)
This section is append-only. Each entry: date, what happened, the rule it produced.
DateFailure / correctionRule derivedWhere codified2026-07-08First Business-tier sweep anchored the DD-list genre on a single source (YC) and proceeded; operator flagged single-source anchoring mid-runCross-reference rule: ≥2 independent authorities per category or explicit downgrade; genre breadth before category depth§3.2, §3.52026-07-08Two statutory citations asserted from professional knowledge without reading the primary text in-run[cite-check] flag discipline; flags block landing until resolved§8
| 2026-07-08 | Category set derived from post-term-sheet legal-DD checklists; pre-term-sheet business diligence (product, market, traction, internal ops) missed entirely until operator correction | Enumerate scrutiny regimes and lifecycle stages before genres | §2A |
| 2026-07-08 | Operator's category rulings treated as terminal authority rather than strong priors; researcher failed to independently surface missing functions (Product, People) until instructed | Taxonomy reflection duty: every run triangulates the roster against external frames and proposes gaps | §2A |
| 2026-07-08 | Tier-1 brief and Sprint Ma Task 3 treated the reference corpus as a completeness oracle ("any absence on the reference company = false positive by definition"); operator corrected: the reference company is a first test case, never a calibration authority | Calibration demotion rule; precision measured against ingest-log ground truth | §9B |
| 2026-07-08 | Product-run E-3: researcher homed retention/churn in PRODUCT-04 as a PMF proxy; operator reversed — retention is a commercial GTM value, scored in GTM-06 | Dual-nature signals (product-health measure AND commercial KPI) home with the commercial owner; other categories cite them only as bounded proxies | §9D companion; TAXONOMY B-15 |
| 2026-07-08 | Ops v1 enumerated the operator/COO regime in its pre-run table but sourced predominantly from scrutiny regimes (SOC 2/ISO), producing a compliance-shaped Ops category with no management rhythm, no ownership map, and physical ops demoted to a footnote; operator corrected mid-run | regime weight-ranking — sourcing effort must follow the regime that owns the category's essence; a regime listed but not sourced is a §2A violation in effect | §2A addendum |
| 2026-07-08 | the model-document-set genre was marked absent for Ops in two drafts because the researcher pattern-matched on legal-style forms; the genre exists as the published company handbook (GitLab-class) | before marking a genre rung absent, ask what non-form artifact the domain's practitioners publish and transact on | §2 note |
| 2026-07-08 | People v1 built its roster from the mandate's six named functions; the reflection pass surfaced Total Rewards' benefits half, leave policy, and the handbook/policy corpus in its frame mapping but carried none to a disposition; operator corrected mid-run (second instance of the reflection-failure mode). | Disposition-and-inventory rule: every frame element gets an explicit disposition; documentation-heavy categories get an expected-artifact inventory before criteria are drafted. | §2A |
| 2026-07-08 | People v1/v2 anchored genres at category level only; criteria (notably the PEOPLE-01 structured-interview bar) were drafted without per-subcategory best-practice/empirical/stage sweeps, encoding a later-stage norm as a Band-1 requirement; operator directed a comprehensive deep dive (v3). The gap creates uncertainty about categories landed earlier under the same practice. | Per-subcategory anchor sweeps mandatory before criteria; retroactive application to previously landed categories via the §9E audit gate before classifier consumption. | §3.7, §9E |
| 2026-07-08 | The People landing prompt delegated the 29 CFR 1607 cite-check to CC as a landing step (following the Ops-run precedent, where CC took the SOC 2 CC9.1/CC9.2 branch); operator flagged the practice. The prompt's branch logic also conflated 'page unreachable' with 'citation unverified' — an availability failure would have dropped a correct citation. The research thread independently verified 29 CFR 1607.4(D) (four-fifths rule) against ecfr.gov, retrieved 2026-07-08: VERIFIED. | Cite-checks resolve in the research thread before the landing package is issued; landing prompts are purely mechanical; availability failures are never treated as verification failures. | §8 |
| 2026-07-08 | Transition prompts reproduced Parts II/III in full per §12, growing monotonically with each landed category into multi-thousand-word documents, with reconstruction-fidelity risk and a verification burden whenever commits were in flight; operator flagged the escalating cost after the People→Legal handoff. | Repo as sole courier: transition briefs carry only session state the repo cannot hold; the incoming thread receives the governing documents pasted from the repo; stable relay conventions codified in §13 instead of re-transmitted. | §12 (v0.8), §13 |
| 2026-07-08 | The v0.6 landing and v0.7 amendment prompts both omitted the PROTOCOL header status-line bump, leaving the header two versions behind the change log until CC flagged it (recurrence of the TAXONOMY v0.1-header lag corrected at v0.3); the research thread's first v0.8 draft repeated the omission. | Header-tracks-log guard: change-log entry and header bump land in the same edit; CC pre-commit check enforces header == latest log version on every governing-file commit. | §13 |
| 2026-07-08 | The Ops landing correctly took the NOT VERIFIED branch on the SOC 2 cite-check (catching a CC9.1 mischaracterization — CC9.1 is business-disruption mitigation, not a vendor control; the landing prompt also carried the unreachable-or-mismatch conflation later fixed at v0.7). A session relay compressed the outcome to 'verified'; the research thread propagated that into TAXONOMY v0.5 and a hotfix line in ops/BRIEF.md without quoting the artifact. Caught when the landed provenance tag contradicted the assertions and CC's flag reached the research thread verbatim. | Artifact-quoted state only; FLAGS relayed verbatim; state-echo before every edit. The repo artifact is the sole admissible record of a branch outcome. | §13 |
| 2026-07-08 | Post-landing operator sanity check found PEOPLE-08 missing the corrective-action/discipline element (incl. suspension and administrative leave pending investigation) — third element-level miss in the People category; it survived the disposition-and-inventory rule because the inventory used frame-element names, and the discipline procedure hid inside the dispositioned 'employee relations' element. | Documentation-heavy inventories are checked against a full practitioner ToC of the domain's model document; the §9E audit adds a practitioner-ToC pass for landed documentation-heavy categories. | §2A, §9E companion |
| 2026-07-08 | the v0.1 status board recorded a pre-rejection plan as inheritance; the dead pointer propagated through every handoff and gated the Legal run ~3 hours | an inheritance claim must cite a repo path; a claim with no artifact is presumed dead | §12, §13 |
| 2026-07-09 | The Legal run's first sweep anchored the statutory rung in SEC/Delaware securities and corporate law only — no statutory sweep for the IP-paperwork, employment-paperwork, or litigation subcategories (Form I-9 omitted entirely); operator caught the skew mid-run; supplemental primary-text sweeps (USCIS, DOL 29 CFR 795, Cal. Lab. Code 2870–2872) resolved it. | Under legal polarity the per-subcategory statutory sweep must reach each subcategory's own regulator, not only the transaction-heavy subcategories' regulators (third instance of the sourced-where-comfortable pattern). | §3.7 |
| 2026-07-09 | The Legal run's taxonomy reflection used only event-scrutiny frames (financing DD, in-house transaction practice) and missed the conduct-based regulatory-exposure frame entirely — privacy, posted-policy mandates, ADA, marketing regulation, qualification depth, and ownership disclosure were absent until operator correction (~70% coverage at the catch); two subcategories (LEGAL-09/10) added; the sweep also caught that training-era knowledge would have scored repealed or exempted obligations (CTA domestic exemption; Colorado AI Act repealed before effectiveness). | Legal/compliance-polarity reflection must include a conduct-based regulatory-exposure frame among the §2A frame families; volatile-regime criteria are written at assessment level with hard refresh flags. | §2A |
| 2026-07-09 | Category runs were overlapped for velocity (N+1 research started once N's landing prompt was issued) with no discipline governing what N+1 could rely on; combined with an unbacked inheritance assertion this produced a four-hour blocking incident, and separately produced version-guard trips when governance commits landed between prompt authorship and execution (Legal landing, 81a7deb). | §12A pipelining discipline: start gate at rulings-complete + prompt-issued; pending-delta inputs artifact-quoted from the landing prompt; landings serialize even where research overlaps; guard-trip adapt-and-execute path; verbatim rule bulletins with §9E backstop. | §12A |
| 2026-07-09 | The Capital transition brief said 'fetch from the repo' without naming the channel; the incoming thread stopped to ask whether repo files arrive by operator paste or MCP connector. | Repo-artifact retrieval channel codified: operator paste or verbatim CC extraction only; connectors serve ingested corpora, never the repo. | §13 |
| 2026-07-09 | The Capital v1 draft declared mixed regime polarity per subcategory but executed lineage-grade sourcing only on the statutory side, sourcing practitioner-primary subcategories at SEO grade and framing the category on the rejected BG framework's pre/post-term-sheet diligence timeline; operator corrected at review ('perhaps 33% of the way there') — fourth instance of the sourced-where-comfortable pattern, first under mixed polarity. | Per-polarity sourcing rule: under mixed polarity every practitioner-primary subcategory gets a named-lineage canon sweep before criteria are drafted; declared-but-unsourced polarity is the §2A violation in per-polarity form. | §2A |
| 2026-07-09 | The Engineering v1 draft converted operating practices into written-policy requirements ("posture statements," "stated conventions," "affirmative records") despite the run's own forecast naming audit-shape as the domain's primary failure mode; operator rejected at review ("reads like a SOC 2 checklist") — recurrence of the audit-shape/sourced-where-comfortable pattern class (Ops v1, Capital v1 precedents), first instance post-forecast. | Practice-over-policy rule: operating categories score practice-in-use via the artifacts the work naturally produces; SOC 2-class policy documents are never required outside Compliance and corroborate but never substitute; scrutiny-regime substance is extractable as observable practice criteria; certification status homes in Compliance. The Sec. 9E audit inherits this as a sweep test for previously landed operating categories. | TAXONOMY B-32; Sec. 9E companion |
| 2026-07-09 | AI Operations run anchored practitioner canon on adoption-evangelist sources (growth/public-company CEO mandates), imported later-stage norms toward a Band-1 rubric (§3.7 stage-calibration violation), and presented mid-2025 empirical anchors as current in the model's fastest-moving domain (§3.6 currency violation); three operator corrections in-run | Adoption-agenda screen with idea-level extraction and band-utility test; §3.6/§3.7 reaffirmed as binding on hype-cycle domains; category-level currency rule (dated annotations; 12-month staleness bar at classifier consumption) | §4, §10; ai-operations/BRIEF.md §1 |

## Stop rule (of record, 2026-07-16)

> After the current ruled suite is green, no change to diagnostic
> criteria, existing fixtures, or the ontology may be made without a
> failed verdict from a real design-partner run.

Scope clause: the freeze governs the **diagnostic** suite and
criteria. Authoring new acceptance fixtures for capabilities that do
not yet exist (the remediation flow, the blindness pairs) is
construction, and is permitted; tuning existing diagnostic rules
against internal dissatisfaction is what the rule forbids.
Operator-ruled structural changes carried on the SPRINT-MA-CLOSE
pre-partner exception queue are permitted. The risk the rule
interrupts: operator writes the standard, writes the tests, tunes
the system to the tests, adjudicates the system, and revises
standard and tests until internal agreement rises while external
validity goes untested.

11. Change log

v0.24 (2026-07-16): stop rule of record added; homes the scrapped position doc Sec.7 per the 2026-07-16 fold ruling.

v0.1 (2026-07-08): Initial codification from the Business/Governance tier run. Genre taxonomy, sweep procedure, cross-reference rule, provenance/conflict/elevation/marker disciplines, output contract, audit trail seeded with two entries. Maintenance rule: research-framework commits must include a protocol update in the same commit.

v0.2 (2026-07-08): Added §2A (scrutiny-regime pre-step, taxonomy reflection duty, no-direct-canon condition); two new audit-trail entries. Companion: TAXONOMY.md v0.1 landed in the same commit per the maintenance rule.

- **v0.3 (2026-07-08):** §9A scoring principle (capability-not-performance), §9B calibration discipline (corpus demotion, three-outcome separation), §9C quality bar; one audit-trail entry. Companion: GTM package landed same commit.

- **v0.4 (2026-07-08):** §9D evidence multi-homing (B-17); §12 thread-handoff procedure codified; one audit-trail entry (Product-run E-3 reversal). Companion: Product package (product/BRIEF.md) + TAXONOMY v0.3 landed same commit.

- **v0.5 (2026-07-08):** §2 note (published-handbook as operations' model-document-set
  genre); §2A regime weight-ranking addendum; two audit-trail entries from the Ops
  run. Applied §3.3 lineage-mapping in practice (Grove→Doerr→Mochary counted as one
  lineage with corroborators). Companion: Ops package (ops/BRIEF.md) + TAXONOMY v0.4
  landed same commit.

- **v0.6 (2026-07-08):** §2A disposition-and-inventory rule; §3.7 per-subcategory anchor-sweep rule; §9E retroactive audit gate; two audit-trail entries from the People run. 29 CFR Part 1607 cite-check resolved at landing (branch recorded in people/BRIEF.md §5). Companion: People package (people/BRIEF.md) + TAXONOMY v0.5 landed same commit.

- **v0.7 (2026-07-08):** §8 cite-check resolution locus tightened (research-thread resolution mandatory; landing prompts mechanical-only); one audit-trail entry. Standalone update per the maintenance rule, operator-directed.
  - Note (2026-07-08): header status line had lagged at v0.5 while the log carried v0.6/v0.7 (the v0.6 and v0.7 prompts omitted the bump); corrected this commit. Header now tracks the log.

- **v0.8 (2026-07-08):** §12 rewritten (repo as sole courier; short transition briefs; incoming-thread paste obligation); §13 relay conventions codified incl. the header-tracks-log guard; two audit-trail entries. Standalone update per the maintenance rule, operator-directed. Companion: TAXONOMY v0.6 (run-queue line) same commit.

- **v0.9 (2026-07-08):** §3 items explicitly numbered; §13 FLAGS-verbatim and artifact-quoted-state/state-echo conventions added; one audit-trail entry (SOC 2 relay failure and correction). Companion: TAXONOMY v0.7 + ops/BRIEF.md citation correction same commit.

- **v0.10 (2026-07-08):** §14 CC turn report codified (single verbatim-relay block, fixed R1–R9 structure, truncation-detectable); §13 cross-reference. Standalone update per the maintenance rule, operator-directed. Companion: TAXONOMY v0.8 same commit.

- **v0.11 (2026-07-08):** §2A inventory rule tightened (practitioner-ToC check); one audit-trail entry (People v1.1 element miss). Companion: TAXONOMY v0.9 + people/BRIEF.md v1.1 same commit.

- **v0.12 (2026-07-08):** One audit-trail entry — dead Tier-1/BG inheritance pointer (a pre-rejection plan recorded as inheritance in the v0.1 status board, propagated through every handoff and gated the Legal run); rule: inheritance claims must cite a repo path, a claim with no artifact is presumed dead. Companion: TAXONOMY v0.10 same commit.

- **v0.13 (2026-07-09):** §9E liveness sweep added to the retroactive audit (failure-forced; Tier-1 dead-pointer incident). No other change.

- **v0.14 (2026-07-09):** §2A conduct-based-exposure-frame rule; §3.7 per-subcategory-regulator sentence (legal polarity); §12 inherited-material rule (completing the §12 codification the v0.12 dead-pointer audit entry referenced); two audit-trail entries from the Legal run (statutory-sweep skew; conduct-frame miss). The third entry the Legal landing spec proposed — the inherited Tier-1 material incident — was already recorded at v0.12 and is not duplicated. Companion: Legal package (legal/BRIEF.md) + TAXONOMY v0.11 same commit.

- **v0.15 (2026-07-09):** §12A pipelined category runs (start gate, pending-delta discipline, landing serialization, guard-trip adapt path, rule bulletins); one audit-trail entry. Standalone update per the maintenance rule, operator-directed. No TAXONOMY companion (no category content changed).

- **v0.16 (2026-07-09):** §2A per-polarity sourcing rule (failure-forced, Capital run); §13 repo-artifact-retrieval convention and open-items-reproduction convention (operator-directed consolidations); two audit-trail entries. Companion: Capital package (capital/BRIEF.md) + TAXONOMY v0.12 same commit.

- **v0.17 (2026-07-09):** Finance package (finance/BRIEF.md) + TAXONOMY v0.13 landed same commit (maintenance rule). Change-log entry only; no rule changes (operator direction).

- **v0.18 (2026-07-09):** Vision package (vision/BRIEF.md) + TAXONOMY v0.14 landed same commit (maintenance rule). Change-log entry only; no rule changes (governance freeze; nothing failure-forced this run).

- **v0.19 (2026-07-09):** Engineering package (engineering/BRIEF.md) + TAXONOMY v0.15 landed same commit (maintenance rule). One audit-trail entry (failure-forced: Engineering v1 audit-shape recurrence -> B-32 practice-over-policy). No other rule changes; governance freeze otherwise holds.

- **v0.20 (2026-07-09):** Sec. 1 cross-reference to LIFECYCLE.md (post-landing jurisdiction). Operator-directed consolidation; no creation-procedure changes; governance freeze otherwise holds. Companion: LIFECYCLE.md v0.1 + REFRESH.md v0.1 + TAXONOMY v0.16 same commit.

- **v0.21 (2026-07-09):** §4 adoption-agenda screen added (failure-forced, AI Operations run; idea-level extraction rule). One §10 audit-trail entry (three-leg failure family: evangelist-genre anchoring; stage-calibration violation; currency failure). Governance freeze otherwise holds. Companion: AI Operations package (ai-operations/BRIEF.md) + TAXONOMY v0.17 + REFRESH.md rows same commit.

- **v0.22 (2026-07-09):** Compliance package (compliance/BRIEF.md) + TAXONOMY v0.18 landed same commit (maintenance rule). Change-log entry only; no rule changes (governance freeze holds; nothing failure-forced this run). Category queue complete; next thread is the §9E-a retroactive audit per LIFECYCLE §7.

- **v0.23 (2026-07-09):** §13 channel-integrity convention added (file-drop + ASCII-safe relay for governing-file-bound content; repo stays UTF-8) — failure-forced (§9E-a; three mojibake recurrences), operator pre-ruled. No creation-rule changes. Companion: §9E-a normalization landing (TAXONOMY v0.19 + REFRESH v0.4 + brief normalizations) same commit.

## 12. Thread-handoff procedure (v0.8 — repo as sole courier)
Category runs execute one-per-thread to protect context headroom. Continuity
is guaranteed by the repo plus this procedure, not by memory.
**When.** A handoff occurs after a category's landing commit is confirmed
(diffstat received), or earlier if the operator calls context pressure.
**The outgoing thread's final deliverable** — the fourth item of every run,
after brief → operator rulings → CC landing prompt — is a SHORT transition
brief (target: one page) containing ONLY session state the repo does not
hold:
1. Verification items: any in-flight commits, unresolved branches, or
   unconfirmed diffstats the incoming thread must have the operator confirm.
2. Housekeeping owed to the next coupled commit.
3. The 'IF THIS RUN IS <category>' block: mandate; inherited boundary rules
   cited by registry number (content lives in TAXONOMY §2 — do not restate);
   inherited brief material and where it lives in the repo; expected genre
   profile with the §2A regime polarity named; forecast hard problem.
4. Queue position (pointer to the TAXONOMY §4 run-queue line).
The transition brief does NOT reproduce the governing documents.
**The incoming thread's first obligation:** obtain the CURRENT
reference-model/RESEARCH-PROTOCOL.md and reference-model/TAXONOMY.md from the
repo — the operator pastes both (extracted verbatim, e.g. via
`cat reference-model/RESEARCH-PROTOCOL.md reference-model/TAXONOMY.md`).
These govern; read before anything else; they override any conflicting
project-attached file. For completion passes, the inherited brief (e.g. the
Tier-1 Business/Governance brief) is pasted the same way. Do not begin the
run before the paste arrives.
**The incoming thread's obligations otherwise:** inherit all boundary-registry
rulings as settled precedent (challenges route to the operator as elevations,
never as silent relitigating); end its own run by executing this §12 —
producing the next short transition brief after its landing commit is
confirmed.
**Invariant.** The repo is the ONLY courier of the governing documents; the
transition brief couriers only what the repo cannot hold (in-flight
verification state and the per-category briefing). Any conflict between a
transition brief and the repo is resolved in the repo's favor and logged in
§10 if it caused an error.
Inherited-material rule (added 2026-07-09, Legal run): a transition brief may assert that a category inherits prior material only with the artifact's repo path quoted from a repo listing in the same brief; absent that, the brief declares a fresh run. An empty repo search for asserted inherited material is evidence the assertion is dead, not a retrieval failure.

## 12A. Pipelined category runs (added 2026-07-09, operator-directed)
Category runs may overlap under these rules:
1. Start gate. Thread N+1 may open once thread N's operator rulings are complete and N's CC landing prompt has been ISSUED. N's landing commit is not a prerequisite.
2. Pending delta. N+1's inputs are the governing documents pasted from the last LANDED repo state, plus N's landing prompt verbatim, which functions as the pending delta: its rules bind N+1 as if landed. A landing prompt is artifact-quoted future state, never memory.
3. Artifact rule (dead-pointer companion). Nothing exists for a pipelined thread unless it resolves to a repo path or to the literal text of a pending landing prompt. A claim failing both is presumed dead on arrival — no excavation.
4. Landing serialization. Research may overlap; landings may not. N+1 issues no landing package until N's diffstat and §14 report are confirmed. Every landing prompt's state-echo declares its expected header versions and stops on mismatch.
5. Guard-trip resolution. When the version guard trips because governance commits landed between a prompt's authorship and its execution, the operator may rule ADAPT & EXECUTE: renumber to the live baseline, drop edits duplicating already-landed content, complete any codification a landed change-log entry points at, and record every adaptation in R7. (Codifies the Legal-landing precedent, commit 81a7deb.)
6. Rule bulletins. A rule derived or ruled in one thread after another thread has started is relayed by the operator to the running thread verbatim; the receiving thread records it in its method note and applies it prospectively. The §9E retroactive audit remains the backstop for anything a bulletin misses.

## 13. Relay conventions (codified 2026-07-08; formerly re-transmitted per handoff)
Operator: Andrew. Workflow: research thread (chat) → Claude Code (CC) for all
repository operations.
- CC prompts are fully self-contained, all content verbatim between
  ===BEGIN/END=== markers, no 'as shown above' references, and PURELY
  MECHANICAL (no research, verification, judgment, or network-dependent
  steps — §8). CC reports diffstat only. Delivery: one fenced code block for
  prompts of manageable size; a downloadable .md file containing the marked
  block for prompts embedding a full brief (flag the deviation when used).
- Header-tracks-log guard: every prompt that adds a change-log entry to a
  governing file bumps that file's header status line in the same edit.
  CC's final pre-commit check on any commit touching a governing file:
  header version equals the latest change-log version. Mismatch → stop and
  report, do not commit.
- Secret values never transit chat or CC in either direction. No third-party
  dashboard click-paths from memory. Config values quoted from in-context
  ground-truth reports only. Learning mode on: gloss engineering jargon
  inline at first use.
- Research is frontloaded into one pass — genre breadth (§3.5) AND
  per-subcategory depth (§3.7). The operator reviews once, rules, the thread
  lands. Do not ask questions the governing documents already answer; do not
  surface edge-case elevations unless operator judgment is genuinely needed.
- Category files land as a single <category>/BRIEF.md; never per-subcategory
  files. Every landing commit couples the protocol/taxonomy updates
  (maintenance rule). One category per thread.
- Project-attached files in the chat project are stale copies and never
  update; the repo and the operator's pasted state govern.
- FLAGS discipline: every CC report ends with a mandatory FLAGS section (anything observed outside the requested scope that looks wrong, inconsistent, or fragile; 'FLAGS: none' if empty). The operator relays FLAGS to the research thread VERBATIM — never summarized.
- Artifact-quoted state only: no assertion about repo state enters a governing file unless the supporting repo artifact is quoted in the same report chain. Branch outcomes and verification states are read from the landed artifact, never carried as relayed prose. Every editing prompt opens with a state-echo: print header version, last change-log line, and the exact current text of every line to be modified, before editing.
- Turn reporting: every CC turn ends with the §14 report block; the operator relays the block verbatim as the sole report channel.
- Repo-artifact retrieval: research threads receive repo files by operator paste or verbatim CC extraction only; MCP connectors serve ingested corpora, never the repo.
- Open items requiring operator ruling (elevations, conflicts, confirmations) are REPRODUCED with adequate context in a consolidated block at the end of the research-thread response that raises them, so the operator can answer without searching the response body.
- Channel integrity (added 2026-07-09, §9E-a; failure-forced): governing-file-bound content (briefs, registry entries, landing prompts) ships as a file-drop AND is ASCII-safe in any inline-relayed block — no typographic dashes, arrows, or section glyphs in a block that transits chat/attachment relay; repo files remain proper UTF-8 (CC writes the Unicode from an ASCII-safe instruction, e.g. a codepoint escape). Three mojibake recurrences in inline-delivered brief content vs one clean file-drop across the category build.

## 14. CC turn report (mandatory, every turn)
Every CC turn — commits, read-only diagnostics, and stopped/partial runs alike
— ends with exactly ONE self-contained report block. Nothing reportable may
appear only in prose outside the block: the block is the report, and the
operator relays it to the research thread by copying the block VERBATIM and
nothing else. Fixed structure, all nine sections always present (write 'none'
rather than omitting), between literal markers:

===BEGIN CC REPORT===
R1 TASK: the prompt's title/first line; steps specified vs. steps executed.
R2 STATUS: COMPLETED | STOPPED (at which step/guard, and why) | READ-ONLY.
R3 COMMITS: git log --oneline for commits made this turn (hashes), then the
   full diffstat of each (git show --stat <hash>). 'none' for read-only.
R4 STATE: for every governing file touched or checked — header version and
   last change-log line, quoted; plus git status (expected clean).
R5 EDITS: every before/after pair, verbatim, file:line.
R6 BRANCHES: every conditional in the prompt — which branch fired, with the
   deciding artifact line quoted verbatim (artifact-quoted state, §13).
R7 DEVIATIONS: anything executed differently from the prompt's literal text,
   and any judgment applied. 'none' if literal throughout.
R8 OPEN ITEMS: deferred work, discovered follow-ups, anything awaiting an
   operator or research-thread decision. 'none' if empty.
R9 FLAGS: per §13 FLAGS discipline. 'FLAGS: none' if empty.
SECTIONS: R1-R9 complete
===END CC REPORT===

The trailing SECTIONS line and end marker are mandatory: a relayed report not
ending with both is presumed truncated, and the research thread requests a
repaste rather than proceeding. Research-thread prompts invoke this with a
single final step ('TURN REPORT per §14'); the obligation applies even when a
prompt omits the invocation.
