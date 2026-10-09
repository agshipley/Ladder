# GENERATION-STANDARD.md — the doctrine of record for generated documents

Version 1.0 — ruled 2026-07-17.

Ladder generates customer-facing documents (metrics definitions, policies, registers) to
close artifact-sufficient gaps. This is the standard every generated document is held to.

## Ruled rules (verbatim)

> Operator review is by exception. The corpus supplies business context and evidence, never
> scope. Stages 3-5 are pre-approval scaffolding outside the provenance firewall: nothing in
> them touches the corpus or the diagnostic judge.

> Templates are completeness contracts, not content. Every generated document is bespoke:
> content comes from the customer's corpus, stage-conditional sections, and operator rulings.
> The template guarantees the document confronts everything its type requires — it never
> supplies uniform text across customers. Two customers' documents from the same template
> should read as two different companies' documents that both pass the same completeness bar.

## Pipeline of record — six stages

Every generated document passes through these stages in order. Stages 3-5 are pre-approval
scaffolding: they run on the draft before the operator sees it, they never write to the corpus,
and they never invoke the diagnostic judge (they are outside the provenance firewall).

### 1. Template (authored)
An operator-ruled template drives the document. It is authored expert judgment, versioned as a
product asset, and **authority-stamped**: it carries the date its content standard was last
checked and a re-check interval, per the REFRESH discipline (see `REFRESH.md`). The template
declares sections, each with `required_content`, a `fill_mode`, and any `conditionality`. The
template sets the completeness contract; it never supplies customer content.

### 2. Per-section corpus fill
The template drives the outline; **the corpus never sets scope**. Each section is filled per its
`fill_mode`:
- **corpus** — content sourced from the customer's materials, cited inline to a real chunk.
- **recommend** — the standard practice, marked "Recommended — not currently evidenced in your
  materials."
- **operator** — a question the draft cannot answer; it states the question and the candidate
  answers found, and resolves nothing.
- **structural** — an always-present scaffold section (Open Rulings) that aggregates every
  operator item.
Retrieval is per section and excludes test/probe artifacts.

### 3. Mechanical validator (deterministic, no model calls)
`scripts/classifier/validate-draft.ts`. Deterministic checks (see that file for the list):
every section present or explicitly deferred with its conditionality reason; every citation
resolves to a real corpus chunk (hallucinated citations FAIL); zero internal vocabulary in the
deliverable; no test-artifact sources; uncited substantive claims flagged; Open Rulings non-empty
when any operator-mode section exists. **A validator failure fails generation loudly — the draft
never reaches the review queue, and the reason is logged.**

### 4. Structural self-review (model)
`scripts/classifier/review-structure.ts`. One template-aware model call: a per-section verdict
(pass / thin / fail) with a one-line reason, checked against the template's `required_content`.
Attached to the draft record and rendered beside the coverage map. Thin/fail **do not block** —
the operator sees them; only validator failures block.

### 5. Authority review (model + web search)
`scripts/classifier/review-authority.ts`. A model call with web search enabled. Per section: is
the stated content the current standard formulation; is anything material missing for this
document type at this stage; is `recommend` content outdated. Output is a findings list, each
`{section, finding, source name+year, url}`. Findings are **applied as flagged revisions**
(`[authority: source, year]`); findings that conflict with corpus facts or with the template's
operator fill-modes are routed to **Open Rulings, never silently applied**. Source eligibility is
governed by an adoption-agenda screen (a source is eligible only if it is a recognized external
authority for the document type — not a vendor selling the outcome, not marketing content). The
full report, with its check date, is attached to the draft record.

### 6. Exception surface to operator
The operator reviews **by exception**: open rulings + coverage map + authority report + a
spot-check. A full read of the whole document is required only for the **first instance of each
new template**; thereafter the operator trusts the pipeline and reviews the exceptions.

## Deliverable-form rules (ruled 2026-07-17)

> The deliverable reads as a document a competent operator wrote. Pipeline vocabulary,
> fill-mode labels, routing language, and chunk-level citations never appear in deliverable
> prose. Full provenance lives in the sidecar; the deliverable carries light references.

Concretely, in the deliverable that the operator reviews and adopts:
- **Citations are light.** Prose carries numbered references `[1]`, `[2]` that resolve in a
  **Sources** section at the document end, listing document TITLES only — no slugs, no chunk
  numbers. The full reference → {document, slug, chunk id} map lives in the sidecar; the review
  surface makes a reference clickable to the underlying chunk.
- **No repeated boilerplate.** "Recommended" and "Decision required" are stated ONCE in a short
  preface and then carried as a light lead-in per item, not a repeated sentence. Authority
  sources join the reference system under an **External references** subhead. "Routed to Open
  rulings" never appears — the Decisions-required section aggregates them.
- **No pipeline labels.** Fill-mode labels (CORPUS/RECOMMEND/OPERATOR), template annotations
  (PRIORITY-FLAG), and template section-status terms (filled/deferred/open-ruling) never appear
  in deliverable prose or DOCX — the review surface expresses them as UI chips; emphasis is
  plain English. The mechanical validator FAILS a deliverable that contains any of them.
- **Open rulings are an answer form.** They render as a plain-language, diligence-questionnaire
  question list; each question takes an operator answer that persists and can be injected back
  into a regeneration as a company ruling.

## 07/18 additions — citation-truth checks, adversarial gate, model routing

Calibrated by the `loop/maturity` framing test, which reproduced the operator's five-fail review
5/5 with blind, independent personas and caught defects the pipeline gates had passed as "ready".

**Model routing (ruled 07/18).** Generation (stage 2), structural self-review (stage 4), authority
review (stage 5), and the adversarial gate (stage 6) all run on **claude-sonnet-4-6** (the cost
point). **Opus remains ONLY the diagnostic judge** (`scripts/classifier/judge.ts`). Override the
generation-side model with `CLASSIFIER_GEN_MODEL`. Authority behaviour is otherwise unchanged, with
one addition: **cached findings are reused on regenerate** (per template version) so no fresh web
search runs unless the template version changed.

**Citation-truth checks (stage 3, deterministic — the fabrication finding).** In addition to the
existing chunk-id resolution:
- **Quoted attributions are verbatim-verified.** For every quoted string attributed to a chunk, the
  quote (normalized whitespace) must appear in the cited source's text — not merely that the chunk
  id resolves. A fabricated quote FAILS generation. Paraphrased citations (no adjacent quote) are
  logged as claim+chunk pairs to the sidecar for reviewer visibility, not asserted. Unverifiable
  citations (no source slug/body to check against) are skipped, never false-failed.
- **No duplicate sections.** A repeated `## <title>` (the doubled Decisions-Required defect) FAILS.
- **No future-dated citations.** A parseable date strictly after today FAILS (a bare current-year is
  present, not future).
- **External-reference check (deterministic, post-deliverable).** Every external reference must carry
  a URL, and no authority source may be future-dated. Runs after the deliverable-form transform.

**Adversarial gate (stage 6, BLOCKING — model, blind).** `scripts/classifier/adversarial.ts`. A
fresh-context persona review of the finished deliverable (a recipient's view): the reviewer sees
ONLY the persona framing + the artifact text — no template, no criterion, no pipeline exhibits, no
prior verdicts, no hint it is pipeline output. Persona is chosen by category (CRO/GTM, GC/legal,
HR/people, CFO/finance-capital, CPO/product, COO/ops, VP-Eng/engineering, AI-ops lead/aiops). No web
search. Verdict contract: **client-ready | adequate-with-reservations | not-client-ready**.
- **not-client-ready BLOCKS** — the draft never reaches the pending queue; verdict + deficiencies
  are logged as a generation failure.
- **adequate-with-reservations passes** with the reservations attached to the sidecar and rendered
  on the review surface.
- **client-ready passes clean.**
The gate runs on BOTH artifact-mode deliverables and plan-mode gap-closure plans.

The pipeline is now seven stages: 1 template, 2 fill, 3 mechanical validator (+ citation-truth),
4 structural self-review, 5 authority review (cached), 6 adversarial gate, 7 exception surface to
operator.

## Firewall boundary

Stages 3-5 are pre-approval scaffolding **outside the provenance firewall**. They read the draft
and (stage 3/5) query the store or the web for validation only. They never write to the corpus,
never change a diagnostic verdict, and never enter judge context. Adoption of an approved draft
into the corpus is the separate, operator-run `adopt-draft.ts` step, which alone touches the
corpus and re-judges the single tile.
