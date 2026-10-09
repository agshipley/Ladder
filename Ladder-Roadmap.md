# Ladder — Product Roadmap

**Status:** Memory and Maturity built; Leverage built as a board-qualified menu, with live automation loops next (current detail in [`STATE-OF-LADDER.md`](STATE-OF-LADDER.md)).
**Governs:** the Ladder product build. Ladder generalizes an earlier personal knowledge-base pilot, AbrainOAG, to company documents.
**Companion docs:** `Ladder-Product-Concept.md` (the what and why), the three sprint specs (the how)

---

## 0. What this document is

The build sequence for Ladder — a single-tenant, self-hostable company knowledge OS with three layers (Memory, Maturity, Leverage). It defines the order of work, the decision gates between phases, the pilot structure, and the principles carried forward from the AbrainOAG build. It is deliberately staged: each layer earns the right to the next, and the riskiest, highest-value layer (Leverage) is approached last and last-committed.

This roadmap does not restate the product concept. Read `Ladder-Product-Concept.md` first.

---

## 1. Inherited principles (non-negotiable, carried from AbrainOAG)

These governed the AbrainOAG build and govern this one. They are not re-litigated per sprint.

- **Probe before parse.** Never assume the shape of an input. Read one real record, map it, then build. The most expensive mistakes come from assuming a structure and discovering it wrong after it has propagated.
- **Verify on one before scaling.** Every phase proves itself on a single record or known query before running on the full set.
- **Scale verification to what is at risk.** Full probe/verify/dry-run rigor for anything that writes to the tracked corpus. A dry-run glance, not a source investigation, for disposable local infrastructure that gets rebuilt or replaced.
- **Own the differentiated layer; adopt the commodity layer behind a boundary.** "Own the code" does not mean write every line — it means control the stack, the data, and the interface, and never get locked in. Ladder *writes* the code that is differentiated and defensible — the reference model, the gap-detection logic, the maturity board, the leverage loops. Ladder *adopts* the commodity primitives the AI-enablement space has offered for years — heterogeneous document ingestion, chunking, embedding, vector search, retrieval. Reinventing those is the wheel-reinvention to avoid; the reference model is where Ladder's own work belongs. The same instinct already governs the stack: Obsidian for the vault, gbrain for serving, Supabase and Railway for infrastructure — none written from scratch. Adoption is disciplined by two hard gates, checked in this order:
  - **License gate (first, non-negotiable for a replicated product).** Because Ladder is deployed as a separate instance for each paying customer, an adopted engine's license must permit commercial multi-deployment. Permissive licenses (MIT, Apache 2.0, BSD) allow this freely. Restrictive ones (AGPL, SSPL, "open-core" with commercial-use riders, modified-Apache multi-tenant conditions — e.g. Dify's) may forbid exactly what Ladder does. An engine Ladder cannot legally deploy for a customer is disqualified regardless of quality. License is checked *before* reliability, not after.
  - **Boundary + ledger (the swap discipline).** Whatever passes the license gate sits behind the stable interface Ladder controls, with every dependency logged in a portability ledger — the same rule that governs gbrain. Ladder can swap the engine without the customer noticing. That is what "own the code" means in practice: own the boundary and the differentiated layer; rent the commodity engine behind glass you can replace.
- **Single-tenant, replicated.** Each company its own isolated instance. No shared multi-tenant system in the pilot. Multi-tenancy deferred, not foreclosed.
- **Simplicity over architecture.** Add a layer only when a requirement forces it.
- **Division of labor.** Product and taste calls are the operator's. Infrastructure known-unknowns — persistence, auth, cost, rate limits, secrets, rollback, ingestion fidelity — are surfaced by the build.
- **Gap class is first-class** (reference-model/GAP-CLASS-DOCTRINE.md): only artifact-sufficient gaps are generation-closable.

---

## 2. The build in three layers (and why this order)

The layers are a dependency ladder. Each is a sprint (or sprint cluster) with its own spec. The order is forced by the dependency chain, not by preference.

### Phase M — Memory (heterogeneous ingestion)
**Goal:** ingest a company's heterogeneous documents (Office, PDF, spreadsheets, images, code) into an owned, queryable, cross-linked corpus — generalizing AbrainOAG's conversation-only pipeline to arbitrary formats.
**Why first:** everything above depends on the corpus existing and being high-fidelity. This is also where the single biggest unproven assumption lives (ingestion fidelity on structure-heavy files).
**Proven base:** AbrainOAG validated the serving/hosting/retrieval half. The net-new work is the ingestion front-end.
**Gate to next phase:** the reference-corpus selection probe (Sprint M, Task 1) identifies which license-clear engine produces the most usable output, and a per-format vault-entry taxonomy plus the glue scope are defined. This is an engine-and-effort decision, not a viability test — ingestion is a solved commodity capability.

### Phase Ma — Maturity (reference model + gap detection + board)
**Goal:** score an ingested corpus against the reference model (originally four tiers, now 11 categories and 83 areas), diagnose absence/thinness/inconsistency, present the tile board, and generate missing documents/process from the corpus.
**Why second:** it reads the memory layer. It cannot exist before Memory produces a reliable corpus.
**Net-new:** the reference model (the intellectual core), the classifier, the gap-detection logic, the board UI, the generation flows.
**Gate to next phase:** the board produces a trustworthy readout on the reference corpus (low false-positive rate against ingest-log ground truth), and at least one gap type can be generated from the corpus (e.g. a talk track from transcripts).

### Phase L — Leverage (automation loops)
**Goal:** design and implement a closed automation loop on a matured function — the SDR/GTM loop as the first instance — using the corpus as both input and beneficiary.
**Why last:** it depends on the maturity layer having built the CRM/scheduler/process it runs on. It is also the least-proven, highest-value, deepest-integration work.
**Framing:** an R&D spike toward one narrow, real loop — not a general automation platform. Prove one loop end to end before generalizing.
**Gate:** approached only after Memory and Maturity are proven on a real corpus. Committed as a spike with an explicit go/no-go after the first loop attempt.
**Status:** the first deliverable became a board-qualified automation menu with a deterministic resolver ([`leverage/MENU-CATALOG.md`](leverage/MENU-CATALOG.md)), so each company is offered only the loops its board shows it is ready for. Building the first live loop is the next step.

---

## 3. Resolved Architecture — The Memory Layer stack

The Memory layer is locked. Three components, one new.

- **Parser — Unstructured (Apache-2.0).** The single new component. Converts heterogeneous files into structured elements (Title, NarrativeText, ListItem, Table). Selected outright.
- **Platform — gbrain (reused whole from AbrainOAG).** Every layer downstream of parsing: ingestion → embedding (inline at write) → Postgres/pgvector → retrieval → MCP serving → Railway hosting. Carried over, minus the nightly enrichment cycle — retired 2026-07-17: Ladder's corpus is evidence and is immutable post-ingest; no autonomous content mutation. Indexing happens at storage time (put_page embeds inline).
- **Glue — a thin custom layer.** The only ingestion code written for Ladder. Maps Unstructured element output to gbrain vault entries.

**Rejected: R2R and all-in-one RAG platforms.** They re-acquire the platform layers gbrain already owns, to deliver a parser obtainable directly from Unstructured. R2R's hi-res mode delegates to Unstructured anyway. The trade only makes sense greenfield; Ladder is not greenfield.

**Probe-validated design rules (Sprint M, Task 1):**

1. Tables are consumed from `text_as_html`, never `.text`. The flattened `.text` collapses empty cells and breaks column alignment, rendering a cap table unreadable. `text_as_html` preserves row/column structure with empty cells as `<td/>`. Verified against a real multi-column cap table: every ownership figure aligned to its header.
2. An empty partition result triggers verify/reject, never a silent pass. Unstructured can swallow an internal failure (e.g. an SSL cert error during model download) and return zero elements with no exception. Zero elements is not proof of an empty file.
3. Three environment fixes are baked into gbrain ingestion setup: pinned `cryptography`/`numba` binary wheels, `numpy<2` (torch 2.2.x ABI compatibility), `SSL_CERT_FILE` via certifi.
4. A raw table does not reliably survive embedding. gbrain's chunker enforces a hard cap (~1500 tokens / ~6032 chars, measured 2026-07-04) with size-based cuts that land mid-structure. The xlsx glue therefore emits a chunk-safe structural summary (row count, verbatim headers, row labels) as the retrieval target, followed by the intact HTML table as the source of record for the maturity layer.

**Per-format glue scope:**

- **xlsx** — non-trivial. Iterate Table elements, read `text_as_html`, preserve `sheet_name`/`page_name` so multi-sheet workbooks (a single financial model can hold dozens of tables) stay separated. The one real glue component.
- **docx** — trivial. Order-preserving concatenation of NarrativeText + ListItem; discard PageBreak/Footer.
- **pptx** — moderate. Group by slide, treat Title as slide heading, apply the table HTML rule to embedded tables.
- **pdf** — trivial plus the empty-result guard. `strategy="fast"` (text-layer only, no OCR) suffices for text-layer PDFs; e-signature layers don't block parsing.

---

## 4. Pilot structure (carried into every phase)

- **Reference company — first test corpus.** The most comprehensive document set in hand, presumed complete in no category. Calibrates the reference model (the corpus-calibrated strand of Task 1 v2) and defined the ingestion taxonomy. Not the customer, and not an oracle: absences on the reference company are findings about the reference company unless the ingest log says otherwise.
- **Customer A — first customer.** Early-stage, thinner, same categories. The real deployment that tests whether the maturity and leverage layers deliver value. Largest gaps in engineering and AI-operations tiers.
- **AI-operations tier — authored, not derived.** The reference company predates the requirement, so this tier of the reference model is authored from expertise and validated against Customer A's need rather than the reference company's corpus.

---

## 5. Decision gates (explicit go/no-go points)

1. **Engine selection and glue scope** (end of Sprint M, Task 1): which license-clear engine produces the most usable output, and how much custom glue does a good vault entry require? This is an effort-and-selection decision — "engine X plus this much glue," or "write more glue," or "try a different engine." Ingestion capability is assumed (it is commodity); the decision is which tool and how much work, never whether the product can exist. Resolved — see §3 (Unstructured selected; glue scoped).
2. **Engine choice** (during Sprint M): reuse the AbrainOAG/gbrain stack, or adopt a heterogeneous-ingestion framework (R2R, OpenDocuments, MMORE-style) behind the strangler boundary. Decided by the probe result, not in the abstract. Resolved — see §3 (gbrain stack retained; R2R rejected).
3. **Reference-model generality** (during Sprint Ma): does a reference-corpus-derived model transfer to Customer A's different sector, or does it encode reference-company-specific assumptions? Tested by running the board against Customer A's real corpus. **Open.**
4. **Leverage go/no-go** (before Sprint L): only proceed if Memory and Maturity are proven. Then commit only to one narrow loop, with a second go/no-go after that loop is attempted. **Passed** for the menu and resolver; the first live loop is pending.

---

## 6. What each phase reuses vs. builds new

| Phase | Reuses from AbrainOAG | Builds new |
|-------|----------------------|------------|
| Memory | Vault structure, Supabase+Railway hosting, MCP+OAuth serving, inline embedding, portability-ledger discipline | Heterogeneous ingestion front-end; per-format extraction + vault-entry taxonomy |
| Maturity | The corpus as input; the graph | Reference model (11 categories, 83 areas); classifier; gap detection (absence/thinness/inconsistency); tile-board UI; corpus-to-document generation |
| Leverage | The corpus as input and sink | Automation loop design + implementation; integration with operational tools (CRM/scheduler); the closed feedback loop |

---

## 7. Risks named up front

- **Ingestion glue effort (Memory).** Structure-heavy files (spreadsheets, decks) and images may need more custom transformation than the commodity engines provide out of the box. This is an effort-and-selection variable, not a premise risk — ingestion works; the question is how much glue and which engine. Mitigated by the Task 1 selection probe: scope the glue before committing.
- **False positives (Maturity).** A board that says "you're missing X" when X simply wasn't ingested erodes trust fast. The classifier must distinguish genuine absence from un-ingested presence. This is the hardest correctness problem in the product.
- **Reference-model overfit (Maturity).** A model derived from one company may not generalize. Tested against Customer A, not assumed.
- **Integration depth (Leverage).** Live automation into third-party operational tools is brittle, per-tool work. Scoped to one loop first; no general platform promised.
- **Scaffolding-becomes-permanent.** The same discipline as gbrain: if a third-party ingestion or automation engine is adopted to validate, it must sit behind a boundary with a ledger so it can be swapped. Do not let a validation dependency become load-bearing by inertia.

---

## 8. Sequence summary

Prove ingestion on a reference-corpus sample → build heterogeneous ingestion (Memory) → author + build the reference model and board (Maturity) → prove one automation loop (Leverage) → generalize only what proved out. The reference company calibrates it; Customer A is the first real deployment. Each rung earns the next.
