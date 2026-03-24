from datetime import date, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from api.auth_routes import User, get_current_user
from models.daily_metrics import DailyMetrics
from models.goals import Goal

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    impact_pct: float
    priority: str
    category: str
    action_label: str


def get_recent_metrics(db: Session, days: int = 14):
    since = date.today() - timedelta(days=days)
    return (
        db.query(DailyMetrics)
        .filter(DailyMetrics.period == "daily", DailyMetrics.date >= since)
        .order_by(DailyMetrics.date)
        .all()
    )


def avg(values):
    return sum(values) / len(values) if values else 0.0


def to_float(value, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


@router.get("", response_model=list[Recommendation])
def get_recommendations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    rows = get_recent_metrics(db, days=14)
    goals = db.query(Goal).all()
    recommendations = []

    if not rows:
        return _default_recommendations()

    revenues = [to_float(getattr(r, "revenue", 0.0)) for r in rows]
    traffics = [to_float(getattr(r, "traffic", 0)) for r in rows]
    conv_rates = [to_float(getattr(r, "conversion_rate", 0.0)) for r in rows]
    new_customers = [to_float(getattr(r, "new_customers", 0)) for r in rows]

    avg_conv = avg(conv_rates)
    avg_new_cust = avg(new_customers)

    half = len(rows) // 2
    recent_rev = avg([to_float(getattr(r, "revenue", 0.0)) for r in rows[half:]])
    older_rev = avg([to_float(getattr(r, "revenue", 0.0)) for r in rows[:half]])
    rev_trend = ((recent_rev - older_rev) / older_rev * 100) if older_rev else 0

    recent_traffic = avg([to_float(getattr(r, "traffic", 0)) for r in rows[half:]])
    older_traffic = avg([to_float(getattr(r, "traffic", 0)) for r in rows[:half]])
    traffic_trend = ((recent_traffic - older_traffic) / older_traffic * 100) if older_traffic else 0

    if avg_conv < 0.5:
        recommendations.append(
            Recommendation(
                id="improve-conversion",
                title="Conversion Rate optimieren",
                description=(
                    f"Deine Conversion Rate liegt bei {avg_conv * 100:.1f}% - "
                    f"unter dem Zielwert von 50%. Optimiere Landing Pages, "
                    f"vereinfache den Checkout-Prozess und teste neue CTAs."
                ),
                impact_pct=18.0,
                priority="high",
                category="marketing",
                action_label="Conversion-Optimierung starten",
            )
        )

    if traffic_trend < 5:
        recommendations.append(
            Recommendation(
                id="boost-traffic",
                title="Traffic-Wachstum ankurbeln",
                description=(
                    f"Dein Traffic ist in den letzten 14 Tagen um {traffic_trend:.1f}% "
                    f"{'gestiegen' if traffic_trend >= 0 else 'gefallen'}. "
                    f"Starte SEO-Maßnahmen, bezahlte Kampagnen oder Content-Marketing."
                ),
                impact_pct=12.0,
                priority="high" if traffic_trend < 0 else "medium",
                category="marketing",
                action_label="Traffic-Kampagne planen",
            )
        )

    if rev_trend < 0:
        recommendations.append(
            Recommendation(
                id="revenue-recovery",
                title="Umsatzrückgang stoppen",
                description=(
                    f"Dein Umsatz ist in den letzten 7 Tagen um {abs(rev_trend):.1f}% "
                    f"gefallen. Analysiere abgebrochene Käufe und starte eine "
                    f"Reaktivierungskampagne für bestehende Kunden."
                ),
                impact_pct=22.0,
                priority="high",
                category="sales",
                action_label="Reaktivierungskampagne starten",
            )
        )

    if avg_new_cust < 1.5:
        recommendations.append(
            Recommendation(
                id="customer-acquisition",
                title="Neukundengewinnung stärken",
                description=(
                    f"Im Schnitt gewinnst du nur {avg_new_cust:.1f} neue Kunden pro Tag. "
                    f"Teste Referral-Programme, Rabattaktionen für Erstbestellungen "
                    f"oder stärke deine Social-Media-Präsenz."
                ),
                impact_pct=15.0,
                priority="medium",
                category="marketing",
                action_label="Akquisitions-Strategie entwickeln",
            )
        )

    for goal in goals:
        target_value = to_float(getattr(goal, "target_value", 0.0))
        metric = str(getattr(goal, "metric", ""))
        if target_value > 0:
            recent_vals = [to_float(getattr(r, "revenue", 0.0)) for r in rows] if metric == "revenue" else []
            if recent_vals:
                current = sum(recent_vals)
                progress = current / target_value * 100
                if progress < 50:
                    recommendations.append(
                        Recommendation(
                            id=f"goal-gap-{metric}",
                            title=f"Ziel-Lücke schliessen: {metric.replace('_', ' ').title()}",
                            description=(
                                f"Du bist erst bei {progress:.0f}% deines {metric}-Ziels. "
                                f"Priorisiere Maßnahmen die direkt auf diesen KPI einzahlen."
                            ),
                            impact_pct=10.0,
                            priority="high",
                            category="operations",
                            action_label="Maßnahme für Ziel erstellen",
                        )
                    )

    if not recommendations:
        recommendations = _default_recommendations()

    order = {"high": 0, "medium": 1, "low": 2}
    recommendations.sort(key=lambda r: order[r.priority])

    return recommendations[:6]


def _default_recommendations() -> list[Recommendation]:
    return [
        Recommendation(
            id="general-retention",
            title="Kundenbindung stärken",
            description=(
                "Implementiere ein einfaches Loyalty-Programm oder Follow-up E-Mails "
                "nach dem Kauf. Bestehende Kunden zu halten kostet 5x weniger als neue zu gewinnen."
            ),
            impact_pct=10.0,
            priority="medium",
            category="marketing",
            action_label="Retention-Kampagne planen",
        ),
        Recommendation(
            id="general-analytics",
            title="Datenqualität verbessern",
            description=(
                "Verbinde weitere Datenquellen (Stripe, Google Analytics) für präzisere "
                "Analysen. Je mehr Daten, desto besser die KI-Empfehlungen ab Tag 13."
            ),
            impact_pct=8.0,
            priority="low",
            category="operations",
            action_label="Integration einrichten",
        ),
    ]
