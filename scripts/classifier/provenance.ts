import type { Chunk, EvidenceOrigin } from "./types.ts";

/**
 * Provenance firewall (GAP-CLASS-DOCTRINE addendum, RULED 2026-07-16).
 *
 * The judge must be BLIND to evidence provenance: it never learns whether a corpus
 * entry is company-native, Ladder-generated, externally templated, or operator-
 * modified. "Sees provenance but doesn't misuse it" is unverifiable for an LLM judge;
 * blindness is testable (the paired blindness fixtures).
 *
 * This module is the single strip point. EVERY assembly of evidence into judge context
 * — board runs AND fixture runs — routes through toJudgeEvidence(), which drops `origin`
 * (and any provenance-class metadata) and asserts loudly if it would ever reach the
 * judge. Provenance is preserved OUTSIDE judge context for board-layer disclosure.
 */

export const ORIGINS: readonly EvidenceOrigin[] = [
  "company-native",
  "ladder-generated",
  "external-template",
  "operator-modified",
  "post-intervention-natural",
] as const;

const ORIGIN_SET = new Set<string>(ORIGINS);
export const DEFAULT_ORIGIN: EvidenceOrigin = "company-native";

/** The provenance class of a chunk (absent field = company-native). */
export function originOf(c: Chunk): EvidenceOrigin {
  return c.origin && ORIGIN_SET.has(c.origin) ? c.origin : DEFAULT_ORIGIN;
}

/**
 * The ONLY shape the judge may see: an OPAQUE per-run index + title + score + text.
 * No `pageId`/`slug` (A1, 2026-07-16 ruling — the slug `remediation/<id>-adopted` signalled
 * adoption to the judge), no `origin`, no `status`. The id is a per-run token (`e1`, `e2`, …),
 * NOT the store chunk id, so it can never encode a slug; the caller decodes it back to the
 * real chunk id for the RECORD (which keeps the true slug for board/disclosure).
 */
export interface JudgeVisibleChunk {
  id: string;
  title?: string;
  score?: number;
  text: string;
}

/** Metadata keys that must NEVER reach judge context (structural strip). */
const FORBIDDEN_KEYS = ["pageId", "slug", "origin", "status"] as const;
/** Signaling tokens that must not appear in judge-visible LOCATORS (id/title). */
export const SIGNAL_RE = /remediation|adopted|draft|generated/i;

/**
 * Project chunks to judge-visible form, STRIPPING provenance and lifecycle status and
 * REPLACING the id with an opaque per-run index. Enforced structurally: the projection
 * carries none of FORBIDDEN_KEYS, and its id is a bare `e<n>` token that cannot match
 * SIGNAL_RE. Title/text pass through as content (a company document legitimately titled
 * "…Draft…" is content, not provenance — the value-level SIGNAL_RE assertion is applied to
 * the id and to adopted-document titles in the unit check, on live-shaped data). Order is
 * preserved 1:1 so the caller can zip `e<n>` back to the real chunk id.
 */
export function toJudgeEvidence(chunks: Chunk[]): JudgeVisibleChunk[] {
  return chunks.map((c, i) => {
    const v: JudgeVisibleChunk = { id: `e${i + 1}`, title: c.title || undefined, score: c.score, text: c.text };
    for (const k of FORBIDDEN_KEYS) {
      if (k in (v as Record<string, unknown>) && (v as Record<string, unknown>)[k] !== undefined) {
        throw new Error(`provenance firewall: ${k} leaked into judge context for chunk ${c.id}`);
      }
    }
    if (SIGNAL_RE.test(v.id)) {
      throw new Error(`provenance firewall: opaque id "${v.id}" signals provenance`);
    }
    return v;
  });
}

/** The opaque-index -> real-chunk-id map for one evidence set (caller decodes cited ids). */
export function judgeIdDecoder(chunks: Chunk[]): Map<string, string> {
  return new Map(chunks.map((c, i) => [`e${i + 1}`, c.id]));
}
