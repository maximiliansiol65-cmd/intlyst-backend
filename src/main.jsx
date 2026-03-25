import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import "./styles/design-system.css";

// ── Sentry — Error Tracking + Performance + Session Replay ───────────────────
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env.MODE,                 // "development" | "production"
    release: import.meta.env.VITE_APP_VERSION || "0.14.0",

    // Performance Monitoring — trackt langsame Seiten und API-Calls
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Session Replay: zeichnet auf was der User tat bevor ein Fehler passierte
        maskAllText: false,          // Text sichtbar lassen (Datenschutz: true setzen falls nötig)
        blockAllMedia: false,
        maskAllInputs: true,         // Passwörter/Eingaben immer maskieren
      }),
    ],

    // 100% der Transaktionen in dev, 10% in prod messen
    tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,

    // Session Replay: 10% normaler Sessions, 100% wenn Fehler
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Ignore irrelevante Browser-Fehler
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
      /^Network request failed/,
      /^Loading chunk \d+ failed/,
    ],

    beforeSend(event) {
      // Fehler in Entwicklung nicht nach Sentry schicken
      if (import.meta.env.MODE === "development") return null;
      return event;
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={
        <div style={{
          minHeight: "100dvh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          fontFamily: "-apple-system, sans-serif",
        }}>
          <div style={{ fontSize: 40 }}>⚠</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Etwas ist schiefgelaufen</div>
          <div style={{ color: "#6e6e73", fontSize: 14 }}>
            Das Team wurde automatisch benachrichtigt.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#0071E3", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 20px", cursor: "pointer",
              fontSize: 14, fontWeight: 500,
            }}
          >
            Seite neu laden
          </button>
        </div>
      }
      showDialog
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
