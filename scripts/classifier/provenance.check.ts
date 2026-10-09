/**
 * Provenance firewall unit check (A2/B3, 2026-07-16). Asserts, on LIVE-SHAPED evidence, that
 * the judge projection leaks neither provenance (origin), lifecycle (status), nor the adopted
 * slug — and that the opaque id decodes back for the record. Run: `node scripts/classifier/provenance.check.ts`.
 */
import { toJudgeEvidence, judgeIdDecoder, originOf, SIGNAL_RE } from "./provenance.ts";
import { adoptedTitle } from "../adopt-draft.ts";
import type { Chunk } from "./types.ts";

let failures = 0;
function assert(cond: boolean, msg: string) {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
}

// Live-shaped adopted-page chunk: what retrieval hands the judge after attachProvenance.
const adopted: Chunk = {
  id: "9361", // real store chunk id (numeric — not a slug)
  pageId: "remediation/gtm-20-adopted",
  slug: "remediation/gtm-20-adopted",
  title: adoptedTitle("GTM-20"),
  score: 0.83,
  text: "A metrics-definitions document: defines each headline metric, its formula, and its owner.",
  origin: "ladder-generated",
  status: "working",
};
// A company-native chunk whose TITLE legitimately contains a signal word (content, not provenance).
const native: Chunk = { id: "42", slug: "06-sources/q3-draft-budget", title: "Q3 Draft Budget", score: 0.4, text: "budget figures" };

const evidence = [adopted, native];
const visible = toJudgeEvidence(evidence);
const decode = judgeIdDecoder(evidence);

console.log("Provenance firewall check (A1/A2/B3):");

// A1: judge-visible keys are exactly id/title/score/text — no pageId/slug/origin/status.
const keys = new Set(Object.keys(visible[0]));
assert([...keys].every((k) => ["id", "title", "score", "text"].includes(k)), `judge keys are id/title/score/text only (got ${[...keys].join(",")})`);
for (const k of ["pageId", "slug", "origin", "status"]) assert(!(k in visible[0]), `no '${k}' key in judge projection`);

// A1: id is an opaque per-run index, not the slug/real id.
assert(/^e\d+$/.test(visible[0].id), `opaque id (${visible[0].id})`);
assert(decode.get(visible[0].id) === "9361", `opaque id decodes back to real chunk id`);

// A2: the judge payload for the adopted chunk contains NO signaling token in its locators.
const payload = `chunk ${visible[0].id} — ${visible[0].title ?? ""}\n${visible[0].text}`;
assert(!SIGNAL_RE.test(`${visible[0].id} ${visible[0].title ?? ""}`), `adopted-doc locators (id+title) carry no signal token`);
assert(!SIGNAL_RE.test(payload), `full adopted-doc judge payload carries no /remediation|adopted|draft|generated/`);

// A2 negative control: a company doc titled "…Draft…" is CONTENT — its projection is allowed
// (the firewall governs provenance metadata + adopted locators, not company content).
assert(visible[1].title === "Q3 Draft Budget", `company-native title passes through as content`);

// B3 + disclosure: origin/status are STRIPPED from the judge but PRESERVED on the source chunk
// (board disclosure reads them there).
assert(originOf(adopted) === "ladder-generated", `originOf still reads origin outside judge context`);
assert(adopted.status === "working", `status preserved on the source chunk for board disclosure`);

// Regression: a signaling slug on the chunk must NOT survive into the projection (the D-pair path).
assert(!JSON.stringify(visible).includes("remediation/"), `signaling slug absent from entire judge projection`);

console.log(failures === 0 ? "\nprovenance.check: ALL PASS" : `\nprovenance.check: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
