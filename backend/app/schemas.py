from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ChecklistItem(BaseModel):
    text: str
    completed: bool

class TodoBase(BaseModel):
    title: str
    notes: Optional[str] = None
    checklistItems: Optional[List[ChecklistItem]] = None
    rewardAmount: int = 3
    damageAmount: int = 3
    taskCounter: int = 0
    dueDate: Optional[datetime] = None

class TodoCreate(TodoBase):
    pass

class TodoUpdate(TodoBase):
    title: Optional[str] = None
    completionDate: Optional[datetime] = None

class Todo(TodoBase):
    id: str
    completionDate: Optional[datetime] = None
    createdAt: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class HabitBase(BaseModel):
    title: str
    notes: Optional[str] = None
    acceptsPositive: bool = True
    acceptsNegative: bool = True
    positiveStreak: int = 0
    negativeStreak: int = 0
    rewardAmount: int = 3
    damageAmount: int = 3
    taskCounter: int = 0
    resetCounterInterval: str = "daily"

class HabitCreate(HabitBase):
    pass

class HabitUpdate(HabitBase):
    title: Optional[str] = None

class Habit(HabitBase):
    id: str
    createdAt: datetime
    user_id: int
    xp_gain: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class DailyBase(BaseModel):
    title: str
    notes: Optional[str] = None
    streak: int = 0
    checklistItems: Optional[List[ChecklistItem]] = None
    rewardAmount: int = 3
    damageAmount: int = 3
    taskCounter: int = 0
    isCompleted: bool = False
    repeatInterval: str = "daily"  # "daily", "weekly", "monthly", "yearly"
    everyX: int = 1  # e.g. every 5 days
    daysOfWeek: List[int] = [0, 1, 2, 3, 4, 5, 6]  # weekly; [0,1,2,3,4,5,6]
    monthlyByDay: bool = True  # true: repeat by day of month (1-31), false: repeat by day of week (1st Monday, etc.)

class DailyCreate(DailyBase):
    pass

class DailyUpdate(DailyBase):
    title: Optional[str] = None

class Daily(DailyBase):
    id: str
    isDue: bool
    createdAt: datetime
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    cron_time: int = 0
    hp: float = 50
    max_hp: int = 50
    xp: float = 0
    max_xp: int = 25
    level: int = 1
    gold: float = 0
    mana: float = 0
    max_mana: int = 30
    strength: int = 0
    constitution: int = 0
    intelligence: int = 0
    perception: int = 0
    streaks: int = 0

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Rarity(str, Enum):
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    epic = "epic"
    legendary = "legendary"

class PetStats(BaseModel):
    health: int
    attack: int
    defense: int
    special: int

class PetBase(BaseModel):
    name: str
    rarity: Rarity
    level: int = 1
    current_xp: int = 0
    xp_to_next_level: int = 100
    stats: PetStats
    image_url: Optional[str] = None
    is_equipped: bool = False

class PetCreate(PetBase):
    pass

class Pet(PetBase):
    id: str
    user_id: str

    class Config:
        from_attributes = True

class ItemType(str, Enum):
    FOOD = "food"
    CHEST = "chest"
    FRAGMENT = "fragment"
    QUEST = "quest"
    SPECIAL = "special"

class ItemDefinitionBase(BaseModel):
    name: str
    description: Optional[str] = None
    type: ItemType
    rarity: Optional[str] = None
    details: Optional[dict] = None

class ItemDefinitionCreate(ItemDefinitionBase):
    pass

class ItemDefinition(ItemDefinitionBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class QuestProgressBase(BaseModel):
    current_progress: int = 0
    completed: bool = False
    completed_at: Optional[datetime] = None

class QuestProgressCreate(QuestProgressBase):
    quest_id: str

class QuestProgress(QuestProgressBase):
    id: str
    user_id: str
    quest_id: str
    quest: ItemDefinition
    model_config = ConfigDict(from_attributes=True)

class InventorySection(str, Enum):
    PET_FOOD = "Pet Food"
    TREASURE_CHESTS = "Treasure Chests"
    EQUIPMENT_FRAGMENTS = "Equipment Fragments"
    QUESTS = "Quests"
    SPECIAL = "Special"

class InventoryItemBase(BaseModel):
    count: int = 0
    section: InventorySection

class InventoryItemCreate(InventoryItemBase):
    item_id: str

class InventoryItem(InventoryItemBase):
    id: str
    user_id: str
    item_id: str
    item: Optional[ItemDefinition] = None
    model_config = ConfigDict(from_attributes=True)

class InventorySectionResponse(BaseModel):
    name: str
    totalCount: int
    items: List[InventoryItem] 