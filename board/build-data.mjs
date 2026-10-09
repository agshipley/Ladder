// build-data.mjs — prebuild step for the maturity board (v2).
//
// Bakes OFFLINE local sources into src/data.json (imported by the React app):
//   1. reference-model/CRITERIA-SCHEMA.yaml  -> category/subcategory structure + FULL criterion prose
//   2. runs-of-record/<run>.rich.json         -> the committed board run of record (rich verdicts)
//      (fallback: scripts/classifier/runs/ scratch store)
//
// No runtime network, no live corpus fetch. Re-run via `npm run gen`.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import { deriveMissing } from "./missing.mjs";
import { buildDocIndex, resolveTitles } from "./docs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..");
const SCHEMA_PATH = join(REPO, "reference-model", "CRITERIA-SCHEMA.yaml");
const RUNS_OF_RECORD = join(REPO, "runs-of-record");
const SCRATCH_RUNS = join(REPO, "scripts", "classifier", "runs");

const CAT_NAMES = {
  GTM: "Go-To-Market", PRODUCT: "Product", OPS: "Operations", PEOPLE: "People",
  LEGAL: "Legal", CAP: "Capital", FIN: "Finance", VIS: "Vision", ENG: "Engineering",
  AIOPS: "AI Operations", COMP: "Compliance",
};

function loadSchema() {
  const doc = parseYaml(readFileSync(SCHEMA_PATH, "utf8"));
  const cats = doc?.categories ?? {};
  return Object.entries(cats).map(([key, val]) => ({
    key,
    name: CAT_NAMES[key] || key,
    subcategories: (val?.subcategories ?? []).map((s) => ({
      id: s.id,
      criterion: String(s.criterion ?? ""),
      conditionality: s.conditionality ?? null,
      provenance: s.provenance ?? null,
    })),
  }));
}

// Run selection is EXPLICIT. It used to take the last .rich.json by sort order, which
// silently picked ref-board-002 over board-B-001 (b < t) and rendered the wrong
// corpus under the right filename. Alphabetical order is not a selection policy.
//   node build-data.mjs --run board-B-001
//   CLASSIFIER_BOARD_RUN_ID=board-B-001 node build-data.mjs
// With more than one candidate and no run named, this errors rather than guessing.
function loadRun() {
  const argIdx = process.argv.indexOf("--run");
  const wanted = (argIdx !== -1 ? process.argv[argIdx + 1] : process.env.CLASSIFIER_BOARD_RUN_ID) || null;
  const pick = (dir) =>
    existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".rich.json")).sort() : [];

  for (const [dir, source] of [[RUNS_OF_RECORD, "runs-of-record"], [SCRATCH_RUNS, "scratch"]]) {
    const files = pick(dir);
    if (!files.length) continue;

    let file;
    if (wanted) {
      file = files.find((f) => f === `${wanted}.rich.json` || f === wanted);
      if (!file) continue; // named run isn't here — try the next store
    } else if (files.length === 1) {
      file = files[0];
    } else {
      throw new Error(
        `build-data: ${files.length} runs in ${source} and no run named — refusing to guess.\n` +
        `  candidates: ${files.map((f) => f.replace(/\.rich\.json$/, "")).join(", ")}\n` +
        `  pass --run <id> or set CLASSIFIER_BOARD_RUN_ID.`,
      );
    }

    const { stats, records, corrections } = JSON.parse(readFileSync(join(dir, file), "utf8"));
    return { source, file, stats, records, corrections };
  }

  if (wanted) throw new Error(`build-data: run "${wanted}" not found in runs-of-record or scratch.`);
  return { source: "none", file: null, stats: null, records: [] };
}

const schemaCategories = loadSchema();
const run = loadRun();

// Apply board-003 corrections overlay (re-judge results; originals preserved in the
// rich.json corrections block). Only LANDED corrections change a displayed state.
if (Array.isArray(run.corrections)) {
  const byIdRec = new Map(run.records.map((r) => [r.id, r]));
  for (const c of run.corrections) {
    if (!c.landed) continue;
    const rec = byIdRec.get(c.tile);
    if (rec) {
      rec.correctedFrom = rec.state;
      rec.state = c.correctedState;
      rec.rationale = c.correctedRationale ?? rec.rationale;
      rec.conditionApplied = c.correctedConditionApplied ?? rec.conditionApplied;
      // Narrative re-render (07/18, LEGAL-09 posted-web false-red): a correction may reframe the
      // "Expected but not found" list without changing the tile state — e.g. a web-homed floor
      // element is a visibility gap ("verify on the public website"), not a company absence. The
      // original list is preserved on the correction record (originalMissingElements). Element
      // findings carry only satisfied|thin|absent, so the not-ingested framing lives here + in
      // the rationale, at subcategory grain.
      if (Array.isArray(c.correctedMissingElements)) rec.missingElements = c.correctedMissingElements;
    }
  }
}

// D1 — retirement-aware board (operator-ruled 2026-07-15): the board renders the RUN OF
// RECORD; the schema is enrichment, not the join key. Join by id; on a miss render the
// verdict from the record's own fields with retiredGrain:true. Never emit empty tiles for
// schema entries absent from the run (absent-from-run is not a tile state).
const recordById = new Map(run.records.map((r) => [r.id, r]));
const schemaIds = new Set();
for (const c of schemaCategories) for (const s of c.subcategories) schemaIds.add(s.id);
const catKeyOf = (id) => String(id).replace(/-\d+$/, "");

const categories = schemaCategories.map((cat) => {
  // Schema entries that actually have a verdict this run (drop empty tiles).
  const present = cat.subcategories.filter((s) => recordById.has(s.id));
  // Retired-grain records: this category's records whose id is not in the current schema.
  const retired = run.records
    .filter((r) => catKeyOf(r.id) === cat.key && !schemaIds.has(r.id))
    .map((r) => ({ id: r.id, criterion: String(r.name ?? r.id), conditionality: null, provenance: null, retiredGrain: true }));
  return { ...cat, subcategories: [...present, ...retired], retiredGrain: retired.length > 0 };
}).filter((cat) => cat.subcategories.length > 0);

const anyRetiredGrain = categories.some((c) => c.retiredGrain);
run.retirementBanner = anyRetiredGrain
  ? "Graded on the pre-v2 grain (6 areas). Re-graded on the 16-area grain at the next run."
  : null;
// B7/D7: run-level source-coverage legend (from the run stats; falls back to the default map).
run.sourceCoverage = run.stats?.sourceCoverage ?? [
  { source: "documents", status: "INGESTED" },
  { source: "code repository", status: "NOT INGESTED" },
  { source: "call recordings", status: "PRESENT AS VIDEO, NOT TRANSCRIBED, NOT INGESTED" },
  { source: "community channels", status: "NOT INGESTED" },
];

// Title resolution (Board-v4 part 2): no bare slug anywhere a human reads. Runs BEFORE
// the document index so it inherits resolved titles. Shared with the static export.
resolveTitles(run.records);

// Enrich verdicts with the derived "missing" (Expected-but-not-found) field and
// build the run-level document index. View-layer derivations; verdicts untouched.
for (const r of run.records) {
  const { missing, provenance } = deriveMissing(r);
  r.missing = missing;
  r.missingProvenance = provenance;
}
run.documentIndex = buildDocIndex(run.records);

// Leverage integration (paste 2): attach the emitted leverage-links for the SAME run, mirroring the
// run selection above (last-sorted <slug>-leverage-links-*.json whose `run` matches this run).
let leverage = null;
{
  const slug = run.file ? run.file.split("-board-")[0] : null;
  const linkFiles = existsSync(RUNS_OF_RECORD)
    ? readdirSync(RUNS_OF_RECORD)
        .filter((f) => f.endsWith(".json") && (slug ? f.startsWith(`${slug}-leverage-links-`) : /-leverage-links-\d+\.json$/.test(f)))
        .sort()
    : [];
  if (linkFiles.length) {
    const j = JSON.parse(readFileSync(join(RUNS_OF_RECORD, linkFiles[linkFiles.length - 1]), "utf8"));
    if (!run.stats?.runId || !j.run || j.run === run.stats.runId) {
      leverage = { menu_url: j.menu_url ?? "/leverage", resolution: j.resolution ?? null, links: j.links ?? {} };
    }
  }
}

const out = { generatedAt: new Date().toISOString(), categories, run, leverage };
writeFileSync(join(HERE, "src", "data.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(
  `board data generated: ${categories.length} categories, ` +
    `${categories.reduce((n, c) => n + c.subcategories.length, 0)} subcategories, ` +
    `${run.records.length} verdicts from ${run.source}${run.file ? ` (${run.file})` : ""}.`,
);
