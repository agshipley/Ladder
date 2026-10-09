// build-review-html.mjs — render the board run of record to ONE self-contained HTML
// file (runs-of-record/<run>-review.html): the operator review view, printable and
// sendable, no dev server. Reads the committed rich.json + display-names.ts. Pure
// rendering — no verdict is altered.

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deriveMissing } from "./missing.mjs";
import { groupByDoc, buildDocIndex, resolveTitles } from "./docs.mjs";
import { elementLabel } from "./element-labels.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, "..");
const ROR = join(REPO, "runs-of-record");
const NAMES_TS = join(HERE, "display-names.ts");

const CAT_ORDER = ["GTM", "PRODUCT", "OPS", "PEOPLE", "LEGAL", "CAP", "FIN", "VIS", "ENG", "AIOPS", "COMP"];
const CAT_NAMES = { GTM: "Go-To-Market", PRODUCT: "Product", OPS: "Operations", PEOPLE: "People", LEGAL: "Legal", CAP: "Capital", FIN: "Finance", VIS: "Vision", ENG: "Engineering", AIOPS: "AI Operations", COMP: "Compliance" };
const STATE_HEX = { "evidence-found": "#1a7f4b", thin: "#d98a04", "genuine-absence": "#c0392b", "not-ingested": "#8a9099", "documented-n-a": "#6b7280", placeholder: "#6b7280", informational: "#2563eb", "loop-ready": "#7c3aed" };
const STATE_LABEL = { "evidence-found": "evidence found", "genuine-absence": "genuine absence", "not-ingested": "possibly present, not found", "documented-n-a": "n/a by condition" };

// --- load display names by regex (robust to trailing commas / TS syntax) ---
const namesSrc = readFileSync(NAMES_TS, "utf8");
const DISPLAY = {};
for (const m of namesSrc.matchAll(/"([A-Z]+-\d+)":\s*"((?:[^"\\]|\\.)*)"/g)) DISPLAY[m[1]] = m[2].replace(/\\"/g, '"');

// --- load run of record ---
const richFile = existsSync(ROR) ? readdirSync(ROR).filter((f) => f.endsWith(".rich.json")).sort().pop() : null;
if (!richFile) { console.error("no runs-of-record/*.rich.json"); process.exit(1); }
const { stats, records } = JSON.parse(readFileSync(join(ROR, richFile), "utf8"));
resolveTitles(records); // no bare slugs in the export either
const OUT = join(ROR, richFile.replace(/\.rich\.json$/, "-review.html"));

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const stripMd = (s) => String(s ?? "").replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/^\s*[-*]\s+/gm, "").replace(/\s+/g, " ").trim();
const label = (st) => STATE_LABEL[st] ?? st;
const pill = (st) => `<span class="pill" style="background:${STATE_HEX[st] ?? "#6b7280"}">${esc(label(st))}</span>`;

const byCat = {};
for (const r of records) (byCat[r.category] ??= []).push(r);

const dist = Object.entries(stats.stateDistribution).sort((a, b) => b[1] - a[1]);
let body = "";
body += `<header><h1>Maturity Board — Review</h1>`;
body += `<p class="meta">Run <b>${esc(stats.runId)}</b> · ${esc(stats.model)} · ${esc(new Date(stats.generatedAt).toLocaleString())} · ${stats.total} subcategories against the live reference corpus. Verdicts raw and unedited.</p>`;
body += `<p class="dist">` + dist.map(([s, n]) => `<span class="di"><i style="background:${STATE_HEX[s] ?? "#6b7280"}"></i>${esc(label(s))} <b>${n}</b></span>`).join("") + `</p></header>`;

for (const cat of CAT_ORDER) {
  const rs = (byCat[cat] || []).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  if (!rs.length) continue;
  body += `<section><h2>${esc(CAT_NAMES[cat] || cat)} <span class="ck">${cat}</span></h2>`;
  for (const r of rs) {
    const isAbs = /absence/.test(r.state);
    body += `<div class="entry"><div class="ehead"><span class="ename">${esc(DISPLAY[r.id] ?? r.id)}</span><span class="eid">${esc(r.id)}</span>${pill(r.state)}</div>`;
    if (Array.isArray(r.elementFindings) && r.elementFindings.length) {
      const sym = { satisfied: "✓", thin: "~", absent: "✗" };
      body += `<div class="row"><b>Elements (${r.elementFindings.length}):</b><ul class="ell">` +
        r.elementFindings.map((f) => `<li class="el--${esc(f.state)}"><span class="els">${sym[f.state] || "?"} ${esc(f.state)}</span> <span title="${esc(f.element)}">${esc(elementLabel(f.element))}</span>${f.evidenceChunkIds && f.evidenceChunkIds.length ? ` <span class="muted">[${f.evidenceChunkIds.map(esc).join(", ")}]</span>` : ""}</li>`).join("") +
        `</ul></div>`;
    }
    if (r.conditionApplied) body += `<div class="row"><b>Condition:</b> ${esc(stripMd(r.conditionApplied))}</div>`;
    if (r.rationale) body += `<div class="row"><b>Rationale:</b> ${esc(stripMd(r.rationale))}</div>`;
    if (r.state === "thin" || isAbs) {
      const m = deriveMissing(r);
      body += `<div class="row missing"><b>Expected but not found:</b> ` +
        (m.missing && m.missing.length
          ? `${m.missing.map(esc).join(" · ")} <span class="prov">(${esc(m.provenance)})</span>`
          : `<span class="muted">not captured this run</span>`) + `</div>`;
    }
    if (isAbs) body += `<div class="row"><b>Absence:</b> sweep ${r.sweepRan ? "ran" : "not run"}; ${esc(r.absenceNote ?? "—")}</div>`;
    const docs = groupByDoc(r.citedChunks);
    body += `<div class="row"><b>Evidence — documents (${docs.length}):</b>`;
    if (docs.length) {
      body += `<ul>` + docs.map((d) => `<li><b>${esc(d.label)}</b>${d.slug ? ` <span class="ds">slug ${esc(d.slug)}</span>` : ""}<ul>` +
        d.chunks.map((c) => {
          const g = String(c.gist || "");
          const cell = g.length > 78
            ? `<details><summary>${esc(g.slice(0, 78).replace(/\s\S*$/, ""))}…</summary><div class="evfull">${esc(g)}</div></details>`
            : esc(g);
          return `<li><code>${esc(c.id)}</code> — ${cell}</li>`;
        }).join("") + `</ul></li>`).join("") + `</ul>`;
    } else body += ` <span class="muted">none cited</span>`;
    body += `</div></div>`;
  }
  body += `</section>`;
}

// --- Document index: every source document cited anywhere -> verdicts it supports ---
const docIndex = buildDocIndex(records);
body += `<section class="docindex"><h2>Document index <span class="ck">${docIndex.length} documents</span></h2>`;
body += `<p class="meta">Every source document cited in the run, most-relied-on first, with the verdicts it supports.</p>`;
for (const d of docIndex) {
  body += `<div class="docrow"><div class="drh"><span class="dl">${esc(d.label)}</span>${d.slug ? ` <span class="ds">slug ${esc(d.slug)}</span>` : ""} <span class="dn">${d.verdicts.length} verdict${d.verdicts.length === 1 ? "" : "s"}</span></div><div class="dv">` +
    d.verdicts.map((v) => `<span class="chip" style="border-left:4px solid ${STATE_HEX[v.state] ?? "#6b7280"}" title="${esc(v.state)}">${esc(v.id)}</span>`).join("") +
    `</div></div>`;
}
body += `</section>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maturity Board Review — ${esc(stats.runId)}</title>
<style>
:root{--ink:#1c2128;--soft:#5b636e;--line:#e3e6ea;--bg:#fff}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
.wrap{max-width:860px;margin:0 auto;padding:28px 22px 64px}
header{border-bottom:2px solid var(--line);padding-bottom:14px;margin-bottom:8px}
h1{margin:0 0 4px;font-size:22px}.meta{color:var(--soft);margin:0 0 8px}
.dist{display:flex;flex-wrap:wrap;gap:14px;margin:8px 0 0}.di{display:inline-flex;align-items:center;gap:6px;color:var(--soft);font-size:13px}.di i{width:10px;height:10px;border-radius:50%}.di b{color:var(--ink)}
h2{font-size:17px;border-bottom:1px solid var(--line);padding-bottom:5px;margin:26px 0 6px}.ck{color:var(--soft);font-size:11px;font-weight:600;letter-spacing:.05em}
.entry{padding:12px 0;border-top:1px solid var(--line)}
.ehead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.ename{font-weight:600;font-size:14px}.eid{font-weight:500;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;color:#6b7280;letter-spacing:.02em}
.pill{color:#fff;padding:1px 9px;border-radius:999px;font-size:12px;font-weight:650}
.row{margin-top:5px;font-size:13px}.row>b{color:var(--soft);font-weight:600}
ul{margin:4px 0 0;padding-left:18px}li{margin:2px 0;font-size:12.5px}
code{background:#eef0f3;padding:0 4px;border-radius:4px}.muted{color:var(--soft)}
.row.missing>b{color:#d98a04}.prov{font-size:10px;color:var(--soft)}
.docindex{margin-top:34px;border-top:2px solid var(--line);padding-top:8px}
.docrow{padding:9px 0;border-top:1px solid var(--line)}.drh{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap}
.dl{font-weight:650}.ds{color:var(--soft);font-size:11px}.dn{margin-left:auto;color:var(--soft);font-size:11px}
.dv{margin-top:6px;display:flex;flex-wrap:wrap;gap:5px}
.chip{border:1px solid var(--line);border-radius:5px;padding:1px 7px;font-size:12px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
li>ul{margin:2px 0 4px}
.ell{list-style:none;margin:3px 0 0;padding:0}.ell li{padding:2px 0;border-left:3px solid var(--line);padding-left:8px}
.el--satisfied{border-left-color:#1a7f4b}.el--thin{border-left-color:#d98a04}.el--absent{border-left-color:#c0392b}
.els{font-size:10px;font-weight:650;text-transform:uppercase}.el--satisfied .els{color:#1a7f4b}.el--thin .els{color:#d98a04}.el--absent .els{color:#c0392b}
summary{cursor:pointer}.evfull{margin-top:3px;padding:5px 7px;background:#eef0f3;border-radius:5px;white-space:pre-wrap}
@media (prefers-color-scheme:dark){.evfull{background:#242a32}}
.foot{margin-top:32px;color:var(--soft);font-size:11px;border-top:1px solid var(--line);padding-top:12px}
@media print{.entry{break-inside:avoid}}
@media (prefers-color-scheme:dark){:root{--ink:#e6e9ee;--soft:#99a1ac;--line:#2b313a;--bg:#14171c}code{background:#242a32}}
</style></head><body><div class="wrap">${body}
<div class="foot">Self-contained review export of ${esc(richFile)} · generated ${esc(new Date().toISOString())} · offline, no live corpus fetch.</div>
</div></body></html>`;

writeFileSync(OUT, html, "utf8");
console.log(`review HTML -> ${OUT} (${records.length} verdicts, ${Object.keys(DISPLAY).length} display names)`);
