import { spawnSync } from "node:child_process";
import type { CriterionEntry } from "./types.ts";

/**
 * loadCriteria — THE ONLY schema-coupled surface in this harness.
 *
 * Reads the ruled CRITERIA-SCHEMA.yaml (9E-a Pass C schema, populated at 9E-b;
 * SOLE NORMATIVE COPY), assembles the definitions closure for each entry from its
 * `references` (fidelity position §4), applies STATE-REACH to derive the judge's
 * reachable-state enum, and returns CriterionEntry[]. Signature is the contract;
 * callers never change and never inspect the YAML shape.
 *
 * INFRA note: YAML is parsed by shelling out to the already-present python3+PyYAML
 * (proven throughout 9E-b) rather than adding an npm yaml dependency — no new
 * provider, egress, cost, or env var. Parse is in-memory; nothing is written.
 *
 * Any unresolvable reference, any off-vocabulary declared state, or an entry that
 * reaches no judge-emittable state is a LOUD FAIL at load — the harness never runs
 * against a silently-degraded work list.
 */

// STATE-REACH: states that are board-derived / never judge-emitted. Filtered out of
// every entry's reachable enum so the judge is never offered them (per the ruled
// STATE-REACH rule: loop-ready is a projection over prerequisite entries, not a verdict).
const BOARD_DERIVED_STATES = new Set<string>(["loop-ready"]);

const ID_RE = /^[A-Z]+-\d{2}$/;

/** Clean one raw element segment into a concise clerk-decidable label. */
function cleanElement(seg: string): string {
  let s = seg.replace(/\s+/g, " ").trim().replace(/^\([a-z]\)\s*/i, "");
  const bold = s.match(/^\*\*(.+?)\*\*/);
  let label = (bold ? bold[1] : s).replace(/\*\*/g, "").replace(/`/g, "");
  label = label.split(/\s+[—–]\s+|\s+--\s+|\.\s|:\s|\s*\(|\s*\[/)[0].trim();
  return label.replace(/[;:,.]+$/, "").trim().slice(0, 90);
}

/**
 * Extract a criterion's element list from its prose structure (Board-v3.5, element-grain
 * contract): lettered "(a)…(b)…" runs, else top-level bullets, else a single implicit
 * element. Purely mechanical (clerk-decidable) — no YAML field, no schema change.
 */
function extractElements(criterion: string): string[] {
  const letters = [...criterion.matchAll(/\(([a-z])\)\s/g)];
  const seq = letters.map((m) => m[1]);
  let raw: string[];
  if (seq.length >= 2 && seq[0] === "a" && seq[1] === "b") {
    raw = letters.map((m, i) => {
      const start = m.index!;
      const end = i + 1 < letters.length ? letters[i + 1].index! : criterion.length;
      return cleanElement(criterion.slice(start, end));
    });
  } else {
    const bullets = criterion
      .split("\n")
      .filter((l) => /^\s*[-*]\s+/.test(l))
      .map((l) => cleanElement(l.replace(/^\s*[-*]\s+/, "")));
    raw = bullets.length
      ? bullets
      : [cleanElement(criterion.trim().split(/\.\s/)[0]) || "the criterion as a whole"];
  }
  const seen = new Set<string>();
  const out: string[] = [];
  for (const e of raw) if (e && e.length > 2 && !seen.has(e)) { seen.add(e); out.push(e); }
  return out.length ? out : ["the criterion as a whole"];
}

interface RawEntry {
  id: string;
  criterion: string;
  state: string[];
  grain: string;
  conditionality?: string;
  references: string[];
  signals: string[];
  provenance?: string;
  refresh?: string[];
  version?: string;
}
interface RawDoc {
  definitions: {
    state_vocabulary: string[];
    conditionality_classes: Record<string, unknown>;
    triggers: Record<string, { rule?: string } & Record<string, unknown>>;
    derivations: Record<string, { rule?: string } & Record<string, unknown>>;
    rollup: { precedence?: string };
    rulings: Record<string, string>;
    thread_types: Record<string, string>;
    provenance_tags: string[];
  };
  categories: Record<string, { subcategories: RawEntry[] }>;
}

function parseYaml(criteriaPath: string): RawDoc {
  const py =
    "import yaml,json,sys; json.dump(yaml.safe_load(open(sys.argv[1],encoding='utf-8')), sys.stdout)";
  const r = spawnSync("python3", ["-c", py, criteriaPath], {
    encoding: "utf-8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    throw new Error(
      `loadCriteria: YAML parse failed for ${criteriaPath} (python3+PyYAML exit ${r.status}):\n${r.stderr}`,
    );
  }
  return JSON.parse(r.stdout) as RawDoc;
}

/**
 * Assemble the operative text of every referenced definition (resolution closure,
 * fidelity position §4). Each reference token belongs to exactly one of the four
 * ruled classes (JC-1): B-number ruling, T-code thread type, trigger/derivation key,
 * or entry id. Any token that resolves to none of them is a loud fail.
 */
function assembleClosure(entry: RawEntry, doc: RawDoc, allIds: Set<string>): string {
  const d = doc.definitions;
  const lines: string[] = [];
  for (const tok of entry.references) {
    if (Object.prototype.hasOwnProperty.call(d.rulings, tok)) {
      lines.push(`${tok} (ruling): ${d.rulings[tok]}`);
    } else if (Object.prototype.hasOwnProperty.call(d.thread_types, tok)) {
      lines.push(`${tok} (thread type): ${d.thread_types[tok]}`);
    } else if (Object.prototype.hasOwnProperty.call(d.triggers, tok)) {
      const t = d.triggers[tok];
      lines.push(`${tok} (trigger): ${renderDefObj(t)}`);
    } else if (Object.prototype.hasOwnProperty.call(d.derivations, tok)) {
      const t = d.derivations[tok];
      lines.push(`${tok} (derivation): ${renderDefObj(t)}`);
    } else if (ID_RE.test(tok) && allIds.has(tok)) {
      // Entry-id cross-reference: a pointer, not an inlined criterion. The judge is
      // told the linkage exists (multi-homing / prerequisite) without re-scoring it.
      lines.push(`${tok} (cross-reference to reference-model entry ${tok})`);
    } else {
      throw new Error(
        `loadCriteria: entry ${entry.id} references "${tok}" which resolves to no ruled ` +
          `definition (not a B-ruling, T-thread-type, trigger, derivation, or known entry id). ` +
          `LINT-1 closure violation — refusing to load.`,
      );
    }
  }
  return lines.length ? lines.join("\n") : "(no referenced definitions for this entry)";
}

function renderDefObj(obj: { rule?: string } & Record<string, unknown>): string {
  if (typeof obj === "string") return obj;
  const parts: string[] = [];
  if (obj.rule) parts.push(String(obj.rule));
  for (const [k, v] of Object.entries(obj)) {
    if (k === "rule") continue;
    if (typeof v === "string") parts.push(`(${k}: ${v})`);
  }
  return parts.join(" ");
}

export function loadCriteria(criteriaPath: string): CriterionEntry[] {
  const doc = parseYaml(criteriaPath);
  const vocab = new Set(doc.definitions.state_vocabulary);
  // The ruled rollup precedence is carried ONCE in the schema and handed to every
  // entry. Absent it the judge would fall back to a free-hand rollup — the exact
  // defect this governs — so a missing block is a loud fail, not a silent default.
  const rollupPrecedence = doc.definitions.rollup?.precedence;
  if (!rollupPrecedence) {
    throw new Error(
      "loadCriteria: definitions.rollup.precedence is missing from the schema. " +
        "The subcategory rollup is ruled, not free-hand — refusing to load.",
    );
  }
  const allIds = new Set<string>();
  for (const cat of Object.values(doc.categories)) {
    for (const e of cat.subcategories) allIds.add(e.id);
  }

  const out: CriterionEntry[] = [];
  for (const cat of Object.values(doc.categories)) {
    for (const e of cat.subcategories) {
      // STATE-REACH: validate every declared state is in the single vocabulary, then
      // filter out board-derived states to get the judge's reachable enum.
      for (const s of e.state) {
        if (!vocab.has(s)) {
          throw new Error(
            `loadCriteria: entry ${e.id} declares state "${s}" absent from ` +
              `state_vocabulary. LINT-3 violation — refusing to load.`,
          );
        }
      }
      const stateEnum = e.state.filter((s) => !BOARD_DERIVED_STATES.has(s));
      if (stateEnum.length === 0) {
        throw new Error(
          `loadCriteria: entry ${e.id} reaches no judge-emittable state after ` +
            `STATE-REACH. Refusing to load.`,
        );
      }
      out.push({
        id: e.id,
        criterion: e.criterion,
        signals: e.signals ?? [],
        stateEnum,
        grain: e.grain,
        conditionality: e.conditionality,
        references: e.references ?? [],
        provenance: e.provenance,
        definitionsClosure: assembleClosure(e, doc, allIds),
        elements: extractElements(e.criterion),
        rollupPrecedence,
      });
    }
  }
  return out;
}
