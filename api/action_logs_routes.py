from datetime import date as dt_date
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import desc
from sqlalchemy.orm import Session

from database import get_db
from models.action_logs import ActionLog
from api.auth_routes import User, get_current_user

router = APIRouter(prefix="/api/actions", tags=["actions"])


def _created_at_iso(value) -> Optional[str]:
    return value.isoformat() if getattr(value, "isoformat", None) else None


class ActionLogCreate(BaseModel):
    date: dt_date = Field(default_factory=dt_date.today)
    title: str
    description: Optional[str] = None
    category: Literal["marketing", "product", "sales", "operations"]
    impact_pct: Optional[float] = None
    status: Literal["done", "pending"] = "done"


class ActionLogUpdate(BaseModel):
    date: Optional[dt_date] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[Literal["marketing", "product", "sales", "operations"]] = None
    impact_pct: Optional[float] = None
    status: Optional[Literal["done", "pending"]] = None


@router.get("")
def list_action_logs(
    category: Optional[Literal["marketing", "product", "sales", "operations"]] = Query(default=None),
    status: Optional[Literal["done", "pending"]] = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(ActionLog)
    if category:
        query = query.filter(ActionLog.category == category)
    if status:
        query = query.filter(ActionLog.status == status)

    rows = query.order_by(desc(ActionLog.date), desc(ActionLog.id)).limit(limit).all()

    return {
        "count": len(rows),
        "items": [
            {
                "id": row.id,
                "date": str(row.date),
                "title": row.title,
                "description": row.description,
                "category": row.category,
                "impact_pct": row.impact_pct,
                "status": row.status,
                "created_at": _created_at_iso(getattr(row, "created_at", None)),
            }
            for row in rows
        ],
    }


@router.post("")
def create_action_log(payload: ActionLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = ActionLog(
        date=payload.date,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        impact_pct=payload.impact_pct,
        status=payload.status,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "id": row.id,
        "date": str(row.date),
        "title": row.title,
        "description": row.description,
        "category": row.category,
        "impact_pct": row.impact_pct,
        "status": row.status,
        "created_at": _created_at_iso(getattr(row, "created_at", None)),
    }


@router.put("/{log_id}")
def update_action_log(log_id: int, payload: ActionLogUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.query(ActionLog).filter(ActionLog.id == log_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Action log not found.")

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(row, field_name, value)

    db.commit()
    db.refresh(row)

    return {
        "id": row.id,
        "date": str(row.date),
        "title": row.title,
        "description": row.description,
        "category": row.category,
        "impact_pct": row.impact_pct,
        "status": row.status,
        "created_at": _created_at_iso(getattr(row, "created_at", None)),
    }


@router.delete("/{log_id}")
def delete_action_log(log_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    row = db.query(ActionLog).filter(ActionLog.id == log_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Action log not found.")

    db.delete(row)
    db.commit()
    return {"message": "Action log deleted successfully.", "id": log_id}
