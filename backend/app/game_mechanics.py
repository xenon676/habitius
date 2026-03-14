from math import exp
from typing import Union, List, Dict
from random import random
from . import models
from .schemas import ItemType

def reward(rewardAmount: int) -> float:
    if rewardAmount == 1:
        return 0.1
    elif rewardAmount == 2:
        return 0.5
    elif rewardAmount == 3:
        return 1.0
    elif rewardAmount == 4:
        return 1.5
    else:
        return 2.0

def damage(damageAmount: int) -> float:
    if damageAmount == 1:
        return 0.1
    elif damageAmount == 2:
        return 0.5
    elif damageAmount == 3:
        return 1.0
    elif damageAmount == 4:
        return 1.5
    else:
        return 2.0

def calculate_crit_multiplier(user: models.User) -> float:
    if random() < 0.04 * (1 + user.strength/100):
        return 1.5 + 0.1 * user.strength ** 0.5
    else:
        return 1.0

def calculate_max_hp(user: models.User) -> int:
    return 50 + user.constitution

def calculate_max_mana(user: models.User) -> int:
    return 30 + user.intelligence

def calculate_max_xp(level: int) -> int:
    if level < 1:
        return 0
    elif level == 1:
        return 25
    elif level == 2:
        return 50
    elif level == 3:
        return 75
    elif level == 4:
        return 100
    elif level == 5:
        return 150
    else:
        xp = 0.25 * (level ** 2) + 10 * level + 130
        return int(round(xp / 10) * 10)
    
def level_up(user: models.User) -> None:
    if user.xp >= user.max_xp:
        user.xp -= user.max_xp
        user.level += 1
        user.max_xp = calculate_max_xp(user.level)
        user.hp += 0.3 * user.max_hp
        user.hp = min(user.hp, user.max_hp)
        level_up(user)

def recalculate_user_stats(user: models.User) -> None:
    # Call whenever base stats change
    user.max_hp = calculate_max_hp(user)
    user.max_mana = calculate_max_mana(user)
    
    user.hp = max(0, min(user.hp, user.max_hp)) # Death at user.hp == 0
    user.mana = max(0, min(user.mana, user.max_mana))
    user.max_xp = calculate_max_xp(user.level)
    level_up(user)

def choose_drop(items: List[Dict], item_type: ItemType = None) -> str:
    rarity_weights = {
        "common": 100,
        "uncommon": 30,
        "rare": 10,
        "epic": 3,
        "legendary": 1
    }
    
    weighted_items = []
    for item in items:
        if item_type and item["type"] != item_type:
            continue
        weight = rarity_weights.get(item["rarity"], 0)
        if weight > 0:
            weighted_items.append((item["id"], weight))
    
    if not weighted_items:
        return None
        
    total = sum(weight for _, weight in weighted_items)
    r = random() * total
    
    cumulative = 0
    for item_id, weight in weighted_items:
        cumulative += weight
        if r <= cumulative:
            return item_id
    
    return weighted_items[-1][0]

def roll_drop(user: models.User, task: Union[models.Todo, models.Daily, models.Habit]) -> str:
    from .database import SessionLocal
    from .models import ItemDefinition
    
    bonus = reward(task.rewardAmount) * \
            (task.streak if isinstance(task, models.Daily) else 1) * \
            (1 + 0.01 * user.perception) * \
            (1 + 0.005 * user.streaks) * \
            calculate_crit_multiplier(user) * \
            (1 + 0.5 * len(task.checklistItems or []) if not isinstance(task, models.Habit) else 1)
    
    multipliers = [0.2, 0.1, 0.003, 0.001, 0.00005]
    chances = list(map(lambda x: 3 * x * bonus / (bonus + 1.5), multipliers))

    r = random()
    cumulative = 0
    
    db = SessionLocal()
    try:
        all_items = [item.__dict__ for item in db.query(ItemDefinition).all()]
    finally:
        db.close()
    
    for i, chance in enumerate(chances):
        cumulative += chance
        if r <= cumulative:
            # Pet food
            if i == 0:
                return choose_drop(all_items, ItemType.FOOD)
            
            # Equipment fragment
            if i == 1:
                return choose_drop(all_items, ItemType.FRAGMENT)
            
            # Rare quest
            if i == 2:
                items = [item for item in all_items if item["rarity"] in ["rare"]]
                return choose_drop(items, ItemType.QUEST)
            
            # Epic quest
            if i == 3:
                items = [item for item in all_items if item["rarity"] in ["epic"]]
                return choose_drop(items, ItemType.QUEST)
            
            # Legendary quest
            if i == 4:
                items = [item for item in all_items if item["rarity"] in ["legendary"]]
                return choose_drop(items, ItemType.QUEST)
    
    return None

def calculate_task_value(counter) -> float:
    return 2.5 / (1 + 4 * exp(0.1 * counter)) + 0.5

def calculate_todo_value(counter: int) -> float:
    return 0.9747 ** (-50 * counter / (counter + 30))