# Prompt Contract — CC-Enforced (operator-ruled 2026-07-30)

Every prompt CC receives is linted against this contract BEFORE
execution. A non-conforming prompt is REFUSED with the failed
clause named — do not execute it, do not repair it silently.

1. SELF-CONTAINED: no references to other documents, earlier
   messages, or "the text above/below." All text to be landed
   appears verbatim inside the fence.
2. NO PLACEHOLDERS: no angle-bracket blanks, no <insert-here>, no
   steps referencing values that do not exist yet. A command must
   be runnable exactly as written or the prompt is refused.
3. INFRA BLOCK: any prompt touching credentials, providers, env
   vars, egress, or spend names the exact variable names and the
   authorized cost. Missing block on a qualifying prompt = refuse.
4. PROMISE BLOCK: any build or delivery prompt lists the
   customer-visible or operator-visible claims the work will make.
   Acceptance criteria must map one-to-one to the PROMISE block —
   never to what the pipeline happens to produce. A prompt whose
   acceptance tests sample its own output rather than its promise
   is refused (circular-probe class).
5. STATE ANCHOR: expected repo HEAD or tree state stated. If the
   actual state differs, stop and report — never guess forward.
6. HEARTBEAT: any run expected to exceed 5 minutes states a
   progress-report interval.
7. UNTESTED = UNSHIPPED: no invocation, command, or integration is
   reported as working unless executed in this session. "Verified
   in isolation" claims require the isolation test shown.

This contract exists because in-context discipline degrades and
machinery does not. CC enforcement is the mechanism, not courtesy.
