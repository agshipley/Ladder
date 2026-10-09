import { createContext, useContext, useEffect, useMemo, useState } from "react";
import data from "./data.json";
import type { BoardData, BoardRecord, CitedChunk, DocIndexEntry, ElementFinding, SchemaCategory } from "./types";
import { projectState, NOT_EVALUATED, type StateProjection } from "./state-colors";
import { DISPLAY_NAMES } from "../display-names";
import { mdToHtml, stripMd } from "./md";
import { richMdToHtml, stripDraftPreamble } from "./md-blocks";
import { downloadDocx } from "./docx-export";
import { groupByDoc } from "../docs.mjs";
import { elementLabel } from "../element-labels.mjs";

const DATA = data as unknown as BoardData;
const displayName = (id: string) => DISPLAY_NAMES[id] ?? id;

function Dot({ proj }: { proj: StateProjection }) {
  return <span className={`dot dot--${proj.swatch}`} aria-hidden />;
}
function Md({ text, className }: { text: string; className?: string }) {
  return <div className={`md ${className ?? ""}`} dangerouslySetInnerHTML={{ __html: mdToHtml(text) }} />;
}

export default function App() {
  const [view, setView] = useState<"board" | "review" | "documents" | "working" | "log">("board");
  // Deep-link: #<ID> opens that tile's drawer (also enables headless drawer verification).
  const [detailId, setDetailId] = useState<string | null>(
    typeof location !== "undefined" && /^#[A-Z]+-\d+$/.test(location.hash) ? location.hash.slice(1) : null,
  );

  const stats = DATA.run.stats;
  const byId = useMemo(() => {
    const m = new Map<string, BoardRecord>();
    for (const r of DATA.run.records) m.set(r.id, r);
    return m;
  }, []);
  const critById = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of DATA.categories) for (const s of c.subcategories) m.set(s.id, s.criterion);
    return m;
  }, []);

  const detail = detailId ? byId.get(detailId) ?? null : null;

  // Remediation flow (board-driven). Pending drafts + the review overlay. The /api/* routes
  // are served by scripts/board-server.ts; under `vite preview` they 404 and the flow hides.
  const [pending, setPending] = useState<{ name: string; meta: Record<string, string>; status?: any }[]>([]);
  const [review, setReview] = useState<any | null>(null);
  // In-surface failure panel for validator/gate failures from the regenerate/override UI path
  // (replaces raw alert()). Set on d.error, cleared on success or dismiss.
  const [genFailure, setGenFailure] = useState<{ failures: string[] } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  // Tiles where Ladder generates nothing (GENERATION-EXCLUDED) — the Generate button is not rendered.
  const [genExcluded, setGenExcluded] = useState<Set<string>>(new Set());
  const refreshPending = () => fetch("/api/drafts").then((r) => r.json()).then((d) => { setPending(d.drafts ?? []); setGenExcluded(new Set(d.generationExcluded ?? [])); }).catch(() => {});
  useEffect(() => { refreshPending(); }, []);
  // Deep-link a draft into review: #review=<filename> (enables headless review verification).
  useEffect(() => {
    const m = typeof location !== "undefined" && location.hash.match(/^#review=(.+)$/);
    if (m) openDraft(decodeURIComponent(m[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Deep-link a view: #view=<board|review|documents|working|log> (enables headless view screenshots).
  useEffect(() => {
    const m = typeof location !== "undefined" && location.hash.match(/^#view=(board|review|documents|working|log)$/);
    if (m) setView(m[1] as any);
  }, []);
  const generate = async (id: string) => {
    setBusy(id); setDetailId(null);
    try {
      const r = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
      const d = await r.json();
      setReview({ ...d, pipeline: (d.validator || d.structure || d.authority) ? { validator: d.validator, structure: d.structure, authority: d.authority } : null });
      await refreshPending();
    }
    catch { setReview({ error: "generation failed (is the board server running? `node scripts/board-server.ts`)" }); }
    finally { setBusy(null); }
  };
  const openDraft = async (name: string) => {
    const r = await fetch(`/api/draft?name=${encodeURIComponent(name)}`); const d = await r.json();
    // Parse the draft's OWN metadata header (authoritative) rather than the pending-list cache,
    // which may not be loaded yet on a cold deep-link — that cache miss was the filename-id bug.
    const md = String(d.markdown ?? "");
    const meta: Record<string, string> = {};
    const mm = md.match(/<!--\s*REMEDIATION DRAFT[^]*?-->/);
    if (mm) for (const line of mm[0].split("\n")) { const kv = line.match(/^\s*([a-z_]+):\s*(.+)$/); if (kv) meta[kv[1]] = kv[2].trim(); }
    setReview({ id: meta.subcategory ?? name, name, markdown: md, gapClass: meta.gap_class, flippable: meta.flippable === "true",
      // 07/18 mode matrix (backward-compatible: legacy drafts with no mode read as artifact).
      mode: meta.mode ?? "artifact", modeBasis: meta.mode_basis ?? "", professionalReview: meta.professional_review ?? "none",
      approvableWorking: meta.approvable_working != null ? meta.approvable_working === "true" : (meta.mode === "plan" || meta.gap_class === "artifact-sufficient"),
      approveFinal: meta.approve_final != null ? meta.approve_final === "true" : (meta.flippable === "true"),
      pipeline: d.review ?? null, answers: d.answers ?? {} });
  };

  const [nativeOnly, setNativeOnly] = useState(false);

  return (
   <NativeOnlyCtx.Provider value={nativeOnly}>
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Maturity Board</h1>
          <p className="sub">
            {stats ? `Run ${stats.runId} · ${stats.model} · ${new Date(stats.generatedAt).toLocaleString()}` : "no run loaded"}
          </p>
        </div>
        <div className="viewtoggle" role="tablist">
          <button role="tab" aria-selected={view === "board"} className={view === "board" ? "on" : ""} onClick={() => setView("board")}>Board</button>
          <button role="tab" aria-selected={view === "review"} className={view === "review" ? "on" : ""} onClick={() => setView("review")}>Review</button>
          <button role="tab" aria-selected={view === "documents"} className={view === "documents" ? "on" : ""} onClick={() => setView("documents")}>Documents</button>
          <button role="tab" aria-selected={view === "working"} className={view === "working" ? "on" : ""} onClick={() => setView("working")}>Working docs</button>
          <button role="tab" aria-selected={view === "log"} className={view === "log" ? "on" : ""} onClick={() => setView("log")}>Approval log</button>
          {/* EXTERNAL-PAGE NAV: the Leverage menu is a separately emitted page (GET /leverage), NOT an
              SPA view — a real link so open-in-new-tab works; styled to match the tablist. */}
          <a className="tablink" href={DATA.leverage?.menu_url ?? "/leverage"} aria-label="Open the Leverage menu (separate page)">Leverage&nbsp;↗</a>
        </div>
      </header>

      <div className="evidence-scope" role="note">
        <span className="es-label">Evidence:</span>
        <button className={!nativeOnly ? "on" : ""} onClick={() => setNativeOnly(false)} title="Show all evidence, with Ladder-generated origin disclosed">Include Ladder-generated</button>
        <button className={nativeOnly ? "on" : ""} onClick={() => setNativeOnly(true)} title="Hide Ladder-generated / non-company-native evidence from the lists (display filter; a re-judged native board is run-board --native-only)">Company evidence only</button>
      </div>

      {stats && <StatsBar stats={stats} source={DATA.run.source} />}
      <CoverageStrip coverage={(DATA.run as any).sourceCoverage ?? []} />
      {(DATA.run as any).retirementBanner ? (
        <div className="retire-banner" role="note">{(DATA.run as any).retirementBanner}</div>
      ) : null}
      {pending.length ? <QueueView pending={pending} onOpen={openDraft} /> : null}
      <Legend />

      {view === "board" && (
        <main>
          {DATA.categories.map((cat) => (
            <BoardCategory key={cat.key} cat={cat} byId={byId} onOpen={setDetailId} />
          ))}
        </main>
      )}
      {view === "review" && <ReviewView categories={DATA.categories} byId={byId} />}
      {view === "documents" && <DocumentsView docs={DATA.run.documentIndex ?? []} onOpen={setDetailId} />}
      {view === "working" && <WorkingDocsView />}
      {view === "log" && <ApprovalLogView />}

      {detail && (
        <DetailDrawer
          record={detail}
          criterion={critById.get(detail.id) ?? ""}
          runId={stats?.runId ?? ""}
          model={stats?.model ?? ""}
          timestamp={stats?.generatedAt ?? ""}
          busy={busy === detail.id}
          onGenerate={generate}
          genExcluded={genExcluded.has(detail.id)}
          onClose={() => setDetailId(null)}
        />
      )}

      {review && (
        <RemediationReview
          review={review}
          criterion={critById.get(review.id) ?? ""}
          elements={(byId.get(review.id)?.elementFindings ?? [])}
          onReject={async (note) => { await fetch("/api/reject", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: review.id, note }) }); setReview(null); }}
          onApprove={async (note, status) => { const r = await fetch("/api/approve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: review.id, name: review.name, note, status }) }); const d = await r.json(); alert(d.ok ? `Approved as ${status}. ${d.next ?? ""}` : (d.error ?? "approve failed")); if (d.ok) { setReview(null); refreshPending(); } }}
          onSaveAnswers={async (answers) => { await fetch("/api/answers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: review.name, answers }) }); }}
          onRegenerate={async (answers) => { await fetch("/api/answers", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: review.name, answers }) }); const r = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: review.id, answers }) }); const d = await r.json(); if (d.error) { setGenFailure({ failures: d.failures ?? [d.error] }); return; } setGenFailure(null); setReview({ ...d, name: d.name, pipeline: (d.validator || d.structure || d.authority) ? { validator: d.validator, structure: d.structure, authority: d.authority, references: d.references, externalReferences: d.externalReferences, coverage: d.coverage } : null, answers }); await refreshPending(); }}
          onOverrideMode={async (mode) => { const r = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: review.id, mode }) }); const d = await r.json(); if (d.error) { setGenFailure({ failures: d.failures ?? [d.error] }); return; } setGenFailure(null); setReview({ ...d, name: d.name, pipeline: (d.validator || d.structure || d.authority) ? { validator: d.validator, structure: d.structure, authority: d.authority, references: d.references, externalReferences: d.externalReferences, coverage: d.coverage } : null, answers: {} }); await refreshPending(); }}
          onAttest={async (reviewer) => { const r = await fetch("/api/attest", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: review.id, reviewer }) }); const d = await r.json(); return !!d.ok; }}
          failure={genFailure}
          onDismissFailure={() => setGenFailure(null)}
          onClose={() => { setReview(null); setGenFailure(null); }}
        />
      )}

      <footer className="foot">
        board generated {new Date(DATA.generatedAt).toLocaleString()} · offline view over{" "}
        {DATA.run.source}{DATA.run.file ? ` (${DATA.run.file})` : ""} · no live corpus fetch
      </footer>
    </div>
   </NativeOnlyCtx.Provider>
  );
}

function StatsBar({ stats, source }: { stats: NonNullable<BoardData["run"]["stats"]>; source: string }) {
  const dist = Object.entries(stats.stateDistribution).sort((a, b) => b[1] - a[1]);
  return (
    <div className="statsbar">
      <span className="statsbar-total">{stats.total} verdicts</span>
      {dist.map(([s, n]) => {
        const { proj } = projectState(s);
        return (
          <span key={s} className="statsbar-item"><Dot proj={proj} /> {proj.label ?? s} <b>{n}</b></span>
        );
      })}
      <span className="statsbar-src">source: {source}</span>
    </div>
  );
}

/** B7/D7: run-level source-coverage disclosure as pill chips. Grades reflect what Ladder
 *  can see; a grey/absent tile is a visibility gap, never a claim about the company. */
function CoverageStrip({ coverage }: { coverage: { source: string; status: string }[] }) {
  if (!coverage.length) return null;
  return (
    <div className="coverage" role="note">
      {coverage.map((c, i) => (
        <span key={i} className={`cov-chip ${/NOT INGESTED|NOT TRANSCRIBED/.test(c.status) ? "cov-off" : "cov-on"}`}>
          {c.source}: {c.status}
        </span>
      ))}
      <span className="cov-note">Grades reflect what Ladder can see. A grey tile is a gap in our visibility, never a claim about the company.</span>
    </div>
  );
}

function BoardCategory({ cat, byId, onOpen }: { cat: SchemaCategory; byId: Map<string, BoardRecord>; onOpen: (id: string) => void }) {
  return (
    <section className="category">
      <div className="cat-head"><h2>{cat.name}</h2><span className="cat-key">{cat.key}</span>{(cat as any).retiredGrain ? <span className="retire-chip">RETIRED GRAIN</span> : null}</div>
      <div className="tiles">
        {cat.subcategories.map((s) => (
          <Tile key={s.id} id={s.id} record={byId.get(s.id) ?? null} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}

/** A tile carries a working (non-finalized) adopted document if any cited chunk is status:working. */
function hasWorkingEvidence(record: BoardRecord): boolean {
  return (record.citedChunks ?? []).some((c) => c.status === "working");
}

function Tile({ id, record, onOpen }: { id: string; record: BoardRecord | null; onOpen: (id: string) => void }) {
  const name = displayName(id);
  if (!record) {
    return (
      <div className={`tile tile--${NOT_EVALUATED.swatch} tile--empty`}>
        <div className="tile-name">{name}</div>
        <div className="tile-id">{id}</div>
        <div className="tile-state"><Dot proj={NOT_EVALUATED} /> {NOT_EVALUATED.label}</div>
      </div>
    );
  }
  const { proj, isUnknown } = projectState(record.state);
  const label = isUnknown ? record.state : proj.label ?? record.state;
  const topDoc = (record as any).sourceDocuments?.[0]?.title || (record as any).sourceDocuments?.[0]?.slug || null;
  return (
    <button className={`tile tile--${proj.swatch}${proj.badge ? " tile--badge" : ""}`} onClick={() => onOpen(id)}>
      {/* Name-first (07/18 review, operator rule 1): the human name leads; the code is demoted. */}
      <div className="tile-name">{name}</div>
      <div className="tile-id">{id}{isUnknown && <span className="warn">unknown</span>}</div>
      <div className="tile-state"><span className={`vbadge vbadge--${proj.swatch}`}>{label}</span></div>
      {record.elementFindings && record.elementFindings.length ? (
        <div className="tile-elements" title={`${record.elementFindings.length} elements`}>
          {record.elementFindings.map((f, i) => (
            <span key={i} className={`edot edot--${f.state}`} title={`${elementLabel(f.element)}: ${f.state}`} />
          ))}
        </div>
      ) : null}
      {hasWorkingEvidence(record) ? <div className="tile-working" title="This tile's evidence includes a working (non-finalized) adopted document">working draft</div> : null}
      {topDoc ? <div className="tile-docs" title={topDoc}>{topDoc}</div> : null}
    </button>
  );
}

/** Evidence text: a short preview that expands (click) to the full STORED chunk text.
 *  NB: ref-board-002 persisted evidence as a ≤150-char gist (the classifier's stored
 *  field), so "full" here is that gist; forward runs that store full text expand to it. */
function ChunkText({ gist }: { gist: string }) {
  const PREVIEW = 78;
  if ((gist ?? "").length <= PREVIEW) return <div className="ev-gist">{gist}</div>;
  return (
    <details className="ev-gist ev-expand">
      <summary>{gist.slice(0, PREVIEW).replace(/\s\S*$/, "")}…</summary>
      <div className="ev-full">{gist}</div>
    </details>
  );
}

/** Clean-board evidence scope (2026-07-17). When on, the board DISPLAYS company-native evidence
 *  only — Ladder-generated / non-native citations are hidden from the evidence lists. NOTE: this
 *  filters the displayed evidence on the loaded (all-scope) result set; a fully re-judged
 *  company-native board is produced by `run-board --native-only` (a separate stored result set). */
const NativeOnlyCtx = createContext(false);
const nativeFilter = (chunks: CitedChunk[], on: boolean) => on ? chunks.filter((c) => !c.origin || c.origin === "company-native") : chunks;

function Evidence({ chunks }: { chunks: CitedChunk[] }) {
  chunks = nativeFilter(chunks, useContext(NativeOnlyCtx));
  if (!chunks.length) return <p className="muted">No evidence cited.</p>;
  const docs = groupByDoc(chunks) as { label: string; slug: string | null; chunks: CitedChunk[] }[];
  return (
    <div className="evdocs">
      {docs.map((d, di) => (
        <div key={di} className="evdoc">
          <div className="evdoc-head">{d.label}{d.slug ? <span className="evdoc-slug">slug {d.slug}</span> : null} <span className="evdoc-n">{d.chunks.length} chunk{d.chunks.length === 1 ? "" : "s"}</span></div>
          <ul className="evlist">
            {d.chunks.map((c, i) => (
              <li key={`${c.id}-${i}`}>
                <code className="ev-id">{c.id}</code>{c.score != null ? <span className="ev-src"> score {c.score.toFixed(3)}</span> : null}
                {c.origin && c.origin !== "company-native" ? <span className="origin-tag" title="Evidence provenance">{c.origin.replace(/-/g, " ")}</span> : null}
                {c.status === "working" ? <span className="working-tag" title="Adopted document not yet finalized">working draft</span> : null}
                <ChunkText gist={c.gist} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const EL_SWATCH: Record<string, string> = { satisfied: "green", thin: "amber", absent: "red" };

function ElementChecklist({ findings }: { findings?: ElementFinding[] }) {
  if (!findings || !findings.length) return null;
  const n = { satisfied: 0, thin: 0, absent: 0 } as Record<string, number>;
  for (const f of findings) n[f.state] = (n[f.state] ?? 0) + 1;
  return (
    <section className="dsec">
      <h3>Elements ({findings.length}) <span className="el-tally">{n.satisfied}✓ {n.thin}~ {n.absent}✗</span></h3>
      <div className="subtiles">
        {findings.map((f, i) => (
          <div key={i} className={`subtile subtile--${f.state}`} title={f.element}>
            <span className={`dot dot--${EL_SWATCH[f.state] ?? "gray"}`} />
            <span className="subtile-name">{elementLabel(f.element)}</span>
            <span className={`subtile-state el-state--${f.state}`}>{f.state}</span>
            {f.evidenceChunkIds.length ? <span className="subtile-ev">{f.evidenceChunkIds.length} ev</span> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function Missing({ record }: { record: BoardRecord }) {
  const isThinAbsence = record.state === "thin" || /absence/.test(record.state);
  if (!isThinAbsence) return null;
  if (!record.missing || !record.missing.length) {
    return (
      <section className="dsec missing missing--none">
        <h3>Expected but not found</h3>
        <p className="muted">Not captured this run — the judge rationale for this verdict was not persisted (see the run's provenance note). Forward runs capture missing elements directly.</p>
      </section>
    );
  }
  return (
    <section className="dsec missing">
      <h3>Expected but not found <span className="prov">{record.missingProvenance}</span></h3>
      <ul className="missing-list">
        {record.missing.map((m, i) => <li key={i}>{m}</li>)}
      </ul>
    </section>
  );
}

function AbsenceDetail({ record }: { record: BoardRecord }) {
  return (
    <div className="absence">
      <div><b>Exhaustion sweep:</b> {record.sweepRan ? `ran (surfaced ${record.sweepNewCount} new chunk${record.sweepNewCount === 1 ? "" : "s"}${record.sweepEscalatedFlip ? ", escalation changed the verdict" : ", verdict stood"})` : "not run"}</div>
      <div><b>Ingest-log basis (B-13):</b> {record.absenceNote ?? "—"}</div>
    </div>
  );
}

function DetailDrawer({ record, criterion, runId, model, timestamp, busy, onGenerate, genExcluded, onClose }: {
  record: BoardRecord; criterion: string; runId: string; model: string; timestamp: string;
  busy?: boolean; onGenerate?: (id: string) => void; genExcluded?: boolean; onClose: () => void;
}) {
  const { proj, isUnknown } = projectState(record.state);
  const isAbsence = /absence/.test(record.state);
  const isGap = ["genuine-absence", "thin", "not-ingested"].includes(record.state);
  const lev = DATA.leverage?.links?.[record.id];
  const menuUrl = DATA.leverage?.menu_url ?? "/leverage";
  const hasLev = !!lev && lev.gates.length + lev.caveats.length + lev.available_supports.length > 0;
  const linkNames = (refs: { item: number; name: string }[]) =>
    refs.map((g, i) => <span key={g.item}>{i > 0 ? ", " : ""}<a href={menuUrl}>{g.name}</a></span>);
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          {/* Name-first (07/18 review, operator rule 1): human name in the heading, code demoted below. */}
          <h2><span className={`pill pill--${proj.swatch}`}>{isUnknown ? record.state : proj.label ?? record.state}</span> {displayName(record.id)}</h2>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>
        <div className="drawer-name"><span className="drawer-code">{record.id}</span></div>

        <section className="dsec"><h3>Criterion</h3><Md text={criterion} /></section>
        <ElementChecklist findings={record.elementFindings} />
        <section className="dsec"><h3>When this applies</h3><p>{stripMd(record.conditionApplied ?? "—")}</p></section>
        {hasLev && (
          <section className="dsec dsec--leverage">
            <h3>Leverage</h3>
            <p className="lev-line">
              {lev!.gates.length > 0 ? (
                <>Gates {lev!.gates.length} menu item{lev!.gates.length > 1 ? "s" : ""}: {linkNames(lev!.gates)}
                  {lev!.caveats.length > 0 ? <> · caveat on {lev!.caveats.length} more</> : null}</>
              ) : lev!.caveats.length > 0 ? (
                <>Caveat on {lev!.caveats.length} menu item{lev!.caveats.length > 1 ? "s" : ""}: {linkNames(lev!.caveats)}</>
              ) : (
                <>Supports {lev!.available_supports.length} available item{lev!.available_supports.length > 1 ? "s" : ""}: {linkNames(lev!.available_supports)}</>
              )}
            </p>
          </section>
        )}
        <Missing record={record} />
        {isGap && genExcluded ? (
          <section className="dsec">
            <p className="muted">Ladder generates nothing here — litigation and dispute materials are maintained outside the corpus by policy.</p>
          </section>
        ) : isGap && onGenerate ? (
          <section className="dsec">
            <button className="gen-btn" disabled={busy} onClick={() => onGenerate(record.id)}>
              {busy ? "Generating…" : "Generate remediation draft"}
            </button>
          </section>
        ) : null}
        <section className="dsec"><h3>What we found</h3>{record.rationale ? <Md text={record.rationale} /> : <p className="muted">—</p>}</section>
        {isAbsence && <section className="dsec"><h3>Why nothing was found</h3><AbsenceDetail record={record} /></section>}
        <section className="dsec"><h3>Documents relied on ({groupByDoc(record.citedChunks).length})</h3><Evidence chunks={record.citedChunks} /></section>
        <section className="dsec dsec--meta">
          <span>run {runId}</span><span>{model}</span><span>{timestamp ? new Date(timestamp).toLocaleString() : ""}</span>
          {record.reconstructed && <span className="tag">evidence re-fetched (verdict unchanged)</span>}
        </section>
      </aside>
    </div>
  );
}

function ReviewView({ categories, byId }: { categories: SchemaCategory[]; byId: Map<string, BoardRecord> }) {
  const nativeOnly = useContext(NativeOnlyCtx);
  return (
    <main className="review">
      <p className="review-intro">All {byId.size} verdicts, category by category — readable top to bottom. Verdicts are raw and unedited.</p>
      {categories.map((cat) => (
        <section key={cat.key} className="review-cat">
          <h2>{cat.name} <span className="cat-key">{cat.key}</span></h2>
          {cat.subcategories.map((s) => {
            const r = byId.get(s.id);
            if (!r) return (
              <div key={s.id} className="review-entry"><div className="review-entry-head"><span className="ri-name">{displayName(s.id)}</span><span className="ri-id">{s.id}</span><span className="pill pill--neutral">not evaluated</span></div></div>
            );
            const { proj, isUnknown } = projectState(r.state);
            const isAbsence = /absence/.test(r.state);
            return (
              <div key={s.id} className="review-entry">
                <div className="review-entry-head">
                  <span className="ri-name">{displayName(s.id)}</span>
                  <span className="ri-id">{s.id}</span>
                  <span className={`pill pill--${proj.swatch}`}>{isUnknown ? r.state : proj.label ?? r.state}</span>
                </div>
                {r.conditionApplied && <div className="ri-cond"><b>Condition:</b> {stripMd(r.conditionApplied)}</div>}
                {r.elementFindings && r.elementFindings.length ? (
                  <div className="ri-elements">
                    <b>Elements:</b>{" "}
                    {r.elementFindings.map((f, i) => (
                      <span key={i} className={`el-chip el-chip--${f.state}`} title={f.element}>{f.state === "satisfied" ? "✓" : f.state === "thin" ? "~" : "✗"} {elementLabel(f.element)}</span>
                    ))}
                  </div>
                ) : null}
                {r.rationale && <div className="ri-rat"><b>Rationale:</b> {stripMd(r.rationale)}</div>}
                {(r.state === "thin" || isAbsence) && (
                  <div className="ri-missing">
                    <b>Expected but not found:</b>{" "}
                    {r.missing && r.missing.length
                      ? <span>{r.missing.join(" · ")} <span className="prov">({r.missingProvenance})</span></span>
                      : <span className="muted">not captured this run</span>}
                  </div>
                )}
                {isAbsence && <div className="ri-abs"><b>Absence:</b> sweep {r.sweepRan ? "ran" : "not run"}; {r.absenceNote ?? "—"}</div>}
                <div className="ri-ev">
                  <b>Evidence — documents ({(groupByDoc(nativeFilter(r.citedChunks, nativeOnly)) as { label: string }[]).length}):</b>
                  {nativeFilter(r.citedChunks, nativeOnly).length ? (
                    <ul>{(groupByDoc(nativeFilter(r.citedChunks, nativeOnly)) as { label: string; slug: string | null; chunks: CitedChunk[] }[]).map((d, di) => (
                      <li key={di}><b>{d.label}</b>{d.slug ? ` · slug ${d.slug}` : ""} — {d.chunks.map((c) => c.gist).join(" / ").slice(0, 220)}</li>
                    ))}</ul>
                  ) : <span className="muted"> none cited</span>}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </main>
  );
}

function DocumentsView({ docs, onOpen }: { docs: DocIndexEntry[]; onOpen: (id: string) => void }) {
  return (
    <main className="docs">
      <p className="review-intro">Every source document cited in the run ({docs.length}), most-relied-on first — with the verdicts each supports. Click a verdict to open it.</p>
      {docs.map((d) => (
        <div key={d.key} className="docrow">
          <div className="docrow-head"><span className="doc-label">{d.label}</span>{d.slug ? <span className="doc-slug">slug {d.slug}</span> : null}<span className="doc-n">{d.verdicts.length} verdict{d.verdicts.length === 1 ? "" : "s"}</span></div>
          <div className="doc-verdicts">
            {d.verdicts.map((v) => {
              const { proj } = projectState(v.state);
              return <button key={v.id} className={`chip chip--${proj.swatch}`} onClick={() => onOpen(v.id)} title={`${displayName(v.id)} — ${v.state}`}>{v.id}</button>;
            })}
          </div>
        </div>
      ))}
    </main>
  );
}

function Legend() {
  const items = ["evidence-found", "thin", "genuine-absence", "not-ingested", "documented-n-a", "placeholder", "informational", "loop-ready"];
  return (
    <div className="legend">
      {items.map((s) => {
        const { proj } = projectState(s);
        return <span key={s} className="legend-item"><Dot proj={proj} /> {proj.label ?? s}</span>;
      })}
      <span className="legend-item"><Dot proj={NOT_EVALUATED} /> not evaluated</span>
    </div>
  );
}

/** B5: working-documents panel. Lists every adopted document still at status:working —
 *  title, serving tile, adoption date, age in days. Sourced from /api/working-docs (approval
 *  records reconciled with live get_page status). A document leaves the list on finalize.
 *  Under `vite preview` (no server) the endpoint 404s and the panel shows the empty state. */
function WorkingDocsView() {
  const [docs, setDocs] = useState<any[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("/api/working-docs").then((r) => r.json()).then((d) => setDocs(d.workingDocs ?? [])).catch(() => setErr(true));
  }, []);
  return (
    <main className="working-view">
      <p className="review-intro">Adopted documents still in <b>working</b> status — not yet finalized. Finalize in place with <code>node scripts/adopt-draft.ts --finalize &lt;id&gt;</code>; a document leaves this list once finalized.</p>
      {err ? <p className="muted">Working-docs API unavailable — start the board server (<code>node scripts/board-server.ts</code>).</p>
        : docs == null ? <p className="muted">Loading…</p>
        : docs.length === 0 ? <p className="muted">No working documents. Approved-and-adopted drafts appear here until finalized.</p>
        : (
          <table className="working-table">
            <thead><tr><th>Document</th><th>Serving tile</th><th>Adopted</th><th>Age (days)</th></tr></thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.slug}>
                  <td>{d.title} <span className="working-tag">working draft</span></td>
                  <td><span className="wt-name">{displayName(d.tile)}</span> <span className="wt-code">{d.tile}</span></td>
                  <td>{d.adoptedAt?.slice(0, 10)}</td>
                  <td className={d.ageDays > 30 ? "age-stale" : ""}>{d.ageDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </main>
  );
}

/** STEP 3d: approval-log view. The operator's ruling history — approve / reject / void records
 *  with notes, reasons, and timestamps, newest first. Voided entries are kept (struck through)
 *  so history is never lost. Sourced from /api/approval-log. */
function ApprovalLogView() {
  const [log, setLog] = useState<any[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch("/api/approval-log").then((r) => r.json()).then((d) => setLog(d.log ?? [])).catch(() => setErr(true));
  }, []);
  const decoClass = (d: string) => d === "approve" ? "log-approve" : d === "reject" ? "log-reject" : "log-void";
  return (
    <main className="log-view">
      <p className="review-intro">Ruling history — what was approved, rejected, or voided, and when. Voided entries are kept for the record.</p>
      {err ? <p className="muted">Approval-log API unavailable — start the board server (<code>node scripts/board-server.ts</code>).</p>
        : log == null ? <p className="muted">Loading…</p>
        : log.length === 0 ? <p className="muted">No rulings yet.</p>
        : (
          <table className="log-table">
            <thead><tr><th>When</th><th>Decision</th><th>Document / tile</th><th>Note / reason</th></tr></thead>
            <tbody>
              {log.map((r, i) => (
                <tr key={i} className={r.voided ? "log-voided-row" : ""}>
                  <td className="log-ts">{r.timestamp ? new Date(r.timestamp).toLocaleString() : ""}</td>
                  <td><span className={`log-badge ${decoClass(r.decision)}`}>{r.decision}</span>{r.status ? ` (${r.status})` : ""}{r.voided ? <span className="log-voided-tag">voided</span> : null}</td>
                  <td>{r.id}</td>
                  <td className="log-note">{r.note || r.reason || <span className="muted">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </main>
  );
}

/** Phase C: draft body with CLICK-TO-CHUNK reference expansion. Numbered references [1] / [E1] in
 *  the prose become clickable superscripts; clicking one shows its resolution (document title +
 *  chunk ids for corpus refs, source + url for external refs) from the sidecar reference map. */
function DraftBody({ body, refs, ext }: { body: string; refs: any[]; ext: any[] }) {
  const [sel, setSel] = useState<{ kind: "corpus" | "ext"; n: number } | null>(null);
  const html = useMemo(() =>
    richMdToHtml(body).replace(/\[(E?)(\d+)\]/g, (_w, e, n) => `<sup class="refnum" data-ref-kind="${e ? "ext" : "corpus"}" data-ref-n="${n}">${e}${n}</sup>`),
    [body]);
  const onClick = (ev: { target: EventTarget | null }) => {
    const t = ev.target as HTMLElement;
    if (t.classList.contains("refnum")) setSel({ kind: t.dataset.refKind as any, n: Number(t.dataset.refN) });
  };
  const detail = sel ? (sel.kind === "corpus" ? refs.find((r) => r.n === sel.n) : ext.find((r) => r.n === sel.n)) : null;
  return (
    <div className="rev-draft-wrap">
      <div className="md rev-draft" onClick={onClick} dangerouslySetInnerHTML={{ __html: html }} />
      {sel && detail ? (
        <div className="ref-pop" onClick={() => setSel(null)}>
          {sel.kind === "corpus"
            ? <><b>[{sel.n}] {detail.title}</b>{detail.slug ? <span className="muted"> · {detail.slug}</span> : null}{detail.chunks?.length ? <span className="muted"> · chunks {detail.chunks.join(", ")}</span> : null}</>
            : <><b>[E{sel.n}] {detail.label}</b>{detail.url ? <> · <a href={detail.url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>source</a></> : null}</>}
          <span className="ref-pop-x">click to dismiss</span>
        </div>
      ) : sel && !detail ? <div className="ref-pop" onClick={() => setSel(null)}>Reference not resolved in the sidecar map. <span className="ref-pop-x">dismiss</span></div> : null}
    </div>
  );
}

/** Phase C: the pending-review QUEUE (survives 15+ drafts). Sortable by category / gap-class /
 *  open-ruling count; per-draft status chips (validator, self-review, authority, harness) —
 *  all green = ready for review. */
function QueueView({ pending, onOpen }: { pending: any[]; onOpen: (name: string) => void }) {
  const [sort, setSort] = useState<"category" | "gap-class" | "open-rulings">("category");
  const cat = (id: string) => (id.match(/^[A-Z]+/) ?? ["?"])[0];
  const items = useMemo(() => {
    const rows = pending.map((d) => ({ ...d, id: d.meta.subcategory ?? d.name }));
    const key = (r: any) => sort === "category" ? cat(r.id) : sort === "gap-class" ? (r.meta.gap_class ?? "z") : String(1000 - (r.status?.openRulings ?? 0)).padStart(4, "0");
    return rows.sort((a, b) => key(a).localeCompare(key(b)) || a.id.localeCompare(b.id));
  }, [pending, sort]);
  const chip = (ok: boolean | null, label: string, extra?: string) =>
    ok == null ? <span className="qchip qchip--na" title={`${label}: n/a`}>{label}</span>
      : <span className={`qchip ${ok ? "qchip--ok" : "qchip--bad"}`} title={`${label}${extra ? " " + extra : ""}`}>{label}{extra ? ` ${extra}` : ""}</span>;
  return (
    <div className="queue" role="note">
      <div className="queue-head">
        <span className="pending-title">Review queue ({pending.length})</span>
        <span className="queue-sort">sort:
          {(["category", "gap-class", "open-rulings"] as const).map((s) => (
            <button key={s} className={sort === s ? "on" : ""} onClick={() => setSort(s)}>{s}</button>
          ))}
        </span>
      </div>
      <ul className="queue-list">
        {items.map((d) => {
          const st = d.status;
          const ready = st && st.validator && st.selfReview !== false && st.harness;
          return (
            <li key={d.name} className={ready ? "q-ready" : ""}>
              <button className="q-open" onClick={() => onOpen(d.name)}>
                {/* Name-first (07/18 review, operator rule 1): draft named by its subcategory's human name. */}
                <span className="q-name">{displayName(d.id)}</span>
                <span className="q-id">{d.id}</span>
                {d.meta.mode ? <span className="q-mode" title="production mode (07/18 matrix)">{d.meta.mode}</span> : null}
                <span className="pending-cls">{d.meta.gap_class ?? "draft"}</span>
                {st ? <span className="q-chips">
                  {chip(st.validator, "validator")}
                  {chip(st.selfReview, "self-review", st.selfReviewSummary ?? undefined)}
                  {chip(st.authority != null, "authority", st.authority != null ? `(${st.authority})` : undefined)}
                  {chip(st.harness, "harness")}
                  {/* 07/18 adversarial gate: client-ready | adequate-with-reservations (not-client-ready never queues). */}
                  {st.adversarial ? <span className={`qchip ${st.adversarial === "client-ready" ? "qchip--ok" : "qchip--info"}`} title={`adversarial gate: ${st.adversarial}`}>gate: {st.adversarial === "client-ready" ? "clear" : "reservations"}</span> : null}
                  {st.openRulings ? <span className="qchip qchip--info" title="open rulings">{st.openRulings} rulings</span> : null}
                  {ready ? <span className="qchip qchip--ready">ready</span> : null}
                </span> : <span className="q-chips"><span className="qchip qchip--na">no sidecar</span></span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** STEP 4b: the Decisions-required answer form. Parses the numbered questions from the draft's
 *  "## Decisions required" section, renders an answer field each (a diligence questionnaire), saves
 *  answers, and regenerates the pipeline with the answers injected as company rulings. */
function DecisionsForm({ review, onSave, onRegenerate }: {
  review: any; onSave?: (a: Record<string, string>) => void; onRegenerate: (a: Record<string, string>) => void;
}) {
  const questions = useMemo(() => {
    const md = String(review.markdown ?? "");
    const sec = md.split(/^##\s+Decisions required\s*$/m)[1] ?? "";
    return sec.split("\n").map((l) => l.match(/^\s*\d+\.\s+(.*\S)/)).filter(Boolean).map((m) => (m as RegExpMatchArray)[1].trim());
  }, [review.markdown]);
  const [answers, setAnswers] = useState<Record<string, string>>(review.answers ?? {});
  const [busy, setBusy] = useState(false);
  if (questions.length === 0) return null;
  const answered = questions.filter((q) => (answers[q] ?? "").trim()).length;
  return (
    <section className="dsec decisions">
      <h3>Decisions required <span className="muted">({answered}/{questions.length} answered)</span></h3>
      <p className="muted">Answer what you can; a "Regenerate with answers" turns each answer into a company ruling stated as fact in the document (attributed in the sidecar, not in prose).</p>
      <ol className="dq-list">
        {questions.map((q, i) => (
          <li key={i}>
            <div className="dq-q">{q}</div>
            <textarea className="dq-a" rows={2} placeholder="Company ruling (optional)…" value={answers[q] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [q]: e.target.value })} />
          </li>
        ))}
      </ol>
      <div className="dq-controls">
        {onSave ? <button className="ctl" disabled={busy} onClick={() => onSave(answers)}>Save answers</button> : null}
        <button className="ctl ctl-approve" disabled={busy || answered === 0} onClick={async () => { setBusy(true); try { await onRegenerate(answers); } finally { setBusy(false); } }}>
          {busy ? "Regenerating…" : `Regenerate with ${answered} answer${answered === 1 ? "" : "s"}`}
        </button>
      </div>
    </section>
  );
}

/** Exception surface (GENERATION-STANDARD.md stage 6): the pre-approval scaffolding the operator
 *  reviews by exception — mechanical validator result, structural self-review per-section verdicts,
 *  and the authority report (findings + sources). Rendered beside the draft's coverage map. */
function ExceptionSurface({ pipeline }: { pipeline: any }) {
  const v = pipeline.validator, s = pipeline.structure, a = pipeline.authority, adv = pipeline.adversarial;
  return (
    <>
      {adv ? (
        <section className="dsec exc"><h3>Adversarial gate <span className={`vbadge vbadge--${adv.verdict === "client-ready" ? "green" : "info"}`}>{adv.verdict}</span> <span className="muted">(blind {adv.model})</span></h3>
          {adv.verdict === "adequate-with-reservations" && (adv.reservations ?? []).length ? (
            <><p className="muted">Passed with reservations — attach before sending:</p>
            <ul className="exc-checks">{adv.reservations.map((r: string, i: number) => <li key={i} className="chk-bad">{r}</li>)}</ul></>
          ) : <p className="muted">Cleared the blind recipient-persona review. (A not-client-ready verdict blocks a draft from the queue.)</p>}
        </section>
      ) : null}
      {v ? (
        <section className="dsec exc"><h3>Mechanical validator {v.pass ? <span className="exc-ok">PASS</span> : <span className="exc-bad">FAIL</span>}</h3>
          <ul className="exc-checks">{(v.checks ?? []).map((c: any, i: number) => (
            <li key={i} className={c.pass ? "chk-ok" : "chk-bad"}><b>{c.pass ? "✓" : "✗"}</b> {c.check} — <span className="muted">{c.detail}</span></li>
          ))}</ul>
        </section>
      ) : null}
      {s ? (
        <section className="dsec exc"><h3>Structural self-review <span className="muted">({s.model})</span></h3>
          <table className="exc-table"><tbody>{(s.verdicts ?? []).map((x: any, i: number) => (
            <tr key={i}><td><span className={`sv sv-${x.verdict}`}>{x.verdict}</span></td><td>{x.section}</td><td className="muted">{x.reason}</td></tr>
          ))}</tbody></table>
        </section>
      ) : null}
      {a ? (
        <section className="dsec exc"><h3>Authority review <span className="muted">(checked {a.checkDate} · {a.searchesUsed} searches · {a.model})</span></h3>
          {(a.findings ?? []).length === 0 ? <p className="muted">No material findings — sections match the current standard formulation.</p> : (
            <ul className="exc-findings">{a.findings.map((f: any, i: number) => (
              <li key={i}><span className={`sv sv-${f.disposition === "open-ruling" ? "thin" : "pass"}`}>{f.disposition ?? "applied"}</span> <b>{f.section}</b> — {f.finding} <span className="muted">[{f.source}{f.year ? `, ${f.year}` : ""}]</span>{f.url ? <> · <a href={f.url} target="_blank" rel="noreferrer">source</a></> : null}</li>
            ))}</ul>
          )}
        </section>
      ) : null}
    </>
  );
}

/** Review + approval surface (board-driven remediation). Layout order is contractual:
 *  (1) PURPOSE — criterion + elements, always first; (2) the rendered draft (coverage map
 *  and sources are inside it); (3) decision controls. Approve is enabled ONLY for
 *  artifact-sufficient gaps, per-document, explicit — no batch, no auto-ingest. */
function RemediationReview({ review, criterion, elements, onApprove, onReject, onSaveAnswers, onRegenerate, onOverrideMode, onAttest, failure, onDismissFailure, onClose }: {
  review: any; criterion: string; elements: ElementFinding[];
  onApprove: (note: string, status: "working" | "final") => void; onReject: (note: string) => void;
  onSaveAnswers?: (answers: Record<string, string>) => void; onRegenerate?: (answers: Record<string, string>) => void;
  onOverrideMode?: (mode: "artifact" | "plan") => void; onAttest?: (reviewer: "attorney" | "hr") => Promise<boolean>;
  failure?: { failures: string[] } | null; onDismissFailure?: () => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [attested, setAttested] = useState(false);
  if (review.error) {
    return <div className="drawer-scrim" onClick={onClose}><aside className="review-panel" onClick={(e) => e.stopPropagation()}><div className="drawer-head"><h2>Remediation</h2><button className="close" onClick={onClose}>×</button></div><p className="muted">{review.error}</p></aside></div>;
  }
  // DISPLAY body: strip the pipeline preamble (metadata comment, DRAFT banner, doctrine
  // blockquote) and render markdown richly (headings, lists, real tables, code/blockquote).
  const body = stripDraftPreamble(String(review.markdown ?? ""));
  // 07/18 mode matrix. Plan mode: approvable working-only, never flips, never final. professional_review
  // != none: final blocked until an attestation is recorded. Backward-compatible with legacy drafts.
  const mode: "artifact" | "plan" = review.mode === "plan" ? "plan" : "artifact";
  const isPlan = mode === "plan";
  const pr: string = review.professionalReview ?? "none";
  const needsReview = pr !== "none";
  const approvable = review.approvableWorking != null ? !!review.approvableWorking : (isPlan || review.flippable === true || review.flippable === "true");
  const finalAllowed = isPlan ? false : (needsReview ? (review.flippable !== false && attested) : review.approveFinal === true);
  const otherMode = isPlan ? "artifact" : "plan";
  return (
    <div className="drawer-scrim" onClick={onClose}>
      <aside className="review-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          {/* Name-first (07/18 review, operator rule 1): the deliverable leads with its subcategory's human name. */}
          <h2><span className="dtitle">{displayName(review.id)}</span> <span className="drawer-code">{review.id}</span> <span className={`vbadge vbadge--${isPlan ? "info" : "info"}`}>{isPlan ? "plan" : "artifact"} mode</span> <span className={`vbadge vbadge--info`}>{review.gapClass}</span></h2>
          <button className="close" onClick={onClose} aria-label="close">×</button>
        </div>

        {/* In-surface failure panel (replaces alert()) for validator/gate failures. Plain-language
            headline — no chunk ids or internal vocab; raw detail lives in the expandable section. */}
        {failure ? (
          <div className="failpanel" role="alert">
            <div className="failpanel-head">
              <h3>This draft couldn't be produced</h3>
              {onDismissFailure ? <button className="close" onClick={onDismissFailure} aria-label="dismiss">×</button> : null}
            </div>
            <p>An automated quality check didn't pass, so no new draft was created this time. Your saved answers are kept — adjust them if needed and try again.</p>
            <details><summary>Technical details</summary>
              <ul>{failure.failures.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </details>
          </div>
        ) : null}

        {/* 07/18 mode matrix: state the resolved mode + its basis, with an operator override control. */}
        <div className="mode-banner" role="note">
          <span className="mode-line">{isPlan
            ? "Produced as a PLAN (gap-closure plan, not the target document; approvable as working only, never flips a tile)"
            : "Produced as the ARTIFACT (the target document)"}{review.modeBasis ? ` — ${review.modeBasis}` : ""}.</span>
          {needsReview ? <span className="mode-pr"> Requires {pr} review before finalize.</span> : null}
          {onOverrideMode ? <button className="ctl ctl-mode" title={`Force ${otherMode} mode and regenerate`} onClick={() => onOverrideMode(otherMode)}>Regenerate as {otherMode}</button> : null}
        </div>

        <section className="dsec"><h3>Purpose — the criterion</h3><Md text={criterion} /></section>
        {elements.length ? (
          <section className="dsec"><h3>Elements ({elements.length})</h3>
            <ul className="rev-els">{elements.map((e, i) => <li key={i} className={`el-state--${e.state}`}>{elementLabel(e.element)} — {e.state}</li>)}</ul>
          </section>
        ) : null}

        <section className="dsec"><h3>Draft</h3><DraftBody body={body} refs={review.pipeline?.references ?? []} ext={review.pipeline?.externalReferences ?? []} /></section>

        {onRegenerate ? <DecisionsForm review={review} onSave={onSaveAnswers} onRegenerate={onRegenerate} /> : null}
        {review.pipeline ? <ExceptionSurface pipeline={review.pipeline} /> : null}

        <section className="dsec rev-controls">
          {approvable ? (
            <>
              <button className="ctl ctl-approve" onClick={() => onApprove(note, "working")}>Approve as working</button>
              {/* 07/18 invariants: plan is working-only (never flips); professional_review needs attestation. */}
              {finalAllowed
                ? <button className="ctl ctl-approve-final" onClick={() => onApprove(note, "final")}>Approve as final</button>
                : isPlan
                  ? <span className="muted" title="A plan is a working record only — it never flips a tile, so it is never finalized">Approve as final disabled — plan (working only, never flips)</span>
                  : needsReview
                    ? <span className="muted" title={`Requires a ${pr} review attestation before finalize`}>Approve as final disabled — requires {pr} review before finalize</span>
                    : null}
            </>
          ) : (
            <span className="muted" title="Only artifact-sufficient gaps (or plan-mode drafts) are approvable per GAP-CLASS-DOCTRINE">Not approvable — {review.gapClass} (recommendation/scaffold only)</span>
          )}
          {needsReview && !attested && onAttest ? (
            <button className="ctl ctl-attest" title={`Record a ${pr} review attestation (reviewer type + date) so finalize is permitted`}
              onClick={async () => { const ok = await onAttest(pr as "attorney" | "hr"); if (ok) setAttested(true); }}>
              Record {pr} review attestation
            </button>
          ) : null}
          {needsReview && attested ? <span className="attest-ok" title="attestation recorded">{pr} review recorded ✓</span> : null}
          <button className="ctl ctl-reject" onClick={() => onReject(note)}>Reject with note</button>
          <button className="ctl" onClick={() => downloadDocx(review.markdown ?? "", `${review.id} — ${displayName(review.id)}`, review.name ?? `${review.id}.md`)}>Download DOCX</button>
          <button className="ctl ctl-md" title="developer: raw markdown" onClick={() => { const blob = new Blob([review.markdown ?? ""], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = (review.name ?? `${review.id}.md`); a.click(); }}>.md</button>
          <input className="rev-note" placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </section>

        {approvable && !isPlan ? (
          <section className="dsec rev-finalize">
            <h3>Adopt / finalize (operator commands)</h3>
            <p className="muted">Approval records the decision; ingesting into the corpus is a deliberate operator command (it mutates the corpus and costs embedding). Run:</p>
            <pre className="cmd">node scripts/adopt-draft.ts {review.id} {review.name ?? `${review.id}-remediation-DRAFT.md`} --status working</pre>
            <p className="muted">When the working document is confirmed in production, finalize it in place:</p>
            <pre className="cmd">node scripts/adopt-draft.ts --finalize {review.id}</pre>
          </section>
        ) : approvable && isPlan ? (
          <section className="dsec rev-finalize">
            <h3>Plan — working record only</h3>
            <p className="muted">A gap-closure plan is never adopted into the corpus and never flips a tile (zero grade movement, any gap class). Approve it as working to record it; the tile moves only on later naturally-produced evidence that the plan was executed.</p>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
