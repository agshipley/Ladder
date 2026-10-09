# Portability Ledger

Ladder adopts proven components for the commodity layers (ingestion, embedding, storage, serving)
and writes its own code for the parts that are specific to it. Every adopted dependency sits behind
a boundary Ladder controls and is logged here with its license, so it can be replaced without the
customer noticing ([`Ladder-Roadmap.md`](Ladder-Roadmap.md) §1, "Boundary + ledger").

Because Ladder is deployed as a separate instance for each company, every dependency must also pass
a **license gate**: its license has to permit commercial deployment across many instances.

| Dependency | Version | Role | License | Boundary / swap note | Adopted |
|---|---|---|---|---|---|
| Unstructured | pinned per instance | Document parser (Office, PDF, spreadsheets, decks); runs in each instance's ingestion step, outside this repository | Apache-2.0 | Output is mapped to vault entries by a thin per-format glue layer; the parser can be replaced behind the glue | 2026-07 |
| gbrain | v0.42.53.0, pinned fork | Corpus store, embedding at write time, retrieval, MCP serving with OAuth | MIT (fork of an MIT project) | Behind the `RetrievalClient` interface in [`scripts/classifier/retrieval.ts`](scripts/classifier/retrieval.ts) | before 2026-07 |
| Anthropic API | configurable | Diagnostic judge and document generation | commercial | Model selected by environment configuration (`CLASSIFIER_JUDGE_MODEL`, `CLASSIFIER_GEN_MODEL`); calls are isolated in `scripts/classifier/` | before 2026-07 |
| Postgres + pgvector (Supabase) | managed | Corpus database, one per instance | commercial host, open-source engine | Standard Postgres; any pgvector-capable host works | before 2026-07 |
| Railway | managed | Hosts the instance's single query service | commercial | Standard container deployment; any container host works | before 2026-07 |
| docx | 9.7.1, pinned exact | In-browser export of an approved document to .docx | MIT | Client-side only ([`board/src/docx-export.ts`](board/src/docx-export.ts)); Markdown download remains as a fallback if removed | 2026-07-16 |

## Notes

- **One service per instance.** A Ladder instance runs a single query service, which embeds each
  document when it is saved. An earlier nightly sync-and-enrich worker was retired on 2026-07-17:
  the corpus is evidence and is never rewritten in the background, so indexing happens at write time
  instead.
- **The docx export is a leaf dependency.** Nothing in the diagnostic or generation path depends on
  it, it makes no network calls at runtime, and it needs no credentials.
