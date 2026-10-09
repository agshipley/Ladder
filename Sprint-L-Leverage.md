# Sprint L — Leverage: The First Automation Loop

**Layer:** Leverage (Layer 3)
**Goal:** design and implement ONE closed automation loop on a matured company function — the SDR/GTM loop — using the corpus as both input and beneficiary.
**Depends on:** Sprint M (corpus) and Sprint Ma (a matured function: CRM, scheduler, talk track, KPIs must exist).
**Status:** the first leverage deliverable became a board-qualified automation menu and resolver ([`leverage/MENU-CATALOG.md`](leverage/MENU-CATALOG.md), [`leverage/RESOLVER-MAPPING.md`](leverage/RESOLVER-MAPPING.md)), which decides which loops a company is ready for. The single SDR loop scoped below remains the plan for the first live loop.
**Nature:** an R&D spike toward one narrow, real loop — not a general automation platform. This is the highest-value, least-proven, deepest-integration work in the product. Approach it as an experiment with an explicit go/no-go, not a feature with a delivery date.

---

## Framing (read before scoping)

Leverage is the ambitious destination. Memory and Maturity are the proven base that earns the right to attempt it. Do not build a general automation engine. Prove ONE loop end to end, learn what live integration actually costs, then decide whether and how to generalize. The roadmap's leverage go/no-go gates this sprint, and a second go/no-go follows the first loop attempt.

---

## Task 1 — Confirm the base is real

Do not start until, for the target function (GTM):

- the corpus holds the GTM material (transcripts, pipeline data) — from Sprint M;
- the maturity layer has closed the prerequisite gaps — a CRM exists, a scheduler exists, a talk track and KPIs exist — from Sprint Ma.

If any prerequisite is missing, the loop cannot close. This task is a checklist, not a build. If the base is not there, the answer is "finish Maturity first," not "build the loop anyway."

---

## Task 2 — Design the loop (on paper first)

Specify the closed loop before implementing any of it:

**GTM strategy → CRM → scheduler → call → outcome data → back into GTM strategy and CRM.**

Concretely, the SDR loop:

1. Pipeline leads in the **CRM** are automatically fed into **scheduled calls** for each SDR / AE / VP of Sales.
2. Calls are **automatically recorded**; transcripts flow **back into the CRM** as structured notes and **into the corpus** as new memory.
3. Call outcomes trigger **automated follow-up tracks** (next touch, next task) without manual bookkeeping.
4. Aggregate outcome data flows **back into GTM strategy** — which segments convert, which talk-track patterns win, which KPIs move — feeding the next quarter's targets and refining the talk track.

For each arrow, identify: the source system, the destination system, the integration mechanism (API, webhook, MCP tool), the data shape, and the failure mode if it breaks. **The integrations are the hard part** — live coupling to third-party operational tools is brittle and per-tool. Name every external dependency here.

---

## Task 3 — Implement the narrowest viable slice first

Do not build all four arrows at once. Pick the single arrow with the highest value and lowest integration risk — likely **call transcript → back into CRM + corpus** (it reuses the ingestion the Memory layer already does). Prove that one arrow end to end. Then add arrows one at a time, verifying each before the next.

**Verification scope:** each arrow touches live external systems and real company data. This is high-risk, tracked-corpus-grade territory — full verification, not a dry-run glance. A broken automation writing bad data into a CRM is a real harm, not disposable infrastructure.

**Restraint (product principle, enforced here):** automate an arrow only where it earns its place. Where a step is better left human, document that decision explicitly rather than automating for its own sake. The "we chose not to automate X because Y" record is part of a mature AI plan and a first-class output of this sprint. The restraint principle is governed by reference-model/GAP-CLASS-DOCTRINE.md: loop prerequisites are system- and practice-class gaps, and are never satisfied by generated documents.

---

## Task 4 — Close the loop and measure

Once the arrows are individually proven, connect them and run the full loop on real (or realistically staged) GTM data. Measure: does each cycle actually enrich the corpus? Does the enriched corpus measurably improve the next cycle (better talk track, better segmentation)? The self-reinforcing property is the entire claim — verify it is real, not asserted.

---

## Acceptance criteria

- The loop is fully designed on paper with every external integration and failure mode named (Task 2).
- At least one arrow is implemented and proven end to end against live systems with full verification.
- Any "chose not to automate" decisions are documented with rationale.
- If the full loop is closed: evidence that each cycle enriches the corpus and the enriched corpus improves the next cycle.
- A written go/no-go recommendation on generalizing the loop pattern to other departments (fundraising/IR, HR, product, legal), grounded in what the first loop actually cost to build.

---

## Explicitly out of scope

- A general, department-agnostic automation platform. Generalization is a *decision* this sprint informs, not work this sprint does.
- Any loop whose prerequisite maturity gaps are not yet closed.
- Automating steps that are better left human "because we can."
- Multi-tenant anything.

---

## The honest note

This sprint may reveal that live automation integration is harder or more brittle than the value justifies at this stage — in which case the correct output is a documented "not yet, here's why, here's what would change the answer," and the product ships strong on Memory + Maturity while Leverage matures. That is a legitimate and valuable result, not a failure. Leverage is the destination Ladder climbs toward; this sprint tests the first step of the climb.
