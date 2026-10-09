import "./env.ts";
import { generateReviewed, ValidatorFailure } from "./generate.ts";
import { resetUsage, readUsage, usageCost } from "./usage-meter.ts";
import { writeFileSync } from "node:fs";

/**
 * Batch regeneration runner with the PERMANENT STOP RULE (07/18 rerun-closeout §4). Promoted from
 * the throwaway _rerun.ts / _rerun1.ts scratch runners.
 *
 * STOP RULE (never repealed):
 *   - ONE generateReviewed attempt per subcategory. MAX_ATTEMPTS = 1. A deterministic-gate failure
 *     (ValidatorFailure — mechanical validator, deliverable lint, external-ref check, generation
 *     harness, or the adversarial gate) is a FINDING, not a retry target. generateReviewed already
 *     files it to generated-drafts/GENERATION-FAILURES.jsonl and removes the draft; the runner
 *     records the outcome and CONTINUES to the next id. Retrying a deterministic gate with unchanged
 *     input is forbidden — it cannot pass and only burns spend.
 *   - SPEND CAP: RERUN_SPEND_CAP_USD (default $1.50) across the whole run. Checked before each draft;
 *     reaching it stops the run cleanly and reports (the next draft is not started).
 *
 * A full artifact-mode pass is ~4 model calls (generate + structural review + authority-apply +
 * adversarial gate); a plan-mode pass is ~2 (generate + adversarial). Those are pipeline STAGES on a
 * single attempt, not retries — the one-attempt rule governs regenerations, the spend cap governs cost.
 *
 * Usage: node rerun.ts GTM-20 OPS-01 OPS-05     (defaults to the five demo ids when none given)
 */
const MAX_ATTEMPTS = 1; // one regeneration attempt per draft; deterministic gates are never retried
const SPEND_CAP_USD = Number(process.env.RERUN_SPEND_CAP_USD ?? 1.5);
const DEFAULT_IDS = ["GTM-20", "OPS-01", "OPS-05", "GTM-18", "PRODUCT-01"];

const argIds = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const IDS = argIds.length ? argIds : DEFAULT_IDS;

const out: any[] = [];
let spent = 0;
let stoppedForCap = false;

for (const id of IDS) {
  if (spent >= SPEND_CAP_USD) {
    stoppedForCap = true;
    console.log(`SPEND CAP $${SPEND_CAP_USD.toFixed(2)} reached ($${spent.toFixed(4)}) — stopping before ${id}.`);
    break;
  }
  resetUsage();
  const t0 = Date.now();
  let rec: any = null;

  // MAX_ATTEMPTS === 1: this loop body runs exactly once. It is written as a loop only to make the
  // "one regeneration attempt; no retry on a deterministic gate" rule explicit and enforced — every
  // exit path (success OR failure) breaks unconditionally.
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const r = await generateReviewed(id);
      const u = readUsage();
      rec = {
        id, ok: true, attempt, mode: r.mode, genMode: r.genMode, file: r.file?.split("/").pop(),
        adversarial: r.adversarial ? { verdict: r.adversarial.verdict, reservations: r.adversarial.reservations } : null,
        validatorChecks: (r.validator?.checks ?? []).map((c: any) => ({ check: c.check, pass: c.pass, detail: c.detail })),
        usage: u, cost: usageCost(u), ms: Date.now() - t0,
      };
      console.log(`${id} OK  mode=${r.mode} gate=${r.adversarial?.verdict ?? "n/a"} calls=${u.calls}  $${usageCost(u).toFixed(4)}  ${Date.now() - t0}ms`);
      break;
    } catch (e: any) {
      const u = readUsage();
      const deterministic = e instanceof ValidatorFailure || e?.name === "ValidatorFailure";
      rec = {
        id, ok: false, attempt, deterministicGate: deterministic,
        error: String(e?.message ?? e).split("\n")[0], failures: e?.failures ?? null,
        usage: u, cost: usageCost(u), ms: Date.now() - t0,
      };
      console.log(`${id} ${deterministic ? "BLOCKED (gate — filed, no retry)" : "FAILED"}: ${String(e?.message ?? e).split("\n")[0]} calls=${u.calls}  $${usageCost(u).toFixed(4)}`);
      break; // STOP RULE: filed (logged inside generateReviewed); never retried with unchanged input.
    }
  }

  out.push(rec);
  spent += rec?.cost ?? 0;
}

const total = out.reduce(
  (a, r) => ({
    inTok: a.inTok + (r?.usage?.inTok ?? 0), outTok: a.outTok + (r?.usage?.outTok ?? 0),
    searches: a.searches + (r?.usage?.searches ?? 0), calls: a.calls + (r?.usage?.calls ?? 0),
  }),
  { inTok: 0, outTok: 0, searches: 0, calls: 0 },
);
const totalCost = usageCost(total);
writeFileSync("/tmp/rerun-closeout.json", JSON.stringify({ out, total, totalCost, spendCapUsd: SPEND_CAP_USD, stoppedForCap }, null, 2));
console.log(`\nTOTAL  $${totalCost.toFixed(4)}  calls=${total.calls} searches=${total.searches}  passed=${out.filter((r) => r?.ok).length}/${out.length}${stoppedForCap ? "  [STOPPED AT SPEND CAP]" : ""}`);
process.exit(0);
