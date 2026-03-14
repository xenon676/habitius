from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List, Dict
from .. import models, schemas, auth
from ..database import get_db
from ..game_mechanics import recalculate_user_stats, reward, damage, calculate_crit_multiplier, roll_drop, calculate_task_value
from ..schemas import InventoryItemCreate, InventorySection, ItemType
from .inventory import add_item
import uuid

class DailyCompleteResponse(schemas.Daily):
    xp_gain: float | None = None
    gold_gain: float | None = None
    mana_gain: float | None = None
    hp_loss: float | None = None
    drop_id: str | None = None

router = APIRouter(
    prefix="/dailies",
    tags=["dailies"],
    dependencies=[Depends(auth.get_current_active_user)]  # Protect all routes
)

@router.get("/", response_model=List[schemas.Daily])
def read_dailies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    dailies = db.query(models.Daily).filter(models.Daily.user_id == current_user.id).offset(skip).limit(limit).all()
    return dailies

@router.post("/", response_model=schemas.Daily)
def create_daily(daily: schemas.DailyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    daily_data = daily.model_dump()
    daily_data["id"] = str(uuid.uuid4())  # Generate a UUID for the new daily
    db_daily = models.Daily(**daily_data, user_id=current_user.id)
    db.add(db_daily)
    db.commit()
    db.refresh(db_daily)
    return db_daily

@router.get("/{daily_id}", response_model=schemas.Daily)
def read_daily(daily_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    daily = db.query(models.Daily).filter(models.Daily.id == daily_id, models.Daily.user_id == current_user.id).first()
    if daily is None:
        raise HTTPException(status_code=404, detail="Daily not found")
    return daily

@router.put("/{daily_id}", response_model=schemas.Daily)
def update_daily(daily_id: str, daily: schemas.DailyUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_daily = db.query(models.Daily).filter(models.Daily.id == daily_id, models.Daily.user_id == current_user.id).first()
    if db_daily is None:
        raise HTTPException(status_code=404, detail="Daily not found")
    
    for key, value in daily.model_dump(exclude_unset=True).items():
        setattr(db_daily, key, value)
    
    db.commit()
    db.refresh(db_daily)
    return db_daily

@router.delete("/{daily_id}")
def delete_daily(daily_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_daily = db.query(models.Daily).filter(models.Daily.id == daily_id, models.Daily.user_id == current_user.id).first()
    if db_daily is None:
        raise HTTPException(status_code=404, detail="Daily not found")
    
    db.delete(db_daily)
    db.commit()
    return {"message": "Daily deleted successfully"}

@router.post("/{daily_id}/complete", response_model=DailyCompleteResponse)
async def toggle_daily(daily_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_daily = db.query(models.Daily).filter(models.Daily.id == daily_id, models.Daily.user_id == current_user.id).first()
    if db_daily is None:
        raise HTTPException(status_code=404, detail="Daily not found")
    
    task_value = calculate_task_value(db_daily.taskCounter)
    
    if db_daily.isCompleted:
        db_daily.isCompleted = False
        db_daily.streak -= 1
        db_daily.taskCounter -= 1

        xp_gain = 0
        gold_gain = 0
        mana_gain = 0
        hp_loss = 0
        drop_id = None
    else:
        db_daily.isCompleted = True
        db_daily.streak += 1
        db_daily.taskCounter += 1

        if db_daily.streak % 21 == 0:
            current_user.streaks += 1

        crit_multiplier = calculate_crit_multiplier(current_user)

        xp_gain = 6 * reward(db_daily.rewardAmount) * task_value * (1 + current_user.intelligence/40) * crit_multiplier
        gold_gain = reward(db_daily.rewardAmount) * task_value * (1 + current_user.perception/50) * (1 + db_daily.streak/100) * crit_multiplier
        mana_gain = max(1, current_user.max_mana/100) * crit_multiplier
        hp_loss = damage(db_daily.damageAmount) * task_value
        
        current_user.xp += xp_gain
        current_user.gold += gold_gain
        current_user.mana += mana_gain

        drop_id = roll_drop(current_user, db_daily)
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

    recalculate_user_stats(current_user)    
    db.commit()
    db.refresh(db_daily)
    
    response = DailyCompleteResponse.model_validate(db_daily)
    response.xp_gain = xp_gain
    response.gold_gain = gold_gain
    response.mana_gain = mana_gain
    response.hp_loss = hp_loss
    response.drop_id = drop_id
    return response

@router.patch("/{daily_id}/position")
def update_daily_position(
    daily_id: str,
    position: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    daily = db.query(models.Daily).filter(
        models.Daily.id == daily_id,
        models.Daily.user_id == current_user.id
    ).first()
    
    if not daily:
        raise HTTPException(status_code=404, detail="Daily not found")
    
    daily.position = position
    db.commit()
    return daily

def reset_daily(daily: models.Daily) -> None:
    if daily.isCompleted:
        daily.isCompleted = False
        if daily.checklistItems:
            for item in daily.checklistItems:
                item["completed"] = False
    
    elif daily.isDue:
        daily.streak = 0
        daily.user.hp -= damage(daily.damageAmount) * calculate_task_value(daily.taskCounter)
        daily.user.mana -= max(1, daily.user.max_mana/200)
        daily.taskCounter -= 1
        recalculate_user_stats(daily.user) 