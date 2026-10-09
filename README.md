# Ladder

Single-tenant, self-hostable company knowledge OS: **Memory → Maturity → Leverage**. See `Ladder-Product-Concept.md` and `Ladder-Roadmap.md`.

> **About this public repository.** It contains the method: specs, the reference model,
> generation templates, the board, and the classifier and generation code. Customer corpora,
> board runs of record, generated drafts, instance rulings and operations logs are not
> included, because they are derived from confidential company documents. The reference
> company the model was calibrated on is anonymized throughout. Docs that mention excluded
> files (`runs-of-record/`, `generated-drafts/`, `CREDENTIALS.md`, and similar) describe the
> private working repository. To run the board, supply your own run of record.

## Running the board locally

The board renders the committed run of record (`ref-board-003`) and drives the remediation flow (generate a draft on a gap, review, approve). One command serves the built board and the `/api/*` remediation routes over localhost:

```
cd board && npm install && npm run build && node ../scripts/board-server.ts
```

Then open **http://localhost:4200/**

- The board loads `ref-board-003` data (baked at build time by `npm run build` → `build-data.mjs`).
- Click a tile for its detail: the source **documents** the grade relied on (chunks expandable beneath each), and the **Expected but not found** elements.
- On a gap tile (missing / needs work / couldn't-see-it), **Generate remediation draft** calls the generation service, writes a draft to `generated-drafts/`, and opens the review surface (purpose-first: the criterion, then the draft, then Approve / Reject / Download).
- **Approve** is enabled only for *artifact-sufficient* gaps, one document at a time, explicit — there is no batch approval and no auto-ingest. Recommendations (system gaps) and scaffolds (practice gaps) are never approvable.
- Ingesting an approved draft is a deliberate, separate operator step (`scripts/adopt-draft.ts`) — it mutates the corpus and incurs embedding cost, so it never runs as a UI side effect.

Requires `.env` with `ANTHROPIC_API_KEY`, `CLASSIFIER_QUERY_URL`, and `CLASSIFIER_QUERY_TOKEN` (see `CREDENTIALS.md`). Generation and re-judge call the live corpus + judge model; nothing is written to the corpus without an explicit approve + adopt.

Port override: `BOARD_PORT=<n> node scripts/board-server.ts`.
