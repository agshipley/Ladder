# CRITERIA.yaml Fidelity Position — v3 (RULED, 2026-07-10)

**Status:** RULED by operator 2026-07-10: Option D as amended — LLM judge reading verbatim-normative criterion prose, carried in CRITERIA.yaml with structured handles. Supersedes v1/v2. Parked for execution at 9E-a Pass C (schema draft) and 9E-b (population). This document is the complete Pass C/9E-b handoff; no re-litigation.

---

## 1. The ruled design, in one line each

- **The decision that was actually open:** when criteria move from briefs into CRITERIA.yaml, the criterion text is carried **verbatim as prose (normative)**, never translated into structured fields. Everything else (LLM judge, batch shape, YAML-as-interface) was already spec (Sprint Ma Task 2).
- **Why D:** the judge is an LLM and consumes prose natively; translation of judgment-dense prose into fields is loss with no compensating gain. **D is E (judge reads raw briefs) plus addressability** — the YAML adds handles: stable IDs, a closed state enum, trigger classes, versioning. Nothing more.
- **The design is a deliberate A+D hybrid:** structured fields (states, triggers, conditionality class, grain) are the deterministic layer for genuinely mechanical facts; verbatim prose + LLM is the judgment layer. The line sits at "decidable without judgment."
- **Determinism tax, accepted:** an LLM judge can waver run-to-run where rules never would. Mitigations: enum-constrained structured output, fixed low temperature, golden fixtures as the regression tripwire. The checklist product is what refusing to pay this tax buys.

## 2. Schema rules (Pass C)

**First line of the schema spec — the clerk guardrail: structure only what a clerk could fill in without judgment; everything else is prose.**

Fields: subcategory ID; verbatim-normative `criterion:` prose; full ruled-state enum (incl. B-11 placeholder, B-13 three-outcome, B-22 documented-n/a, B-20 informational, trigger-registry, loop-ready); `grain:` (machine-carried, e.g. `whole-artifact` on all COMP entries); `conditionality:` class; `references:` (B-numbers, T-codes); non-normative `signals:`; provenance tag; refresh flags; version.

In-file **`definitions:` block**: trigger registries, operative text of referenced B-rulings, state vocabulary. Referents exist once; no per-subcategory inlining.

Explicit non-assumption, recorded in the schema: one-call-per-subcategory is a cost model for absence/thinness only; inconsistency detection is cross-entry and needs a different call shape. The schema must not foreclose it.

## 3. Single normative copy (Amendment 1)

From the 9E-b landing forward, the YAML-embedded criterion text is the **sole normative copy**. Same commit: each brief's criterion text is replaced with a pointer — "Normative criterion text: CRITERIA.yaml `<id>` (as of vX.Y)." Briefs stay canonical for authority sets, arbitrations, cross-reference maps, calibration plans, ruling logs. Divergence becomes structurally impossible (rejected alternative: dual copies + identity check — enforcement infrastructure rots silently). Future amendments edit YAML text + brief ruling log, never two copies of one sentence.

## 4. Resolution closure (Amendment 2)

The harness is **contractually required** to assemble each call as: subcategory entry + every referenced definition (closure computed from `references:`). An unresolvable reference is a commit-time lint failure, never a runtime guess. Lint also checks structured fields against embedded prose.

## 5. Golden fixtures are the gate (Amendment 3)

~40–50 fixtures across the model: evidence snippets with operator-ruled correct outputs, weighted toward flattening-prone states (documented-n/a, not-ingested, trigger-not-met, informational, affirmatively-not-a-gap). Drafted with proposed verdicts; operator rules by exception (~1 hour, during 9E-b while reasoning is fresh). They are: the 9E-b acceptance gate, the regression suite for criterion amendments, the drift detector for underlying-model swaps, and the seed of the product's own eval harness (standing principle: Ladder defines "good" for itself or carries the flaw it diagnoses). Fixtures guard both failure directions — false reds AND false greens. Smoke test retained: mechanical transcription spot-check of structured fields on a sample. **Bloat guard: fifty, not five hundred.**

## 6. Absence requires exhaustion (Amendment 4)

An absence verdict is more expensive than a presence verdict: before emitting genuine-absence, the harness runs an exhaustive full-text sweep over the corpus using the non-normative signals (the one legitimate diagnostic use of signals — a recall backstop against the ingested-but-not-retrieved hole, the sole unbounded false-red path). **Guardrail: the sweep escalates candidates to the judgment step only; it never renders presence.** Trivial cost at pilot scale (~2,600 chunks). Note: a false "present" remains trust-damaging even with attached evidence; the sweep guards the worse failure, fixtures guard both.

## 7. Output contract + architecture rules

- Output contract with input-grade rigor: state constrained to the enum; criterion ID echoed; condition-applied named; evidence attributed. An unconstrained "vibes-orange" is a schema violation.
- **Dashboard never runs evaluations (ruled explicitly, not absorbed):** evaluation is a background batch job writing to a results store; the board is a fast view over stored results; corpus change → async incremental re-eval → board updates. Consistent with Task 4's thin-replaceable-view rule.
- Economics of record: ~73 calls/full board, single-digit dollars, prompt caching ~90% after run one, incremental re-scoring via ingest-log deltas ≈ pennies. Embeddings run on **OpenAI text-embedding-3-large** (3072-dim, permanently bound to this gbrain instance; `openai:` prefix required) — correction of record, cost conclusion unchanged.

## 8. Guards that stay armed (operator suspicion, codified)

Schema field-creep (every field beyond clerk-decidable is flattening risk wearing a helpful face); fixture bloat; harness gold-plating. Pass C reviews against these three by name.
