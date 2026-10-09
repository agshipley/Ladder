# Ladder — Build Lessons (v2)

**Status:** Living project memory. Everything learned through the first independent
instance build (test-instance, July 2026), which validated the Memory layer
end-to-end. Where this document states a rule, the rule was paid for. Companion:
the constitution docs (concept/roadmap/sprints) for strategy; INSTALL-PROTOCOL.md
in the template repo for the zero-context install procedure. One home per fact:
strategic decisions live in the constitution; this doc cross-references them.

## 1. Locked architecture

- Memory stack: Unstructured (Apache-2.0, parser) → gbrain (forked to a repo we
  control, pinned to the tested SHA, never HEAD) → thin custom glue.
- Two stages, two homes: PARSE (heavy — Unstructured/torch, workstation or one-off
  job) and SERVE/ENRICH (light — Railway). Parsing dependencies never enter
  serving containers.
- One service per instance, one database: an always-on query server
  (`gbrain serve --http`) that reads Postgres and embeds inline on put_page writes.
  No cron worker: the nightly dream cycle is retired for Ladder instances
  (2026-07-17) — the corpus is evidence, immutable post-ingest; all writes are
  operator-approved and index at storage time. GBRAIN_DATABASE_URL and
  GBRAIN_ADMIN_BOOTSTRAP_TOKEN live on the serve service; VAULT_CLONE_TOKEN is
  retired with the worker.
- Source binaries never enter the vault repo — only derived markdown. Measured:
  560 MB source → 14 MB vault. (The retired worker's nightly --depth 1 clone was
  trivial in any case.)
- The vault IS the instance repo root. gbrain sync hard-requires the vault
  directory to be the git-repo root ("Not a git repository" otherwise). Instance
  repo = numbered folders at root + deploy/ + .gitignore, nothing else. Template
  tooling (ingest/, runbooks, manifests) stays in the template repo; stray root
  .md files would be imported as vault pages.
- Single-tenant, replicated. Per instance: private repo, Supabase project, two
  Railway services, PAT, admin token, OAuth client(s), connector. Prefer
  per-instance provider API keys. Nothing shared across instances except the
  template and the pinned engine fork.
- Embedding model/dimensions are PER-INSTANCE truths bound to the vectors already
  in that instance's DB. Never copy another instance's dimensions (reference
  instance runs 1536; test-instance runs 3072; both are correct for themselves).

## 2. Measured facts

- Engine import file cap: **MAX_FILE_SIZE = 5,000,000 bytes** (`gbrain src/core/import-file.ts:206`,
  enforced at `:930`). Files above it are `status: skipped` with `File too large (<n> bytes)` — the
  page never reaches the DB.
- Postgres tsvector ceiling: **1,048,575 bytes**. Not a gbrain constant; surfaced as
  `string is too long for tsvector (<n> bytes, max 1048575 bytes)`. A page under MAX_FILE_SIZE can
  still fail here, at index time rather than import time.
- Both hit on a customer-instance baseline sync 2026-07-31: **10 pages deferred** — 7 over the import cap
  (5.3–17.2 MB, member lists and Slack-member segment exports) and 3 over the tsvector ceiling
  (1.10–1.45 MB). All ten are spreadsheet exports; prose documents came nowhere near either bound.
- A third, quieter class the counters do not show: **25 pages imported but flagged
  `content-sanity (oversized)`** — present and retrievable by slug, embedding skipped. They pass a
  page-count gate and fail a search. Count checks cannot see this class; only a retrieval probe can.
- Embedding cost calibration: one instance's figure of ~4,500 tokens/page under-predicts a
  spreadsheet-heavy corpus by ~3×. A second instance projected $1.09 on that basis; gbrain's own preview said
  **$3.26** for the same 1,720 pages.

- gbrain chunker: hard cap ~1500 tokens / ~6032 chars; size-based cuts landing
  mid-structure; no table awareness; chunk_source values compiled_truth and
  fenced_code. (Measured 2026-07-04, v0.42.53.0 corpus.) Consequence: raw HTML
  tables do not reliably survive embedding.
- Parse rate on a real seed-stage corpus: 736/752 probe-format files (97.9%).
  All 16 failures were the OCR class (no text layer): ~8 distinct real scanned
  docs, ~3 image assets, 1 anomalous xlsx. The OCR hole is surgical, not
  load-bearing, at this corpus profile.
- Full-corpus embedding cost: < $0.25 (text-embedding-3-large). Embedding is a
  non-factor economically; relay cycles and debugging are the real spend.
- First cycle on the fresh instance: 119 schema migrations; 10 pages / 86 chunks
  from batch 1; embed step exercised and verified the rotated OpenAI key.
- strategy="fast" is a deliberate low-fidelity v1. Known losses: scanned PDFs
  (dropped — caught by the empty-guard), PDF-internal tables (flattened), reading
  order on complex layouts, images/charts, xlsx formulas (values only; scenario
  state frozen at save time), pptx speaker notes, formatting semantics. Fidelity
  upgrades are per-format escalations behind the same boundary, chosen by probe
  evidence (fast-vs-hi_res-vs-Docling probe in progress; Marker is GPL —
  disqualified; cloud parsers conflict with the local-path principle).

## 3. Ingestion design rules

- Tables from text_as_html, never .text (.text collapses empty cells and breaks
  column alignment).
- Every table entry = chunk-safe structural summary (row count, whitespace-
  normalized verbatim headers, row labels, aggregate rows promoted verbatim —
  total / fully diluted / percentage / price-per-share) + intact HTML under
  "## Full table" as source of record. Deterministic, LLM-free. The acceptance
  query answered from the promoted aggregate rows — the design carried.
- Empty partition result (0 elements, no exception) triggers verify/reject;
  Unstructured can swallow internal failures (e.g. SSL) and return empty.
- Idempotent slug-safe deterministic naming; re-runs overwrite identically.
- Ingest-log per run (parsed / skipped-with-reason / failed-with-error); at
  n≈750 failures are normal and expected; nothing silently dropped.
- Parse env recipe: pinned cryptography/numba binary wheels, numpy<2 (torch
  ABI), SSL_CERT_FILE via certifi.
- Extraction limits are recorded per-format in the taxonomy so the maturity
  layer knows what the corpus cannot tell it. Documenting our own ingestion
  limits is a product feature, not a confession.

## 4. Security & secrets rules

- Secret VALUES never transit chat or CC sessions, either direction. CC handles
  names/locations/code; the operator handles values, in provider consoles and
  Railway only. Prompts state "precondition: operator has set X"; confirmation
  is the word "done," never the value.
- Session logs are corpus: anything pasted into a chat can be imported,
  embedded, and committed. This mechanism put twelve live keys in a public repo.
- Any key that ever appeared in a public repo's history is burned. Rotation is
  the remediation; visibility flips and history purges are cleanup. Rotation =
  update EVERY consuming service, then redeploy each; a stale credential on an
  un-redeployed service fails silently (health 503, clean logs).
- GitHub secret scanning is free on PUBLIC repos only — flipping private turns
  the alerts off, it does not resolve them. Local gitleaks over full history is
  the ground truth.
- Per-instance credentials: own fine-grained PAT (Contents: read-only, single
  repo, ~90d expiry), own admin token, preferably own provider keys. GitHub
  shows a PAT once; store it at creation; a token cannot be copied later or
  reused across repos (scope is fixed at creation).
- OAuth secrets are one-time reveals (hash stored server-side). Mint clients
  from the operator's own terminal via `railway run` so the bootstrap token is
  injected, never typed or printed; the clientSecret prints only to the
  operator's screen. A client whose secret was never captured is unusable for
  confidential flows — mint a fresh one rather than hunting.
- Sensitivity clearance has two independent axes: cleared-for-API-processing
  and cleared-for-hosting-location. Litigation-hold class: materials germane to
  ongoing/threatened litigation are excluded by default, released only by
  explicit instruction. Credentials are never content, in any corpus, at any
  privacy level.

## 5. Deployment & wiring rules (the July 2026 saga, distilled)

- Railway only auto-detects a ROOT Dockerfile. Dockerfiles under deploy/ require
  Builder = Dockerfile + explicit path per service, or Railway silently falls
  back to its default builder ("No start command detected" on a markdown repo).
  Close this permanently with config-as-code where Railway supports it.
- Supabase's direct endpoint (db.<ref>.supabase.co:5432) is IPv6-only and
  unreachable from Railway → ECONNREFUSED before auth is ever attempted. Railway
  services MUST use the Transaction pooler (aws-<n>-<region>.pooler.supabase.com:6543,
  username postgres.<ref>). Diagnostic signatures: repeated ":5432 ECONNREFUSED"
  with zero auth errors = wrong endpoint; the healthy banner is "Prepared
  statements disabled … port 6543"; "password authentication failed" = actually
  the password. (This supersedes the v1 doc's direct-connection guidance, which
  was wrong.)
- EXCEPTION to pooler-only: gbrain's schema migration (DDL) dials the direct
  endpoint and therefore cannot run from Railway. First-install migrations run
  once from an IPv6-capable machine with the pooler URL injected
  (`railway run` + `gbrain apply-migrations --yes`), then redeploy.
- Railway variable edits may stage without applying. After any variable change:
  visually confirm the saved value, confirm a NEW deployment actually started.
  An edit that "didn't take" reproduces the old failure verbatim and reads as a
  deeper mystery than it is.
- GBRAIN_EMBEDDING_MODEL requires the provider prefix: openai:text-embedding-3-large.
  Prefixless fails as "unknown provider" — breaking inline embedding on put_page
  writes AND query-time embedding on the serve path. (Both live on the serve
  service; this rule survives the worker's retirement.)
- (Historical — worker retired 2026-07-17.) Redeploying a Railway CRON service did
  NOT trigger a run; cron waited for its schedule. On-demand testing was
  `railway run` with the service's env, or a temporary near-future schedule (then
  restore). No cron service runs on a Ladder instance now.
- The runtime vault clone: https://x-access-token:${VAULT_CLONE_TOKEN}@github.com/<owner>/<repo>.git,
  --depth 1, remote rewritten tokenless post-clone, no command echo. Its failure
  signature: "could not read Username for 'https://github.com'".
- Query container: FROM oven/bun:1.3; bun install -g of the pinned fork SHA;
  CMD gbrain serve --http --bind 0.0.0.0 --port ${PORT:-8080}
  --public-url https://${RAILWAY_PUBLIC_DOMAIN}. Railway's "what port" question
  = the container port = 8080. Health semantics: /health 200 healthy; /health
  503 with /mcp 405 = DB dependency failure (usually stale cred → redeploy);
  /mcp 405 to GET is CORRECT (POST-only) and means the app is up.
- OAuth: gbrain ships DCR (Dynamic Client Registration — clients self-register)
  disabled; --enable-dcr exists. Keep it OFF for the product: clients are minted
  deliberately via POST /admin/login (bootstrap token → session cookie) then
  POST /admin/api/register-client. Client shape for claude.ai:
  grantTypes ["authorization_code","refresh_token"], scopes "agent read",
  redirectUris ["https://claude.ai/api/mcp/auth_callback"]. gbrain mints
  CONFIDENTIAL clients: claude.ai's "optional" client-secret field is mandatory
  for this server — ID-only fails at token exchange as "Authorization with the
  MCP server failed."
- The Railway GitHub App needs per-repo access (github.com/settings/installations
  → Railway → Configure) before a new private repo appears in any picker.
- Dashboard-state rule: no component ships without its build definition
  committed. Every setting that exists only in a web UI is a future archaeology
  session (three instances this build: the reference query service's nixpacks
  config, the builder/Dockerfile-path settings, OAuth client provisioning).
- Relay-paste hazard: heredocs with indented terminators hang the shell. All
  operator-facing command blocks are paste-safe: flush-left, single-purpose,
  one block per paste.

## 6. Process & relay rules

- Reports are self-contained: every artifact a prompt says "show" appears
  verbatim in the final report block. "Shown above" does not exist in a relay.
- Config values are quoted verbatim from an in-context ground-truth report or
  re-fetched — never reconstructed from memory. (Both failure directions
  occurred: a report referencing its own scrollback, and a checklist restating
  two config values wrongly from memory.)
- Ground truth before inference, especially against a working reference system.
  Twice this build, reasoning overrode a running production config (direct-vs-
  pooler; the prefix "contradiction") — once wrongly, once the reference record
  was right and the local value was the typo. Read the running system first.
- No third-party dashboard click-paths from memory. UI guidance is verified
  against current docs at answer time or framed as a goal with the screen
  described by the person looking at it. CLI/git preferred: it returns ground
  truth or a real error.
- Diagnose before fixing: first prompt read-only (status + verbatim logs +
  classify); the fix follows the classification. Editing variables mid-unknown-
  failure adds causes. Serial single-blocker reports (NO-GO + one named item +
  whose move) turned four failed runs into four one-move fixes.
- Verify each link independently before the next depends on it: pin proven by
  local install before production rebuild; clone patch by local clone before
  push; migrations before cycle; cycle before connector.
- Batch what is decided; gate what is not. Fences (no repo writes, no secrets,
  DECISION items return to the operator) — never prompt size — are the control
  surface. Encode decision rules, not decisions.
- Deviations are flagged, not hidden; a flagged deviation with reasoning is
  correct behavior. Unattributed edits to canonical docs default to revert.
- Deployment-target decisions gate ingestion work. Decide where a corpus lives
  before building anything that lands it.

## 7. Forward notes

- Sprint Ma: the maturity layer reads vault FILES for numerics; chunks locate
  documents and answer headline numbers via summaries only. Parse-level absence
  (ingest-log failures) must not become a maturity-absence verdict. The product
  success-criteria section remains the operator's pending authorship.
- Source connectors: unstructured-ingest ships Drive/Dropbox/Notion/SharePoint/
  etc. connectors that slot in front of the parse stage, fully local processing
  available. Drive/Dropbox ≈ credentialing ceremony only; Notion needs a
  fidelity pass (databases are relational, not documents); employee laptops are
  a maturity finding, not an ingestion target. Drive connector emits per-document
  permissions metadata — reserved as Phase 5 RBAC seed data. Post-pilot scope.
- Queued cleanups: dashboard-state audit → config-as-code; fidelity-probe report
  (docling leg); reference-instance local .env holds a pre-rotation DB password
  (stale, rotate/scrub); template repo needs a private remote.

## 8. Corpus immutability (ruled 2026-07-17)

Post-ingest, corpus content changes only by operator-approved re-ingestion. No
background process may rewrite, merge, summarize, or enrich corpus pages on a
Ladder instance. Derived layers, if ever added, are excluded from judge evidence
assembly. Board state changes only via approved ingest → single-tile re-judge. All
future ingestion paths (transcription, repo ingestion) route through the
inline-embedding write path, never a batch cron.

## 9. Ingestion-environment lessons (rehearsal 2026-07-24 → reconciled 2026-07-27)

- **Pin the transitives, not just the top package.** The reference-corpus ingest ran fine on
  this machine on 2026-07-07, then `ingest/requirements.txt` stopped installing —
  NOT arch/Python/wheel incompatibility (same box, same Python 3.11.2, x86_64). The
  cause was an unpinned TRANSITIVE: `unstructured-inference` drifted 1.2.0 → 1.6.9
  (needs `torch>=2.10.0`, no macOS/x86 wheel). "It worked before" is not "it installs
  now." requirements.txt now pins `unstructured-inference==1.2.0`. Corollary numpy
  fact: `opencv-python>=4.13` (pulled by inference 1.2.0) requires `numpy>=2`, so the
  old `numpy<2` pin was itself unresolvable for a clean install; numpy is pinned 2.2.6
  (opencv≥2 ∧ numba<2.4). torch/opencv/onnx are import-only — the fast-PDF path is
  pdfminer and never executes them (a benign "compiled against NumPy 1.x" warning is
  expected). A false "PDFs return 0 elements" reading in the rehearsal came from a
  numpy ABI mismatch (install bumped numpy to 2.x, a manual downgrade left mismatched
  C-extensions) — not the engine.
- **Namespace ingest output by source system.** `normalize_notion.py` and `ingest.py`
  wrote into the same dir; a Notion "Company Handbook" and a Drive `company-handbook.docx`
  both slugged to `company-handbook.md` and one silently overwrote the other. Both tools
  now write under `<out>/<source-system>/` (`--source-system`, default notion/drive);
  gbrain's path→slug mapping then yields distinct pages. Same-titled cross-source files
  are normal — collision-proof the paths, don't rely on titles being unique.
- **Validate the environment on the operating machine before any customer run — the
  rehearsal IS that validation.** A fresh venv from the committed requirements.txt, run
  against the rehearsal corpus with the five-fact retrieval check, is the gate that must
  pass on the actual operator box before the first partner ingest. Package resolution is
  not reproducible across time by version-range alone.

### §10 — Customer-facing instructions are infrastructure (2026-07-27, customer-instance onboarding)
Two vendor export links (Notion, Claude) failed in front of a live customer because the instruction "forward me the link" shipped unverified: export downloads are session-bound to the requesting account, on every major vendor. Cost: a stalled customer session and repeated asks of a client. Rules now standing: (1) every step in any customer-bound instruction is mechanism-verified before it ships, or flagged unverified to the operator; (2) files move, links don't — the shared Drive folder is the standing transfer channel; (3) Notion access is member-grant so exports are operator-run forever after; (4) the customer's total technical surface is clicks the operator has personally verified exist.
