from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional, cast
from .. import models, schemas, auth
from ..database import get_db
import uuid
from datetime import datetime, timezone

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"],
    dependencies=[Depends(auth.get_current_active_user)]
)

# Item Definition endpoints
@router.get("/definitions", response_model=List[schemas.ItemDefinition])
def get_item_definitions(
    type: Optional[schemas.ItemType] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.ItemDefinition)
    if type:
        query = query.filter(models.ItemDefinition.type == type)
    return query.all()

@router.post("/definitions", response_model=schemas.ItemDefinition)
def create_item_definition(
    item: schemas.ItemDefinitionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_item = models.ItemDefinition(**item.model_dump(), id=str(uuid.uuid4()))
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# Inventory endpoints
@router.get("/items", response_model=List[schemas.InventorySectionResponse])
def get_inventory(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Get all items for the user
    items = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id
    ).all()
    
    # Initialize all sections with 0 counts
    sections = {
        section: {
            "name": section.value,
            "totalCount": 0,
            "items": []
        } for section in schemas.InventorySection
    }
    
    # Group items by section
    for item in items:
        section = schemas.InventorySection(item.section)  # Convert string to enum
        sections[section]["items"].append(item)
        sections[section]["totalCount"] += int(cast(Any, item.count))

    # Convert to list maintaining the enum order
    out = []
    for section in schemas.InventorySection:
        data = sections[section]
        out.append(schemas.InventorySectionResponse(
            name=data["name"],
            totalCount=int(data["totalCount"]),
            items=cast(List[schemas.InventoryItem], data["items"]),
        ))
    return out

@router.get("/items/{section}", response_model=schemas.InventorySectionResponse)
def get_section_items(
    section: schemas.InventorySection,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    items = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id,
        models.InventoryItem.section == section
    ).all()
    
    total_count = sum(int(cast(Any, item.count)) for item in items)
    return schemas.InventorySectionResponse(
        name=section.value,
        totalCount=total_count,
        items=cast(List[schemas.InventoryItem], items)
    )

@router.post("/items", response_model=schemas.InventoryItem)
def add_item(
    item: schemas.InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Validate item exists
    item_def = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == item.item_id
    ).first()
    if not item_def:
        raise HTTPException(status_code=404, detail="Item definition not found")
    
    # Check if item already exists in inventory
    db_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id,
        models.InventoryItem.item_id == item.item_id,
        models.InventoryItem.section == item.section
    ).first()
    
    if db_item:
        setattr(db_item, "count", int(cast(Any, db_item.count)) + item.count)
    else:
        db_item = models.InventoryItem(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            **item.model_dump()
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(db_item)
    return db_item

@router.post("/items/use/{item_id}", response_model=schemas.InventoryItem)
def use_item(
    item_id: str,
    target_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    inventory_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id,
        models.InventoryItem.user_id == current_user.id
    ).first()
    if not inventory_item or int(cast(Any, inventory_item.count)) < 1:
        raise HTTPException(status_code=404, detail="Item not found or insufficient quantity")

    item_def = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == inventory_item.item_id
    ).first()
    if not item_def:
        raise HTTPException(status_code=404, detail="Item definition not found")

    item_type = cast(Any, item_def.type)
    if item_type == schemas.ItemType.CHEST:
        # TODO: Generate rewards
        pass
    elif item_type == schemas.ItemType.FRAGMENT:
        # TODO: Handle equipment crafting
        pass

    # Consume item
    new_count = int(cast(Any, inventory_item.count)) - 1
    setattr(inventory_item, "count", new_count)
    if new_count <= 0:
        db.delete(inventory_item)
    
    db.commit()
    return inventory_item

# Pet endpoints
@router.get("/pets", response_model=List[schemas.Pet])
def get_pets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return db.query(models.Pet).filter(models.Pet.user_id == current_user.id).all()

@router.post("/pets/{pet_id}/feed", response_model=schemas.Pet)
def feed_pet(
    pet_id: str,
    item_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Get pet and food item
    pet = db.query(models.Pet).filter(
        models.Pet.id == pet_id,
        models.Pet.user_id == current_user.id
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    inventory_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.user_id == current_user.id,
        models.InventoryItem.item_id == item_id
    ).first()
    if not inventory_item or int(cast(Any, inventory_item.count)) < 1:
        raise HTTPException(status_code=400, detail="Food item not available")
    
    food_def = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == item_id,
        models.ItemDefinition.type == schemas.ItemType.FOOD
    ).first()
    if not food_def:
        raise HTTPException(status_code=400, detail="Invalid food item")

    details_raw = cast(Any, food_def.details)
    details = details_raw if isinstance(details_raw, dict) else {}
    xp_gain = details.get("xp", 0)

    current_xp = int(cast(Any, pet.current_xp)) + xp_gain
    setattr(pet, "current_xp", current_xp)
    xp_to_next = int(cast(Any, pet.xp_to_next_level))

    while current_xp >= xp_to_next:
        level = int(cast(Any, pet.level)) + 1
        setattr(pet, "level", level)
        current_xp -= xp_to_next
        setattr(pet, "current_xp", current_xp)
        xp_to_next = calculate_next_level_xp(level)
        setattr(pet, "xp_to_next_level", xp_to_next)

        rarity_val = str(cast(Any, pet.rarity)) if hasattr(pet.rarity, "value") else str(cast(Any, pet.rarity))
        inc = calculate_stat_increase(rarity_val)
        stats = dict(cast(Any, pet.stats) or {})
        for stat in ["health", "attack", "defense", "special"]:
            stats[stat] = stats.get(stat, 0) + inc
        setattr(pet, "stats", stats)

    inv_count = int(cast(Any, inventory_item.count)) - 1
    setattr(inventory_item, "count", inv_count)
    if inv_count <= 0:
        db.delete(inventory_item)
    
    db.commit()
    db.refresh(pet)
    return pet

@router.post("/pets/{pet_id}/equip", response_model=schemas.Pet)
def toggle_equip_pet(
    pet_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    pet = db.query(models.Pet).filter(
        models.Pet.id == pet_id,
        models.Pet.user_id == current_user.id
    ).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")

    is_equipped = bool(cast(Any, pet.is_equipped))
    if not is_equipped:
        currently_equipped = db.query(models.Pet).filter(
            models.Pet.user_id == current_user.id,
            models.Pet.is_equipped == True
        ).first()
        if currently_equipped:
            setattr(currently_equipped, "is_equipped", False)

    setattr(pet, "is_equipped", not is_equipped)
    db.commit()
    db.refresh(pet)
    return pet

# Quest endpoints
@router.get("/quests/active", response_model=List[schemas.QuestProgress])
def get_active_quests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    return db.query(models.QuestProgress).filter(
        models.QuestProgress.user_id == current_user.id,
        models.QuestProgress.completed == False
    ).all()

@router.post("/quests/{quest_id}/start", response_model=schemas.QuestProgress)
def start_quest(
    quest_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    # Check if quest exists
    quest = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == quest_id,
        models.ItemDefinition.type == schemas.ItemType.QUEST
    ).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    # Check if already in progress
    existing = db.query(models.QuestProgress).filter(
        models.QuestProgress.user_id == current_user.id,
        models.QuestProgress.quest_id == quest_id,
        models.QuestProgress.completed == False
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Quest already in progress")
    
    progress = models.QuestProgress(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        quest_id=quest_id
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)
    return progress

@router.post("/quests/{quest_id}/progress", response_model=schemas.QuestProgress)
def update_quest_progress(
    quest_id: str,
    progress: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    quest_progress = db.query(models.QuestProgress).filter(
        models.QuestProgress.quest_id == quest_id,
        models.QuestProgress.user_id == current_user.id,
        models.QuestProgress.completed == False
    ).first()
    if not quest_progress:
        raise HTTPException(status_code=404, detail="Active quest not found")

    quest = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == quest_id
    ).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    setattr(quest_progress, "current_progress", progress)

    details = cast(Any, quest.details) or {}
    target = details.get("target", 0) if isinstance(details, dict) else 0
    if progress >= target:
        setattr(quest_progress, "completed", True)
        setattr(quest_progress, "completed_at", datetime.now(timezone.utc))
        # TODO: Quest rewards

    db.commit()
    db.refresh(quest_progress)
    return quest_progress

def calculate_next_level_xp(current_level: int) -> int:
    return int(100 * (current_level ** 1.5))

def calculate_stat_increase(rarity: str) -> int:
    rarity_multipliers = {
        "common": 1,
        "uncommon": 1.2,
        "rare": 1.5,
        "epic": 2,
        "legendary": 3
    }
    base_increase = 5
    multiplier = rarity_multipliers.get(rarity.lower(), 1)
    return int(base_increase * multiplier) 