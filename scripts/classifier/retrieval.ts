import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Chunk, EvidenceOrigin, DocStatus } from "./types.ts";
import type { IngestLog, IngestLogEntry } from "./ingest-log.ts";

/** Slug prefix under which adopt-draft writes ladder-generated pages. The only slugs whose
 *  frontmatter provenance retrieval bothers to look up (keeps the hot judge path round-trip-free). */
export const ADOPTED_SLUG_PREFIX = "remediation/";
const VALID_ORIGINS: readonly EvidenceOrigin[] = [
  "company-native", "ladder-generated", "external-template", "operator-modified", "post-intervention-natural",
];
const VALID_STATUS: readonly DocStatus[] = ["working", "final"];
/** What adopted-page frontmatter carries for board disclosure (both stripped before the judge). */
interface PageProvenance { origin?: EvidenceOrigin; status?: DocStatus; }

/** Retrieval origin scope (clean-board gate, 2026-07-17). `all` = the corpus as-is (default,
 *  nothing changes for existing callers); `native` = company-native evidence only, excluding
 *  Ladder-generated (and any non-company-native) pages — the pristine, pre-generation view. */
export type OriginScope = "native" | "all";

/**
 * Retrieval boundary. Read-only access to the corpus, behind a swappable interface
 * (the adopt-behind-a-boundary rule — the concrete client is replaceable without
 * touching the runner). Two operations:
 *   - search: top-k candidates for a set of signal terms (the normal path).
 *   - sweep:  full-text recall pass over the corpus (the exhaustion backstop).
 */
export interface RetrievalClient {
  search(signals: string[], k: number, originScope?: OriginScope): Promise<Chunk[]>;
  sweep(signals: string[], originScope?: OriginScope): Promise<Chunk[]>;
  /** Read the corpus ingest log (B-13 three-outcome). `available: false` when no
   *  machine-readable log exists — the run driver then refuses to run. */
  ingestLog(): Promise<IngestLog>;
  readonly kind: string;
  /**
   * Every query string issued so far, in order (B3 — retrieval observability). The run
   * driver snapshots this length before an entry and slices after, attaching the
   * per-verdict queries to the record. Previously these were discarded (P5 finding).
   */
  readonly issuedQueries: string[];
}

/** Offline stub — canned chunk so the plumbing can be smoke-tested without creds. */
export class StubRetrievalClient implements RetrievalClient {
  readonly kind = "stub";
  readonly issuedQueries: string[] = [];
  async search(signals: string[], _k?: number, _originScope: OriginScope = "all"): Promise<Chunk[]> {
    this.issuedQueries.push(signals.join(" "));
    // The canned chunk is company-native (slug not under remediation/), so both scopes return it.
    return [
      {
        id: "stub-chunk-0001",
        pageId: "stub-page-a",
        title: "Stub Document",
        slug: "stub/doc-a",
        text: `Canned smoke-test evidence mentioning "${signals[0] ?? "signal"}".`,
        score: 0.42,
      },
    ];
  }
  async sweep(signals: string[], _originScope: OriginScope = "all"): Promise<Chunk[]> {
    this.issuedQueries.push(signals.join(" "));
    return [];
  }
  /** Offline stub has no truthful log — reports unavailable so a real run refuses. */
  async ingestLog(): Promise<IngestLog> {
    return { available: false, entries: [] };
  }
}

/**
 * Live gbrain retrieval over the query server's MCP surface. Read-only.
 *
 * Transport: MCP Streamable HTTP at `{CLASSIFIER_QUERY_URL}/mcp`, bearer auth
 * (`Authorization: Bearer <CLASSIFIER_QUERY_TOKEN>`). This is gbrain's non-
 * interactive legacy-token path (`gbrain auth create`); no interactive OAuth.
 * Wire shape pinned against the fork: the `search` op takes `{ query, limit }`
 * (scope: read) and returns rows carrying `chunk_id` / `page_id` / `chunk_text`
 * / `score`; dispatch serializes the op result as one JSON text block
 * (src/mcp/dispatch.ts). We map those rows to the schema-independent `Chunk`.
 */
export class GbrainRetrievalClient implements RetrievalClient {
  readonly kind = "gbrain";
  readonly issuedQueries: string[] = [];
  private client: Client | null = null;
  private connecting: Promise<Client> | null = null;
  private readonly url: string;
  private readonly token: string;
  /** Per-client cache of slug -> frontmatter provenance {origin,status} (get_page; best-effort). */
  private readonly provenanceCache = new Map<string, PageProvenance>();

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  /** Lazily connect once; reused across search/sweep calls. */
  private async connected(): Promise<Client> {
    if (this.client) return this.client;
    if (!this.connecting) {
      this.connecting = (async () => {
        const endpoint = new URL(
          `${this.url.replace(/\/$/, "")}/mcp`,
        );
        const transport = new StreamableHTTPClientTransport(endpoint, {
          requestInit: {
            headers: { Authorization: `Bearer ${this.token}` },
          },
        });
        const client = new Client(
          { name: "ladder-classifier", version: "0.1.0" },
          { capabilities: {} },
        );
        await client.connect(transport);
        this.client = client;
        return client;
      })();
    }
    return this.connecting;
  }

  private async callSearch(query: string, limit: number, originScope: OriginScope = "all"): Promise<Chunk[]> {
    this.issuedQueries.push(query); // B3: persist the query text (was discarded — P5)
    const client = await this.connected();
    const res = (await client.callTool({
      name: "search",
      arguments: { query, limit },
    })) as { content?: Array<{ type: string; text?: string }>; isError?: boolean };

    const text = (res.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("");
    if (!text) return [];

    let rows: any;
    try {
      rows = JSON.parse(text);
    } catch {
      throw new Error(`retrieval: could not parse search result as JSON`);
    }
    if (res.isError) {
      throw new Error(
        `retrieval search error: ${rows?.error ?? "unknown"} ${rows?.message ?? ""}`.trim(),
      );
    }
    const list: any[] = Array.isArray(rows) ? rows : (rows?.results ?? rows?.chunks ?? []);
    const chunks: Chunk[] = list.map((r) => ({
      id: String(r.chunk_id ?? r.id ?? `${r.source_id ?? "default"}:${r.slug}:0`),
      pageId: r.page_id != null ? String(r.page_id) : r.slug,
      text: r.chunk_text ?? r.text ?? r.synopsis ?? "",
      score: typeof r.score === "number" ? r.score : undefined,
      // B1: title/slug carried from the store's search row at retrieval time; no empty
      // titles in new records where the store has them (the P5/attribution gap).
      title: typeof r.title === "string" ? r.title : "",
      slug: r.slug != null ? String(r.slug) : undefined,
      // origin attached below (search rows don't carry it — it lives in page frontmatter).
    }));
    // Firewall DISCLOSURE (2026-07-16, verified live): provenance is not on the search row;
    // it lives in the page record's frontmatter (`get_page` -> frontmatter.origin/status). Only
    // adopted pages carry these, and adopt-draft writes them under the ADOPTED_SLUG_PREFIX — so
    // we look them up ONLY for those slugs, leaving the hot judge path (normal corpus pages) with
    // no extra round-trips. Both are disclosed at the board and STRIPPED before the judge
    // (provenance.ts toJudgeEvidence) — blindness is unaffected.
    await this.attachProvenance(chunks);
    // CLEAN-BOARD GATE (2026-07-17): `native` scope excludes non-company-native evidence. Belt and
    // suspenders — the ADOPTED_SLUG_PREFIX excludes generated pages cheaply (no get_page needed),
    // and the origin field (authoritative, attached above for those slugs) excludes any non-native
    // page. A default corpus page (no remediation/ slug, origin absent = company-native) is kept.
    if (originScope === "native") {
      return chunks.filter((c) => !(c.slug ?? "").startsWith(ADOPTED_SLUG_PREFIX) && (!c.origin || c.origin === "company-native"));
    }
    return chunks;
  }

  /** Look up frontmatter origin+status for adopted-slug chunks only; one get_page each, cached. */
  private async attachProvenance(chunks: Chunk[]): Promise<void> {
    const adopted = [...new Set(
      chunks.map((c) => c.slug).filter((s): s is string => !!s && s.startsWith(ADOPTED_SLUG_PREFIX)),
    )];
    if (adopted.length === 0) return;
    const byslug = new Map<string, PageProvenance>();
    for (const slug of adopted) byslug.set(slug, await this.pageProvenance(slug));
    for (const c of chunks) {
      if (!c.slug) continue;
      const pv = byslug.get(c.slug);
      if (pv?.origin) c.origin = pv.origin;
      if (pv?.status) c.status = pv.status;
    }
  }

  /** Read `frontmatter.origin` and `frontmatter.status` from a page record via one get_page. */
  private async pageProvenance(slug: string): Promise<PageProvenance> {
    if (this.provenanceCache.has(slug)) return this.provenanceCache.get(slug)!;
    const pv: PageProvenance = {};
    try {
      const client = await this.connected();
      const res = (await client.callTool({ name: "get_page", arguments: { slug } })) as
        { content?: Array<{ type: string; text?: string }>; isError?: boolean };
      if (!res.isError) {
        const text = (res.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
        const page = text ? JSON.parse(text) : {};
        const rawO = page?.frontmatter?.origin ?? page?.origin;
        const rawS = page?.frontmatter?.status ?? page?.status;
        if (typeof rawO === "string" && (VALID_ORIGINS as readonly string[]).includes(rawO)) pv.origin = rawO as EvidenceOrigin;
        if (typeof rawS === "string" && (VALID_STATUS as readonly string[]).includes(rawS)) pv.status = rawS as DocStatus;
      }
    } catch { /* best-effort disclosure; never block retrieval on it */ }
    this.provenanceCache.set(slug, pv);
    return pv;
  }

  /** Resolve a document TITLE to its slug via search (top hit). Used by the citation validator. */
  async resolveTitleToSlug(title: string): Promise<string | null> {
    const hits = await this.callSearch(title, 5);
    const exact = hits.find((h) => (h.title ?? "").toLowerCase() === title.toLowerCase());
    return (exact ?? hits[0])?.slug ?? null;
  }

  /** All chunk ids present on a page (via the store's get_chunks). Empty set on any failure. */
  async getChunkIds(slug: string): Promise<Set<string>> {
    const ids = new Set<string>();
    try {
      const client = await this.connected();
      const res = (await client.callTool({ name: "get_chunks", arguments: { slug } })) as
        { content?: Array<{ type: string; text?: string }>; isError?: boolean };
      if (res.isError) return ids;
      const text = (res.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const rows = text ? JSON.parse(text) : [];
      const list: any[] = Array.isArray(rows) ? rows : (rows?.chunks ?? rows?.results ?? []);
      for (const r of list) { const id = r.chunk_id ?? r.id; if (id != null) ids.add(String(id)); }
    } catch { /* best-effort; empty set means "could not resolve" */ }
    return ids;
  }

  /** Fetch a page record (frontmatter + body) for the adopt/finalize path. Write-side helper. */
  async getPageRecord(slug: string): Promise<{ frontmatter: Record<string, unknown>; body: string } | null> {
    const client = await this.connected();
    const res = (await client.callTool({ name: "get_page", arguments: { slug } })) as
      { content?: Array<{ type: string; text?: string }>; isError?: boolean };
    if (res.isError) return null;
    const text = (res.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
    if (!text) return null;
    const page = JSON.parse(text);
    return { frontmatter: page.frontmatter ?? {}, body: String(page.compiled_truth ?? page.body ?? "") };
  }

  async search(signals: string[], k: number, originScope: OriginScope = "all"): Promise<Chunk[]> {
    return this.callSearch(signals.join(" "), k, originScope);
  }

  /** Full-text recall sweep; trivial cost at pilot scale (~2,600 chunks). */
  async sweep(signals: string[], originScope: OriginScope = "all"): Promise<Chunk[]> {
    return this.callSearch(signals.join(" "), 200, originScope);
  }

  /** Read the ingest log via the query server's `get_ingest_log` tool (B-13). */
  async ingestLog(): Promise<IngestLog> {
    const client = await this.connected();
    const res = (await client.callTool({
      name: "get_ingest_log",
      arguments: { limit: 500 },
    })) as { content?: Array<{ type: string; text?: string }>; isError?: boolean };
    if (res.isError) return { available: false, entries: [] };
    const text = (res.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("");
    if (!text) return { available: true, entries: [] };
    let rows: any;
    try {
      rows = JSON.parse(text);
    } catch {
      throw new Error("ingest-log: could not parse get_ingest_log result as JSON");
    }
    const list: any[] = Array.isArray(rows) ? rows : (rows?.entries ?? rows?.log ?? []);
    const entries: IngestLogEntry[] = list.map((r) => ({
      id: Number(r.id),
      source_id: String(r.source_id ?? "default"),
      source_type: String(r.source_type ?? ""),
      source_ref: String(r.source_ref ?? ""),
      pages_updated: Array.isArray(r.pages_updated) ? r.pages_updated.map(String) : [],
      summary: String(r.summary ?? ""),
      created_at: r.created_at != null ? String(r.created_at) : undefined,
    }));
    return { available: true, entries };
  }

  /**
   * Ingest an adopted remediation document (operator adopt step ONLY; requires write scope).
   * Records provenance so the judge stays blind (origin never enters judge context). Not part
   * of any board/fixture read path — invoked solely by scripts/adopt-draft.ts on explicit approve.
   */
  async putPage(slug: string, content: string, meta: Record<string, unknown> = {}): Promise<void> {
    const client = await this.connected();
    const res = (await client.callTool({
      name: "put_page",
      arguments: { slug, content, metadata: meta },
    })) as { isError?: boolean; content?: Array<{ type: string; text?: string }> };
    if (res.isError) {
      const text = (res.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
      throw new Error(`put_page failed: ${text}`);
    }
  }

  async close(): Promise<void> {
    if (this.client) await this.client.close();
    this.client = null;
    this.connecting = null;
  }
}

/** Pick the live client when creds are present; otherwise the offline stub. */
export function retrievalFromEnv(): RetrievalClient {
  const url = process.env.CLASSIFIER_QUERY_URL;
  const token = process.env.CLASSIFIER_QUERY_TOKEN;
  if (url && token) return new GbrainRetrievalClient(url, token);
  return new StubRetrievalClient();
}
