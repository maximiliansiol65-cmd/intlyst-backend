import asyncio
import importlib
import logging
import os
import time
import uuid
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, init_db, reset_current_workspace_id, set_current_workspace_id
from security_config import get_runtime_secret_issues, is_configured_secret, is_production_environment

RequestSizeMiddleware = None
SecurityMiddleware = None
backup_system = None
security_logger = logging.getLogger("security")

try:
    security_middleware_module = importlib.import_module("security.middleware")
    RequestSizeMiddleware = getattr(security_middleware_module, "RequestSizeMiddleware", None)
    SecurityMiddleware = getattr(security_middleware_module, "SecurityMiddleware", None)
except Exception:
    pass

try:
    backup_module = importlib.import_module("security.backup")
    backup_system = getattr(backup_module, "backup_system", None)
except Exception:
    pass

try:
    security_core_module = importlib.import_module("security.core")
    security_logger = getattr(security_core_module, "security_logger", security_logger)
except Exception:
    pass

# Rate Limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from rate_limit import limiter

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("main")
audit_logger = logging.getLogger("audit")

from routers import (
    timeseries, actions, goals, anomalies,
    notifications, tasks, recommendations,
    dev_seed, kpi, alerts, ai, forecast,
    digest, integrations, market, location,
    customers, benchmark, billing,
    analytics_integrations, auth, team, intlyst, growth,
    reports, abtests, cohorts, funnels, custom_kpis, workspaces, ga4,
    events, briefing, instagram, proactive, shopify, stripe, scheduler,
)
from api.email_preferences_routes import router as email_prefs_router
from api.user_integrations_routes import router as user_integrations_router

# ── APScheduler ───────────────────────────────────────────────────────────────
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.schedulers.base import STATE_RUNNING
from services.report_service import scheduled_daily_report, scheduled_weekly_report
from api.ga4_routes import scheduled_ga4_import

_scheduler = AsyncIOScheduler(timezone="Europe/Berlin")

# ── CORS ──────────────────────────────────────────────────────────────────────
_allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "")
if _allowed_origins_raw:
    _allowed_origins = [o.strip() for o in _allowed_origins_raw.split(",") if o.strip()]
else:
    # Fallback nur fuer lokale Entwicklung – in Produktion ALLOWED_ORIGINS setzen!
    _allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app = FastAPI(
    title="Intlyst Business API",
    version="0.28.0",
    docs_url="/docs" if os.getenv("ENVIRONMENT") != "production" else None,
    redoc_url=None,
    openapi_url=None if is_production_environment() else "/openapi.json",
)

# Rate Limiting State
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore[arg-type]

if RequestSizeMiddleware:
    app.add_middleware(RequestSizeMiddleware)
if SecurityMiddleware:
    app.add_middleware(SecurityMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID", "X-Workspace-ID", "X-Workspace-Slug"],
    expose_headers=["X-Request-ID", "X-Response-Time"],
)


def _host_to_workspace_slug(host: str) -> Optional[str]:
    host_no_port = host.split(":")[0].strip().lower()
    if not host_no_port or host_no_port in ("localhost", "127.0.0.1"):
        return None
    parts = host_no_port.split(".")
    if len(parts) < 3:
        return None
    candidate = parts[0]
    if candidate in ("www", "api"):
        return None
    return candidate


@app.middleware("http")
async def workspace_context_middleware(request: Request, call_next):
    header_workspace_id = request.headers.get("x-workspace-id", "").strip()
    header_workspace_slug = request.headers.get("x-workspace-slug", "").strip().lower()
    host_slug = _host_to_workspace_slug(request.headers.get("host", ""))

    try:
        request.state.workspace_id = int(header_workspace_id) if header_workspace_id else None
    except ValueError:
        request.state.workspace_id = None
    request.state.workspace_slug = header_workspace_slug or host_slug

    token = set_current_workspace_id(request.state.workspace_id)
    try:
        response = await call_next(request)
    finally:
        reset_current_workspace_id(token)

    return response


# ── Security Headers Middleware ───────────────────────────────────────────────
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if is_production_environment():
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return response


# ── Request ID + Timing + Audit Logging ──────────────────────────────────────
@app.middleware("http")
async def request_id_and_timing(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    start = time.monotonic()
    response = await call_next(request)
    duration_ms = round((time.monotonic() - start) * 1000, 1)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"

    # Sicherheits-relevante Ereignisse extra loggen
    status = response.status_code
    if status in (401, 403, 429):
        audit_logger.warning(
            "SECURITY %s %s → %s [%sms] ip=%s id=%s",
            request.method, request.url.path, status, duration_ms,
            request.client.host if request.client else "unknown", request_id,
        )
    else:
        logger.info(
            "%s %s → %s [%sms] id=%s",
            request.method, request.url.path, status, duration_ms, request_id,
        )
    return response


# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    issues = get_runtime_secret_issues()
    if issues and is_production_environment():
        raise RuntimeError("Unsichere Produktionskonfiguration: " + " | ".join(issues))
    for issue in issues:
        logger.warning("Sicherheitswarnung: %s", issue)
    init_db()

    # Automatische Berichte planen: täglich 07:00, wöchentlich Mo 07:05
    _scheduler.add_job(
        scheduled_daily_report,
        "cron",
        hour=7,
        minute=0,
        id="auto_daily",
        replace_existing=True,
    )
    _scheduler.add_job(
        scheduled_weekly_report,
        "cron",
        day_of_week="mon",
        hour=7,
        minute=5,
        id="auto_weekly",
        replace_existing=True,
    )
    # GA4 Auto-Import: täglich 06:30 für alle konfigurierten Workspaces
    _scheduler.add_job(
        scheduled_ga4_import,
        "cron",
        hour=6,
        minute=30,
        id="auto_ga4_import",
        replace_existing=True,
    )
    if _scheduler.state != STATE_RUNNING:
        _scheduler.start()
    security_logger.info("Intlyst v0.28 gestartet")
    logger.info("Business Analyse API gestartet | CORS: %s | Scheduler: aktiv", _allowed_origins)

    if backup_system and backup_system.should_auto_backup():
        backup_system.create("daily", "startup", "Startup-Backup")


@app.on_event("shutdown")
async def shutdown():
    if _scheduler.state == STATE_RUNNING:
        _scheduler.shutdown(wait=False)
    logger.info("Scheduler gestoppt.")
    if backup_system:
        backup_system.create("manual", "shutdown", "Shutdown-Backup")


# ── Router einbinden ──────────────────────────────────────────────────────────
app.include_router(timeseries.router)
app.include_router(actions.router)
app.include_router(goals.router)
app.include_router(anomalies.router)
app.include_router(notifications.router)
app.include_router(tasks.router)
app.include_router(recommendations.router)
app.include_router(dev_seed.router)
app.include_router(kpi.router)
app.include_router(alerts.router)
app.include_router(ai.router)
app.include_router(forecast.router)
app.include_router(digest.router)
app.include_router(integrations.router)
app.include_router(market.router)
app.include_router(location.router)
app.include_router(customers.router)
app.include_router(benchmark.router)
app.include_router(billing.router)
app.include_router(analytics_integrations.router)
app.include_router(auth.router)
app.include_router(team.router)
app.include_router(intlyst.router)
app.include_router(growth.router)
app.include_router(reports.router)
app.include_router(workspaces.router)
app.include_router(abtests.router)
app.include_router(cohorts.router)
app.include_router(funnels.router)
app.include_router(custom_kpis.router)
app.include_router(ga4.router)
app.include_router(events.router)
app.include_router(proactive.router)
app.include_router(briefing.router)
app.include_router(instagram.router)
app.include_router(shopify.router)
app.include_router(stripe.router)
app.include_router(scheduler.router)
app.include_router(email_prefs_router)
app.include_router(user_integrations_router)

# Optionaler Security-Router (wird eingebunden wenn security-Modul vorhanden)
try:
    security_router_module = importlib.import_module("api.security_routes")
    app.include_router(security_router_module.router)
except Exception:
    pass


# ── Meta-Endpunkte ────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "status": "ok",
        "app": "Intlyst",
        "version": "0.28.0",
    }


@app.get("/health", tags=["meta"])
def health():
    """Healthcheck – gibt nur Status zurueck, keine Service-Details in Produktion."""
    result: dict = {
        "status": "healthy",
        "database": "connected",
        "ga4": bool(os.getenv("GA4_SERVICE_ACCOUNT_JSON") or os.getenv("GA4_ACCESS_TOKEN")),
    }

    if backup_system:
        stats = backup_system.get_stats()
        result["backup_ok"] = not stats.get("backup_overdue")

    if not is_production_environment():
        result["services"] = {
            "database": "ok",
            "google_maps": "configured" if is_configured_secret(
                os.getenv("GOOGLE_MAPS_API_KEY", ""), prefixes=("AIza",), min_length=20
            ) else "not_configured",
            "anthropic_ai": "configured" if is_configured_secret(
                os.getenv("ANTHROPIC_API_KEY", ""), prefixes=("sk-ant-",), min_length=20
            ) else "not_configured",
            "stripe": "configured" if is_configured_secret(
                os.getenv("STRIPE_SECRET_KEY", ""), prefixes=("sk_",), min_length=12
            ) else "not_configured",
        }
    return result
