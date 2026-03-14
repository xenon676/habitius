from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from ..game_mechanics import recalculate_user_stats, reward, damage, calculate_crit_multiplier, roll_drop, calculate_task_value
from ..schemas import InventoryItemCreate, InventorySection, ItemType
from .inventory import add_item
import uuid
from datetime import datetime
import calendar

class HabitIncrementResponse(schemas.Habit):
    xp_gain: float | None = None
    gold_gain: float | None = None
    mana_gain: float | None = None
    hp_loss: float | None = None
    drop_id: str | None = None

router = APIRouter(
    prefix="/habits",
    tags=["habits"],
    dependencies=[Depends(auth.get_current_active_user)]  # Protect all routes
)

@router.get("/", response_model=List[schemas.Habit])
def read_habits(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    habits = db.query(models.Habit).filter(models.Habit.user_id == current_user.id).offset(skip).limit(limit).all()
    return habits

@router.post("/", response_model=schemas.Habit)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    habit_data = habit.model_dump()
    habit_data["id"] = str(uuid.uuid4())  # Generate a UUID for the new habit
    db_habit = models.Habit(**habit_data, user_id=current_user.id)
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.get("/{habit_id}", response_model=schemas.Habit)
def read_habit(habit_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id).first()
    if habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.put("/{habit_id}", response_model=schemas.Habit)
def update_habit(habit_id: str, habit: schemas.HabitUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id).first()
    if db_habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    for key, value in habit.model_dump(exclude_unset=True).items():
        setattr(db_habit, key, value)
    
    db.commit()
    db.refresh(db_habit)
    return db_habit

@router.delete("/{habit_id}")
def delete_habit(habit_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id).first()
    if db_habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    db.delete(db_habit)
    db.commit()
    return {"message": "Habit deleted successfully"}

@router.post("/{habit_id}/increment", response_model=HabitIncrementResponse)
async def increment_habit(habit_id: str, is_positive: bool, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_habit = db.query(models.Habit).filter(models.Habit.id == habit_id, models.Habit.user_id == current_user.id).first()
    if db_habit is None:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    task_value = calculate_task_value(db_habit.taskCounter)

    if is_positive:
        if not db_habit.acceptsPositive:
            raise HTTPException(status_code=400, detail="Habit does not accept positive actions")
        db_habit.positiveStreak += 1
        db_habit.taskCounter += 1

        crit_multiplier = calculate_crit_multiplier(current_user)

        xp_gain = 6 * reward(db_habit.rewardAmount) * task_value * (1 + current_user.intelligence/40) * crit_multiplier
        gold_gain = reward(db_habit.rewardAmount) * task_value * (1 + current_user.perception/50) * crit_multiplier
        mana_gain = max(0.25, current_user.max_mana/400) * crit_multiplier
        hp_loss = 0

        current_user.xp += xp_gain
        current_user.gold += gold_gain
        current_user.mana += mana_gain

        drop_id = roll_drop(current_user, db_habit)
        if drop_id:
            # Get item type to determine section
            item_def = db.query(models.ItemDefinition).filter(models.ItemDefinition.id == drop_id).first()
            if item_def:
                # Map ItemType to InventorySection
                section_map = {
                    ItemType.FOOD: InventorySection.PET_FOOD,
                    ItemType.CHEST: InventorySection.TREASURE_CHESTS,
                    ItemType.FRAGMENT: InventorySection.EQUIPMENT_FRAGMENTS,
                    ItemType.QUEST: InventorySection.QUESTS,
                    ItemType.SPECIAL: InventorySection.SPECIAL
                }
                section = section_map[ItemType(item_def.type)]
                new_item = InventoryItemCreate(item_id=drop_id, count=1, section=section)
                add_item(new_item, db, current_user)
    else:
        if not db_habit.acceptsNegative:
            raise HTTPException(status_code=400, detail="Habit does not accept negative actions")
        db_habit.negativeStreak += 1
        db_habit.taskCounter -= 1

        xp_gain = 0
        gold_gain = 0
        mana_gain = -max(0.25, current_user.mana/400)
        hp_loss = damage(db_habit.damageAmount) * task_value
        drop_id = None

        current_user.mana += mana_gain
        current_user.hp -= hp_loss
    
    recalculate_user_stats(current_user)
    db.commit()
    db.refresh(db_habit)
    
    response = HabitIncrementResponse.model_validate(db_habit)
    response.xp_gain = xp_gain
    response.gold_gain = gold_gain
    response.mana_gain = mana_gain
    response.hp_loss = hp_loss
    response.drop_id = drop_id
    return response 

def reset_habit_counter(habit: models.Habit, user: models.User) -> None:
    if habit.resetCounterInterval == "daily":
        habit.positiveStreak = 0
        habit.negativeStreak = 0
    elif habit.resetCounterInterval == "weekly":
        days_to_reset = (habit.createdAt.weekday() - user.last_login.weekday()) % 7
        days_elapsed = (datetime.now() - user.last_login).days
        if days_elapsed >= days_to_reset:
            habit.positiveStreak = 0
            habit.negativeStreak = 0
    elif habit.resetCounterInterval == "monthly":
        month_length = calendar.monthrange(user.last_login.year, user.last_login.month)[1]
        days_to_reset = (habit.createdAt.day - user.last_login.day) % month_length
        days_elapsed = (datetime.now() - user.last_login).days
        if days_elapsed >= days_to_reset:
            habit.positiveStreak = 0
            habit.negativeStreak = 0

@router.patch("/{habit_id}/position")
def update_habit_position(
    habit_id: str,
    position: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id,
        models.Habit.user_id == current_user.id
    ).first()
    
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    
    habit.position = position
    db.commit()
    return habit