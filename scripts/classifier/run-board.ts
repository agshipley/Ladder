import "./env.ts";
import { writeFileSync, appendFileSync, readFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadCriteria } from "./loader.ts";
import { retrievalFromEnv, GbrainRetrievalClient } from "./retrieval.ts";
import { Judge, judgeConfigFromEnv } from "./judge.ts";
import { runWithExhaustion, isAbsenceState } from "./exhaustion.ts";
import { assertIngestLogUsable } from "./ingest-log.ts";
import { appendResult, RESULTS_PATH } from "./results.ts";
import type { Chunk, CriterionEntry } from "./types.ts";

/**
 * run-board — the first full board run on the reference corpus. All 73 subcategories
 * against the LIVE instance corpus: real retrieval per entry, closure-assembled judge
 * calls, exhaustion sweep before every absence, ingest-log per B-13, store-side enum
 * validation on every write. No verdict is adjusted, rerun, or suppressed.
 *
 * RESUMABLE. Rich records are persisted INCREMENTALLY (append per entry) so a crash
 * loses nothing. On restart:
 *   - an entry already in the rich log is skipped;
 *   - an entry with a stored verdict (results.jsonl) but no rich record is
 *     RECONSTRUCTED retrieval-only (re-search for evidence gists; the stored verdict
 *     is authoritative and never re-judged) — flagged reconstructed:true;
 *   - an entry with neither is fully judged (retrieval -> judge -> exhaustion ->
 *     ingest-log -> enum-validated write).
 * Canary: GTM-01 first (CLASSIFIER_BOARD_CANARY_ONLY=1 to verify without writing).
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const CRITERIA_PATH = join(__dirname, "..", "..", "reference-model", "CRITERIA-SCHEMA.yaml");
const RUNS_DIR = join(__dirname, "runs");
const RUN_ID = process.env.CLASSIFIER_BOARD_RUN_ID || "ref-board-001";
const RICH_JSONL = join(RUNS_DIR, `${RUN_ID}.rich.jsonl`);
const RICH_JSON = join(RUNS_DIR, `${RUN_ID}.rich.json`);

function shortName(criterion: string): string {
  const first = String(criterion).split("\n")[0].trim();
  return (first.split(". ")[0].trim() || first).slice(0, 140);
}
const catOf = (id: string) => id.replace(/-\d+$/, "");
const oneLine = (s: string, n = 150) => String(s).replace(/\s+/g, " ").trim().slice(0, n);
function docTitle(text: string): string {
  const m = String(text).match(/^\s*#+\s*(.+)$/m);
  return m ? oneLine(m[1], 90) : "";
}

interface CitedChunk { id: string; slug: string | null; title: string; gist: string; score: number | null; origin?: string; status?: string; }
interface SourceDocument { slug: string | null; title: string; citationCount: number; }
interface StabilityInfo { checked: boolean; result: "confirmed" | "unstable" | null; firstState: string | null; secondState: string | null; secondRationale: string | null; }
interface BoardRecord {
  id: string; category: string; name: string; state: string;
  conditionApplied: string | null; rationale: string | null;
  citedChunks: CitedChunk[]; searchCount: number; sweepRan: boolean;
  sweepNewCount: number; sweepEscalatedFlip: boolean; absenceNote: string | null;
  emptyRetrieval: boolean; reconstructed: boolean;
  missingElements: string[]; // judge-reported delta (output contract); [] when satisfied
  elementFindings: { element: string; state: string; evidenceChunkIds: string[] }[];
  // Part B additions:
  sourceDocuments: SourceDocument[];   // B2: deduped {slug,title} across citedChunks, by citation count
  searchQueries: string[];             // B3: every query issued for this verdict, in order
  elementSweepRan: boolean;            // B4
  elementSweepTriggers: string[];      // B4
  stability: StabilityInfo;            // B6
  consistencyWarnings: string[];       // B5 (filled post-run)
}

/** B6: the safer of two disagreeing verdicts. thin over genuine-absence; not-ingested
 *  over genuine-absence. Otherwise the first stands (never move toward a preferred state
 *  beyond the ruled safety order). Carries both rationales for the record. */
function saferState(first: { state: string; rationale?: string } & any, second: { state: string; rationale?: string } & any) {
  const safer = (a: string, b: string): string | null => {
    const order: Record<string, number> = { "genuine-absence": 0, "not-ingested": 1, "thin": 2 };
    if (!(a in order) || !(b in order)) return null;
    return order[a] >= order[b] ? a : b;
  };
  const s = safer(first.state, second.state);
  const chosen = s === second.state ? second : first;
  return {
    ...chosen,
    rationale: `[stability: unstable — safer state shipped] first(${first.state}): ${first.rationale ?? ""} || second(${second.state}): ${second.rationale ?? ""}`,
  };
}

/** B2: dedupe cited chunks into source documents, ordered by citation count desc. */
function sourceDocuments(cited: CitedChunk[]): SourceDocument[] {
  const by = new Map<string, SourceDocument>();
  for (const c of cited) {
    const key = c.slug ?? c.title ?? c.id;
    if (!key) continue;
    const cur = by.get(key);
    if (cur) cur.citationCount++;
    else by.set(key, { slug: c.slug, title: c.title || (c.slug ?? ""), citationCount: 1 });
  }
  return [...by.values()].sort((a, b) => b.citationCount - a.citationCount);
}

function citedDetails(ids: unknown, pool: Chunk[]): CitedChunk[] {
  const list = Array.isArray(ids) ? (ids as string[]) : [];
  const byId = new Map(pool.map((c) => [c.id, c]));
  return list.map((id) => {
    const c = byId.get(id);
    if (!c) return { id, slug: null, title: "", gist: id.startsWith("ingest-log#") ? "(ingest-log basis)" : "(cited id not in re-retrieved set)", score: null };
    // B1: prefer the store-resolved title/slug; fall back to a heading parsed from text.
    // Firewall disclosure: carry origin (non-native) and lifecycle status (working) for the board.
    const origin = c.origin && c.origin !== "company-native" ? c.origin : undefined;
    const status = c.status;  // "working" | "final" | undefined (non-adopted)
    return { id, slug: c.slug ?? c.pageId ?? null, title: c.title || docTitle(c.text), gist: oneLine(c.text), score: c.score ?? null, ...(origin ? { origin } : {}), ...(status ? { status } : {}) };
  });
}

function readJsonl(path: string): any[] {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split("\n").filter((l) => l.trim()).map((l) => JSON.parse(l));
}

async function main() {
  // Clean-board gate (2026-07-17): --native-only runs a company-native-only board (excludes
  // Ladder-generated evidence) — the pristine, pre-generation view. Default runs show all
  // evidence with origin disclosed (unchanged).
  const originScope: import("./retrieval.ts").OriginScope = process.argv.includes("--native-only") ? "native" : "all";
  const allEntries = loadCriteria(CRITERIA_PATH);
  // Subset hook (parallels run-fixtures): CLASSIFIER_BOARD_ONLY=GTM-11,FIN-08 runs only
  // those entries (the Gate B two-subcategory smoke). Absent -> the full board.
  const onlyIds = process.env.CLASSIFIER_BOARD_ONLY
    ? new Set(process.env.CLASSIFIER_BOARD_ONLY.split(",").map((s) => s.trim()).filter(Boolean))
    : null;
  const entries = onlyIds ? allEntries.filter((e) => onlyIds.has(e.id)) : allEntries;
  if (entries.length === 0) throw new Error(`run-board: CLASSIFIER_BOARD_ONLY matched no entries`);
  console.log(`run-board: ${entries.length} entr${entries.length === 1 ? "y" : "ies"} of ${allEntries.length} loaded${onlyIds ? " (subset)" : ""}`);
  const retrieval = retrievalFromEnv();
  if (retrieval.kind !== "gbrain") throw new Error("run-board: retrieval is not live gbrain. A board run must hit the live instance corpus. Refusing.");
  const cfg = judgeConfigFromEnv();
  const judge = new Judge(cfg);
  const log = await retrieval.ingestLog();
  assertIngestLogUsable(log);

  // Prior state for resume.
  const storedVerdicts = new Map<string, any>();
  for (const r of readJsonl(RESULTS_PATH)) if (r.criterionId) storedVerdicts.set(r.criterionId, r);
  const richDone = new Map<string, BoardRecord>();
  for (const r of readJsonl(RICH_JSONL)) richDone.set(r.id, r);

  console.log(`run-board: runId=${RUN_ID} model=${cfg.model} ingest-log=${log.entries.length} | resume: ${storedVerdicts.size} stored verdicts, ${richDone.size} rich records\n`);

  const canaryOnly = process.env.CLASSIFIER_BOARD_CANARY_ONLY === "1";
  if (canaryOnly) {
    const canary = entries[0]; // first loaded entry (GTM-07 under CRITERIA-SCHEMA v1.5; GTM-01..06 retired at GTM v2)
    const run = await runWithExhaustion(canary, retrieval, judge, log, 20, originScope);
    console.log(JSON.stringify({ id: canary.id, state: run.verdict.state, conditionApplied: run.verdict.conditionApplied, citedChunks: citedDetails(run.verdict.evidenceChunkIds, [...run.searchEvidence, ...run.sweptEvidence]) }, null, 2));
    console.log(`--- CANARY-ONLY: verified, no write. usage in=${judge.cumUsage.input} out=${judge.cumUsage.output} ---`);
    if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();
    return;
  }

  mkdirSync(RUNS_DIR, { recursive: true });

  async function fullJudge(entry: CriterionEntry): Promise<BoardRecord> {
    const qStart = retrieval.issuedQueries.length; // B3: snapshot the query cursor
    const run = await runWithExhaustion(entry, retrieval, judge, log, 20, originScope);

    // B6 verdict stability (board runs only): a first genuine-absence / not-ingested is
    // re-judged ONCE, independently (fresh search evidence). Agreement -> confirmed.
    // Disagreement -> ship the SAFER state (thin over genuine-absence; not-ingested over
    // genuine-absence), record BOTH rationales, mark unstable. Never retry toward a
    // preferred outcome; never more than one retry.
    let verdict = run.verdict;
    const stability: StabilityInfo = { checked: false, result: null, firstState: null, secondState: null, secondRationale: null };
    if (verdict.state === "genuine-absence" || verdict.state === "not-ingested") {
      stability.checked = true;
      stability.firstState = verdict.state;
      const second = await judge.judge(entry, run.searchEvidence);
      stability.secondState = second.state;
      stability.secondRationale = second.rationale ?? null;
      if (second.state === verdict.state) {
        stability.result = "confirmed";
      } else {
        stability.result = "unstable";
        verdict = saferState(verdict, second); // ship the safer of the two
      }
    }

    appendResult(verdict, { criterionId: entry.id, runId: RUN_ID, model: cfg.model, effort: cfg.effort, stateEnum: entry.stateEnum });
    const pool = [...run.searchEvidence, ...run.sweptEvidence];
    const cited = citedDetails(verdict.evidenceChunkIds, pool);
    return {
      id: entry.id, category: catOf(entry.id), name: shortName(entry.criterion),
      state: verdict.state, conditionApplied: verdict.conditionApplied, rationale: verdict.rationale ?? null,
      citedChunks: cited,
      searchCount: run.searchEvidence.length, sweepRan: run.sweepRan, sweepNewCount: run.sweptEvidence.length,
      sweepEscalatedFlip: run.sweepRan && run.sweptEvidence.length > 0 && !isAbsenceState(verdict.state),
      absenceNote: run.absenceNote, emptyRetrieval: run.searchEvidence.length === 0, reconstructed: false,
      missingElements: Array.isArray(verdict.missingElements) ? verdict.missingElements : [],
      elementFindings: Array.isArray(verdict.elementFindings) ? verdict.elementFindings : [],
      sourceDocuments: sourceDocuments(cited),
      searchQueries: retrieval.issuedQueries.slice(qStart),
      elementSweepRan: run.elementSweepRan, elementSweepTriggers: run.elementSweepTriggers,
      stability,
      consistencyWarnings: [],
    };
  }

  // Resume, never reconstruct (ruled at ref-board-002): incremental rich persistence means
  // any entry absent from the rich log is re-JUDGED, not rebuilt from a stored verdict — every
  // verdict in the store is a live judge call with full rationale + element_findings.
  let judged = 0, skipped = 0;
  const ordered = entries; // schema order (GTM-01 canary retired at GTM v2)
  for (const entry of ordered) {
    if (richDone.has(entry.id)) { skipped++; continue; }
    const rec = await fullJudge(entry);
    judged++;
    appendFileSync(RICH_JSONL, JSON.stringify(rec) + "\n", "utf8"); // incremental persist
    richDone.set(entry.id, rec);
    console.log(`  JUDGE ${entry.id.padEnd(10)} -> ${rec.state.padEnd(15)} (ev ${rec.citedChunks.length}, el ${rec.elementFindings.length}${rec.emptyRetrieval ? ", EMPTY" : ""}${rec.sweepEscalatedFlip ? ", SWEEP-FLIP" : ""})`);
  }

  if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();

  // Assemble the final rich.json (schema order) from the incremental log.
  const orderIndex = new Map(entries.map((e, i) => [e.id, i]));
  const records = [...richDone.values()].sort((a, b) => (orderIndex.get(a.id)! - orderIndex.get(b.id)!));

  // B5: cross-tile consistency (report-level; NEVER changes a verdict). Flag any tile
  // whose missing/absent elements name an artifact class whose documents were cited by
  // ANOTHER tile in the same run — the P5 "the run refutes itself one tile away" signal.
  // Match on slug/title tokens: a missing-element noun overlapping another tile's cited
  // source-document title/slug tokens.
  const tokenize = (s: string) => new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 3));
  const citedDocTokensByTile = new Map<string, { id: string; tokens: Set<string>; docs: string[] }[]>();
  const allCitedDocs: { tile: string; title: string; slug: string | null; tokens: Set<string> }[] = [];
  for (const r of records) for (const d of r.sourceDocuments) allCitedDocs.push({ tile: r.id, title: d.title, slug: d.slug, tokens: tokenize(`${d.title} ${d.slug ?? ""}`) });
  const consistencyWarnings: { tile: string; message: string }[] = [];
  for (const r of records) {
    const gaps = [...r.missingElements, ...r.elementFindings.filter((e) => e.state === "absent").map((e) => e.element)];
    for (const gap of gaps) {
      const gapTokens = tokenize(gap);
      for (const doc of allCitedDocs) {
        if (doc.tile === r.id) continue;
        const overlap = [...gapTokens].filter((t) => doc.tokens.has(t));
        if (overlap.length >= 2) {
          const msg = `"${oneLine(gap, 80)}" — but ${doc.tile} cites document "${oneLine(doc.title || doc.slug || "?", 60)}" (overlap: ${overlap.slice(0, 4).join(", ")})`;
          r.consistencyWarnings.push(msg);
          consistencyWarnings.push({ tile: r.id, message: msg });
          break;
        }
      }
    }
  }

  // B6 aggregate + B7 run-level source coverage (rendered as a board legend; the
  // recordings-not-transcribed entry is disclosed here rather than mutating the live
  // store's ingest log unattended — see report).
  const stabilityChecked = records.filter((r) => r.stability.checked);
  const stabilityUnstable = stabilityChecked.filter((r) => r.stability.result === "unstable");
  const sourceCoverage = [
    { source: "documents", status: "INGESTED" },
    { source: "code repository", status: "NOT INGESTED" },
    { source: "call recordings", status: "PRESENT AS VIDEO, NOT TRANSCRIBED, NOT INGESTED" },
    { source: "community channels", status: "NOT INGESTED" },
  ];

  const stateDist: Record<string, number> = {};
  for (const r of records) stateDist[r.state] = (stateDist[r.state] ?? 0) + 1;
  const stats = {
    runId: RUN_ID, model: cfg.model, generatedAt: new Date().toISOString(), total: records.length,
    stateDistribution: stateDist,
    sourceCoverage, // B7
    tokens: { input: judge.cumUsage.input, output: judge.cumUsage.output, judgeCallsThisInvocation: judge.cumUsage.calls },
    resume: { judgedThisInvocation: judged, reconstructed: 0, skipped },
    stability: { checked: stabilityChecked.length, confirmed: stabilityChecked.length - stabilityUnstable.length, unstable: stabilityUnstable.map((r) => r.id) }, // B6
    anomalies: {
      emptyRetrievals: records.filter((r) => r.emptyRetrieval).map((r) => r.id),
      sweepEscalationFlips: records.filter((r) => r.sweepEscalatedFlip).map((r) => r.id),
      elementSweeps: records.filter((r) => r.elementSweepRan).map((r) => r.id), // B4
      consistencyWarnings, // B5
      judgeRetries: 0,
    },
  };
  writeFileSync(RICH_JSON, JSON.stringify({ stats, records }, null, 2) + "\n", "utf8");

  console.log(`\n================ RUN STATS ================`);
  console.log("state distribution:", JSON.stringify(stateDist));
  console.log(`this invocation: judged=${judged} skipped(resumed)=${skipped}; judge tokens in=${stats.tokens.input} out=${stats.tokens.output}`);
  console.log(`stability: checked=${stats.stability.checked} confirmed=${stats.stability.confirmed} unstable=${stats.stability.unstable.join(", ") || "none"}`);
  console.log("element sweeps:", stats.anomalies.elementSweeps.join(", ") || "none");
  console.log("consistency warnings:", consistencyWarnings.length);
  console.log(`records=${records.length} -> ${RICH_JSON}`);
}

main().catch((err) => { console.error("run-board: FAILED —", err); process.exit(1); });
