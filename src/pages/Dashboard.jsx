import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import {
  KPICard,
  HealthRing,
  SkeletonCard,
  SkeletonLine,
  Sheet,
  MilestoneCelebration,
} from "../components/ui";
import WeeklyReview from "../components/WeeklyReview";
import GoalAdjustmentSuggestion from "../components/goals/GoalAdjustmentSuggestion";
import StrategyBanner from "../components/StrategyBanner";
import GettingStartedWidget from "../components/onboarding/GettingStartedWidget";

// ── DataQualityBar ────────────────────────────────────────────────────────────
function DataQualityBar({ authHeader }) {
  const [integrations, setIntegrations] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/integrations", { headers: authHeader() })
      .then(r => { if (r.status === 401) return null; return r.json(); })
      .then(data => { if (data) setIntegrations(data); })
      .catch(() => {});
  }, []); // eslint-disable-line

  if (!integrations) return null;

  const checks = [
    { key: "stripe",           label: "Stripe",    weight: 15, why: "Umsatz & Transaktionen" },
    { key: "google_analytics", label: "GA4",       weight: 15, why: "Traffic & Conversion"   },
    { key: "shopify",          label: "Shopify",   weight: 10, why: "Shop-Daten"              },
    { key: "klaviyo",          label: "Klaviyo",   weight:  5, why: "E-Mail-Marketing"        },
    { key: "facebook_ads",     label: "FB Ads",    weight:  5, why: "Werbe-Daten"             },
  ];

  const connected = checks.reduce((acc, c) => {
    acc[c.key] = !!(integrations[c.key]?.connected || integrations[c.key]?.active);
    return acc;
  }, {});

  const missing = checks.reduce((sum, c) => sum + (connected[c.key] ? 0 : c.weight), 0);
  const pct = Math.max(0, 100 - missing);
  const color = pct >= 80 ? "var(--c-success)" : pct >= 60 ? "var(--c-warning)" : "var(--c-danger)";

  return (
    <div style={{ padding: "0 var(--s-8)", marginTop: "var(--s-3)" }}>
      <div
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-3) var(--s-4)",
          cursor: "pointer",
        }}
        onClick={() => setExpanded(v => !v)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", flexShrink: 0 }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", fontWeight: 500 }}>
              Datenqualität:
            </span>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color }}>
              {pct}%
            </span>
            <div style={{ width: 60, height: 4, background: "var(--c-surface-2)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", flex: 1 }}>
            {checks.map(c => (
              <span
                key={c.key}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 10, fontWeight: 500,
                  color: connected[c.key] ? "var(--c-success)" : "var(--c-text-3)",
                }}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: connected[c.key] ? "var(--c-success)" : "var(--c-text-4)",
                  flexShrink: 0,
                }} />
                {c.label}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 10, color: "var(--c-text-4)" }}>{expanded ? "▲" : "▼"}</span>
        </div>

        {expanded && (
          <div style={{ marginTop: "var(--s-3)", borderTop: "1px solid var(--c-border)", paddingTop: "var(--s-3)", display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", fontWeight: 500, marginBottom: "var(--s-1)" }}>
              Fehlende Integrationen verbessern deine Analyse:
            </div>
            {checks.filter(c => !connected[c.key]).map(c => (
              <div key={c.key} style={{ display: "flex", alignItems: "center", gap: "var(--s-2)", fontSize: "var(--text-xs)", color: "var(--c-text-2)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--c-text-4)", flexShrink: 0 }} />
                <span style={{ fontWeight: 500 }}>{c.label}</span>
                <span style={{ color: "var(--c-text-3)" }}>— {c.why}</span>
                <span style={{ marginLeft: "auto", color: "var(--c-danger)", fontWeight: 600 }}>−{c.weight}%</span>
              </div>
            ))}
            {checks.every(c => connected[c.key]) && (
              <div style={{ fontSize: "var(--text-xs)", color: "var(--c-success)" }}>
                ✓ Alle wichtigen Datenquellen sind verbunden!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Guten Morgen";
  if (h < 18) return "Guten Tag";
  return "Guten Abend";
}

function formatDateDE(date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAxisDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function formatEuro(v) {
  if (v == null) return "—";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(v);
}

function goalProgressClass(status) {
  if (!status) return "progress-fill";
  const s = status.toLowerCase();
  if (s === "on_track" || s === "on-track" || s === "ahead") return "progress-fill progress-success";
  if (s === "behind" || s === "at_risk") return "progress-fill progress-warning";
  if (s === "critical" || s === "missed") return "progress-fill progress-danger";
  return "progress-fill";
}

function goalBadgeClass(status) {
  if (!status) return "badge badge-neutral";
  const s = status.toLowerCase();
  if (s === "on_track" || s === "on-track" || s === "ahead") return "badge badge-success";
  if (s === "behind" || s === "at_risk") return "badge badge-warning";
  if (s === "critical" || s === "missed") return "badge badge-danger";
  return "badge badge-neutral";
}

function goalStatusLabel(status) {
  if (!status) return "Unbekannt";
  const map = {
    on_track: "Im Plan",
    "on-track": "Im Plan",
    ahead: "Voraus",
    behind: "Verzug",
    at_risk: "Gefährdet",
    critical: "Kritisch",
    missed: "Verfehlt",
  };
  return map[status.toLowerCase()] ?? status;
}

function taskPriorityColor(priority) {
  if (!priority) return "var(--c-text-4)";
  const p = priority.toLowerCase();
  if (p === "high" || p === "hoch") return "var(--c-danger)";
  if (p === "medium" || p === "mittel") return "var(--c-warning)";
  return "var(--c-success)";
}

function taskStatusBadge(status) {
  if (!status) return "badge badge-neutral badge-sm";
  const s = status.toLowerCase();
  if (s === "done" || s === "erledigt") return "badge badge-success badge-sm";
  if (s === "in_progress" || s === "in progress") return "badge badge-info badge-sm";
  if (s === "blocked") return "badge badge-danger badge-sm";
  return "badge badge-neutral badge-sm";
}

function taskStatusLabel(status) {
  if (!status) return "Offen";
  const map = {
    open: "Offen",
    in_progress: "In Arbeit",
    "in progress": "In Arbeit",
    done: "Erledigt",
    blocked: "Blockiert",
  };
  return map[status.toLowerCase()] ?? status;
}

// ── Custom Recharts Tooltip ──────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0]?.value;
  return (
    <div
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border-2)",
        borderRadius: "var(--r-md)",
        padding: "10px 14px",
        boxShadow: "var(--shadow-md)",
        fontFamily: "var(--font)",
      }}
    >
      <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginBottom: 4 }}>
        {label ? formatAxisDate(label) : ""}
      </div>
      <div
        style={{
          fontSize: "var(--text-md)",
          fontWeight: 600,
          color: "var(--c-text)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value != null ? formatEuro(value) : "—"}
      </div>
    </div>
  );
}

// ── Goal Card Row ────────────────────────────────────────────────────────────

function GoalRow({ goal }) {
  const pct = goal.progress_pct ?? (goal.target_value > 0
    ? Math.min((goal.current_value / goal.target_value) * 100, 100)
    : 0);
  const pctDisplay = Math.round(pct);

  return (
    <div
      className="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--s-4)",
        padding: "var(--s-4) var(--s-5)",
      }}
    >
      {/* Metric name */}
      <div style={{ minWidth: 120, flex: "0 0 auto" }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>
          {goal.metric_label ?? goal.metric ?? "Ziel"}
        </div>
        {goal.period && (
          <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 2 }}>
            {goal.period === "monthly" ? "Monatlich" : goal.period === "weekly" ? "Wöchentlich" : goal.period}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ flex: 1, minWidth: 80 }}>
        <div className="progress-track">
          <div
            className={goalProgressClass(goal.status)}
            style={{ width: `${pctDisplay}%` }}
          />
        </div>
      </div>

      {/* Value */}
      <div
        style={{
          minWidth: 90,
          textAlign: "right",
          fontSize: "var(--text-sm)",
          fontVariantNumeric: "tabular-nums",
          color: "var(--c-text-2)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--c-text)" }}>{pctDisplay}%</span>
        {goal.current_value != null && goal.target_value != null && (
          <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>
            {goal.current_value != null
              ? new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(goal.current_value)
              : "—"}{" "}
            / {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(goal.target_value)}
          </span>
        )}
      </div>

      {/* Status badge */}
      <div style={{ flexShrink: 0 }}>
        <span className={goalBadgeClass(goal.status)}>
          {goalStatusLabel(goal.status)}
        </span>
      </div>
    </div>
  );
}

// ── Add Goal Sheet ───────────────────────────────────────────────────────────

const METRICS_OPTIONS = [
  { value: "revenue", label: "Umsatz (€)" },
  { value: "traffic", label: "Traffic" },
  { value: "conversions", label: "Conversions" },
  { value: "conversion_rate", label: "Conversion Rate (%)" },
  { value: "new_customers", label: "Neue Kunden" },
];

function AddGoalSheet({ isOpen, onClose, onSaved, authHeader }) {
  const [metric, setMetric] = useState("revenue");
  const [target, setTarget] = useState("");
  const [period, setPeriod] = useState("monthly");
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  async function handleSave() {
    const val = parseFloat(target);
    if (!val || isNaN(val)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ metric, target_value: val, period }),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      toast.success("Ziel gespeichert!");
      setTarget("");
      setMetric("revenue");
      setPeriod("monthly");
      onSaved();
    } catch {
      toast.error("Ziel konnte nicht gespeichert werden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Neues Ziel setzen">
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
        <div>
          <label className="form-label">Metrik</label>
          <select
            className="select"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
          >
            {METRICS_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">Zielwert</label>
          <input
            className="input"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="z.B. 5000"
          />
        </div>
        <div>
          <label className="form-label">Zeitraum</label>
          <div className="tabs-pill">
            {[
              { value: "monthly", label: "Monat" },
              { value: "weekly", label: "Woche" },
            ].map((p) => (
              <button
                key={p.value}
                className={`tab-pill${period === p.value ? " active" : ""}`}
                onClick={() => setPeriod(p.value)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3" style={{ marginTop: "var(--s-2)" }}>
          <button className="btn btn-secondary btn-md flex-1" onClick={onClose}>
            Abbrechen
          </button>
          <button
            className="btn btn-primary btn-md flex-1"
            onClick={handleSave}
            disabled={!target || saving}
          >
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </div>
    </Sheet>
  );
}

// ── KPI Detail Sheet ─────────────────────────────────────────────────────────

function KpiDetailSheet({ isOpen, onClose, kpiKey, kpis }) {
  if (!kpiKey) return null;

  const labels = {
    revenue: "Umsatz",
    traffic: "Traffic",
    new_customers: "Neue Kunden",
    conversion_rate: "Conversion Rate",
  };

  const currentValue = kpis?.[kpiKey];
  const trendKey = `trend_${kpiKey}`;
  const trend = kpis?.[trendKey];

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title={labels[kpiKey] ?? kpiKey}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
        <div className="card" style={{ borderLeft: "3px solid var(--c-primary)" }}>
          <div className="kpi-label">{labels[kpiKey]}</div>
          <div
            className="kpi-value tabular"
            style={{ marginTop: "var(--s-2)", marginBottom: "var(--s-2)" }}
          >
            {kpiKey === "revenue" && currentValue != null
              ? formatEuro(currentValue)
              : kpiKey === "conversion_rate" && currentValue != null
              ? `${(currentValue * 100 > 1 ? currentValue : currentValue * 100).toFixed(1)} %`
              : currentValue != null
              ? currentValue.toLocaleString("de-DE")
              : "—"}
          </div>
          {trend != null && (
            <div className="kpi-footer">
              <span className={trend >= 0 ? "kpi-trend-up" : "kpi-trend-down"}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}%
              </span>
              <span className="kpi-compare">vs. letzter Monat</span>
            </div>
          )}
        </div>
        <p className="text-sm text-secondary" style={{ lineHeight: 1.7 }}>
          Klicke auf <strong>Analyse</strong> um einen tiefen Einblick in diese Kennzahl zu erhalten
          und KI-basierte Empfehlungen zu sehen.
        </p>
        <Link
          to="/analyse"
          className="btn btn-primary btn-md"
          style={{ textAlign: "center" }}
          onClick={onClose}
        >
          Zur Analyse →
        </Link>
      </div>
    </Sheet>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, authHeader } = useAuth();
  const toast = useToast();

  // ─ State ──────────────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(null);

  const [timeseries, setTimeseries] = useState([]);
  const [timeseriesDays, setTimeseriesDays] = useState(30);
  const [timeseriesLoading, setTimeseriesLoading] = useState(true);
  const [timeseriesError, setTimeseriesError] = useState(null);

  const [analysis, setAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [goalsError, setGoalsError] = useState(null);

  // ─ Sheet state ────────────────────────────────────────────────────────────
  const [activeKpiKey, setActiveKpiKey] = useState(null);
  const [kpiSheetOpen, setKpiSheetOpen] = useState(false);
  const [goalSheetOpen, setGoalSheetOpen] = useState(false);
  
  // ─ New Features state ─────────────────────────────────────────────────────
  const [showWeeklyReview] = useState(true);
  const [showGoalAdjustment, setShowGoalAdjustment] = useState(true);
  const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false);
  const [milestoneMilestone, setMilestoneMilestone] = useState(null);
  const [milestoneMilestoneData, setMilestoneMilestoneData] = useState({});

  // ─ Fetch helpers ──────────────────────────────────────────────────────────
  const fetchKpis = useCallback(async () => {
    setKpisLoading(true);
    setKpisError(null);
    try {
      const res = await fetch("/api/kpi", { headers: authHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      // API may return { kpis: {...}, growth: {...} } or flat object
      if (data.kpis) {
        const flat = { ...data.kpis };
        if (data.growth) {
          Object.entries(data.growth).forEach(([k, v]) => {
            // growth keys like revenue_growth → trend_revenue
            const metric = k.replace("_growth", "");
            flat[`trend_${metric}`] = v != null ? v * 100 : null;
          });
        }
        setKpis(flat);
      } else {
        setKpis(data);
      }
    } catch {
      setKpisError("KPIs konnten nicht geladen werden.");
      toast.error("KPIs konnten nicht geladen werden.");
    } finally {
      setKpisLoading(false);
    }
  }, [authHeader, toast]);

  const fetchTimeseries = useCallback(async (days) => {
    setTimeseriesLoading(true);
    setTimeseriesError(null);
    try {
      const res = await fetch(`/api/timeseries?metric=revenue&days=${days}`, {
        headers: authHeader(),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.data ?? [];
      setTimeseries(arr);
    } catch {
      setTimeseriesError("Zeitreihendaten konnten nicht geladen werden.");
    } finally {
      setTimeseriesLoading(false);
    }
  }, [authHeader]);

  const fetchAnalysis = useCallback(async () => {
    setAnalysisLoading(true);
    try {
      const res = await fetch("/api/ai/analysis", { headers: authHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }, [authHeader]);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await fetch("/api/tasks?limit=3&status=open", { headers: authHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks ?? data.items ?? []);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [authHeader]);

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await fetch("/api/alerts?limit=1", { headers: authHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setAlerts(Array.isArray(data) ? data : data.alerts ?? data.items ?? []);
    } catch {
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, [authHeader]);

  const fetchGoals = useCallback(async () => {
    setGoalsLoading(true);
    setGoalsError(null);
    try {
      const res = await fetch("/api/goals", { headers: authHeader() });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setGoals(Array.isArray(data) ? data : data.goals ?? data.items ?? []);
    } catch {
      setGoalsError("Ziele konnten nicht geladen werden.");
    } finally {
      setGoalsLoading(false);
    }
  }, [authHeader]);

  // ─ Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    fetchKpis();
    fetchTimeseries(30);
    fetchAnalysis();
    fetchTasks();
    fetchAlerts();
    fetchGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─ Timeseries period switch ────────────────────────────────────────────────
  function handlePeriodChange(days) {
    setTimeseriesDays(days);
    fetchTimeseries(days);
  }

  // ─ KPI handler ────────────────────────────────────────────────────────────
  function openKpiSheet(key) {
    setActiveKpiKey(key);
    setKpiSheetOpen(true);
  }

  // ─ Derived values ─────────────────────────────────────────────────────────
  const healthScore = analysis?.health_score ?? 0;
  const topRecommendation =
    analysis?.top_recommendation ??
    analysis?.recommendations?.[0]?.text ??
    analysis?.summary ??
    null;

  const latestAlert = alerts[0] ?? null;

  // ─ Recharts gradient ID ───────────────────────────────────────────────────
  const gradientId = "revenueGradient";

  // ─ Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter" style={{ background: "var(--c-bg)", minHeight: "calc(100dvh - var(--nav-height))" }}>
      <StrategyBanner />

      {/* ── 1. Hero ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: "var(--s-8) var(--s-8) var(--s-5)",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "var(--s-6)", flexWrap: "wrap",
        borderBottom: "1px solid var(--c-border)",
        background: "linear-gradient(135deg, var(--c-bg) 60%, var(--c-primary-light) 100%)",
      }}>
        <div>
          <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, letterSpacing: "-0.3px", color: "var(--c-text)", lineHeight: 1.2 }}>
            {getGreeting()}, {user?.name || user?.email?.split("@")[0] || "Da"}! 👋
          </div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: "var(--s-1)" }}>
            {formatDateDE(new Date())}
          </div>
          <div style={{ marginTop: "var(--s-3)", display: "flex", gap: "var(--s-2)" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => { setMilestoneMilestone(50); setMilestoneMilestoneData({ goalLabel: "Umsatz", currentValue: 10000, targetValue: 20000, unit: "€" }); setShowMilestoneCelebration(true); }} style={{ fontSize: "var(--text-xs)" }}>🎯 50%</button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setMilestoneMilestone(100); setMilestoneMilestoneData({ goalLabel: "Umsatz", currentValue: 20000, targetValue: 20000, unit: "€" }); setShowMilestoneCelebration(true); }} style={{ fontSize: "var(--text-xs)" }}>🎉 100%</button>
          </div>
        </div>
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          {analysisLoading ? (
            <div className="skeleton" style={{ width: 100, height: 100, borderRadius: "50%" }} />
          ) : (
            <HealthRing score={healthScore} size={100} showLabel />
          )}
        </div>
      </div>

      {/* ── 1b. Getting Started ──────────────────────────────────────────── */}
      <div style={{ padding: "var(--s-4) var(--s-8) 0" }}>
        <GettingStartedWidget
          onOpenChat={() => window.dispatchEvent(new CustomEvent("intlyst:open-chat"))}
        />
      </div>

      {/* ── 1c. Data Quality Bar ─────────────────────────────────────────── */}
      <DataQualityBar authHeader={authHeader} />

      {/* ── 2. KPI Strip ─────────────────────────────────────────────────── */}
      {kpisError ? (
        <div className="error-state">
          <div className="error-icon">⚠</div>
          <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--c-text)" }}>Fehler beim Laden</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)" }}>{kpisError}</div>
          <button className="btn btn-secondary btn-sm" onClick={fetchKpis}>Erneut versuchen</button>
        </div>
      ) : kpisLoading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--s-3)", padding: "var(--s-5) var(--s-8)" }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--s-3)", padding: "var(--s-5) var(--s-8)" }}>
          <KPICard
            label="Umsatz"
            value={kpis?.revenue != null ? kpis.revenue : "—"}
            unit="€"
            trend={kpis?.trend_revenue ?? null}
            compare="vs. letzter Monat"
            freshness="live"
            source="Stripe"
            details={{
              previous: kpis?.revenue_previous,
              absolute_change: kpis?.revenue_change,
              forecast: kpis?.revenue_forecast_30d,
              benchmark: kpis?.revenue_benchmark,
              period_type: "monthly",
              notes: "Deine Revenue basiert auf den letzten 30 Tagen. Klick auf diese Karte um detaillierte Statistiken zu sehen.",
            }}
            onClick={() => openKpiSheet("revenue")}
          />
          <KPICard
            label="Traffic"
            value={kpis?.traffic != null ? kpis.traffic : "—"}
            unit=""
            trend={kpis?.trend_traffic ?? null}
            compare="vs. letzter Monat"
            freshness="today"
            source="GA4"
            details={{
              previous: kpis?.traffic_previous,
              absolute_change: kpis?.traffic_change,
              forecast: kpis?.traffic_forecast_30d,
              benchmark: kpis?.traffic_benchmark,
              period_type: "monthly",
              notes: "Traffic umfasst alle Seitenaufrufe und Besucher. Detaillierte Einsichten über die Traffic-Quellen findest du in der Analyse.",
            }}
            onClick={() => openKpiSheet("traffic")}
          />
          <KPICard
            label="Neue Kunden"
            value={kpis?.new_customers != null ? kpis.new_customers : "—"}
            unit=""
            trend={kpis?.trend_new_customers ?? null}
            compare="vs. letzter Monat"
            freshness="today"
            source="Stripe + GA4"
            details={{
              previous: kpis?.new_customers_previous,
              absolute_change: kpis?.new_customers_change,
              forecast: kpis?.new_customers_forecast_30d,
              benchmark: kpis?.new_customers_benchmark,
              period_type: "monthly",
              notes: "Neue Kunden in diesem Monat im Vergleich zum Vormonat. Sieh dir die Kundenanalyse an für Segmentierungen.",
            }}
            onClick={() => openKpiSheet("new_customers")}
          />
          <KPICard
            label="Conversion Rate"
            value={
              kpis?.conversion_rate != null
                ? kpis.conversion_rate > 1
                  ? kpis.conversion_rate
                  : kpis.conversion_rate * 100
                : "—"
            }
            unit="%"
            trend={kpis?.trend_conversion_rate ?? null}
            compare="vs. letzter Monat"
            freshness="today"
            source="GA4"
            details={{
              previous: kpis?.conversion_rate_previous ? (kpis.conversion_rate_previous > 1 ? kpis.conversion_rate_previous : kpis.conversion_rate_previous * 100) : null,
              absolute_change: kpis?.conversion_rate_change,
              forecast: kpis?.conversion_rate_forecast_30d,
              benchmark: kpis?.conversion_rate_benchmark,
              period_type: "monthly",
              notes: "Conversion Rate zeigt den Anteil der Besucher die konvertiert haben. Erhöhe diese durch Optimierung deines Funnels.",
            }}
            onClick={() => openKpiSheet("conversion_rate")}
          />
        </div>
      )}

      {/* ── 3. Alert Banner ──────────────────────────────────────────────── */}
      {!alertsLoading && latestAlert && (
        <div style={{ padding: "0 var(--s-8)", marginTop: "var(--s-3)" }}>
          <Link to="/alerts" style={{ textDecoration: "none" }}>
            <div
              className="card"
              style={{
                display: "flex", alignItems: "center", gap: "var(--s-3)",
                padding: "var(--s-3) var(--s-4)",
                borderLeft: "3px solid var(--c-warning)",
                background: "var(--c-warning-light)",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: 18 }}>⚠️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }} className="truncate">
                  {latestAlert.title || latestAlert.message || "Neuer Alert"}
                </div>
                {latestAlert.description && (
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }} className="truncate">
                    {latestAlert.description}
                  </div>
                )}
              </div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", flexShrink: 0 }}>Alle Alerts →</span>
            </div>
          </Link>
        </div>
      )}

      {/* ── 4. Main Grid ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "var(--s-4)", padding: "var(--s-3) var(--s-8)" }}>

        {/* LEFT — Chart */}
        <div className="card" style={{ padding: "var(--s-5) var(--s-6)", minHeight: 360 }}>
          <div className="section-header" style={{ marginBottom: "var(--s-4)" }}>
            <span className="section-title">Umsatz</span>
            <div className="tabs-pill" style={{ display: "inline-flex", gap: 2 }}>
              {[{ days: 7, label: "7T" }, { days: 30, label: "30T" }, { days: 90, label: "90T" }].map(({ days, label }) => (
                <button
                  key={days}
                  className={`tab-pill${timeseriesDays === days ? " active" : ""}`}
                  onClick={() => handlePeriodChange(days)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {timeseriesLoading ? (
            <SkeletonLine width="100%" height={280} />
          ) : timeseriesError ? (
            <div className="error-state" style={{ padding: "var(--s-8)" }}>
              <div className="error-icon">⚠</div>
              <div style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--c-text)" }}>Chartdaten nicht verfügbar</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)" }}>{timeseriesError}</div>
              <button className="btn btn-secondary btn-sm" onClick={() => fetchTimeseries(timeseriesDays)}>Erneut laden</button>
            </div>
          ) : timeseries.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--s-8)" }}>
              <div className="empty-icon">📈</div>
              <div className="empty-title">Noch keine Umsatzdaten</div>
              <div className="empty-text">Verbinde eine Datenquelle um den Chart zu sehen.</div>
              <Link to="/integrations" className="btn btn-primary btn-sm">Integration verbinden →</Link>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={timeseries} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--c-primary)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="var(--c-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" vertical={false} />
                <XAxis
                  dataKey="date" tickFormatter={formatAxisDate}
                  tick={{ fontSize: 11, fill: "var(--c-text-3)", fontFamily: "var(--font)" }}
                  tickLine={false} axisLine={false} interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(v) => new Intl.NumberFormat("de-DE", { notation: "compact", maximumFractionDigits: 1 }).format(v)}
                  tick={{ fontSize: 11, fill: "var(--c-text-3)", fontFamily: "var(--font)" }}
                  tickLine={false} axisLine={false} width={52}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone" dataKey="value"
                  stroke="var(--c-primary)" strokeWidth={2}
                  fill={`url(#${gradientId})`} dot={false}
                  activeDot={{ r: 4, fill: "var(--c-primary)", stroke: "var(--c-surface)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {/* AI Top Recommendation below chart */}
          {!analysisLoading && topRecommendation && (
            <div style={{
              marginTop: "var(--s-4)", padding: "var(--s-3) var(--s-4)",
              background: "var(--c-primary-light)", borderRadius: "var(--r-sm)",
              borderLeft: "3px solid var(--c-primary)",
              display: "flex", gap: "var(--s-3)", alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>🤖</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--c-primary)", fontWeight: 600, marginBottom: 4 }}>KI-Empfehlung</div>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text)", lineHeight: "var(--lh-base)" }}>
                  {topRecommendation}
                </div>
              </div>
              <Link to="/analyse" style={{ fontSize: "var(--text-xs)", color: "var(--c-primary)", flexShrink: 0, fontWeight: 600, marginTop: 2 }}>
                Details →
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT — Goals + Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>

          {/* Goals Card */}
          <div className="card" style={{ padding: "var(--s-5)" }}>
            <div className="section-header" style={{ marginBottom: "var(--s-4)" }}>
              <span className="section-title">Ziele</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setGoalSheetOpen(true)}
                style={{ fontSize: "var(--text-xs)", padding: "var(--s-1) var(--s-2)" }}
              >
                + Ziel
              </button>
            </div>
            {goalsLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                {[0, 1].map(i => <SkeletonCard key={i} lines={2} />)}
              </div>
            ) : goalsError ? (
              <div style={{ textAlign: "center", padding: "var(--s-4)" }}>
                <div style={{ fontSize: "var(--text-sm)", color: "var(--c-danger)", marginBottom: "var(--s-2)" }}>Ziele konnten nicht geladen werden</div>
                <button className="btn btn-secondary btn-sm" onClick={fetchGoals}>Erneut</button>
              </div>
            ) : goals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div className="empty-title">Noch keine Ziele</div>
                <div className="empty-text">Setze dein erstes Ziel.</div>
                <button className="btn btn-primary btn-sm" onClick={() => setGoalSheetOpen(true)}>
                  Ziel setzen
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                {goals.slice(0, 4).map(goal => <GoalRow key={goal.id} goal={goal} />)}
                {goals.length > 4 && (
                  <div style={{ textAlign: "center", paddingTop: "var(--s-2)" }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>
                      +{goals.length - 4} weitere Ziele
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tasks Card */}
          <div className="card" style={{ padding: "var(--s-5)" }}>
            <div className="section-header" style={{ marginBottom: "var(--s-4)" }}>
              <span className="section-title">Offene Aufgaben</span>
              <Link to="/tasks" style={{ fontSize: "var(--text-xs)", color: "var(--c-primary)", fontWeight: 600 }}>
                Alle →
              </Link>
            </div>
            {tasksLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                {[0, 1, 2].map(i => <SkeletonCard key={i} lines={1} />)}
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">✅</div>
                <div className="empty-title">Alles erledigt!</div>
                <div className="empty-text">Keine offenen Aufgaben.</div>
                <Link to="/tasks" className="btn btn-primary btn-sm">Aufgabe erstellen</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="card"
                    style={{ padding: "var(--s-3) var(--s-4)", display: "flex", alignItems: "center", gap: "var(--s-3)" }}
                  >
                    <div
                      style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: taskPriorityColor(task.priority),
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--c-text)" }} className="truncate">
                        {task.title}
                      </div>
                    </div>
                    <span className={taskStatusBadge(task.status)}>
                      {taskStatusLabel(task.status)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── 5. Weekly Review + Goal Adjustment ───────────────────────────── */}
      {(showWeeklyReview || showGoalAdjustment) && (
        <div style={{ padding: "0 var(--s-8) var(--s-6)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
          {showWeeklyReview && (
            <WeeklyReview
              completedRecommendations={analysis?.completed_recommendations ?? 2}
              totalRecommendations={analysis?.total_recommendations ?? 3}
              metricName="Umsatz"
              metricChange={kpis?.revenue_change ?? 840}
              metricUnit="€"
              nextRecommendations={analysis?.recommendations ?? []}
            />
          )}
          {showGoalAdjustment && goals.length > 0 && (
            <GoalAdjustmentSuggestion
              goalLabel={goals[0]?.metric_label ?? "Umsatz"}
              currentValue={goals[0]?.current_value ?? 0}
              targetValue={goals[0]?.target_value ?? 1}
              onAccept={() => setShowGoalAdjustment(false)}
              onDismiss={() => setShowGoalAdjustment(false)}
            />
          )}
        </div>
      )}

      {/* ── Sheets ───────────────────────────────────────────────────────── */}
      <KpiDetailSheet
        isOpen={kpiSheetOpen}
        onClose={() => setKpiSheetOpen(false)}
        kpiKey={activeKpiKey}
        kpis={kpis}
      />

      <AddGoalSheet
        isOpen={goalSheetOpen}
        onClose={() => setGoalSheetOpen(false)}
        onSaved={() => { setGoalSheetOpen(false); fetchGoals(); }}
        authHeader={authHeader}
      />

      {/* ── Milestone Celebration ────────────────────────────────────────── */}
      <MilestoneCelebration
        isOpen={showMilestoneCelebration}
        onClose={() => setShowMilestoneCelebration(false)}
        goalLabel={milestoneMilestoneData.goalLabel || "Umsatz"}
        percentage={milestoneMilestone || 50}
        currentValue={milestoneMilestoneData.currentValue || 10000}
        targetValue={milestoneMilestoneData.targetValue || 20000}
        unit={milestoneMilestoneData.unit || "€"}
      />
    </div>
  );
}
