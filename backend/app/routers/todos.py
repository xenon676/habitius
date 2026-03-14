from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from ..game_mechanics import recalculate_user_stats, reward, calculate_crit_multiplier, roll_drop, calculate_todo_value
from ..schemas import InventoryItemCreate, InventorySection, ItemType
from .inventory import add_item
import uuid
from datetime import datetime

class TodoCompleteResponse(schemas.Todo):
    xp_gain: float | None = None
    gold_gain: float | None = None
    mana_gain: float | None = None
    hp_loss: float | None = None
    drop_id: str | None = None

router = APIRouter(
    prefix="/todos",
    tags=["todos"],
    dependencies=[Depends(auth.get_current_active_user)]  # Protect all routes
)

@router.get("/", response_model=List[schemas.Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    todos = db.query(models.Todo).filter(models.Todo.user_id == current_user.id).offset(skip).limit(limit).all()
    return todos

@router.post("/", response_model=schemas.Todo)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    todo_data = todo.model_dump()
    todo_data["id"] = str(uuid.uuid4())  # Generate a UUID for the new todo
    db_todo = models.Todo(**todo_data, user_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.get("/{todo_id}", response_model=schemas.Todo)
def read_todo(todo_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.user_id == current_user.id).first()
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

@router.put("/{todo_id}", response_model=schemas.Todo)
def update_todo(todo_id: str, todo: schemas.TodoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.user_id == current_user.id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    for key, value in todo.model_dump(exclude_unset=True).items():
        setattr(db_todo, key, value)
    
    db.commit()
    db.refresh(db_todo)
    return db_todo

@router.delete("/{todo_id}")
def delete_todo(todo_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.user_id == current_user.id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    db.delete(db_todo)
    db.commit()
    return {"message": "Todo deleted successfully"} 

@router.post("/{todo_id}/complete", response_model=TodoCompleteResponse)
async def toggle_todo(todo_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    db_todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.user_id == current_user.id).first()
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    if db_todo.completionDate is None:
        db_todo.completionDate = datetime.now()

        crit_multiplier = calculate_crit_multiplier(current_user)
        task_value = calculate_todo_value(db_todo.taskCounter)

        xp_gain = 6 * reward(db_todo.rewardAmount) * task_value * (1 + current_user.intelligence/40) * (1 + (len(db_todo.checklistItems or []) / 2)) * crit_multiplier
        gold_gain = reward(db_todo.rewardAmount) * task_value * (1 + current_user.perception/50) * (1 + (len(db_todo.checklistItems or []) / 2)) * crit_multiplier
        mana_gain = max(1, current_user.max_mana/100) * (1 + (len(db_todo.checklistItems or []) / 2)) * crit_multiplier
        hp_loss = 0

        current_user.xp += xp_gain
        current_user.gold += gold_gain
        current_user.mana += mana_gain
        
        drop_id = roll_drop(current_user, db_todo)
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
        db_todo.completionDate = None
        # stat decreases calculated from history
        xp_gain = 0
        gold_gain = 0
        mana_gain = 0
        hp_loss = 0
        drop_id = None
    
    recalculate_user_stats(current_user)
    db.commit()
    db.refresh(db_todo)
    
    response = TodoCompleteResponse.model_validate(db_todo)
    response.xp_gain = xp_gain
    response.gold_gain = gold_gain
    response.mana_gain = mana_gain
    response.hp_loss = hp_loss
    response.drop_id = drop_id
    return response

@router.patch("/{todo_id}/position")
def update_todo_position(
    todo_id: str,
    position: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    todo = db.query(models.Todo).filter(
        models.Todo.id == todo_id,
        models.Todo.user_id == current_user.id
    ).first()
    
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    
    todo.position = position
    db.commit()
    return todo