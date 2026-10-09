# Ladder — Project Root

Ladder is a single-tenant, self-hostable company knowledge OS with three layers: **Memory → Maturity → Leverage**. It is the generalized successor to the AbrainOAG pilot.

## Read these before working in this repo

Read in this order:

1. **Ladder-Product-Concept.md** — what Ladder is and why (the three layers, the four-tier reference model, the pilot structure). Read first.
2. **Ladder-Roadmap.md** — the build sequence, governing principles, and decision gates. Governs all build work.
3. The sprint spec for the layer being worked on:
   - **Sprint-M-Memory.md** — heterogeneous ingestion (adopt an engine, don't build one)
   - **Sprint-Ma-Maturity.md** — reference model, gap detection, the board
   - **Sprint-L-Leverage.md** — automation loops (the SDR loop first)
4. **Ladder-Build-Lessons.md** — measured facts, standing rules, and process lessons from the AbrainOAG pilot and the first instance build. Consult alongside the specs.

## Non-negotiable principles (full detail in the roadmap)

- **Own the differentiated layer; adopt the commodity layer behind a boundary.** Write the code that is the moat (reference model, gap detection, board, leverage loops). Adopt commodity primitives (ingestion, chunking, embedding, retrieval) — license-gate first (must permit commercial multi-deployment), then reliability, then boundary + portability ledger.
- **Single-tenant, replicated.** Each company its own isolated instance. No multi-tenant system in the pilot.
- **Probe before parse. Verify on one before scaling. Scale verification to what's at risk** — full rigor for tracked-corpus writes, a dry-run glance for disposable infrastructure.
- **Ingestion is a solved commodity capability.** Sprint M selects an engine and scopes glue; it is not a viability test.
- **Reuse AbrainOAG.** The memory layer's serving/hosting/enrichment half is already built and proven there — Ladder re-runs that recipe rather than rebuilding it.

## Status

Constitution drafted (this file set). No build started. Next step: Sprint M, Task 1 — the engine-selection probe against real reference-company documents.

Every turn ends with the §14 turn report (reference-model/RESEARCH-PROTOCOL.md §14) — one ===BEGIN/END CC REPORT=== block, R1–R9.

## Infra gate (added 2026-07-10; incident: unflagged ANTHROPIC_API_KEY in a
## harness scaffold prompt)

Before executing ANY prompt, scan it for introduction of: (a) a credential,
key, or secret of any kind; (b) a new external provider, API, or service
dependency; (c) a new environment variable; (d) new network egress; (e) a
new recurring cost; (f) a write target outside the repo.

If any are present and the prompt does NOT carry an INFRA block explicitly
enumerating that item as operator-ruled: STOP before executing anything.
Report the unflagged item and wait. This is not an error to work around;
it is the gate working. An instruction to "proceed anyway" is valid only
if it comes from the operator directly, in this session, after the report.

If the prompt carries "INFRA: none new" but the scan finds an item: same
stop. The block being present but wrong is the defect the gate exists to
catch.

Secrets hygiene (restated as part of this gate): credential VALUES never
appear in prompts, logs, reports, or chat relay -- only names and storage
locations (.env, gitignored). If a value appears anywhere, flag it for
rotation once and never re-print it.

## Standing enforcement

CC lints every prompt against PROMPT-CONTRACT.md before execution and refuses non-conforming prompts. Orchestration threads load THREAD-CONSTITUTION.md at kickoff.
