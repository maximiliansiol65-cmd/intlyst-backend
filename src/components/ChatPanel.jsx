/* eslint-disable */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// ── Icons ──────────────────────────────────────────────────────────────────────
const IcoClose = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
const IcoSend = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M14 2L2 7l4 2 2 5 6-12z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);
const IcoHistory = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.3"/>
    <path d="M7.5 4v3.5l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  </svg>
);
const IcoBookmark = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M2.5 1.5h8v11l-4-2.5L2.5 12.5v-11z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);
const IcoThumb = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
    <path d="M1.5 6h2v5.5h-2zM4.5 5.5l2.5-4 1 .5v3H11l-1 5H4.5V5.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
);

// ── Proaktive Vorschläge basierend auf Zeit (4 Stück, 2×2 Grid) ──────────────
function getContextualSuggestions() {
  const h = new Date().getHours();
  if (h < 12) return [
    "☀️ Wie war mein Umsatz gestern?",
    "📈 Was soll ich heute priorisieren?",
    "🎯 Bin ich auf Kurs mit meinem Ziel?",
    "📊 Zeig mir meine Top-KPIs",
  ];
  if (h < 18) return [
    "💰 Umsatz-Update heute",
    "🔍 Welche Kunden sind abgewandert?",
    "📱 Social Media Performance",
    "⚡ Offene Tasks anzeigen",
  ];
  return [
    "🌙 Zusammenfassung des Tages",
    "📊 Vergleich Heute vs. Gestern",
    "✅ Was habe ich heute erreicht?",
    "🔮 Prognose für morgen",
  ];
}

// ── Command detection ─────────────────────────────────────────────────────────
function detectCommand(msg) {
  const lower = msg.toLowerCase();
  if (/zeig.*umsatz|umsatz.*zeig|umsatz.*chart/.test(lower))
    return { type: "chart", metric: "revenue" };
  if (/erstell.*task|neuer task|task.*erstellen/.test(lower))
    return { type: "create_task" };
  if (/vergleich.*woch/.test(lower))
    return { type: "compare" };
  return null;
}

// ── Chat History store ────────────────────────────────────────────────────────
const HISTORY_KEY = "intlyst_chat_history";
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; }
}
function saveHistory(sessions) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions.slice(0, 10)));
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────
const BOOKMARKS_KEY = "intlyst_chat_bookmarks";
function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || "[]"); } catch { return []; }
}
function addBookmark(content) {
  const bm = loadBookmarks();
  const entry = { content, ts: Date.now() };
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([entry, ...bm].slice(0, 20)));
}

// ── Inline command UI components ──────────────────────────────────────────────
function InlineChart({ metric: _metric }) {
  return (
    <div style={{
      background: "var(--c-surface-2)",
      border: "1px solid var(--c-border)",
      borderRadius: "var(--r-md)",
      padding: "var(--s-3)",
      marginTop: "var(--s-2)",
      fontSize: "var(--text-xs)",
      color: "var(--c-text-3)",
    }}>
      <div style={{ fontWeight: 500, color: "var(--c-text-2)", marginBottom: 4 }}>
        📊 Umsatz · letzte 7 Tage
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
        {[40, 65, 55, 80, 70, 90, 75].map((v, i) => (
          <div key={i} style={{
            flex: 1,
            height: `${v}%`,
            background: "var(--c-primary)",
            borderRadius: "2px 2px 0 0",
            opacity: i === 6 ? 1 : 0.6,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span>Mo</span><span>Di</span><span>Mi</span>
        <span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ChatPanel({ isOpen, onClose }) {
  const { authHeader } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const sessionRef = useRef(null); // current session start time

  // Listen for external open-with-query events (from CommandPalette)
  useEffect(() => {
    function handler(e) {
      if (e.detail?.query) {
        setInput(e.detail.query);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
    window.addEventListener("intlyst:open-chat", handler);
    return () => window.removeEventListener("intlyst:open-chat", handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 320);
      document.body.style.overflow = "hidden";
      if (!sessionRef.current) sessionRef.current = Date.now();
    } else {
      document.body.style.overflow = "";
      // Save session to history
      if (messages.length > 0) {
        const prev = loadHistory();
        const session = {
          id: sessionRef.current,
          preview: messages[0]?.content?.slice(0, 60) + "…",
          messages,
          ts: Date.now(),
        };
        saveHistory([session, ...prev]);
        sessionRef.current = null;
      }
      setShowHistory(false);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]); // eslint-disable-line

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, streamingText]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // ── Streaming send ─────────────────────────────────────────────────────────
  async function send(text) {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setShowHistory(false);

    // Check for inline commands
    const cmd = detectCommand(msg);

    const userMsg = { role: "user", content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setStreamingText("");

    // Handle task creation command
    if (cmd?.type === "create_task") {
      const taskTitle = msg.replace(/erstell.*task[:\s]*/i, "").replace(/neuer task[:\s]*/i, "").trim();
      try {
        await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeader() },
          body: JSON.stringify({ title: taskTitle || "Neuer Task", status: "open", priority: "medium" }),
        });
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `✓ Task erstellt: **"${taskTitle || "Neuer Task"}"**\n\nDu findest ihn jetzt im Kanban Board unter "Offen".`,
          sources: [],
          action: { label: "→ Aufgaben öffnen", to: "/aufgaben" },
        }]);
      } catch {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Fehler beim Erstellen des Tasks. Bitte versuche es erneut.",
          sources: [],
        }]);
      }
      setLoading(false);
      return;
    }

    // Try streaming first
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ message: msg, history }),
      });

      if (res.ok && res.headers.get("content-type")?.includes("text/event-stream")) {
        // SSE streaming
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const raw = line.slice(6).trim();
              if (raw === "[DONE]") break;
              try {
                const parsed = JSON.parse(raw);
                const token = parsed.token || parsed.delta || parsed.content || "";
                accumulated += token;
                setStreamingText(accumulated);
              } catch { accumulated += raw; setStreamingText(accumulated); }
            }
          }
        }
        setStreamingText("");
        setMessages(prev => [...prev, {
          role: "assistant",
          content: accumulated || "Keine Antwort erhalten.",
          sources: [],
          chart: cmd?.type === "chart" ? cmd.metric : null,
        }]);
      } else {
        // Fallback to regular JSON
        const data = await res.json();
        const reply = data?.reply ?? data?.message ?? data?.content ?? "Keine Antwort erhalten.";
        const sources = data?.data_used ?? [];
        setMessages(prev => [...prev, {
          role: "assistant",
          content: reply,
          sources,
          chart: cmd?.type === "chart" ? cmd.metric : null,
        }]);
      }
    } catch {
      // Rule-based fallback
      const fallback = getRuleBasedFallback(msg);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fallback,
        sources: ["Regelbasierte Analyse"],
        isFallback: true,
      }]);
    }

    setStreamingText("");
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function loadSession(session) {
    setMessages(session.messages);
    setShowHistory(false);
    sessionRef.current = session.id;
  }

  if (!isOpen) return null;

  const sessions = loadHistory();
  const suggestions = getContextualSuggestions();

  return (
    <>
      <div className="chat-backdrop" onClick={onClose} aria-hidden="true" />

      <aside className="chat-panel" role="dialog" aria-modal="true" aria-label="KI-Assistent">
        {/* Header */}
        <div className="chat-header">
          <div>
            <div className="chat-header-title">✦ INTLYST AI</div>
            <div className="chat-header-sub">
              <span className="pulse-dot" aria-hidden="true" />
              Verbunden mit deinen Daten
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {sessions.length > 0 && (
              <button
                className="topnav-icon-btn"
                onClick={() => setShowHistory(v => !v)}
                aria-label="Chat-Verlauf"
                title="Verlauf"
              >
                <IcoHistory />
              </button>
            )}
            <button
              className="topnav-icon-btn"
              onClick={onClose}
              aria-label="Chat schließen"
            >
              <IcoClose />
            </button>
          </div>
        </div>

        {/* History panel */}
        {showHistory && (
          <div style={{
            position: "absolute", top: 64, left: 0, right: 0,
            background: "var(--c-surface)",
            borderBottom: "1px solid var(--c-border)",
            maxHeight: 280, overflowY: "auto",
            zIndex: 10,
            boxShadow: "var(--shadow-md)",
          }}>
            <div style={{ padding: "var(--s-3) var(--s-4)", fontSize: "var(--text-xs)", color: "var(--c-text-3)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Letzte Gespräche
            </div>
            {sessions.slice(0, 5).map(s => (
              <button
                key={s.id}
                onClick={() => loadSession(s)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "var(--s-2) var(--s-4)",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--s-2)",
                  borderBottom: "1px solid var(--c-border)",
                  fontSize: "var(--text-sm)", color: "var(--c-text-2)",
                  transition: "background var(--dur-fast) ease",
                  cursor: "pointer",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--c-surface-2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", gap: "var(--s-2)", overflow: "hidden" }}>
                  <span style={{ flexShrink: 0, color: "var(--c-text-4)" }}>💬</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.preview}
                  </span>
                </div>
                <span style={{ flexShrink: 0, fontSize: 10, color: "var(--c-text-4)" }}>
                  {s.ts ? new Date(s.ts).toLocaleDateString("de-DE", { day: "numeric", month: "short" }) : ""}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Messages or empty state */}
        {messages.length === 0 && !loading ? (
          <div className="chat-empty" style={{ justifyContent: "flex-start", paddingTop: "var(--s-8)" }}>
            {/* Big logo + title */}
            <div style={{ textAlign: "center", marginBottom: "var(--s-5)" }}>
              <div style={{ fontSize: 48, lineHeight: 1, color: "var(--c-primary)", marginBottom: "var(--s-2)" }}>✦</div>
              <div style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--c-text)", letterSpacing: "-0.3px" }}>
                INTLYST AI
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--c-text-3)", marginTop: "var(--s-1)", maxWidth: 260, margin: "var(--s-1) auto 0" }}>
                Dein KI-Berater für datengetriebene Entscheidungen
              </div>
            </div>

            {/* 2×2 suggestion grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--s-2)",
              width: "100%",
              padding: "0 var(--s-1)",
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="chat-suggestion-pill"
                  onClick={() => send(s)}
                  style={{ textAlign: "left", padding: "var(--s-3)", lineHeight: 1.3, fontSize: "var(--text-xs)" }}
                >
                  {s}
                </button>
              ))}
            </div>

            <div style={{
              marginTop: "var(--s-4)",
              padding: "var(--s-2) var(--s-3)",
              background: "var(--c-surface-2)",
              borderRadius: "var(--r-sm)",
              fontSize: "var(--text-xs)",
              color: "var(--c-text-3)",
              textAlign: "left",
              width: "100%",
            }}>
              <strong style={{ color: "var(--c-text-2)" }}>Daten-Befehle:</strong>
              <br/>• „Zeig mir Umsatz letzte 7 Tage" → Chart
              <br/>• „Erstell Task: …" → Task wird erstellt
              <br/>• „Vergleich diese Woche mit letzter Woche" → Tabelle
            </div>
          </div>
        ) : (
          <div className="chat-messages" aria-live="polite">
            {messages.map((m, i) => (
              m.role === "user" ? (
                <div key={i} className="chat-msg-user">{m.content}</div>
              ) : (
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {m.isFallback && (
                    <div style={{
                      fontSize: "var(--text-xs)", color: "var(--c-warning)",
                      display: "flex", alignItems: "center", gap: 4,
                      marginBottom: 4,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1L11 10H1L6 1z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M6 5v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><circle cx="6" cy="9" r="0.5" fill="currentColor"/></svg>
                      KI momentan nicht verfügbar — regelbasierte Analyse
                    </div>
                  )}
                  <div className="chat-msg-ai" style={{ position: "relative" }}>
                    <MessageContent content={m.content} />
                    {m.chart && <InlineChart metric={m.chart} />}
                    {m.action && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: "var(--s-2)" }}
                        onClick={() => { navigate(m.action.to); onClose(); }}
                      >
                        {m.action.label}
                      </button>
                    )}
                    <div style={{ display: "flex", gap: 6, marginTop: 6, justifyContent: "flex-end" }}>
                      <button
                        className="chat-action-btn"
                        title="Merken"
                        onClick={() => addBookmark(m.content)}
                      >
                        <IcoBookmark />
                      </button>
                      <button className="chat-action-btn" title="Hilfreich" onClick={() => {}}>
                        <IcoThumb />
                      </button>
                    </div>
                  </div>
                  {m.sources?.length > 0 && (
                    <div className="chat-msg-chips">
                      {m.sources.slice(0, 4).map((s, j) => (
                        <span key={j} className="chat-chip">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}

            {/* Streaming text */}
            {streamingText && (
              <div className="chat-msg-ai">
                <MessageContent content={streamingText} />
                <span className="chat-cursor" aria-hidden="true" />
              </div>
            )}

            {loading && !streamingText && (
              <div className="typing-indicator" aria-label="INTLYST AI schreibt">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            ref={inputRef}
            className="chat-input"
            rows={1}
            placeholder="Frag INTLYST AI… (Enter zum Senden)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Nachricht eingeben"
          />
          <button
            className={`chat-send-btn${input.trim() ? " active" : ""}`}
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            aria-label="Senden"
          >
            <IcoSend />
          </button>
        </div>

        {/* Privacy footer */}
        <div style={{
          padding: "var(--s-2) var(--s-4)",
          borderTop: "1px solid var(--c-border)",
          fontSize: 10,
          color: "var(--c-text-4)",
          textAlign: "center",
          letterSpacing: "0.02em",
          background: "var(--c-surface)",
        }}>
          🔒 Daten bleiben in deinem Workspace · Powered by Claude
        </div>
      </aside>
    </>
  );
}

// ── Render markdown-lite (bold, newlines) ─────────────────────────────────────
function MessageContent({ content }) {
  if (!content) return null;
  // Split on **bold** and newlines
  const parts = content.split(/(\*\*[^*]+\*\*|\n)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part === "\n") return <br key={i} />;
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Rule-based fallback ───────────────────────────────────────────────────────
function getRuleBasedFallback(msg) {
  const lower = msg.toLowerCase();
  if (lower.includes("umsatz")) return "Dein Umsatz-Trend ist in deiner Analyse-Seite sichtbar. Verbinde Stripe oder Shopify für Echtzeit-Daten.";
  if (lower.includes("task") || lower.includes("aufgabe")) return "Deine offenen Tasks findest du im Kanban Board unter /aufgaben.";
  if (lower.includes("kunde")) return "Kundendaten und Segmente sind auf der Kunden-Seite verfügbar. GA4-Integration für vollständige Daten empfohlen.";
  if (lower.includes("social")) return "Social-Media-Metriken sind auf der Social-Seite. Verbinde Instagram, TikTok oder YouTube in den Einstellungen.";
  return "Momentan bin ich offline. Bitte prüfe deine Verbindung oder geh direkt zur relevanten Seite.";
}
