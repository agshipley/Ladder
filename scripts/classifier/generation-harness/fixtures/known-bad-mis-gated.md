<!-- REMEDIATION DRAFT — metadata
subcategory: SYNTHETIC-01
flippable: true
template: (none)
timestamp: 2026-07-17T00:00:00.000Z
model: synthetic-fixture
source_documents: (synthetic)
-->

<!-- SYNTHETIC FIXTURE (labeled): no artifact in git history encodes the mis-gating case, so this
     is a minimal stand-in. It carries flippable: true but NO gap_class — a field-presence gate
     would approve it; the correct gate (approvability follows gap_class = artifact-sufficient
     ONLY) must refuse. The GATING check must FAIL this fixture. -->

# Some Document

This draft has flippable set true but no gap_class in its metadata. A gate that keys on
field-presence (flippable) rather than gap_class would wrongly treat it as approvable. The
correct rule is: approvability follows gap_class (artifact-sufficient only); absent or unknown
gap_class is never approvable.

## Decisions required
1. This section exists only so the fixture is otherwise well-formed; the mis-gating is the point.
