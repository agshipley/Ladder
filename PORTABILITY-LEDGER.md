# Portability Ledger

Per Ladder-Roadmap.md §1 ("Boundary + ledger — the swap discipline"): every adopted
third-party dependency sits behind a boundary Ladder controls and is logged here, so it
can be swapped without the customer noticing. This is the record of third-party adoptions.

| Dependency | Version | Where | License | Purpose | Boundary / swap note | Adopted |
|---|---|---|---|---|---|---|
| gbrain | v0.42.53.0 (pinned) | serving/query engine (Railway) | (fork, agshipley/gbrain) | corpus store + MCP query/ingest | behind `scripts/classifier/retrieval.ts` `RetrievalClient` interface; swappable | pre-2026-07 |
| Anthropic API | claude-opus-4-8 | judge + generation | commercial | LLM judge + remediation generation | behind `judgeConfigFromEnv` + `scripts/classifier/generate.ts`; model via `CLASSIFIER_JUDGE_MODEL` | pre-2026-07 |
| Supabase + Railway | — | hosting/DB | commercial | Postgres + single serve service | infra layer; reused from AbrainOAG recipe (single-service now — see cron retirement below) | pre-2026-07 |
| Railway cron worker (dream cycle) | — | RETIRED 2026-07-17 | — | nightly sync → embed → enrich | **Retired 2026-07-17** — superseded by inline embedding on `put_page` (writes index at storage time; verified live). Reason: corpus-immutability ruling — no autonomous content mutation on a Ladder instance. Live worker was its cron worker in project the reference instance's Railway project, deleted 2026-07-17; `VAULT_CLONE_TOKEN` retired with it. | retired 2026-07-17 |
| docx | 9.7.1 (pinned exact) | board — review-surface DOCX export | MIT | render the clean adopted document to .docx (human deliverable) | client-side render only in `board/src/docx-export.ts`; no runtime egress; corpus still ingests Markdown (`adopt-draft.ts` unchanged); swappable/removable — Markdown download remains as fallback | 2026-07-16 |

## Notes
- `docx` (2026-07-16): operator-approved one-time registry egress for install; MIT; no
  runtime egress; no new credentials/env. It renders the review surface's clean document to
  DOCX in-browser. It is a leaf UI dependency — nothing in the diagnostic/generation path
  depends on it, and the board falls back to a Markdown download if it is removed.
- Cron / dream-cycle retirement (2026-07-17): a Ladder instance runs ONE service — the
  `gbrain serve --http` query server, which embeds inline on `put_page`. The nightly dream
  worker is retired under the corpus-immutability ruling (Build-Lessons §8). Indexing happens
  at storage time; there is no background sync/embed/enrich pass.
- Service names: the stale identifiers `valiant-spirit` / `extraordinary-unity` appear only in
  AbrainOAG's own vault ledger (out of scope — the personal-brain product keeps its dream
  cycle). The live Ladder-recipe services were the reference instance's query server
  and its cron worker, both in one Railway project; the worker is
  deleted (2026-07-17), the query server remains.
- Phase 5 (owned server): requires an ingest-and-index write path (embed at storage time);
  it needs NO dream/enrichment worker. The retirement is forward-compatible — the owned
  server reuses the inline-embed contract, not the batch cron.
