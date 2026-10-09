# PROPOSED — awaiting operator ruling: engineering-reference-docs

Tiles: ENG-01 (architecture + ADR + debt register), ENG-08 (README/setup + runbooks + API description).
Fabrication risk: MEDIUM — **a generated README that does not match the real toolchain is "worse than
none" (ENG-08 criterion); architecture/ADR content must reflect the real system, not a plausible one.**

## Sections (proposed)
1. Architecture overview (ENG-01) — fill_mode: corpus + operator — components, data stores, external
   boundaries a senior outside engineer can navigate. RULING: must reflect the ACTUAL system
   (corpus/code-derived); never a plausible-but-wrong diagram.
2. Decision rationale / ADR (ENG-01) — fill_mode: corpus — consequential decisions dated + traceable,
   supersessions visible. RULING: ADRs are HISTORICAL — cannot fabricate past decisions; scaffold the
   log + prompt for real ones.
3. Deliberate-shortcuts / debt register (ENG-01) — fill_mode: corpus + operator.
4. Setup documentation (ENG-08) — fill_mode: corpus — a README a new engineer can build+run from,
   against the CURRENT toolchain. RULING: must be operator-VERIFIED to actually work (worse than none if stale).
5. Runbooks (ENG-08, multi-home ENG-03/04) — fill_mode: corpus + recommend.
6. API description (ENG-08, conditional) — fill_mode: corpus — OpenAPI-class where an external API exists.
7. Decisions required — fill_mode: structural.

## Operator-ruling points (5)
- Architecture accuracy source (code vs corpus); ADR back-fill (real decisions only); README
  verification requirement; runbook ownership boundary (ENG-03/04); whether an external API exists.
