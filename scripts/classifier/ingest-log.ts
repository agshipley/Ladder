import type { CriterionEntry, JudgeResult } from "./types.ts";

/**
 * Ingest-log consultation — the B-13 three-outcome wiring (validation finding, 2026-07-10).
 *
 * B-13 separates a no-evidence result into three outcomes:
 *   evidence-found     — retrieval + judge attributed it.
 *   genuine-absence    — nothing found, and the ingest log is CLEAN for the area
 *                        (a finding about the COMPANY).
 *   not-ingested       — nothing found, but the ingest log shows the relevant
 *                        source was skipped / failed / excluded (a finding about
 *                        the CORPUS, never scored against the company).
 *
 * Before this wiring, nothing consulted the ingest log, so every no-evidence case
 * collapsed to genuine-absence — a silent false-red risk. This module is the one
 * function-boundary that reads the log and refines an absence verdict.
 *
 * DATA CEILING (honest limitation, recorded): the gbrain ingest log records skip
 * COUNTS in a free-text summary ("Imported 245 pages, 517 skipped, 977 chunks")
 * plus the list of pages that DID ingest — but NOT the identities of skipped items.
 * So per-artifact not-ingested attribution is only possible when a whole SOURCE
 * failed/was excluded and its source_ref carries a criterion signal term. Full
 * per-artifact attribution needs the ingestion pipeline to log skipped-item ids
 * (a punch-list item on the ingestion side). Until then not-ingested covers
 * source-level skip/fail/exclusion; finer skips fall through to genuine-absence,
 * which is the truthful verdict given what the log actually says.
 */

export interface IngestLogEntry {
  id: number;
  source_id: string;
  source_type: string;
  source_ref: string;
  pages_updated: string[];
  summary: string;
  created_at?: string;
}

export interface IngestLog {
  /** False when no machine-readable log could be read at all. */
  available: boolean;
  entries: IngestLogEntry[];
}

/**
 * Run-start guard. A real run that could emit an absence verdict MUST have a
 * readable ingest log, or its genuine-absence verdicts would be untruthful.
 * Fails loudly rather than guessing — no "indeterminate" state is invented.
 */
export function assertIngestLogUsable(log: IngestLog): void {
  if (!log.available) {
    throw new Error(
      "no ingest log available; genuine-absence verdicts would be untruthful. Refusing to " +
        "run (B-13 three-outcome requires a readable ingest log).",
    );
  }
}

/** A log entry indicating material did NOT enter the corpus: a total-failure
 *  import (0 pages ingested) or an explicit exclusion/hold/quarantine. A normal
 *  partial skip on an otherwise-successful import is NOT this — those skips lack
 *  item identities and cannot be attributed to a criterion (see DATA CEILING). */
export function isNonIngestingEntry(e: IngestLogEntry): boolean {
  const s = `${e.source_type} ${e.summary}`.toLowerCase();
  if (/exclud|exclusion|litigation|legal.?hold|quarantine/.test(s)) return true;
  if (Array.isArray(e.pages_updated) && e.pages_updated.length === 0) return true;
  return false;
}

/** A B-11 POLICY exclusion (deliberate exclusion-class / litigation-hold), as opposed
 *  to a skip/fail import. Per R1(iii) + the state vocabulary these route differently:
 *  a policy exclusion renders PLACEHOLDER; a skip/fail renders not-ingested. */
export function isExclusionEntry(e: IngestLogEntry): boolean {
  const s = `${e.source_type} ${e.summary}`.toLowerCase();
  return /exclud|exclusion|litigation|legal.?hold|quarantine/.test(s);
}

/**
 * POSTED-WEB-EVIDENCE class (07/18 review, item v — LEGAL-09 false red). A fourth B-13
 * outcome path that needs no ingest-log entry: a criterion whose FLOOR evidence is a
 * PUBLICLY-POSTED artifact — a privacy policy or terms of service posted on the company's
 * live website. That artifact's home is the public web, and the public web is NOT an
 * ingested source (there is no crawler). So corpus silence about it is a VISIBILITY gap,
 * never a company finding: the judge/board may not render genuine-absence from that silence.
 *
 * This is the diagnostic-honesty analogue of the ingest-log skip/fail path: same three-way
 * discipline (a corpus finding, never scored against the company), but keyed on the criterion
 * CLASS rather than a log entry, because a non-ingested public-web home produces no log row.
 *
 * The set is ID-keyed (operator-legible, editable) and CONSERVATIVE — a false not-ingested is
 * as trust-damaging as a false red. It is the 07/18-grep candidate set PENDING OPERATOR
 * CONFIRMATION. LEGAL-10 was a near-match in the grep but is DELIBERATELY EXCLUDED: its
 * evidence home is internal posture/records (an accessibility audit or a dated decision record,
 * CAN-SPAM footer mechanics), not a posted web artifact to be read off the public web.
 */
export const POSTED_WEB_EVIDENCE = new Set<string>([
  "LEGAL-09", // posted, conspicuous privacy policy + posted terms of service (public website)
]);

/** Whether a subcategory's floor evidence is a publicly-posted web artifact (see the set). */
export function isPostedWebEvidence(id: string): boolean {
  return POSTED_WEB_EVIDENCE.has(id);
}

/** The reason string a posted-web absence renders with (single source of truth). */
export const POSTED_WEB_REASON = "public website is not an ingested source — verify manually";

/** Proxy relevance available today: a criterion signal head-term appears in a
 *  failed/excluded source_ref. Deliberately conservative — a false not-ingested
 *  is as trust-damaging as a false red. */
export function relevantToCriterion(e: IngestLogEntry, signals: string[]): boolean {
  const ref = e.source_ref.toLowerCase();
  return signals.some((sig) => {
    const head = sig.toLowerCase().split(/\s+/)[0];
    return head.length >= 4 && ref.includes(head);
  });
}

export interface AbsenceRefinement {
  verdict: JudgeResult;
  note: string;
}

/**
 * Refine an absence verdict against the ingest log. If a non-ingesting entry is
 * relevant to this criterion AND the entry's enum admits a not-ingested state,
 * render not-ingested with the log entry recorded as the evidence field.
 * Otherwise the judge's genuine-absence verdict stands (log clean for this area).
 */
export function refineAbsence(
  entry: CriterionEntry,
  verdict: JudgeResult,
  log: IngestLog,
): AbsenceRefinement {
  const notIngestedState = entry.stateEnum.find((s) => /not.?ingest/i.test(s));
  const placeholderState = entry.stateEnum.find((s) => /placeholder/i.test(s));
  if (!notIngestedState && !placeholderState) {
    return { verdict, note: "enum has neither not-ingested nor placeholder; absence kept" };
  }
  const hit = log.entries.find(
    (e) => isNonIngestingEntry(e) && relevantToCriterion(e, entry.signals),
  );
  if (!hit) {
    // POSTED-WEB-EVIDENCE class (07/18 review): no ingest-log row exists because the evidence
    // home (the public web) is not an ingested source. Corpus silence about a posted policy/ToS
    // is a visibility gap, not a company finding — render not-ingested, never genuine-absence.
    if (isPostedWebEvidence(entry.id) && notIngestedState) {
      return {
        verdict: {
          state: notIngestedState,
          conditionApplied: `not-ingested: ${POSTED_WEB_REASON}`,
          evidenceChunkIds: [],
          rationale:
            `No corpus evidence found for a publicly-posted artifact (posted privacy policy / ` +
            `terms of service). Its evidence home is the company's live website, which is not an ` +
            `ingested source — there is no web crawler. Per B-13 this is not-ingested (a corpus/` +
            `visibility finding), not genuine absence: ${POSTED_WEB_REASON}.`,
          missingElements: [],
          elementFindings: [],
        },
        note: `refined to ${notIngestedState} via posted-web-evidence class (no ingested web source)`,
      };
    }
    return { verdict, note: "ingest log clean for this criterion; genuine-absence stands" };
  }
  // R1(iii): a B-11 POLICY exclusion renders placeholder; a skip/fail renders not-ingested.
  const exclusion = isExclusionEntry(hit);
  const target = exclusion ? (placeholderState ?? notIngestedState) : (notIngestedState ?? placeholderState);
  if (!target) {
    return { verdict, note: `ingest-log #${hit.id} relevant but enum admits neither refined state; absence kept` };
  }
  const isPlaceholder = target === placeholderState;
  return {
    verdict: {
      state: target,
      conditionApplied: isPlaceholder
        ? `placeholder: B-11 exclusion-class source "${hit.source_ref}" (ingest-log #${hit.id})`
        : `not-ingested: source "${hit.source_ref}" (ingest-log #${hit.id})`,
      evidenceChunkIds: [`ingest-log#${hit.id}`],
      rationale: isPlaceholder
        ? `No corpus evidence found; ingest log #${hit.id} shows source "${hit.source_ref}" is a ` +
          `deliberate B-11 policy exclusion (${hit.summary}) — maintained outside the corpus by policy. ` +
          `Renders placeholder, never absent, never green.`
        : `No corpus evidence found, and ingest log #${hit.id} shows source ` +
          `"${hit.source_ref}" did not ingest (${hit.summary}). Per B-13 this is not-ingested ` +
          `(a corpus finding), not genuine absence.`,
      missingElements: [],
      elementFindings: [],
    },
    note: `refined to ${target} via ingest-log #${hit.id}`,
  };
}
