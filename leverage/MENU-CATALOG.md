# Leverage Menu Catalog — v0

**Status:** RULED by operator 2026-07-20
**Position:** Implements Loop-Selection Memo rulings 1, 3, 4. Each item: class, prerequisites (plain English; mapping to exact taxonomy subcategories happens at resolver landing against the live taxonomy), disposition logic, evidence framing (qualitative on customer surfaces per ruling 4), delivery options (customer's choice per ruling 3).
**Resolution model:** the maturity board is the qualification engine. An item's prerequisites resolve against the company's tiles: all met → available; unmet with a path → not yet, path named; structurally wrong for the stage → not offered. Dispositions on offer: recommend / not yet / pilot / chose not to automate.

---

## Enhance

### 1. Meeting & call capture into the company's knowledge base
**What it is:** calls and meetings transcribed and filed into the corpus (and CRM where one exists), making the company's conversations searchable evidence rather than lost audio.
**Prerequisites:** a knowledge base or CRM of record exists to receive them. (On Ladder deployments: met by construction.)
**Disposition logic:** recommend wherever the prerequisite holds; this is the entry-level enhancement for almost any company.
**Evidence framing:** established practice with mass adoption; capture tooling is mature and inexpensive.
**Delivery options:** adopt an off-the-shelf recorder with CRM sync (named per stack; low per-seat cost) / Ladder ingests transcripts into the corpus and, where the diagnosis is deployed, re-assesses affected areas as new evidence arrives (the Ladder-differentiated portion) / hybrid: their recorder, our corpus.

### 2. Records freshness and enrichment
**What it is:** scheduled flagging of stale records and appending of missing fields in the systems the company already runs (CRM contacts, vendor lists, employee records) — batch jobs, human approves changes.
**Prerequisites:** a system of record with dated fields; someone owns it.
**Disposition logic:** recommend where a maintained system exists; not yet where the "system of record" is an unowned spreadsheet — the maturing path is ownership first, since enriching an unmaintained store multiplies noise.
**Evidence framing:** business contact data goes stale quickly — this is one of the best-corroborated facts in the space (competing vendors agree); freshness work is continuous, never a one-time cleanup.
**Delivery options:** adopt an enrichment provider tied to their CRM / Ladder runs corpus-side freshness flagging (documents whose facts conflict with newer corpus material) / hybrid.

### 3. Drafting from the company's own material
**What it is:** first drafts of operational documents — process docs, talk tracks, KPI definitions, policies — generated from the company's corpus, always for human review, never auto-final.
**Prerequisites:** the corpus holds the raw material for the document type; a human owner exists to review.
**Disposition logic:** recommend per gap the board surfaces, gated by the generation pipeline's own rules (mode system, professional review where it applies, generation-excluded classes stay excluded).
**Evidence framing:** assistance-style AI has the strongest independent evidence in this catalog, with gains concentrated where the person doing the work is covering a function outside their expertise — the common case at this stage. Where the founder is already expert in a function, expect modest value; we say so rather than promising uniform gains.
**Delivery options:** Ladder-delivered (this is the existing generation pipeline, productized) — external "adopt" options exist but lack corpus grounding, and we say that plainly with the tradeoff.

---

## Fully automate

### 4. Bill payment and ledger sync
**What it is:** invoice capture → approval routing → payment → automatic reconciliation into the accounting system.
**Prerequisites:** an accounting system of record; a defined approval chain (even a two-person one).
**Disposition logic:** recommend where both hold; not yet where approvals are ad hoc — the path is writing the approval rule first, which is a board gap Ladder can help close.
**Evidence framing:** mature product category; the mechanism is well-corroborated. We name candidate products and cost shape; we do not quote vendor savings claims.
**Delivery options:** adopt (mature products exist; this is usually the right call and we say so) / Ladder-delivered only where a customer engagement specifically warrants it / hybrid rarely applies.

### 5. Continuous compliance monitoring
**What it is:** automated evidence collection and control monitoring against a security framework (SOC 2 and kin), replacing point-in-time audit scrambles.
**Prerequisites:** cloud infrastructure and an identity provider the platform can connect to; an owner for findings.
**Disposition logic:** recommend when the company sells (or will sell) into buyers who ask for it; not yet for companies with no such buyer pressure — spending here early is a cost, and we say when it isn't yet worth it.
**Evidence framing:** near table stakes for B2B companies selling upmarket; the product category is proven at this stage.
**Delivery options:** adopt (this is a buy category; we help choose and sequence) / Ladder does not build a rival.

### 6. Failed-payment recovery
**What it is:** automated retry schedules and customer prompts when a recurring charge fails.
**Prerequisites:** live recurring billing on a mainstream billing platform.
**Disposition logic:** recommend where recurring revenue exists; not offered otherwise (structurally inapplicable, not a maturity gap).
**Evidence framing:** the mechanism is undisputed — some involuntary churn is recoverable; recovery magnitudes vary widely by setup, and we don't quote vendor rates.
**Delivery options:** adopt (billing platforms ship it; often just needs turning on and configuring) / Ladder's role is flagging it's off and helping configure.

### 7. Employee onboarding/offboarding cascade
**What it is:** one employee record change driving payroll, benefits, app access, and device provisioning — and, critically, revoking access on exit.
**Prerequisites:** an HR system of record; enough hiring volume for workflows to pay back setup.
**Disposition logic:** recommend at sufficient headcount/velocity; not yet below it — but the *offboarding access-revocation* piece is recommended at any size, because a departed employee retaining access is a security failure not gated by volume.
**Evidence framing:** platform-native and widely deployed; the security case for automated revocation is corroborated beyond vendor content.
**Delivery options:** adopt (HRIS platforms ship this) / Ladder's role is the gap flag and sequencing.

### 8. Inbound lead handling
**What it is:** form fill → data enrichment → routing to the right person → scheduling, in minutes.
**Prerequisites:** a defined ideal-customer profile, written routing rules, and enough inbound volume to matter.
**Disposition logic:** not yet for most companies at this stage — the honest default. The maturing path is ICP and routing rules (board gaps), and volume, which no tool creates.
**Evidence framing:** heavily promoted; the supporting evidence is almost entirely from sellers of the tooling. We offer it late, not first — and say why.
**Delivery options:** adopt when prerequisites genuinely hold / Ladder helps close the prerequisite gaps first.

### 9. Customer-health scoring with triggered playbooks
**What it is:** usage and support signals composited into an account health score; threshold breaches trigger defined interventions.
**Prerequisites:** product telemetry, a clean CRM, *written* playbooks, and enough accounts for a score to mean anything.
**Disposition logic:** not offered at typical seed scale; not yet where the account base is approaching sufficiency — path runs through playbook authoring (a documentable gap) before any scoring tool.
**Evidence framing:** practitioners in this field are themselves candid that first-version health scores are calibration exercises; the prerequisite load is the heaviest in this catalog.
**Delivery options:** adopt, later / Ladder's near-term role is the playbook drafting (item 3).

---

## Net-new

### 10. Whole-corpus intelligence
**What it is:** questions asked across everything at once — every call, document, and record — with sourced answers: "what objections killed lost deals," "where do our docs contradict each other," "what did we promise this customer." Includes continuous contradiction and anomaly surfacing against the board.
**Prerequisites:** a populated corpus (Ladder deployments: met by construction) and, for the contradiction layer, a deployed diagnosis.
**Disposition logic:** pilot — the capability is real and demonstrable; its sustained operational value at this scale is what a pilot establishes. We say that plainly rather than selling it as proven.
**Evidence framing:** the capability class is genuinely new — no pre-AI equivalent existed; the market sells fragments of it (calls only); nobody sells it across a whole operational corpus at this stage. That is either our moat or a sign of thin demand, and the pilot is how we find out.
**Delivery options:** Ladder-delivered (it *is* the Memory layer plus the diagnosis) — no adopt equivalent exists for the full scope.

---

## Not on the menu

**Autonomous outbound sales agents.** Five research passes found no corroboration beyond sellers of the tooling. Excluded until that changes; this exclusion is itself shown to customers as part of the menu's honesty.
**Whole-stack "automate everything" consolidations.** Automating an undocumented, inconsistent process makes its failures faster. The board exists to fix the process first; the menu sequences automation behind that.
