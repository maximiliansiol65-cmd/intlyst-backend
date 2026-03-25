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
    { id: "strategie",      label: "Strategie & Wachstumsziel", icon: "🎯" },
    { id: "unternehmen",    label: "Unternehmensdaten",         icon: "🏢" },
    { id: "marke",          label: "Marke & Branding",          icon: "🎨" },
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
    { id: "benchmark",      label: "Branchenvergleich",     icon: "📈" },
    { id: "abtests",        label: "A/B Tests",             icon: "🧪" },
    { id: "standort_cfg",   label: "Standort-Analyse",      icon: "📍" },
    { id: "reports_cfg",    label: "Reports & Berichte",    icon: "📊" },
    { id: "funnels_cfg",    label: "Funnels",               icon: "🔽" },
    { id: "custom_kpis",    label: "Eigene KPIs",           icon: "⚡" },
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

// ── Tab: Unternehmensdaten ────────────────────────────────────────────────────
function TabUnternehmen() {
  const { authHeader, user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: user?.company || "",
    legal_name: "",
    website: "",
    phone: "",
    email_public: "",
    street: "",
    city: "",
    zip: "",
    country: "DE",
    founded_year: "",
    employees: "",
    tax_id: "",
    vat_id: "",
    description: "",
    industry: user?.industry || "",
    business_type: "",
  });

  function f(k) { return form[k] || ""; }
  function setF(k, v) { setForm(s => ({ ...s, [k]: v })); }

  useEffect(() => {
    fetch("/api/growth/company-profile", { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setForm(s => ({ ...s, ...d })); })
      .catch(() => {});
  }, []); // eslint-disable-line

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/growth/company-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Unternehmensdaten gespeichert!");
    } catch { toast.error("Fehler beim Speichern."); }
    finally { setSaving(false); }
  }

  const BUSINESS_TYPES = ["GmbH","UG (haftungsbeschränkt)","AG","GbR","Einzelunternehmen","Freiberufler","e.K.","KG","OHG","Verein","Sonstiges"];
  const COUNTRIES = [
    { code: "DE", name: "Deutschland" }, { code: "AT", name: "Österreich" },
    { code: "CH", name: "Schweiz" }, { code: "US", name: "USA" },
    { code: "GB", name: "Vereinigtes Königreich" }, { code: "FR", name: "Frankreich" },
  ];
  const EMPLOYEE_RANGES = ["1 (Solo)","2–5","6–10","11–25","26–50","51–100","101–250","251–500","500+"];
  const INDUSTRIES = ["E-Commerce","SaaS / Software","Gastronomie","Dienstleistung","Einzelhandel","Gesundheit & Beauty","Immobilien","Coaching / Beratung","Medien & Content","Technologie","Finanzen & Versicherung","Logistik","Tourismus","Bildung","Andere"];

  return (
    <div>
      {/* Completeness bar */}
      {(() => {
        const fields = ["company_name","website","phone","street","city","zip","tax_id","description","employees","founded_year"];
        const filled = fields.filter(k => f(k).trim() !== "").length;
        const pct = Math.round((filled / fields.length) * 100);
        return (
          <div className="card" style={{ padding: "var(--s-5) var(--s-6)", marginBottom: "var(--s-6)", display: "flex", alignItems: "center", gap: "var(--s-4)" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s-2)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Profil-Vollständigkeit</span>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: pct >= 80 ? "var(--c-success)" : "var(--c-primary)" }}>{pct}%</span>
              </div>
              <div className="progress-track" style={{ height: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? "var(--c-success)" : "var(--c-primary)", transition: "width 0.4s" }} />
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 4 }}>
                Vollständige Profile erhalten präzisere KI-Analysen
              </div>
            </div>
          </div>
        );
      })()}

      <Section title="Grunddaten">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="Unternehmensname *">
              <input className="input" value={f("company_name")} onChange={e => setF("company_name", e.target.value)} placeholder="Mein Unternehmen GmbH" />
            </Field>
            <Field label="Rechtliche Bezeichnung">
              <input className="input" value={f("legal_name")} onChange={e => setF("legal_name", e.target.value)} placeholder="Vollständiger Handelsname" />
            </Field>
            <Field label="Rechtsform">
              <select className="select" value={f("business_type")} onChange={e => setF("business_type", e.target.value)}>
                <option value="">Rechtsform wählen…</option>
                {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Gründungsjahr">
              <input className="input" value={f("founded_year")} onChange={e => setF("founded_year", e.target.value)} placeholder="2020" type="number" min="1900" max="2030" />
            </Field>
            <Field label="Branche">
              <select className="select" value={f("industry")} onChange={e => setF("industry", e.target.value)}>
                <option value="">Branche wählen…</option>
                {INDUSTRIES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="Mitarbeiterzahl">
              <select className="select" value={f("employees")} onChange={e => setF("employees", e.target.value)}>
                <option value="">Anzahl wählen…</option>
                {EMPLOYEE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Unternehmensbeschreibung" hint="Wird für KI-Analysen und Berichte verwendet">
            <textarea className="input" rows={3} value={f("description")} onChange={e => setF("description", e.target.value)} placeholder="Kurze Beschreibung eures Unternehmens, eurer Produkte und eurer Zielgruppe…" style={{ resize: "vertical" }} />
          </Field>
        </div>
      </Section>

      <Section title="Kontakt & Online">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="Website">
              <input className="input" value={f("website")} onChange={e => setF("website", e.target.value)} placeholder="https://mein-unternehmen.de" type="url" />
            </Field>
            <Field label="Telefon">
              <input className="input" value={f("phone")} onChange={e => setF("phone", e.target.value)} placeholder="+49 30 12345678" type="tel" />
            </Field>
            <Field label="Öffentliche E-Mail">
              <input className="input" value={f("email_public")} onChange={e => setF("email_public", e.target.value)} placeholder="info@firma.de" type="email" />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Adresse">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <Field label="Straße & Hausnummer">
            <input className="input" value={f("street")} onChange={e => setF("street", e.target.value)} placeholder="Hauptstraße 1" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="PLZ">
              <input className="input" value={f("zip")} onChange={e => setF("zip", e.target.value)} placeholder="10115" />
            </Field>
            <Field label="Stadt">
              <input className="input" value={f("city")} onChange={e => setF("city", e.target.value)} placeholder="Berlin" />
            </Field>
            <Field label="Land">
              <select className="select" value={f("country")} onChange={e => setF("country", e.target.value)}>
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Steuer & Recht">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="Steuernummer" hint="Format: 12/345/67890">
              <input className="input" value={f("tax_id")} onChange={e => setF("tax_id", e.target.value)} placeholder="12/345/67890" />
            </Field>
            <Field label="USt-IdNr." hint="Format: DE123456789">
              <input className="input" value={f("vat_id")} onChange={e => setF("vat_id", e.target.value)} placeholder="DE123456789" />
            </Field>
          </div>
        </div>
      </Section>

      <button className="btn btn-primary btn-lg" onClick={save} disabled={saving || !f("company_name")} style={{ minWidth: 220 }}>
        {saving ? "Speichern…" : "Unternehmensdaten speichern"}
      </button>
    </div>
  );
}

// ── Tab: Marke & Branding ─────────────────────────────────────────────────────
function TabMarke() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");
  const [logo, setLogo] = useState("");
  const [slogan, setSlogan] = useState("");
  const [toneOfVoice, setToneOfVoice] = useState("professional");

  useEffect(() => {
    fetch("/api/growth/brand-profile", { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setPrimaryColor(d.primary_color || "#6366f1");
        setLogo(d.logo_url || "");
        setSlogan(d.slogan || "");
        setToneOfVoice(d.tone_of_voice || "professional");
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/growth/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ primary_color: primaryColor, logo_url: logo, slogan, tone_of_voice: toneOfVoice }),
      });
      if (!res.ok) throw new Error();
      toast.success("Branding gespeichert!");
    } catch { toast.error("Fehler beim Speichern."); }
    finally { setSaving(false); }
  }

  const TONE_OPTIONS = [
    { id: "professional", label: "Professionell", desc: "Sachlich und seriös" },
    { id: "friendly",     label: "Freundlich",    desc: "Nahbar und warm" },
    { id: "bold",         label: "Mutig",         desc: "Direkt und selbstbewusst" },
    { id: "creative",     label: "Kreativ",       desc: "Inspirierend und ungewöhnlich" },
  ];

  return (
    <div>
      <Section title="Logo & Farbe">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--s-6)", marginBottom: "var(--s-6)" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "var(--r-md)", background: primaryColor + "22",
              border: `2px solid ${primaryColor}`, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, flexShrink: 0,
            }}>
              {logo ? <img src={logo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", borderRadius: "var(--r-md)" }} /> : "🏢"}
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Logo URL">
                <input className="input" value={logo} onChange={e => setLogo(e.target.value)} placeholder="https://firma.de/logo.png" />
              </Field>
            </div>
          </div>
          <Field label="Primärfarbe" hint="Wird in Reports und Exporten verwendet">
            <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: 48, height: 40, borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", cursor: "pointer", background: "none" }} />
              <input className="input" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="#6366f1" style={{ maxWidth: 140 }} />
              <div style={{ display: "flex", gap: 6 }}>
                {["#6366f1","#0ea5e9","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"].map(c => (
                  <button key={c} onClick={() => setPrimaryColor(c)} style={{ width: 24, height: 24, borderRadius: 6, background: c, border: primaryColor === c ? "2px solid var(--c-text)" : "2px solid transparent", cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </Field>
          <Field label="Slogan / Tagline">
            <input className="input" value={slogan} onChange={e => setSlogan(e.target.value)} placeholder="Dein Unternehmensmotto" />
          </Field>
        </div>
      </Section>

      <Section title="Kommunikationsstil (KI-Anpassung)">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: "var(--s-3)" }}>
          {TONE_OPTIONS.map(t => (
            <button key={t.id} onClick={() => setToneOfVoice(t.id)} style={{
              padding: "var(--s-4)", borderRadius: "var(--r-md)", cursor: "pointer", textAlign: "left",
              border: toneOfVoice === t.id ? "2px solid var(--c-primary)" : "1px solid var(--c-border-2)",
              background: toneOfVoice === t.id ? "var(--c-primary-light)" : "var(--c-surface)",
            }}>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: toneOfVoice === t.id ? "var(--c-primary)" : "var(--c-text)", marginBottom: 2 }}>{t.label}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{t.desc}</div>
            </button>
          ))}
        </div>
      </Section>

      <button className="btn btn-primary btn-lg" onClick={save} disabled={saving} style={{ minWidth: 200, marginTop: "var(--s-4)" }}>
        {saving ? "Speichern…" : "Branding speichern"}
      </button>
    </div>
  );
}

// ── Tab: A/B Tests ────────────────────────────────────────────────────────────
function TabABTests() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTest, setNewTest] = useState({ name: "", category: "conversion", hypothesis: "", metric: "conversion_rate" });

  useEffect(() => {
    fetch("/api/abtests", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setTests(Array.isArray(d) ? d : d.tests ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  async function createTest() {
    if (!newTest.name.trim()) return toast.warning("Bitte einen Namen eingeben.");
    try {
      const res = await fetch("/api/abtests", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ ...newTest, status: "running", variant_a: { name: "Kontrolle", description: "" }, variant_b: { name: "Variante", description: "" } }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setTests(s => [created, ...s]);
      setCreating(false);
      setNewTest({ name: "", category: "conversion", hypothesis: "", metric: "conversion_rate" });
      toast.success("A/B Test erstellt!");
    } catch { toast.error("Fehler beim Erstellen."); }
  }

  const STATUS_COLORS = { running: { bg: "#10b98118", color: "#10b981", label: "Läuft" }, completed: { bg: "#6366f118", color: "#6366f1", label: "Abgeschlossen" }, paused: { bg: "#f59e0b18", color: "#f59e0b", label: "Pausiert" } };
  const CATEGORIES = ["conversion","marketing","ux","pricing","product"];
  const METRICS = [
    { id: "conversion_rate", label: "Conversion Rate" }, { id: "revenue", label: "Umsatz" },
    { id: "clicks", label: "Klicks" }, { id: "bounce_rate", label: "Absprungrate" },
    { id: "session_duration", label: "Sitzungsdauer" }, { id: "add_to_cart", label: "In Warenkorb" },
  ];

  if (loading) return <div className="skeleton" style={{ height: 200, borderRadius: "var(--r-md)" }} />;

  return (
    <div>
      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--s-4)", marginBottom: "var(--s-6)" }}>
        {[
          { label: "Gesamt", value: tests.length, icon: "🧪" },
          { label: "Laufend", value: tests.filter(t => t.status === "running").length, icon: "▶️" },
          { label: "Signifikante Ergebnisse", value: tests.filter(t => t.significant).length, icon: "✅" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "var(--s-5)", display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create new test */}
      {creating ? (
        <div className="card" style={{ padding: "var(--s-6)", marginBottom: "var(--s-5)", border: "2px solid var(--c-primary)" }}>
          <div style={{ fontWeight: 700, marginBottom: "var(--s-4)", fontSize: "var(--text-md)" }}>🧪 Neuen A/B Test erstellen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="Test-Name *">
              <input className="input" value={newTest.name} onChange={e => setNewTest(s => ({ ...s, name: e.target.value }))} placeholder="z.B. Checkout-Button Farbe" autoFocus />
            </Field>
            <Field label="Kategorie">
              <select className="select" value={newTest.category} onChange={e => setNewTest(s => ({ ...s, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Primäre Metrik">
              <select className="select" value={newTest.metric} onChange={e => setNewTest(s => ({ ...s, metric: e.target.value }))}>
                {METRICS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Hypothese" hint="Was erwartest du und warum?">
            <textarea className="input" rows={2} value={newTest.hypothesis} onChange={e => setNewTest(s => ({ ...s, hypothesis: e.target.value }))} placeholder="Wenn wir X ändern, dann erhöht sich Y, weil Z…" style={{ resize: "vertical" }} />
          </Field>
          <div style={{ display: "flex", gap: "var(--s-3)" }}>
            <button className="btn btn-primary btn-md" onClick={createTest}>Test erstellen</button>
            <button className="btn btn-secondary btn-md" onClick={() => setCreating(false)}>Abbrechen</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary btn-md" onClick={() => setCreating(true)} style={{ marginBottom: "var(--s-5)" }}>
          + Neuen A/B Test erstellen
        </button>
      )}

      {/* Test list */}
      <Section title="Aktive & Vergangene Tests">
        {tests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧪</div>
            <div className="empty-title">Noch keine A/B Tests</div>
            <div className="empty-text">Erstelle deinen ersten Test um Varianten zu vergleichen.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {tests.map(test => {
              const s = STATUS_COLORS[test.status] || STATUS_COLORS.running;
              const liftPos = (test.lift_pct || 0) > 0;
              return (
                <div key={test.id} className="card" style={{ padding: "var(--s-5)", display: "flex", alignItems: "center", gap: "var(--s-4)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, textTransform: "uppercase" }}>{s.label}</span>
                      {test.category && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "var(--c-surface-3)", color: "var(--c-text-3)", textTransform: "uppercase" }}>{test.category}</span>}
                      {test.significant && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "#10b98118", color: "#10b981", textTransform: "uppercase" }}>Signifikant</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{test.name}</div>
                    {test.hypothesis && <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 400 }}>{test.hypothesis}</div>}
                  </div>
                  {test.lift_pct != null && (
                    <div style={{ textAlign: "center", background: liftPos ? "#10b98118" : "var(--c-surface-2)", borderRadius: "var(--r-sm)", padding: "var(--s-2) var(--s-3)" }}>
                      <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: liftPos ? "#10b981" : "var(--c-text-3)" }}>{liftPos ? "+" : ""}{test.lift_pct}%</div>
                      <div style={{ fontSize: 9, color: "var(--c-text-4)", textTransform: "uppercase" }}>Lift B/A</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Tab: Standort-Analyse ─────────────────────────────────────────────────────
function TabStandortAnalyse() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(null);
  const [config, setConfig] = useState({ address: "", radius: 5, track_competitors: true, geo_targeting: false, heatmap_enabled: true });

  function f(k) { return config[k]; }
  function setF(k, v) { setConfig(s => ({ ...s, [k]: v })); }

  useEffect(() => {
    fetch("/api/location/settings", { headers: authHeader() })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.config) setConfig(c => ({ ...c, ...d.config }));
        if (d?.stats) setData(d.stats);
      })
      .catch(() => {});
  }, []); // eslint-disable-line

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/location/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error();
      toast.success("Standort-Einstellungen gespeichert!");
    } catch { toast.error("Fehler beim Speichern."); }
    finally { setSaving(false); }
  }

  const TOP_REGIONS = data?.top_regions || [];
  const STATS = [
    { label: "Unique Regionen", value: data?.unique_regions ?? "–", icon: "🗺️" },
    { label: "Lokale Kunden", value: data?.local_customers != null ? `${data.local_customers}%` : "–", icon: "📍" },
    { label: "Reichweite (km)", value: data?.avg_distance ?? "–", icon: "📡" },
  ];

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--s-4)", marginBottom: "var(--s-6)" }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ padding: "var(--s-5)", display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <Section title="Standort-Konfiguration">
        <div className="card" style={{ padding: "var(--s-6)" }}>
          <Field label="Unternehmensadresse" hint="Basisstandort für Radius-Analysen">
            <input className="input" value={f("address")} onChange={e => setF("address", e.target.value)} placeholder="Hauptstr. 1, 10115 Berlin" />
          </Field>
          <Field label={`Analyse-Radius: ${f("radius")} km`}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--s-4)" }}>
              <input type="range" min="1" max="50" value={f("radius")} onChange={e => setF("radius", Number(e.target.value))} style={{ flex: 1 }} />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, minWidth: 50 }}>{f("radius")} km</span>
            </div>
          </Field>
          <div style={{ paddingTop: "var(--s-3)" }}>
            <Toggle value={f("track_competitors")} onChange={v => setF("track_competitors", v)} label="Konkurrenten im Umkreis tracken" />
            <Toggle value={f("geo_targeting")} onChange={v => setF("geo_targeting", v)} label="Geo-Targeting für Kampagnen aktivieren" />
            <Toggle value={f("heatmap_enabled")} onChange={v => setF("heatmap_enabled", v)} label="Heatmap-Analyse aktivieren" />
          </div>
        </div>
      </Section>

      {TOP_REGIONS.length > 0 && (
        <Section title="Top-Regionen deiner Kunden">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
            {TOP_REGIONS.slice(0, 8).map((r, i) => (
              <div key={i} className="card" style={{ padding: "var(--s-4)", display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--c-text-3)", minWidth: 20 }}>#{i + 1}</span>
                <span style={{ flex: 1, fontSize: "var(--text-sm)", fontWeight: 600 }}>{r.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--s-3)" }}>
                  <div className="progress-track" style={{ width: 80 }}>
                    <div className="progress-fill" style={{ width: `${r.pct || 0}%` }} />
                  </div>
                  <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, minWidth: 40, textAlign: "right" }}>{r.pct || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <button className="btn btn-primary btn-lg" onClick={save} disabled={saving} style={{ minWidth: 220 }}>
        {saving ? "Speichern…" : "Einstellungen speichern"}
      </button>
    </div>
  );
}

// ── Tab: Reports & Berichte ───────────────────────────────────────────────────
function TabReports() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [newReport, setNewReport] = useState({ name: "", type: "weekly_summary", format: "pdf", schedule: "weekly", recipients: "" });

  useEffect(() => {
    fetch("/api/reports", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setReports(Array.isArray(d) ? d : d.reports ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  async function saveReport() {
    if (!newReport.name.trim()) return toast.warning("Bitte einen Namen eingeben.");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ ...newReport, recipients: newReport.recipients.split(",").map(e => e.trim()).filter(Boolean) }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setReports(s => [created, ...s]);
      setCreating(false);
      setNewReport({ name: "", type: "weekly_summary", format: "pdf", schedule: "weekly", recipients: "" });
      toast.success("Report-Vorlage gespeichert!");
    } catch { toast.error("Fehler beim Speichern."); }
  }

  async function generate(id) {
    setGenerating(id);
    try {
      const res = await fetch(`/api/reports/${id}/generate`, { method: "POST", headers: authHeader() });
      if (!res.ok) throw new Error();
      toast.success("Report wird erstellt und per E-Mail versendet!");
    } catch { toast.error("Fehler beim Generieren."); }
    finally { setGenerating(null); }
  }

  const REPORT_TYPES = [
    { id: "weekly_summary",  label: "📅 Wochen-Zusammenfassung" },
    { id: "monthly_summary", label: "📆 Monats-Zusammenfassung" },
    { id: "kpi_dashboard",   label: "📊 KPI-Dashboard" },
    { id: "growth_report",   label: "🚀 Wachstums-Report" },
    { id: "customer_report", label: "👥 Kunden-Analyse" },
    { id: "revenue_report",  label: "💰 Umsatz-Report" },
    { id: "social_report",   label: "📱 Social-Media-Report" },
    { id: "full_report",     label: "📋 Vollständiger Report" },
  ];
  const SCHEDULES = [
    { id: "manual",  label: "Manuell" },
    { id: "weekly",  label: "Wöchentlich (Montag)" },
    { id: "monthly", label: "Monatlich (1. des Monats)" },
  ];
  const FORMAT_COLORS = { pdf: "#ef444418", pdf_c: "#ef4444", csv: "#10b98118", csv_c: "#10b981", email: "#6366f118", email_c: "#6366f1" };

  if (loading) return <div className="skeleton" style={{ height: 200, borderRadius: "var(--r-md)" }} />;

  return (
    <div>
      {/* Quick generate row */}
      <div className="card" style={{ padding: "var(--s-5) var(--s-6)", marginBottom: "var(--s-6)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--s-4)", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>Schnell-Report generieren</div>
          <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)" }}>Sofortiger Download — keine Vorlage nötig</div>
        </div>
        <div style={{ display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}>
          {[
            { label: "🗓️ Diese Woche", type: "weekly_summary" },
            { label: "📆 Dieser Monat", type: "monthly_summary" },
            { label: "📊 KPI-Report", type: "kpi_dashboard" },
          ].map(q => (
            <button key={q.type} className="btn btn-secondary btn-sm" onClick={() => { toast.info("Report wird generiert…"); }}>
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create template */}
      {creating ? (
        <div className="card" style={{ padding: "var(--s-6)", marginBottom: "var(--s-5)", border: "2px solid var(--c-primary)" }}>
          <div style={{ fontWeight: 700, marginBottom: "var(--s-4)", fontSize: "var(--text-md)" }}>📊 Neue Report-Vorlage</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="Name *">
              <input className="input" value={newReport.name} onChange={e => setNewReport(s => ({ ...s, name: e.target.value }))} placeholder="z.B. Monatlicher KPI-Report" autoFocus />
            </Field>
            <Field label="Report-Typ">
              <select className="select" value={newReport.type} onChange={e => setNewReport(s => ({ ...s, type: e.target.value }))}>
                {REPORT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Format">
              <div className="tabs-pill">
                {[{ id: "pdf", label: "PDF" }, { id: "csv", label: "CSV" }, { id: "email", label: "E-Mail" }].map(f => (
                  <button key={f.id} className={`tab-pill${newReport.format === f.id ? " active" : ""}`} onClick={() => setNewReport(s => ({ ...s, format: f.id }))}>{f.label}</button>
                ))}
              </div>
            </Field>
            <Field label="Zeitplan">
              <select className="select" value={newReport.schedule} onChange={e => setNewReport(s => ({ ...s, schedule: e.target.value }))}>
                {SCHEDULES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Empfänger (E-Mails, kommagetrennt)" hint="Leer lassen für nur Download">
            <input className="input" value={newReport.recipients} onChange={e => setNewReport(s => ({ ...s, recipients: e.target.value }))} placeholder="max@firma.de, lena@firma.de" />
          </Field>
          <div style={{ display: "flex", gap: "var(--s-3)" }}>
            <button className="btn btn-primary btn-md" onClick={saveReport}>Vorlage speichern</button>
            <button className="btn btn-secondary btn-md" onClick={() => setCreating(false)}>Abbrechen</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary btn-md" onClick={() => setCreating(true)} style={{ marginBottom: "var(--s-5)" }}>
          + Neue Report-Vorlage
        </button>
      )}

      {/* Reports list */}
      <Section title="Gespeicherte Vorlagen">
        {reports.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">Noch keine Report-Vorlagen</div>
            <div className="empty-text">Erstelle Vorlagen für automatisch verschickte Reports.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {reports.map(r => {
              const fc = FORMAT_COLORS;
              const bg = fc[r.format + ""] || "var(--c-surface-2)";
              const color = fc[r.format + "_c"] || "var(--c-text-3)";
              return (
                <div key={r.id} className="card" style={{ padding: "var(--s-5)", display: "flex", alignItems: "center", gap: "var(--s-4)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: bg, color, textTransform: "uppercase" }}>{r.format?.toUpperCase()}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "var(--c-surface-3)", color: "var(--c-text-3)", textTransform: "uppercase" }}>
                        {SCHEDULES.find(s => s.id === r.schedule)?.label || r.schedule}
                      </span>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{r.name}</div>
                    {r.last_sent && <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginTop: 2 }}>Zuletzt: {new Date(r.last_sent).toLocaleDateString("de-DE")}</div>}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => generate(r.id)} disabled={generating === r.id}>
                    {generating === r.id ? "…" : "▶ Jetzt"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Tab: Funnels ──────────────────────────────────────────────────────────────
function TabFunnels() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [funnels, setFunnels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newFunnel, setNewFunnel] = useState({ name: "", description: "", steps: ["Besucher", "Interessent", "Lead", "Kunde"] });

  useEffect(() => {
    fetch("/api/funnels", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setFunnels(Array.isArray(d) ? d : d.funnels ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  function updateStep(i, val) {
    setNewFunnel(s => { const steps = [...s.steps]; steps[i] = val; return { ...s, steps }; });
  }
  function addStep() { setNewFunnel(s => ({ ...s, steps: [...s.steps, ""] })); }
  function removeStep(i) { setNewFunnel(s => ({ ...s, steps: s.steps.filter((_, idx) => idx !== i) })); }

  async function saveFunnel() {
    if (!newFunnel.name.trim()) return toast.warning("Bitte einen Namen eingeben.");
    try {
      const res = await fetch("/api/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(newFunnel),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setFunnels(s => [created, ...s]);
      setCreating(false);
      setNewFunnel({ name: "", description: "", steps: ["Besucher", "Interessent", "Lead", "Kunde"] });
      toast.success("Funnel gespeichert!");
    } catch { toast.error("Fehler beim Speichern."); }
  }

  if (loading) return <div className="skeleton" style={{ height: 160, borderRadius: "var(--r-md)" }} />;

  return (
    <div>
      {creating ? (
        <div className="card" style={{ padding: "var(--s-6)", marginBottom: "var(--s-5)", border: "2px solid var(--c-primary)" }}>
          <div style={{ fontWeight: 700, marginBottom: "var(--s-4)", fontSize: "var(--text-md)" }}>🔽 Neuen Funnel erstellen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)", marginBottom: "var(--s-4)" }}>
            <Field label="Name *">
              <input className="input" value={newFunnel.name} onChange={e => setNewFunnel(s => ({ ...s, name: e.target.value }))} placeholder="z.B. Sales Funnel" autoFocus />
            </Field>
            <Field label="Beschreibung">
              <input className="input" value={newFunnel.description} onChange={e => setNewFunnel(s => ({ ...s, description: e.target.value }))} placeholder="Kurze Beschreibung" />
            </Field>
          </div>
          <Field label="Funnel-Stufen">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)", marginBottom: "var(--s-3)" }}>
              {newFunnel.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--s-2)" }}>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--c-text-4)", minWidth: 20, fontWeight: 600 }}>{i + 1}.</span>
                  <input className="input" value={step} onChange={e => updateStep(i, e.target.value)} placeholder={`Stufe ${i + 1}`} style={{ flex: 1 }} />
                  {newFunnel.steps.length > 2 && (
                    <button onClick={() => removeStep(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-4)", fontSize: 16, padding: "0 4px" }}>×</button>
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addStep}>+ Stufe hinzufügen</button>
          </Field>
          <div style={{ display: "flex", gap: "var(--s-3)" }}>
            <button className="btn btn-primary btn-md" onClick={saveFunnel}>Funnel speichern</button>
            <button className="btn btn-secondary btn-md" onClick={() => setCreating(false)}>Abbrechen</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary btn-md" onClick={() => setCreating(true)} style={{ marginBottom: "var(--s-5)" }}>
          + Neuen Funnel erstellen
        </button>
      )}

      <Section title="Meine Funnels">
        {funnels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔽</div>
            <div className="empty-title">Noch keine Funnels</div>
            <div className="empty-text">Definiere Conversion-Funnels um die Customer Journey zu tracken.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
            {funnels.map(f => (
              <div key={f.id} className="card" style={{ padding: "var(--s-5)" }}>
                <div style={{ fontWeight: 600, marginBottom: "var(--s-3)" }}>{f.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                  {(f.steps || []).map((step, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ background: "var(--c-primary-light)", color: "var(--c-primary)", fontSize: "var(--text-xs)", fontWeight: 600, padding: "3px 10px", borderRadius: 4 }}>{step}</div>
                      {i < (f.steps.length - 1) && <span style={{ color: "var(--c-text-4)", margin: "0 4px", fontSize: 12 }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Tab: Custom KPIs ──────────────────────────────────────────────────────────
function TabCustomKPIs() {
  const { authHeader } = useAuth();
  const toast = useToast();
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKpi, setNewKpi] = useState({ name: "", description: "", formula_type: "simple", unit: "€", target: "", alert_below: "", alert_above: "" });

  useEffect(() => {
    fetch("/api/custom-kpis", { headers: authHeader() })
      .then(r => r.ok ? r.json() : [])
      .then(d => { setKpis(Array.isArray(d) ? d : d.kpis ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []); // eslint-disable-line

  async function saveKpi() {
    if (!newKpi.name.trim()) return toast.warning("Bitte einen Namen eingeben.");
    try {
      const res = await fetch("/api/custom-kpis", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify(newKpi),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setKpis(s => [created, ...s]);
      setCreating(false);
      setNewKpi({ name: "", description: "", formula_type: "simple", unit: "€", target: "", alert_below: "", alert_above: "" });
      toast.success("KPI erstellt!");
    } catch { toast.error("Fehler beim Erstellen."); }
  }

  const FORMULA_TYPES = [
    { id: "simple",     label: "Einfach",     desc: "Direktwert" },
    { id: "ratio",      label: "Verhältnis",  desc: "A ÷ B × 100" },
    { id: "difference", label: "Differenz",   desc: "A − B" },
    { id: "growth",     label: "Wachstum",    desc: "(Neu − Alt) ÷ Alt × 100" },
  ];
  const UNITS = ["€","€k","%","#","s","ms","h"];
  const UNIT_COLORS = { "€": "#10b981", "%": "#6366f1", "#": "#f59e0b", "€k": "#10b981" };

  if (loading) return <div className="skeleton" style={{ height: 160, borderRadius: "var(--r-md)" }} />;

  return (
    <div>
      {creating ? (
        <div className="card" style={{ padding: "var(--s-6)", marginBottom: "var(--s-5)", border: "2px solid var(--c-primary)" }}>
          <div style={{ fontWeight: 700, marginBottom: "var(--s-4)", fontSize: "var(--text-md)" }}>⚡ Neuen KPI erstellen</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="KPI-Name *">
              <input className="input" value={newKpi.name} onChange={e => setNewKpi(s => ({ ...s, name: e.target.value }))} placeholder="z.B. Kundenwert (LTV)" autoFocus />
            </Field>
            <Field label="Einheit">
              <div className="tabs-pill">
                {UNITS.map(u => (
                  <button key={u} className={`tab-pill${newKpi.unit === u ? " active" : ""}`} onClick={() => setNewKpi(s => ({ ...s, unit: u }))}>{u}</button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Formel-Typ">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--s-2)" }}>
              {FORMULA_TYPES.map(t => (
                <button key={t.id} onClick={() => setNewKpi(s => ({ ...s, formula_type: t.id }))} style={{
                  padding: "var(--s-3)", borderRadius: "var(--r-sm)", cursor: "pointer", textAlign: "left",
                  border: newKpi.formula_type === t.id ? "2px solid var(--c-primary)" : "1px solid var(--c-border-2)",
                  background: newKpi.formula_type === t.id ? "var(--c-primary-light)" : "var(--c-surface)",
                }}>
                  <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: newKpi.formula_type === t.id ? "var(--c-primary)" : "var(--c-text)" }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: "var(--c-text-4)" }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Beschreibung">
            <input className="input" value={newKpi.description} onChange={e => setNewKpi(s => ({ ...s, description: e.target.value }))} placeholder="Was misst dieser KPI?" />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--s-4)" }}>
            <Field label="Zielwert">
              <input className="input" value={newKpi.target} onChange={e => setNewKpi(s => ({ ...s, target: e.target.value }))} placeholder="z.B. 1000" type="number" />
            </Field>
            <Field label="Alert unter">
              <input className="input" value={newKpi.alert_below} onChange={e => setNewKpi(s => ({ ...s, alert_below: e.target.value }))} placeholder="Warnung" type="number" />
            </Field>
            <Field label="Alert über">
              <input className="input" value={newKpi.alert_above} onChange={e => setNewKpi(s => ({ ...s, alert_above: e.target.value }))} placeholder="Warnung" type="number" />
            </Field>
          </div>
          <div style={{ display: "flex", gap: "var(--s-3)" }}>
            <button className="btn btn-primary btn-md" onClick={saveKpi}>KPI speichern</button>
            <button className="btn btn-secondary btn-md" onClick={() => setCreating(false)}>Abbrechen</button>
          </div>
        </div>
      ) : (
        <button className="btn btn-primary btn-md" onClick={() => setCreating(true)} style={{ marginBottom: "var(--s-5)" }}>
          + Neuen KPI erstellen
        </button>
      )}

      <Section title="Meine KPIs">
        {kpis.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <div className="empty-title">Noch keine eigenen KPIs</div>
            <div className="empty-text">Erstelle individuelle KPIs die automatisch berechnet und getrackt werden.</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--s-4)" }}>
            {kpis.map(k => {
              const uc = UNIT_COLORS[k.unit] || "var(--c-primary)";
              return (
                <div key={k.id} className="card" style={{ padding: "var(--s-5)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--s-2)" }}>
                    <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{k.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: uc + "18", color: uc }}>{k.unit}</span>
                  </div>
                  {k.description && <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-3)", marginBottom: "var(--s-2)" }}>{k.description}</div>}
                  {k.target && (
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--c-text-4)" }}>
                      🎯 Ziel: <strong>{k.target} {k.unit}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "strategie";
  const integrationIds = SIDEBAR.find(g => g.group === "Integrationen")?.items.map(i => i.id) || [];

  function setTab(id) { setSearchParams({ tab: id }); }

  function renderContent() {
    if (activeTab === "account")               return <TabAccount />;
    if (activeTab === "sicherheit")            return <TabSicherheit />;
    if (activeTab === "strategie")             return <TabStrategie />;
    if (activeTab === "unternehmen" || activeTab === "profil") return <TabUnternehmen />;
    if (activeTab === "marke")                 return <TabMarke />;
    if (activeTab === "benchmark")             return <TabBenchmark />;
    if (activeTab === "abtests")               return <TabABTests />;
    if (activeTab === "standort_cfg")          return <TabStandortAnalyse />;
    if (activeTab === "reports_cfg")           return <TabReports />;
    if (activeTab === "funnels_cfg")           return <TabFunnels />;
    if (activeTab === "custom_kpis")           return <TabCustomKPIs />;
    if (activeTab === "team" || activeTab === "berechtigungen") return <TabTeam />;
    if (activeTab === "benachrichtigungen")    return <TabBenachrichtigungen />;
    if (activeTab === "abo" || activeTab === "rechnungen") return <TabAbo />;
    if (activeTab === "backup" || activeTab === "auditlog") return <TabBackup />;
    if (integrationIds.includes(activeTab))   return <TabIntegrations subtab={activeTab} />;
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
