# Menu Resolver — Prerequisite Mapping & Resolution Semantics

**Status:** RULED by operator 2026-07-20 (rulings A, B, C)
**Position:** Grounds the Leverage Menu Catalog v0 prerequisites in the live taxonomy (v0.21 / schema v1.5, 83 subcategories) per discovery against board-003. The resolver is built against this document verbatim.

---

## 1. Resolution semantics (RULED — A)

Each mapped subcategory is tagged **required** or **supporting**. State handling:

| Board state | Required prerequisite | Supporting prerequisite |
|---|---|---|
| evidence-found | met | met |
| thin | **not yet** — path: strengthen the named area | met, with the thinness noted in the menu item's caveat line |
| genuine-absence | **not yet** — path: create the named area (often itself a menu-adjacent Ladder deliverable) | noted, doesn't block |
| documented-n-a | prerequisite waived if the n/a rationale covers it; otherwise not offered | ignored |
| informational | doesn't gate | doesn't gate |
| placeholder / not in run | **not evaluated** — item resolves "unresolved: pending assessment," never "not yet" | same |

The last row is load-bearing: board-003 evaluated all 83 subcategories, but placeholder states (B-11) and any future partial run leave entries unevaluated, so the resolver must distinguish *not evaluated* from *absent* — the same three-outcome discipline the diagnosis itself follows. Silence is not absence, in the menu too.

Item-level disposition: all required met → **available** (recommend per catalog logic); any required not-yet → **not yet**, with every unmet path listed; catalog says structurally inapplicable (e.g. no recurring billing) → **not offered**; net-new items → **pilot** regardless of the above, per catalog.

## 2. The mapping (RULED — B)

Tags: (R) required, (S) supporting. OPERATOR-FACT items in §3.

**1. Meeting & call capture** — GTM-11 CRM/pipeline system-of-record (R, for the CRM-sync half; corpus destination is met by construction on Ladder deployments).

**2. Records freshness & enrichment** — OPS-01 ownership map (R — enriching an unowned store is the multiply-noise failure); GTM-11 CRM (R where the target is contact records); OPS-05 vendor inventory (S); OPS-06 asset inventory (S).

**3. Drafting from company material** — OPS-01 ownership map (R — a review owner must exist); the per-document-type gap comes from the board itself, so no further static mapping; generation-pipeline gates (mode system, professional review, excluded classes) apply downstream and are not re-encoded here.

**4. Bill payment & ledger sync** — FIN-01 accounting system of record (R); OPS-07 change/approval practice (R); OPS-01 ownership (S); OPS-04 process runbook (S).

**5. Continuous compliance monitoring** — COMP-01 security-assurance posture (R); OPS-06 identity/access management (R); ENG-05 reconstructible infrastructure (S); OPS-01 owner for findings (S).

**6. Failed-payment recovery** — no taxonomy gate (adjacent GTM entries don't attest billing existence). Resolves purely on operator-facts.

**7. Onboarding/offboarding cascade** — PEOPLE-03 onboarding program (R for the onboarding half); OPS-04 on/offboarding runbook (R); OPS-06 access de-provisioning (R for the revocation piece, which the catalog recommends at any size — so the revocation sub-recommendation gates only on OPS-06).

**8. Inbound lead handling** — GTM-07 documented ICP (R); GTM-11 lead-handling/routing (R); GTM-13 documented sales motion (S).

**9. Customer-health scoring** — PRODUCT-05 product metrics (R); GTM-11 CRM (R); GTM-18 onboarding/success playbooks (R — written playbooks are the catalog's hard line).

**10. Whole-corpus intelligence** — no subcategory gate; corpus is met by construction, the "deployed diagnosis" prerequisite means a completed board run exists. Pilot disposition.

## 3. Intake questionnaire (RULED — C)

The facts the board cannot attest — the only part of resolution that requires asking the company. Eight questions, all short-answer:

1. Recurring billing live? On what platform? (gates item 6)
2. Approval chain for spend defined, even informally? Who? (item 4)
3. Cloud infrastructure + identity provider in use? Which? (item 5)
4. Buyer pressure for security attestation — current or expected within 12 months? (item 5 disposition)
5. HRIS or equivalent employee system of record? (item 7)
6. Hiring velocity — hires expected next 12 months? (item 7 volume threshold)
7. Inbound lead volume — rough monthly count? (item 8)
8. Customer account count? Product telemetry captured anywhere? (item 9)

Plus one classification taken from the operator per company, not the questionnaire: any system-of-record that is actually an unowned spreadsheet (item 2's disqualifier).

## 4. Open item carried

Canonical short labels for subcategories don't exist in the schema; resolver output uses derived plain names pending authored labels.
