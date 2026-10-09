/**
 * Authority review — Stage 5 of the generation pipeline (GENERATION-STANDARD.md).
 * A model call with WEB SEARCH enabled: per section, is the stated content the current standard
 * formulation; is anything material missing for this document type at this stage; is `recommend`
 * content outdated. Findings are applied as flagged revisions ([authority: source, year]);
 * findings that conflict with corpus facts or the template's operator fill-modes are routed to
 * Open Rulings, never silently applied. Source eligibility is governed by an adoption-agenda
 * screen (recognized external authority for the document type — not a vendor selling the outcome).
 *
 * Pre-approval scaffolding — outside the provenance firewall (no corpus write, no diagnostic
 * judge). INFRA: web search on the existing Anthropic provider/key; per-search pricing is added
 * to the generation cost of record.
 */
import Anthropic from "@anthropic-ai/sdk";
import { recordUsage } from "./usage-meter.ts";

export interface AuthorityFinding { section: string; finding: string; source: string; year: string; url: string; disposition?: "applied" | "open-ruling" | "report-only"; }
export interface AuthorityReport { model: string; checkDate: string; searchesUsed: number; findings: AuthorityFinding[]; }

export interface TemplateSectionLike { title: string; fill_mode: string[]; }

const WEB_SEARCH_TOOL = { type: "web_search_20250305" as const, name: "web_search", max_uses: 8 };

/** Extract a fenced ```json ... ``` array from model text (defensive). */
function parseJsonBlock(text: string): any[] {
  const m = text.match(/```json\s*([\s\S]*?)```/i) ?? text.match(/(\[[\s\S]*\])/);
  if (!m) return [];
  try { const v = JSON.parse(m[1]); return Array.isArray(v) ? v : []; } catch { return []; }
}

export async function reviewAuthority(
  bodyMd: string, sections: TemplateSectionLike[], client: Anthropic, model: string,
  cachedFindings?: AuthorityFinding[],
): Promise<{ report: AuthorityReport; revisedMd: string }> {
  const checkDate = new Date().toISOString().slice(0, 10);
  const sectionList = sections.map((s, i) => `${i + 1}. ${s.title} [${s.fill_mode.join("+")}]`).join("\n");

  // Authority-cache reuse (07/18): if findings were cached for this template version, REUSE them and
  // SKIP the web search (Call 1). Only Call 2 (apply) runs. Fresh search happens when the version
  // changed (caller passes no cached findings). searchesUsed = 0 marks a cache-served run.
  let findings: AuthorityFinding[];
  let searchesUsed = 0;
  if (cachedFindings && cachedFindings.length) {
    findings = cachedFindings.map((f) => ({ ...f }));
  } else {

  // --- Call 1: web-search authority findings ---
  const findSystem =
    `You are an authority reviewer for a generated business "metrics definitions" document. Using ` +
    `web search, check each section against the CURRENT standard formulation from RECOGNIZED ` +
    `external authorities (SaaS-metrics standard-setters, accounting/finance bodies, well-known ` +
    `practitioner canon). ADOPTION-AGENDA SCREEN: a source is eligible ONLY if it is a recognized ` +
    `authority for this document type — NOT a vendor selling the outcome, NOT marketing content, ` +
    `NOT an SEO listicle. For each section decide: is the stated content the current standard ` +
    `formulation; is anything material missing for this document type; is any "recommend" content ` +
    `outdated. Report ONLY material findings (skip sections that are fine). Output a single fenced ` +
    "```json block: an array of {section, finding, source, year, url}. No prose outside the block.";
  const findUser = `SECTIONS:\n${sectionList}\n\n--- DRAFT ---\n${bodyMd}`;
  const res1 = await client.messages.create({
    model, max_tokens: 4000, system: findSystem,
    messages: [{ role: "user", content: findUser }],
    tools: [WEB_SEARCH_TOOL as any],
  });
  recordUsage(res1.usage);
  const text1 = res1.content.filter((b) => b.type === "text").map((b) => (b as any).text).join("\n");
  searchesUsed = Number((res1 as any).usage?.server_tool_use?.web_search_requests
    ?? res1.content.filter((b: any) => b.type === "server_tool_use").length) || 0;
  const raw = parseJsonBlock(text1);
  findings = raw.map((f: any) => ({
    section: String(f.section ?? ""), finding: String(f.finding ?? ""),
    source: String(f.source ?? ""), year: String(f.year ?? ""), url: String(f.url ?? ""),
  })).filter((f) => f.finding);
  } // end fresh-search path

  if (findings.length === 0) {
    return { report: { model, checkDate, searchesUsed, findings: [] }, revisedMd: bodyMd };
  }

  // --- Call 2: apply findings as flagged revisions; conflicts -> Open Rulings ---
  const applySystem =
    `Apply authority findings to a metrics-definitions document. Output ONLY the full revised ` +
    `Markdown document — NO analysis, NO preamble, NO "I'll..." commentary. Start your output with ` +
    `the document's "# " title line and nothing before it. For each finding: if it does NOT conflict ` +
    `with a stated corpus fact or an operator-owned (operator fill-mode) decision, weave the ` +
    `correction into the relevant section as a lean revision, flagged inline as "[authority: SOURCE, ` +
    `YEAR]". If it CONFLICTS with a corpus fact or an operator decision, DO NOT apply it — instead ` +
    `add a line to the "## Decisions required" section: "§<section> — <finding> [authority: SOURCE, YEAR] ` +
    `(conflicts with <fact/decision>)". PRESERVE EXACTLY, unchanged in structure: every "## " ` +
    `section heading (all 12 + "## Section coverage" + "## Decisions required"), the Section coverage ` +
    `table, and all existing [Document, chunk N] citations.`;
  const applyUser = `FINDINGS (json):\n${JSON.stringify(findings, null, 2)}\n\n--- DRAFT ---\n${bodyMd}`;
  const res2 = await client.messages.create({
    model, max_tokens: 8000, system: applySystem,
    messages: [{ role: "user", content: applyUser }],
  });
  recordUsage(res2.usage);
  let revisedMd = res2.content.filter((b) => b.type === "text").map((b) => (b as any).text).join("\n").trim();
  // Strip any leading chain-of-thought preamble before the document title.
  const titleIdx = revisedMd.search(/^#\s+\S/m);
  if (titleIdx > 0) revisedMd = revisedMd.slice(titleIdx);

  // STRUCTURAL-INTEGRITY GUARD: the revision must preserve the doctrine sections. If it dropped
  // "## Decisions required" or "## Section coverage", DISCARD it — never ship a degraded deliverable.
  // The findings are still surfaced on the exception surface (disposition: report-only).
  const intact = /^##\s+Decisions required/im.test(revisedMd) && /^##\s+Section coverage/im.test(revisedMd);
  if (!revisedMd || !intact) {
    for (const f of findings) f.disposition = "report-only";
    return { report: { model, checkDate, searchesUsed: Number(searchesUsed) || 0, findings }, revisedMd: bodyMd };
  }

  // Mark disposition by whether each finding's [authority: source] landed in Decisions required vs body.
  const openBlock = (revisedMd.split(/^##\s+Decisions required/im)[1] ?? "");
  for (const f of findings) {
    const tag = `[authority: ${f.source}, ${f.year}]`;
    f.disposition = openBlock.includes(tag) ? "open-ruling" : "applied";
  }

  return { report: { model, checkDate, searchesUsed: Number(searchesUsed) || 0, findings }, revisedMd };
}
