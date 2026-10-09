# State of Ladder — the canon entry point

_Single source of truth for what Ladder is and what stands today. Written for a reader with no
prior context. Every claim here traces to a repo document or commit; anything unverified is listed
under "Open items," never asserted as fact. When this document and an older one disagree, this one
wins — the older document should carry a banner saying so._

Last authored: 2026-07-21.

---

## 1. What Ladder is

Ladder is a single-tenant, self-hostable "company knowledge OS." Each customer company gets its own
isolated instance — its own repository, database, and services; there is no shared multi-tenant
system. It has three layers, built in order (see `Ladder-Product-Concept.md`, `CLAUDE.md`).

**Memory** — the company's documents, calls, and records are ingested once and become searchable
evidence. Ladder adopts a proven engine for this rather than building one; the corpus is treated as
evidence and is never rewritten after ingestion (`Sprint-M-Memory.md`, `Ladder-Roadmap.md`).

**Maturity** — a reference model of what a well-run company at this stage should have. Ladder scores
the company's real evidence against it and produces a maturity board: a color-coded read of every
operating area, with the reasoning and the source documents behind each verdict (`Sprint-Ma-Maturity.md`,
`reference-model/TAXONOMY.md`).

**Leverage** — for the gaps and strengths the board surfaces, a menu of automation opportunities,
each qualified against the company's own board so the menu only offers what the company is actually
ready for (`Sprint-L-Leverage.md`, `leverage/MENU-CATALOG.md`).

---

## 2. What is built and working

**Memory (built).** Heterogeneous document ingestion into a corpus store, with search and full-recall
sweep, running on the adopted engine (gbrain) behind a swappable interface (`scripts/classifier/retrieval.ts`,
`PORTABILITY-LEDGER.md`). Indexing happens at write time (embeddings are computed on save). Every board
run carries an honest **coverage disclosure** — what was and was not ingested; for the reference company
(the reference company) that reads: documents ingested; code repository not ingested; call recordings present as video,
not transcribed, not ingested; community channels not ingested (`runs-of-record/ref-board-003.rich.json`
stats, surfaced on the board via `board/src/App.tsx`).

**Maturity (built).** The reference model covers **11 categories and 83 operating areas (CRITERIA-SCHEMA.yaml v1.5, 2026-07-15, commit 1454f39)**
(`reference-model/CRITERIA-SCHEMA.yaml`, `reference-model/TAXONOMY.md`). The current board run of record
is **ref-board-003** — all 83 areas judged against the live company corpus (`runs-of-record/BOARD-003-SUMMARY.md`).
The full **generation pipeline** turns a surfaced gap into a reviewable draft, end to end
(`reference-model/GENERATION-STANDARD.md`): a fixed template drives the outline; the corpus is queried
per section for evidence; a deterministic mechanical validator checks structure and **citation truth**
(quoted attributions must appear verbatim in the cited source); a structural self-review and an
authority review run; and finally a **blind quality gate** — a fresh-context reviewer sees only the
finished document and a recipient persona, with no hint it is machine-produced, and blocks anything
not client-ready. A document that clears the pipeline enters a **lifecycle**: it is reviewed and approved
as *working* or *final*, one document at a time, explicitly — never in a batch, never auto-adopted
(`scripts/board-server.ts`, `reference-model/GENERATION-STANDARD.md`).

**Leverage (built).** A ruled automation **menu** (`leverage/MENU-CATALOG.md`, ten items across
enhance / fully-automate / net-new) plus a deterministic **resolver** that qualifies each item against
the company's board and answers to a short intake, producing an "available / not yet / not offered /
pilot" verdict with the exact prerequisites to climb (`leverage/RESOLVER-MAPPING.md`,
`scripts/leverage/resolve-menu.ts`, `runs-of-record/ref-menu-001.md`). The menu surface and the board
are integrated on one origin: the board has a Leverage tab, the menu links each prerequisite back to its
board tile, and each tile's drawer shows which menu items it gates (`scripts/board-server.ts` `/leverage`,
`board/build-data.mjs`).

---

## 3. The binding rules in force

Each rule is stated plainly here; its full text lives in the pointer.

- **Corpus immutability** — once a document is ingested it is never rewritten; there is no autonomous
  content mutation on a Ladder instance. → `Ladder-Roadmap.md`, `Ladder-Build-Lessons.md`.
- **Plan never flips** — a "gap-closure plan" is an internal working artifact and can never flip a board
  area to green on adoption; only a true target document can. → `reference-model/GENERATION-STANDARD.md`
  (mode matrix), `scripts/classifier/generate.ts` (invariants).
- **Professional-review gates** — documents in areas needing attorney or HR review cannot be finalized
  until that review is attested. → `reference-model/GENERATION-STANDARD.md`.
- **Generation exclusions** — Ladder generates nothing in litigation and dispute areas; those materials
  are kept outside the corpus by policy and refused before any model call. → `reference-model/GAP-CLASS-DOCTRINE.md`,
  `scripts/classifier/generate.ts` (generation-excluded).
- **Provenance blindness + disclosure** — the drafting and review stages sit outside a "firewall" and
  never see whether evidence is company-native or Ladder-generated; separately, any non-company-native
  evidence is disclosed openly on the board. → `reference-model/GENERATION-STANDARD.md` (firewall boundary).
- **Segmentation / company-evidence-only view** — retrieval and the board can be scoped to company-native
  evidence only, excluding anything Ladder generated, so a pristine pre-generation view is always available.
  → `scripts/classifier/retrieval.ts` (origin scope), `board/src/App.tsx` ("Company evidence only").
- **Model routing + spend caps** — generation, both reviews, and the blind gate all run on the cost-point
  model (Claude Sonnet); the more expensive model is reserved for the diagnostic judge only; batch runs
  carry an explicit dollar cap and abort rather than overrun. → `reference-model/GENERATION-STANDARD.md`
  (model routing), `scripts/leverage/…` and `scripts/classifier/rerun.ts` (per-run cap).
- **Stop rule** — a failure at a deterministic gate is a finding, not a retry target: one regeneration
  attempt maximum, then the failure is filed and the item stops; unchanged input is never retried.
  → `reference-model/RESEARCH-PROTOCOL.md` (§ Stop rule of record).

---

## 4. Live infrastructure

- **Serving/query engine:** gbrain, pinned at v0.42.53.0 (a fork), running on Railway behind the
  `RetrievalClient` interface (`PORTABILITY-LEDGER.md`, `scripts/classifier/retrieval.ts`).
- **Database + hosting:** Supabase Postgres (with pgvector) + Railway. The reference instance's live
  query server is the reference instance's Railway query service. It is a
  single serving service — the former nightly enrichment worker was retired 2026-07-17 in favor of
  inline indexing (`PORTABILITY-LEDGER.md`).
- **Tier limits:** the reference instance's Supabase is on the **free tier — there are no database
  backups and no point-in-time recovery** (`runs-of-record/HANDOFF-2026-07-17.md`).
- **Recoverability floor:** recovery does **not** depend on a database snapshot. By design, every
  adopted (Ladder-generated) document lives under a `remediation/` slug prefix, deletion is a 72-hour
  soft delete, and deleting that page returns the store to its pre-adopt state; the pre-adopt board
  verdicts are committed at `runs-of-record/ref-board-003.rich.json` as the comparison baseline
  (`runs-of-record/HANDOFF-2026-07-17.md`).

---

## 5. What is NOT built / open rulings

Pulled from the standing exception queue and carried-open lists
(`runs-of-record/HANDOFF-2026-07-17.md`, `runs-of-record/SPRINT-MA-CLOSE.md`, `DECISIONS-THIS-RUN.md`).

- **Railway cron worker deletion** — the retired enrichment worker was set to be
  deleted in the Railway dashboard; that operator action was still pending and cannot be verified from
  the repo. Nothing depends on it (code already single-service).
- **Contested templates** — the legal-records template and the strategy-and-targets proposal are held,
  awaiting an operator ruling before they land (`generation-templates/proposals/`).
- **Engineering practice re-classifications (ENG-03 / ENG-07)** — a conservative re-class is proposed,
  awaiting confirmation.
- **The exception queue itself** — `DECISIONS-THIS-RUN.md` logs every conservative call and gate catch
  and is awaiting operator review-by-exception; it is a live queue, not a closed record.
- **Golden fixtures deferred** — the deterministic test-fixture suite is deferred (`reference-model/FIXTURES-DEFERRED.md`);
  one fixture (FX-15) flips on inherent judge nondeterminism rather than a regression.
- **Carried open rulings** — CAP-03 (83(b) treatment) and FX-41 (expected-state) remain open;
  the FIN-06/FIN-08 merge and a board visual restyle were deferred by ruling (`runs-of-record/SPRINT-MA-CLOSE.md`).
- **Board badge bake** — tile "working"/flip badges are not yet baked onto a fresh board render; the
  saved snapshot predates the first adopt (`runs-of-record/HANDOFF-2026-07-17.md`).
- **PEOPLE-07 (HR handbook) generation** — regeneration reliably fabricates source quotes, caught by the
  citation-truth gate, so no clean draft is produced; this is a generation-quality gap, not a checker
  fault (`generated-drafts/GENERATION-FAILURES.jsonl`; commit `44c57af`). Needs a generation-side fix,
  not a gate change.

---

## 6. Doc map — where everything lives

Classification from the 2026-07-21 inventory. **CURRENT-BINDING** = in force; **HISTORICAL** =
point-in-time record; **SUPERSEDED** = replaced (banner added in the doc's own header).

**Root — concept, specs, standing rules (all CURRENT-BINDING):**
`Ladder-Product-Concept.md` (what Ladder is) · `Ladder-Roadmap.md` (build sequence + principles) ·
`Ladder-Build-Lessons.md` (measured facts + standing rules) · `Sprint-M-Memory.md`, `Sprint-Ma-Maturity.md`
(closed 2026-07-16), `Sprint-L-Leverage.md` (carries a 2026-07-22 status banner: the built Leverage layer
is the board-qualified menu + resolver, not the bespoke SDR loop the spec body scopes) — the three layer
specs · `CLAUDE.md` (agent operating instructions + infra gate) ·
`CREDENTIALS.md` (names/procedures, never values) · `VOICE-DISCIPLINE.md` (customer-register language) ·
`PORTABILITY-LEDGER.md` (adopted-tech ledger) · `README.md`.
Historical: `DECISIONS-THIS-RUN.md` (07-17 run log / live exception queue), `Thread-Transition-2026-07-08.md` (banner added).

**`reference-model/` — the maturity canon (CURRENT-BINDING unless noted):**
`TAXONOMY.md` (categories + boundary rules) · `CRITERIA-SCHEMA.yaml` (the 83-area schema of record) ·
`RESEARCH-PROTOCOL.md` (research + stop rule) · `GENERATION-STANDARD.md` (generation doctrine, 7 stages) ·
`GAP-CLASS-DOCTRINE.md` · `CRITERIA-YAML-FIDELITY.md` · `LIFECYCLE.md` · `BOARD-REVIEW-PROTOCOL.md` ·
`MODEL-DOC-SOURCES.md` · `REFRESH.md` · `DECOMPOSITION-BACKLOG.md` · `FIXTURES-DEFERRED.md` (deferral in force) ·
the 11 per-category `*/BRIEF.md` files (each category's landed brief).
Historical: `9EA-STATE.md` (audit checkpoint, banner added). Superseded: `REF-BOARD-001.md` → board-003 (banner added).

**`leverage/` — the leverage layer (CURRENT-BINDING):**
`MENU-CATALOG.md` (the ruled menu) · `RESOLVER-MAPPING.md` (prerequisite mapping + resolution semantics) ·
`templates/menu.html` (the customer surface) · `intake/reference.json` · `rung-closure.json`.

**`generation-templates/` — the template layer:**
`TEMPLATE-METHOD-LOG.md` (method record) · `proposals/` (14 proposed templates + index, several
awaiting operator ruling — historical/proposed record; adopted templates are the `.yaml` files).

**`runs-of-record/` — committed run outputs:**
Current: `BOARD-003-SUMMARY.md`, `BOARD-003-ADJUDICATION.md` (the current board run) · `SPRINT-MA-CLOSE.md`
(maturity-layer close) · `ref-menu-001.md` (current leverage resolution) · the board/menu JSON outputs.
Historical: `HANDOFF-2026-07-17.md` (banner added). Superseded: `ref-board-002-adjudication.md` → board-003 (banner added).

_(There are no `loop/` documents on the main branch as of this writing.)_
