Reference-Model Lifecycle

Status: v0.1 (2026-07-09) · Living document
Governs: everything that happens to the reference model AFTER a category
lands — amendments, refreshes, structural changes, calibration feedback,
and the thread types that perform them. Creation of new categories is
governed by RESEARCH-PROTOCOL.md; the two documents have disjoint
jurisdictions and cross-reference each other in one line each.
Maintenance rule: any commit that lands a lifecycle-procedure change MUST
include a change-log entry in this file (same rule as the PROTOCOL).

1. Thread taxonomy

Every research-side thread declares its type in its first message and at
the top of any transition or landing artifact it produces. A thread loads
ONLY its stated working set (repo as sole courier; operator paste or
verbatim CC extraction per PROTOCOL Sec. 13). CC-mechanical turns (CL-1
below) are not threads and need no declaration.

TypeNameGoverned byWorking set (pasted)ProducesT-1Creation runRESEARCH-PROTOCOLPROTOCOL + TAXONOMY + transition briefCategory brief, rulings, landing prompt, next transition briefT-2Amendment threadLIFECYCLE Sec. 3 (CL-2/CL-4)LIFECYCLE + TAXONOMY + target BRIEF.mdAmendment package: brief v1.n edit + coupled updatesT-3Refresh threadLIFECYCLE Sec. 4 (CL-3)LIFECYCLE + REFRESH.md + affected brief sectionsRegister rows (outcomes + dates); CL-2 openings where regimes changedT-4Audit threadPROTOCOL Sec. 9E + LIFECYCLEPROTOCOL + TAXONOMY + LIFECYCLE + audit checklistNumbered elevations; normalization edits on touchT-5Calibration threadLIFECYCLE Sec. 6 (CL-5)LIFECYCLE + affected briefs' Sec. 7 plans + classifier outputThree-outcome findings as elevations; provenance upgrades; CL-2/CL-4 openings

One thread, one type. A thread that discovers work belonging to another
type opens it as a queued item; it does not absorb it.

2. Change classes

Every post-landing change to the reference model is exactly one of five
classes. The class determines executor, thread type, and versioning.

CL-1 — Erratum. Typos, formatting, dead-pointer corrections,
supersession markers. Executor: CC, operator-directed, no research
thread. Versioning: change-log line in the touched governing file only;
no brief version bump. A CL-1 never changes the meaning of a criterion.

CL-2 — Amendment. Criterion-level change inside a landed category
(add, remove, or materially alter an element or its conditions).
Executor: T-2 thread. Procedure in Sec. 3. Versioning: brief bumps v1.n
with an append-only amendment log entry; TAXONOMY status-row note and
change-log line; PROTOCOL change-log line only if a procedure changed.

CL-3 — Refresh. Re-verification of a volatile criterion against its
current regime. Executor: T-3 thread. Procedure in Sec. 4. A refresh
NEVER edits a criterion: it records an outcome. Outcome "changed regime"
opens a CL-2. Versioning: REFRESH.md rows only.

CL-4 — Structural. Roster change, boundary change, mandate-line
change, subcategory promotion/demotion (B-8/B-14 class). Executor: T-2
thread at minimum; a full T-1 re-run where the operator directs.
Requires a numbered B-n operator ruling recorded in TAXONOMY Sec. 2.
Never performed inside a CL-2 without upgrading the thread's declared
scope and obtaining the ruling.

CL-5 — Calibration feedback. Findings from running the classifier or
a calibration corpus against the model, under B-13 three-outcome
separation (found / genuine absence on clean ingest log / not ingested).
Executor: T-5 thread. Outcomes: (a) provenance upgrade to
corpus-observed — a CL-1-grade tag edit; (b) criterion defect — opens a
CL-2; (c) roster/boundary defect — opens a CL-4; (d) classifier error —
routed to the classifier's own tracker, never a model edit. All findings
route to the operator as numbered elevations.

3. Amendment procedure (CL-2; the People v1.1 shape, codified)

Declare: T-2 thread names the target category, subcategory, and the
defect or need, in one paragraph.
Scoped sweep: per-subcategory anchor sweep (PROTOCOL Sec. 3.7) for the
affected subcategory ONLY. Any new or altered criterion carries >=2
independent authorities or an explicit provenance downgrade (Sec. 3.2).
Inherited rulings are settled precedent (Sec. 12); challenges are
elevations.
Ruling: proposed edit(s) to the operator as numbered items, plain
English, stakes stated.
Land (single coupled commit):
a. BRIEF.md: edit the criterion; bump the status line to v1.n; append
to the brief's amendment log (create "## Amendment log" as the
final section if absent): version, date, driver (operator direction
/ calibration finding / refresh outcome), one-line change summary,
ruling reference.
b. CRITERIA.yaml (once the consumption layer exists, Sec. 5): same
commit or the landing stops.
c. TAXONOMY: status-row note ("amended v1.n YYYY-MM-DD (<one line>)")
and change-log entry.
Turn report per PROTOCOL Sec. 14.

4. Refresh procedure (CL-3) and marker syntax

Marker syntax, forward-looking (legacy variants normalized on touch and
at the 9E-a audit): [refresh: <trigger>] where <trigger> is one of
date:YYYY-MM | classifier-consumption | calibration-run | band-2 |
event:<named event>.

Procedure: a T-3 thread selects due rows from REFRESH.md (trigger fired
or operator-pulled), re-verifies each flagged criterion against its
regime's primary/current source, and records per row: verified date,
outcome (CONFIRMED | CHANGED -> CL-2 opened | RETIRED), and source note.
Row-granular dating lives in the register; brief-global retrieval dates
are unchanged. A refresh thread never edits criteria, briefs, or
TAXONOMY beyond CL-1 supersession markers.

5. Consumption contract (reserved seam; rules binding now)

The classifier (Sprint Ma Task 2) never parses brief prose. The machine
interface is one <category>/CRITERIA.yaml per landed category: ids,
elements, conditions, classifier signals, provenance tag, refresh flags,
cross-references by registry number. BRIEF.md remains the human
authority/provenance record and the canonical home of C-n/E-n rulings.

Schema v0 is drafted at the opening of the 9E-a audit thread and
populated per category during that audit. The schema is versioned and
extendable by the classifier phase; it is never bypassable — a
classifier request for more information is a schema change, never a
prose-parsing exception.

Coupled-commit rule (binding from the moment the first CRITERIA.yaml
exists): any CL-2/CL-4 touching a category updates BRIEF.md and
CRITERIA.yaml in the same commit; a landing prompt lacking either half
stops.

6. Canonical-home rule

A ruling's substance lives in exactly ONE place: B-n rulings in TAXONOMY
Sec. 2; C-n/E-n rulings in the owning category's BRIEF.md. Every other
occurrence (status-row notes, other briefs, transition briefs) is a
pointer by number, carrying no restated substance. Change logs are
append-only history: corrected only by supersession markers on the
erroneous entry (the TAXONOMY v0.7/v0.8 precedent), never by rewriting.
Existing status-row notes are trimmed to pointers lazily — on touch and
at the 9E-a audit — never in a dedicated pass.

7. Audit-queue note (Sec. 9E split)

The Sec. 9E retroactive audit now carries: liveness sweep; B-32
practice-over-policy sweep of landed operating categories;
practitioner-ToC pass for documentation-heavy categories; deferred
pinpoint citations (Legal, Capital Sec. 1202); refresh-marker
normalization and REFRESH.md completion; status-row pointer trims;
prose-structure normalization on touch. This exceeds one thread. The
queue is split: 9E-a (audit proper + normalizations + schema v0
draft) and 9E-b (CRITERIA.yaml population per category, consuming
9E-a's schema). Both precede classifier consumption; the operator may
interleave 9E-b with early classifier work.

8. Change log

v0.1 (2026-07-09): Initial codification (operator-directed
consolidation). Thread taxonomy T-1–T-5; change classes CL-1–CL-5;
amendment procedure codified from the People v1.1 precedent; refresh
procedure + marker syntax + REFRESH.md register; consumption-contract
seam reserved with binding coupled-commit rule; canonical-home rule;
Sec. 9E split into 9E-a/9E-b. Companion: REFRESH.md v0.1, hygiene
batch (gtm legacy deletion; ops B-2 pointer fix; TAXONOMY line-break
reformat), TAXONOMY v0.16, RESEARCH-PROTOCOL v0.20, same commit.
