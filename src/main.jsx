import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  Anchor,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Database,
  ExternalLink,
  FileJson,
  FileText,
  Filter,
  GitBranch,
  Layers3,
  LayoutDashboard,
  Link2,
  LoaderCircle,
  MapPin,
  Menu,
  Network,
  Play,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  Upload,
  Workflow,
  X,
  AlertTriangle,
  Braces,
  RotateCcw,
  Info,
} from "lucide-react";
import {
  investigateShipment,
  listShipments,
  FEED_NAMES,
} from "../core/investigator.mjs";
import "./styles.css";
import TemperatureChart from "./TemperatureChart.jsx";

const statusMeta = {
  excursion: {
    label: "Excursion detected",
    short: "Exception",
    color: "orange",
  },
  sensor_bias: {
    label: "Sensor bias identified",
    short: "Sensor fault",
    color: "blue",
  },
  insufficient_evidence: {
    label: "More evidence needed",
    short: "Needs evidence",
    color: "purple",
  },
  within_range: {
    label: "Within observed range",
    short: "In range",
    color: "green",
  },
};
const sourceNames = {
  manifest: "Shipment manifest",
  telemetry: "Sensor telemetry",
  incidents: "Carrier events",
  calibration: "Calibration register",
};
const sourceIcons = {
  manifest: FileText,
  telemetry: Activity,
  incidents: MapPin,
  calibration: ShieldCheck,
};
const time = (value) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
const cls = (...s) => s.filter(Boolean).join(" ");
const download = (filename, value, type = "application/json") => {
  const u = URL.createObjectURL(
    new Blob(
      [typeof value === "string" ? value : JSON.stringify(value, null, 2)],
      { type },
    ),
  );
  const a = document.createElement("a");
  a.href = u;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};

function Tag({ outcome, children }) {
  return (
    <span className={cls("tag", statusMeta[outcome]?.color)}>
      <i />
      {children || statusMeta[outcome]?.label}
    </span>
  );
}
function App() {
  const [feeds, setFeeds] = useState(null),
    [loadError, setLoadError] = useState(""),
    [selected, setSelected] = useState("TH-1041"),
    [view, setView] = useState("Investigations"),
    [tab, setTab] = useState("Overview"),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all"),
    [ignoreCalibration, setIgnoreCalibration] = useState(false),
    [excluded, setExcluded] = useState([]),
    [evidenceId, setEvidenceId] = useState(null),
    [busy, setBusy] = useState(false),
    [runningShipment, setRunningShipment] = useState(null),
    [runTime, setRunTime] = useState(null),
    [toast, setToast] = useState(""),
    [mobileNav, setMobileNav] = useState(false),
    [showSettings, setShowSettings] = useState(false),
    [mode, setMode] = useState("sample"),
    [liveResult, setLiveResult] = useState(null),
    [liveError, setLiveError] = useState(""),
    [editRow, setEditRow] = useState(""),
    [editValue, setEditValue] = useState("");
  const upload = useRef();
  const currentContext = useRef();
  currentContext.current = { selected, mode, feeds, ignoreCalibration, excluded };
  useEffect(() => {
    if (!evidenceId && !showSettings) return;
    const previous = document.activeElement;
    const dialog = document.querySelector('[role="dialog"]');
    if (!dialog) return;
    const focusables = () => [
      ...dialog.querySelectorAll(
        'button:not(:disabled),a[href],input,select,[tabindex="0"]',
      ),
    ];
    focusables()[0]?.focus();
    const handle = (e) => {
      if (e.key === "Escape") {
        setEvidenceId(null);
        setShowSettings(false);
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (!items.length) return;
        if (e.shiftKey && document.activeElement === items[0]) {
          e.preventDefault();
          items.at(-1).focus();
        } else if (!e.shiftKey && document.activeElement === items.at(-1)) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [evidenceId, showSettings]);
  useEffect(() => {
    Promise.all(
      FEED_NAMES.map(async (n) => {
        const r = await fetch(`/data/${n}.json`);
        if (!r.ok) throw Error(`Unable to load ${n}`);
        return [n, await r.json()];
      }),
    )
      .then((x) => setFeeds(Object.fromEntries(x)))
      .catch((e) => setLoadError(e.message));
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(id);
  }, [toast]);
  const all = useMemo(
    () =>
      feeds
        ? listShipments(feeds)
            .map((s) => {
              try {
                return investigateShipment(feeds, s.shipment_id);
              } catch (e) {
                return null;
              }
            })
            .filter(Boolean)
        : [],
    [feeds],
  );
  const base = all.find((x) => x.shipment.shipment_id === selected) || all[0];
  const analysis = useMemo(() => {
    if (!feeds || !base) return null;
    try {
      return investigateShipment(feeds, base.shipment.shipment_id, {
        ignoreCalibration,
        excludeRowIds: excluded,
      });
    } catch (e) {
      return { ...base, editError: e.message };
    }
  }, [feeds, base, ignoreCalibration, excluded]);
  const result = mode === "live" && liveResult ? liveResult : analysis;
  const effectiveMode = mode === "live" && liveResult ? "live" : "sample";
  const evidence = result?.evidence.find((x) => x.id === evidenceId);
  const filtered = all.filter(
    (r) =>
      (filter === "all" || r.outcome === filter) &&
      `${r.shipment.shipment_id} ${r.shipment.route} ${r.shipment.consignee}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const notify = (s) => setToast(s);
  function select(id) {
    setSelected(id);
    setIgnoreCalibration(false);
    setExcluded([]);
    setEvidenceId(null);
    setTab("Overview");
    setLiveResult(null);
    setLiveError("");
    setRunTime(null);
    setView("Investigations");
  }
  async function run() {
    const requestContext = currentContext.current;
    const isCurrent = () => Object.entries(requestContext).every(
      ([key, value]) => currentContext.current[key] === value,
    );
    setBusy(true);
    setRunningShipment(selected);
    setLiveError("");
    const start = performance.now();
    try {
      if (mode === "live") {
        const r = await fetch("/api/investigate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipmentId: selected, mode: "live" }),
          signal: AbortSignal.timeout(310_000),
        });
        const body = await r.json().catch(() => null);
        if (!r.ok)
          throw Error(
            body?.error || `Live service unavailable (${r.status}). Check the local server and configured sponsor services.`,
          );
        if (!body?.result?.evidence)
          throw Error(
            "The live server did not return a verified investigation.",
          );
        if (!isCurrent()) return;
        setLiveResult(body.result);
      } else {
        investigateShipment(feeds, selected, {
          ignoreCalibration,
          excludeRowIds: excluded,
        });
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      if (!isCurrent()) return;
      setRunTime(Math.round(performance.now() - start));
      notify(
        mode === "sample"
          ? "Investigation recomputed from source records."
          : "Live investigation completed.",
      );
    } catch (e) {
      if (isCurrent()) setLiveError(e.message);
    } finally {
      setBusy(false);
      setRunningShipment(null);
    }
  }
  async function importFile(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 2_000_000)
        throw Error("Use a dataset smaller than 2 MB.");
      const next = JSON.parse(await file.text());
      for (const n of FEED_NAMES)
        if (!Array.isArray(next[n]?.records))
          throw Error(`Missing ${n}.records`);
      if (
        next.manifest.records.length > 50 ||
        FEED_NAMES.some((n) => next[n].records.length > 5000)
      )
        throw Error(
          "Keep inputs to 50 shipments and 5,000 records per source.",
        );
      const first = next.manifest.records[0]?.shipment_id;
      for (const shipment of next.manifest.records)
        investigateShipment(next, shipment.shipment_id);
      setMode("sample");
      setFeeds(next);
      select(first);
      notify("Your dataset is loaded. Conclusions are recomputed locally.");
    } catch (e) {
      notify(e.message);
    }
    event.target.value = "";
  }
  function applyReading() {
    try {
      const n = Number(editValue);
      if (!editRow || !Number.isFinite(n) || editValue.trim() === "")
        throw Error("Choose a reading and enter a temperature.");
      const next = structuredClone(feeds);
      next.telemetry.records = next.telemetry.records.map((r) =>
        r.row_id === editRow ? { ...r, temperature_c: n } : r,
      );
      setFeeds(next);
      setMode("sample");
      setLiveResult(null);
      notify(
        "Reading changed. All findings have been recomputed in sample mode.",
      );
    } catch (e) {
      notify(e.message);
    }
  }
  if (!feeds)
    return (
      <main className="loading">
        <Anchor size={40} />
        <h1>TraceHarbor</h1>
        {loadError ? (
          <p role="alert">{loadError}</p>
        ) : (
          <>
            <LoaderCircle className="spin" />
            <p>Loading the evidence workspace…</p>
          </>
        )}
      </main>
    );
  if (!result)
    return <main className="loading">No valid shipments in this dataset.</main>;
  return (
    <div className="shell">
      <aside className={cls("sidebar", mobileNav && "open")}>
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView("Investigations");
          }}
        >
          <span className="brand-mark">
            <Anchor size={23} />
          </span>
          TraceHarbor<span className="brand-period">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">V</span>
          <div>
            <strong>Vengers workspace</strong>
            <small>Open Agent Hackathon 2026</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav>
          {[
            [LayoutDashboard, "Investigations"],
            [Database, "Data sources"],
            [Workflow, "How it works"],
          ].map(([Icon, label]) => (
            <button
              key={label}
              className={cls("nav-item", view === label && "active")}
              onClick={() => {
                setView(label);
                setMobileNav(false);
              }}
            >
              <Icon size={18} />
              {label}
              {label === "Investigations" && (
                <span className="count">{all.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="built-for">
            <span className="eyebrow">EVIDENCE OVER ASSUMPTION</span>
            <p>Every conclusion has a trail.</p>
            <div className="small-network">
              <i />
              <span />
              <i />
              <span />
              <i />
            </div>
            <small>Connected data. Checkable reasoning.</small>
          </div>
          <button className="nav-item" onClick={() => setShowSettings(true)}>
            <Settings2 size={18} />
            Runtime & disclosure
            <ArrowUpRight size={14} />
          </button>
          <a
            className="repo-link"
            href="https://github.com/madvidd/GenAI.works_Hackathon"
            target="_blank"
            rel="noreferrer"
          >
            <GitBranch size={16} />
            Source repository
            <ExternalLink size={13} />
          </a>
          <div className="profile">
            <span>V</span>
            <div>
              <strong>Team Vengers</strong>
              <small>Track 02 · Explain why</small>
            </div>
            <span className="online-dot" />
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button menu-toggle"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{view}</strong>
          </div>
          <div className="topbar-right">
            <button className="mode-pill" onClick={() => setShowSettings(true)}>
              <span className="online-dot" />
              {mode === "sample"
                ? "Sample workspace"
                : liveResult
                  ? "Live result verified"
                  : "Live selected · sample preview"}
              <ChevronDown size={12} />
            </button>
            <span className="avatar">V</span>
          </div>
        </header>
        <main>
          {view === "Investigations" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span className="tiny-line" />
                    SHIPMENT INTELLIGENCE
                  </div>
                  <h1>Every exception, explained.</h1>
                  <p>
                    Follow the evidence from a flagged shipment to a defensible
                    next step.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => upload.current.click()}
                >
                  <Upload size={16} />
                  Import dataset
                </button>
                <input
                  type="file"
                  accept="application/json,.json"
                  ref={upload}
                  onChange={importFile}
                  hidden
                />
              </div>
              <div className="summary-strip">
                <div className="summary-intro">
                  <span className="status-dot" />
                  Your investigation queue
                  <small>
                    4 connected source types ·{" "}
                    {FEED_NAMES.every((n) => feeds[n].synthetic)
                      ? "synthetic records"
                      : "imported records"}
                  </small>
                </div>
                <div>
                  <strong>{all.length.toString().padStart(2, "0")}</strong>
                  <span>Shipments</span>
                </div>
                <div>
                  <strong className="text-orange">
                    {all
                      .filter((x) => x.outcome === "excursion")
                      .length.toString()
                      .padStart(2, "0")}
                  </strong>
                  <span>Observed exceptions</span>
                </div>
                <div>
                  <strong className="text-purple">
                    {all
                      .filter((x) => x.outcome === "insufficient_evidence")
                      .length.toString()
                      .padStart(2, "0")}
                  </strong>
                  <span>Evidence gaps</span>
                </div>
                <div>
                  <strong>
                    {all
                      .reduce((n, r) => n + r.contradictions.length, 0)
                      .toString()
                      .padStart(2, "0")}
                  </strong>
                  <span>Conflicting claims</span>
                </div>
              </div>
              <div className="investigation-layout">
                <section className="queue-panel">
                  <div className="queue-header">
                    <h2>
                      Investigations <span>{all.length}</span>
                    </h2>
                    <button
                      className="icon-button"
                      aria-label="Filter investigations"
                      onClick={() =>
                        setFilter(
                          filter === "all" ? "insufficient_evidence" : "all",
                        )
                      }
                    >
                      <Filter size={16} />
                    </button>
                  </div>
                  <label className="search">
                    <Search size={16} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Find a shipment…"
                      aria-label="Find a shipment"
                    />
                    <kbd>/</kbd>
                  </label>
                  <div className="queue-filter">
                    <button
                      className={filter === "all" ? "selected" : ""}
                      onClick={() => setFilter("all")}
                    >
                      All shipments
                    </button>
                    <button
                      className={filter !== "all" ? "selected" : ""}
                      onClick={() => setFilter("insufficient_evidence")}
                    >
                      Evidence gaps
                    </button>
                  </div>
                  <div className="shipment-list">
                    {filtered.map((r) => (
                      <button
                        className={cls(
                          "shipment-card",
                          selected === r.shipment.shipment_id && "selected",
                        )}
                        key={r.shipment.shipment_id}
                        onClick={() => select(r.shipment.shipment_id)}
                      >
                        <div className="shipment-card-top">
                          <strong>{r.shipment.shipment_id}</strong>
                          <span
                            className={cls(
                              "mini-status",
                              statusMeta[r.outcome].color,
                            )}
                          >
                            {statusMeta[r.outcome].short}
                          </span>
                        </div>
                        <p>
                          {r.shipment.origin}
                          <ArrowRight size={12} />
                          {r.shipment.destination}
                        </p>
                        <small>
                          {r.shipment.consignee.replace(" Demo", "")}
                        </small>
                        <div className="shipment-card-bottom">
                          <span>
                            <Link2 size={12} />
                            {r.evidence.length} records
                          </span>
                          <span>
                            <Clock3 size={12} />
                            {time(r.shipment.investigation_window_start)} UTC
                          </span>
                        </div>
                      </button>
                    ))}
                    {!filtered.length && (
                      <div className="empty">
                        No shipments match your search.
                        <button
                          onClick={() => {
                            setQuery("");
                            setFilter("all");
                          }}
                        >
                          Clear filters
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="queue-foot">
                    <ShieldCheck size={15} />
                    <span>
                      Source records preserved.
                      <br />
                      Conclusions remain inspectable.
                    </span>
                  </div>
                </section>
                <section className="dossier">
                  <div className="dossier-header">
                    <div>
                      <div className="overline">
                        INVESTIGATION DOSSIER <span>/{selected}</span>
                      </div>
                      <h2>
                        <span>{result.shipment.origin}</span>
                        <ArrowRight size={20} />
                        <span>{result.shipment.destination}</span>
                      </h2>
                      <div className="dossier-meta">
                        <span>{selected}</span>
                        <i /> <span>{result.shipment.primary_sensor_id}</span>
                        <i />
                        <span>
                          {new Date(
                            result.shipment.investigation_window_start,
                          ).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            timeZone: "UTC",
                          })}{" "}
                          · {time(result.shipment.investigation_window_start)}–
                          {time(result.shipment.investigation_window_end)} UTC
                        </span>
                      </div>
                    </div>
                    <button
                      className="icon-button export-button"
                      aria-label="Export investigation dossier as JSON"
                      title="Export dossier"
                      onClick={() =>
                        download(`${selected}-dossier.json`, {
                          ...result,
                          exportedAt: new Date().toISOString(),
                          runtimeMode: effectiveMode,
                        })
                      }
                    >
                      <ArrowDownToLine size={19} />
                    </button>
                  </div>
                  <div className="dossier-tabs">
                    {["Overview", "Evidence", "Reasoning", "What if"].map(
                      (t) => (
                        <button
                          key={t}
                          onClick={() => setTab(t)}
                          className={tab === t ? "active" : ""}
                        >
                          {t}
                          {t === "Evidence" && (
                            <span>{result.evidence.length}</span>
                          )}
                          {t === "What if" && <Sparkles size={12} />}
                        </button>
                      ),
                    )}
                    <span className="verified-label">
                      <CheckCheck size={14} />
                      Citations checked
                    </span>
                  </div>
                  {(ignoreCalibration || excluded.length > 0) && (
                    <div className="experiment-banner">
                      <SlidersHorizontal size={16} />
                      Evidence experiment active
                      <button
                        onClick={() => {
                          setIgnoreCalibration(false);
                          setExcluded([]);
                        }}
                      >
                        Reset <RotateCcw size={12} />
                      </button>
                    </div>
                  )}
                  {liveError && (
                    <div className="error-banner" role="alert">
                      {liveError}
                    </div>
                  )}
                  {result.editError && (
                    <div className="error-banner" role="alert">
                      {result.editError}
                    </div>
                  )}
                  <div className="dossier-content">
                    {tab === "Overview" && (
                      <>
                        <div
                          className={cls(
                            "conclusion",
                            statusMeta[result.outcome].color,
                          )}
                        >
                          <div className="conclusion-icon">
                            {result.outcome === "within_range" ? (
                              <CheckCircle2 size={25} />
                            ) : result.outcome === "insufficient_evidence" ? (
                              <Search size={25} />
                            ) : (
                              <GitBranch size={25} />
                            )}
                          </div>
                          <div>
                            <div className="conclusion-label">
                              THE EVIDENCE INDICATES
                            </div>
                            <h3>{result.title}</h3>
                            <p>{result.summary}</p>
                            <div className="conclusion-meta">
                              <span>
                                <ShieldCheck size={13} />
                                {result.confidence.label}
                              </span>
                              <span>Bounded to this observation window</span>
                            </div>
                          </div>
                        </div>
                        <div className="metrics">
                          <Metric
                            icon={Thermometer}
                            label="Corrected peak"
                            value={`${result.metrics.correctedPeakC ?? "—"}°C`}
                            detail={`Raw sensor peak ${result.metrics.rawPeakC ?? "—"}°C`}
                          />
                          <Metric
                            icon={Activity}
                            label="Observation coverage"
                            value={`${result.coverage.percent}%`}
                            detail={`${result.coverage.observedCount} of ${result.coverage.expectedCount} expected readings`}
                          />
                          <Metric
                            icon={GitBranch}
                            label="Source conflicts"
                            value={result.contradictions.length
                              .toString()
                              .padStart(2, "0")}
                            detail="Original claims retained"
                          />
                        </div>
                        <div className="chart-panel">
                          <div className="section-heading">
                            <div>
                              <h3>Temperature, with context</h3>
                              <p>
                                Raw readings reconciled against confirmed
                                calibration
                              </p>
                            </div>
                            <span className="unit-label">°C · UTC</span>
                          </div>
                          <TemperatureChart
                            result={result}
                            onEvidence={setEvidenceId}
                          />
                          <div className="chart-legend">
                            <span>
                              <i className="legend-line raw" />
                              Raw sensor
                            </span>
                            <span>
                              <i className="legend-line corrected" />
                              Corrected
                            </span>
                            <span>
                              <i className="legend-zone" />
                              Stated range {result.shipment.min_temp_c}–
                              {result.shipment.max_temp_c}°C
                            </span>
                          </div>
                        </div>
                        <div className="findings-grid">
                          <section>
                            <div className="section-heading">
                              <h3>Why this conclusion?</h3>
                              <span className="small-number">
                                {result.findings.length
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            </div>
                            <div className="findings">
                              {result.findings.map((f, i) => (
                                <div className="finding" key={f.id}>
                                  <span className="finding-number">
                                    {i + 1}
                                  </span>
                                  <div>
                                    <strong>{f.title}</strong>
                                    <p>{f.detail}</p>
                                    <Citations
                                      ids={f.citationIds}
                                      open={setEvidenceId}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </section>
                          <section className="next-action">
                            <span className="eyebrow">
                              <ArrowUpRight size={14} />
                              RECOMMENDED NEXT STEP
                            </span>
                            <h3>{result.actions[0]?.title}</h3>
                            <p>{result.actions[0]?.reason}</p>
                            <Citations
                              ids={result.actions[0]?.citationIds || []}
                              open={setEvidenceId}
                            />
                            <div className="human-note">
                              <ShieldCheck size={15} />
                              Human operational decision required
                            </div>
                          </section>
                        </div>
                        {!!result.contradictions.length && (
                          <section className="conflicts">
                            <div className="section-heading">
                              <h3>
                                <GitBranch size={16} />
                                Claims that did not survive scrutiny
                              </h3>
                              <span>{result.contradictions.length}</span>
                            </div>
                            {result.contradictions.map((c) => (
                              <div className="conflict" key={c.id}>
                                <span className="conflict-icon">
                                  <X size={14} />
                                </span>
                                <div>
                                  <strong>{c.claim}</strong>
                                  <p>{c.counterEvidence}</p>
                                  <Citations
                                    ids={c.citationIds}
                                    open={setEvidenceId}
                                  />
                                </div>
                              </div>
                            ))}
                          </section>
                        )}
                      </>
                    )}
                    {tab === "Evidence" && (
                      <EvidenceView
                        result={result}
                        open={setEvidenceId}
                        excluded={excluded}
                        setExcluded={(next) => {
                          setMode("sample");
                          setLiveResult(null);
                          setExcluded(next);
                        }}
                      />
                    )}
                    {tab === "Reasoning" && (
                      <>
                        <div className="section-heading">
                          <div>
                            <h3>A trail you can inspect</h3>
                            <p>
                              {effectiveMode === "sample"
                                ? "Actual deterministic computation stages. No model calls in sample mode."
                                : "Live execution and source receipts."}
                            </p>
                          </div>
                          <Workflow size={23} />
                        </div>
                        <div className="reasoning-list">
                          {result.trace.map((r, i) => (
                            <div className="reasoning-step" key={i}>
                              <span className="step-circle">{i + 1}</span>
                              <div>
                                <span className="overline">{r.agent}</span>
                                <h3>{r.action}</h3>
                                <p>{r.detail}</p>
                                <Citations
                                  ids={r.citationIds || []}
                                  open={setEvidenceId}
                                />
                              </div>
                              <Check size={17} />
                            </div>
                          ))}
                        </div>
                        <div className="boundary-note">
                          <Info size={18} />
                          <div>
                            <strong>
                              What this result does and does not establish
                            </strong>
                            {result.limitations.map((l) => (
                              <p key={l}>{l}</p>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {tab === "What if" && (
                      <>
                        <div className="section-heading">
                          <div>
                            <h3>Challenge the conclusion</h3>
                            <p>
                              Change the evidence. See whether the explanation
                              still holds.
                            </p>
                          </div>
                          <SlidersHorizontal size={23} />
                        </div>
                        <div className="whatif-card">
                          <div>
                            <span className="eyebrow">EXPERIMENT 01</span>
                            <h3>Withhold calibration evidence</h3>
                            <p>
                              Recompute using the raw sensor values, without
                              applying confirmed calibration offsets.
                            </p>
                          </div>
                          <button
                            role="switch"
                            aria-checked={ignoreCalibration}
                            aria-label="Withhold calibration evidence"
                            className={cls("switch", ignoreCalibration && "on")}
                            onClick={() => {
                              setMode("sample");
                              setLiveResult(null);
                              setIgnoreCalibration(!ignoreCalibration);
                            }}
                          >
                            <i />
                          </button>
                        </div>
                        <div className="comparison">
                          <div>
                            <span>BASELINE</span>
                            <strong>{base.title}</strong>
                            <small>
                              {base.metrics.correctedPeakC}°C corrected peak
                            </small>
                          </div>
                          <ArrowRight size={22} />
                          <div>
                            <span>CURRENT EXPERIMENT</span>
                            <strong>{result.title}</strong>
                            <small>
                              {result.metrics.correctedPeakC ?? "—"}°C corrected
                              peak ·{" "}
                              {ignoreCalibration
                                ? "calibration withheld"
                                : "calibration applied"}
                              {excluded.length > 0 &&
                                ` · ${excluded.length} additional records withheld`}
                            </small>
                          </div>
                        </div>
                        <div className="whatif-card edit-card">
                          <div>
                            <span className="eyebrow">EXPERIMENT 02</span>
                            <h3>Change an observed temperature</h3>
                            <p>
                              This modifies your in-memory dataset and
                              recalculates the queue, chart, and cited findings.
                            </p>
                          </div>
                          <div className="edit-controls">
                            <label>
                              Reading
                              <select
                                value={editRow}
                                onChange={(e) => {
                                  setEditRow(e.target.value);
                                  setEditValue(
                                    String(
                                      feeds.telemetry.records.find(
                                        (r) => r.row_id === e.target.value,
                                      )?.temperature_c ?? "",
                                    ),
                                  );
                                }}
                              >
                                <option value="">Select a reading</option>
                                {feeds.telemetry.records
                                  .filter((r) => r.shipment_id === selected)
                                  .map((r) => (
                                    <option key={r.row_id} value={r.row_id}>
                                      {r.reading_id} · {time(r.observed_at)} ·{" "}
                                      {r.temperature_c}°C
                                    </option>
                                  ))}
                              </select>
                            </label>
                            <label>
                              Temperature °C
                              <input
                                type="number"
                                step="0.1"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                              />
                            </label>
                            <button
                              className="button primary"
                              onClick={applyReading}
                            >
                              Apply & recompute
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        </div>
                        <div className="boundary-note">
                          <Info size={18} />
                          <p>
                            Experiments test the dependence of the conclusion on
                            evidence. They do not establish causality or predict
                            physical outcomes. Refresh the page to restore the
                            original synthetic dataset.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="dossier-footer">
                    <span>
                      <span className="online-dot" />
                      {effectiveMode === "sample"
                        ? "Sample result · computed locally"
                        : "Verified local sponsor run"}
                      {runTime !== null && ` · ${runTime} ms`}
                    </span>
                    <button
                      className="button primary"
                      disabled={busy}
                      onClick={run}
                    >
                      {busy ? (
                        <LoaderCircle className="spin" size={15} />
                      ) : (
                        <Play size={14} />
                      )}{" "}
                      {busy ? `Investigating ${runningShipment}…` : "Run investigation"}
                    </button>
                  </div>
                </section>
              </div>
              <footer className="page-footer">
                <span>
                  TRACEHARBOR <i />
                  Built for the agent that can explain why.
                </span>
                <span>
                  {result.synthetic
                    ? "Synthetic demonstration"
                    : "Imported records"}{" "}
                  · operational decision support
                </span>
              </footer>
            </>
          )}
          {view === "Data sources" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">CONNECTED EVIDENCE</div>
                  <h1>Four sources. One account of events.</h1>
                  <p>
                    Explore original records and their provenance before
                    trusting a conclusion.
                  </p>
                </div>
                <button
                  className="button secondary"
                  onClick={() => download("traceharbor-dataset.json", feeds)}
                >
                  <ArrowDownToLine size={16} />
                  Export dataset
                </button>
              </div>
              <div className="sources-grid">
                {FEED_NAMES.map((name) => {
                  const Icon = sourceIcons[name];
                  return (
                    <section className="source-card" key={name}>
                      <div className="source-card-head">
                        <span className="source-icon">
                          <Icon size={22} />
                        </span>
                        <span className="tag green">
                          <i />
                          Available locally
                        </span>
                      </div>
                      <h2>{sourceNames[name]}</h2>
                      <p>{feeds[name].source_system}</p>
                      <div className="source-stat">
                        <strong>{feeds[name].records.length}</strong>
                        <span>original records</span>
                      </div>
                      <dl>
                        <div>
                          <dt>Dataset</dt>
                          <dd>{feeds[name].dataset_id}</dd>
                        </div>
                        <div>
                          <dt>Provenance</dt>
                          <dd>
                            {feeds[name].synthetic
                              ? "Synthetic demonstration"
                              : "Imported by user"}
                          </dd>
                        </div>
                        <div>
                          <dt>Source format</dt>
                          <dd>JSON · records envelope</dd>
                        </div>
                      </dl>
                      <button
                        onClick={() => download(`${name}.json`, feeds[name])}
                      >
                        Download source
                        <ArrowDownToLine size={15} />
                      </button>
                    </section>
                  );
                })}
              </div>
              <div className="boundary-note">
                <Database size={21} />
                <div>
                  <strong>Sample and live data paths</strong>
                  <p>
                    The public workspace computes from these four bundled
                    sources. The setup runner registers these REST sources in
                    Zetaris, activates a unified semantic layer, and runs data
                    quality rules. The live agent queries that prepared layer.
                    Live sponsor usage is only established by a successful
                    runtime receipt.
                  </p>
                </div>
              </div>
              <h2 className="table-title">Record browser</h2>
              <SourceTable feeds={feeds} />
            </>
          )}
          {view === "How it works" && (
            <HowItWorks setShowSettings={setShowSettings} />
          )}
        </main>
      </div>
      {evidence && (
        <div className="drawer-backdrop" onClick={() => setEvidenceId(null)}>
          <aside
            className="evidence-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Evidence detail"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <span className="eyebrow">SOURCE EVIDENCE</span>
              <button
                className="icon-button"
                onClick={() => setEvidenceId(null)}
                aria-label="Close evidence"
              >
                <X size={20} />
              </button>
            </div>
            <span className="source-icon">
              <Database size={23} />
            </span>
            <h2>{evidence.id}</h2>
            <Tag outcome="within_range">Original record</Tag>
            <p className="evidence-summary">{evidence.summary}</p>
            <dl className="evidence-details">
              <div>
                <dt>Source</dt>
                <dd>{evidence.sourceLabel}</dd>
              </div>
              <div>
                <dt>Record ID</dt>
                <dd>{evidence.recordId}</dd>
              </div>
              <div>
                <dt>Event time</dt>
                <dd>{evidence.timestamp}</dd>
              </div>
              <div>
                <dt>Source updated</dt>
                <dd>{evidence.sourceUpdatedAt}</dd>
              </div>
            </dl>
            <h3>Exact source record</h3>
            <pre>{JSON.stringify(evidence.record, null, 2)}</pre>
            <button
              className="button secondary"
              onClick={() => download(`${evidence.id}.json`, evidence.record)}
            >
              <ArrowDownToLine size={15} />
              Export record
            </button>
            <div className="boundary-note">
              <Link2 size={17} />
              <p>
                This citation resolves to the original source row, including its
                timestamps and provenance.
              </p>
            </div>
          </aside>
        </div>
      )}
      {showSettings && (
        <div className="modal-backdrop" onClick={() => setShowSettings(false)}>
          <section
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Runtime and disclosure"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <span className="eyebrow">RUNTIME & DISCLOSURE</span>
              <button
                className="icon-button"
                aria-label="Close runtime settings"
                onClick={() => setShowSettings(false)}
              >
                <X size={20} />
              </button>
            </div>
            <h2>A clear boundary between modes.</h2>
            <p>
              Use the sample anywhere. Run the sponsor agent on a configured
              local server.
            </p>
            <button
              className={cls("mode-option", mode === "sample" && "selected")}
              onClick={() => {
                setMode("sample");
                setLiveResult(null);
              }}
            >
              <Layers3 size={24} />
              <div>
                <strong>Sample workspace</strong>
                <p>
                  Real input-dependent calculations. Synthetic records. No LLM,
                  Zetaris server, or Nightshift calls.
                </p>
              </div>
              {mode === "sample" && <CheckCircle2 size={19} />}
            </button>
            <button
              className={cls("mode-option", mode === "live" && "selected")}
              disabled={!["localhost", "127.0.0.1"].includes(location.hostname)}
              onClick={() => setMode("live")}
            >
              <Network size={24} />
              <div>
                <strong>Local live agent</strong>
                <p>
                  Zetaris + Meterless World Model + Nightshift. Requires the
                  repository's local server and configured services.
                </p>
                {!["localhost", "127.0.0.1"].includes(location.hostname) && (
                  <small>Available when hosted on localhost.</small>
                )}
              </div>
              {mode === "live" && <CheckCircle2 size={19} />}
            </button>
            <div className="disclosure-grid">
              <span>
                Records<strong>Synthetic, openly inspectable</strong>
              </span>
              <span>
                Decision scope<strong>Investigation support</strong>
              </span>
              <span>
                Claims<strong>No measured commercial impact</strong>
              </span>
              <span>
                AI coding assistance<strong>OpenAI coding agent</strong>
              </span>
            </div>
            <a
              className="button primary"
              href="https://github.com/madvidd/GenAI.works_Hackathon#readme"
              target="_blank"
              rel="noreferrer"
            >
              Setup & integration evidence
              <ArrowUpRight size={16} />
            </a>
            <nav className="artifact-links" aria-label="Project presentation">
              <a href="/submission/traceharbor-demo.mp4" target="_blank" rel="noreferrer">Watch the demo</a>
              <a href="/submission/traceharbor.pdf" target="_blank" rel="noreferrer">View the deck</a>
              <a href="/submission/traceharbor.pptx" download>Editable slides</a>
              <a href="/submission/traceharbor-demo.srt" download>Captions</a>
            </nav>
          </section>
        </div>
      )}
      {toast && (
        <div role="status" className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}
function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="metric">
      <span>
        <Icon size={15} />
        {label}
      </span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
function Citations({ ids, open }) {
  return (
    <div className="citations">
      {ids.slice(0, 3).map((id) => (
        <button
          key={id}
          onClick={() => open(id)}
          title={`Inspect source ${id}`}
        >
          <Link2 size={10} />
          {id}
        </button>
      ))}
      {ids.length > 3 && (
        <button
          onClick={() => open(ids[3])}
          title="Inspect another cited record"
        >
          +{ids.length - 3}
        </button>
      )}
    </div>
  );
}
function EvidenceView({ result, open, excluded, setExcluded }) {
  const [source, setSource] = useState("all");
  return (
    <>
      <div className="section-heading">
        <div>
          <h3>Every record, at its source</h3>
          <p>
            Inspect the record behind a finding. Withhold evidence to test the
            conclusion.
          </p>
        </div>
        <Database size={22} />
      </div>
      <div className="source-filters">
        {["all", ...FEED_NAMES].map((s) => (
          <button
            key={s}
            className={source === s ? "active" : ""}
            onClick={() => setSource(s)}
          >
            {s === "all" ? "All sources" : sourceNames[s]}
          </button>
        ))}
      </div>
      <div className="evidence-list">
        {result.evidence
          .filter((e) => source === "all" || e.source === source)
          .map((e) => (
            <div className="evidence-row" key={e.id}>
              <span className="record-icon">
                {React.createElement(sourceIcons[e.source], { size: 17 })}
              </span>
              <button className="record-main" onClick={() => open(e.id)}>
                <strong>
                  {e.id}
                  <span>{e.sourceLabel}</span>
                </strong>
                <p>{e.summary}</p>
              </button>
              <button
                className="icon-button"
                aria-label={`Inspect ${e.id}`}
                onClick={() => open(e.id)}
              >
                <ArrowUpRight size={16} />
              </button>
              {e.source !== "manifest" && (
                <button
                  className="withhold"
                  onClick={() => setExcluded([...excluded, e.id])}
                >
                  Withhold
                </button>
              )}
            </div>
          ))}
      </div>
      {excluded.length > 0 && (
        <div className="boundary-note">
          <Info size={18} />
          <div>
            <strong>{excluded.length} records withheld</strong>
            <p>{excluded.join(", ")}</p>
            <button className="text-button" onClick={() => setExcluded([])}>
              Restore all withheld records
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function SourceTable({ feeds }) {
  const [source, setSource] = useState("telemetry");
  const fields = Object.keys(feeds[source].records[0] || {});
  return (
    <div className="source-table">
      <div className="source-filters">
        {FEED_NAMES.map((s) => (
          <button
            className={source === s ? "active" : ""}
            key={s}
            onClick={() => setSource(s)}
          >
            {sourceNames[s]}
          </button>
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {fields.map((f) => (
                <th key={f}>{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feeds[source].records.map((r, i) => (
              <tr key={r.row_id || i}>
                {fields.map((f) => (
                  <td key={f}>{String(r[f] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function HowItWorks({ setShowSettings }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">THE AGENT THAT CAN EXPLAIN WHY</div>
          <h1>Reasoning you can retrace.</h1>
          <p>
            A confident status is easy. A conclusion that survives scrutiny
            takes evidence.
          </p>
        </div>
        <span className="track-label">TRACK 02</span>
      </div>
      <section className="architecture-hero">
        <div>
          <span className="eyebrow">
            FROM FRAGMENTED RECORDS TO A CHECKABLE DOSSIER
          </span>
          <h2>
            Connect. Investigate.
            <br />
            <em>Challenge. Explain.</em>
          </h2>
          <p>
            TraceHarbor investigates shipment temperature exceptions across four
            operational systems. The critic tests calibration, gaps, and
            contradictory statuses before an explanation reaches the operator.
          </p>
          <button
            className="button primary"
            onClick={() => setShowSettings(true)}
          >
            Inspect runtime disclosure
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="architecture-map">
          <div className="map-sources">
            {["Manifest", "Telemetry", "Carrier log", "Calibration"].map(
              (s) => (
                <span key={s}>
                  <Database size={14} />
                  {s}
                </span>
              ),
            )}
          </div>
          <div className="map-connector" />
          <div className="map-layer">
            <Layers3 size={22} />
            <div>
              <strong>Zetaris</strong>
              <small>Unified semantic layer + data quality</small>
            </div>
          </div>
          <div className="map-connector" />
          <div className="map-agents">
            <span>
              <Network size={18} />
              <strong>World Model</strong>
              <small>Provenance & relationships</small>
            </span>
            <span>
              <Workflow size={18} />
              <strong>Nightshift</strong>
              <small>Live model reasoning</small>
            </span>
          </div>
          <div className="map-connector" />
          <div className="map-result">
            <ShieldCheck size={20} />
            Evidence-backed dossier
          </div>
        </div>
      </section>
      <div className="principles">
        {[
          [
            Search,
            "Evidence before explanation",
            "Retrieve source rows and validate their integrity. Reject impossible values without erasing their history.",
          ],
          [
            GitBranch,
            "Criticism changes the path",
            "The model critic can select an evidence-withholding experiment. Missing observations block an unsupported clear status.",
          ],
          [
            FileJson,
            "Nothing hidden behind a slide",
            "Inspect citations, download structured outputs, edit readings, and run the same investigation from the command line.",
          ],
        ].map(([Icon, title, body]) => (
          <article key={title}>
            <Icon size={26} />
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="boundary-note">
        <Info size={20} />
        <div>
          <strong>Architecture is not an execution receipt</strong>
          <p>
            This diagram describes the live integration path. The hosted sample
            runs deterministic evidence analysis in your browser. See repository
            evidence and local runtime logs for verified sponsor calls. No
            guarantee of hackathon placement or real-world savings is claimed.
          </p>
        </div>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
