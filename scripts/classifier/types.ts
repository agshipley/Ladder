// Core types for the maturity classifier harness (Sprint Ma Task 2).
//
// Everything here is schema-INDEPENDENT except CriterionEntry, which is produced
// by loader.ts — the single schema-coupled surface. Downstream code treats a
// CriterionEntry as opaque: it never decomposes the criterion or inspects the
// shape of the (future) CRITERIA.yaml. When the ruled schema lands (9E-a Pass C /
// 9E-b), only loader.ts changes.

/** A state label. Constrained per-entry at judge time by CriterionEntry.stateEnum. */
export type ClassifierState = string;

/**
 * One subcategory's evaluable unit, as handed to the harness by the loader.
 * Field set mirrors the ruled fidelity position (reference-model/CRITERIA-YAML-FIDELITY.md
 * §2): verbatim-normative prose + structured handles. Shape is TBD and owned by
 * loader.ts; do not depend on it anywhere else.
 */
export interface CriterionEntry {
  /** Subcategory id, e.g. "GTM-03". */
  id: string;
  /** Verbatim-normative criterion prose. Never translated into fields, never decomposed. */
  criterion: string;
  /** Non-normative retrieval/exhaustion terms. NOT used to render a verdict (see exhaustion.ts). */
  signals: string[];
  /** The full ruled-state enum for THIS entry. Drives the judge's constrained output. */
  stateEnum: ClassifierState[];
  /** Detection grain, machine-carried (e.g. "whole-artifact" on COMP entries). */
  grain: string;
  /** Conditionality class, if any (B-22 conditional, documented-n/a, etc.). */
  conditionality?: string;
  /** Cross-references by registry number (B-n, T-codes) for definitions closure. */
  references: string[];
  /** Provenance tag (authority-backed / expert-authored / corpus-observed). */
  provenance?: string;
  /**
   * Operative text of every referenced definition, assembled by the harness
   * (resolution closure — fidelity position §4). Empty string if no references.
   */
  definitionsClosure: string;
  /**
   * Element list mechanically extracted from the criterion prose at load time
   * (clerk-decidable bullet/lettered boundaries). A single implicit element when the
   * prose has no internal structure. NOT a schema field — derived; drives the judge's
   * element_findings echo and the board's per-element checklist.
   */
  elements: string[];
  /**
   * Ruled rollup precedence (definitions.rollup.precedence — SOLE NORMATIVE COPY in
   * CRITERIA-SCHEMA.yaml). Governs how the subcategory state derives from element
   * findings: dispositions dominate, conditions scope the element set, and the rollup
   * runs over in-scope scored elements only. Identical for every entry in a run.
   */
  rollupPrecedence: string;
}

/** One element's finding within a subcategory verdict (element-grain output contract). */
export interface ElementFinding {
  element: string; // echoed from CriterionEntry.elements, never invented
  state: "satisfied" | "thin" | "absent";
  evidenceChunkIds: string[];
}

/** A retrieved corpus chunk — the unit of evidence attribution. */
export interface Chunk {
  /** Chunk id (the attribution unit written into results). */
  id: string;
  pageId?: string;
  text: string;
  score?: number;
  /** Document title, resolved from the store's search row at retrieval time (B1). Empty
   *  string when the store carries none. Never derived from chunk text downstream. */
  title?: string;
  /** Document slug/path, resolved from the store's search row (B1). The human-facing
   *  document handle for source-document attribution (B2). */
  slug?: string;
  /**
   * Provenance class of this evidence (firewall, 2026-07-16). Closed enum; absent =
   * company-native. STRIPPED from judge context (blindness) and DISCLOSED at the board.
   * Never interpolated into judge-visible text — see provenance.ts.
   */
  origin?: EvidenceOrigin;
  /**
   * Document lifecycle status of an adopted page (2026-07-16). Absent = not an adopted
   * lifecycle document (treat as final/native). Like `origin`: read from page frontmatter
   * for adopted slugs, DISCLOSED at the board (working-draft badge + panel), and STRIPPED
   * from judge context — the judge never learns a document's lifecycle status.
   */
  status?: DocStatus;
}

/** Closed provenance enum (GAP-CLASS-DOCTRINE firewall addendum). Absent field = company-native. */
export type EvidenceOrigin =
  | "company-native"
  | "ladder-generated"
  | "external-template"
  | "operator-modified"
  | "post-intervention-natural";

/** Adopted-document lifecycle status. Absent = not a tracked working document. */
export type DocStatus = "working" | "final";

/** The judge's decision for one entry. `state` must be a member of the entry's stateEnum. */
export interface JudgeResult {
  state: ClassifierState;
  conditionApplied: string | null;
  evidenceChunkIds: string[];
  rationale?: string;
  /** Criterion elements required at this grain but not evidenced (the delta). Empty
   *  when satisfied. Part of the ruled output contract (not the criterion or state enum). */
  missingElements: string[];
  /** Per-element findings (element-grain contract). One per CriterionEntry element. */
  elementFindings: ElementFinding[];
}

/** One append-only results record. The board reads these; it never calls the judge. */
export interface ResultRecord {
  criterionId: string;
  state: ClassifierState;
  conditionApplied: string | null;
  evidenceChunkIds: string[];
  runId: string;
  model: string;
  effort: string | null;
  timestamp: string; // ISO 8601
  // Persisted so a reconstruction from the store is lossless (board-v3 audit finding:
  // rationale was previously in-memory only and lost on the pre-crash board run).
  rationale: string | null;
  missingElements: string[];
  elementFindings: ElementFinding[];
}
