// missing.mjs — derive the "Expected but not found" (missing elements) for a verdict.
// Shared by build-data.mjs (React board) and build-review-html.mjs (static export) so
// the derivation is identical in both. VIEW-LAYER derivation: the runs-of-record store
// stays pristine (verdict + rationale as captured); `missing` is computed from the
// stored rationale, never fabricated.
//
// Provenance:
//   "judge-reported"          — the record already carries missingElements (forward runs,
//                               from the extended judge output contract).
//   "derived-from-rationale"  — extracted mechanically from the stored rationale.
//   null (+ missing:null)     — thin/absence verdict with no rationale THIS run
//                               (renders "not captured this run"); or a satisfied verdict
//                               (no missing block at all).

const LEAD = /^(?:evidence of|retrieved|identifiable|explicit|maintained|any|a|an)\s+/i;
const TRIGGER = /\b(no|without|unevidenced|not present|incomplete|fragmentary|not found)\b/i;

function cleanItem(s) {
  let t = s.trim();
  t = t.replace(/\bis (?:present|incomplete|unevidenced)\b.*$/i, "").trim(); // strip positive/meta tails
  t = t.replace(/[.;,]+$/, "").trim();
  t = t.replace(LEAD, "").trim();
  return t;
}

// Extract the criterion elements a rationale says are unevidenced. Sentence-scoped so
// trailing narrative ("The only chunks…") never bleeds into an item.
function extractFromRationale(rat) {
  const items = [];
  for (const sentence of rat.split(/(?<=\.)\s+/)) {
    if (!TRIGGER.test(sentence)) continue;
    // The missing list usually follows a ":" or a "but/however".
    let part = sentence;
    const colon = part.match(/:\s*(.+)$/);
    if (colon) part = colon[1];
    const but = part.match(/\b(?:but|however)\b[,:]?\s*(.+)$/i);
    if (but) part = but[1];
    for (let seg of part.split(/,\s*|;\s*|\band\b/i)) {
      seg = seg.trim().replace(/^there (?:is|are)\s+/i, "");
      const m = seg.match(/^(?:no|without)\s+(.+)$/i);
      if (!m) continue;
      const item = cleanItem(m[1]);
      if (item.length > 3 && !/^(?:so the|the only|evidence exists)/i.test(item)) items.push(item);
    }
  }
  return [...new Set(items)];
}

/** Returns { missing: string[]|null, provenance: string|null }. */
export function deriveMissing(record) {
  const isThinAbsence = record.state === "thin" || /absence/.test(record.state);
  if (!isThinAbsence) return { missing: null, provenance: null };

  // Forward path: judge reported it directly.
  if (Array.isArray(record.missingElements)) {
    return { missing: record.missingElements, provenance: "judge-reported" };
  }

  const rat = (record.rationale || "").trim();
  if (!rat) return { missing: null, provenance: null }; // not captured this run

  const items = extractFromRationale(rat);
  return items.length
    ? { missing: items, provenance: "derived-from-rationale" }
    : { missing: null, provenance: null };
}
