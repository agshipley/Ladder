import "./env.ts";
import Anthropic from "@anthropic-ai/sdk";
import type { Chunk, CriterionEntry, JudgeResult } from "./types.ts";
import { toJudgeEvidence, judgeIdDecoder } from "./provenance.ts";

/**
 * The LLM judge (fidelity position §1, Option D). Reads verbatim-normative
 * criterion prose + its definitions closure + retrieved evidence, and returns a
 * state CONSTRAINED to the entry's ruled enum. Enforcement is structural, not
 * prompt-and-hope: a single strict tool whose `state` property is an enum of
 * exactly this entry's stateEnum, with `tool_choice` forced to that tool.
 *
 * Model policy (ruled 2026-07-10): default claude-opus-4-8 — the strongest model
 * on judgment work, mirroring the CC model policy, until golden fixtures exist to
 * measure a downgrade. claude-sonnet-5 is the designated downgrade candidate,
 * tested against the fixture suite at 9E-b+ (operator's call then). Override via
 * CLASSIFIER_JUDGE_MODEL.
 *
 * Determinism note: the ruled model family (Opus 4.8 / Sonnet 5) REMOVES the
 * sampling parameters — `temperature`/`top_p`/`top_k` return HTTP 400 — so the
 * scaffold's original "temperature 0" is not expressible on these models. Run-to-
 * run variance is instead bounded by the fidelity position's own mitigations:
 * enum-constrained structured output (here), a fixed model, and golden fixtures as
 * the regression tripwire (9E-b). ANTHROPIC_API_KEY is read from .env via dotenv;
 * the client fails loudly if it is unset.
 */

const DEFAULT_MODEL = "claude-opus-4-8";
const VERDICT_TOOL = "record_verdict";

/** Static instruction prefix — identical across every criterion in a run, so it
 *  caches once (breakpoint 1) and is read by all ~73 calls. */
const JUDGE_SYSTEM = `You are the maturity classifier's judge. You are given ONE completeness \
criterion (verbatim, normative), the operative text of every definition it references, and a set \
of retrieved corpus evidence chunks. Decide which single state from the provided enum the corpus \
supports for this criterion, and record it by calling the ${VERDICT_TOOL} tool.

Rules:
- Judge ONLY against the criterion prose and the referenced definitions. Do not import outside \
expectations.
- "present" requires attributed evidence: cite the chunk id(s) that support the judgment in \
evidenceChunkIds. A bare topical mention is not presence.
- If the evidence does not support any positive state, choose the enum's absence/negative state; \
do not manufacture confidence.
- conditionApplied: name the conditionality/trigger class you applied (from the definitions), or \
the literal string "none".
- missing_elements: list the criterion's required elements at this grain that the retrieved \
corpus does NOT evidence — the delta a reviewer would act on. Populate it for thin and \
absence states; use an EMPTY array when the state is fully satisfied (evidence-found, \
documented-n-a, informational, not-ingested, placeholder). State each as the missing artifact/ \
practice, not a sentence.
- element_findings: you are given the criterion's ELEMENT LIST of N items. Return EXACTLY N \
findings — one per listed element, in order, echoing the element label VERBATIM (never invent, \
rename, merge, or drop one). An empty or short array is INVALID, even for a genuine-absence \
verdict (then every element is "absent"). Each finding's state is satisfied | thin | absent, \
judged only from the retrieved evidence, with evidence_chunk_ids for a satisfied/thin element \
(empty for absent). The subcategory state above is derived from these findings under the ROLLUP \
PRECEDENCE below — it is never a free-hand impression, and unevidenced sibling elements never \
override a disposition or an ingest-log outcome.
- Choose exactly one state, and it MUST be a member of the provided enum.`;

export interface JudgeConfig {
  model: string;
  effort: string | null;
}

export function judgeConfigFromEnv(): JudgeConfig {
  return {
    model: process.env.CLASSIFIER_JUDGE_MODEL || DEFAULT_MODEL,
    effort: process.env.CLASSIFIER_JUDGE_EFFORT || null,
  };
}

export class Judge {
  private readonly client: Anthropic;
  readonly config: JudgeConfig;
  /** Usage of the most recent judge() call, for the smoke driver's cost read. */
  lastUsage: Anthropic.Messages.Usage | null = null;
  /** Cumulative usage across every judge() call on this instance (board-run cost). */
  cumUsage = { input: 0, output: 0, calls: 0 };

  constructor(config: JudgeConfig = judgeConfigFromEnv()) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set (expected in .env, gitignored). Refusing to run.",
      );
    }
    // Zero-arg client resolves ANTHROPIC_API_KEY from env; never printed.
    this.client = new Anthropic();
    this.config = config;
  }

  async judge(entry: CriterionEntry, evidence: Chunk[]): Promise<JudgeResult> {
    // Provenance firewall: the judge sees ONLY the stripped projection — opaque id + title +
    // score + text (no slug/pageId/origin/status). `decode` maps the opaque id back to the
    // real chunk id so the RECORD keeps true attribution (A1 ruling, 2026-07-16).
    const visible = toJudgeEvidence(evidence);
    const decode = judgeIdDecoder(evidence);
    const evidenceText =
      visible.length === 0
        ? "(no evidence retrieved)"
        : visible
            .map(
              (c) =>
                `--- chunk ${c.id}${c.title ? ` — ${c.title}` : ""}${
                  c.score != null ? ` [score ${c.score.toFixed(3)}]` : ""
                } ---\n${c.text}`,
            )
            .join("\n\n");

    const req: Anthropic.Messages.MessageCreateParamsNonStreaming = {
      model: this.config.model,
      max_tokens: 1024,
      // NB: no temperature — removed (400) on the ruled Opus-4.8 / Sonnet-5 family.
      system: [
        // Breakpoint 1: shared across all criteria in a run. The ruled rollup
        // precedence is appended here rather than per-criterion: it is byte-identical
        // for every entry (SOLE NORMATIVE COPY: definitions.rollup.precedence), so the
        // block still caches once and is read by all ~73 calls.
        {
          type: "text",
          text: `${JUDGE_SYSTEM}\n\nROLLUP PRECEDENCE (ruled; governs the subcategory state):\n${entry.rollupPrecedence}`,
          cache_control: { type: "ephemeral" },
        },
        // Breakpoint 2: criterion prose + definitions closure — the per-criterion
        // static prefix. Stable across re-runs of THIS criterion (evidence, which
        // changes as the corpus changes, is the volatile user turn below).
        {
          type: "text",
          text:
            `Criterion ${entry.id} (grain: ${entry.grain}` +
            (entry.conditionality ? `, conditionality: ${entry.conditionality}` : "") +
            `):\n${entry.criterion}\n\n` +
            `Referenced definitions (resolution closure):\n${entry.definitionsClosure || "(none)"}\n\n` +
            `Element list — ${entry.elements.length} items; return EXACTLY ${entry.elements.length} element_findings, one per item, echoing each label verbatim:\n` +
            entry.elements.map((e) => `- ${e}`).join("\n"),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Retrieved evidence:\n\n${evidenceText}\n\nRecord your verdict with ${VERDICT_TOOL}.`,
        },
      ],
      tools: [
        {
          name: VERDICT_TOOL,
          description:
            "Record the classifier verdict for this criterion. state must be one of the provided enum values.",
          strict: true,
          input_schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              state: {
                type: "string",
                enum: entry.stateEnum,
                description: "The single ruled state the corpus supports for this criterion.",
              },
              conditionApplied: {
                type: "string",
                description: "The conditionality/trigger class applied, or the literal \"none\".",
              },
              evidenceChunkIds: {
                type: "array",
                items: { type: "string" },
                description: "Chunk ids that attribute a positive verdict; empty for absence.",
              },
              rationale: {
                type: "string",
                description: "One or two sentences justifying the state against the criterion.",
              },
              missing_elements: {
                type: "array",
                items: { type: "string" },
                description:
                  "Criterion elements required at this grain but not evidenced by the corpus (the delta). Empty array when the state is fully satisfied.",
              },
              element_findings: {
                type: "array",
                // NB: the API rejects minItems > 1 on strict tools, so "one per element" is
                // enforced by the prompt (see JUDGE_SYSTEM + the per-criterion element list),
                // not the schema. An empty array is a contract violation, not a valid answer.
                description:
                  "One entry per supplied element, echoing the element label verbatim, with its element-grain state and supporting chunk ids. Never empty when elements are listed.",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    element: { type: "string", description: "The element label, echoed verbatim from the supplied list." },
                    state: { type: "string", enum: ["satisfied", "thin", "absent"] },
                    evidence_chunk_ids: { type: "array", items: { type: "string" } },
                  },
                  required: ["element", "state", "evidence_chunk_ids"],
                },
              },
            },
            required: ["state", "conditionApplied", "evidenceChunkIds", "rationale", "missing_elements", "element_findings"],
          },
        },
      ],
      tool_choice: { type: "tool", name: VERDICT_TOOL },
    };

    if (this.config.effort) {
      (req as any).output_config = { effort: this.config.effort };
    }

    const res = await this.client.messages.create(req);
    this.lastUsage = res.usage;
    this.cumUsage.input += res.usage?.input_tokens ?? 0;
    this.cumUsage.output += res.usage?.output_tokens ?? 0;
    this.cumUsage.calls += 1;
    const toolUse = res.content.find(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    if (!toolUse) {
      throw new Error(
        `judge: model returned no tool_use block (stop_reason=${res.stop_reason})`,
      );
    }
    const input = toolUse.input as {
      state: string;
      conditionApplied: string;
      evidenceChunkIds: string[];
      rationale: string;
      missing_elements: string[];
      element_findings: { element: string; state: string; evidence_chunk_ids: string[] }[];
    };

    // Defense in depth: the enum constraint should already guarantee this.
    if (!entry.stateEnum.includes(input.state)) {
      throw new Error(
        `judge: state "${input.state}" is not in entry ${entry.id} stateEnum [${entry.stateEnum.join(", ")}]`,
      );
    }

    const condition =
      input.conditionApplied && input.conditionApplied.toLowerCase() !== "none"
        ? input.conditionApplied
        : null;

    // Decode opaque judge ids (`e<n>`) back to real chunk ids for the record. Unknown ids
    // (a hallucinated cite) pass through unchanged, preserving the citation-validity check.
    const dec = (id: string) => decode.get(id) ?? id;

    return {
      state: input.state,
      conditionApplied: condition,
      // Coerce defensively: strict schema declares an array, but a model may still
      // emit a scalar/null. Never hand a non-array downstream (it broke a board run).
      evidenceChunkIds: (Array.isArray(input.evidenceChunkIds) ? input.evidenceChunkIds : []).map(dec),
      rationale: input.rationale,
      missingElements: Array.isArray(input.missing_elements) ? input.missing_elements : [],
      elementFindings: Array.isArray(input.element_findings)
        ? input.element_findings.map((f) => ({
            element: String(f.element ?? ""),
            state: (["satisfied", "thin", "absent"].includes(f.state) ? f.state : "absent") as
              | "satisfied"
              | "thin"
              | "absent",
            evidenceChunkIds: (Array.isArray(f.evidence_chunk_ids) ? f.evidence_chunk_ids : []).map(dec),
          }))
        : [],
    };
  }
}
