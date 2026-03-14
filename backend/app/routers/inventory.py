from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
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
    type: schemas.ItemType = None,
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
        sections[section]["totalCount"] += item.count
    
    # Convert to list maintaining the enum order
    return [schemas.InventorySectionResponse(**sections[section]) for section in schemas.InventorySection]

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
    
    total_count = sum(item.count for item in items)
    return schemas.InventorySectionResponse(
        name=section.value,
        totalCount=total_count,
        items=items
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
        db_item.count += item.count
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
    target_id: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_active_user)
):
    inventory_item = db.query(models.InventoryItem).filter(
        models.InventoryItem.id == item_id,
        models.InventoryItem.user_id == current_user.id
    ).first()
    if not inventory_item or inventory_item.count < 1:
        raise HTTPException(status_code=404, detail="Item not found or insufficient quantity")
    
    item_def = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == inventory_item.item_id
    ).first()
    
    # Handle different item types
    if item_def.type == schemas.ItemType.CHEST:
        # TODO: Generate rewards
        pass
    elif item_def.type == schemas.ItemType.FRAGMENT:
        # TODO: Handle equipment crafting
        pass
    
    # Consume item
    inventory_item.count -= 1
    if inventory_item.count <= 0:
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
    if not inventory_item or inventory_item.count < 1:
        raise HTTPException(status_code=400, detail="Food item not available")
    
    food_def = db.query(models.ItemDefinition).filter(
        models.ItemDefinition.id == item_id,
        models.ItemDefinition.type == schemas.ItemType.FOOD
    ).first()
    if not food_def:
        raise HTTPException(status_code=400, detail="Invalid food item")
    
    # Apply food details
    details = food_def.details or {}
    pet.currentXp += details.get("xp", 0)
    
    # Level up if needed
    while pet.currentXp >= pet.xpToNextLevel:
        pet.level += 1
        pet.currentXp -= pet.xpToNextLevel
        pet.xpToNextLevel = calculate_next_level_xp(pet.level)
        
        # Increase stats
        for stat in ["health", "attack", "defense", "special"]:
            current = pet.stats.get(stat, 0)
            pet.stats[stat] = current + calculate_stat_increase(pet.rarity)
    
    # Consume item
    inventory_item.count -= 1
    if inventory_item.count <= 0:
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
    
    # Unequip currently equipped pet if any
    if not pet.isEquipped:
        currently_equipped = db.query(models.Pet).filter(
            models.Pet.user_id == current_user.id,
            models.Pet.isEquipped == True
        ).first()
        if currently_equipped:
            currently_equipped.isEquipped = False
    
    pet.isEquipped = not pet.isEquipped
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
    
    quest_progress.current_progress = progress
    
    # Check if quest is completed
    target = quest.details.get("target", 0)
    if progress >= target:
        quest_progress.completed = True
        quest_progress.completed_at = datetime.now(timezone.utc)
        
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