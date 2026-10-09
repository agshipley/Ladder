# Gap-Class Doctrine — v1.0 (RULED, operator, 2026-07-13)
Status: governing design position for the maturity layer's remediation
structure (checklist -> generation -> re-evaluation). Consumed by the
checklist-annotation layer and Sprint Ma Task 5.

## The ruling
Gap CLASS is first-class. The reference model's criteria contain three
kinds of gap; only one is generation-closable.
1. ARTIFACT-SUFFICIENT GAPS — the document IS the requirement (ICP
   doc, metrics definitions, positioning thesis, handbook sections).
   Generation genuinely closes these; the tile flips honestly on
   ingest of the approved draft.
2. SYSTEM GAPS — CRM, scheduler, and similar operating systems. Not
   generatable. The product's move is recommendation plus SEEDING
   (e.g. seed a CRM structure from the existing spreadsheet, per the
   concept doc's worked example).
3. PRACTICE GAPS — review cadence running, updates flowing, budget
   being reopened. NO document closes these. The product may generate
   the SCAFFOLD (template, checklist, meeting doc), but the tile flips
   only when naturally-produced evidence of the practice appears in
   the corpus on a later run. "Scaffold generated; now the practice
   has to run" is the honest state — and a differentiator, because
   competitors will generate the theater.

## Why (doctrinal basis)
The model scores practice-in-use (B-32; operator review doctrine:
unused artifacts thin, policy-without-use thin, config-without-flow
thin). A remediation flow that generated documents to flip tiles would
manufacture the exact theater the board scores against — the product
gaming its own diagnostic. Gap class governs what "closed" means.

## Consequences (forward spec)
- The checklist-annotation layer (per-element checklist labels +
  typical forms, derived from criteria) carries a gap_class per
  element. There is no canonical artifact per element (ruled
  2026-07-13); embedded forms count (FX-31).
- The remediation checklist partitions by class: draftable-today
  documents / systems to recommend+seed / practices with scaffold plus
  the evidence that will flip the tile.
- The AI optimization plan (product step d) consumes the same layer
  through the AI-Ops criteria and Leverage loop designs.

---

## Addendum (2026-07-16, RULED) — Judge/generation provenance firewall

The remediation loop (finding -> generated output -> corpus update ->
regrade) must not let Ladder manufacture its own evidence and reward
itself for it. The enforceable form of the firewall:

1. **Provenance is stripped from the judge's context.** The judge
   never knows whether a corpus entry is company-native,
   Ladder-generated, externally templated, or operator-modified. The
   criteria's evidence standards do the work: a generated scaffold
   fails a practice criterion because execution evidence is missing,
   a conclusion reached without authorship knowledge. "Sees
   provenance but doesn't misuse it" is unverifiable for an LLM
   judge; blindness is testable.
2. **Provenance is disclosed at the board layer.** The tile's
   evidentiary record visibly distinguishes company-native evidence,
   Ladder-generated artifacts, external templates, operator-modified
   outputs, and naturally produced post-intervention evidence. A
   grade without provenance disclosure is potentially misleading; a
   grade with it is properly scoped — the same epistemic contract as
   the source-coverage indicator.
3. **The blindness property enters the fixture suite** when
   remediation is built: paired fixtures, identical evidence with
   provenance metadata present and absent, verdicts must match.

**Sequencing rule:** the strip and the paired blindness fixtures land
BEFORE the first regrade after any approved generated draft enters
the corpus. No approved-draft ingestion precedes the firewall.

**Ingestion form (design of record, pending operator confirm):** an
approved draft enters the corpus as a clean adopted document — draft
banners and generation markers (e.g. [formula added]) removed from
the body and recorded in provenance metadata. Body text announcing
generation would defeat the strip.

### First remediation flow — acceptance criteria (RULED)

Required, in one traceable flow: (1) a correct diagnostic finding;
(2) a ruled gap classification; (3) an output appropriate to that
class per this doctrine; (4) evidence-backed generation or
implementation support, sourced to corpus entries; (5) operator
review and adoption; (6) explicit provenance disclosure at the board
layer; (7) regrading only where the criterion permits the new
evidence to satisfy the bar; (8) zero grade movement for system or
practice gaps on the strength of Ladder's own scaffold; (9)
practice-gap improvement recorded only on later natural evidence.
