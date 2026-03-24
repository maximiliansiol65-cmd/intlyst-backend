/* eslint-disable */
import { useNavigate } from "react-router-dom";

const IcoPeople = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
    <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/>
  </svg>
);
const IcoPin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
    <circle cx="12" cy="9" r="2.5"/>
  </svg>
);
const IcoGlobe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2c-3 3-4 7-4 10s1 7 4 10M12 2c3 3 4 7 4 10s-1 7-4 10"/>
  </svg>
);
const IcoFlask = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3h6M9 3v7L4 20h16L15 10V3"/>
  </svg>
);
const IcoBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);
const IcoGear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);
const IcoChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const MENU_ITEMS = [
  {
    group: "Analyse",
    items: [
      { to: "/kunden",   label: "Kunden",        sub: "Kundendaten & Segmente",        Icon: IcoPeople },
      { to: "/standort", label: "Standortkarte",  sub: "Geografische Auswertung",       Icon: IcoPin },
      { to: "/market",   label: "Markt & Trends", sub: "Marktdaten & Trendanalyse",     Icon: IcoGlobe },
      { to: "/abtests",  label: "A/B Tests",      sub: "Experimente & Testergebnisse",  Icon: IcoFlask },
    ],
  },
  {
    group: "Sonstiges",
    items: [
      { to: "/alerts",   label: "Alerts",         sub: "Benachrichtigungen & Warnungen", Icon: IcoBell },
      { to: "/settings", label: "Einstellungen",  sub: "Konto, Abo & Benachrichtigungen", Icon: IcoGear },
    ],
  },
];

export default function Mehr() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "var(--s-6)", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ marginBottom: "var(--s-6)" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--c-text)", margin: 0 }}>Mehr</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
        {MENU_ITEMS.map((group) => (
          <div key={group.group}>
            <div style={{
              fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--c-text-3)",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--s-2)",
            }}>
              {group.group}
            </div>
            <div className="card" style={{ overflow: "hidden", padding: 0 }}>
              {group.items.map(({ to, label, sub, Icon }, idx) => (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--s-4)",
                    padding: "var(--s-4) var(--s-5)",
                    background: "none",
                    border: "none",
                    borderTop: idx > 0 ? "1px solid var(--c-border)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.15s ease",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: "var(--r-md)",
                    background: "#f0f0f0", border: "1px solid #e0e0e0",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#000000", flexShrink: 0,
                  }}>
                    <Icon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>{label}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 2 }}>{sub}</div>
                  </div>
                  <span style={{ color: "var(--c-text-3)" }}><IcoChevron /></span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
