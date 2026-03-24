import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";

const STEPS = [
  { key: "company", title: "Dein Unternehmen", subtitle: "Wie heisst dein Unternehmen?" },
  { key: "industry", title: "Deine Branche", subtitle: "In welcher Branche bist du taetig?" },
  { key: "goals", title: "Deine Ziele", subtitle: "Was moechtest du mit INTLYST erreichen?" },
  { key: "datasource", title: "Deine Datenquelle", subtitle: "Wie moechtest du deine Daten importieren?" },
  { key: "tour", title: "Interaktive Tour", subtitle: "Lerne die wichtigsten Bereiche in 5 Schritten kennen." },
  { key: "checklist", title: "Start-Checkliste", subtitle: "Was soll beim ersten Start automatisch vorbereitet werden?" },
  { key: "tutorials", title: "In-App Tutorials", subtitle: "Waehle deine gefuehrten Kurz-Tutorials fuer den Start." },
];

const TOUR_STEPS = [
  {
    title: "Dashboard-Zentrale",
    target: "Dashboard",
    description: "Hier siehst du Health Score, KPI-Trends und die wichtigsten Entscheidungen auf einen Blick.",
  },
  {
    title: "Alerts & Risiken",
    target: "Alerts",
    description: "Fruehwarnungen fuer Risiken, Ausreisser und kritische Veraenderungen in deinen Metriken.",
  },
  {
    title: "Growth & Social",
    target: "Growth",
    description: "Wachstumsstrategien, Social-Media-Ideen und konkrete Handlungsempfehlungen pro Ziel.",
  },
  {
    title: "Data Integrationen",
    target: "Data",
    description: "CSV, Stripe oder Analytics verbinden und Datenqualitaet mit einem Blick pruefen.",
  },
  {
    title: "INTLYST Analyse",
    target: "INTLYST",
    description: "Ganzheitliche Analyse aus Chancen, Risiken, Mustern und direkt nutzbaren Aufgaben.",
  },
];

const CHECKLIST_ITEMS = [
  { key: "seed_demo", label: "Demo-Daten beim ersten Start automatisch laden" },
  { key: "open_dashboard", label: "Nach Abschluss direkt ins Dashboard wechseln" },
  { key: "pin_growth", label: "Growth als Fokusbereich markieren" },
  { key: "enable_tours", label: "Interaktive In-App Tour nach Login aktivieren" },
];

const TUTORIALS = [
  {
    key: "tutorial_dashboard_5min",
    title: "Dashboard in 5 Minuten",
    description: "Health Score, KPI-Karten und Trend-Lesung Schritt fuer Schritt.",
    route: "/",
  },
  {
    key: "tutorial_alerts_triage",
    title: "Alerts priorisieren",
    description: "Wie du Warnungen schnell nach Impact sortierst und abarbeitest.",
    route: "/alerts",
  },
  {
    key: "tutorial_growth_playbook",
    title: "Growth Playbook",
    description: "Social- und Strategie-Bereich fuer den naechsten 30-Tage-Plan nutzen.",
    route: "/growth",
  },
  {
    key: "tutorial_data_quality",
    title: "Data Quality Check",
    description: "Integrationen pruefen und Datenquelle fuer verlaessliche Insights absichern.",
    route: "/data",
  },
];

const INDUSTRIES = [
  { value: "ecommerce", label: "E-Commerce", icon: "EC" },
  { value: "saas", label: "SaaS / Software", icon: "SW" },
  { value: "retail", label: "Einzelhandel", icon: "RT" },
  { value: "gastro", label: "Gastronomie", icon: "GS" },
  { value: "other", label: "Andere", icon: "OT" },
];

const GOALS = [
  { value: "umsatz", label: "Umsatz steigern" },
  { value: "kunden", label: "Mehr Kunden gewinnen" },
  { value: "conversion", label: "Conversion Rate verbessern" },
  { value: "kosten", label: "Kosten reduzieren" },
  { value: "wachstum", label: "Nachhaltiges Wachstum" },
  { value: "markt", label: "Marktposition staerken" },
];

const DATA_SOURCES = [
  { value: "csv", label: "CSV Upload", sub: "Daten manuell hochladen" },
  { value: "stripe", label: "Stripe verbinden", sub: "Automatische Zahlungsdaten" },
  { value: "analytics", label: "Google Analytics", sub: "Traffic-Daten importieren" },
  { value: "manual", label: "Manuell eingeben", sub: "Spaeter konfigurieren" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("");
  const [goals, setGoals] = useState([]);
  const [dataSource, setDataSource] = useState("");
  const [tourIndex, setTourIndex] = useState(0);
  const [checklist, setChecklist] = useState({
    seed_demo: true,
    open_dashboard: true,
    pin_growth: true,
    enable_tours: true,
  });
  const [selectedTutorials, setSelectedTutorials] = useState([TUTORIALS[0].key, TUTORIALS[2].key]);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  const { authHeader, login, token, user } = useAuth();
  const navigate = useNavigate();

  function toggleGoal(value) {
    setGoals((prev) => (prev.includes(value) ? prev.filter((goal) => goal !== value) : [...prev, value]));
  }

  function canProceed() {
    if (step === 0) return company.trim().length > 0;
    if (step === 1) return industry !== "";
    if (step === 2) return goals.length > 0;
    if (step === 3) return dataSource !== "";
    if (step === 4) return tourIndex >= TOUR_STEPS.length - 1;
    if (step === 5) return Object.values(checklist).every(Boolean);
    if (step === 6) return selectedTutorials.length > 0;
    return false;
  }

  function toggleChecklist(key) {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function completeChecklist() {
    setChecklist({
      seed_demo: true,
      open_dashboard: true,
      pin_growth: true,
      enable_tours: true,
    });
  }

  function toggleTutorial(key) {
    setSelectedTutorials((prev) => (
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    ));
  }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          company,
          industry,
          goals,
          data_source: dataSource,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        setError(data.detail || "Fehler beim Speichern.");
      } else {
        const headers = authHeader();

        if (checklist.seed_demo && !localStorage.getItem("intlyst_demo_seeded_v1")) {
          setSeeding(true);
          try {
            const seedRes = await fetch("/api/dev/seed-demo", {
              method: "POST",
              headers,
            });
            if (seedRes.ok) {
              localStorage.setItem("intlyst_demo_seeded_v1", "1");
            }
          } catch {
            // Seeder ist optional; Onboarding soll nicht blockieren.
          } finally {
            setSeeding(false);
          }
        }

        localStorage.setItem("intlyst_onboarding_v2_done", "1");
        localStorage.setItem("intlyst_onboarding_tutorials", JSON.stringify(selectedTutorials));
        localStorage.setItem("intlyst_focus_growth", checklist.pin_growth ? "1" : "0");
        localStorage.setItem("intlyst_enable_tours", checklist.enable_tours ? "1" : "0");

        login(token, {
          ...(user || {}),
          company,
          industry,
          onboarding_done: true,
        });
        const startRoute = checklist.open_dashboard ? "/?tour=1" : "/data?tour=1";
        navigate(startRoute);
      }
    } catch {
      setError("Verbindungsfehler.");
    }
    setSaving(false);
  }

  const currentStep = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>Willkommen bei INTLYST</div>
          <div style={{ fontSize: 13, color: "#8fa7cc" }}>
            Schritt {step + 1} von {STEPS.length} - {currentStep.subtitle}
          </div>
        </div>

        <div style={{ background: "#223658", borderRadius: 4, height: 4, marginBottom: 32 }}>
          <div
            style={{
              width: `${progress + 100 / STEPS.length}%`,
              height: "100%",
              background: "linear-gradient(90deg, #3b4a92, #4f7fb8 55%, #59add3)",
              borderRadius: 4,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {STEPS.map((item, index) => (
            <div
              key={item.key}
              style={{
                width: index <= step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: index <= step ? "#4f7fb8" : "#223658",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>

        <div style={{ background: "linear-gradient(180deg, rgba(20,34,58,0.95), rgba(14,24,42,0.95))", border: "1px solid #223658", borderRadius: 14, padding: "28px" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 20 }}>{currentStep.title}</div>

          {step === 0 && (
            <div>
              <input
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="z.B. Muster GmbH"
                autoFocus
                onKeyDown={(event) => event.key === "Enter" && canProceed() && setStep(1)}
                style={{ width: "100%", background: "#0f1b30", border: "1px solid #223658", borderRadius: 9, padding: "12px 14px", color: "#374151", fontSize: 14, outline: "none", boxSizing: "border-box" }}
              />
              <div style={{ fontSize: 11, color: "#6f87ac", marginTop: 8 }}>Dieser Name erscheint in deinen Reports und Analysen.</div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {INDUSTRIES.map((entry) => (
                <button
                  key={entry.value}
                  onClick={() => setIndustry(entry.value)}
                  style={{
                    padding: "14px 16px",
                    background: industry === entry.value ? "#4f7fb820" : "#0f1b30",
                    border: `1px solid ${industry === entry.value ? "#4f7fb8" : "#223658"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: industry === entry.value ? "#9cc2f0" : "#8fa7cc", minWidth: 24 }}>{entry.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: industry === entry.value ? "#c6dcff" : "#94a3b8" }}>{entry.label}</span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {GOALS.map((goal) => {
                const selected = goals.includes(goal.value);
                return (
                  <button
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    style={{
                      padding: "12px 14px",
                      background: selected ? "#4f7fb820" : "#0f1b30",
                      border: `1px solid ${selected ? "#4f7fb8" : "#223658"}`,
                      borderRadius: 9,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: `1.5px solid ${selected ? "#4f7fb8" : "#334155"}`,
                        background: selected ? "#4f7fb8" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 10,
                        color: "#fff",
                      }}
                    >
                      {selected ? "✓" : ""}
                    </span>
                    <span style={{ fontSize: 13, color: selected ? "#374151" : "#8fa7cc", fontWeight: selected ? 600 : 400 }}>{goal.label}</span>
                  </button>
                );
              })}
              <div style={{ fontSize: 11, color: "#6f87ac", marginTop: 4 }}>Mehrere Ziele auswaehlbar</div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DATA_SOURCES.map((source) => (
                <button
                  key={source.value}
                  onClick={() => setDataSource(source.value)}
                  style={{
                    padding: "13px 16px",
                    background: dataSource === source.value ? "#4f7fb820" : "#0f1b30",
                    border: `1px solid ${dataSource === source.value ? "#4f7fb8" : "#223658"}`,
                    borderRadius: 9,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: dataSource === source.value ? "#c6dcff" : "#374151" }}>{source.label}</div>
                    <div style={{ fontSize: 11, color: "#8fa7cc", marginTop: 2 }}>{source.sub}</div>
                  </div>
                  {dataSource === source.value && <span style={{ color: "#9cc2f0", fontSize: 16 }}>✓</span>}
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ background: "#0f1b30", border: "1px solid #223658", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#6f87ac", marginBottom: 8 }}>Schritt {tourIndex + 1} / {TOUR_STEPS.length}</div>
                <div style={{ fontSize: 15, color: "#374151", fontWeight: 700 }}>{TOUR_STEPS[tourIndex].title}</div>
                <div style={{ fontSize: 12, color: "#9cc2f0", marginTop: 4 }}>Zielbereich: {TOUR_STEPS[tourIndex].target}</div>
                <div style={{ fontSize: 12, color: "#8fa7cc", marginTop: 10, lineHeight: 1.6 }}>{TOUR_STEPS[tourIndex].description}</div>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button
                    onClick={() => setTourIndex((index) => Math.max(0, index - 1))}
                    disabled={tourIndex === 0}
                    style={{
                      padding: "8px 12px",
                      fontSize: 12,
                      border: "1px solid #223658",
                      borderRadius: 8,
                      background: "transparent",
                      color: tourIndex === 0 ? "#475569" : "#8fa7cc",
                      cursor: tourIndex === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    Zurueck
                  </button>
                  <button
                    onClick={() => setTourIndex((index) => Math.min(TOUR_STEPS.length - 1, index + 1))}
                    disabled={tourIndex >= TOUR_STEPS.length - 1}
                    style={{
                      padding: "8px 12px",
                      fontSize: 12,
                      border: "none",
                      borderRadius: 8,
                      background: tourIndex >= TOUR_STEPS.length - 1 ? "#223658" : "#4f7fb8",
                      color: tourIndex >= TOUR_STEPS.length - 1 ? "#8fa7cc" : "#fff",
                      cursor: tourIndex >= TOUR_STEPS.length - 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    Naechster Tour-Schritt
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                {TOUR_STEPS.map((item, index) => (
                  <div
                    key={item.title}
                    style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 999,
                      background: index <= tourIndex ? "#4f7fb8" : "#223658",
                      transition: "all 0.2s",
                    }}
                  />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "#6f87ac" }}>
                Tipp: Gehe bis zum letzten Tour-Schritt, um das gefuehrte Setup freizuschalten.
              </div>
            </div>
          )}

          {step === 5 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CHECKLIST_ITEMS.map((item) => {
                const checked = Boolean(checklist[item.key]);
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleChecklist(item.key)}
                    style={{
                      padding: "12px 14px",
                      background: checked ? "#4f7fb820" : "#0f1b30",
                      border: `1px solid ${checked ? "#4f7fb8" : "#223658"}`,
                      borderRadius: 9,
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 5,
                        border: `1.5px solid ${checked ? "#4f7fb8" : "#334155"}`,
                        background: checked ? "#4f7fb8" : "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 10,
                      }}
                    >
                      {checked ? "✓" : ""}
                    </span>
                    <span style={{ fontSize: 13, color: checked ? "#374151" : "#8fa7cc" }}>{item.label}</span>
                  </button>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <div style={{ fontSize: 11, color: "#6f87ac" }}>Alle Punkte muessen aktiv sein.</div>
                <button
                  onClick={completeChecklist}
                  style={{ background: "transparent", border: "none", color: "#9cc2f0", cursor: "pointer", fontSize: 11 }}
                >
                  Alles markieren
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {TUTORIALS.map((tutorial) => {
                const selected = selectedTutorials.includes(tutorial.key);
                return (
                  <button
                    key={tutorial.key}
                    onClick={() => toggleTutorial(tutorial.key)}
                    style={{
                      padding: "12px 14px",
                      background: selected ? "#4f7fb820" : "#0f1b30",
                      border: `1px solid ${selected ? "#4f7fb8" : "#223658"}`,
                      borderRadius: 10,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: selected ? "#c6dcff" : "#374151" }}>{tutorial.title}</div>
                      <div style={{ fontSize: 10, color: "#8fa7cc" }}>{tutorial.route}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#8fa7cc", marginTop: 4 }}>{tutorial.description}</div>
                  </button>
                );
              })}
              <div style={{ fontSize: 11, color: "#6f87ac" }}>
                Ausgewaehlt: {selectedTutorials.length} Tutorial(s). Du kannst sie spaeter in den Einstellungen aendern.
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginTop: 14, background: "#ef444415", border: "1px solid #ef444430", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#ef4444" }}>
              {error}
            </div>
          )}

          {seeding && (
            <div style={{ marginTop: 10, background: "#0ea5e915", border: "1px solid #0ea5e930", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#7dd3fc" }}>
              Demo-Daten werden fuer den ersten Start vorbereitet...
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {step > 0 && (
            <button
              onClick={() => setStep((current) => current - 1)}
              style={{ padding: "11px 20px", fontSize: 13, fontWeight: 600, borderRadius: 9, border: "1px solid #223658", background: "transparent", color: "#8fa7cc", cursor: "pointer" }}
            >
              Zurueck
            </button>
          )}
          <button
            onClick={() => (step < STEPS.length - 1 ? setStep((current) => current + 1) : finish())}
            disabled={!canProceed() || saving}
            style={{
              flex: 1,
              padding: "11px 0",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 9,
              border: "none",
              background: canProceed() && !saving ? "linear-gradient(90deg, #3b4a92, #4f7fb8 55%, #59add3)" : "#223658",
              color: canProceed() && !saving ? "#fff" : "#8fa7cc",
              cursor: canProceed() && !saving ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {saving ? "Speichern..." : step < STEPS.length - 1 ? "Weiter ->" : "Onboarding abschliessen"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button onClick={() => navigate("/")} style={{ background: "transparent", border: "none", fontSize: 11, color: "#6f87ac", cursor: "pointer" }}>
            Ueberspringen - spaeter einrichten
          </button>
        </div>
      </div>
    </div>
  );
}