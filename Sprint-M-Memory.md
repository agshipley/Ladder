# Sprint M — Memory: Heterogeneous Ingestion

**Layer:** Memory (Layer 1)
**Goal:** ingest a company's heterogeneous documents into an owned, queryable, cross-linked corpus — generalizing AbrainOAG's conversation-only pipeline to arbitrary real-world formats, with meaning preserved.
**Depends on:** nothing above it. This is the foundation.
**Proven base:** AbrainOAG's serving/hosting/retrieval/enrichment stack works. The net-new work is the ingestion front-end.

---

## The one question this sprint answers

Heterogeneous document ingestion is a solved commodity capability — dozens of companies do it daily, and the tooling is mature. The open question is not *whether* it can be done. It is: **which license-clear engine produces output closest to what Ladder's maturity layer needs, and how much thin custom glue sits between that engine's output and a good vault entry?** This sprint is an engine-selection-and-scoping exercise, not a viability test. The answer is "engine X, plus this much glue," never "we confirmed ingestion is possible."

---

## Task 1 — The selection probe (scope the glue, pick the engine)

**Do this before committing to an engine.** Take a small, deliberately diverse sample of real reference-company documents:

- one structurally complex spreadsheet (a cap table or financial model — where meaning lives in structure, not prose);
- one deck (where layout and flow carry meaning);
- one image-heavy or diagram file (where meaning is visual);
- one plain-prose document (Word/PDF) as a control.

Run each through two or three license-clear candidate engines (Task 2 lists them). For each engine × file, answer:

- What comes out? (Paste the raw extraction.)
- How close is it to what the maturity layer will need? (Not "did it extract" — did the cap table's ownership relationships survive in usable form, or is it a wall of numbers that needs restructuring?)
- What thin transformation would turn this engine's output into a good vault entry? (This is the glue to scope, and it defines the per-format taxonomy.)

**Decision (not a viability gate):** pick the engine whose output needs the least glue to reach a usable vault entry, and record the per-format entry taxonomy plus the glue scope as the spec for Task 3. If every license-clear engine needs heavy glue on the structure-heavy files, the decision is "write more glue" or "pick a different engine" — an effort-and-selection call, never a go/no-go on the product. Ingestion working is assumed; the output is which tool and how much glue.

**Verification scope:** this is a read-only comparison on copies. Light rigor. No infrastructure built yet.

**Resolved (probe complete):** Unstructured preserves enough structure to feed the maturity layer — verified on the reference company's cap table (a multi-column ownership table, aligned to headers via `text_as_html`). Engine choice holds.

Two rules the glue is built around:
1. Tables consumed from `text_as_html`, never `.text` — `.text` collapses empty cells and breaks column alignment.
2. An empty partition result (0 elements, no exception) triggers verify/reject — Unstructured can swallow an internal failure (e.g. SSL cert error) and return empty silently.

Env fixes for reproducible ingestion setup: pinned `cryptography`/`numba` wheels, `numpy<2` (torch ABI), `SSL_CERT_FILE` via certifi.

Per-format glue scope: xlsx non-trivial (multi-sheet table HTML); docx trivial (concat); pptx moderate (group by slide + table rule); pdf trivial + empty-guard.

---

## Task 2 — Engine selection (adopt, don't build; license gate first)

Ladder does not write a heterogeneous-ingestion pipeline from scratch. This capability has existed in the AI-enablement space for years; the job is to *adopt* a proven engine, not reinvent it. Based on Task 1 results, select from existing options — candidates include R2R (SciPhi), OpenDocuments, MMORE-style extraction, Unstructured, or extending the AbrainOAG/gbrain stack with a proven loader library. Evaluate in this order:

1. **License gate — first and disqualifying.** Ladder deploys a separate instance per paying customer, so the engine's license must permit commercial multi-deployment. Permissive (MIT, Apache 2.0, BSD) passes. Restrictive (AGPL, SSPL, open-core commercial riders, modified-Apache multi-tenant conditions) may forbid exactly what Ladder does — disqualified regardless of quality. Confirm the license explicitly before evaluating anything else.
2. **Reliability on the probe files.** Of the license-clear options, which preserved the most meaning on the Task 1 reference-corpus sample — especially the structure-heavy files. Every tool claims great ingestion; only the probe result counts.
3. **Self-hostability and coupling.** Prefer engines that run in the single-tenant, self-hosted model and add the least new dependency surface.

**Discipline:** whatever is adopted sits behind the stable boundary Ladder controls and goes into the portability ledger — same rule as gbrain. The engine is swappable; the boundary is owned. Ladder writes almost no ingestion code. The code Ladder writes is concentrated in Maturity and Leverage, where the differentiated product lives.

**Superseded** — engine selection resolved; see the Resolved Architecture block above (Unstructured + gbrain; candidates list retained for the record).

---

## Task 3 — Integrate the engine; write only the differentiated glue

With a license-clear engine selected, the work is integration plus the thin custom layer that is genuinely Ladder's — not a from-scratch pipeline. Turn each supported format into vault entries per the Task 1 taxonomy. Format tiers, in integration order:

1. **Text-bearing (easy):** Word, most PDFs, markdown, code, plain text → clean text extraction. Build and prove first.
2. **Structure-is-meaning (hard):** spreadsheets, decks, scanned/image PDFs (OCR). Each needs a format-specific transform that preserves structure (a cap table becomes a structured entry, not a number wall). Build second, per the Task 1 taxonomy.
3. **Visual (hardest / optional v1):** diagrams, images. Vision-model description or explicit skip. Decide per the reference company's actual reliance on these — do not over-invest if they are decorative.

**Reuse:** the AbrainOAG vault taxonomy (numbered folders, entities, typed links), hosting (Supabase + Railway), embedding/enrichment, and the extraction/graph discipline. The corpus-to-vault skill is the starting methodology, extended past conversations.

**Idempotency:** re-ingesting an unchanged file must not duplicate. Key on a stable per-file identity (hash/path), same discipline as the conversation importer.

---

## Task 4 — Sensitivity handling

Before ingesting anything sensitive, classify the corpus by sensitivity (cap tables, financials, PII). Decide per-tier whether it may go to third-party APIs (embeddings) or must be handled locally. For the reference-corpus test set specifically, sensitive documents are cleared for third-party processing in this context — but the *pipeline* must support a local-only path, because a future customer's material may not be.

---

## Acceptance criteria

- The probe (Task 1) is complete and its per-format taxonomy documented.
- The pipeline ingests all easy-tier and the prioritized hard-tier formats from the reference-corpus set, idempotently, with meaning preserved per the taxonomy.
- The ingested reference corpus is queryable end-to-end (same proof as AbrainOAG: known query returns the right entry with sources).
- Every third-party dependency introduced is in the portability ledger.
- A sensitivity classification exists and the pipeline supports a local-only path.

---

## Explicitly out of scope

- The reference model, gap detection, the board (Sprint Ma).
- Any automation (Sprint L).
- Multi-tenant anything.
- Perfecting visual/image ingestion if the reference company's images are non-load-bearing.

---

## Follow-on source families (deferred; logged, not built)

Items surfaced by later runs that would extend the corpus with a NEW source
family. Each is DECISION FLAGGED, not built — feasibility undecided until the
operator rules it in.

- **Public-website ingestion** (logged 2026-07-18, from the 07/18 review /
  LEGAL-09 posted-web false red). A class of criteria has its FLOOR evidence
  living on the company's public website, not in ingested documents: a posted,
  conspicuous privacy policy and posted terms of service (LEGAL-09). Today the
  public web is not an ingested source, so corpus silence about these renders
  not-ingested / "we couldn't see it," never genuine-absence (harness:
  `POSTED_WEB_EVIDENCE` in scripts/classifier/ingest-log.ts). Two forward
  options, feasibility undecided:
  - *Website as a source family* — crawl/ingest the company's posted policy +
    ToS pages so these elements grade against real evidence. Full source-family
    build: crawler, refresh cadence, robots/ToS-of-scraping questions, cost.
    INFRA-flaggable (new network egress) if ever built — NOT built here.
  - *Operator-attested URL (cheap interim)* — the operator supplies the live
    policy/ToS URLs and attests they are posted; the tile records the attested
    URL as the evidence for the posted-artifact elements. No crawler, no egress;
    a records step, not an ingestion step. DECISION FLAGGED, not built.
