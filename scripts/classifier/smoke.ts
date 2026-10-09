import "./env.ts";
import { loadCriteria } from "./loader.ts";
import { retrievalFromEnv, GbrainRetrievalClient } from "./retrieval.ts";
import { Judge, judgeConfigFromEnv } from "./judge.ts";
import { runWithExhaustion } from "./exhaustion.ts";
import { assertIngestLogUsable } from "./ingest-log.ts";
import { appendResult, newRunId, RESULTS_PATH } from "./results.ts";

/**
 * End-to-end smoke test (Task 2 step 6): ONE dummy criterion entry, driven through
 * the whole harness against the LIVE instance corpus — retrieval returns real chunk
 * ids, the judge renders a state from the dummy entry's enum, and the record lands
 * in the append-only JSONL store. Proves plumbing, not scoring: the loader is still
 * a stub (no real criteria) until the ruled CRITERIA.yaml lands.
 *
 * Refuses to "pass" against the offline stub unless --allow-stub is given — a
 * canned-evidence run must never be mistaken for the live smoke (verify-on-real).
 */

async function main() {
  const allowStub = process.argv.includes("--allow-stub");
  const retrieval = retrievalFromEnv();

  if (retrieval.kind !== "gbrain" && !allowStub) {
    console.error(
      "smoke: CLASSIFIER_QUERY_URL / CLASSIFIER_QUERY_TOKEN are not set, so retrieval\n" +
        "would use the offline stub (canned evidence). The live smoke must hit the real\n" +
        "live instance corpus. Populate both vars in .env, or pass --allow-stub to exercise the\n" +
        "plumbing offline (NOT a valid live smoke).",
    );
    process.exit(1);
  }

  const [entry] = loadCriteria("<stub>");
  const cfg = judgeConfigFromEnv();
  const judge = new Judge(cfg);
  const runId = newRunId();

  console.log(`smoke: retrieval=${retrieval.kind}  model=${cfg.model}  runId=${runId}`);
  console.log(`smoke: entry=${entry.id}  stateEnum=[${entry.stateEnum.join(", ")}]`);

  // B-13 run-start guard: a real run that could emit an absence needs a readable
  // ingest log, or genuine-absence verdicts would be untruthful. Stub is exempt
  // (canned evidence — explicitly not a real run).
  const ingestLog = await retrieval.ingestLog();
  if (retrieval.kind !== "stub") assertIngestLogUsable(ingestLog);
  console.log(
    `smoke: ingest log ${ingestLog.available ? `available (${ingestLog.entries.length} entries)` : "UNAVAILABLE"}`,
  );

  const run = await runWithExhaustion(entry, retrieval, judge, ingestLog);

  console.log(
    `smoke: search returned ${run.searchEvidence.length} chunk(s); ` +
      `sweep ${run.sweepRan ? `ran (+${run.sweptEvidence.length} new)` : "not run"}` +
      `${run.absenceNote ? `; absence: ${run.absenceNote}` : ""}`,
  );
  console.log(
    `smoke: evidence chunk ids = [${run.searchEvidence.map((c) => c.id).join(", ")}]`,
  );

  const record = appendResult(run.verdict, {
    criterionId: entry.id,
    runId,
    model: cfg.model,
    effort: cfg.effort,
    stateEnum: entry.stateEnum,
  });

  console.log(`smoke: verdict state = ${run.verdict.state}`);
  const u = judge.lastUsage;
  if (u) {
    console.log(
      `smoke: usage — in=${u.input_tokens} out=${u.output_tokens} ` +
        `cache_read=${u.cache_read_input_tokens ?? 0} cache_write=${u.cache_creation_input_tokens ?? 0}`,
    );
  }
  console.log(`smoke: rationale = ${run.verdict.rationale ?? "(none)"}`);
  console.log(`smoke: record appended to ${RESULTS_PATH}:`);
  console.log(JSON.stringify(record, null, 2));

  if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();
  console.log("smoke: OK");
}

main().catch((err) => {
  console.error("smoke: FAILED —", err instanceof Error ? err.message : err);
  process.exit(1);
});
