/**
 * Draft approval metadata + guard (board remediation flow). Shared by board-server.ts and the
 * unit check. A draft's approvability is decided ENTIRELY by its metadata header:
 *   <!-- REMEDIATION DRAFT — metadata ... gap_class: ... flippable: ... -->
 * A draft with no header (legacy hand-authored drafts) parses to {} and is NOT approvable —
 * that default is correct (an un-classed draft must not flip a tile).
 */

/** Parse the `<!-- REMEDIATION DRAFT — metadata ... -->` header into a flat key/value map. */
export function parseDraftMeta(md: string): Record<string, string> {
  const m = md.match(/<!--\s*REMEDIATION DRAFT[^]*?-->/);
  const out: Record<string, string> = {};
  if (m) for (const line of m[0].split("\n")) { const kv = line.match(/^\s*([a-z_]+):\s*(.+)$/); if (kv) out[kv[1]] = kv[2].trim(); }
  return out;
}

/**
 * Structural approvability guard (approve-as-WORKING). Approvable when EITHER:
 *   - plan mode: a gap-closure plan is approvable as WORKING for ANY gap class (it never flips a
 *     tile; adoption is a working record only), OR
 *   - artifact mode: the classic doctrine — gap_class artifact-sufficient AND flippable true.
 * A draft with an absent/unknown class (empty meta, mode absent) falls to the artifact rule and is
 * NOT approvable unless artifact-sufficient — the correct default. (07/18 mode matrix.)
 */
export function isPlanMode(meta: Record<string, string>): boolean {
  return meta.mode === "plan";
}

export function isApprovable(meta: Record<string, string>): boolean {
  if (isPlanMode(meta)) return true; // plan: approvable as working, any class (never flips)
  return meta.gap_class === "artifact-sufficient" && meta.flippable === "true";
}

/**
 * approve-as-FINAL guard (07/18 invariants). Final requires:
 *   - a flip-eligible artifact draft (never plan — plan is working + never flips), AND
 *   - professional_review resolved: none, OR an attestation is on record (reviewer type + date in
 *     the approval log). Until then finalize is blocked with "requires attorney/HR review".
 */
export function approveFinalAllowed(meta: Record<string, string>, attested: boolean): boolean {
  if (isPlanMode(meta)) return false;                       // plan: working + never final
  if (!(meta.gap_class === "artifact-sufficient" && meta.flippable === "true")) return false;
  const pr = meta.professional_review ?? "none";
  return pr === "none" || attested;
}
