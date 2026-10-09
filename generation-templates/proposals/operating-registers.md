# PROPOSED — awaiting operator ruling: operating-registers

Tiles: OPS-01 (ownership map), OPS-04 (runbook set), OPS-05 (vendor inventory).
Fabrication risk: low. **RULING: one register-family type with three sub-artifacts, or three
separate types? Proposed as one family (shared register shape: entries + named owner + currency);
operator may split.**

## Sections (proposed — sub-artifact per section group)
A. Ownership map (OPS-01) — fill_mode: corpus + operator — one named owner per function the company
   actually runs (product, GTM, finance ops, vendor, infra, physical ops). Form free (Accountability
   Chart / DRI register / RACI). RULING: the owner assignments are operator decisions.
B. Core runbook set (OPS-04) — fill_mode: corpus + recommend — written SOPs for the load-bearing
   processes (deploy, onboarding, incident, on/offboarding); "load-bearing" is stage-scoped.
   RULING: which processes are load-bearing for THIS stage.
C. Vendor inventory (OPS-05) — fill_mode: corpus + operator — single source of truth (cloud, SaaS,
   contractors, subprocessors), critical vendors named + owner + risk tier; renewal/intake ritual.
   RULING: risk tiering thresholds; "not in inventory = not approved" adoption.
D. Currency + owner on every entry — fill_mode: structural — last-reviewed date per artifact.
E. Decisions required — fill_mode: structural.

## Operator-ruling points (6)
- One type vs three; owner assignments; load-bearing process set; vendor risk-tiering; the intake
  norm; the currency/review cadence.
