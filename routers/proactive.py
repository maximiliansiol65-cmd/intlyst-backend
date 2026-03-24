"""
routers/proactive.py

API endpoints for Schicht 10: Proactive Detection Engine.
Exposes proactive alerts and daily briefing to frontend.

Endpoints:
  GET /api/proactive/alerts — Latest proactive alerts
  GET /api/proactive/briefing — Daily briefing
  POST /api/proactive/alerts/{id}/acknowledge — Mark alert as read
  POST /api/proactive/alerts/{id}/snooze — Snooze alert

Integration:
  - Calls analytics.proactive_engine.detect_proactive_alerts()
  - Uses mock data (production: pulls from real analytics bundles)
  - Returns JSON formatted for frontend
"""

from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timedelta
import logging

from analytics.proactive_engine import (
    detect_proactive_alerts,
    build_proactive_context,
    AlertSeverity,
    AlertCategory,
    Urgency,
    ProactiveAlert,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/proactive", tags=["proactive"])


# ============================================================================
# MOCK DATA FOR DEMO (Production: use real analytics bundles)
# ============================================================================

def _get_mock_stats_bundle():
    """Mock statistics bundle for demo."""
    return {
        "daily_revenue": 1340.0,
        "revenue_7d_avg": 1200.0,
        "revenue_z_score": 0.5,
        "conversion_rate": 0.032,  # 3.2%
        "conversion_rate_avg": 0.032,
        "data_quality": 95,
    }


def _get_mock_internal_data():
    """Mock internal data for demo."""
    return {
        "payment_failures_1h": 0,
        "tasks_overdue": 0,
    }


def _get_mock_goals():
    """Mock goals for demo."""
    today = datetime.now().date()
    return [
        {
            "id": "goal_1",
            "title": "Monthly Revenue Goal",
            "progress": 18500.0,
            "target": 30000.0,
            "deadline": (today + timedelta(days=7)).isoformat(),
        },
        {
            "id": "goal_2",
            "title": "Customer Growth",
            "progress": 45,
            "target": 50,
            "deadline": (today + timedelta(days=14)).isoformat(),
        },
    ]


# ============================================================================
# API ENDPOINTS
# ============================================================================


@router.get("/alerts")
async def get_proactive_alerts(
    severity: str = Query(None, description="Filter: critical, warning, opportunity, info"),
    limit: int = Query(10, description="Max alerts to return"),
):
    """
    Get latest proactive alerts.
    
    Query Parameters:
    - severity: Optional filter (critical, warning, opportunity, info)
    - limit: Maximum alerts to return (default 10)
    
    Returns:
    - alerts: List of ProactiveAlert objects
    - summary: One-line status summary
    - generated_at: Timestamp
    - data_quality_score: 0-100 confidence
    
    Example Response:
    ```json
    {
      "alerts": [
        {
          "severity": "warning",
          "category": "goal",
          "title": "Ziel in Gefahr: Monthly Revenue Goal",
          "description": "Progress: 61.7% (noch 7 Tage)",
          "recommended_action": "Beschleunige auf €1,786/Tag",
          "confidence": 90,
          "urgency": "this_week"
        }
      ],
      "counts": {
        "critical": 0,
        "warning": 1,
        "opportunity": 0,
        "info": 0,
        "total": 1
      },
      "summary": "🟡 1 Warnung(en) erfordern Aufmerksamkeit heute.",
      "data_quality_score": 95
    }
    ```
    """
    try:
        logger.info(f"GET /alerts (severity={severity}, limit={limit})")
        
        # Get mock data (production: real analytics bundles)
        stats_bundle = _get_mock_stats_bundle()
        internal_data = _get_mock_internal_data()
        goals = _get_mock_goals()
        
        # Run detection
        report = detect_proactive_alerts(
            stats_bundle=stats_bundle,
            internal_data=internal_data,
            goals=goals,
        )
        
        # Filter by severity if requested
        if severity:
            report.alerts = [a for a in report.alerts if a.severity.value == severity]
        
        # Limit results
        report.alerts = report.alerts[:limit]
        
        return report.to_dict()
    
    except Exception as e:
        logger.error(f"Error in GET /alerts: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/briefing")
async def get_daily_briefing():
    """
    Get today's daily briefing (AI-formatted).
    
    Integrates all alert data into a concise morning briefing.
    
    Returns:
    - title: "Guten Morgen, [Name]"
    - today_forecast: Umsatz forecast for today
    - yesterday_summary: Performance summary
    - top_priority: One action for today
    - key_insight: Most important finding
    - alerts_count: How many alerts
    - context_blocks: Schicht 10 context for Claude
    
    Example Response:
    ```json
    {
      "title": "Guten Morgen, Alex",
      "date": "2026-03-24",
      "today_forecast": "€1,340 (±€180)",
      "yesterday": {
        "revenue": 1280,
        "status": "normal"
      },
      "top_priority": "Beschleunige auf €1,786/Tag um Ziel zu erreichen",
      "key_insight": "Ziel in Gefahr: 7 Tage verbleibend",
      "alerts": [
        {
          "severity": "warning",
          "title": "Ziel in Gefahr"
        }
      ],
      "three_things": [
        "Item 1",
        "Item 2",
        "Item 3"
      ]
    }
    ```
    """
    try:
        logger.info("GET /briefing")
        
        # Get alerts
        stats_bundle = _get_mock_stats_bundle()
        internal_data = _get_mock_internal_data()
        goals = _get_mock_goals()
        
        report = detect_proactive_alerts(
            stats_bundle=stats_bundle,
            internal_data=internal_data,
            goals=goals,
        )
        
        # Build AI context
        context = build_proactive_context(report)
        
        # Format briefing
        briefing = {
            "title": "Guten Morgen, Nutzer",
            "date": datetime.now().date().isoformat(),
            "today_forecast": f"€{stats_bundle.get('daily_revenue', 1000):.0f}",
            "yesterday": {
                "revenue": stats_bundle.get('daily_revenue', 1000),
                "status": "normal" if report.total_critical == 0 else "attention_needed",
            },
            "top_priority": report.alerts[0].recommended_action if report.alerts else "Alles läuft gut!",
            "key_insight": report.alerts[0].title if report.alerts else "Keine kritischen Erkenntnisse",
            "alerts": [
                {
                    "severity": a.severity.value,
                    "title": a.title,
                    "urgency": a.urgency.value,
                }
                for a in report.alerts[:3]
            ],
            "three_things": [
                "1. " + (report.alerts[0].title if len(report.alerts) > 0 else "Monitor metrics"),
                "2. " + (report.alerts[1].title if len(report.alerts) > 1 else "Keep pace"),
                "3. " + (report.alerts[2].title if len(report.alerts) > 2 else "Celebrate wins"),
            ],
            "ai_context": context,
            "generated_at": datetime.utcnow().isoformat(),
        }
        
        return briefing
    
    except Exception as e:
        logger.error(f"Error in GET /briefing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """
    Mark an alert as acknowledged/read.
    
    Path Parameters:
    - alert_id: Alert ID to acknowledge
    
    Returns:
    - status: "acknowledged"
    - alert_id: The alert ID
    - acknowledged_at: Timestamp
    """
    try:
        logger.info(f"POST /alerts/{alert_id}/acknowledge")
        
        # In production: save to database
        # For now: just return success
        
        return {
            "status": "acknowledged",
            "alert_id": alert_id,
            "acknowledged_at": datetime.utcnow().isoformat(),
        }
    
    except Exception as e:
        logger.error(f"Error in POST /acknowledge: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/{alert_id}/snooze")
async def snooze_alert(alert_id: str, minutes: int = Query(60)):
    """
    Snooze an alert for specified minutes.
    
    Path Parameters:
    - alert_id: Alert ID to snooze
    
    Query Parameters:
    - minutes: How long to snooze (default 60)
    
    Returns:
    - status: "snoozed"
    - alert_id: The alert ID
    - snooze_until: Timestamp when alert will resurface
    """
    try:
        logger.info(f"POST /alerts/{alert_id}/snooze (minutes={minutes})")
        
        snooze_until = datetime.utcnow() + timedelta(minutes=minutes)
        
        return {
            "status": "snoozed",
            "alert_id": alert_id,
            "snooze_until": snooze_until.isoformat(),
            "minutes": minutes,
        }
    
    except Exception as e:
        logger.error(f"Error in POST /snooze: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
