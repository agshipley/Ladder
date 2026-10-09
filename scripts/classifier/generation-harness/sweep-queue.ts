/**
 * Phase D sweep: run the generation harness across EVERY queued deliverable (not just the frozen
 * fixtures) and print the draft × check matrix. A FAIL here means a deliverable slipped past the
 * gate — a bug in the gate. NO model calls. Run: `node scripts/classifier/generation-harness/sweep-queue.ts`.
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runChecks, parseMetaComment, CHECK_NAMES, type CheckCtx } from "./checks.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const DRAFTS = join(HERE, "..", "..", "..", "generated-drafts");
const TEMPLATE_DIR = join(HERE, "..", "..", "..", "generation-templates");

function templateSectionTitles(name: string): string[] {
  const path = join(TEMPLATE_DIR, `${name}.yaml`);
  if (!existsSync(path)) return [];
  const py = "import yaml,json,sys; json.dump(yaml.safe_load(open(sys.argv[1],encoding='utf-8')), sys.stdout, default=str)";
  const r = spawnSync("python3", ["-c", py, path], { encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 });
  return r.status === 0 ? (JSON.parse(r.stdout).sections ?? []).map((s: any) => String(s.title)) : [];
}

function main() {
  const files = readdirSync(DRAFTS).filter((f) => f.endsWith("-DRAFT.md"));
  const rows: { id: string; results: Record<string, boolean>; detail: Record<string, string> }[] = [];
  let fails = 0;
  for (const f of files) {
    const md = readFileSync(join(DRAFTS, f), "utf-8");
    const sidecarPath = join(DRAFTS, f.replace(/\.md$/, ".review.json"));
    if (!existsSync(sidecarPath)) continue; // pre-pipeline drafts (no sidecar) are not queued deliverables
    const sc = JSON.parse(readFileSync(sidecarPath, "utf-8"));
    const ctx: CheckCtx = { meta: parseMetaComment(md), references: sc.references ?? [] };
    if (sc.template) ctx.templateSections = templateSectionTitles(sc.template);
    const results = runChecks(md, ctx);
    const byName: Record<string, boolean> = {}, detail: Record<string, string> = {};
    for (const r of results) { byName[r.check] = r.pass; detail[r.check] = r.detail; }
    rows.push({ id: sc.id ?? f, results: byName, detail });
    fails += CHECK_NAMES.filter((c) => byName[c] === false).length;
  }

  const w = 16;
  console.log("=== HARNESS SWEEP — every queued deliverable × check ===\n");
  console.log("draft".padEnd(w) + CHECK_NAMES.map((c) => c.slice(0, 10).padEnd(12)).join(""));
  console.log("-".repeat(w + CHECK_NAMES.length * 12));
  for (const r of rows.sort((a, b) => a.id.localeCompare(b.id))) {
    console.log(r.id.padEnd(w) + CHECK_NAMES.map((c) => (r.results[c] ? "PASS" : "FAIL").padEnd(12)).join(""));
  }
  for (const r of rows) for (const c of CHECK_NAMES) if (!r.results[c]) console.log(`  FAIL ${r.id} · ${c}: ${r.detail[c]}`);
  console.log(`\n${rows.length} deliverables swept; ${fails === 0 ? "ALL PASS — nothing slipped the gate." : `${fails} FAIL(S) — gate bug, investigate.`}`);
  process.exit(fails === 0 ? 0 : 1);
}
main();
