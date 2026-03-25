/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import TopNav from "./components/layout/TopNav";
import BottomTabBar from "./components/layout/BottomTabBar";
import ChatPanel from "./components/ChatPanel";
import CommandPalette from "./components/search/CommandPalette";
import OfflineBanner from "./components/OfflineBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import ProductTour from "./components/onboarding/ProductTour";
import { useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { LanguageProvider } from "./contexts/LanguageContext";

// Lazy-loaded pages
const Login      = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard  = lazy(() => import("./pages/Dashboard"));
const Analyse    = lazy(() => import("./pages/Analyse"));
const Wachstum   = lazy(() => import("./pages/Wachstum"));
const Kunden     = lazy(() => import("./pages/Kunden"));
const Social     = lazy(() => import("./pages/Social"));
const Aufgaben   = lazy(() => import("./pages/Aufgaben"));
const Settings   = lazy(() => import("./pages/Settings"));

// ── Loader ────────────────────────────────────────────────────────────────────
function FullScreenLoader() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--c-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 28,
    }}>
      <style>{`
        @keyframes _ring {
          0%   { stroke-dashoffset: 88; transform: rotate(-90deg); }
          100% { stroke-dashoffset: -88; transform: rotate(270deg); }
        }
        @keyframes _dot {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.35; }
          40%            { transform: scale(1);    opacity: 1; }
        }
        ._loader-ring { transform-origin: 50% 50%; animation: _ring 1.1s cubic-bezier(0.4,0,0.2,1) infinite; }
        ._loader-dots { display:flex; gap:8px; align-items:center; }
        ._loader-dots span {
          width:7px; height:7px; border-radius:50%;
          background: var(--c-primary);
          animation: _dot 1.2s ease-in-out infinite both;
        }
        ._loader-dots span:nth-child(2){ animation-delay:.16s; }
        ._loader-dots span:nth-child(3){ animation-delay:.32s; }
      `}</style>

      {/* Ring */}
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <circle cx="22" cy="22" r="18" stroke="var(--c-border-2)" strokeWidth="3" />
        <circle
          className="_loader-ring"
          cx="22" cy="22" r="18"
          stroke="var(--c-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="88"
          strokeDashoffset="88"
          fill="none"
        />
      </svg>

      {/* Dots */}
      <div className="_loader-dots">
        <span /><span /><span />
      </div>

      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: "var(--c-text-3)",
        letterSpacing: "0.10em",
        textTransform: "uppercase",
      }}>
        INTLYST lädt…
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div style={{ padding: "var(--s-8)", display: "flex", flexDirection: "column", gap: "var(--s-4)" }}>
      <div className="skeleton" style={{ height: 32, width: "40%", borderRadius: "var(--r-sm)" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--s-3)" }}>
        {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 96, borderRadius: "var(--r-md)" }} />)}
      </div>
      <div className="skeleton" style={{ height: 280, borderRadius: "var(--r-md)" }} />
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
  return <Suspense fallback={<FullScreenLoader />}><Login /></Suspense>;
}

function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarding_done) return <Navigate to="/" replace />;
  return <Suspense fallback={<FullScreenLoader />}><Onboarding /></Suspense>;
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
  const [chatOpen, setChatOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // CMD+K global shortcut
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(v => !v);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Listen for open-chat from command palette
  useEffect(() => {
    function handler() { setChatOpen(true); }
    window.addEventListener("intlyst:open-chat", handler);
    return () => window.removeEventListener("intlyst:open-chat", handler);
  }, []);

  return (
    <div className="app-shell">
      <TopNav onAiClick={() => setChatOpen(true)} onSearchClick={() => setSearchOpen(true)} />
      <OfflineBanner />
      <main key={location.pathname} className="page-enter">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <BottomTabBar />
      <ChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ProductTour />
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
            {/* 6 Hauptbereiche */}
            <Route path="/"          element={<Dashboard />} />
            <Route path="/analyse"   element={<Analyse />} />
            <Route path="/wachstum"  element={<Wachstum />} />
            <Route path="/kunden"    element={<Kunden />} />
            <Route path="/social"    element={<Social />} />
            <Route path="/aufgaben"  element={<Aufgaben />} />
            <Route path="/settings"  element={<Settings />} />

            {/* Legacy Redirects → Settings oder neue Routen */}
            <Route path="/tasks"           element={<Navigate to="/aufgaben" replace />} />
            <Route path="/alerts"          element={<Navigate to="/settings?tab=benachrichtigungen" replace />} />
            <Route path="/standort"        element={<Navigate to="/settings?tab=standort" replace />} />
            <Route path="/market"          element={<Navigate to="/analyse" replace />} />
            <Route path="/benchmark"       element={<Navigate to="/settings?tab=benchmark" replace />} />
            <Route path="/abtests"         element={<Navigate to="/wachstum" replace />} />
            <Route path="/reports"         element={<Navigate to="/analyse" replace />} />
            <Route path="/mehr"            element={<Navigate to="/settings" replace />} />
            <Route path="/integrations"    element={<Navigate to="/settings?tab=integrationen" replace />} />
            <Route path="/insights"        element={<Navigate to="/analyse" replace />} />
            <Route path="/recommendations" element={<Navigate to="/wachstum" replace />} />
            <Route path="/growth"          element={<Navigate to="/wachstum" replace />} />
            <Route path="/customers"       element={<Navigate to="/kunden" replace />} />
            <Route path="/location"        element={<Navigate to="/settings?tab=standort" replace />} />
            <Route path="/ga4"             element={<Navigate to="/settings?tab=ga4" replace />} />
            <Route path="/data"            element={<Navigate to="/settings?tab=integrationen" replace />} />
            <Route path="/pricing"         element={<Navigate to="/settings?tab=abo" replace />} />
            <Route path="/security"        element={<Navigate to="/settings?tab=sicherheit" replace />} />
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
