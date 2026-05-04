from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime
from typing import cast, Any, Optional


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    cron_time = Column(Integer, default=0)
    last_login = Column(DateTime(timezone=True), server_default=func.now())

    hp = Column(Float, default=50)
    max_hp = Column(Integer, default=50)
    xp = Column(Float, default=0)
    max_xp = Column(Integer, default=25)
    level = Column(Integer, default=1)
    gold = Column(Float, default=0)
    mana = Column(Float, default=0)
    max_mana = Column(Integer, default=30)
    streaks = Column(Integer, default=0)

    strength = Column(Integer, default=0)
    constitution = Column(Integer, default=0)
    intelligence = Column(Integer, default=0)
    perception = Column(Integer, default=0)

    habits = relationship("Habit", back_populates="user")
    dailies = relationship("Daily", back_populates="user")
    todos = relationship("Todo", back_populates="user")
    pets = relationship("Pet", back_populates="user")
    inventory_items = relationship("InventoryItem", back_populates="user")


class Habit(Base):
    __tablename__ = "habits"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    notes = Column(String)
    acceptsPositive = Column(Boolean, default=True)
    acceptsNegative = Column(Boolean, default=True)
    positiveStreak = Column(Integer, default=0)
    negativeStreak = Column(Integer, default=0)
    rewardAmount = Column(Integer, default=3)
    damageAmount = Column(Integer, default=3)
    taskCounter = Column(Integer, default=0)
    createdAt = Column(DateTime, default=func.now())
    resetCounterInterval = Column(String, default="daily")
    position = Column(Integer, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="habits")


class Daily(Base):
    __tablename__ = "dailies"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    notes = Column(String)
    streak = Column(Integer, default=0)
    checklistItems = Column(JSON)
    rewardAmount = Column(Integer, default=3)
    damageAmount = Column(Integer, default=3)
    taskCounter = Column(Integer, default=0)
    isCompleted = Column(Boolean, default=False)

    repeatInterval = Column(String, default="daily")
    everyX = Column(Integer, default=1)
    daysOfWeek = Column(JSON)
    monthlyByDay = Column(Boolean, default=True)
    position = Column(Integer, nullable=True)

    createdAt = Column(DateTime, default=func.now())

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="dailies")

    @hybrid_property
    def isDue(self) -> bool:
        now = datetime.now()
        # Resolve to Python types so type checker doesn't treat these as ColumnElement
        repeat_interval: str = cast(Any, self.repeatInterval)
        every_x: int = cast(Any, self.everyX)
        created_at: datetime = cast(Any, self.createdAt)
        days_of_week: Optional[list] = cast(Any, self.daysOfWeek)
        monthly_by_day: bool = cast(Any, self.monthlyByDay)

        if repeat_interval == "daily":
            days_since_creation = (now - created_at).days
            return days_since_creation % every_x == 0
        elif repeat_interval == "weekly":
            current_weekday = now.weekday()
            weeks_since_creation = (now - created_at).days // 7
            return current_weekday in (days_of_week or []) and weeks_since_creation % every_x == 0
        elif repeat_interval == "monthly":
            months_between = (now.year - created_at.year) * 12 + now.month - created_at.month
            if months_between % every_x != 0:
                return False
            if monthly_by_day:
                return now.day == created_at.day
            else:
                creation_weekday = created_at.weekday()
                creation_week_number = (created_at.day - 1) // 7 + 1
                current_weekday = now.weekday()
                current_week_number = (now.day - 1) // 7 + 1
                return (
                    current_weekday == creation_weekday
                    and current_week_number == creation_week_number
                )
        elif repeat_interval == "yearly":
            years_between = now.year - created_at.year
            if years_between % every_x != 0:
                return False
            return now.month == created_at.month and now.day == created_at.day
        return False


class Todo(Base):
    __tablename__ = "todos"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    notes = Column(String)
    checklistItems = Column(JSON)
    rewardAmount = Column(Integer, default=3)
    damageAmount = Column(Integer, default=3)
    taskCounter = Column(Integer, default=0)
    dueDate = Column(DateTime)
    completionDate = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=func.now())
    position = Column(Integer, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="todos")


class Rarity(str, enum.Enum):
    common = "common"
    uncommon = "uncommon"
    rare = "rare"
    epic = "epic"
    legendary = "legendary"


class Pet(Base):
    __tablename__ = "pets"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    rarity = Column(Enum(Rarity))
    level = Column(Integer, default=1)
    current_xp = Column(Integer, default=0)
    xp_to_next_level = Column(Integer, default=100)
    stats = Column(JSON)
    image_url = Column(String, nullable=True)
    is_equipped = Column(Boolean, default=False)

    user = relationship("User", back_populates="pets")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    item_id = Column(String)
    count = Column(Integer, default=0)
    section = Column(String)

    user = relationship("User", back_populates="inventory_items")


class ItemDefinition(Base):
    __tablename__ = "item_definitions"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    type = Column(String, nullable=False)
    rarity = Column(String)
    details = Column(JSON)


class QuestProgress(Base):
    __tablename__ = "quest_progress"

    id = Column(String, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quest_id = Column(String, ForeignKey("item_definitions.id"))
    current_progress = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="quest_progress")
    quest = relationship("ItemDefinition")


User.quest_progress = relationship("QuestProgress", back_populates="user")
