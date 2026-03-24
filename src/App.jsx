/* eslint-disable */
// @ts-nocheck
import { useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import TopNav from "./components/layout/TopNav";
import BottomTabBar from "./components/layout/BottomTabBar";
import ChatPanel from "./components/ChatPanel";
import { useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Login      from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard  from "./pages/Dashboard";
import Analyse    from "./pages/Analyse";
import Wachstum   from "./pages/Wachstum";
import Kunden     from "./pages/Kunden";
import Standort   from "./pages/Standort";
import Tasks      from "./pages/Tasks";
import Alerts     from "./pages/Alerts";
import Settings   from "./pages/Settings";
import ABTests    from "./pages/ABTests";
import Market     from "./pages/Market";
import Mehr       from "./pages/Mehr";
import ReportsHub    from "./pages/ReportsHub";
import Integrations  from "./pages/Integrations";

// ── Loader ────────────────────────────────────────────────────────────────────
function Gear({ size, duration, direction = 1, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        animation: `gear-spin ${duration}s linear infinite`,
        animationDirection: direction === -1 ? "reverse" : "normal",
        ...style,
      }}
    >
      <path
        fill="#000000"
        d="M43.3 5.2l-2.6 9.7a36.2 36.2 0 0 0-8.5 3.5l-9-5.2-9.2 9.2 5.2 9a36.2 36.2 0 0 0-3.5 8.5l-9.7 2.6v13l9.7 2.6a36.2 36.2 0 0 0 3.5 8.5l-5.2 9 9.2 9.2 9-5.2a36.2 36.2 0 0 0 8.5 3.5l2.6 9.7h13l2.6-9.7a36.2 36.2 0 0 0 8.5-3.5l9 5.2 9.2-9.2-5.2-9a36.2 36.2 0 0 0 3.5-8.5l9.7-2.6v-13l-9.7-2.6a36.2 36.2 0 0 0-3.5-8.5l5.2-9-9.2-9.2-9 5.2a36.2 36.2 0 0 0-8.5-3.5l-2.6-9.7h-13zM50 33a17 17 0 1 1 0 34 17 17 0 0 1 0-34z"
      />
      <circle cx="50" cy="50" r="10" fill="#ffffff" />
    </svg>
  );
}

function FullScreenLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
    }}>
      <style>{`
        @keyframes gear-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Gear size={64} duration={2.4} direction={1} />
        <Gear size={44} duration={1.6} direction={-1} style={{ marginTop: 20 }} />
        <Gear size={56} duration={2.0} direction={1} style={{ marginTop: -8 }} />
      </div>

      <div style={{
        fontSize: 13,
        fontWeight: 600,
        color: "#86868b",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        INTLYST lädt...
      </div>
    </div>
  );
}

// ── Route Guards ──────────────────────────────────────────────────────────────
function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicLoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to={user.onboarding_done ? "/" : "/onboarding"} replace />;
  return <Login />;
}

function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarding_done) return <Navigate to="/" replace />;
  return <Onboarding />;
}

function OnboardedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.onboarding_done) return <Navigate to="/onboarding" replace />;
  return <Outlet />;
}

// ── App Shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="app-shell">
      <TopNav onAiClick={() => setChatOpen(true)} />
      <main key={location.pathname} className="page-enter">
        <Outlet />
      </main>
      <BottomTabBar />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"      element={<PublicLoginRoute />} />
      <Route path="/onboarding" element={<OnboardingRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/analyse"   element={<Analyse />} />
            <Route path="/wachstum"  element={<Wachstum />} />
            <Route path="/kunden"    element={<Kunden />} />
            <Route path="/standort"  element={<Standort />} />
            <Route path="/tasks"     element={<Tasks />} />
            <Route path="/alerts"    element={<Alerts />} />
            <Route path="/reports"   element={<ReportsHub />} />
            <Route path="/settings"  element={<Settings />} />
            <Route path="/abtests"   element={<ABTests />} />
            <Route path="/market"    element={<Market />} />
            <Route path="/mehr"         element={<Mehr />} />
            <Route path="/integrations" element={<Integrations />} />

            {/* Legacy redirects */}
            <Route path="/insights"        element={<Navigate to="/analyse" replace />} />
            <Route path="/recommendations" element={<Navigate to="/analyse" replace />} />
            <Route path="/growth"          element={<Navigate to="/wachstum" replace />} />
            <Route path="/customers"       element={<Navigate to="/kunden" replace />} />
            <Route path="/location"        element={<Navigate to="/standort" replace />} />
            <Route path="/benchmark"       element={<Navigate to="/analyse" replace />} />
            <Route path="/ga4"             element={<Navigate to="/settings" replace />} />
            <Route path="/data"            element={<Navigate to="/settings" replace />} />
            <Route path="/pricing"         element={<Navigate to="/settings" replace />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
