# The reference model

The reference model describes what an operationally mature early-stage company maintains, area by
area, and what "complete" means for each. The maturity board scores a company's real documents
against it. It is organized as **11 categories and 83 operating areas**, scoped to **Band 1**:
seed-funded B2B software companies before a Series A, under US law.

## How to read it

Start with [`TAXONOMY.md`](TAXONOMY.md) for the categories and the boundary rules between them, then
open the criteria in [`CRITERIA-SCHEMA.yaml`](CRITERIA-SCHEMA.yaml). For the reasoning and sources
behind any category, read its brief.

| Category | Code | Areas | Brief |
|---|---|---|---|
| Go-to-market | GTM | 16 | [`gtm/BRIEF.md`](gtm/BRIEF.md) |
| Legal | LEGAL | 10 | [`legal/BRIEF.md`](legal/BRIEF.md) |
| Operations | OPS | 9 | [`ops/BRIEF.md`](ops/BRIEF.md) |
| Engineering | ENG | 8 | [`engineering/BRIEF.md`](engineering/BRIEF.md) |
| Finance | FIN | 8 | [`finance/BRIEF.md`](finance/BRIEF.md) |
| People | PEOPLE | 8 | [`people/BRIEF.md`](people/BRIEF.md) |
| Capital | CAP | 7 | [`capital/BRIEF.md`](capital/BRIEF.md) |
| Product | PRODUCT | 6 | [`product/BRIEF.md`](product/BRIEF.md) |
| AI operations | AIOPS | 5 | [`ai-operations/BRIEF.md`](ai-operations/BRIEF.md) |
| Compliance | COMP | 3 | [`compliance/BRIEF.md`](compliance/BRIEF.md) |
| Vision | VIS | 3 | [`vision/BRIEF.md`](vision/BRIEF.md) |

## How it was built

Each category came out of a structured research run under the
[research protocol](RESEARCH-PROTOCOL.md). Criteria have to trace to citable sources from different
genres. Statute and regulation carry the most weight where they apply, and other genres
(model document sets, investor due-diligence lists, practitioner literature) are weighted below them.
A criterion is unconditional only when primary authority makes it so. Every criterion carries a provenance tag: **authority-backed**, **expert-authored** or
**corpus-observed**.

The model was then **calibrated** against the documents of a real, mature seed-stage company
(anonymized throughout as "the reference company"). That company is a test case, never an oracle:
when it lacks something the authorities require, that is a finding about the company. The
**AI operations** category is authored from expertise rather than observed, because the reference
company predates the requirement.

## Methodology documents

| Document | What it governs |
|---|---|
| [`TAXONOMY.md`](TAXONOMY.md) | Categories, band declaration, and the numbered boundary rulings (B-1, B-2, …) that decide which category owns a borderline document |
| [`CRITERIA-SCHEMA.yaml`](CRITERIA-SCHEMA.yaml) | The 83 areas: criteria per area, conditional activation rules, and expected elements. This is the schema the classifier and judge read |
| [`RESEARCH-PROTOCOL.md`](RESEARCH-PROTOCOL.md) | How categories are researched, source weighting, the cross-reference rule, and the stop rule |
| [`GAP-CLASS-DOCTRINE.md`](GAP-CLASS-DOCTRINE.md) | Artifact, system and practice gaps, and which of them generation may close |
| [`GENERATION-STANDARD.md`](GENERATION-STANDARD.md) | The generation pipeline stages, model routing, review gates and document approval |
| [`CRITERIA-YAML-FIDELITY.md`](CRITERIA-YAML-FIDELITY.md) | Why the judge reads criterion prose verbatim, with structured handles alongside |
| [`BOARD-REVIEW-PROTOCOL.md`](BOARD-REVIEW-PROTOCOL.md) | How a human reviewer sorts board verdicts into bins (corpus right / world wrong, and so on) |
| [`LIFECYCLE.md`](LIFECYCLE.md) | How the model changes after a category lands: amendments, refreshes, calibration feedback |
| [`REFRESH.md`](REFRESH.md) | The refresh queue: which criteria are due to be re-checked against their sources, and why |
| [`MODEL-DOC-SOURCES.md`](MODEL-DOC-SOURCES.md) | Sources for model documents used as generation seeds, each license-checked |
| [`VOICE-DISCIPLINE.md`](VOICE-DISCIPLINE.md) | The plain-language rules for anything a customer reads |

## Conventions

- **Area codes** such as `GTM-07` or `LEGAL-09` identify an operating area in the schema.
- **"Operator ruling"** with a date marks a design decision made by the project lead. The briefs keep
  these as an audit trail of how each criterion was settled.
- **B-numbers** (B-6, B-13, …) are boundary rulings recorded in `TAXONOMY.md`.
- **Board states:** *evidence-found* (in place), *thin* (needs work), *genuine-absence* (missing),
  *not-ingested* (couldn't see it), *documented-n-a* (doesn't apply), *placeholder* (held separately
  by policy), *informational* (shown, never scored).
