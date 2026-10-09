import type { RetrievalClient, OriginScope } from "./retrieval.ts";
import type { Judge } from "./judge.ts";
import type { Chunk, CriterionEntry, JudgeResult } from "./types.ts";
import { refineAbsence, type IngestLog } from "./ingest-log.ts";

/**
 * Exhaustion backstop (fidelity §6, Amendment 4). An absence verdict is more
 * expensive than a presence verdict: before an absence stands, run a full-text
 * sweep over the corpus using the entry's NON-NORMATIVE signals — the one
 * legitimate diagnostic use of signals, a recall backstop against the
 * ingested-but-not-retrieved hole (the sole unbounded false-red path).
 *
 * HARD GUARDRAIL (§6): the sweep escalates candidates to the JUDGMENT step only;
 * it never renders presence itself. So: normal search → judge. If the judge
 * returns an absence state AND the sweep surfaces chunks the search pass missed,
 * re-judge with the enlarged evidence set. The judge — never the sweep — renders
 * the final state. If the sweep finds nothing new, the absence stands.
 */

/** Absence trigger: a state that reads as "absent". Matches "absent" and ruled
 *  variants like "genuine-absence-with-clean-log" (B-13), but NOT "not-ingested"
 *  (a parse-state finding the sweep must not overturn — Sprint Ma Task 3). */
export function isAbsenceState(state: string): boolean {
  const s = state.toLowerCase();
  return s.includes("absent") || s.includes("absence");
}

export interface RunResult {
  verdict: JudgeResult;
  searchEvidence: Chunk[];
  sweptEvidence: Chunk[]; // extra chunks the sweep surfaced (empty if no sweep or none new)
  sweepRan: boolean;
  /** B4: an element-grain sweep ran because ≥1 element finding was absent (even when the
   *  entry rollup was not itself an absence — the P3 element-grain-bypass hole). */
  elementSweepRan: boolean;
  /** Element labels whose `absent` finding triggered the element sweep. */
  elementSweepTriggers: string[];
  /** How the ingest-log step resolved an absence (B-13), or null if no absence. */
  absenceNote: string | null;
}

/** Content words from an absent element's label, for the element-grain sweep query (B4). */
function elementNounPhrases(labels: string[]): string[] {
  const stop = new Set(["a","an","the","of","and","or","for","to","in","on","with","is","are","exists","per","at","by","that","this","its","their","where","any","some"]);
  const words = labels.join(" ").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/);
  return [...new Set(words.filter((w) => w.length > 3 && !stop.has(w)))];
}

export async function runWithExhaustion(
  entry: CriterionEntry,
  retrieval: RetrievalClient,
  judge: Judge,
  log: IngestLog,
  searchK = 20,
  originScope: OriginScope = "all", // clean-board gate: 'native' excludes Ladder-generated evidence
): Promise<RunResult> {
  const searchEvidence = await retrieval.search(entry.signals, searchK, originScope);
  const first = await judge.judge(entry, searchEvidence);

  // Element-grain sweep (B4): an absent element finding bypasses the entry-level
  // sweep, which only fires on an entry-level absence (the P3 hole). When the entry
  // is NOT an absence but ≥1 element is absent, run one recall sweep over the entry's
  // signals PLUS the absent elements' noun phrases, and escalate anything new to the
  // judge — same escalate-only guardrail: the sweep never renders presence.
  if (!isAbsenceState(first.state)) {
    const absentEls = (first.elementFindings ?? [])
      .filter((f) => f.state === "absent")
      .map((f) => f.element);
    if (absentEls.length === 0) {
      return { verdict: first, searchEvidence, sweptEvidence: [], sweepRan: false, elementSweepRan: false, elementSweepTriggers: [], absenceNote: null };
    }
    const elSwept = await retrieval.sweep([...entry.signals, ...elementNounPhrases(absentEls)], originScope);
    const seenE = new Set(searchEvidence.map((c) => c.id));
    const newE = elSwept.filter((c) => !seenE.has(c.id));
    let verdict = first;
    let sweptEvidence: Chunk[] = [];
    if (newE.length > 0) {
      verdict = await judge.judge(entry, [...searchEvidence, ...newE]); // escalate; judge renders
      sweptEvidence = newE;
    }
    // If the re-judge flipped the entry into an absence, fall through to the ingest-log
    // refinement so B-13 still applies at entry scope.
    if (isAbsenceState(verdict.state)) {
      const refined = refineAbsence(entry, verdict, log);
      return { verdict: refined.verdict, searchEvidence, sweptEvidence, sweepRan: true, elementSweepRan: true, elementSweepTriggers: absentEls, absenceNote: refined.note };
    }
    return { verdict, searchEvidence, sweptEvidence, sweepRan: false, elementSweepRan: true, elementSweepTriggers: absentEls, absenceNote: null };
  }

  // Absence claimed — run the recall backstop before letting it stand.
  const swept = await retrieval.sweep(entry.signals, originScope);
  const seen = new Set(searchEvidence.map((c) => c.id));
  const newChunks = swept.filter((c) => !seen.has(c.id));

  let absenceVerdict = first;
  let sweptEvidence: Chunk[] = [];
  if (newChunks.length > 0) {
    // Escalate the new candidates to the judge — never render presence from the sweep.
    const second = await judge.judge(entry, [...searchEvidence, ...newChunks]);
    if (!isAbsenceState(second.state)) {
      return {
        verdict: second,
        searchEvidence,
        sweptEvidence: newChunks,
        sweepRan: true,
        elementSweepRan: false,
        elementSweepTriggers: [],
        absenceNote: null,
      };
    }
    absenceVerdict = second;
    sweptEvidence = newChunks;
  }

  // Absence stands after the sweep. B-13: consult the ingest log — a relevant
  // skip/fail/exclusion makes this not-ingested, not genuine-absence.
  const refined = refineAbsence(entry, absenceVerdict, log);
  return {
    verdict: refined.verdict,
    searchEvidence,
    sweptEvidence,
    sweepRan: true,
    elementSweepRan: false,
    elementSweepTriggers: [],
    absenceNote: refined.note,
  };
}
