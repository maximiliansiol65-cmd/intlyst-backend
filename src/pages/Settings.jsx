import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useLanguage } from "../contexts/LanguageContext";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TABS = [
  { key: "konto",              label: "Konto"              },
  { key: "team",               label: "Team"               },
  { key: "benachrichtigungen", label: "Benachrichtigungen" },
  { key: "sprache",            label: "Sprache"            },
  { key: "abonnement",         label: "Abonnement"         },
];

const PLAN_META = {
  trial:         { label: "Trial",         badge: "badge-neutral" },
  standard:      { label: "Standard",      badge: "badge-info"    },
  team_standard: { label: "Team Standard", badge: "badge-success" },
  team_pro:      { label: "Team Pro",      badge: "badge-warning" },
};

const INTEGRATION_LABELS = {
  google_analytics: "Google Analytics 4",
  shopify:          "Shopify",
  woocommerce:      "WooCommerce",
  stripe:           "Stripe",
  klaviyo:          "Klaviyo",
  facebook_ads:     "Facebook Ads",
};

// ── Sub-pages ─────────────────────────────────────────────────────────────────

function KontoTab({ user, authHeader, logout }) {
  const toast = useToast();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  async function saveProfile() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error();
      toast.success(t('profileSaved'));
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (newPw !== confirmPw) { toast.error("Passwörter stimmen nicht überein."); return; }
    if (newPw.length < 8) { toast.error("Mindestens 8 Zeichen."); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      if (!res.ok) throw new Error();
      toast.success("Passwort geändert.");
      setOldPw(""); setNewPw(""); setConfirmPw("");
    } catch {
      toast.error("Passwortänderung fehlgeschlagen.");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>

      {/* Profile */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-5)" }}>Profil</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" />
          </div>
          <div className="form-group">
            <label className="form-label">E-Mail</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@beispiel.de" />
          </div>
          <button className="btn btn-primary btn-md" onClick={saveProfile} disabled={saving} style={{ alignSelf: "flex-start" }}>
            {saving ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-5)" }}>Passwort ändern</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
          <div className="form-group">
            <label className="form-label">Aktuelles Passwort</label>
            <input className="input" type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Neues Passwort</label>
            <input className="input" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Passwort bestätigen</label>
            <input className="input" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          </div>
          <button className="btn btn-primary btn-md" onClick={changePassword} disabled={pwSaving || !oldPw || !newPw || !confirmPw} style={{ alignSelf: "flex-start" }}>
            {pwSaving ? "Ändern…" : "Passwort ändern"}
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-2)" }}>Abmelden</div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginBottom: "var(--s-4)" }}>
          Du wirst abgemeldet, dein Konto bleibt erhalten.
        </p>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Abmelden</button>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: "var(--s-6)", borderLeft: "3px solid var(--c-danger)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-2)", color: "var(--c-danger)" }}>Gefahrenzone</div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginBottom: "var(--s-4)" }}>
          Das Löschen deines Kontos ist permanent und kann nicht rückgängig gemacht werden.
        </p>
        {!showDelete ? (
          <button className="btn btn-danger btn-sm" onClick={() => setShowDelete(true)}>Konto löschen</button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--c-danger)" }}>
              Gib <strong>LÖSCHEN</strong> ein um zu bestätigen:
            </p>
            <input className="input" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="LÖSCHEN" />
            <div className="flex gap-3">
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowDelete(false); setDeleteConfirm(""); }}>Abbrechen</button>
              <button className="btn btn-danger btn-sm" disabled={deleteConfirm !== "LÖSCHEN"}>Endgültig löschen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TeamTab({ authHeader }) {
  const toast = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team/members", { headers: authHeader() });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMembers(Array.isArray(data) ? data : data.members ?? []);
    } catch {
      toast.error("Team konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [authHeader, toast]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function inviteMember() {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Einladung an ${inviteEmail} gesendet.`);
      setInviteEmail("");
      fetchMembers();
    } catch {
      toast.error("Einladung fehlgeschlagen.");
    } finally {
      setInviting(false);
    }
  }

  async function removeMember(id) {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/team/members/${id}`, { method: "DELETE", headers: authHeader() });
      if (!res.ok) throw new Error();
      toast.success("Mitglied entfernt.");
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error("Entfernen fehlgeschlagen.");
    } finally {
      setRemovingId(null);
    }
  }

  const ROLE_LABELS = { admin: "Admin", member: "Mitglied", owner: "Inhaber" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Mitglied einladen</div>
        <div className="flex gap-3">
          <input
            className="input" type="email" value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && inviteMember()}
            placeholder="name@beispiel.de" style={{ flex: 1 }}
          />
          <button className="btn btn-primary btn-md" onClick={inviteMember} disabled={!inviteEmail || inviting}>
            {inviting ? "Sende…" : "Einladen"}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Teammitglieder</div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: "50%" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--s-1)" }}>
                  <div className="skeleton skeleton-text" style={{ width: "40%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="empty-state" style={{ padding: "var(--s-8) 0" }}>
            <div className="empty-icon">👥</div>
            <div className="empty-title">Noch keine Mitglieder</div>
            <div className="empty-text">Lade dein Team ein um zusammenzuarbeiten.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {members.map((m, idx) => (
              <div key={m.id ?? idx}>
                {idx > 0 && <div className="divider" />}
                <div className="flex items-center gap-3" style={{ padding: "var(--s-3) 0" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--c-primary-light)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "var(--text-md)", fontWeight: 600, color: "var(--c-primary)", flexShrink: 0,
                  }}>
                    {(m.name ?? m.email ?? "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.name ?? m.email}
                    </div>
                    {m.name && (
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{m.email}</div>
                    )}
                  </div>
                  <span className="badge badge-sm badge-neutral">{ROLE_LABELS[m.role] ?? m.role ?? "Mitglied"}</span>
                  {m.role !== "owner" && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--c-danger)", padding: "4px 8px" }}
                      disabled={removingId === m.id}
                      onClick={() => removeMember(m.id)}
                    >
                      {removingId === m.id ? "…" : "Entfernen"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DatenquellenTab({ authHeader }) {
  const toast = useToast();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/connections", { headers: authHeader() });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setConnections(Array.isArray(data) ? data : data.connections ?? []);
      } catch {
        toast.error("Datenquellen konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    })();
  }, [authHeader, toast]);

  async function toggleConnection(id, enabled) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/connections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ enabled: !enabled }),
      });
      if (!res.ok) throw new Error();
      setConnections((prev) => prev.map((c) => (c.id === id ? { ...c, enabled: !enabled } : c)));
      toast.success(!enabled ? "Verbindung aktiviert." : "Verbindung deaktiviert.");
    } catch {
      toast.error("Änderung fehlgeschlagen.");
    } finally {
      setTogglingId(null);
    }
  }

  const STATUS_BADGE = {
    connected:    { label: "Verbunden",  cls: "badge-success" },
    disconnected: { label: "Getrennt",   cls: "badge-neutral" },
    error:        { label: "Fehler",     cls: "badge-danger"  },
    pending:      { label: "Ausstehend", cls: "badge-warning" },
  };

  const ICONS = {
    google_analytics: "📊", shopify: "🛍️", woocommerce: "🛒",
    stripe: "💳", klaviyo: "📧", facebook_ads: "📣",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Verbundene Quellen</div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "var(--r-md)" }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--s-1)" }}>
                  <div className="skeleton skeleton-text" style={{ width: "30%" }} />
                  <div className="skeleton skeleton-text" style={{ width: "50%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : connections.length === 0 ? (
          <div className="empty-state" style={{ padding: "var(--s-8) 0" }}>
            <div className="empty-icon">🔌</div>
            <div className="empty-title">Keine Datenquellen</div>
            <div className="empty-text">Verbinde eine Datenquelle um mit der Analyse zu starten.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {connections.map((c, idx) => {
              const meta = STATUS_BADGE[c.status] ?? { label: c.status ?? "Unbekannt", cls: "badge-neutral" };
              return (
                <div key={c.id ?? idx}>
                  {idx > 0 && <div className="divider" />}
                  <div className="flex items-center gap-3" style={{ padding: "var(--s-4) 0" }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "var(--r-md)",
                      background: "var(--c-surface-2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {ICONS[c.type] ?? "🔗"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>
                        {INTEGRATION_LABELS[c.type] ?? c.name ?? c.type ?? "Integration"}
                      </div>
                      {c.account && (
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.account}
                        </div>
                      )}
                    </div>
                    <span className={`badge badge-sm ${meta.cls}`}>{meta.label}</span>
                    <label className="toggle" title={c.enabled ? "Deaktivieren" : "Aktivieren"}>
                      <input type="checkbox" checked={!!c.enabled} onChange={() => toggleConnection(c.id, c.enabled)} disabled={togglingId === c.id} />
                      <span className="toggle-track"><span className="toggle-thumb" /></span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: "var(--s-5)", borderLeft: "3px solid var(--c-primary)" }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-primary)", marginBottom: "var(--s-2)" }}>
          Neue Integration hinzufügen
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)", lineHeight: 1.65 }}>
          Weitere Integrationen können über den INTLYST Partner-Connector eingerichtet werden.
          Kontaktiere <span style={{ color: "var(--c-primary)" }}>support@intlyst.com</span> für individuelle Anbindungen.
        </p>
      </div>
    </div>
  );
}

function BenachrichtigungenTab({ authHeader }) {
  const toast = useToast();
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const EMAIL_ITEMS = [
    { key: "alerts",          label: "Kritische Alerts",          sub: "Sofort bei neuen kritischen Ereignissen" },
    { key: "goals",           label: "Ziel-Fortschritt",          sub: "Wenn Ziele erreicht oder gefährdet sind" },
    { key: "recommendations", label: "Empfehlungen",              sub: "Neue KI-Handlungsempfehlungen" },
    { key: "anomalies",       label: "Anomalie-Erkennung",        sub: "Ungewöhnliche Datenmuster" },
    { key: "weekly_summary",  label: "Wöchentliche Zusammenfassung", sub: "Jeden Montag um 07:00 Uhr" },
    { key: "reports",         label: "Tägliche Reports",          sub: "Täglich um 07:00 Uhr" },
  ];

  useEffect(() => {
    fetch("/api/email-preferences", { headers: authHeader() })
      .then(r => r.json())
      .then(data => setPrefs(data))
      .catch(() => setPrefs({ enabled: true, alerts: true, goals: true, recommendations: true, anomalies: true, weekly_summary: true, reports: false }))
      .finally(() => setLoading(false));
  }, []);

  async function savePrefs() {
    setSaving(true);
    try {
      const res = await fetch("/api/email-preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error();
      toast.success("E-Mail-Einstellungen gespeichert.");
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  function toggle(key) {
    setPrefs(p => ({ ...p, [key]: !p[key] }));
  }

  if (loading || !prefs) {
    return <div className="card" style={{ padding: "var(--s-6)", color: "var(--c-text-3)", fontSize: "var(--text-sm)" }}>Wird geladen…</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>

      {/* Master switch */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--c-text)" }}>E-Mail-Benachrichtigungen</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: "var(--s-1)" }}>
              Alle E-Mail-Benachrichtigungen aktivieren oder deaktivieren
            </div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={!!prefs.enabled} onChange={() => toggle("enabled")} />
            <span className="toggle-track"><span className="toggle-thumb" /></span>
          </label>
        </div>
      </div>

      {/* Per-type settings */}
      <div className="card" style={{ padding: "var(--s-6)", opacity: prefs.enabled ? 1 : 0.45, transition: "opacity 0.2s ease", pointerEvents: prefs.enabled ? "auto" : "none" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Benachrichtigungsarten</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {EMAIL_ITEMS.map((item, idx) => (
            <div key={item.key}>
              {idx > 0 && <div className="divider" />}
              <div className="flex items-center justify-between" style={{ padding: "var(--s-3) 0" }}>
                <div>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--c-text)" }}>{item.label}</div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: "var(--s-1)" }}>{item.sub}</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={!!prefs[item.key]} onChange={() => toggle(item.key)} />
                  <span className="toggle-track"><span className="toggle-thumb" /></span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: "var(--s-3)", alignItems: "center" }}>
        <button className="btn btn-primary btn-md" onClick={savePrefs} disabled={saving}>
          {saving ? "Speichern…" : "Einstellungen speichern"}
        </button>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>
          E-Mails werden an deine Konto-E-Mail-Adresse gesendet.
        </span>
      </div>
    </div>
  );
}

function SpracheTab() {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'de', name: 'Deutsch',    flag: '🇩🇪' },
    { code: 'en', name: 'English',    flag: '🇬🇧' },
    { code: 'es', name: 'Español',    flag: '🇪🇸' },
    { code: 'fr', name: 'Français',   flag: '🇫🇷' },
    { code: 'it', name: 'Italiano',   flag: '🇮🇹' },
    { code: 'pt', name: 'Português',  flag: '🇵🇹' },
    { code: 'zh', name: '中文',        flag: '🇨🇳' },
    { code: 'ru', name: 'Русский',    flag: '🇷🇺' },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      <div>
        <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 600, marginBottom: "var(--s-2)", color: "var(--c-text)" }}>
          Sprache wählen
        </h3>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginBottom: "var(--s-4)" }}>
          Wähle deine bevorzugte Sprache für die Benutzeroberfläche.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--s-3)" }}>
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              style={{
                padding: "var(--s-3) var(--s-4)",
                border: language === lang.code ? "2px solid #000" : "1px solid var(--c-border)",
                borderRadius: "var(--r-md)",
                background: language === lang.code ? "#f5f5f5" : "var(--c-surface)",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "var(--s-2)",
              }}
            >
              <span style={{ fontSize: "32px" }}>{lang.flag}</span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--c-text)" }}>
                {lang.name}
              </span>
              {language === lang.code && (
                <span style={{ fontSize: "12px", color: "#000", fontWeight: 700 }}>✓ Aktiv</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ paddingTop: "var(--s-3)", borderTop: "1px solid var(--c-border)" }}>
        <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 600, marginBottom: "var(--s-2)", color: "var(--c-text)" }}>
          Sprachpräferenzen
        </h4>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>
          Deine Spracheinstellung wird automatisch gespeichert und beim nächsten Login wiederhergestellt.
        </p>
      </div>
    </div>
  );
}

function AbonnementTab({ authHeader }) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/workspace", { headers: authHeader() });
        if (!res.ok) throw new Error();
        setWorkspace(await res.json());
      } catch {
        setWorkspace(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [authHeader]);

  const plan = workspace?.plan ?? "trial";
  const planMeta = PLAN_META[plan] ?? { label: plan, badge: "badge-neutral" };

  const PLANS = [
    {
      key: "standard",
      label: "Standard",
      price: "29 €", per: "/ Monat",
      features: ["1 Workspace", "5 Datenquellen", "KI-Analyse", "90 Tage Verlauf"],
    },
    {
      key: "team_standard",
      label: "Team Standard",
      price: "79 €", per: "/ Monat",
      features: ["3 Workspaces", "15 Datenquellen", "Team-Features", "1 Jahr Verlauf"],
      highlighted: true,
    },
    {
      key: "team_pro",
      label: "Team Pro",
      price: "199 €", per: "/ Monat",
      features: ["Unbegrenzte Workspaces", "Alle Integrationen", "Priorität-Support", "Unbegrenzter Verlauf"],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Aktueller Plan</div>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            <div className="skeleton skeleton-text" style={{ width: "30%" }} />
            <div className="skeleton skeleton-text" style={{ width: "50%" }} />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className={`badge badge-sm ${planMeta.badge}`}>{planMeta.label}</span>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)" }}>{workspace?.name ?? "Mein Workspace"}</span>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--s-4)" }}>
        {PLANS.map((p) => {
          const isCurrent = plan === p.key;
          return (
            <div
              key={p.key}
              className="card"
              style={{
                padding: "var(--s-5)",
                ...(p.highlighted && { borderTop: "3px solid var(--c-primary)" }),
                ...(isCurrent && { outline: "2px solid var(--c-primary)" }),
              }}
            >
              {p.highlighted && (
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--c-primary)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "var(--s-2)" }}>
                  Beliebteste Wahl
                </div>
              )}
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--c-text)", marginBottom: "var(--s-1)" }}>{p.label}</div>
              <div style={{ marginBottom: "var(--s-4)" }}>
                <span style={{ fontSize: "var(--text-title)", fontWeight: 700, color: "var(--c-text)", fontVariantNumeric: "tabular-nums" }}>{p.price}</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}> {p.per}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 var(--s-5) 0", display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)", display: "flex", alignItems: "center", gap: "var(--s-2)" }}>
                    <span style={{ color: "var(--c-success)", fontSize: "var(--text-xs)", fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div style={{ textAlign: "center", padding: "6px 0", fontSize: "var(--text-sm)", color: "var(--c-primary)", fontWeight: 600 }}>
                  Aktueller Plan
                </div>
              ) : (
                <button className={`btn ${p.highlighted ? "btn-primary" : "btn-secondary"} btn-sm`} style={{ width: "100%" }}>
                  Wechseln
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Settings ─────────────────────────────────────────────────────────────

// ── TabABTests ────────────────────────────────────────────────────────────────
function TabABTests({ authHeader }) {
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", kategorie: "conversion", metrik: "revenue", hypothese: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/abtests", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTests(Array.isArray(data) ? data : (data.tests ?? [])))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function createTest() {
    if (!form.name.trim()) { toast.error("Name ist erforderlich."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/abtests", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTests(prev => [created, ...prev]);
      setForm({ name: "", kategorie: "conversion", metrik: "revenue", hypothese: "" });
      setShowForm(false);
      toast.success("A/B Test erstellt.");
    } catch {
      toast.error("Fehler beim Erstellen.");
    } finally {
      setSaving(false);
    }
  }

  const statusBadge = (s) => {
    const map = { running: { label: "Läuft", cls: "badge-success" }, completed: { label: "Abgeschlossen", cls: "badge-info" }, paused: { label: "Pausiert", cls: "badge-warning" } };
    const m = map[s] ?? { label: s || "Unbekannt", cls: "badge-neutral" };
    return <span className={`badge badge-sm ${m.cls}`}>{m.label}</span>;
  };

  const total = tests.length;
  const running = tests.filter(t => t.status === "running").length;
  const significant = tests.filter(t => t.significant || t.lift_pct >= 5).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--s-3)" }}>
        {[["Gesamt", total, "📋"], ["Laufend", running, "▶️"], ["Signifikant", significant, "✅"]].map(([l, v, ic]) => (
          <div key={l} className="card" style={{ padding: "var(--s-4)", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{ic}</div>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--c-text)" }}>{v}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Create button */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? "var(--s-4)" : 0 }}>
          <div className="section-title" style={{ margin: 0 }}>A/B Tests</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Abbrechen" : "+ Neuen A/B Test erstellen"}
          </button>
        </div>

        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)", borderTop: "1px solid var(--c-border)", paddingTop: "var(--s-4)" }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Checkout Button Farbe" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
              <div className="form-group">
                <label className="form-label">Kategorie</label>
                <select className="input" value={form.kategorie} onChange={e => setForm(f => ({ ...f, kategorie: e.target.value }))}>
                  {["conversion", "ux", "pricing", "email", "landing_page", "checkout", "product", "sonstiges"].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Metrik</label>
                <select className="input" value={form.metrik} onChange={e => setForm(f => ({ ...f, metrik: e.target.value }))}>
                  {["revenue", "conversion_rate", "click_rate", "bounce_rate", "avg_order_value", "session_duration"].map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Hypothese</label>
              <textarea className="input" rows={3} value={form.hypothese} onChange={e => setForm(f => ({ ...f, hypothese: e.target.value }))} placeholder="Wenn wir X ändern, erwarten wir Y weil Z…" style={{ resize: "vertical" }} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={createTest} disabled={saving} style={{ alignSelf: "flex-start" }}>
              {saving ? "Erstellen…" : "Test erstellen"}
            </button>
          </div>
        )}
      </div>

      {/* Test list */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Meine Tests</div>
        {loading ? (
          <div style={{ color: "var(--c-text-3)", fontSize: "var(--text-sm)" }}>Lädt…</div>
        ) : tests.length === 0 ? (
          <div className="empty-state" style={{ padding: "var(--s-8) 0" }}>
            <div style={{ fontSize: 32 }}>🧪</div>
            <div style={{ fontSize: "var(--text-md)", color: "var(--c-text-2)", marginTop: "var(--s-2)" }}>Noch keine A/B Tests</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)" }}>Erstelle deinen ersten Test um Optimierungen zu messen.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {tests.map((t, i) => (
              <div key={t.id ?? i} style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", padding: "var(--s-3) 0", borderBottom: "1px solid var(--c-border)" }}>
                {statusBadge(t.status)}
                {t.kategorie && <span className="badge badge-sm badge-neutral">{t.kategorie}</span>}
                <span style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--c-text)" }}>{t.name}</span>
                {t.lift_pct != null && (
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: t.lift_pct >= 0 ? "var(--c-success)" : "var(--c-danger)" }}>
                    {t.lift_pct >= 0 ? "+" : ""}{t.lift_pct}%
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TabStandortAnalyse ────────────────────────────────────────────────────────
function TabStandortAnalyse({ authHeader }) {
  const toast = useToast();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cfg, setCfg] = useState({ address: "", radius: 10, track_competitors: false, geo_targeting: false, heatmap: false });

  useEffect(() => {
    fetch("/api/location/settings", { headers: authHeader() })
      .then(r => r.ok ? r.json() : {})
      .then(d => {
        setData(d);
        setCfg(c => ({
          address: d.address ?? "",
          radius: d.radius ?? 10,
          track_competitors: d.track_competitors ?? false,
          geo_targeting: d.geo_targeting ?? false,
          heatmap: d.heatmap ?? false,
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/location/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) throw new Error();
      toast.success("Standort-Einstellungen gespeichert.");
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  const Toggle = ({ label, k }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--s-3) 0", borderBottom: "1px solid var(--c-border)" }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--c-text)" }}>{label}</span>
      <button
        onClick={() => setCfg(c => ({ ...c, [k]: !c[k] }))}
        style={{
          width: 40, height: 22, borderRadius: 11,
          background: cfg[k] ? "var(--c-primary)" : "var(--c-surface-3)",
          border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s",
        }}
      >
        <span style={{
          position: "absolute", top: 2, left: cfg[k] ? 20 : 2,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff", transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );

  const statCards = [
    { label: "Unique Regionen", value: data.unique_regions ?? "—", icon: "🗺️" },
    { label: "Lokale Kunden%",  value: data.local_customers_pct != null ? `${data.local_customers_pct}%` : "—", icon: "📍" },
    { label: "Reichweite km",   value: data.reach_km ?? "—", icon: "📡" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--s-3)" }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: "var(--s-4)", textAlign: "center" }}>
            <div style={{ fontSize: 22 }}>{s.icon}</div>
            <div style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--c-text)" }}>{s.value}</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Config */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Konfiguration</div>
        {loading ? <div style={{ color: "var(--c-text-3)", fontSize: "var(--text-sm)" }}>Lädt…</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            <div className="form-group">
              <label className="form-label">Unternehmensadresse</label>
              <input className="input" value={cfg.address} onChange={e => setCfg(c => ({ ...c, address: e.target.value }))} placeholder="Musterstraße 1, 10115 Berlin" />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Radius</span>
                <span style={{ color: "var(--c-primary)", fontWeight: 600 }}>{cfg.radius} km</span>
              </label>
              <input type="range" min={1} max={50} value={cfg.radius} onChange={e => setCfg(c => ({ ...c, radius: Number(e.target.value) }))} style={{ width: "100%" }} />
            </div>
            <Toggle label="Konkurrenten tracken" k="track_competitors" />
            <Toggle label="Geo-Targeting" k="geo_targeting" />
            <Toggle label="Heatmap aktivieren" k="heatmap" />
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving} style={{ alignSelf: "flex-start", marginTop: "var(--s-2)" }}>
              {saving ? "Speichern…" : "Speichern"}
            </button>
          </div>
        )}
      </div>

      {/* Top regions */}
      {data.top_regions?.length > 0 && (
        <div className="card" style={{ padding: "var(--s-5)" }}>
          <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Top-Regionen</div>
          {data.top_regions.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "var(--s-2) 0", borderBottom: "1px solid var(--c-border)", fontSize: "var(--text-sm)" }}>
              <span style={{ color: "var(--c-text)" }}>{r.name || r.region}</span>
              <span style={{ color: "var(--c-text-3)" }}>{r.count ?? r.customers} Kunden</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TabReports ────────────────────────────────────────────────────────────────
function TabReports({ authHeader }) {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", typ: "kpi_report", format: "PDF", zeitplan: "wochentlich", empfaenger: "" });

  useEffect(() => {
    fetch("/api/reports", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setReports(Array.isArray(d) ? d : (d.reports ?? [])))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function createReport() {
    if (!form.name.trim()) { toast.error("Name ist erforderlich."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setReports(prev => [created, ...prev]);
      setForm({ name: "", typ: "kpi_report", format: "PDF", zeitplan: "wochentlich", empfaenger: "" });
      setShowForm(false);
      toast.success("Report-Vorlage erstellt.");
    } catch {
      toast.error("Fehler beim Erstellen.");
    } finally {
      setSaving(false);
    }
  }

  const TYPES = ["kpi_report", "umsatz", "kunden", "traffic", "social", "ziele", "aufgaben", "gesamt"];
  const SCHEDULES = ["taglich", "wochentlich", "monatlich", "quartalsweise", "einmalig"];
  const FORMATS = ["PDF", "CSV", "E-Mail"];

  const fmtBadge = { PDF: "badge-danger", CSV: "badge-success", "E-Mail": "badge-info" };
  const sBadge = { taglich: "badge-success", wochentlich: "badge-info", monatlich: "badge-neutral", quartalsweise: "badge-neutral", einmalig: "badge-warning" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      {/* Quick generate */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Schnell-Generierung</div>
        <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
          {["Diese Woche", "Dieser Monat", "KPI-Report"].map(label => (
            <button key={label} className="btn btn-secondary btn-sm" onClick={() => toast.success("Report wird erstellt…")}>
              📄 {label}
            </button>
          ))}
        </div>
      </div>

      {/* Create form */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? "var(--s-4)" : 0 }}>
          <div className="section-title" style={{ margin: 0 }}>Report-Vorlagen</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Abbrechen" : "+ Neue Vorlage"}
          </button>
        </div>
        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)", borderTop: "1px solid var(--c-border)", paddingTop: "var(--s-4)" }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Wöchentlicher KPI-Report" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
              <div className="form-group">
                <label className="form-label">Typ</label>
                <select className="input" value={form.typ} onChange={e => setForm(f => ({ ...f, typ: e.target.value }))}>
                  {TYPES.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Zeitplan</label>
                <select className="input" value={form.zeitplan} onChange={e => setForm(f => ({ ...f, zeitplan: e.target.value }))}>
                  {SCHEDULES.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Format</label>
              <div style={{ display: "flex", gap: "var(--s-2)" }}>
                {FORMATS.map(f => (
                  <button key={f} className={`btn btn-sm ${form.format === f ? "btn-primary" : "btn-secondary"}`} onClick={() => setForm(fm => ({ ...fm, format: f }))}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Empfänger (kommagetrennt)</label>
              <input className="input" value={form.empfaenger} onChange={e => setForm(f => ({ ...f, empfaenger: e.target.value }))} placeholder="max@beispiel.de, anna@firma.de" />
            </div>
            <button className="btn btn-primary btn-sm" onClick={createReport} disabled={saving} style={{ alignSelf: "flex-start" }}>
              {saving ? "Erstellen…" : "Vorlage erstellen"}
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Meine Reports</div>
        {loading ? <div style={{ color: "var(--c-text-3)", fontSize: "var(--text-sm)" }}>Lädt…</div>
          : reports.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--s-6) 0" }}>
              <div style={{ fontSize: 32 }}>📊</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: "var(--s-2)" }}>Noch keine Report-Vorlagen</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
              {reports.map((r, i) => (
                <div key={r.id ?? i} style={{ display: "flex", alignItems: "center", gap: "var(--s-3)", padding: "var(--s-3) 0", borderBottom: "1px solid var(--c-border)" }}>
                  <span className={`badge badge-sm ${fmtBadge[r.format] ?? "badge-neutral"}`}>{r.format ?? "—"}</span>
                  <span className={`badge badge-sm ${sBadge[r.zeitplan] ?? "badge-neutral"}`}>{r.zeitplan ?? "—"}</span>
                  <span style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--c-text)" }}>{r.name}</span>
                  {r.last_sent && <span style={{ fontSize: 10, color: "var(--c-text-4)" }}>{new Date(r.last_sent).toLocaleDateString("de-DE")}</span>}
                  <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => toast.success("Report wird generiert…")}>▶ Jetzt</button>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ── TabFunnels ────────────────────────────────────────────────────────────────
function TabFunnels({ authHeader }) {
  const toast = useToast();
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", steps: [""] });

  useEffect(() => {
    fetch("/api/funnels", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setFunnels(Array.isArray(d) ? d : (d.funnels ?? [])))
      .catch(() => setFunnels([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function createFunnel() {
    if (!form.name.trim()) { toast.error("Name ist erforderlich."); return; }
    const steps = form.steps.filter(s => s.trim());
    if (steps.length < 2) { toast.error("Mindestens 2 Schritte erforderlich."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ ...form, steps }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setFunnels(prev => [created, ...prev]);
      setForm({ name: "", description: "", steps: [""] });
      setShowForm(false);
      toast.success("Funnel erstellt.");
    } catch {
      toast.error("Fehler beim Erstellen.");
    } finally {
      setSaving(false);
    }
  }

  function updateStep(i, v) { setForm(f => { const s = [...f.steps]; s[i] = v; return { ...f, steps: s }; }); }
  function addStep() { setForm(f => ({ ...f, steps: [...f.steps, ""] })); }
  function removeStep(i) { setForm(f => ({ ...f, steps: f.steps.filter((_, j) => j !== i) })); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? "var(--s-4)" : 0 }}>
          <div className="section-title" style={{ margin: 0 }}>Funnels</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Abbrechen" : "+ Neuen Funnel erstellen"}
          </button>
        </div>
        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)", borderTop: "1px solid var(--c-border)", paddingTop: "var(--s-4)" }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Checkout-Funnel" />
            </div>
            <div className="form-group">
              <label className="form-label">Beschreibung (optional)</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kurze Beschreibung" />
            </div>
            <div className="form-group">
              <label className="form-label">Schritte</label>
              {form.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-2)", alignItems: "center" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", width: 20, flexShrink: 0, textAlign: "right" }}>{i + 1}.</span>
                  <input className="input" value={s} onChange={e => updateStep(i, e.target.value)} placeholder={`Schritt ${i + 1}`} style={{ flex: 1 }} />
                  {form.steps.length > 1 && (
                    <button onClick={() => removeStep(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-4)", fontSize: 16, padding: "0 4px" }}>×</button>
                  )}
                </div>
              ))}
              <button className="btn btn-ghost btn-sm" onClick={addStep} style={{ alignSelf: "flex-start", marginTop: "var(--s-1)" }}>+ Schritt hinzufügen</button>
            </div>
            <button className="btn btn-primary btn-sm" onClick={createFunnel} disabled={saving} style={{ alignSelf: "flex-start" }}>
              {saving ? "Erstellen…" : "Funnel erstellen"}
            </button>
          </div>
        )}
      </div>

      {/* Funnel list */}
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Meine Funnels</div>
        {loading ? <div style={{ color: "var(--c-text-3)", fontSize: "var(--text-sm)" }}>Lädt…</div>
          : funnels.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--s-6) 0" }}>
              <div style={{ fontSize: 32 }}>🔽</div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: "var(--s-2)" }}>Noch keine Funnels</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
              {funnels.map((f, i) => (
                <div key={f.id ?? i} style={{ padding: "var(--s-3) 0", borderBottom: "1px solid var(--c-border)" }}>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)", marginBottom: "var(--s-2)" }}>{f.name}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--s-1)" }}>
                    {(f.steps || []).map((s, j) => (
                      <span key={j} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span className="badge badge-sm badge-neutral">{s}</span>
                        {j < (f.steps.length - 1) && <span style={{ color: "var(--c-text-3)", fontSize: 12 }}>›</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ── TabCustomKPIs ─────────────────────────────────────────────────────────────
function TabCustomKPIs({ authHeader }) {
  const toast = useToast();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", einheit: "€", formel_typ: "sum", description: "", zielwert: "", alert_unter: "", alert_uber: "" });

  const EINHEITEN = ["€", "€k", "%", "Stück", "Tage", "Stunden", "Punkte"];
  const FORMEL_TYPEN = [
    { key: "sum",    label: "Summe",       desc: "Addiert alle Werte" },
    { key: "avg",    label: "Durchschnitt", desc: "Mittlerer Wert" },
    { key: "ratio",  label: "Verhältnis",   desc: "A geteilt durch B" },
    { key: "custom", label: "Formel",       desc: "Eigene Berechnung" },
  ];

  useEffect(() => {
    fetch("/api/custom-kpis", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setKpis(Array.isArray(d) ? d : (d.kpis ?? [])))
      .catch(() => setKpis([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  async function createKpi() {
    if (!form.name.trim()) { toast.error("Name ist erforderlich."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/custom-kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setKpis(prev => [created, ...prev]);
      setForm({ name: "", einheit: "€", formel_typ: "sum", description: "", zielwert: "", alert_unter: "", alert_uber: "" });
      setShowForm(false);
      toast.success("KPI erstellt.");
    } catch {
      toast.error("Fehler beim Erstellen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      <div className="card" style={{ padding: "var(--s-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showForm ? "var(--s-4)" : 0 }}>
          <div className="section-title" style={{ margin: 0 }}>Eigene KPIs</div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? "✕ Abbrechen" : "+ Neuen KPI erstellen"}
          </button>
        </div>
        {showForm && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)", borderTop: "1px solid var(--c-border)", paddingTop: "var(--s-4)" }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="z.B. Deckungsbeitrag" />
            </div>
            <div className="form-group">
              <label className="form-label">Einheit</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-2)" }}>
                {EINHEITEN.map(e => (
                  <button key={e} className={`btn btn-sm ${form.einheit === e ? "btn-primary" : "btn-secondary"}`} onClick={() => setForm(f => ({ ...f, einheit: e }))}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Formel-Typ</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-2)" }}>
                {FORMEL_TYPEN.map(ft => (
                  <button
                    key={ft.key}
                    onClick={() => setForm(f => ({ ...f, formel_typ: ft.key }))}
                    style={{
                      padding: "var(--s-3)",
                      border: `2px solid ${form.formel_typ === ft.key ? "var(--c-primary)" : "var(--c-border)"}`,
                      borderRadius: "var(--r-md)",
                      background: form.formel_typ === ft.key ? "var(--c-primary-light)" : "var(--c-surface-2)",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>{ft.label}</div>
                    <div style={{ fontSize: 10, color: "var(--c-text-3)", marginTop: 2 }}>{ft.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Beschreibung</label>
              <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Kurze Beschreibung" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--s-3)" }}>
              {[["zielwert", "Zielwert"], ["alert_unter", "Alert unter"], ["alert_uber", "Alert über"]].map(([k, l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="input" type="number" value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-sm" onClick={createKpi} disabled={saving} style={{ alignSelf: "flex-start" }}>
              {saving ? "Erstellen…" : "KPI erstellen"}
            </button>
          </div>
        )}
      </div>

      {/* KPI Grid */}
      {loading ? <div style={{ color: "var(--c-text-3)", fontSize: "var(--text-sm)" }}>Lädt…</div>
        : kpis.length === 0 ? (
          <div className="card" style={{ padding: "var(--s-8)", textAlign: "center" }}>
            <div style={{ fontSize: 32 }}>⚡</div>
            <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: "var(--s-2)" }}>Noch keine eigenen KPIs</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--s-3)" }}>
            {kpis.map((k, i) => (
              <div key={k.id ?? i} className="card" style={{ padding: "var(--s-4)" }}>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginBottom: "var(--s-1)" }}>{k.formel_typ ?? "sum"}</div>
                <div style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--c-text)" }}>{k.name}</div>
                {k.einheit && <div style={{ fontSize: "var(--text-xs)", color: "var(--c-primary)", marginTop: "var(--s-1)" }}>{k.einheit}</div>}
                {k.description && <div style={{ fontSize: 11, color: "var(--c-text-3)", marginTop: "var(--s-2)" }}>{k.description}</div>}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ── TabUnternehmen ────────────────────────────────────────────────────────────
function TabUnternehmen({ authHeader }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: "", legal_name: "", rechtsform: "", gruendungsjahr: "", branche: "",
    mitarbeiterzahl: "", beschreibung: "", website: "", telefon: "", email_public: "",
    strasse: "", plz: "", stadt: "", land: "Deutschland",
    steuernummer: "", ust_id: "",
  });

  useEffect(() => {
    fetch("/api/growth/company-profile", { headers: authHeader() })
      .then(r => r.ok ? r.json() : {})
      .then(d => setData(prev => ({ ...prev, ...d })))
      .catch(() => {});
  }, []); // eslint-disable-line

  const filledFields = Object.values(data).filter(v => v && String(v).trim()).length;
  const totalFields = Object.keys(data).length;
  const completeness = Math.round((filledFields / totalFields) * 100);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/growth/company-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Unternehmensdaten gespeichert.");
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  const F = ({ label, k, type = "text", placeholder = "" }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <input className="input" type={type} value={data[k] || ""} onChange={e => setData(d => ({ ...d, [k]: e.target.value }))} placeholder={placeholder} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      {/* Completeness */}
      <div className="card" style={{ padding: "var(--s-4)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-2)" }}>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--c-text)" }}>Profil-Vollständigkeit</span>
          <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: completeness >= 80 ? "var(--c-success)" : completeness >= 50 ? "var(--c-warning)" : "var(--c-danger)" }}>
            {completeness}%
          </span>
        </div>
        <div style={{ height: 6, background: "var(--c-surface-2)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${completeness}%`,
            background: completeness >= 80 ? "var(--c-success)" : completeness >= 50 ? "var(--c-warning)" : "var(--c-danger)",
            borderRadius: 3, transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Grunddaten */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Grunddaten</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          <F label="Unternehmensname" k="name" placeholder="Meine GmbH" />
          <F label="Rechtliche Bezeichnung" k="legal_name" placeholder="Meine GmbH & Co. KG" />
          <div className="form-group">
            <label className="form-label">Rechtsform</label>
            <select className="input" value={data.rechtsform || ""} onChange={e => setData(d => ({ ...d, rechtsform: e.target.value }))}>
              <option value="">Bitte wählen</option>
              {["GmbH", "UG", "AG", "GbR", "Einzelunternehmen", "Freiberufler", "e.K.", "KG", "OHG", "Verein", "Sonstiges"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
            <F label="Gründungsjahr" k="gruendungsjahr" placeholder="2020" />
            <div className="form-group">
              <label className="form-label">Mitarbeiterzahl</label>
              <select className="input" value={data.mitarbeiterzahl || ""} onChange={e => setData(d => ({ ...d, mitarbeiterzahl: e.target.value }))}>
                <option value="">Bitte wählen</option>
                {["1", "2-5", "6-10", "11-25", "26-50", "51-100", "101-250", "251-500", "500+"].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Branche</label>
            <select className="input" value={data.branche || ""} onChange={e => setData(d => ({ ...d, branche: e.target.value }))}>
              <option value="">Bitte wählen</option>
              {["E-Commerce", "SaaS / Software", "Dienstleistungen", "Handel / Retail", "Gastronomie", "Gesundheit", "Bildung", "Finanzen", "Immobilien", "Logistik", "Sonstiges"].map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Beschreibung</label>
            <textarea className="input" rows={3} value={data.beschreibung || ""} onChange={e => setData(d => ({ ...d, beschreibung: e.target.value }))} placeholder="Kurze Beschreibung deines Unternehmens" style={{ resize: "vertical" }} />
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Kontakt</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          <F label="Website" k="website" placeholder="https://www.beispiel.de" />
          <F label="Telefon" k="telefon" placeholder="+49 30 12345678" />
          <F label="Öffentliche E-Mail" k="email_public" type="email" placeholder="kontakt@beispiel.de" />
        </div>
      </div>

      {/* Adresse */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Adresse</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
          <F label="Straße & Hausnummer" k="strasse" placeholder="Musterstraße 1" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: "var(--s-3)" }}>
            <F label="PLZ" k="plz" placeholder="10115" />
            <F label="Stadt" k="stadt" placeholder="Berlin" />
            <F label="Land" k="land" placeholder="Deutschland" />
          </div>
        </div>
      </div>

      {/* Steuer */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Steuer</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
          <F label="Steuernummer" k="steuernummer" placeholder="12/345/67890" />
          <F label="USt-IdNr." k="ust_id" placeholder="DE123456789" />
        </div>
      </div>

      <button className="btn btn-primary btn-md" onClick={save} disabled={saving} style={{ alignSelf: "flex-start" }}>
        {saving ? "Speichern…" : "Speichern"}
      </button>
    </div>
  );
}

// ── TabMarke ──────────────────────────────────────────────────────────────────
function TabMarke({ authHeader }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({ logo_url: "", primary_color: "#635BFF", slogan: "", kommunikationsstil: "professionell" });

  const PRESETS = ["#635BFF", "#0A84FF", "#34C759", "#FF9500", "#FF3B30", "#AF52DE", "#FF2D55", "#1C1C1E"];
  const STILE = [
    { key: "professionell", label: "Professionell", desc: "Seriös, kompetent, vertrauenswürdig" },
    { key: "freundlich",    label: "Freundlich",    desc: "Warm, zugänglich, nahbar" },
    { key: "mutig",         label: "Mutig",         desc: "Direkt, selbstbewusst, innovativ" },
    { key: "kreativ",       label: "Kreativ",       desc: "Spielerisch, originell, inspirierend" },
  ];

  useEffect(() => {
    fetch("/api/growth/brand-profile", { headers: authHeader() })
      .then(r => r.ok ? r.json() : {})
      .then(d => setData(prev => ({ ...prev, ...d })))
      .catch(() => {});
  }, []); // eslint-disable-line

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/growth/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Markenprofil gespeichert.");
    } catch {
      toast.error("Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-5)" }}>
      {/* Logo */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Logo & Farbe</div>
        <div style={{ display: "flex", gap: "var(--s-5)", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="form-group" style={{ marginBottom: "var(--s-3)" }}>
              <label className="form-label">Logo URL</label>
              <input className="input" value={data.logo_url || ""} onChange={e => setData(d => ({ ...d, logo_url: e.target.value }))} placeholder="https://beispiel.de/logo.png" />
            </div>
            <div className="form-group" style={{ marginBottom: "var(--s-3)" }}>
              <label className="form-label">Slogan</label>
              <input className="input" value={data.slogan || ""} onChange={e => setData(d => ({ ...d, slogan: e.target.value }))} placeholder="Dein Unternehmensslogan" />
            </div>
            <div className="form-group">
              <label className="form-label">Primärfarbe</label>
              <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", alignItems: "center" }}>
                {PRESETS.map(c => (
                  <button
                    key={c}
                    onClick={() => setData(d => ({ ...d, primary_color: c }))}
                    style={{
                      width: 28, height: 28, borderRadius: "50%", background: c, border: "none", cursor: "pointer",
                      outline: data.primary_color === c ? "2px solid var(--c-text)" : "none",
                      outlineOffset: 2,
                    }}
                  />
                ))}
                <input type="color" value={data.primary_color || "#635BFF"} onChange={e => setData(d => ({ ...d, primary_color: e.target.value }))} style={{ width: 28, height: 28, padding: 0, border: "none", cursor: "pointer", borderRadius: "50%", overflow: "hidden" }} />
              </div>
            </div>
          </div>
          {/* Logo preview */}
          <div style={{
            width: 100, height: 100,
            border: "1px solid var(--c-border)",
            borderRadius: "var(--r-md)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--c-surface-2)", flexShrink: 0, overflow: "hidden",
          }}>
            {data.logo_url ? (
              <img src={data.logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
            ) : null}
            <div style={{ fontSize: 32, display: data.logo_url ? "none" : "flex" }}>🏢</div>
          </div>
        </div>
      </div>

      {/* Kommunikationsstil */}
      <div className="card" style={{ padding: "var(--s-6)" }}>
        <div className="section-title" style={{ marginBottom: "var(--s-4)" }}>Kommunikationsstil</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
          {STILE.map(s => (
            <button
              key={s.key}
              onClick={() => setData(d => ({ ...d, kommunikationsstil: s.key }))}
              style={{
                padding: "var(--s-4)",
                border: `2px solid ${data.kommunikationsstil === s.key ? "var(--c-primary)" : "var(--c-border)"}`,
                borderRadius: "var(--r-md)",
                background: data.kommunikationsstil === s.key ? "var(--c-primary-light)" : "var(--c-surface-2)",
                cursor: "pointer", textAlign: "left",
              }}
            >
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--c-text)" }}>{s.label}</div>
              <div style={{ fontSize: 11, color: "var(--c-text-3)", marginTop: 4 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-md" onClick={save} disabled={saving} style={{ alignSelf: "flex-start" }}>
        {saving ? "Speichern…" : "Speichern"}
      </button>
    </div>
  );
}

// ── Sidebar navigation data ───────────────────────────────────────────────────
const SIDEBAR_SECTIONS = [
  {
    label: null,
    items: [
      { id: "konto",              label: "Konto",              icon: "👤" },
      { id: "team",               label: "Team",               icon: "👥" },
      { id: "benachrichtigungen", label: "Benachrichtigungen", icon: "🔔" },
      { id: "sprache",            label: "Sprache",            icon: "🌐" },
      { id: "abonnement",         label: "Abonnement",         icon: "💳" },
    ],
  },
  {
    label: "Analyse",
    items: [
      { id: "abtests",      label: "A/B Tests",          icon: "🧪" },
      { id: "standort_cfg", label: "Standort-Analyse",   icon: "📍" },
      { id: "reports_cfg",  label: "Reports & Berichte",  icon: "📊" },
      { id: "funnels_cfg",  label: "Funnels",             icon: "🔽" },
      { id: "custom_kpis",  label: "Eigene KPIs",         icon: "⚡" },
    ],
  },
  {
    label: "Unternehmen",
    items: [
      { id: "profil", label: "Unternehmensdaten",  icon: "🏢" },
      { id: "marke",  label: "Marke & Branding",   icon: "🎨" },
    ],
  },
];

// ── Main Settings ─────────────────────────────────────────────────────────────

export default function Settings() {
  const { user, authHeader, logout } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "konto");

  // Sync URL → state
  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) setActiveTab(tabFromUrl);
  }, [tabFromUrl]); // eslint-disable-line

  function selectTab(id) {
    setActiveTab(id);
    setSearchParams({ tab: id }, { replace: true });
  }

  function renderContent() {
    switch (activeTab) {
      case "konto":              return <KontoTab user={user} authHeader={authHeader} logout={logout} />;
      case "team":               return <TeamTab authHeader={authHeader} />;
      case "benachrichtigungen": return <BenachrichtigungenTab authHeader={authHeader} />;
      case "sprache":            return <SpracheTab />;
      case "abonnement":         return <AbonnementTab authHeader={authHeader} />;
      case "abtests":            return <TabABTests authHeader={authHeader} />;
      case "standort_cfg":       return <TabStandortAnalyse authHeader={authHeader} />;
      case "reports_cfg":        return <TabReports authHeader={authHeader} />;
      case "funnels_cfg":        return <TabFunnels authHeader={authHeader} />;
      case "custom_kpis":        return <TabCustomKPIs authHeader={authHeader} />;
      case "profil":             return <TabUnternehmen authHeader={authHeader} />;
      case "marke":              return <TabMarke authHeader={authHeader} />;
      default:                   return <KontoTab user={user} authHeader={authHeader} logout={logout} />;
    }
  }

  const activeLabel = SIDEBAR_SECTIONS.flatMap(s => s.items).find(i => i.id === activeTab)?.label ?? "Einstellungen";

  return (
    <div
      className="page-enter"
      style={{
        background: "var(--c-bg)",
        minHeight: "calc(100dvh - var(--nav-height))",
        display: "flex",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      {/* Sidebar */}
      <div style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--c-border)",
        padding: "var(--s-6) 0",
        display: "flex",
        flexDirection: "column",
        gap: "var(--s-1)",
      }}>
        <div style={{ padding: "0 var(--s-4) var(--s-4)", borderBottom: "1px solid var(--c-border)", marginBottom: "var(--s-3)" }}>
          <div className="page-title" style={{ fontSize: "var(--text-lg)" }}>Einstellungen</div>
        </div>
        {SIDEBAR_SECTIONS.map((section, si) => (
          <div key={si} style={{ marginBottom: "var(--s-3)" }}>
            {section.label && (
              <div style={{ padding: "var(--s-2) var(--s-4)", fontSize: 10, fontWeight: 700, color: "var(--c-text-4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {section.label}
              </div>
            )}
            {section.items.map(item => (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "var(--s-2) var(--s-4)",
                  display: "flex", alignItems: "center", gap: "var(--s-2)",
                  borderRadius: 0,
                  background: activeTab === item.id ? "var(--c-primary-light)" : "transparent",
                  borderRight: activeTab === item.id ? "3px solid var(--c-primary)" : "3px solid transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "var(--text-sm)",
                  color: activeTab === item.id ? "var(--c-primary)" : "var(--c-text-2)",
                  fontWeight: activeTab === item.id ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "var(--s-8)", overflow: "auto" }}>
        <div style={{ marginBottom: "var(--s-6)" }}>
          <div className="page-title">{activeLabel}</div>
        </div>
        <div key={activeTab} className="page-enter">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
