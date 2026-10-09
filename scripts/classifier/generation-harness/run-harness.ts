/**
 * Generation harness runner (Task 1, 2026-07-17). One command runs all deterministic checks
 * against all frozen fixtures and prints a fixture × check matrix. NO model calls.
 *
 * Assertion contract: a KNOWN-BAD fixture MUST fail the specific check it encodes (a known-bad
 * that passes its encoded check = harness failure — the check is too weak); a KNOWN-GOOD fixture
 * MUST pass every check. Exit non-zero on any violation.
 *
 * Run: `node scripts/classifier/generation-harness/run-harness.ts`.
 */
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runChecks, parseMetaComment, CHECK_NAMES, type CheckCtx } from "./checks.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "fixtures");
const TEMPLATE_DIR = join(HERE, "..", "..", "..", "generation-templates");

/** Load a template's section titles via python3+PyYAML (same INFRA-clean path as loader.ts). */
function templateSectionTitles(name: string): string[] {
  const path = join(TEMPLATE_DIR, `${name}.yaml`);
  if (!existsSync(path)) return [];
  const py = "import yaml,json,sys; json.dump(yaml.safe_load(open(sys.argv[1],encoding='utf-8')), sys.stdout, default=str)";
  const r = spawnSync("python3", ["-c", py, path], { encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 });
  if (r.status !== 0) return [];
  return (JSON.parse(r.stdout).sections ?? []).map((s: any) => String(s.title));
}

function main() {
  const manifest = JSON.parse(readFileSync(join(FIXTURES, "manifest.json"), "utf-8")).fixtures as any[];
  const rows: { fixture: string; ruling: string; encodes: string | null; results: Record<string, boolean>; detail: Record<string, string> }[] = [];
  let violations = 0;

  for (const fx of manifest) {
    const md = readFileSync(join(FIXTURES, fx.file), "utf-8");
    const ctx: CheckCtx = { meta: parseMetaComment(md) };
    if (fx.template) ctx.templateSections = templateSectionTitles(fx.template);
    if (fx.sidecar && existsSync(join(FIXTURES, fx.sidecar))) ctx.references = JSON.parse(readFileSync(join(FIXTURES, fx.sidecar), "utf-8")).references ?? [];
    const results = runChecks(md, ctx);
    const byName: Record<string, boolean> = {}, detail: Record<string, string> = {};
    for (const r of results) { byName[r.check] = r.pass; detail[r.check] = r.detail; }
    rows.push({ fixture: fx.id, ruling: fx.ruling, encodes: fx.encodes, results: byName, detail });

    // Assertions.
    if (fx.ruling === "bad") {
      if (byName[fx.encodes] !== false) { console.log(`  ✗ HARNESS FAILURE: known-bad ${fx.id} PASSED its encoded check ${fx.encodes} (check too weak)`); violations++; }
    } else {
      const failed = CHECK_NAMES.filter((c) => byName[c] === false);
      if (failed.length) { console.log(`  ✗ HARNESS FAILURE: known-good ${fx.id} FAILED ${failed.join(", ")}`); violations++; }
    }
  }

  // Matrix.
  const w = 30;
  console.log("\n=== GENERATION HARNESS — fixture × check matrix ===\n");
  console.log("fixture".padEnd(w) + CHECK_NAMES.map((c) => c.slice(0, 10).padEnd(12)).join("") + "  ruling/encodes");
  console.log("-".repeat(w + CHECK_NAMES.length * 12 + 18));
  for (const r of rows) {
    const cells = CHECK_NAMES.map((c) => (r.results[c] ? "PASS" : "FAIL").padEnd(12)).join("");
    console.log(r.fixture.padEnd(w) + cells + `  ${r.ruling}${r.encodes ? " / " + r.encodes : ""}`);
  }
  console.log("\nExpected: each known-bad FAILs its encoded check (bold-fail); known-good PASSes all.\n");
  // Per-cell detail for any FAIL (the offending location).
  for (const r of rows) for (const c of CHECK_NAMES) if (!r.results[c]) console.log(`  ${r.fixture} · ${c}: ${r.detail[c]}`);

  console.log(`\n${violations === 0 ? "HARNESS OK — every known-bad fails its encoded check; known-good passes all." : `HARNESS VIOLATIONS: ${violations}`}`);
  process.exit(violations === 0 ? 0 : 1);
}

main();
