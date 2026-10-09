/**
 * Adversarial gate — Stage 6 of the generation pipeline (07/18 ruling; calibrated by the
 * loop/maturity framing test that reproduced the operator's five-fail review 5/5 blind).
 *
 * A fresh-context, BLIND persona review of the finished DELIVERABLE: the reviewer sees ONLY the
 * persona framing + the artifact text — no template, no criterion, no pipeline exhibits, no prior
 * verdicts, no hint that it is pipeline output. This is the framing-test skeleton EXACTLY, wired
 * as a blocking gate. Model: claude-sonnet-4-6, no web search.
 *
 * Verdict contract: client-ready | adequate-with-reservations | not-client-ready.
 *   - not-client-ready       => BLOCKS: the draft never reaches the queue; verdict + deficiencies
 *                               are logged as a generation failure (harness-catch style).
 *   - adequate-with-reservations => PASSES with the reservations attached to the sidecar and
 *                               rendered on the review surface.
 *   - client-ready           => passes clean.
 */
import Anthropic from "@anthropic-ai/sdk";
import { recordUsage } from "./usage-meter.ts";

export const ADVERSARIAL_MODEL = "claude-sonnet-4-6";
export type AdversarialVerdict = "client-ready" | "adequate-with-reservations" | "not-client-ready";

export interface AdversarialResult {
  model: string;
  verdict: AdversarialVerdict;
  deficiencies: string;   // the reviewer's full named deficiencies / reservations (verbatim)
  reservations: string[]; // extracted bullet-level reservations (for adequate-with-reservations)
  inTok: number;
  outTok: number;
}

/**
 * Persona registry by category (07/18 ruling; the prompt's loop/personas mapping — no prior
 * loop/personas file existed, so it is encoded here from the ruling). Each entry supplies the
 * domain persona and the deliverable's real audience for the framing skeleton.
 */
interface Persona { persona: string; audience: string; }
const REGISTRY: Record<string, Persona> = {
  GTM: { persona: "an experienced Chief Revenue Officer", audience: "the company's revenue and sales team" },
  LEGAL: { persona: "a startup general counsel / outside counsel", audience: "the company and, where posted, its users and customers" },
  PEOPLE: { persona: "an experienced Head of HR", audience: "the company's employees" },
  FIN: { persona: "a seasoned startup CFO", audience: "the company's board and investors" },
  CAP: { persona: "a seasoned startup CFO", audience: "the company's board and investors" },
  PRODUCT: { persona: "an experienced Chief Product Officer", audience: "the product and engineering team" },
  OPS: { persona: "an experienced Chief Operating Officer", audience: "the company's operators and functional owners" },
  ENG: { persona: "an experienced VP of Engineering", audience: "the engineering team" },
  AIOPS: { persona: "an experienced head of AI operations", audience: "the company's technical leadership" },
};
const DEFAULT_PERSONA: Persona = { persona: "an experienced operator and advisor", audience: "the company's leadership" };

export function personaFor(subcatId: string): Persona {
  const cat = String(subcatId).replace(/-\d+$/, "");
  return REGISTRY[cat] ?? DEFAULT_PERSONA;
}

/** The framing-test skeleton, verbatim (persona + doc-type + audience swapped in). */
function framing(p: Persona, purports: string, artifact: string): string {
  return `You are ${p.persona}. A vendor delivered the following document to a seed-stage B2B ` +
    `infrastructure company as ${purports}. Give your candid professional assessment: would you ` +
    `consider this adequate work product to hand to ${p.audience}? ` +
    `Verdict: client-ready | adequate-with-reservations | not-client-ready. Then name the specific ` +
    `deficiencies or strengths, concretely — what is missing, what is amateur, what works. Do not ` +
    `grade on effort or structure; grade as if your reputation attaches to forwarding it.\n\n` +
    `--- DOCUMENT ---\n\n${artifact}`;
}

/** Normalize a stated verdict (handles "Not Client-Ready" space form and casing). */
export function parseVerdict(text: string): AdversarialVerdict {
  const m = text.match(/verdict[:*\s]+([^\n]+)/i);
  const line = (m ? m[1] : text.slice(0, 80)).toLowerCase();
  if (/\bnot[\s-]client[\s-]ready\b/.test(line)) return "not-client-ready";
  if (/adequate|reservation/.test(line)) return "adequate-with-reservations";
  if (/client[\s-]ready/.test(line)) return "client-ready";
  // fall back to a full-text scan, most-severe first
  if (/\bnot[\s-]client[\s-]ready\b/i.test(text)) return "not-client-ready";
  if (/adequate[\s-]with[\s-]reservations/i.test(text)) return "adequate-with-reservations";
  return "client-ready";
}

/** Pull bullet/numbered reservations from the review body (for the reservations list). */
function extractReservations(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*\S)/);
    if (m && m[1].length > 8) out.push(m[1].replace(/\*\*/g, "").trim());
  }
  return out.slice(0, 12);
}

/**
 * Run the blind adversarial review. `purports` is the deliverable's human doc-type (the template
 * title). max_tokens raised to 3500 so verdicts + deficiencies do not truncate.
 */
export async function adversarialReview(
  deliverableMd: string, subcatId: string, purports: string,
  client: Anthropic = new Anthropic(),
): Promise<AdversarialResult> {
  const p = personaFor(subcatId);
  const res = await client.messages.create({
    model: ADVERSARIAL_MODEL,
    max_tokens: 3500,
    messages: [{ role: "user", content: framing(p, purports, deliverableMd) }],
  });
  recordUsage(res.usage);
  const text = res.content.filter((b) => b.type === "text").map((b) => (b as any).text).join("\n").trim();
  return {
    model: ADVERSARIAL_MODEL,
    verdict: parseVerdict(text),
    deficiencies: text,
    reservations: extractReservations(text),
    inTok: res.usage?.input_tokens ?? 0,
    outTok: res.usage?.output_tokens ?? 0,
  };
}
