import { appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { JudgeResult, ResultRecord } from "./types.ts";

/**
 * Append-only results store (fidelity §7: "the board is a fast view over stored
 * results" — evaluation is a background batch job writing here; the board never
 * calls the judge). One JSON object per line so the store is append-safe and
 * trivially diffable. Lives under runs/ (gitignored — see .gitignore).
 */

const HERE = dirname(fileURLToPath(import.meta.url));
const RUNS_DIR = `${HERE}/runs`;
const RESULTS_PATH = `${RUNS_DIR}/results.jsonl`;

export function newRunId(): string {
  return `run-${new Date().toISOString().replace(/[:.]/g, "-")}`;
}

/** Append one immutable record. Returns the record as written.
 *
 * Store-side enum validation (validation finding P2, 2026-07-10): the writer is
 * the last line before an immutable record lands, so it re-checks state against
 * the entry's ruled enum independently of the judge. A state outside the enum is
 * a loud failure with NO record written — an invalid verdict never reaches disk. */
export function appendResult(
  verdict: JudgeResult,
  meta: {
    criterionId: string;
    runId: string;
    model: string;
    effort: string | null;
    stateEnum: string[];
  },
): ResultRecord {
  if (!meta.stateEnum.includes(verdict.state)) {
    throw new Error(
      `results: refusing to write ${meta.criterionId} — state "${verdict.state}" is not in the ` +
        `ruled enum [${meta.stateEnum.join(", ")}].`,
    );
  }
  const record: ResultRecord = {
    criterionId: meta.criterionId,
    state: verdict.state,
    conditionApplied: verdict.conditionApplied,
    evidenceChunkIds: verdict.evidenceChunkIds,
    runId: meta.runId,
    model: meta.model,
    effort: meta.effort,
    timestamp: new Date().toISOString(),
    // Output-contract fields (accepted store-side; persisted for lossless reconstruction).
    rationale: verdict.rationale ?? null,
    missingElements: Array.isArray(verdict.missingElements) ? verdict.missingElements : [],
    elementFindings: Array.isArray(verdict.elementFindings) ? verdict.elementFindings : [],
  };
  mkdirSync(RUNS_DIR, { recursive: true });
  appendFileSync(RESULTS_PATH, JSON.stringify(record) + "\n", "utf8");
  return record;
}

export { RESULTS_PATH };
