/* eslint-disable */
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

// ── Sidebar Structure ─────────────────────────────────────────────────────────
const SIDEBAR = [
  { group: "Profil", items: [
    { id: "account",     label: "Account",               icon: "👤" },
    { id: "sicherheit",  label: "Sicherheit & Passwort", icon: "🔐" },
  ]},
  { group: "Unternehmen", items: [
    { id: "strategie",   label: "Strategie & Wachstumsziel", icon: "🎯" },
    { id: "profil",      label: "Unternehmensprofil",    icon: "🏢" },
  ]},
  { group: "Integrationen", items: [
    { id: "stripe",      label: "Stripe",                icon: "💳" },
    { id: "ga4",         label: "Google Analytics 4",    icon: "📊" },
    { id: "shopify",     label: "Shopify",               icon: "🛒" },
    { id: "woocommerce", label: "WooCommerce",           icon: "🌐" },
    { id: "hubspot",     label: "HubSpot CRM",           icon: "🔗" },
    { id: "standort",    label: "Google Maps & Standort",icon: "📍" },
    { id: "instagram",   label: "Instagram",             icon: "📸" },
    { id: "tiktok",      label: "TikTok",                icon: "🎵" },
    { id: "youtube",     label: "YouTube",               icon: "▶️" },
    { id: "csv",         label: "CSV Import / Export",   icon: "📁" },
  ]},
  { group: "Analyse", items: [
    { id: "benchmark",   label: "Branchenvergleich",     icon: "📈" },
  ]},
  { group: "Team", items: [
    { id: "team",        label: "Mitglieder & Rollen",   icon: "👥" },
    { id: "berechtigungen", label: "Berechtigungen",     icon: "🛡️" },
  ]},
  { group: "Kommunikation", items: [
    { id: "benachrichtigungen", label: "E-Mail & Alerts",icon: "🔔" },
  ]},
  { group: "Abo & Zahlung", items: [
    { id: "abo",         label: "Plan & Abrechnung",     icon: "💎" },
    { id: "rechnungen",  label: "Rechnungen",            icon: "🧾" },
  ]},
  { group: "System", items: [
    { id: "backup",      label: "Backup & Sicherheit",   icon: "💾" },
    { id: "auditlog",    label: "Audit Log",             icon: "📋" },
  ]},
];

const GOAL_OPTIONS = [
  { id: "mehr_kunden",     label: "Mehr Kunden",            icon: "👥" },
  { id: "mehr_umsatz",     label: "Mehr Umsatz",            icon: "💰" },
  { id: "mehr_reichweite", label: "Mehr Social Reichweite", icon: "📱" },
  { id: "mehr_conversion", label: "Höhere Conversion Rate", icon: "🎯" },
  { id: "kundenbindung",   label: "Kundenbindung stärken",  icon: "❤️" },
  { id: "marktexpansion",  label: "Neuen Markt erschließen",icon: "🌍" },
  { id: "automatisierung", label: "Prozesse automatisieren",icon: "⚙️" },
  { id: "kosten_senken",   label: "Kosten senken",          icon: "📉" },
];

const PHASE_OPTIONS = [
  { id: "startup", label: "Startup (0–10k€/Mo)" },
  { id: "growth",  label: "Growth (10–100k€/Mo)" },
  { id: "scale",   label: "Scale (100k€+/Mo)" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Section({ title, children, action }) {
  return (
    <div style={{ marginBottom: "var(--s-8)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--s-4)" }}>
        <h2 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--c-text)" }}>{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: "var(--s-5)" }}>
      <label className="form-label">{label}</label>
      {children}
      {hint && <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Toggle({ value, onChange, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--s-4) 0", borderBottom: "1px solid var(--c-border)" }}>
      <span style={{ fontSize: "var(--text-sm)", color: "var(--c-text)" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 44, height: 26, borderRadius: 13, padding: 3,
          background: value ? "var(--c-primary)" : "var(--c-surface-3)",
          border: "1px solid var(--c-border-2)", cursor: "pointer", transition: "background 0.2s",
          display: "flex", alignItems: "center", flexShrink: 0,
        }}
      >
        <div style={{
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transform: value ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ── Tab Components ────────────────────────────────────────────────────────────
function TabAccount() {
  const { user, authHeader } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user?.name || "");
  const [company, setCompany] = useState(user?.company || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ name: name.trim(), company: company.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil gespeichert.");
    } catch { toast.error("Fehler beim Speichern."); }
    finally { setSaving(false); }
  }

  return (
    <Section title="Account">
      <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
        <Field label="Name">
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Dein Name" />
        </Field>
        <Field label="E-Mail">
          <input className="input" value={user?.email || ""} disabled style={{ opacity: 0.6 }} />
        </Field>
        <Field label="Unternehmen">
          <input className="input" value={company} onChange={e => setCompany(e.target.value)} placeholder="Firmenname" />
        </Field>
        <button className="btn btn-primary btn-md" onClick={save} disabled={saving}>
          {saving ? "Speichern…" : "Speichern"}
        </button>
      </div>
    </Section>
  );
}

function TabSicherheit() {
  const { authHeader, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [saving, setSaving] = useState(false);

  async function changePassword() {
    if (!cur || !next) return toast.warning("Bitte beide Felder ausfüllen.");
    if (next.length < 10) return toast.warning("Mindestens 10 Zeichen erforderlich.");
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ current_password: cur, new_password: next }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.detail || "Fehler");
      toast.success("Passwort geändert.");
      setCur(""); setNext("");
    } catch (e) { toast.error(e.message || "Fehler."); }
    finally { setSaving(false); }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div>
      <Section title="Passwort ändern">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 480 }}>
          <Field label="Aktuelles Passwort">
            <input className="input" type="password" value={cur} onChange={e => setCur(e.target.value)} />
          </Field>
          <Field label="Neues Passwort" hint="Mindestens 10 Zeichen, Groß- und Kleinbuchstaben + Zahl">
            <input className="input" type="password" value={next} onChange={e => setNext(e.target.value)} />
          </Field>
          <button className="btn btn-primary btn-md" onClick={changePassword} disabled={saving}>
            {saving ? "Speichern…" : "Passwort ändern"}
          </button>
        </div>
      </Section>
      <Section title="Sitzung beenden">
        <div className="card" style={{ padding: "var(--s-5)", maxWidth: 480 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)", marginBottom: "var(--s-4)" }}>
            Beende deine aktuelle Sitzung auf diesem Gerät.
          </p>
          <button className="btn btn-danger btn-md" onClick={handleLogout}>Abmelden</button>
        </div>
      </Section>
    </div>
  );
}

function TabStrategie() {
  const { authHeader, user } = useAuth();
  const toast = useToast();
  const [goalId, setGoalId] = useState("");
  const [industry, setIndustry] = useState(user?.industry || "");
  const [phase, setPhase] = useState("growth");
  const [igHandle, setIgHandle] = useState("");
  const [ttHandle, setTtHandle] = useState("");
  const [ytHandle, setYtHandle] = useState("");
  const [autoUpdate, setAutoUpdate] = useState("daily");
  const [briefingEmail, setBriefingEmail] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/growth/profile", { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setGoalId(d.growth_goal || "");
        setIndustry(d.industry || user?.industry || "");
        setPhase(d.phase || "growth");
        setIgHandle(d.instagram_handle || "");
        setTtHandle(d.tiktok_handle || "");
        setYtHandle(d.youtube_handle || "");
        setAutoUpdate(d.auto_update || "daily");
        setBriefingEmail(d.briefing_email !== false);
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/growth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          growth_goal: goalId,
          growth_goal_label: GOAL_OPTIONS.find(g => g.id === goalId)?.label || goalId,
          industry, phase,
          instagram_handle: igHandle, tiktok_handle: ttHandle, youtube_handle: ytHandle,
          auto_update: autoUpdate, briefing_email: briefingEmail,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Strategie gespeichert! Alle Seiten werden aktualisiert.");
    } catch { toast.error("Fehler beim Speichern."); }
    finally { setSaving(false); }
  }

  const selected = GOAL_OPTIONS.find(g => g.id === goalId);

  return (
    <div>
      {selected && (
        <div className="card" style={{ padding: "var(--s-6)", marginBottom: "var(--s-6)", background: "linear-gradient(135deg, var(--c-primary-light), transparent)", borderLeft: "3px solid var(--c-primary)" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{selected.icon}</div>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{selected.label}</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: 4 }}>
            Alle Analysen und KI-Empfehlungen sind auf dieses Ziel ausgerichtet.
          </div>
        </div>
      )}

      <Section title="Wachstumsziel wählen">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: "var(--s-3)" }}>
          {GOAL_OPTIONS.map(g => (
            <button key={g.id} onClick={() => setGoalId(g.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "flex-start",
              padding: "var(--s-4)", borderRadius: "var(--r-md)", cursor: "pointer", textAlign: "left",
              border: goalId === g.id ? "2px solid var(--c-primary)" : "1px solid var(--c-border-2)",
              background: goalId === g.id ? "var(--c-primary-light)" : "var(--c-surface)",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 24, marginBottom: 8 }}>{g.icon}</span>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: goalId === g.id ? "var(--c-primary)" : "var(--c-text)" }}>
                {g.label}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Unternehmen & Phase">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <Field label="Branche">
            <select className="select" value={industry} onChange={e => setIndustry(e.target.value)}>
              <option value="">Branche wählen…</option>
              {["E-Commerce","SaaS / Software","Gastronomie","Dienstleistung","Einzelhandel","Gesundheit & Beauty","Immobilien","Coaching / Beratung","Andere"].map(b => (
                <option key={b} value={b.toLowerCase().replace(/[^a-z]/g,"")}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Wachstumsphase">
            <div className="tabs-pill">
              {PHASE_OPTIONS.map(p => (
                <button key={p.id} className={`tab-pill${phase === p.id ? " active" : ""}`} onClick={() => setPhase(p.id)}>{p.label}</button>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Social Media Handles">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <Field label="Instagram"><input className="input" value={igHandle} onChange={e => setIgHandle(e.target.value)} placeholder="@deinname" /></Field>
          <Field label="TikTok"><input className="input" value={ttHandle} onChange={e => setTtHandle(e.target.value)} placeholder="@deinname" /></Field>
          <Field label="YouTube"><input className="input" value={ytHandle} onChange={e => setYtHandle(e.target.value)} placeholder="@deinkanal" /></Field>
        </div>
      </Section>

      <Section title="Automatisierung">
        <div className="card" style={{ padding: "var(--s-5) var(--s-6)" }}>
          <Toggle value={briefingEmail} onChange={setBriefingEmail} label="Daily Briefing per E-Mail (07:00)" />
          <div style={{ paddingTop: "var(--s-4)" }}>
            <Field label="KI-Empfehlungen aktualisieren">
              <div className="tabs-pill">
                {[{ id: "daily", label: "Täglich" }, { id: "weekly", label: "Wöchentlich" }].map(opt => (
                  <button key={opt.id} className={`tab-pill${autoUpdate === opt.id ? " active" : ""}`} onClick={() => setAutoUpdate(opt.id)}>{opt.label}</button>
                ))}
              </div>
            </Field>
          </div>
        </div>
      </Section>

      <button className="btn btn-primary btn-lg" onClick={save} disabled={!goalId || saving} style={{ minWidth: 200 }}>
        {saving ? "Speichern…" : "Strategie speichern"}
      </button>
    </div>
  );
}

function TabIntegrations({ subtab }) {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({});

  function f(key) { return fields[key] || ""; }
  function setF(key, val) { setFields(s => ({ ...s, [key]: val })); }

  async function connect(provider, data) {
    setSaving(true);
    try {
      const res = await fetch("/api/user-integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ provider, ...data }),
      });
      if (!res.ok) throw new Error();
      toast.success(`${provider} verbunden!`);
    } catch { toast.error("Verbindung fehlgeschlagen."); }
    finally { setSaving(false); }
  }

  const map = {
    stripe: (
      <Section title="Stripe verbinden">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <Field label="Stripe Secret Key" hint="sk_live_ oder sk_test_ — aus deinem Stripe Dashboard">
            <input className="input" type="password" value={f("stripe_key")} onChange={e => setF("stripe_key", e.target.value)} placeholder="sk_live_..." />
          </Field>
          <button className="btn btn-primary btn-md" onClick={() => connect("stripe", { api_key: f("stripe_key") })} disabled={saving || !f("stripe_key")}>
            {saving ? "Verbinde…" : "Verbinden"}
          </button>
        </div>
      </Section>
    ),
    ga4: (
      <Section title="Google Analytics 4">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <Field label="GA4 Measurement ID" hint="Sieht aus wie G-XXXXXXXXXX">
            <input className="input" value={f("ga4_id")} onChange={e => setF("ga4_id", e.target.value)} placeholder="G-XXXXXXXXXX" />
          </Field>
          <button className="btn btn-primary btn-md" onClick={() => connect("ga4", { measurement_id: f("ga4_id") })} disabled={saving || !f("ga4_id")}>
            {saving ? "Verbinde…" : "Verbinden"}
          </button>
        </div>
      </Section>
    ),
    shopify: (
      <Section title="Shopify verbinden">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <Field label="Shopify Shop URL" hint="z.B. mein-shop.myshopify.com">
            <input className="input" value={f("shopify_url")} onChange={e => setF("shopify_url", e.target.value)} placeholder="mein-shop.myshopify.com" />
          </Field>
          <button className="btn btn-primary btn-md" onClick={() => connect("shopify", { shop_url: f("shopify_url") })} disabled={saving || !f("shopify_url")}>
            {saving ? "Verbinde…" : "Verbinden"}
          </button>
        </div>
      </Section>
    ),
    woocommerce: (
      <Section title="WooCommerce verbinden">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <Field label="Shop URL"><input className="input" value={f("wc_url")} onChange={e => setF("wc_url", e.target.value)} placeholder="https://deinshop.de" /></Field>
          <Field label="Consumer Key"><input className="input" value={f("wc_ck")} onChange={e => setF("wc_ck", e.target.value)} placeholder="ck_..." /></Field>
          <Field label="Consumer Secret"><input className="input" type="password" value={f("wc_cs")} onChange={e => setF("wc_cs", e.target.value)} placeholder="cs_..." /></Field>
          <button className="btn btn-primary btn-md" onClick={() => connect("woocommerce", { url: f("wc_url"), consumer_key: f("wc_ck"), consumer_secret: f("wc_cs") })} disabled={saving}>Verbinden</button>
        </div>
      </Section>
    ),
    hubspot: (
      <Section title="HubSpot CRM">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <Field label="HubSpot API Key"><input className="input" type="password" value={f("hs_key")} onChange={e => setF("hs_key", e.target.value)} placeholder="pat-eu1-..." /></Field>
          <button className="btn btn-primary btn-md" onClick={() => connect("hubspot", { api_key: f("hs_key") })} disabled={saving || !f("hs_key")}>Verbinden</button>
        </div>
      </Section>
    ),
    standort: (
      <Section title="Google Maps & Standortanalyse">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <Field label="Google Maps API Key"><input className="input" type="password" value={f("maps_key")} onChange={e => setF("maps_key", e.target.value)} placeholder="AIzaSy..." /></Field>
          <Field label="Unternehmensadresse"><input className="input" value={f("address")} onChange={e => setF("address", e.target.value)} placeholder="Hauptstr. 1, 10115 Berlin" /></Field>
          <Field label={`Radius: ${f("radius") || 5} km`}>
            <input type="range" min="1" max="20" value={f("radius") || 5} onChange={e => setF("radius", e.target.value)} style={{ width: "100%" }} />
          </Field>
          <button className="btn btn-primary btn-md" onClick={() => connect("google_maps", { api_key: f("maps_key"), address: f("address"), radius: Number(f("radius") || 5) })} disabled={saving || !f("maps_key") || !f("address")}>
            {saving ? "Analysiere…" : "Analyse starten"}
          </button>
        </div>
      </Section>
    ),
    instagram: (
      <Section title="Instagram verbinden">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)", marginBottom: "var(--s-4)" }}>Verbinde dein Instagram Business Konto über Meta Business Suite.</p>
          <button className="btn btn-primary btn-md" onClick={() => toast.info("Instagram OAuth — kommt bald.")}>Mit Instagram verbinden</button>
        </div>
      </Section>
    ),
    tiktok: (
      <Section title="TikTok verbinden">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <button className="btn btn-primary btn-md" onClick={() => toast.info("TikTok OAuth — kommt bald.")}>Mit TikTok verbinden</button>
        </div>
      </Section>
    ),
    youtube: (
      <Section title="YouTube verbinden">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <button className="btn btn-primary btn-md" onClick={() => toast.info("YouTube OAuth — kommt bald.")}>Mit YouTube verbinden</button>
        </div>
      </Section>
    ),
    csv: (
      <Section title="CSV Import / Export">
        <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)", marginBottom: "var(--s-4)" }}>Lade Umsatz-, Kunden- oder Traffic-Daten als CSV hoch.</p>
          <input type="file" accept=".csv" className="input" style={{ padding: "var(--s-2)" }} />
          <button className="btn btn-primary btn-md" style={{ marginTop: "var(--s-4)" }}>Import starten</button>
          <div style={{ marginTop: "var(--s-5)", paddingTop: "var(--s-4)", borderTop: "1px solid var(--c-border)" }}>
            <button className="btn btn-secondary btn-md">Alle Daten exportieren (CSV)</button>
          </div>
        </div>
      </Section>
    ),
  };

  return map[subtab] || <div className="empty-state"><div className="empty-icon">🚧</div><div className="empty-title">Kommt bald</div></div>;
}

function TabBenchmark() {
  const { authHeader } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/benchmark", { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  if (loading) return <div className="skeleton" style={{ height: 200, borderRadius: "var(--r-md)" }} />;

  const metrics = [
    { key: "revenue", label: "Umsatz" },
    { key: "conversion_rate", label: "Conversion Rate" },
    { key: "new_customers", label: "Neue Kunden" },
    { key: "traffic", label: "Traffic" },
  ];

  return (
    <Section title="Branchenvergleich">
      {!data ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <div className="empty-title">Noch keine Benchmark-Daten</div>
          <div className="empty-text">Setze deine Branche in Strategie um Vergleichsdaten zu erhalten.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
          {metrics.map(m => {
            const mine = data[m.key];
            const avg = data[`${m.key}_avg`];
            const top = data[`${m.key}_top25`];
            const pct = avg > 0 ? Math.min((mine / avg) * 100, 200) : 0;
            return (
              <div key={m.key} className="card" style={{ padding: "var(--s-5)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s-3)" }}>
                  <span style={{ fontWeight: 600 }}>{m.label}</span>
                  {mine != null && avg != null && (
                    <span style={{ fontSize: "var(--text-xs)", color: mine >= avg ? "var(--c-success)" : "var(--c-warning)", fontWeight: 600 }}>
                      {mine >= avg ? "Über Ø" : "Unter Ø"}
                    </span>
                  )}
                </div>
                {mine != null && avg != null ? (
                  <>
                    <div style={{ display: "flex", gap: "var(--s-6)", marginBottom: "var(--s-3)" }}>
                      <div><div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>Dein Wert</div><div style={{ fontWeight: 700 }}>{mine.toLocaleString("de-DE")}</div></div>
                      <div><div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>Branche Ø</div><div style={{ fontWeight: 600, color: "var(--c-text-2)" }}>{avg.toLocaleString("de-DE")}</div></div>
                      {top && <div><div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>Top 25%</div><div style={{ fontWeight: 600, color: "var(--c-text-2)" }}>{top.toLocaleString("de-DE")}</div></div>}
                    </div>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? "var(--c-success)" : "var(--c-primary)" }} /></div>
                  </>
                ) : (
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-4)" }}>Keine Daten verfügbar</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function TabTeam() {
  const { authHeader } = useAuth();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch("/api/team", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => setMembers(Array.isArray(d) ? d : d.members ?? []))
      .catch(() => {});
  }, []); // eslint-disable-line

  return (
    <Section title="Team-Mitglieder" action={<button className="btn btn-primary btn-sm">+ Einladen</button>}>
      {members.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">Noch keine Team-Mitglieder</div>
          <div className="empty-text">Lade Kollegen ein um gemeinsam an Intlyst zu arbeiten.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
          {members.map(m => (
            <div key={m.id} className="card" style={{ padding: "var(--s-4)", display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--c-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--c-primary)" }}>
                {(m.name || m.email || "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{m.name || m.email}</div>
                {m.name && <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{m.email}</div>}
              </div>
              <span className="badge badge-neutral">{m.role}</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function TabBenachrichtigungen() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [digestWeekly, setDigestWeekly] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);

  return (
    <Section title="Benachrichtigungen">
      <div className="card" style={{ padding: "var(--s-5) var(--s-6)", maxWidth: 520 }}>
        <Toggle value={emailAlerts} onChange={setEmailAlerts} label="Alert-E-Mails (sofort bei kritischen Ereignissen)" />
        <Toggle value={digestWeekly} onChange={setDigestWeekly} label="Wöchentlicher Digest (jeden Montag 07:00)" />
        <Toggle value={pushNotifs} onChange={setPushNotifs} label="Browser-Push-Benachrichtigungen" />
      </div>
    </Section>
  );
}

function TabAbo() {
  const { authHeader } = useAuth();
  const [billing, setBilling] = useState(null);

  useEffect(() => {
    fetch("/api/billing/subscription", { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(setBilling)
      .catch(() => {});
  }, []); // eslint-disable-line

  return (
    <Section title="Aktueller Plan">
      <div className="card" style={{ padding: "var(--s-6)", display: "flex", alignItems: "center", gap: "var(--s-6)", maxWidth: 520 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "var(--text-xl)", fontWeight: 700 }}>{billing?.plan_name || "Free"}</div>
          {billing?.status === "active" && <div style={{ fontSize: "var(--text-sm)", color: "var(--c-success)", fontWeight: 600, marginTop: 4 }}>● Aktiv</div>}
          {billing?.next_billing_date && (
            <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: 4 }}>
              Nächste Abrechnung: {new Date(billing.next_billing_date).toLocaleDateString("de-DE")}
            </div>
          )}
        </div>
        <button className="btn btn-primary btn-md">Upgrade</button>
      </div>
    </Section>
  );
}

function TabBackup() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function createBackup() {
    setLoading(true);
    try {
      const res = await fetch("/api/security/backup", { method: "POST", headers: authHeader() });
      if (!res.ok) throw new Error();
      toast.success("Backup erstellt!");
    } catch { toast.error("Backup fehlgeschlagen."); }
    finally { setLoading(false); }
  }

  return (
    <Section title="Backup & Datensicherheit">
      <div className="card" style={{ padding: "var(--s-6)", maxWidth: 520 }}>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--c-text-2)", marginBottom: "var(--s-5)", lineHeight: "var(--lh-loose)" }}>
          Automatische Backups täglich 03:00 Uhr. Hier kannst du ein manuelles Backup erstellen.
        </p>
        <button className="btn btn-primary btn-md" onClick={createBackup} disabled={loading}>
          {loading ? "Erstelle Backup…" : "Manuelles Backup erstellen"}
        </button>
      </div>
    </Section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "strategie";
  const integrationIds = SIDEBAR.find(g => g.group === "Integrationen")?.items.map(i => i.id) || [];

  function setTab(id) { setSearchParams({ tab: id }); }

  function renderContent() {
    if (activeTab === "account" || activeTab === "profil") return <TabAccount />;
    if (activeTab === "sicherheit")           return <TabSicherheit />;
    if (activeTab === "strategie")            return <TabStrategie />;
    if (activeTab === "benchmark")            return <TabBenchmark />;
    if (activeTab === "team" || activeTab === "berechtigungen") return <TabTeam />;
    if (activeTab === "benachrichtigungen")   return <TabBenachrichtigungen />;
    if (activeTab === "abo" || activeTab === "rechnungen") return <TabAbo />;
    if (activeTab === "backup" || activeTab === "auditlog") return <TabBackup />;
    if (integrationIds.includes(activeTab))  return <TabIntegrations subtab={activeTab} />;
    return (
      <div className="empty-state">
        <div className="empty-icon">🚧</div>
        <div className="empty-title">Kommt bald</div>
        <div className="empty-text">Dieser Bereich wird gerade entwickelt.</div>
      </div>
    );
  }

  const currentItem = SIDEBAR.flatMap(g => g.items).find(i => i.id === activeTab);

  return (
    <div style={{ minHeight: "calc(100dvh - var(--nav-height))", background: "var(--c-bg)", display: "grid", gridTemplateColumns: "240px 1fr" }}>

      {/* Sidebar */}
      <nav style={{
        background: "var(--c-surface)", borderRight: "1px solid var(--c-border)",
        padding: "var(--s-6) var(--s-3)", overflowY: "auto",
        position: "sticky", top: "var(--nav-height)", height: "calc(100dvh - var(--nav-height))",
      }}>
        {SIDEBAR.map(group => (
          <div key={group.group} style={{ marginBottom: "var(--s-5)" }}>
            <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--c-text-4)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 var(--s-3)", marginBottom: "var(--s-1)" }}>
              {group.group}
            </div>
            {group.items.map(item => (
              <button key={item.id} onClick={() => setTab(item.id)} style={{
                display: "flex", alignItems: "center", gap: "var(--s-3)",
                width: "100%", padding: "var(--s-2) var(--s-3)", borderRadius: "var(--r-sm)",
                cursor: "pointer", textAlign: "left", border: "none",
                background: activeTab === item.id ? "var(--c-primary-light)" : "transparent",
                color: activeTab === item.id ? "var(--c-primary)" : "var(--c-text-2)",
                fontWeight: activeTab === item.id ? 600 : 400,
                fontSize: "var(--text-sm)", transition: "all 0.12s",
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Content */}
      <div style={{ padding: "var(--s-8)", overflowY: "auto" }}>
        {currentItem && (
          <div style={{ marginBottom: "var(--s-6)" }}>
            <h1 style={{ fontSize: "var(--text-title)", fontWeight: 700, color: "var(--c-text)", display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
              <span style={{ fontSize: 28 }}>{currentItem.icon}</span>
              {currentItem.label}
            </h1>
          </div>
        )}
        {renderContent()}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .settings-layout { grid-template-columns: 1fr !important; }
          .settings-sidebar { display: none; }
        }
      `}</style>
    </div>
  );
}
