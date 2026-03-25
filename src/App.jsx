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
import WelcomeScreen from "./components/onboarding/WelcomeScreen";
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
function Gear({ size, duration, direction = 1, style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100"
      style={{ animation: `gear-spin ${duration}s linear infinite`, animationDirection: direction === -1 ? "reverse" : "normal", ...style }}>
      <path fill="#000000" d="M43.3 5.2l-2.6 9.7a36.2 36.2 0 0 0-8.5 3.5l-9-5.2-9.2 9.2 5.2 9a36.2 36.2 0 0 0-3.5 8.5l-9.7 2.6v13l9.7 2.6a36.2 36.2 0 0 0 3.5 8.5l-5.2 9 9.2 9.2 9-5.2a36.2 36.2 0 0 0 8.5 3.5l2.6 9.7h13l2.6-9.7a36.2 36.2 0 0 0 8.5-3.5l9 5.2 9.2-9.2-5.2-9a36.2 36.2 0 0 0 3.5-8.5l9.7-2.6v-13l-9.7-2.6a36.2 36.2 0 0 0-3.5-8.5l5.2-9-9.2-9.2-9 5.2a36.2 36.2 0 0 0-8.5-3.5l-2.6-9.7h-13zM50 33a17 17 0 1 1 0 34 17 17 0 0 1 0-34z"/>
      <circle cx="50" cy="50" r="10" fill="#ffffff" />
    </svg>
  );
}

function FullScreenLoader() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--c-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
      <style>{`@keyframes gear-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Gear size={64} duration={2.4} direction={1} />
        <Gear size={44} duration={1.6} direction={-1} style={{ marginTop: 20 }} />
        <Gear size={56} duration={2.0} direction={1} style={{ marginTop: -8 }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
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
  const { user } = useAuth();
  const [chatOpen, setChatOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    return localStorage.getItem("intlyst_welcomed") !== "1";
  });

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
      {user && showWelcome && (
        <WelcomeScreen onComplete={() => setShowWelcome(false)} />
      )}
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
