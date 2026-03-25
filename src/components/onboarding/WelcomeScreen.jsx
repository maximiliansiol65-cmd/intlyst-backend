/* eslint-disable */
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const WELCOMED_KEY = "intlyst_welcomed";

const FEATURES = [
  { icon: "📊", title: "Echtzeit-KPIs", desc: "Alle deine Zahlen auf einen Blick" },
  { icon: "✦",  title: "KI-Berater",    desc: "Stelle Fragen und erhalte sofort Antworten" },
  { icon: "🎯", title: "Ziel-Tracking", desc: "Verfolge dein Wachstumsziel in Echtzeit" },
];

export default function WelcomeScreen({ onComplete }) {
  const navigate = useNavigate();
  const { user, authHeader } = useAuth();

  const name = user?.name || user?.email?.split("@")[0] || "da";

  async function handleStart() {
    localStorage.setItem(WELCOMED_KEY, "1");
    onComplete();

    // Check if user has a growth goal
    try {
      const res = await fetch("/api/growth/goals", { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        const goals = Array.isArray(data) ? data : (data.goals ?? []);
        if (!goals || goals.length === 0) {
          navigate("/settings?tab=strategie");
          return;
        }
      }
    } catch {
      // on error, just go to dashboard
    }
    navigate("/");
  }

  function handleSkip() {
    localStorage.setItem(WELCOMED_KEY, "1");
    onComplete();
    navigate("/");
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        background: "rgba(0, 0, 0, 0.72)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--s-5)",
      }}
    >
      <div
        className="welcome-card-enter"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border-2)",
          borderRadius: "var(--r-xl, 20px)",
          padding: "var(--s-8)",
          maxWidth: 520,
          width: "100%",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--s-5)",
          textAlign: "center",
        }}
      >
        {/* Animated logo */}
        <div className="welcome-logo-pulse" style={{
          fontSize: "var(--text-2xl, 28px)",
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "var(--c-primary)",
        }}>
          ✦ INTLYST
        </div>

        {/* Heading */}
        <div>
          <h1 style={{
            margin: 0,
            fontSize: "var(--text-2xl, 28px)",
            fontWeight: 700,
            color: "var(--c-text)",
            lineHeight: 1.2,
            letterSpacing: "-0.3px",
          }}>
            Willkommen bei Intlyst, {name}! 🎉
          </h1>
          <p style={{
            margin: "var(--s-2) 0 0",
            fontSize: "var(--text-md, 16px)",
            color: "var(--c-text-3)",
            lineHeight: 1.5,
          }}>
            Deine KI-gestützte Analyse-Plattform ist bereit.
          </p>
        </div>

        {/* Feature points */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--s-3)",
          width: "100%",
          background: "var(--c-surface-2)",
          borderRadius: "var(--r-md)",
          padding: "var(--s-4)",
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--s-3)",
              textAlign: "left",
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "var(--r-md)",
                background: "var(--c-surface-3, var(--c-surface))",
                border: "1px solid var(--c-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>
                  {f.title}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 1 }}>
                  {f.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "var(--s-4)",
            fontSize: "var(--text-md)",
            fontWeight: 600,
            borderRadius: "var(--r-md)",
          }}
          onClick={handleStart}
        >
          Los geht's →
        </button>

        {/* Skip link */}
        <button
          onClick={handleSkip}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
            color: "var(--c-text-3)",
            padding: 0,
            marginTop: "calc(-1 * var(--s-3))",
            textDecoration: "underline",
          }}
        >
          Tour überspringen
        </button>
      </div>
    </div>
  );
}
