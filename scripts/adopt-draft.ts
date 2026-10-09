import "./classifier/env.ts";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadCriteria } from "./classifier/loader.ts";
import { retrievalFromEnv, GbrainRetrievalClient, ADOPTED_SLUG_PREFIX } from "./classifier/retrieval.ts";
import { Judge, judgeConfigFromEnv } from "./classifier/judge.ts";
import { runWithExhaustion } from "./classifier/exhaustion.ts";
import { assertIngestLogUsable } from "./classifier/ingest-log.ts";
import { parseDraftMeta, isPlanMode } from "./board-approval.ts";
import type { EvidenceOrigin, DocStatus } from "./classifier/types.ts";

/**
 * OPERATOR-RUN adopt step (board-driven remediation flow, 2026-07-16). NOT a UI side effect:
 * it mutates the corpus and incurs embedding cost, so it is a deliberate command, run only
 * after an explicit per-document Approve of an ARTIFACT-SUFFICIENT draft.
 *
 *   node scripts/adopt-draft.ts <SUBCAT> <draft-file>
 *
 * Steps (GAP-CLASS-DOCTRINE ingestion form): (1) produce the clean adopted document — draft
 * banner + inline generation markers ([added — not in corpus], DRAFT FOR OPERATOR APPROVAL,
 * the metadata comment) stripped from the body; flagged content stays as adopted content;
 * (2) ingest via the store (put_page) with origin: ladder-generated recorded in metadata so
 * the body never re-announces provenance to the judge; (3) single-tile re-judge (full
 * pipeline); (4) print the new verdict. The board reflects it after `npm run gen`.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = join(__dirname, "..", "reference-model", "CRITERIA-SCHEMA.yaml");

/**
 * Produce the clean adopted document: valid YAML frontmatter + a body stripped of generation
 * markers. Frontmatter is REQUIRED by the store's put_page grammar (verified 2026-07-16: a
 * frontmatter-less body fails "Page not found"), and it is where provenance rides —
 * `origin: ladder-generated` lands in the page record's frontmatter (get_page), NOT in any
 * chunk text (leak-checked live: no frontmatter token appears in chunked text), and NOT via
 * the put_page `metadata` param (which the store ignores; remote source_kind is server-stamped).
 * Retrieval reads that frontmatter origin back for board disclosure; the judge never sees it.
 */
/** Adopted-page title MUST be neutral: it is now shown to the judge (A1), so it may not carry
 *  a provenance-signaling word (remediation/adopted/draft/generated). Board disclosure of
 *  provenance rides the origin/status frontmatter + board tags, not the title. */
export function adoptedTitle(id: string): string {
  return `${id} supporting document`;
}

export function cleanAdopt(
  md: string,
  meta: { id: string; title: string; created?: string; status?: DocStatus; origin?: EvidenceOrigin },
): string {
  const body = md
    .replace(/<!--[^]*?-->/g, "")                 // metadata comment
    .replace(/^#\s*DRAFT FOR OPERATOR APPROVAL.*$/gim, "")
    .replace(/^>.*$/gm, "")                        // banner blockquotes (purpose/gap-class)
    .replace(/\*\*\[added — not in corpus\]\*\*/g, "") // inline generation markers (content stays)
    .replace(/\[added — not in corpus\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^(?:\s*---\s*\n)+/, "")              // drop the draft's leading header/body rule(s)
    .trim();
  const created = meta.created ?? new Date().toISOString().slice(0, 10);
  const title = meta.title.replace(/"/g, "'");    // keep the YAML scalar simple/safe
  return buildFrontmatter({
    title,
    type: "note",
    created,
    origin: meta.origin ?? "ladder-generated",
    status: meta.status ?? "working",             // B1: adopted docs default to WORKING
    subcategory: meta.id,
  }) + body;
}

/** Serialize a flat frontmatter object to a YAML block (values quoted where needed). */
function buildFrontmatter(fm: Record<string, string>): string {
  const line = (k: string, v: string) => `${k}: ${/[:#"']/.test(v) || v.includes(" ") && k === "title" ? `"${v.replace(/"/g, "'")}"` : v}`;
  return `---\n` + Object.entries(fm).map(([k, v]) => line(k, v)).join("\n") + `\n---\n\n`;
}

const adoptedSlug = (id: string) => `${ADOPTED_SLUG_PREFIX}${id.toLowerCase()}-adopted`;

/** B7 finalize: rewrite the adopted page with status: final, all else unchanged (in place). */
export async function finalize(id: string): Promise<void> {
  const retrieval = retrievalFromEnv();
  if (!(retrieval instanceof GbrainRetrievalClient)) throw new Error("finalize: retrieval is not live gbrain.");
  const slug = adoptedSlug(id);
  const rec = await retrieval.getPageRecord(slug);
  if (!rec) throw new Error(`finalize: no adopted page at ${slug} (adopt it first)`);
  const fm = rec.frontmatter as Record<string, string>;
  const created = fm.created ? String(fm.created).slice(0, 10) : new Date().toISOString().slice(0, 10);
  const content = buildFrontmatter({
    title: String(fm.title ?? adoptedTitle(id)).replace(/"/g, "'"),
    type: String(fm.type ?? "note"),
    created,
    origin: String(fm.origin ?? "ladder-generated"),
    status: "final",
    subcategory: String(fm.subcategory ?? id),
  }) + rec.body.trim();
  await retrieval.putPage(slug, content, {});
  await retrieval.close();
  console.log(`finalized ${slug} -> status: final`);
}

function flag(args: string[], name: string): string | undefined {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
}

async function main() {
  const argv = process.argv.slice(2);

  // B7: `adopt-draft.ts --finalize <id>` flips the adopted page to status: final, in place.
  const fin = flag(argv, "--finalize");
  if (fin) { await finalize(fin); return; }

  const VALUE_FLAGS = new Set(["--status", "--origin", "--finalize"]);
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) { if (VALUE_FLAGS.has(argv[i])) i++; continue; }
    positional.push(argv[i]);
  }
  const [id, file] = positional;
  if (!id || !file) {
    console.error("usage: node scripts/adopt-draft.ts <SUBCAT> <draft-file> [--status working|final] [--origin operator-modified]");
    console.error("       node scripts/adopt-draft.ts --finalize <SUBCAT>");
    process.exit(1);
  }
  const entry = loadCriteria(SCHEMA).find((e) => e.id === id);
  if (!entry) throw new Error(`adopt: unknown subcategory ${id}`);

  // B1: adopted docs default to WORKING. B6: a re-adopt from an operator-revised file sets
  // origin: operator-modified (honest revision-history class), otherwise ladder-generated.
  const status = (flag(argv, "--status") as DocStatus) ?? "working";
  if (!["working", "final"].includes(status)) throw new Error(`adopt: bad --status ${status}`);
  const origin = (flag(argv, "--origin") as EvidenceOrigin | undefined);
  if (origin && origin !== "operator-modified" && origin !== "ladder-generated")
    throw new Error(`adopt: --origin must be operator-modified or ladder-generated (got ${origin})`);

  // 07/18 INVARIANT (universal, any gap class): a PLAN-mode draft is a gap-closure plan, NOT the
  // target document. Adopting it would ingest a plan as corpus evidence and let it MOVE the grade.
  // Plans are working records only and NEVER flip a tile — refuse ingestion here, hard, beside the
  // gap-class flip rules.
  const rawMd = readFileSync(file, "utf8");
  if (isPlanMode(parseDraftMeta(rawMd))) {
    console.error(
      `adopt REFUSED: ${id} draft is PLAN mode. A gap-closure plan never flips a tile (zero grade ` +
      `movement, any gap class). Approve it as WORKING; it is a working record, not ingestible evidence.`,
    );
    process.exit(2);
  }
  const clean = cleanAdopt(rawMd, { id: entry.id, title: adoptedTitle(entry.id), status, origin });
  const cleanFile = file.replace(/\.md$/, ".ADOPTED.md");
  writeFileSync(cleanFile, clean + "\n", "utf8");
  console.log(`clean adopted document -> ${cleanFile}`);

  const retrieval = retrievalFromEnv();
  if (retrieval.kind !== "gbrain") throw new Error("adopt: retrieval is not live gbrain; refusing to ingest.");

  // Ingest via put_page. Provenance (origin) AND lifecycle (status) ride the document's
  // FRONTMATTER, not the metadata param (the store ignores it; remote source_kind is
  // server-stamped). Retrieval reads them back from the page frontmatter for board disclosure;
  // neither enters judge context (provenance.ts). B6: re-adopting the SAME id rewrites the SAME
  // slug in place (put_page upsert) — content is re-indexed, no duplicate page.
  const slug = adoptedSlug(id);
  await (retrieval as any).putPage?.(slug, clean, {});
  console.log(`ingested as ${slug} (origin: ${origin ?? "ladder-generated"}, status: ${status}, in frontmatter)`);

  // Single-tile re-judge, full pipeline.
  const judge = new Judge(judgeConfigFromEnv());
  const log = await retrieval.ingestLog();
  assertIngestLogUsable(log);
  const run = await runWithExhaustion(entry, retrieval, judge, log);
  if (retrieval instanceof GbrainRetrievalClient) await retrieval.close();
  console.log(`re-judged ${id}: ${run.verdict.state}`);
  console.log(JSON.stringify({ id, state: run.verdict.state, conditionApplied: run.verdict.conditionApplied }, null, 2));
}

if (process.argv[1] && process.argv[1].endsWith("adopt-draft.ts")) {
  main().catch((e) => { console.error("adopt FAILED:", e.message); process.exit(1); });
}
