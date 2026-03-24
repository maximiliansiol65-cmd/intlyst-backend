"""
Task-System — offen / in Arbeit / erledigt + Verlauf + Zuweisung
"""
from datetime import date, datetime
from typing import Any, Optional, cast

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import desc
from sqlalchemy.orm import Session

from database import get_db, engine
from models.task import Task, TaskHistory
from models.base import Base
from api.auth_routes import User, get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

Base.metadata.create_all(bind=engine)

VALID_STATUSES   = {"open", "in_progress", "done"}
VALID_PRIORITIES = {"high", "medium", "low"}

STATUS_LABELS = {
    "open":        "Offen",
    "in_progress": "In Arbeit",
    "done":        "Erledigt",
}

STATUS_NEXT = {
    "open":        "in_progress",
    "in_progress": "done",
    "done":        "open",
}


# ── Schemas ──────────────────────────────────────────────

class TaskCreate(BaseModel):
    title:             str
    description:       Optional[str]  = None
    priority:          str            = "medium"
    assigned_to:       Optional[str]  = None
    assigned_to_id:    Optional[int]  = None
    due_date:          Optional[date] = None
    recommendation_id: Optional[int]  = None
    created_by:        Optional[str]  = None


class TaskUpdate(BaseModel):
    title:          Optional[str]  = None
    description:    Optional[str]  = None
    status:         Optional[str]  = None
    priority:       Optional[str]  = None
    assigned_to:    Optional[str]  = None
    assigned_to_id: Optional[int]  = None
    due_date:       Optional[date] = None


class TaskResponse(BaseModel):
    id:                int
    title:             str
    description:       Optional[str]
    status:            str
    status_label:      str
    priority:          str
    assigned_to:       Optional[str]
    assigned_to_id:    Optional[int]
    due_date:          Optional[date]
    recommendation_id: Optional[int]
    created_by:        Optional[str]
    completed_at:      Optional[datetime]
    created_at:        datetime
    updated_at:        Optional[datetime]

    class Config:
        from_attributes = True


class HistoryEntry(BaseModel):
    id:         int
    changed_by: Optional[str]
    field:      str
    old_value:  Optional[str]
    new_value:  Optional[str]
    changed_at: datetime

    class Config:
        from_attributes = True


# ── Hilfsfunktionen ───────────────────────────────────────

def _s(v: object) -> Optional[str]:
    coerced = cast(Any, v)
    return str(coerced) if coerced is not None else None

def _i(v: object) -> Optional[int]:
    coerced = cast(Any, v)
    return int(coerced) if coerced is not None else None

def _dt(v: object) -> Optional[datetime]:
    coerced = cast(Any, v)
    return coerced if isinstance(coerced, datetime) else None

def _set(obj: Any, attr: str, value: object) -> None:
    setattr(obj, attr, value)


def task_to_response(task: Task) -> TaskResponse:
    return TaskResponse(
        id=cast(Any, task.id),
        title=cast(Any, task.title),
        description=_s(task.description),
        status=cast(Any, task.status),
        status_label=STATUS_LABELS.get(cast(Any, task.status)) or cast(Any, task.status) or "",
        priority=cast(Any, task.priority),
        assigned_to=_s(task.assigned_to),
        assigned_to_id=_i(task.assigned_to_id),
        due_date=cast(Any, task.due_date),
        recommendation_id=_i(task.recommendation_id),
        created_by=_s(task.created_by),
        completed_at=_dt(task.completed_at),
        created_at=cast(Any, task.created_at),
        updated_at=_dt(task.updated_at),
    )


def log_change(
    task_id: int,
    field: str,
    old_value: str,
    new_value: str,
    changed_by: str,
    db: Session,
):
    if old_value != new_value:
        db.add(TaskHistory(
            task_id=task_id,
            changed_by=changed_by,
            field=field,
            old_value=str(old_value) if old_value else None,
            new_value=str(new_value) if new_value else None,
        ))


# ── Endpunkte ────────────────────────────────────────────

@router.post("", response_model=TaskResponse)
def create_task(body: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"Priority muss eine von {VALID_PRIORITIES} sein.")

    task = Task(
        title=body.title,
        description=body.description,
        priority=body.priority,
        assigned_to=body.assigned_to,
        assigned_to_id=body.assigned_to_id,
        due_date=body.due_date,
        recommendation_id=body.recommendation_id,
        created_by=body.created_by,
        status="open",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    log_change(cast(Any, task.id), "status", "", "open", body.created_by or "system", db)
    db.commit()

    return task_to_response(task)


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    status:      Optional[str] = Query(None, enum=["open", "in_progress", "done"]),
    priority:    Optional[str] = Query(None, enum=["high", "medium", "low"]),
    assigned_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)
    if status:      query = query.filter(Task.status == status)
    if priority:    query = query.filter(Task.priority == priority)
    if assigned_to: query = query.filter(Task.assigned_to == assigned_to)
    tasks = query.order_by(desc(Task.created_at)).all()
    return [task_to_response(t) for t in tasks]


@router.get("/stats")
def get_task_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total       = db.query(Task).count()
    open_count  = db.query(Task).filter(Task.status == "open").count()
    in_progress = db.query(Task).filter(Task.status == "in_progress").count()
    done        = db.query(Task).filter(Task.status == "done").count()
    high_prio   = db.query(Task).filter(Task.priority == "high", Task.status != "done").count()

    return {
        "total":       total,
        "open":        open_count,
        "in_progress": in_progress,
        "done":        done,
        "high_priority_open": high_prio,
        "completion_rate": round(done / total * 100, 1) if total else 0,
    }


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task nicht gefunden.")
    return task_to_response(task)


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    body: TaskUpdate,
    changed_by: str = Query("user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task nicht gefunden.")

    if body.status and body.status not in VALID_STATUSES:
        raise HTTPException(status_code=400, detail=f"Status muss eine von {VALID_STATUSES} sein.")
    if body.priority and body.priority not in VALID_PRIORITIES:
        raise HTTPException(status_code=400, detail=f"Priority muss eine von {VALID_PRIORITIES} sein.")

    changes = body.model_dump(exclude_unset=True)
    for field, new_value in changes.items():
        old_value = getattr(task, field, None)
        log_change(task_id, field, str(old_value), str(new_value), changed_by, db)
        setattr(task, field, new_value)

    if body.status == "done" and not cast(Any, task.completed_at):
        _set(task, "completed_at", datetime.utcnow())
    elif body.status and body.status != "done":
        _set(task, "completed_at", None)

    _set(task, "updated_at", datetime.utcnow())
    db.commit()
    db.refresh(task)
    return task_to_response(task)


@router.patch("/{task_id}/next-status", response_model=TaskResponse)
def advance_status(
    task_id: int,
    changed_by: str = Query("user"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task nicht gefunden.")

    old_status = cast(Any, task.status)
    new_status = STATUS_NEXT.get(old_status, "open")

    log_change(task_id, "status", old_status, new_status, changed_by, db)
    _set(task, "status", new_status)

    if new_status == "done":
        _set(task, "completed_at", datetime.utcnow())
    else:
        _set(task, "completed_at", None)

    _set(task, "updated_at", datetime.utcnow())
    db.commit()
    db.refresh(task)
    return task_to_response(task)


@router.get("/{task_id}/history", response_model=list[HistoryEntry])
def get_task_history(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task nicht gefunden.")

    history = (
        db.query(TaskHistory)
        .filter(TaskHistory.task_id == task_id)
        .order_by(desc(TaskHistory.changed_at))
        .all()
    )
    return history


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task nicht gefunden.")
    db.delete(task)
    db.commit()
    return {"message": "Task gelöscht."}

    return {"message": "Task gelöscht."}
