/**
 * Structural self-review — Stage 4 of the generation pipeline (GENERATION-STANDARD.md).
 * ONE template-aware model call: a per-section verdict (pass / thin / fail) with a one-line
 * reason, checked against the template's required_content. Pre-approval scaffolding — outside
 * the provenance firewall (no corpus write, no diagnostic judge). Thin/fail do NOT block; the
 * operator sees them on the exception surface.
 */
import Anthropic from "@anthropic-ai/sdk";
import { recordUsage } from "./usage-meter.ts";

export interface SectionVerdict { section: string; verdict: "pass" | "thin" | "fail"; reason: string; }
export interface StructureReview { model: string; verdicts: SectionVerdict[]; }

export interface TemplateSectionLike { title: string; required_content: string[]; fill_mode: string[]; conditionality?: string; }

const TOOL = "record_structure_review";

export async function reviewStructure(
  bodyMd: string, sections: TemplateSectionLike[], client: Anthropic, model: string,
): Promise<StructureReview> {
  const spine = sections.map((s, i) =>
    `${i + 1}. ${s.title} [${s.fill_mode.join("+")}] — required: ${s.required_content.join("; ")}` +
    (s.conditionality ? ` — conditionality: ${s.conditionality.trim()}` : ""),
  ).join("\n");
  const system =
    `You are a structural reviewer for a generated business document. For EACH template section, ` +
    `judge whether the draft covers that section's required_content: "pass" (covers it), "thin" ` +
    `(present but under-covers a required item), or "fail" (missing or off-topic). A section that ` +
    `is legitimately DEFERRED per its conditionality (e.g. no sales team) is a "pass". A section ` +
    `that correctly states operator questions and routes them to Open Rulings is a "pass". Give a ` +
    `one-line reason each. Judge structure/coverage only — not writing quality, not correctness of ` +
    `facts. Return one verdict per template section, in order, via ${TOOL}.`;
  const user = `TEMPLATE SECTIONS (required_content is the bar):\n${spine}\n\n--- DRAFT ---\n${bodyMd}`;

  const res = await client.messages.create({
    model, max_tokens: 2000, system,
    messages: [{ role: "user", content: user }],
    tools: [{
      name: TOOL,
      description: "Record per-section structural verdicts.",
      input_schema: {
        type: "object", additionalProperties: false,
        properties: {
          verdicts: {
            type: "array",
            items: {
              type: "object", additionalProperties: false,
              properties: {
                section: { type: "string", description: "The section title, echoed." },
                verdict: { type: "string", enum: ["pass", "thin", "fail"] },
                reason: { type: "string", description: "One line." },
              },
              required: ["section", "verdict", "reason"],
            },
          },
        },
        required: ["verdicts"],
      },
    }],
    tool_choice: { type: "tool", name: TOOL },
  });
  recordUsage(res.usage);
  const tool = res.content.find((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use");
  const input = (tool?.input ?? { verdicts: [] }) as { verdicts: SectionVerdict[] };
  const verdicts = Array.isArray(input.verdicts) ? input.verdicts.map((v) => ({
    section: String(v.section ?? ""),
    verdict: (["pass", "thin", "fail"].includes(v.verdict) ? v.verdict : "thin") as SectionVerdict["verdict"],
    reason: String(v.reason ?? ""),
  })) : [];
  return { model, verdicts };
}
