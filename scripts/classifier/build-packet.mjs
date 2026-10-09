// build-packet.mjs — render the operator review packet for a board run.
//
// Reads runs/<RUN_ID>.rich.json (written by run-board.ts) and emits
// reference-model/REF-BOARD-001.md: category-grouped verdict tables +
// absence annex + not-ingested annex + run stats. Built for a reviewer who
// holds ground truth in memory — not a demo. No verdict is altered here; this
// is pure rendering of the raw first-contact record.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..", "..");
const RUN_ID = process.argv[2] || "ref-board-001";
const RICH = join(HERE, "runs", `${RUN_ID}.rich.json`);
const OUT = join(REPO, "reference-model", `${RUN_ID.toUpperCase()}.md`);

const CAT_ORDER = ["GTM", "PRODUCT", "OPS", "PEOPLE", "LEGAL", "CAP", "FIN", "VIS", "ENG", "AIOPS", "COMP"];
const CAT_NAMES = {
  GTM: "Go-To-Market", PRODUCT: "Product", OPS: "Operations", PEOPLE: "People",
  LEGAL: "Legal", CAP: "Capital", FIN: "Finance", VIS: "Vision", ENG: "Engineering",
  AIOPS: "AI Operations", COMP: "Compliance",
};

const { stats, records } = JSON.parse(readFileSync(RICH, "utf8"));
const md = [];
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ").trim();

md.push(`# REFERENCE BOARD 001 — first full board run (operator review packet)`);
md.push("");
md.push(`Run \`${stats.runId}\` · model \`${stats.model}\` · ${stats.generatedAt} · ${stats.total} subcategories against the live reference corpus.`);
md.push("");
md.push(`**This is the raw first-contact record. No verdict was adjusted, rerun, or suppressed.** Built for a reviewer who holds ground truth in memory: each cited chunk carries a one-line gist + its source document (title / slug) so a verdict can be judged without opening the corpus. The verdicts most exposed to corpus-vs-world divergence — genuine-absence and not-ingested — are broken out in annexes B and C for the hardest look.`);
md.push("");
md.push(`> **Provenance note.** The initial run judged 68/73 entries, then crashed on a packet-builder bug (a non-array \`evidenceChunkIds\`; now fixed + guarded). Rather than re-judge all 73 (doubling the metered cost beyond the enumerated envelope), the run was resumed: the 5 unjudged entries (AIOPS-04, AIOPS-05, COMP-01/02/03) were judged fresh, and the 68 stored verdicts were kept AS-IS — their evidence gists re-fetched retrieval-only. Every verdict here is the model's, unedited. Entries whose gists were re-fetched are annotated where a cited chunk did not resurface.`);
md.push("");

// ---- run stats up top (the reviewer wants the shape before the detail) ----
md.push(`## Run stats`);
md.push("");
md.push(`State distribution:`);
md.push("");
md.push(`| State | Count |`);
md.push(`|---|---|`);
for (const [s, n] of Object.entries(stats.stateDistribution).sort((a, b) => b[1] - a[1])) md.push(`| ${s} | ${n} |`);
md.push("");
const resumeJudged = stats.resume?.judgedThisInvocation ?? "?";
const resumeRecon = stats.resume?.reconstructed ?? 0;
md.push(`- **Cost**: 73 verdicts total. The initial run judged 68 (opus-4-8) before crashing on a packet-builder bug; its per-call usage was in-memory and lost, but the canary measured ~19k input tok/call ⇒ ≈ $6.5–7 for those 68. This resume invocation judged the remaining ${resumeJudged} (${stats.tokens.input.toLocaleString()} in / ${stats.tokens.output.toLocaleString()} out tok ≈ $${((stats.tokens.input / 1e6) * 5 + (stats.tokens.output / 1e6) * 25).toFixed(2)}) and RECONSTRUCTED the other ${resumeRecon} retrieval-only (verdicts unchanged, evidence gists re-fetched). Total judge cost ≈ operator's measured ~$7.60.`);
const emptyLive = records.filter((r) => r.emptyRetrieval && !r.reconstructed).map((r) => r.id);
const emptyRecon = records.filter((r) => r.emptyRetrieval && r.reconstructed).map((r) => r.id);
md.push(`- **Empty retrievals at judge time** (search returned 0 chunks — verdict rests on absence logic): ${emptyLive.length ? emptyLive.join(", ") : "none"}.`);
if (emptyRecon.length) md.push(`  - (Reconstruction-search artifact, NOT a judge-time empty: ${emptyRecon.join(", ")} — the original run retrieved evidence for these; the post-crash reconstruction re-search returned 0, so some cited gists are re-fetched or annotated. Verdict is authoritative from the original run.)`);
md.push(`- **Sweep-escalation flips** (exhaustion sweep surfaced chunks that changed an absence verdict): ${stats.anomalies.sweepEscalationFlips.length ? stats.anomalies.sweepEscalationFlips.join(", ") : "none"}.`);
md.push(`- **Judge retries**: ${stats.anomalies.judgeRetries} (the judge has no retry path — a malformed tool_use throws loudly and aborts the run).`);
md.push("");

// ---- A. category-grouped verdict tables + cited-evidence detail ----
md.push(`## A. Verdicts by category`);
md.push("");
const byCat = {};
for (const r of records) (byCat[r.category] ??= []).push(r);
for (const cat of CAT_ORDER) {
  const rs = (byCat[cat] || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  if (!rs.length) continue;
  md.push(`### ${CAT_NAMES[cat] || cat} (${cat}) — ${rs.length}`);
  md.push("");
  md.push(`| ID | Name | State | #Ev | Condition-applied (verbatim) |`);
  md.push(`|---|---|---|---|---|`);
  for (const r of rs) md.push(`| ${r.id} | ${esc(r.name)} | **${r.state}** | ${r.citedChunks.length} | ${esc(r.conditionApplied ?? "—")} |`);
  md.push("");
  // cited-evidence detail for every subcategory that cited anything
  const withEv = rs.filter((r) => r.citedChunks.length);
  if (withEv.length) {
    md.push(`<details><summary>Cited evidence — ${cat}</summary>`);
    md.push("");
    for (const r of withEv) {
      md.push(`- **${r.id}** (${r.state}):`);
      for (const c of r.citedChunks) {
        const src = c.title ? `${esc(c.title)} / slug ${c.slug ?? "?"}` : `slug ${c.slug ?? "?"}`;
        const sc = c.score != null ? ` · score ${c.score.toFixed(3)}` : "";
        md.push(`  - \`${c.id}\` [${src}${sc}] — ${esc(c.gist)}`);
      }
    }
    md.push("");
    md.push(`</details>`);
    md.push("");
  }
}

// ---- B. absence annex ----
const absences = records.filter((r) => /absence/.test(r.state));
md.push(`## B. Absence annex — genuine-absence verdicts (${absences.length})`);
md.push("");
md.push(`Each ran the exhaustion sweep before the absence stood (fidelity §6). "Clean sweep" = the recall pass surfaced nothing the search missed; the ingest-log basis is why this is a company finding, not a corpus gap (B-13).`);
md.push("");
if (!absences.length) md.push(`_None._`);
else {
  md.push(`| ID | Name | Sweep | New chunks | Ingest-log basis (verbatim note) |`);
  md.push(`|---|---|---|---|---|`);
  for (const r of absences.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))) {
    md.push(`| ${r.id} | ${esc(r.name)} | ${r.sweepRan ? "ran" : "NOT RUN"} | ${r.sweepNewCount} | ${esc(r.absenceNote ?? "—")} |`);
  }
}
md.push("");

// ---- C. not-ingested annex ----
const ni = records.filter((r) => /not.?ingest/.test(r.state));
md.push(`## C. Not-ingested annex (${ni.length})`);
md.push("");
md.push(`Corpus findings, never scored against the company (B-13). Each carries its ingest-log basis.`);
md.push("");
if (!ni.length) md.push(`_None._`);
else {
  md.push(`| ID | Name | Ingest-log basis (verbatim condition) |`);
  md.push(`|---|---|---|`);
  for (const r of ni.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))) {
    md.push(`| ${r.id} | ${esc(r.name)} | ${esc(r.conditionApplied ?? r.absenceNote ?? "—")} |`);
  }
}
md.push("");

writeFileSync(OUT, md.join("\n") + "\n", "utf8");
console.log(`packet -> ${OUT} (${records.length} records, ${absences.length} absence, ${ni.length} not-ingested)`);
