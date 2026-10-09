import "./env.ts";
import { writeFileSync } from "node:fs";
import { generateReviewed, GenerationExcludedError, ValidatorFailure, SectionCoverageError, TemplateFabricationError } from "./generate.ts";

/**
 * Phase B batch generator (autonomous run 2026-07-17). Runs the FULL pipeline for one deliverable
 * per live template (each covering its sibling tiles), retry-once on transient failure. Harness/
 * validator blocks are recorded as catches (not queued). Nothing is approved or ingested.
 *
 * One-per-template (not one-per-tile): shared templates (product-process, hr-policy-handbook,
 * legal-draftable-policies, engineering-reference-docs, revenue-metrics) produce ONE document that
 * closes multiple tiles — generating each sibling separately would be a near-duplicate. Logged.
 */

const TARGETS: { tile: string; template: string; covers: string[] }[] = [
  { tile: "GTM-20", template: "revenue-metrics", covers: ["GTM-20", "GTM-22"] },
  { tile: "GTM-16", template: "sales-enablement", covers: ["GTM-16"] },
  { tile: "GTM-18", template: "onboarding-success", covers: ["GTM-18"] },
  { tile: "PRODUCT-01", template: "product-process", covers: ["PRODUCT-01", "PRODUCT-02"] },
  { tile: "PRODUCT-04", template: "pmf-assessment", covers: ["PRODUCT-04"] },
  { tile: "PRODUCT-05", template: "product-metrics", covers: ["PRODUCT-05"] },
  { tile: "OPS-01", template: "operating-ownership-map", covers: ["OPS-01"] },
  { tile: "OPS-04", template: "operating-runbooks", covers: ["OPS-04"] },
  { tile: "OPS-05", template: "vendor-inventory", covers: ["OPS-05"] },
  { tile: "PEOPLE-02", template: "compensation-framework", covers: ["PEOPLE-02"] },
  { tile: "PEOPLE-06", template: "values-operating-principles", covers: ["PEOPLE-06"] },
  { tile: "PEOPLE-07", template: "hr-policy-handbook", covers: ["PEOPLE-07", "PEOPLE-08"] },
  { tile: "LEGAL-09", template: "legal-draftable-policies", covers: ["LEGAL-09", "LEGAL-10"] },
  { tile: "CAP-01", template: "capital-plan", covers: ["CAP-01"] },
  { tile: "ENG-01", template: "engineering-reference-docs", covers: ["ENG-01", "ENG-08"] },
];

async function once(tile: string) {
  const r = await generateReviewed(tile);
  return {
    tile, status: "queued" as const, file: r.file.split("/").pop(),
    openRulings: r.coverage ? r.coverage.filter((c: any) => c.status === "open-ruling").length : null,
    authorityFindings: r.authority?.findings?.length ?? 0,
    selfReview: r.structure ? `${r.structure.verdicts.filter((v: any) => v.verdict === "pass").length}/${r.structure.verdicts.length}` : null,
    searches: r.authority?.searchesUsed ?? 0,
  };
}

async function main() {
  const results: any[] = [];
  for (const t of TARGETS) {
    const started = Date.now();
    try {
      let res;
      try { res = await once(t.tile); }
      catch (e: any) {
        // retry-once only on transient (not a deliberate block/exclusion).
        if (e instanceof ValidatorFailure || e instanceof GenerationExcludedError || e instanceof SectionCoverageError || e instanceof TemplateFabricationError) throw e;
        console.error(`  [retry] ${t.tile}: ${e?.message}`);
        res = await once(t.tile);
      }
      results.push({ ...res, template: t.template, covers: t.covers, secs: Math.round((Date.now() - started) / 1000) });
      console.log(`  QUEUED   ${t.tile} (${t.template}) — self-review ${res.selfReview}, authority ${res.authorityFindings}/${res.searches}, ${Math.round((Date.now() - started) / 1000)}s`);
    } catch (e: any) {
      const kind = e instanceof ValidatorFailure ? "harness-blocked" : e instanceof GenerationExcludedError ? "excluded" : e instanceof SectionCoverageError ? "coverage-fail" : e instanceof TemplateFabricationError ? "fabrication-block" : "error";
      results.push({ tile: t.tile, template: t.template, covers: t.covers, status: kind, reason: e?.message, failures: (e as any)?.failures ?? null, secs: Math.round((Date.now() - started) / 1000) });
      console.log(`  ${kind.toUpperCase()}  ${t.tile} (${t.template}) — ${e?.message?.slice(0, 120)}`);
    }
  }
  writeFileSync("/tmp/batch-results.json", JSON.stringify(results, null, 2));
  const q = results.filter((r) => r.status === "queued").length;
  console.log(`\nBATCH DONE: ${q}/${results.length} queued; results -> /tmp/batch-results.json`);
}
main().catch((e) => { console.error("BATCH FATAL:", e); process.exit(1); });
