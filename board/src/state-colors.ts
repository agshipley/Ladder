// STATE-PROJECTION CONFIG — the single mapping from a classifier state to how a
// tile renders. This is CONFIG, not code logic: it WILL change at 9E-b when the
// ruled state vocabulary is exercised against real corpora. Nothing else in the
// board decides tile appearance from a state string; it all routes through here.
//
// Contract (from Task 4): unknown states never crash and never silently render
// green — they fall through to UNKNOWN (amber + literal state text).

export interface StateProjection {
  /** Palette key -> CSS class `tile--<swatch>` / `dot--<swatch>` (see styles.css). */
  swatch: "green" | "red" | "gray" | "neutral" | "info" | "loop" | "amber";
  /** Display label override. Omit to show the raw state string. */
  label?: string;
  /** True = a scored maturity color (green/red). False = a non-scoring state. */
  scored: boolean;
  /** Render as a badge/overlay rather than a scored tile color. */
  badge?: boolean;
  /** Category-level overlay (not a per-subcategory tile), e.g. loop-ready. */
  categoryOverlay?: boolean;
}

// Labels are CUSTOMER-REGISTER (VOICE-DISCIPLINE.md): plain language, no internal
// jargon ("genuine-absence", "not-ingested", "informational") on any board surface.
export const STATE_COLORS: Record<string, StateProjection> = {
  "evidence-found": { swatch: "green", label: "In place", scored: true },
  thin: { swatch: "amber", label: "Needs work", scored: true },
  "genuine-absence": { swatch: "red", label: "Missing", scored: true },
  "not-ingested": { swatch: "gray", label: "We couldn't see it", scored: false },
  "documented-n-a": { swatch: "neutral", label: "Doesn't apply", scored: false },
  placeholder: { swatch: "neutral", label: "Held separately", scored: false },
  informational: { swatch: "info", label: "FYI", scored: false, badge: true },
  "loop-ready": { swatch: "loop", label: "Ready", scored: false, badge: true, categoryOverlay: true },
};

/** Fallthrough for any state not in the config. Amber + literal text; never green. */
export const UNKNOWN_STATE: StateProjection = { swatch: "amber", scored: false };

/** Distinct from every verdict state: a subcategory with no record in the run. */
export const NOT_EVALUATED: StateProjection = {
  swatch: "neutral",
  label: "Not yet checked",
  scored: false,
};

export function projectState(state: string): { proj: StateProjection; isUnknown: boolean } {
  const proj = STATE_COLORS[state];
  return proj ? { proj, isUnknown: false } : { proj: UNKNOWN_STATE, isUnknown: true };
}
