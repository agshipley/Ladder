# Golden Fixtures — DEFERRED (9E-b fixture review, 2026-07-11)

Fixtures set aside at the operator's fixture-by-fixture review. Not in the
landed set (scripts/classifier/fixtures/golden-fixtures.jsonl); recorded here
so the intent is not lost.

## FX-32 — CUT (PEOPLE-03 onboarding-vs-Vision inconsistency)
Scenario: onboarding content that contradicts the Vision mission artifacts →
present-with-inconsistency-flag. CUT from the golden set: onboarding-vs-Vision
contradiction is a CROSS-ENTRY inconsistency detection (PEOPLE-03 vs the Vision
corpus), which the fixture assertion rule + single-entry call shape do not
exercise (fidelity §2 non-assumption: inconsistency detection needs a different
call shape than the one-call-per-subcategory absence/thinness model). Revisit
when the cross-entry inconsistency call shape is built (not this task).

## FX-39 — board-test note (LEGAL-04 flag-must-render)
The original FX-39 asserted that a securities-compliance flag MUST render on a
financing event — "a SAFE closing with no securities-compliance flag rendered is
a board bug, not a company gap." That is a BOARD / harness rendering test
(does the tile activate its standing-requirement flag on a detected financing
event?), not a criterion-verdict fixture the judge emits. Deferred to the board
test suite. (The criterion-verdict side of LEGAL-04 is covered by landed FX-39
[priced-round → genuine-absence] and FX-40b [convertible → informational].)
