import "./env.ts";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadCriteria } from "./loader.ts";
import { Judge } from "./judge.ts";
import type { Chunk, CriterionEntry } from "./types.ts";

/**
 * run-fixtures — the golden-fixture validation runner (9E-b).
 *
 * For each fixture: look up its criterion entry from the ruled CRITERIA-SCHEMA.yaml
 * (via loadCriteria — the only schema-coupled surface), hand the fixture's evidence
 * to the judge AS THE RETRIEVED SET (fixtures are self-contained; no live retrieval),
 * and compare the verdict to the fixture's assertion.
 *
 * Assertion rule (ruled, 9E-b Phase 2): a fixture asserts its `expected_state` (the
 * HARD pass/fail gate) plus a condition-applied SCENARIO. `condition_applied` is
 * descriptive prose, not a conditionality-class token, so it is NOT string-equated
 * to the judge's returned class — doing so would be meaningless. Instead two
 * STRUCTURAL checks are recorded and surfaced (never used to flip a state PASS):
 *   - condition coherence: condition-driven states (documented-n-a, placeholder,
 *     informational, not-ingested) should carry a non-null conditionApplied.
 *   - citation validity: attributed states (evidence-found, thin) must cite >=1
 *     chunk id, and every cited id must exist in the fed evidence set (corpus-
 *     validity). Citations are validated for non-emptiness + corpus-validity only,
 *     NEVER by exact chunk-id (the ruled rule).
 *
 * DO NOT adjust any fixture or criterion to make a failure pass. Failures route to
 * the operator verbatim.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRITERIA_PATH = join(__dirname, "..", "..", "reference-model", "CRITERIA-SCHEMA.yaml");
const FIXTURES_PATH = join(__dirname, "fixtures", "golden-fixtures.jsonl");
const RUNS_DIR = join(__dirname, "runs");

const CONDITION_DRIVEN = new Set([
  "documented-n-a",
  "placeholder",
  "informational",
  "not-ingested",
]);
const ATTRIBUTED = new Set(["evidence-found", "thin"]);

interface Fixture {
  fixture: string;
  criterion: string;
  expected_state: string;
  condition_applied: string;
  failure_mode: string;
  evidence: { source: string; chunk?: string; gist: string; origin?: string; slug?: string }[];
  /** Firewall blindness pairs (2026-07-16): two fixtures sharing a group must render
   *  the SAME verdict despite one carrying `origin: ladder-generated` and one not. */
  blindnessGroup?: string;
}

interface FixtureRunRecord {
  fixture: string;
  criterion: string;
  expected_state: string;
  actual_state: string;
  pass: boolean; // state gate
  condition_applied_expected: string; // scenario prose (context, not equated)
  condition_applied_judge: string | null;
  condition_coherent: boolean;
  cited_ids: string[];
  citations_valid: boolean;
  failure_mode: string;
  rationale?: string;
  runId: string;
  model: string;
  effort: string | null;
  timestamp: string;
}

function fixtureEvidenceToChunks(fx: Fixture): { chunks: Chunk[]; ids: Set<string> } {
  const ids = new Set<string>();
  const chunks = fx.evidence.map((e, i) => {
    const id = e.chunk && e.chunk.trim() ? e.chunk : `${fx.fixture}-e${i}`;
    ids.add(id);
    // origin/slug are attached to the chunk but STRIPPED before the judge (provenance.ts):
    // slug/pageId are removed and the id is opaqued, so a signaling slug (remediation/x-adopted)
    // cannot reach judge context. pageId mirrors slug so the D-pair exercises the pre-fix leak path.
    return { id, text: `[source: ${e.source}] ${e.gist}`, origin: e.origin, slug: e.slug, pageId: e.slug } as Chunk;
  });
  return { chunks, ids };
}

async function main() {
  const criteria = loadCriteria(CRITERIA_PATH);
  const byId = new Map<string, CriterionEntry>(criteria.map((e) => [e.id, e]));

  let fixtures: Fixture[] = readFileSync(FIXTURES_PATH, "utf-8")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Fixture);

  // Subset hooks (both optional; ONLY applies before LIMIT):
  //  - CLASSIFIER_FIXTURE_ONLY=FX-a,FX-b runs only the named fixtures (targeted rerun).
  //  - CLASSIFIER_FIXTURE_LIMIT=N runs only the first N of what remains (wiring canary).
  const only = process.env.CLASSIFIER_FIXTURE_ONLY
    ? new Set(process.env.CLASSIFIER_FIXTURE_ONLY.split(",").map((s) => s.trim()).filter(Boolean))
    : null;
  if (only) fixtures = fixtures.filter((f) => only.has(f.fixture));
  const limit = process.env.CLASSIFIER_FIXTURE_LIMIT
    ? parseInt(process.env.CLASSIFIER_FIXTURE_LIMIT, 10)
    : 0;
  if (limit > 0) fixtures = fixtures.slice(0, limit);

  const judge = new Judge();
  const runId = `fixtures-${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const timestamp = new Date().toISOString();
  const records: FixtureRunRecord[] = [];

  console.log(
    `Running ${fixtures.length} fixtures against ${criteria.length} criteria — model ${judge.config.model}` +
      (judge.config.effort ? ` (effort ${judge.config.effort})` : "") +
      `\n`,
  );

  let inTok = 0;
  let outTok = 0;
  for (const fx of fixtures) {
    const entry = byId.get(fx.criterion);
    if (!entry) {
      // Structural failure: fixture names a criterion absent from the work list.
      const rec: FixtureRunRecord = {
        fixture: fx.fixture,
        criterion: fx.criterion,
        expected_state: fx.expected_state,
        actual_state: "(criterion-not-found)",
        pass: false,
        condition_applied_expected: fx.condition_applied,
        condition_applied_judge: null,
        condition_coherent: false,
        cited_ids: [],
        citations_valid: false,
        failure_mode: fx.failure_mode,
        runId,
        model: judge.config.model,
        effort: judge.config.effort,
        timestamp,
      };
      records.push(rec);
      console.log(`  FAIL  ${fx.fixture.padEnd(7)} ${fx.criterion.padEnd(9)} criterion not found in work list`);
      continue;
    }

    const { chunks, ids } = fixtureEvidenceToChunks(fx);
    const result = await judge.judge(entry, chunks);
    if (judge.lastUsage) {
      inTok += judge.lastUsage.input_tokens ?? 0;
      outTok += judge.lastUsage.output_tokens ?? 0;
    }

    const statePass = result.state === fx.expected_state;
    const conditionCoherent = CONDITION_DRIVEN.has(fx.expected_state)
      ? result.conditionApplied != null
      : true; // scored states may or may not carry a trigger; not held against them
    const citedIds = result.evidenceChunkIds ?? [];
    const citationsValid = ATTRIBUTED.has(fx.expected_state)
      ? citedIds.length > 0 && citedIds.every((c) => ids.has(c))
      : citedIds.every((c) => ids.has(c)); // absence states: any cite must still be corpus-valid

    const rec: FixtureRunRecord = {
      fixture: fx.fixture,
      criterion: fx.criterion,
      expected_state: fx.expected_state,
      actual_state: result.state,
      pass: statePass,
      condition_applied_expected: fx.condition_applied,
      condition_applied_judge: result.conditionApplied,
      condition_coherent: conditionCoherent,
      cited_ids: citedIds,
      citations_valid: citationsValid,
      failure_mode: fx.failure_mode,
      rationale: result.rationale,
      runId,
      model: judge.config.model,
      effort: judge.config.effort,
      timestamp,
    };
    records.push(rec);

    const flags =
      (conditionCoherent ? "" : " [cond?]") + (citationsValid ? "" : " [cite?]");
    console.log(
      `  ${statePass ? "PASS" : "FAIL"}  ${fx.fixture.padEnd(7)} ${fx.criterion.padEnd(9)} ` +
        `exp=${fx.expected_state.padEnd(15)} got=${result.state.padEnd(15)}${flags}`,
    );
  }

  // Persist append-only results.
  mkdirSync(RUNS_DIR, { recursive: true });
  const outPath = join(RUNS_DIR, `${runId}.jsonl`);
  writeFileSync(outPath, records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");

  // Aggregate.
  const passed = records.filter((r) => r.pass).length;
  const failed = records.length - passed;
  const condIncoherent = records.filter((r) => !r.condition_coherent).length;
  const citeInvalid = records.filter((r) => !r.citations_valid).length;

  console.log(`\n================ AGGREGATE ================`);
  console.log(`  state PASS: ${passed}/${records.length}   state FAIL: ${failed}`);
  console.log(`  structural notes -> condition-incoherent: ${condIncoherent}   citation-invalid: ${citeInvalid}`);
  console.log(`  tokens: in=${inTok} out=${outTok}`);
  console.log(`  results: ${outPath}`);

  if (failed > 0) {
    console.log(`\n================ FAILURES (verbatim, grouped by failure_mode) ================`);
    const fails = records.filter((r) => !r.pass);
    const groups = new Map<string, FixtureRunRecord[]>();
    for (const f of fails) {
      const g = groups.get(f.failure_mode) ?? [];
      g.push(f);
      groups.set(f.failure_mode, g);
    }
    for (const [mode, g] of groups) {
      console.log(`\n--- failure_mode: ${mode} (${g.length}) ---`);
      for (const f of g) {
        console.log(
          `  ${f.fixture} ${f.criterion}: expected ${f.expected_state}, got ${f.actual_state}`,
        );
        console.log(`     scenario: ${f.condition_applied_expected}`);
        console.log(`     judge.conditionApplied: ${f.condition_applied_judge ?? "none"}  cited: [${f.cited_ids.join(", ")}]`);
        if (f.rationale) console.log(`     rationale: ${f.rationale}`);
      }
    }
  }

  // Firewall blindness gate: within each blindnessGroup the verdicts must MATCH
  // (identical evidence, one carrying origin: ladder-generated, one not — the strip
  // makes the judge blind, so verdicts must agree). Distinct group in the report.
  const grpOf = new Map(fixtures.map((f) => [f.fixture, f.blindnessGroup]));
  const stateOf = new Map(records.map((r) => [r.fixture, r.actual_state]));
  const blindGroups = new Map<string, { fixture: string; state: string }[]>();
  for (const f of fixtures) {
    if (!f.blindnessGroup) continue;
    const arr = blindGroups.get(f.blindnessGroup) ?? [];
    arr.push({ fixture: f.fixture, state: stateOf.get(f.fixture) ?? "(none)" });
    blindGroups.set(f.blindnessGroup, arr);
  }
  let blindnessFailed = 0;
  if (blindGroups.size) {
    console.log(`\n================ BLINDNESS PAIRS (firewall) ================`);
    for (const [g, members] of blindGroups) {
      const states = new Set(members.map((m) => m.state));
      const match = states.size === 1;
      if (!match) blindnessFailed++;
      console.log(`  ${match ? "MATCH" : "MISMATCH"}  ${g}: ${members.map((m) => `${m.fixture}=${m.state}`).join("  ")}`);
    }
    console.log(`  blindness pairs: ${blindGroups.size}   mismatches: ${blindnessFailed}`);
  }

  // Exit non-zero if any state FAIL or any blindness mismatch, so CI/operator sees it
  // loudly. This is a report of reality, not a gate to be satisfied by editing fixtures.
  process.exitCode = failed > 0 || blindnessFailed > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
