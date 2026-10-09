# Working notes

This folder holds the working record behind Ladder: how it was built, the standing rules the build
ran under, and the method logs and backlogs that fed the reference model and generation templates.
These are dated, terse working documents written for the people doing the build. They aren't a
product overview; for that, start with the [README](../../README.md) and
[`STATE-OF-LADDER.md`](../../STATE-OF-LADDER.md).

Some conventions recur throughout:
- **"Operator" / "operator ruling"** means a design decision made by the project lead and recorded
  with its date.
- **Category codes** (GTM-07, LEGAL-09, …) refer to areas in the
  [reference model](../../reference-model/README.md).
- **"Reference company" / "reference corpus"** is the anonymized company the reference model was
  calibrated against. **"Customer A"** is an anonymized early-stage deployment.
- References to `runs-of-record/`, `generated-drafts/` or `CREDENTIALS.md` point into a private
  instance and aren't included here.

| Path | What it records |
|---|---|
| [`BUILD-LESSONS.md`](BUILD-LESSONS.md) | Measured facts and standing rules learned while building and deploying real instances: ingestion limits, embedding costs, pooler and network constraints, dependency pinning |
| [`ai-collaboration/`](ai-collaboration/) | How the build was run with AI coding agents: the agent operating instructions (`CLAUDE.md`), the prompt contract every task was linted against, and the thread constitution for orchestration sessions |
| [`generation/TEMPLATE-METHOD-LOG.md`](generation/TEMPLATE-METHOD-LOG.md) | How each generation template was researched, challenged and ruled |
| [`generation/proposals/`](generation/proposals/) | Proposed template skeletons and the grouping analysis behind them; adopted templates live in [`generation-templates/`](../../generation-templates/) |
| [`reference-model/DECOMPOSITION-BACKLOG.md`](reference-model/DECOMPOSITION-BACKLOG.md) | Element-level decomposition work queued against the criteria, with calibration notes |
| [`reference-model/FIXTURES-DEFERRED.md`](reference-model/FIXTURES-DEFERRED.md) | Fixtures set aside at review, and why |
