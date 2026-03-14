from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user
from ..game_mechanics import recalculate_user_stats
from typing import Optional
from pydantic import BaseModel

class UserStatsUpdate(BaseModel):
    hp: Optional[float] = None
    xp: Optional[float] = None
    mana: Optional[float] = None
    gold: Optional[float] = None
    level: Optional[int] = None
    strength: Optional[int] = None
    constitution: Optional[int] = None
    intelligence: Optional[int] = None
    perception: Optional[int] = None

class CronTimeUpdate(BaseModel):
    cron_time: int

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

@router.post("/register")
async def register_user():
    return {"message": "Register user"}

@router.post("/login")
async def login():
    return {"message": "Login user"}

@router.get("/me")
async def get_current_user():
    return {"message": "Get current user"}

@router.put("/me")
async def update_user():
    return {"message": "Update user"}

@router.get("/me/stats", response_model=schemas.User)
async def get_user_stats(
    current_user: models.User = Depends(get_current_active_user)
):
    return current_user

@router.put("/me/stats", response_model=schemas.User)
async def update_user_stats(
    stats: UserStatsUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    for field, value in stats.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(current_user, field, value)
    
    recalculate_user_stats(current_user)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/me/cron-time")
async def update_cron_time(
    cron_time: CronTimeUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not 0 <= cron_time.cron_time <= 12:
        raise HTTPException(status_code=400, detail="Cron time must be between 0 and 12 hours")
    
    current_user.cron_time = cron_time.cron_time
    db.commit()
    return {"message": "Cron time updated successfully"}

@router.get("/me/progress")
async def get_user_progress(
    current_user: models.User = Depends(get_current_active_user)
):
    return {
        "completed_todos": len([t for t in current_user.todos if t.completionDate is not None]),
        "active_habits": len(current_user.habits),
        "active_dailies": len(current_user.dailies)
    } 