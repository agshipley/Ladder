// Board-side view types (v2). The board reads a committed run of record produced by
// scripts/classifier/run-board.ts; it never calls the judge or runs an evaluation.

export interface CitedChunk {
  id: string;
  slug: string | null;
  title: string;
  gist: string;
  score: number | null;
  /** Provenance disclosure (firewall): present only when NOT company-native. */
  origin?: string;
  /** Lifecycle disclosure: "working" | "final" for adopted documents; absent otherwise. */
  status?: string;
}

export interface ElementFinding {
  element: string;
  state: "satisfied" | "thin" | "absent";
  evidenceChunkIds: string[];
}

export interface BoardRecord {
  id: string;
  category: string;
  name: string; // run-time derived name (superseded on tiles by DISPLAY_NAMES)
  state: string;
  conditionApplied: string | null;
  rationale: string | null;
  citedChunks: CitedChunk[];
  searchCount: number;
  sweepRan: boolean;
  sweepNewCount: number;
  sweepEscalatedFlip: boolean;
  absenceNote: string | null;
  emptyRetrieval: boolean;
  reconstructed: boolean;
  // Derived at build time (view-layer): the criterion elements found unevidenced.
  missing: string[] | null;
  missingProvenance: "judge-reported" | "derived-from-rationale" | null;
  elementFindings?: ElementFinding[];
}

export interface DocIndexEntry {
  key: string;
  title: string | null;
  slug: string | null;
  label: string;
  verdicts: { id: string; state: string }[];
}

export interface SchemaSubcategory {
  id: string;
  criterion: string; // full normative prose (markdown)
  conditionality: string | null;
  provenance: string | null;
}

export interface SchemaCategory {
  key: string;
  name: string;
  subcategories: SchemaSubcategory[];
}

export interface RunStats {
  runId: string;
  model: string;
  generatedAt: string;
  total: number;
  stateDistribution: Record<string, number>;
  tokens: { input: number; output: number; judgeCallsThisInvocation?: number };
  resume?: { judgedThisInvocation: number; reconstructed: number; skipped: number };
  anomalies: { emptyRetrievals: string[]; sweepEscalationFlips: string[]; judgeRetries: number };
}

export interface LeverageRef { item: number; name: string; }
export interface LeverageBlock { gates: LeverageRef[]; caveats: LeverageRef[]; available_supports: LeverageRef[]; }
export interface BoardData {
  generatedAt: string;
  categories: SchemaCategory[];
  run: {
    source: string;
    file: string | null;
    stats: RunStats | null;
    records: BoardRecord[];
    documentIndex?: DocIndexEntry[];
  };
  /** Leverage integration: per-subcategory menu relationships (from the emitted leverage-links JSON). */
  leverage?: { menu_url: string; resolution: string | null; links: Record<string, LeverageBlock> } | null;
}
