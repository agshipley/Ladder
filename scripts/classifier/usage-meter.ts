/**
 * Process-wide model-usage meter (07/18 demo-rerun spend accounting). Each Anthropic
 * messages.create site calls recordUsage(res.usage); the rerun reads + resets between drafts to
 * report per-draft and total spend. Sonnet-4.6 rates ($3/1M in, $15/1M out); web searches are
 * reported as a count (priced separately by the platform).
 */
export interface Usage { inTok: number; outTok: number; searches: number; calls: number; }
let acc: Usage = { inTok: 0, outTok: 0, searches: 0, calls: 0 };

export function recordUsage(u: any): void {
  if (!u) return;
  acc.calls += 1;
  acc.inTok += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
  acc.outTok += u.output_tokens ?? 0;
  acc.searches += u.server_tool_use?.web_search_requests ?? 0;
}
export function resetUsage(): void { acc = { inTok: 0, outTok: 0, searches: 0, calls: 0 }; }
export function readUsage(): Usage { return { ...acc }; }
/** Sonnet 4.6 token cost (input incl. cached, output). Search requests priced separately. */
export function usageCost(u: Usage = acc): number { return u.inTok / 1e6 * 3 + u.outTok / 1e6 * 15; }
