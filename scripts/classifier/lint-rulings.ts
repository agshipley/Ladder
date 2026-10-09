import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

/**
 * B9 — rulings-integrity lint (permanent). Every definitions.rulings entry in
 * CRITERIA-SCHEMA.yaml MUST be byte-identical to the corresponding B-n operative
 * text in TAXONOMY.md §2 (the single normative source; the schema "carries it ONCE").
 *
 * This exists because 14 of 29 rulings were silently truncated at ~300 chars at
 * population (2026-07-16 finding), corrupting the judge closure of 46/83 entries.
 * The invariant is now enforced so truncation or drift fails loudly.
 *
 * REGISTERED EXCEPTION: exactly B-11. Its schema text legitimately appends a v1.2
 * exclusion-class->placeholder MAPPING annotation not present in TAXONOMY; for B-11
 * the rule relaxes to "TAXONOMY body must be a PREFIX of the schema text".
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCHEMA = join(__dirname, "..", "..", "reference-model", "CRITERIA-SCHEMA.yaml");
const TAXONOMY = join(__dirname, "..", "..", "reference-model", "TAXONOMY.md");
const PREFIX_EXCEPTIONS = new Set(["B-11"]);

function schemaRulings(): Record<string, string> {
  const py = "import yaml,json,sys; d=yaml.safe_load(open(sys.argv[1],encoding='utf-8')); json.dump(d['definitions']['rulings'], sys.stdout)";
  const r = spawnSync("python3", ["-c", py, SCHEMA], { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`lint-rulings: YAML parse failed:\n${r.stderr}`);
  return JSON.parse(r.stdout);
}

/** Parse TAXONOMY.md §2 B-n entries (paragraph-aware; entries may span lines). */
function taxonomyRulings(): Record<string, string> {
  const lines = readFileSync(TAXONOMY, "utf-8").split("\n");
  const hdr = /^(?:-\s*\*\*)?B-(\d+)\s*\(ruled[^)]*\)\.\s*(?:\*\*)?\s*(.*)$/;
  const sectionOrHdr = (s: string) => /^\d+\.\s|^##\s/.test(s.trim()) || hdr.test(s.trim());
  const out: Record<string, string> = {};
  let cur: string | null = null;
  let buf: string[] = [];
  const flush = () => { if (cur) out[cur] = buf.join(" ").replace(/\s+/g, " ").trim(); };
  for (const ln of lines) {
    const m = ln.trim().match(hdr);
    if (m) { flush(); cur = `B-${m[1]}`; buf = [m[2]]; }
    else if (cur !== null) {
      if (ln.trim() === "" || sectionOrHdr(ln)) { flush(); cur = null; buf = []; }
      else buf.push(ln.trim());
    }
  }
  flush();
  return out;
}

function main() {
  const schema = schemaRulings();
  const tax = taxonomyRulings();
  const failures: string[] = [];
  for (const [k, s] of Object.entries(schema)) {
    const t = tax[k];
    if (t === undefined) { failures.push(`${k}: present in schema, not parseable from TAXONOMY.md §2`); continue; }
    if (PREFIX_EXCEPTIONS.has(k)) {
      if (!s.startsWith(t)) failures.push(`${k} (prefix exception): TAXONOMY body is NOT a prefix of the schema text`);
      continue;
    }
    if (s !== t) {
      const why = s.length !== t.length ? `length ${s.length} vs ${t.length}${t.startsWith(s.replace(/\.*$/, "")) ? " (schema TRUNCATED)" : ""}` : "content drift at equal length";
      failures.push(`${k}: schema != TAXONOMY (${why})`);
    }
  }
  if (failures.length) {
    console.error(`RULINGS-INTEGRITY LINT: FAIL (${failures.length})`);
    for (const f of failures) console.error(`  ${f}`);
    process.exit(1);
  }
  console.log(`RULINGS-INTEGRITY LINT: PASS — ${Object.keys(schema).length} rulings byte-identical to TAXONOMY.md §2 (exception: ${[...PREFIX_EXCEPTIONS].join(", ")} prefix).`);
}

main();
