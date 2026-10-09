import "../scripts/classifier/env.ts";
import { createServer } from "node:http";
import { readFileSync, existsSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { generate, generateReviewed, listDrafts, GenerationExcludedError, TemplateFabricationError, SectionCoverageError, ValidatorFailure } from "./classifier/generate.ts";
import { GENERATION_EXCLUDED } from "./classifier/gap-class.ts";
import { retrievalFromEnv, GbrainRetrievalClient, ADOPTED_SLUG_PREFIX } from "./classifier/retrieval.ts";
import { parseDraftMeta, isApprovable, isPlanMode, approveFinalAllowed } from "./board-approval.ts";

/**
 * Local board server (board-driven remediation flow, 2026-07-16). Serves the built board
 * over localhost AND exposes the remediation API the board calls:
 *   GET  /api/drafts            -> pending drafts in generated-drafts/ (metadata parsed)
 *   GET  /api/draft?name=<f>    -> one draft's raw markdown
 *   POST /api/generate {id}     -> generate a remediation draft for a subcategory
 *   POST /api/approve  {id,note}-> APPROVE (artifact-sufficient only, per-document, explicit)
 *   POST /api/reject   {id,note}-> record a rejection note
 * No batch approval, no auto-ingest anywhere: approval is one explicit click per document,
 * gated structurally to artifact-sufficient gaps.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..");
const DIST = join(REPO, "board", "dist");
const DRAFTS = join(REPO, "generated-drafts");
const APPROVALS = join(DRAFTS, "APPROVAL-LOG.jsonl");
const PORT = Number(process.env.BOARD_PORT || 4200);

const MIME: Record<string, string> = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml" };

const parseMeta = parseDraftMeta; // shared parser (scripts/board-approval.ts)

function draftsList() {
  const rows = listDrafts().map(({ file, name }) => {
    const md = readFileSync(file, "utf8");
    // Per-draft pipeline status summary from the sidecar (for the queue-view chips). A queued
    // draft passed the harness by definition; validator/self-review/authority come from the sidecar.
    const sidecar = file.replace(/\.md$/, ".review.json");
    let status: any = null;
    if (existsSync(sidecar)) {
      try {
        const s = JSON.parse(readFileSync(sidecar, "utf8"));
        const verdicts = s.structure?.verdicts ?? [];
        status = {
          validator: s.validator?.pass ?? null,
          selfReview: verdicts.length ? verdicts.every((v: any) => v.verdict === "pass") : null,
          selfReviewSummary: verdicts.length ? `${verdicts.filter((v: any) => v.verdict === "pass").length}/${verdicts.length}` : null,
          authority: s.authority ? (s.authority.findings?.length ?? 0) : null,
          harness: true, // queued => harness passed
          adversarial: s.adversarial?.verdict ?? null, // 07/18 gate: client-ready | adequate-with-reservations
          openRulings: (s.coverage ?? []).filter((c: any) => c.status === "open-ruling").length,
        };
      } catch { /* sidecar unreadable */ }
    }
    const meta = parseMeta(md);
    return { name, meta, status };
  });
  // QUEUE HYGIENE (07/18 STEP 2b): show exactly ONE draft per subcategory — the latest by timestamp.
  // Superseded drafts stay as files (history) but never render in the pending bar. A draft with no
  // parseable subcategory (legacy/unclassed) is keyed by its filename so it is never merged away.
  const latest = new Map<string, typeof rows[number]>();
  for (const row of rows) {
    const key = row.meta.subcategory || row.name;
    const cur = latest.get(key);
    const ts = (r: typeof row) => Date.parse(r.meta.timestamp || "") || 0;
    if (!cur || ts(row) >= ts(cur)) latest.set(key, row);
  }
  return [...latest.values()].sort((a, b) => (a.meta.subcategory || a.name).localeCompare(b.meta.subcategory || b.name));
}

/** Parse the append-only approval log into records (best-effort; skips malformed lines). */
function readApprovals(): any[] {
  if (!existsSync(APPROVALS)) return [];
  return readFileSync(APPROVALS, "utf8").split("\n").filter((l) => l.trim())
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

async function body(req: any): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  try { return raw ? JSON.parse(raw) : {}; } catch { return {}; }
}

function json(res: any, code: number, obj: any) { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(obj)); }

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const p = url.pathname;
  try {
    if (p === "/api/drafts") return json(res, 200, { drafts: draftsList(), generationExcluded: [...GENERATION_EXCLUDED] });
    if (p === "/api/approval-log") {
      // STEP 3d: the operator's ruling history — approve/reject/void records with notes +
      // timestamps, newest first. Void records nullify a prior reject/approve but do NOT delete it.
      const records = readApprovals();
      const enriched = records.map((r) => ({
        ...r,
        // mark a reject/approve as voided when a later void names it (same id).
        voided: r.decision !== "void" && records.some((v) => v.decision === "void" && v.id === r.id && new Date(v.timestamp) >= new Date(r.timestamp)),
      })).reverse();
      return json(res, 200, { log: enriched });
    }
    if (p === "/api/draft") {
      const name = url.searchParams.get("name") || "";
      const file = join(DRAFTS, name.replace(/[^A-Za-z0-9._-]/g, ""));
      if (!existsSync(file)) return json(res, 404, { error: "not found" });
      // Attach the pipeline review sidecar (validator / self-review / authority) + saved answers.
      const sidecar = file.replace(/\.md$/, ".review.json");
      const answersFile = file.replace(/\.md$/, ".answers.json");
      const review = existsSync(sidecar) ? JSON.parse(readFileSync(sidecar, "utf8")) : null;
      const answers = existsSync(answersFile) ? JSON.parse(readFileSync(answersFile, "utf8")) : {};
      return json(res, 200, { name, markdown: readFileSync(file, "utf8"), review, answers });
    }
    if (p === "/api/answers" && req.method === "POST") {
      // STEP 4b: persist operator answers to the Decisions-required questions (answers.json sidecar).
      const { name, answers } = await body(req);
      const file = join(DRAFTS, String(name || "").replace(/[^A-Za-z0-9._-]/g, ""));
      if (!existsSync(file)) return json(res, 404, { error: "draft not found" });
      writeFileSync(file.replace(/\.md$/, ".answers.json"), JSON.stringify(answers ?? {}, null, 2) + "\n", "utf8");
      return json(res, 200, { ok: true, saved: Object.keys(answers ?? {}).length });
    }
    if (p === "/api/generate" && req.method === "POST") {
      const { id, answers, mode } = await body(req);
      if (!id) return json(res, 400, { error: "id required" });
      // 07/18 mode matrix: an operator can OVERRIDE the resolved mode (force artifact | plan) and regenerate.
      const overrideMode = mode === "artifact" || mode === "plan" ? mode : undefined;
      try {
        // Pipeline of record (GENERATION-STANDARD.md): stages 2-5 for template-backed subcategories.
        // Regenerate-with-answers: injected answers become company rulings (STEP 4b).
        const r = await generateReviewed(id, answers ?? {}, overrideMode);
        return json(res, 200, { ...r, name: r.file.split("/").pop(), markdown: readFileSync(r.file, "utf8") });
      } catch (e: any) {
        // Structural refusals return 403 (button should not have been offered / fabrication guard).
        if (e instanceof GenerationExcludedError) return json(res, 403, { error: e.message, excluded: true });
        if (e instanceof TemplateFabricationError) return json(res, 422, { error: e.message });
        if (e instanceof SectionCoverageError) return json(res, 422, { error: e.message, coverageFailure: true });
        if (e instanceof ValidatorFailure) return json(res, 422, { error: e.message, validatorFailure: true, failures: e.failures });
        throw e;
      }
    }
    if (p === "/api/reject" && req.method === "POST") {
      const { id, note } = await body(req);
      appendFileSync(APPROVALS, JSON.stringify({ id, decision: "reject", note: note ?? "", timestamp: new Date().toISOString() }) + "\n");
      return json(res, 200, { ok: true });
    }
    if (p === "/api/attest" && req.method === "POST") {
      // 07/18 mode matrix: a professional-review attestation. An approval-log record noting reviewer
      // type + date; it lifts the professional_review gate so approve-as-final becomes permitted.
      const { id, reviewer, note } = await body(req);
      const rv = reviewer === "attorney" || reviewer === "hr" ? reviewer : null;
      if (!id || !rv) return json(res, 400, { error: "id and reviewer (attorney|hr) required" });
      appendFileSync(APPROVALS, JSON.stringify({ id, decision: "attest", reviewer: rv, note: note ?? "", timestamp: new Date().toISOString() }) + "\n");
      return json(res, 200, { ok: true, attested: id, reviewer: rv });
    }
    if (p === "/api/approve" && req.method === "POST") {
      const { id, name, note, status } = await body(req);
      const file = join(DRAFTS, String(name || "").replace(/[^A-Za-z0-9._-]/g, ""));
      if (!existsSync(file)) return json(res, 404, { error: "draft not found" });
      const meta = parseMeta(readFileSync(file, "utf8"));
      // STRUCTURAL guard: approvable-as-working is plan mode (any class) OR artifact-sufficient.
      if (!isApprovable(meta)) {
        return json(res, 403, { error: `approval blocked: gap_class=${meta.gap_class ?? "(absent)"} is not artifact-sufficient and not plan mode; recommendations/scaffolds and un-classed drafts are never approvable (GAP-CLASS-DOCTRINE)` });
      }
      // B2: the approval record captures WHICH lifecycle status was chosen (working|final).
      const st = status === "final" ? "final" : "working"; // default working
      // 07/18 INVARIANTS: plan mode is working-only (never flips); professional_review != none needs
      // an attestation on record before finalize. Enforce server-side, not only in the UI.
      if (st === "final") {
        const attested = readApprovals().some((r) => r.decision === "attest" && r.id === id);
        if (!approveFinalAllowed(meta, attested)) {
          const why = isPlanMode(meta)
            ? `plan mode is working + never flips a tile (approve as working)`
            : `requires ${meta.professional_review ?? "professional"} review attestation before finalize (record it, then approve as final)`;
          return json(res, 403, { error: `approve-as-final blocked: ${why}.` });
        }
      }
      // Record the approval. Ingestion + re-judge are performed by the operator-run adopt step
      // (scripts/adopt-draft.ts), NOT inline here. Plan-mode drafts are working records only and are
      // refused by adopt-draft (zero grade movement, any class).
      appendFileSync(APPROVALS, JSON.stringify({ id, name, decision: "approve", status: st, note: note ?? "", timestamp: new Date().toISOString(), gap_class: meta.gap_class, mode: meta.mode ?? "artifact" }) + "\n");
      const next = isPlanMode(meta)
        ? `plan approved as working (no adoption/flip — plan is a working record only)`
        : `run: node scripts/adopt-draft.ts ${id} generated-drafts/${name} --status ${st}`;
      return json(res, 200, { ok: true, approved: id, status: st, next });
    }
    if (p === "/api/working-docs") {
      // B5: working-documents panel roster — approval records (status working) reconciled with
      // LIVE page status via get_page. A doc leaves the panel when finalized (live status != working).
      const approvals = readApprovals();
      const latest = new Map<string, any>();  // id -> most-recent approve record
      for (const a of approvals) if (a.decision === "approve") latest.set(a.id, a);
      const retrieval = retrievalFromEnv();
      const workingDocs: any[] = [];
      if (retrieval instanceof GbrainRetrievalClient) {
        for (const a of latest.values()) {
          if (a.status && a.status !== "working") continue; // approved-as-final: not a working doc
          const slug = `${ADOPTED_SLUG_PREFIX}${String(a.id).toLowerCase()}-adopted`;
          const rec = await retrieval.getPageRecord(slug).catch(() => null);
          if (!rec) continue;                                // approved but not yet adopted
          const live = (rec.frontmatter as any)?.status;
          if (live && live !== "working") continue;          // finalized in the store -> leaves panel
          const adoptedAt = String((rec.frontmatter as any)?.created ?? a.timestamp);
          const ageDays = Math.max(0, Math.floor((Date.now() - new Date(adoptedAt).getTime()) / 86_400_000));
          workingDocs.push({ id: a.id, tile: a.id, title: (rec.frontmatter as any)?.title ?? slug, slug, adoptedAt, ageDays });
        }
        await retrieval.close();
      }
      return json(res, 200, { workingDocs });
    }
    // /leverage — serve the emitted Leverage menu for the CURRENT resolution. Mirrors build-data's
    // run selection (last-sorted .rich.json -> company slug), then serves the latest matching menu
    // HTML. The menu's root-relative /#<ID> links resolve back into this board (shared origin).
    if (p === "/leverage") {
      const RUNS = join(REPO, "runs-of-record");
      const runFiles = existsSync(RUNS) ? readdirSync(RUNS).filter((f) => f.endsWith(".rich.json")).sort() : [];
      const slug = runFiles.length ? runFiles[runFiles.length - 1].split("-board-")[0] : "";
      const menus = (existsSync(RUNS) ? readdirSync(RUNS) : [])
        .filter((f) => f.endsWith(".html") && (slug ? f.startsWith(`${slug}-menu-`) : /-menu-\d+\.html$/.test(f)))
        .sort();
      if (!menus.length) return json(res, 404, { error: "no Leverage menu emitted for the current run; run the menu resolver first" });
      res.writeHead(200, { "content-type": "text/html" });
      res.end(readFileSync(join(RUNS, menus[menus.length - 1])));
      return;
    }
    // static: board/dist
    let fp = join(DIST, p === "/" ? "index.html" : p.replace(/^\/+/, ""));
    if (!existsSync(fp) || p.startsWith("/#")) fp = join(DIST, "index.html"); // SPA fallback
    if (!existsSync(fp)) return json(res, 404, { error: "not found; run `npm run build` in board/ first" });
    res.writeHead(200, { "content-type": MIME[extname(fp)] || "application/octet-stream" });
    res.end(readFileSync(fp));
  } catch (e: any) {
    json(res, 500, { error: String(e?.message || e) });
  }
});

server.listen(PORT, () => console.log(`board+remediation server: http://localhost:${PORT}/  (board/dist + /api/*)`));
