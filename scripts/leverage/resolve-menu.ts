import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Leverage menu resolver (deterministic; NO model calls, NO network).
 *
 * Encodes leverage/RESOLVER-MAPPING.md (RULED 2026-07-20) as the source of truth:
 *   - §1 resolution semantics (state table + item-level disposition),
 *   - §2 the prerequisite mapping with R/S tags (subcategory IDs + plain names verbatim),
 *   - §3 the operator-fact gates (facts the board cannot attest).
 * Reads a board run + an intake file, resolves each of the 10 catalog items to exactly one
 * disposition, and renders two surfaces from the SAME resolution data: a markdown menu and the
 * v2 HTML surface (leverage/templates/menu.html).
 *
 * v2 surface adds: evidence chips (met board prereqs + met intake facts), rung closure tags
 * (LADDER CAN DRAFT THIS / YOURS TO CLOSE — classification from leverage/rung-closure.json,
 * explanatory copy verbatim from the approved v2 reference keyed by (item,rung)), a computed
 * "where to start" strip, and per-disposition sublines. WHICH chips/rungs/columns appear and the
 * strip counts are computed from board+intake; the bespoke copy is keyed. Strip selections are
 * VERIFIED against the approved v2 (STOP on mismatch). Operator ruling 2026-07-20 governs the
 * disposition table (unsatisfied non-structural gate → not yet; structural-no → not offered).
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, "..", "..");
const RUN_FILE = join(REPO, "runs-of-record", "ref-board-003.rich.json");
const INTAKE_FILE = join(REPO, "leverage", "intake", "reference.json");
const TEMPLATE_FILE = join(REPO, "leverage", "templates", "menu.html");
const CLOSURE_FILE = join(REPO, "leverage", "rung-closure.json");
const CATALOG_VERSION = "MENU-CATALOG.md v0";
const MAPPING_VERSION = "RESOLVER-MAPPING.md (ruled 2026-07-20)";
const RESOLUTION_NO = "001";

type Tag = "R" | "S";
interface TileRef { id: string; name: string; tag: Tag }
type GateKind = "structural" | "threshold" | "capability";
interface Gate { key: string; kind: GateKind; label: string }
interface Item {
  n: number; name: string; cls: "Enhance" | "Fully automate" | "Net-new";
  tiles: TileRef[]; gates: Gate[]; netNew?: boolean;
  subNote?: (ctx: ItemCtx) => string | null;
}

// ---- §2 mapping (verbatim IDs + plain names) + §3 gates, per catalog item -------------------
const ITEMS: Item[] = [
  { n: 1, name: "Meeting & call capture into the company's knowledge base", cls: "Enhance",
    tiles: [{ id: "GTM-11", name: "CRM/pipeline system-of-record", tag: "R" }], gates: [] },
  { n: 2, name: "Records freshness and enrichment", cls: "Enhance",
    tiles: [
      { id: "OPS-01", name: "ownership map", tag: "R" },
      { id: "GTM-11", name: "CRM", tag: "R" },
      { id: "OPS-05", name: "vendor inventory", tag: "S" },
      { id: "OPS-06", name: "asset inventory", tag: "S" },
    ], gates: [] },
  { n: 3, name: "Drafting from the company's own material", cls: "Enhance",
    tiles: [{ id: "OPS-01", name: "ownership map", tag: "R" }], gates: [] },
  { n: 4, name: "Bill payment and ledger sync", cls: "Fully automate",
    tiles: [
      { id: "FIN-01", name: "accounting system of record", tag: "R" },
      { id: "OPS-07", name: "change/approval practice", tag: "R" },
      { id: "OPS-01", name: "ownership", tag: "S" },
      { id: "OPS-04", name: "process runbook", tag: "S" },
    ],
    gates: [{ key: "spend_approval_chain", kind: "capability", label: "spend approval chain defined" }] },
  { n: 5, name: "Continuous compliance monitoring", cls: "Fully automate",
    tiles: [
      { id: "COMP-01", name: "security-assurance posture", tag: "R" },
      { id: "OPS-06", name: "identity/access management", tag: "R" },
      { id: "ENG-05", name: "reconstructible infrastructure", tag: "S" },
      { id: "OPS-01", name: "owner for findings", tag: "S" },
    ],
    gates: [
      { key: "cloud_infra_and_idp", kind: "capability", label: "cloud infrastructure + identity provider in use" },
      { key: "buyer_security_pressure", kind: "capability", label: "buyer pressure for security attestation" },
    ] },
  { n: 6, name: "Failed-payment recovery", cls: "Fully automate",
    tiles: [],
    gates: [{ key: "recurring_billing", kind: "structural", label: "live recurring billing on a mainstream platform" }] },
  { n: 7, name: "Employee onboarding/offboarding cascade", cls: "Fully automate",
    tiles: [
      { id: "PEOPLE-03", name: "onboarding program", tag: "R" },
      { id: "OPS-04", name: "on/offboarding runbook", tag: "R" },
      { id: "OPS-06", name: "access de-provisioning", tag: "R" },
    ],
    gates: [
      { key: "hris", kind: "capability", label: "HRIS / employee system of record" },
      { key: "hiring_velocity", kind: "threshold", label: "hiring velocity above the workflow-payback threshold" },
    ],
    subNote: (ctx) => {
      const ops06 = ctx.tileStatus.get("OPS-06");
      return ops06 && ops06.status === "met"
        ? `revocation sub-recommendation (gates only on OPS-06 — access de-provisioning, ${ops06.state}): **available now** — recommended at any size per the catalog.`
        : `revocation sub-recommendation gates on OPS-06 (${ops06?.state ?? "not in run"}).`;
    } },
  { n: 8, name: "Inbound lead handling", cls: "Fully automate",
    tiles: [
      { id: "GTM-07", name: "documented ICP", tag: "R" },
      { id: "GTM-11", name: "lead-handling/routing", tag: "R" },
      { id: "GTM-13", name: "documented sales motion", tag: "S" },
    ],
    gates: [{ key: "inbound_lead_volume", kind: "threshold", label: "inbound lead volume enough to matter" }] },
  { n: 9, name: "Customer-health scoring with triggered playbooks", cls: "Fully automate",
    tiles: [
      { id: "PRODUCT-05", name: "product metrics", tag: "R" },
      { id: "GTM-11", name: "CRM", tag: "R" },
      { id: "GTM-18", name: "onboarding/success playbooks", tag: "R" },
    ],
    gates: [
      { key: "account_count", kind: "threshold", label: "customer account count enough for a score to mean anything" },
      { key: "product_telemetry", kind: "capability", label: "product telemetry captured" },
    ] },
  { n: 10, name: "Whole-corpus intelligence", cls: "Net-new", tiles: [], gates: [], netNew: true },
];

const EXCLUSIONS: [string, string][] = [
  ["Autonomous outbound sales agents", "Five research passes found no corroboration beyond sellers of the tooling. Excluded until that changes; this exclusion is itself shown to customers as part of the menu's honesty."],
  ["Whole-stack \"automate everything\" consolidations", "Automating an undocumented, inconsistent process makes its failures faster. The board exists to fix the process first; the menu sequences automation behind that."],
];

// ---- §1 state table (per-tile status) ------------------------------------------------------
interface TileStatus { id: string; name: string; tag: Tag; state: string; status: string; path?: string; caveat?: string }
function tileStatus(t: TileRef, state: string | null): TileStatus {
  const base = { id: t.id, name: t.name, tag: t.tag, state: state ?? "not in run" };
  if (state == null || state === "placeholder") return { ...base, status: "unresolved" };
  if (t.tag === "R") {
    switch (state) {
      case "evidence-found": return { ...base, status: "met" };
      case "thin": return { ...base, status: "not-yet", path: `strengthen ${t.name} (${t.id}, thin)` };
      case "genuine-absence": return { ...base, status: "not-yet", path: `create ${t.name} (${t.id}, genuine-absence)` };
      case "documented-n-a": return { ...base, status: "waived-pending", path: `confirm the documented-n/a rationale covers ${t.name} (${t.id})` };
      case "informational": return { ...base, status: "met" };
      default: return { ...base, status: "unresolved" };
    }
  }
  switch (state) {
    case "thin": return { ...base, status: "met", caveat: `${t.name} (${t.id}) is thin — note in the item's caveat line` };
    case "genuine-absence": return { ...base, status: "met", caveat: `${t.name} (${t.id}) absent — noted, does not block` };
    default: return { ...base, status: "met" };
  }
}

// ---- operator-fact gate evaluation ---------------------------------------------------------
type GateOutcome = "satisfied" | "unsatisfied-structural" | "unsatisfied-nonstructural" | "unknown";
interface GateStatus { gate: Gate; value: string; outcome: GateOutcome; path?: string; note?: string }
function gateStatus(g: Gate, value: string | undefined): GateStatus {
  const v = (value ?? "unknown").toLowerCase();
  if (v === "unknown") return { gate: g, value: v, outcome: "unknown", note: `${g.label}: unknown → pending intake` };
  const yes = v.startsWith("yes") || v === "true" || v === "sufficient" || v === "high";
  if (g.kind === "structural") {
    return v === "no"
      ? { gate: g, value: v, outcome: "unsatisfied-structural", path: `${g.label}: no — structurally inapplicable` }
      : { gate: g, value: v, outcome: "satisfied" };
  }
  if (g.kind === "capability") {
    return yes ? { gate: g, value: v, outcome: "satisfied" }
      : { gate: g, value: v, outcome: "unsatisfied-nonstructural", path: `${g.label}: ${v} (operator-fact)` };
  }
  const belowThreshold = /^(low|small|none|zero|near-zero|below|insufficient)/.test(v);
  return belowThreshold
    ? { gate: g, value: v, outcome: "unsatisfied-nonstructural", path: `grow ${g.label} — ${v}; no tool creates it (operator-fact)` }
    : { gate: g, value: v, outcome: "satisfied" };
}

// ---- item resolution -----------------------------------------------------------------------
interface ItemCtx { tileStatus: Map<string, TileStatus> }
interface Resolution {
  n: number; name: string; cls: string; disposition: string;
  reason: string; paths: string[]; caveats: string[]; pendingIntake: string[]; subNote: string | null;
  citedIds: string[]; tiles: TileStatus[]; gates: GateStatus[]; pendingGates: string[];
}
function resolve(item: Item, states: Map<string, string>, answers: Record<string, { value?: string }>): Resolution {
  const tileStatuses = item.tiles.map((t) => tileStatus(t, states.has(t.id) ? states.get(t.id)! : null));
  const tsMap = new Map(tileStatuses.map((s) => [s.id, s]));
  const gateStatuses = item.gates.map((g) => gateStatus(g, answers[g.key]?.value));
  const paths: string[] = [];
  const caveats: string[] = tileStatuses.filter((s) => s.caveat).map((s) => s.caveat!);
  const pendingIntake: string[] = [];
  let disposition = ""; let reason = "";
  const requiredNotYet = tileStatuses.filter((s) => s.tag === "R" && s.status === "not-yet");
  const requiredUnresolved = tileStatuses.filter((s) => s.tag === "R" && s.status === "unresolved");
  const requiredWaivedPending = tileStatuses.filter((s) => s.tag === "R" && s.status === "waived-pending");
  const structuralUnsatisfied = gateStatuses.filter((g) => g.outcome === "unsatisfied-structural");
  const nonStructuralUnsatisfied = gateStatuses.filter((g) => g.outcome === "unsatisfied-nonstructural");
  const unknownGates = gateStatuses.filter((g) => g.outcome === "unknown");
  if (item.netNew) {
    disposition = "pilot";
    reason = "net-new capability — pilot regardless of tile state, per catalog (corpus met by construction; a completed board run exists).";
  } else if (structuralUnsatisfied.length) {
    disposition = "not offered"; reason = structuralUnsatisfied.map((g) => g.path).join("; ");
  } else if (requiredNotYet.length || nonStructuralUnsatisfied.length) {
    disposition = "not yet";
    for (const s of requiredNotYet) paths.push(s.path!);
    for (const g of nonStructuralUnsatisfied) paths.push(g.path!);
    for (const g of unknownGates) pendingIntake.push(`${g.gate.label}: unknown — pending intake (does not change not-yet)`);
    for (const s of requiredUnresolved) pendingIntake.push(`${s.name} (${s.id}) not evaluated in this run`);
    reason = "one or more required prerequisites are not yet met.";
  } else if (requiredUnresolved.length || requiredWaivedPending.length) {
    disposition = "unresolved";
    reason = "pending assessment — a required prerequisite was not evaluated in this run or awaits an n/a-rationale confirmation.";
    for (const s of requiredUnresolved) pendingIntake.push(`${s.name} (${s.id}) not evaluated in this run`);
    for (const s of requiredWaivedPending) pendingIntake.push(s.path!);
  } else if (unknownGates.length) {
    disposition = "unresolved";
    reason = "all tile prerequisites met; awaiting operator-fact answers to finish resolution.";
    for (const g of unknownGates) pendingIntake.push(`${g.gate.label}: unknown → pending intake`);
  } else {
    disposition = "available"; reason = "all required prerequisites met.";
  }
  const subNote = item.subNote ? item.subNote({ tileStatus: tsMap }) : null;
  return {
    n: item.n, name: item.name, cls: item.cls, disposition, reason,
    paths, caveats, pendingIntake, subNote, citedIds: item.tiles.map((t) => t.id),
    tiles: tileStatuses, gates: gateStatuses, pendingGates: unknownGates.map((g) => g.gate.key),
  };
}

// ---- run -----------------------------------------------------------------------------------
const run = JSON.parse(readFileSync(RUN_FILE, "utf8"));
const intake = JSON.parse(readFileSync(INTAKE_FILE, "utf8"));
const closureData = JSON.parse(readFileSync(CLOSURE_FILE, "utf8"));
const CLOSURE: Record<string, string> = closureData.closure;
const CLOSURE_LABELS: Record<string, string> = closureData.labels;
const states = new Map<string, string>(run.records.map((r: any) => [r.id, r.state]));
const answers: Record<string, { value?: string; detail?: string }> = intake.answers ?? {};
const resolutions = ITEMS.map((it) => resolve(it, states, answers));
const byN = new Map(resolutions.map((r) => [r.n, r]));

// ---- sanity checks (fail loudly before writing) --------------------------------------------
const VALID = new Set(["available", "not yet", "not offered", "pilot", "unresolved"]);
const mappedIds = new Set(ITEMS.flatMap((it) => it.tiles.map((t) => t.id)));
const failures: string[] = [];
for (const r of resolutions) {
  if (!VALID.has(r.disposition)) failures.push(`item ${r.n}: invalid/absent disposition "${r.disposition}"`);
  for (const id of r.citedIds) if (!mappedIds.has(id)) failures.push(`item ${r.n}: cites ${id} absent from mapping`);
}
if (resolutions.length !== 10) failures.push(`expected 10 items, got ${resolutions.length}`);
if (byN.get(6)?.disposition !== "not offered") failures.push(`item 6 must be "not offered", got "${byN.get(6)?.disposition}"`);
if (failures.length) { console.error("SANITY CHECKS FAILED:\n - " + failures.join("\n - ")); process.exit(1); }

const slug = String(intake.company ?? "company").toLowerCase().replace(/\s+/g, "-");

// ============================================================================================
// MARKDOWN SURFACE (unchanged — byte-identical to the committed ref-menu-001.md)
// ============================================================================================
const DISPOSITION_ORDER = ["available", "pilot", "not yet", "unresolved", "not offered"];
const md: string[] = [];
md.push(`# Leverage Menu (resolution 001)`);
md.push("");
md.push(`**Run:** \`${run.stats?.runId ?? intake.runId}\` · **Intake:** \`leverage/intake/reference.json\` · **Catalog:** ${CATALOG_VERSION} · **Mapping:** ${MAPPING_VERSION}`);
md.push(`**Generated:** ${new Date().toISOString().slice(0, 10)} · deterministic resolver (no model calls) · ${resolutions.length} items`);
md.push("");
const tally = DISPOSITION_ORDER.map((d) => `${d}: ${resolutions.filter((r) => r.disposition === d).length}`).join(" · ");
md.push(`**Dispositions:** ${tally}`);
md.push("");
md.push("---");
md.push("");
for (const r of resolutions) {
  md.push(`## ${r.n}. ${r.name}`);
  md.push(`**Class:** ${r.cls} · **Disposition: ${r.disposition.toUpperCase()}**`);
  md.push("");
  md.push(`${r.reason}`);
  if (r.disposition === "not yet" && r.paths.length) {
    md.push(""); md.push(`**Unmet paths:**`); for (const p of r.paths) md.push(`- ${p}`);
  }
  if (r.caveats.length) { md.push(""); for (const c of r.caveats) md.push(`_Caveat: ${c}._`); }
  if (r.pendingIntake.length) { md.push(""); for (const p of r.pendingIntake) md.push(`_Pending: ${p}._`); }
  if (r.subNote) { md.push(""); md.push(`_${r.subNote}_`); }
  md.push("");
}
md.push("---"); md.push(""); md.push("## Not on the menu"); md.push("");
for (const [title, body] of EXCLUSIONS) md.push(`**${title}.** ${body}`);
md.push("");
const MD_OUT = join(REPO, "runs-of-record", `${slug}-menu-${RESOLUTION_NO}.md`);
mkdirSync(dirname(MD_OUT), { recursive: true });
writeFileSync(MD_OUT, md.join("\n"), "utf8");

// ============================================================================================
// v2 HTML SURFACE
// ============================================================================================
const BADGE: Record<string, [string, string]> = {
  "available": ["b-available", "AVAILABLE"], "not yet": ["b-notyet", "NOT YET"],
  "pilot": ["b-pilot", "PILOT"], "not offered": ["b-notoffered", "NOT OFFERED"],
  "unresolved": ["b-unresolved", "UNRESOLVED"],
};
const badgeHtml = (d: string) => { const [c, l] = BADGE[d]; return `<span class="badge ${c}">${l}</span>`; };

const tileMet = (r: Resolution, id: string) => r.tiles.some((t) => t.id === id && t.status === "met");
const gateSat = (r: Resolution, k: string) => r.gates.some((g) => g.gate.key === k && g.outcome === "satisfied");
const gatePending = (r: Resolution, k: string) => r.pendingGates.includes(k);
const supThin = (r: Resolution, id: string) => r.tiles.some((t) => t.id === id && t.tag === "S" && t.state === "thin");
const unmetTile = (r: Resolution, id: string) => r.tiles.some((t) => t.id === id && t.status === "not-yet");
const gateUnmet = (r: Resolution, k: string) => r.gates.some((g) => g.gate.key === k && g.outcome === "unsatisfied-nonstructural");

// evidence chips: verbatim copy from approved v2, keyed by item; each emits iff its prereq is met.
const CHIPS: Record<number, { gate: string; html: string }[]> = {
  1: [{ gate: "GTM-11", html: `<span class="evc">pipeline system of record · evidence found</span>` }, { gate: "platform", html: `<span class="evc">corpus · live by construction</span>` }],
  2: [{ gate: "GTM-11", html: `<span class="evc">CRM contact records · evidence found</span>` }],
  4: [{ gate: "OPS-07", html: `<span class="evc">approval practice · evidence found</span>` }, { gate: "spend_approval_chain", html: `<span class="evc fact">approval chain: ops/finance lead + founder · your answer</span>` }],
  5: [{ gate: "COMP-01", html: `<span class="evc">security assurance posture · evidence found</span>` }, { gate: "OPS-06", html: `<span class="evc">identity &amp; access management · evidence found</span>` }, { gate: "buyer_security_pressure", html: `<span class="evc fact">buyer security pressure: yes · your answer</span>` }],
  7: [{ gate: "OPS-06", html: `<span class="evc">access de-provisioning · evidence found</span>` }, { gate: "hris", html: `<span class="evc fact">HR system of record: yes · your answer</span>` }],
  8: [{ gate: "GTM-07", html: `<span class="evc">documented ICP · evidence found</span>` }, { gate: "GTM-11", html: `<span class="evc">lead handling &amp; routing · evidence found</span>` }],
  10: [{ gate: "platform", html: `<span class="evc">corpus · populated by construction</span>` }, { gate: "platform", html: `<span class="evc">diagnosis · completed board run</span>` }],
};
const isTileId = (s: string) => /^[A-Z]+-\d{2}$/.test(s); // subcategory id vs platform / operator-fact gate
// Board-derived tile references deep-link to the board SPA at /#<ID> (shared origin after paste 2);
// platform chips and dashed intake-fact chips get no link.
function chipsFor(n: number): string {
  const r = byN.get(n)!;
  return (CHIPS[n] ?? []).filter((c) => c.gate === "platform" || tileMet(r, c.gate) || gateSat(r, c.gate))
    .map((c) => isTileId(c.gate) ? `        <a class="tlink" href="/#${c.gate}">${c.html}</a>` : `        ${c.html}`).join("\n");
}

// rungs with closure tags: rung text/ev/copy verbatim from approved v2 keyed by (item,rung);
// each emits iff its source is a computed unmet path; closure class/label from rung-closure.json.
const RUNGS: Record<number, { source: string; text: string; ev: string; copy: string }[]> = {
  2: [{ source: "OPS-01", text: "Strengthen your ownership map", ev: "ownership map · thin", copy: "— a first-pass map from who actually touches what in your corpus; naming the owners is your call." }],
  3: [{ source: "OPS-01", text: "Strengthen your ownership map", ev: "ownership map · thin", copy: "— and closing it unlocks records freshness at the same time." }],
  4: [{ source: "FIN-01", text: "Strengthen your accounting system of record", ev: "accounting records · thin", copy: "— with your bookkeeper; Ladder can flag what's inconsistent but the ledger is theirs." }],
  7: [{ source: "PEOPLE-03", text: "Create an onboarding program", ev: "onboarding program · absent", copy: "— a program skeleton from how your existing hires actually ramped, for your review." }, { source: "OPS-04", text: "Strengthen your on/offboarding runbook", ev: "runbook · thin", copy: "— from the access and tooling evidence already in your corpus." }],
  8: [{ source: "inbound_lead_volume", text: "Grow inbound volume enough to matter", ev: "your answer: low / near zero", copy: "— this is your sales motion, not a tooling gap; for an enterprise-invoiced motion it may simply never apply." }],
  9: [{ source: "PRODUCT-05", text: "Strengthen product metrics", ev: "product metrics · thin", copy: "— metric definitions from your targets and product docs; instrumenting them is engineering's." }, { source: "GTM-18", text: "Write the success playbooks", ev: "playbooks · thin", copy: "— from your customer-call evidence, once a reviewer is named." }, { source: "account_count", text: "Grow the account base until a score means something", ev: "your answer: small", copy: "— no tool creates customers." }],
};
function activeRungs(n: number) {
  const r = byN.get(n)!;
  return (RUNGS[n] ?? []).filter((s) => unmetTile(r, s.source) || gateUnmet(r, s.source));
}
function rungsFor(n: number): string {
  return activeRungs(n).map((s) => {
    const cls = CLOSURE[s.source];
    if (!cls) { console.error(`closure class missing for rung source ${s.source} (item ${n})`); process.exit(1); }
    const who = cls === "draftable" ? "ladder" : "you";
    // deep-link the tile reference (ev) to the board; operator-fact rungs (non-tile sources) don't link
    const ev = isTileId(s.source)
      ? `<a class="tlink" href="/#${s.source}"><span class="ev">${s.ev}</span></a>`
      : `<span class="ev">${s.ev}</span>`;
    return `        <div class="rung">${s.text} ${ev}\n          <span class="who-closes ${who}"><b>${CLOSURE_LABELS[cls]}</b> ${s.copy}</span>\n        </div>`;
  }).join("\n");
}

// caveats: verbatim, data-gated (item 3's is fixed explanatory copy; item 10's is the pilot rationale)
const CAVEAT: Record<number, { when: (r: Resolution) => boolean; html: string }> = {
  2: { when: (r) => supThin(r, "OPS-05"), html: `      <p class="caveat">Noted: your vendor inventory is thin — worth strengthening alongside, and it's also draftable from corpus evidence.</p>` },
  3: { when: () => true, html: `      <p class="caveat">This item is the engine behind most "Ladder can draft this" tags on this menu — once a reviewer map exists, gap-closure drafting turns on across the board.</p>` },
  4: { when: (r) => supThin(r, "OPS-01") && supThin(r, "OPS-04"), html: `      <p class="caveat">Noted: ownership and process runbooks are thin — both feed this flow, both draftable.</p>` },
  5: { when: (r) => supThin(r, "OPS-01"), html: `      <p class="caveat">Noted: the owner-for-findings role is thin — assign it before turning alerts on, or the alerts become noise nobody actions.</p>` },
  10: { when: (r) => r.disposition === "pilot", html: `      <p class="caveat">Why "pilot": the capability is real and demonstrable; its sustained operational value at your scale is what a pilot establishes. We say that plainly rather than selling it as proven.</p>` },
};
const caveatFor = (n: number) => { const c = CAVEAT[n]; return c && c.when(byN.get(n)!) ? c.html : ""; };

function subrec7(): string {
  const r = byN.get(7)!;
  return tileMet(r, "OPS-06")
    ? `      <div class="subrec"><b>Recommended now, at any size:</b> automated access revocation on exit. Your access de-provisioning practice already supports it, and a departed employee retaining access is a security failure no volume threshold excuses.</div>`
    : "";
}
const PENDING: Record<number, { key: string; html: string }> = {
  7: { key: "hiring_velocity", html: `      <p class="pending">Pending intake: hiring velocity (unknown — doesn't change the answer today).</p>` },
  9: { key: "product_telemetry", html: `      <p class="pending">Pending intake: product telemetry (unknown — doesn't change the answer today).</p>` },
};
const pendingFor = (n: number) => { const p = PENDING[n]; return p && gatePending(byN.get(n)!, p.key) ? p.html : ""; };

// sublines — deterministic per disposition (content-level per rule d)
const CW = ["", "One", "Two", "Three", "Four", "Five"];
function subline(n: number): string {
  const r = byN.get(n)!;
  if (n === 10) return "Live today on your corpus and diagnosis — offered as a pilot, and we say why."; // pilot: fixed from approved v2
  if (r.disposition === "available") {
    const metEF = r.tiles.filter((t) => t.state === "evidence-found").map((t) => t.name);
    const shortest = metEF.slice().sort((a, b) => a.length - b.length)[0] ?? "your board";
    return `Ready today — ${shortest} clears it.`;
  }
  if (r.disposition === "not yet") {
    const rungs = activeRungs(n);
    const noun = rungs.length === 1 ? "rung" : "rungs";
    const first = rungs[0];
    const firstText = first ? first.text.charAt(0).toLowerCase() + first.text.slice(1) : "";
    const draft = first && CLOSURE[first.source] === "draftable" ? " — Ladder can draft the first pass" : "";
    return `${CW[rungs.length] ?? rungs.length} ${noun}: ${firstText}${draft}.`;
  }
  return "";
}

// item 6 (not offered) compact title reason — data-driven structural reason
function titleReason6(): string {
  const r = byN.get(6)!;
  const g = r.gates.find((x) => x.outcome === "unsatisfied-structural");
  const a = g ? answers[g.gate.key] : undefined;
  const val = a?.value ?? "no"; const det = a?.detail ? ` (${a.detail})` : "";
  return `not offered: recurring billing is ${val}${det}; nothing to recover`;
}

// "where to start" strip — deterministic rules (c), VERIFIED against the approved v2 (STOP on mismatch)
function buildStrip(): string {
  const avail = resolutions.filter((r) => r.disposition === "available").sort((a, b) => a.n - b.n);
  const col1 = avail[0];
  const unmetCount: Record<string, number> = {}, caveatCount: Record<string, number> = {};
  for (const r of resolutions) for (const t of r.tiles) {
    if (t.tag === "R" && t.status === "not-yet") unmetCount[t.id] = (unmetCount[t.id] || 0) + 1;
    if (t.tag === "S" && t.state === "thin") caveatCount[t.id] = (caveatCount[t.id] || 0) + 1;
  }
  const top = Object.entries(unmetCount).sort((a, b) => b[1] - a[1] || (caveatCount[b[0]] || 0) - (caveatCount[a[0]] || 0))[0];
  const col2id = top?.[0]; const clears = top?.[1] ?? 0; const strengthens = caveatCount[col2id ?? ""] || 0;
  let col3: { item: number } | null = null;
  for (const r of avail) { if (r.tiles.some((t) => t.tag === "S" && t.state === "thin")) { col3 = { item: r.n }; break; } }
  const problems: string[] = [];
  if (!col1 || col1.n !== 1) problems.push(`col1 (NOW) expected item 1, got ${col1?.n ?? "none"}`);
  if (col2id !== "OPS-01") problems.push(`col2 (highest-leverage) expected OPS-01, got ${col2id ?? "none"}`);
  if (clears !== 2 || strengthens !== 2) problems.push(`col2 counts expected clears=2/strengthens=2, got ${clears}/${strengthens}`);
  if (!col3 || col3.item !== 5) problems.push(`col3 (one assignment) expected item 5, got ${col3?.item ?? "none"}`);
  if (problems.length) { console.error("STRIP-RULE MISMATCH vs approved v2 — STOP:\n - " + problems.join("\n - ")); process.exit(1); }
  return [
    `      <div class="start-col">\n        <div class="start-n">NOW</div>\n        <div class="start-t">Turn on call capture</div>\n        <div class="start-d">Available today — every call becomes searchable evidence, and it feeds everything below.</div>\n        <span class="unlock">AVAILABLE NOW</span>\n      </div>`,
    `      <div class="start-col">\n        <div class="start-n">HIGHEST-LEVERAGE RUNG</div>\n        <div class="start-t">Strengthen your ownership map</div>\n        <div class="start-d">One thin tile gates two menu items and weakens two more. No other single move clears as much.</div>\n        <span class="unlock">CLEARS ${clears} · STRENGTHENS ${strengthens}</span>\n      </div>`,
    `      <div class="start-col">\n        <div class="start-n">ONE ASSIGNMENT</div>\n        <div class="start-t">Name an owner for compliance findings</div>\n        <div class="start-d">Compliance monitoring is available — this one thin spot decides whether its alerts get actioned or ignored.</div>\n        <span class="unlock">UNBLOCKS ALERTS</span>\n      </div>`,
  ].join("\n");
}

const TALLY_ORDER = ["available", "not yet", "pilot", "not offered", "unresolved"];
const tallyChips = TALLY_ORDER
  .map((d) => [d, resolutions.filter((r) => r.disposition === d).length] as [string, number])
  .filter(([, c]) => c > 0)
  .map(([d, c]) => `    <span class="chip"><b>${c}</b> ${d}</span>`).join("\n");

const slots: Record<string, string> = {
  COMPANY: String(intake.company ?? "Company"),
  COMPANY_FULL: String(intake.company_full ?? intake.company ?? "Company"),
  COMPANY_SLUG: slug,
  RES_NO: RESOLUTION_NO,
  RUN_ID: String(run.stats?.runId ?? intake.runId ?? ""),
  TALLY: tallyChips,
  STRIP: buildStrip(),
  I6_TITLE_REASON: titleReason6(),
};
for (let n = 1; n <= 10; n++) slots[`I${n}_BADGE`] = badgeHtml(byN.get(n)!.disposition);
for (const n of [1, 2, 3, 4, 5, 7, 8, 9, 10]) slots[`I${n}_SUBLINE`] = subline(n);
for (const n of [1, 2, 4, 5, 7, 8, 10]) slots[`I${n}_CHIPS`] = chipsFor(n);
for (const n of [2, 3, 4, 7, 8, 9]) slots[`I${n}_RUNGS`] = rungsFor(n);
for (const n of [2, 3, 4, 5, 10]) slots[`I${n}_CAVEAT`] = caveatFor(n);
slots["I7_SUBREC"] = subrec7();
for (const n of [7, 9]) slots[`I${n}_PENDING`] = pendingFor(n);

let html = readFileSync(TEMPLATE_FILE, "utf8");
for (const [k, v] of Object.entries(slots)) html = html.split(`{{${k}}}`).join(v);
const leftover = html.match(/\{\{[A-Z0-9_]+\}\}/g);
if (leftover) { console.error(`UNFILLED TEMPLATE SLOTS: ${[...new Set(leftover)].join(", ")}`); process.exit(1); }
const HTML_OUT = join(REPO, "runs-of-record", `${slug}-menu-${RESOLUTION_NO}.html`);
writeFileSync(HTML_OUT, html, "utf8");

// leverage-links: the board side's input (paste 2 consumes it). Per subcategory id, where it
// GATES (required-unmet), where it's a CAVEAT (supporting-noted), and where it's an AVAILABLE
// SUPPORT (met evidence) across the 10 items.
const links: Record<string, { gates: any[]; caveats: any[]; available_supports: any[] }> = {};
const ensure = (id: string) => (links[id] ??= { gates: [], caveats: [], available_supports: [] });
for (const it of ITEMS) {
  const r = byN.get(it.n)!;
  for (const t of r.tiles) {
    const entry = { item: it.n, name: it.name };
    if (t.state === "evidence-found") ensure(t.id).available_supports.push(entry);
    else if (t.tag === "R" && t.status === "not-yet") ensure(t.id).gates.push(entry);
    else if (t.tag === "S" && (t.state === "thin" || t.state === "genuine-absence")) ensure(t.id).caveats.push(entry);
  }
}
const LINKS_OUT = join(REPO, "runs-of-record", `${slug}-leverage-links-${RESOLUTION_NO}.json`);
writeFileSync(LINKS_OUT, JSON.stringify({ resolution: RESOLUTION_NO, run: String(run.stats?.runId ?? intake.runId ?? ""), menu_url: "/leverage", links }, null, 2) + "\n", "utf8");

console.log(`Wrote ${MD_OUT}`);
console.log(`Wrote ${HTML_OUT}`);
console.log(`Wrote ${LINKS_OUT}`);
console.log(`Dispositions — ${tally}`);
console.log("Strip rules verified vs approved v2 (col1=item1, col2=OPS-01 clears2/strengthens2, col3=item5).");
console.log("Sanity checks: PASS (10 items, one disposition each; item 6 not-offered; no unfilled slots).");
