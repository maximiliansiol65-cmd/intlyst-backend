/* eslint-disable */
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import NotificationCenter from "../notifications/NotificationCenter";

const IcoHome = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 6.5L8 2l6 4.5V14a1 1 0 01-1 1H3a1 1 0 01-1-1V6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M6 15v-4h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
const IcoChart = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 12l3.5-3.5 3 3 5.5-7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoRocket = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M9.5 2C9.5 2 13 3.5 13 8c0 2-1.5 3.5-3 4.5L8 14l-2-1.5C4.5 11.5 3 10 3 8c0-4.5 3.5-6 3.5-6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <circle cx="8" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
  </svg>
);
const IcoPeople = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M11.5 7a1.5 1.5 0 110-3M13.5 14c0-2-1-3.6-2.5-4.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IcoSocial = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="13" cy="3" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="3"  cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <circle cx="13" cy="13" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M5 7l6-3M5 9l6 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IcoCheck = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2 9l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoGear = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.5 1.5M11.4 11.4l1.5 1.5M11.4 4.6l-1.5 1.5M4.6 11.4l-1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const NAV_LINKS = [
  { to: "/",         label: "Dashboard", Icon: IcoHome,   end: true },
  { to: "/analyse",  label: "Analyse",   Icon: IcoChart },
  { to: "/wachstum", label: "Wachstum",  Icon: IcoRocket },
  { to: "/kunden",   label: "Kunden",    Icon: IcoPeople },
  { to: "/social",   label: "Social",    Icon: IcoSocial },
  { to: "/aufgaben", label: "Aufgaben",  Icon: IcoCheck },
];

export default function TopNav({ onAiClick, onSearchClick }) {
  const { user, authHeader, activeWorkspaceId, setActiveWorkspace } = useAuth();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    loadWorkspaces();
  }, [activeWorkspaceId]); // eslint-disable-line

  async function loadWorkspaces() {
    try {
      const res = await fetch("/api/workspaces", { headers: authHeader() });
      if (!res.ok) return;
      const data = await res.json();
      setWorkspaces(Array.isArray(data) ? data : []);
    } catch { }
  }

  async function switchWorkspace(id) {
    if (!id) return;
    try {
      await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ workspace_id: Number(id) }),
      });
      setActiveWorkspace(Number(id));
      window.location.reload();
    } catch { }
  }

  const initials = (user?.name || user?.email || "?")[0].toUpperCase();

  return (
    <nav className="topnav" role="navigation" aria-label="Hauptnavigation">
      {/* Brand */}
      <NavLink to="/" className="topnav-logo">INTLYST</NavLink>

      {/* Center nav — 6 Hauptbereiche */}
      <div className="topnav-links" role="menubar">
        {NAV_LINKS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `topnav-link${isActive ? " active" : ""}`}
            role="menuitem"
          >
            <Icon />
            <span className="hide-mobile">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Right actions */}
      <div className="topnav-actions">
        {workspaces.length > 1 && (
          <select
            className="hide-mobile"
            value={activeWorkspaceId || ""}
            onChange={e => switchWorkspace(e.target.value)}
            aria-label="Workspace wechseln"
            style={{
              fontSize: "var(--text-sm)",
              padding: "5px 28px 5px 10px",
              background: "var(--c-surface-3)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--r-sm)",
              color: "var(--c-text)",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2386868B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 8px center",
              maxWidth: 120,
            }}
          >
            {workspaces.map(ws => (
              <option key={ws.id} value={ws.id}>{ws.name}</option>
            ))}
          </select>
        )}

        {/* Search CMD+K */}
        <button
          className="topnav-search-btn hide-mobile"
          onClick={onSearchClick}
          aria-label="Suche öffnen (CMD+K)"
          title="Suche (⌘K)"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <span>Suche</span>
          <kbd>⌘K</kbd>
        </button>

        {/* KI Assistent */}
        <button className="topnav-ai-btn" onClick={onAiClick} aria-label="KI-Assistent öffnen">
          <span aria-hidden="true" style={{ fontSize: 13 }}>✦</span>
          <span>Fragen</span>
        </button>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Settings Icon */}
        <button
          className="topnav-icon-btn"
          onClick={() => navigate("/settings")}
          aria-label="Einstellungen"
          title="Einstellungen"
        >
          <IcoGear />
        </button>

        {/* Avatar */}
        <button
          className="topnav-avatar"
          onClick={() => navigate("/settings?tab=account")}
          aria-label="Profileinstellungen"
          title={user?.email ?? "Einstellungen"}
        >
          {initials}
        </button>
      </div>
    </nav>
  );
}
