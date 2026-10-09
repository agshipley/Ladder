# Generation templates

When the board finds an **artifact gap**, meaning a missing document whose existence and quality
are the requirement, Ladder drafts that document from the company's own material. Each template
fixes the document's outline and rules, so the template decides the scope and the company's corpus
supplies the substance.

| Template | Document |
|---|---|
| [`capital-plan.yaml`](capital-plan.yaml) | Capital Plan |
| [`compensation-framework.yaml`](compensation-framework.yaml) | Compensation Framework |
| [`engineering-reference-docs.yaml`](engineering-reference-docs.yaml) | Engineering Reference Documentation |
| [`hr-policy-handbook.yaml`](hr-policy-handbook.yaml) | HR Policy Handbook |
| [`legal-draftable-policies.yaml`](legal-draftable-policies.yaml) | Posted Policies & Compliance Posture |
| [`onboarding-success.yaml`](onboarding-success.yaml) | Onboarding & Customer Success Definition |
| [`operating-ownership-map.yaml`](operating-ownership-map.yaml) | Ownership & Accountability Map |
| [`operating-runbooks.yaml`](operating-runbooks.yaml) | Core Operating Runbooks |
| [`pmf-assessment.yaml`](pmf-assessment.yaml) | Product/Market-Fit Assessment |
| [`product-metrics.yaml`](product-metrics.yaml) | Product Metrics & Analytics Definitions |
| [`product-process.yaml`](product-process.yaml) | Product Process & Definition |
| [`revenue-metrics.yaml`](revenue-metrics.yaml) | Revenue & GTM Metrics Definitions |
| [`sales-enablement.yaml`](sales-enablement.yaml) | Sales Enablement Pack |
| [`values-operating-principles.yaml`](values-operating-principles.yaml) | Values & Operating Principles |
| [`vendor-inventory.yaml`](vendor-inventory.yaml) | Vendor Inventory & Management |

## Anatomy of a template

- **`applies_to`** lists the reference-model areas the document closes (for example `CAP-01`).
- **`sections`** fixes the outline. Each section names its required content and a **fill mode**:
  - `corpus`: written from evidence retrieved from the company's documents, with citations;
  - `recommend`: standard practice the company's materials don't reflect yet, marked *Recommended*;
  - `operator`: a decision only the company can make. The draft states the question and any candidate
    answers found in the corpus, marks it *Decision required*, and resolves nothing;
  - `structural`: an always-present section that gathers every open decision in one place.
- **`exclusions`** lists what the document must never contain, for example benchmark pass/fail
  thresholds presented as judgments, or internal reference-model codes in a customer document.
- **`professional_review`** names any attorney or HR review that must be recorded before the
  document can be finalized.

Templates are expert-authored and versioned. The method behind each one (research, challenge and
ruling) is recorded in [`docs/working-notes/generation/`](../docs/working-notes/generation/), and the
pipeline that runs them is specified in
[`reference-model/GENERATION-STANDARD.md`](../reference-model/GENERATION-STANDARD.md).
