from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from . import models
from .database import get_db
from .routers.habits import reset_habit_counter
from .routers.dailies import reset_daily

router = APIRouter()

def reset_habit_counters(db: Session):
    habits = db.query(models.Habit).all()
    for habit in habits:
        reset_habit_counter(habit, habit.user)
    db.commit()

def reset_dailies(db: Session):
    dailies = db.query(models.Daily).all()
    for daily in dailies:
        reset_daily(daily)
    db.commit()

def decrement_todos(db: Session):
    todos = db.query(models.Todo).all()
    for todo in todos:
        todo.taskCounter -= 1
    db.commit()

@router.post("/trigger")
async def trigger_cron(
    db: Session = Depends(get_db)
):
    reset_dailies(db)
    reset_habit_counters(db)
    decrement_todos(db)
    return {"status": "success", "message": "Cron jobs completed successfully"} 