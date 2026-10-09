/**
 * Unit check for the approvability guard (STEP 1b). Asserts the absent/unknown-class default
 * stays NOT approvable, and that an artifact-sufficient + flippable draft is approvable — on
 * live-shaped metadata, including the actual repaired GTM-20 draft header.
 * Run: `node scripts/board-approval.check.ts`.
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDraftMeta, isApprovable } from "./board-approval.ts";

let failures = 0;
function assert(cond: boolean, msg: string) {
  console.log(`  ${cond ? "PASS" : "FAIL"}  ${msg}`);
  if (!cond) failures++;
}

console.log("Approvability guard check (STEP 1b):");

// 1. Legacy draft with NO metadata header -> empty meta -> NOT approvable (the correct default).
const noHeader = "# DRAFT FOR OPERATOR APPROVAL — Metrics Definitions (GTM-20)\n\nSome body.";
assert(Object.keys(parseDraftMeta(noHeader)).length === 0, "no-header draft parses to empty meta");
assert(isApprovable(parseDraftMeta(noHeader)) === false, "no-header (absent-class) draft is NOT approvable");

// 2. Artifact-sufficient + flippable -> approvable.
assert(isApprovable({ gap_class: "artifact-sufficient", flippable: "true" }) === true, "artifact-sufficient + flippable -> approvable");

// 3. Non-artifact-sufficient classes -> not approvable.
assert(isApprovable({ gap_class: "practice", flippable: "false" }) === false, "practice -> not approvable");
assert(isApprovable({ gap_class: "system", flippable: "false" }) === false, "system -> not approvable");

// 4. Artifact-sufficient but flippable missing/false -> not approvable (both conditions required).
assert(isApprovable({ gap_class: "artifact-sufficient" }) === false, "artifact-sufficient without flippable -> not approvable");
assert(isApprovable({ gap_class: "artifact-sufficient", flippable: "false" }) === false, "artifact-sufficient + flippable:false -> not approvable");

// 5. The actual repaired GTM-20 draft: header now present -> artifact-sufficient -> approvable, id = GTM-20.
const gtm20 = join(dirname(fileURLToPath(import.meta.url)), "..", "generated-drafts", "GTM-20-metrics-definitions-DRAFT.md");
if (existsSync(gtm20)) {
  const meta = parseDraftMeta(readFileSync(gtm20, "utf8"));
  assert(meta.subcategory === "GTM-20", `repaired GTM-20 draft: subcategory=GTM-20 (got ${meta.subcategory})`);
  assert(meta.gap_class === "artifact-sufficient", `repaired GTM-20 draft: gap_class=artifact-sufficient (got ${meta.gap_class})`);
  assert(isApprovable(meta) === true, "repaired GTM-20 draft is now approvable");
} else {
  console.log("  (skip) GTM-20 draft file not present");
}

console.log(failures === 0 ? "\nboard-approval.check: ALL PASS" : `\nboard-approval.check: ${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
