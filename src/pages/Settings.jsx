import { useState, useEffect, useCallback } from "react";
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

export default function Settings() {
  const { user, authHeader, logout } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("konto");

  const TABS_DYNAMIC = [
    { key: "konto",              label: t('account')              },
    { key: "team",               label: t('team')                 },
    { key: "benachrichtigungen", label: t('notifications')        },
    { key: "sprache",            label: t('language')             },
    { key: "abonnement",         label: t('subscription')         },
  ];

  return (
    <div
      className="page-enter"
      style={{
        background: "var(--c-bg)",
        minHeight: "calc(100dvh - var(--nav-height))",
        padding: "var(--s-8)",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "var(--s-6)" }}>
        <div className="page-title">Einstellungen</div>
        <div className="page-subtitle">Verwalte dein Konto und deine Präferenzen</div>
      </div>

      <div className="tabs-underline" style={{ marginBottom: "var(--s-6)" }}>
        {TABS_DYNAMIC.map((t) => (
          <button
            key={t.key}
            className={`tab-underline${activeTab === t.key ? " active" : ""}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div key={activeTab} className="page-enter">
        {activeTab === "konto"              && <KontoTab user={user} authHeader={authHeader} logout={logout} />}
        {activeTab === "team"               && <TeamTab authHeader={authHeader} />}
        {activeTab === "benachrichtigungen" && <BenachrichtigungenTab authHeader={authHeader} />}
        {activeTab === "sprache"            && <SpracheTab />}
        {activeTab === "abonnement"         && <AbonnementTab authHeader={authHeader} />}
      </div>
    </div>
  );
}
