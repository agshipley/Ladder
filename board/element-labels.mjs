// element-labels.mjs — view-layer display names for element_findings labels.
// The stored labels come from the loader's mechanical extractor and are mostly clean;
// a handful are mangled where the criterion prose nests parens/brackets. This is a
// VIEW-LAYER fix (the run store stays as the judge echoed it): a hand-tuned override
// map for the mangled few, plus a general shortener (strip bracket spans, drop a leading
// article, cap length) for sub-tile display. Full raw label goes in the tooltip.

const OVERRIDES = {
  "An 83": "83(b) administration record",
  "Use": "Use / adoption posture",
  "An enterprise-scoped, long-horizon": "Enterprise-scoped, long-horizon strategy",
  "above.]": "Certification-posture match (per a–c)",
};

/** Short display label for an element sub-tile. Pass the raw stored element string. */
export function elementLabel(raw) {
  const r = String(raw ?? "").trim();
  if (OVERRIDES[r]) return OVERRIDES[r];
  let s = r
    .replace(/\s*\[[^\]]*\]\s*$/g, "") // strip a trailing bracketed span (R7 hygiene)
    .replace(/\s+/g, " ")
    .replace(/[.\s]+$/, "")
    .trim();
  s = s.replace(/^(?:A|An|The)\s+/, ""); // drop leading article for compactness
  if (s.length > 60) s = s.slice(0, 57).replace(/\s\S*$/, "") + "…";
  return s || r;
}
