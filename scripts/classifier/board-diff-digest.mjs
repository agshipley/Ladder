// board-diff-digest.mjs — PART 3 analysis for a board rerun.
//   node board-diff-digest.mjs <run-002.rich.json> <run-001.rich.json>
// Prints: (1) state-by-state distribution diff, (2) changed-verdict table with both
// conditions verbatim, (3) a "not captured" audit for the new run. Writes the element
// digest markdown (FIN-01, GTM-03, GTM-04 + every 4+-element subcategory) to
// <run>-element-digest.md next to the 002 file.

import { readFileSync, writeFileSync } from "node:fs";

const [, , p2, p1] = process.argv;
const R2 = JSON.parse(readFileSync(p2, "utf8"));
const R1 = JSON.parse(readFileSync(p1, "utf8"));
const by = (d) => Object.fromEntries(d.records.map((r) => [r.id, r]));
const m1 = by(R1), m2 = by(R2);
const ids = [...new Set([...Object.keys(m1), ...Object.keys(m2)])].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

// (1) distribution diff
const dist = (d) => { const o = {}; for (const r of d.records) o[r.state] = (o[r.state] ?? 0) + 1; return o; };
const d1 = dist(R1), d2 = dist(R2);
const states = [...new Set([...Object.keys(d1), ...Object.keys(d2)])].sort();
console.log("=== STATE DISTRIBUTION: 001 -> 002 ===");
for (const s of states) console.log(`  ${s.padEnd(16)} ${String(d1[s] ?? 0).padStart(3)} -> ${String(d2[s] ?? 0).padStart(3)}  (${((d2[s] ?? 0) - (d1[s] ?? 0) >= 0 ? "+" : "") + ((d2[s] ?? 0) - (d1[s] ?? 0))})`);

// (2) changed verdicts
const changed = ids.filter((id) => m1[id] && m2[id] && m1[id].state !== m2[id].state);
console.log(`\n=== CHANGED VERDICTS (${changed.length}/${ids.length}) ===`);
for (const id of changed) {
  console.log(`\n${id}: ${m1[id].state}  ->  ${m2[id].state}`);
  console.log(`   001 condition: ${m1[id].conditionApplied ?? "—"}`);
  console.log(`   002 condition: ${m2[id].conditionApplied ?? "—"}`);
}

// (3) not-captured audit for 002
const notCap = R2.records.filter((r) => (r.state === "thin" || /absence/.test(r.state)) && !(Array.isArray(r.elementFindings) && r.elementFindings.length) && !(r.rationale && r.rationale.trim()));
console.log(`\n=== 002 "not captured" (thin/absence with neither rationale nor element_findings): ${notCap.length} ===`);
if (notCap.length) console.log("  " + notCap.map((r) => r.id).join(", "));

// element digest
const targets = new Set(["FIN-01", "GTM-03", "GTM-04"]);
for (const r of R2.records) if (Array.isArray(r.elementFindings) && r.elementFindings.length >= 4) targets.add(r.id);
const ordered = [...targets].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
const sym = { satisfied: "✅", thin: "🟠", absent: "🔴" };
let md = `## Element-grain digest — ref-board-002 (2026-07-13)\n\n`;
md += `First run under the element-grain output contract. Per-element states below are the judge's element_findings (echoed labels), the decomposition-backlog evidence: a subcategory that repeatedly splits into a satisfied cluster and an unevidenced cluster is a split candidate. DB-1 = FIN-01; DB-2 = GTM-03/04.\n\n`;
for (const id of ordered) {
  const r = R2.records.find((x) => x.id === id);
  const tag = id === "FIN-01" ? " *(DB-1)*" : (id === "GTM-03" || id === "GTM-04") ? " *(DB-2)*" : "";
  md += `### ${id}${tag} — rollup **${r.state}** (${r.elementFindings.length} elements)\n\n`;
  md += `| element | state |\n|---|---|\n`;
  for (const f of r.elementFindings) md += `| ${String(f.element).replace(/\|/g, "\\|")} | ${sym[f.state] || ""} ${f.state} |\n`;
  md += `\n`;
}
const digestPath = p2.replace(/\.rich\.json$/, "-element-digest.md");
writeFileSync(digestPath, md, "utf8");
console.log(`\nelement digest (${ordered.length} subcategories) -> ${digestPath}`);
