from typing import Dict, Any


def generate_recommendations(kpis: Dict[str, Any]) -> Dict[str, Any]:
    revenue = float(kpis.get("revenue", 0.0) or 0.0)
    traffic = int(kpis.get("traffic", 0))

    if revenue < 1000:
        recommendation = {
            "title": "Increase Revenue",
            "action": "Run cross-sell promotions and improve pricing segments.",
            "impact": "high",
        }
    elif traffic < 10:
        recommendation = {
            "title": "Boost Traffic",
            "action": "Expand paid acquisition, SEO, and referral campaigns.",
            "impact": "medium",
        }
    else:
        recommendation = {
            "title": "Keep Strategy",
            "action": "Maintain performance and keep testing incremental improvements.",
            "impact": "low",
        }

    return {
        "summary": recommendation,
        "notes": (
            "Use this as a tactical recommendation; combine with insights to prioritize execution."
        ),
    }
