from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Add the parent directory to the Python path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.models import ItemDefinition
from app.schemas import ItemType

# Create database connection
SQLALCHEMY_DATABASE_URL = "sqlite:///" + os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "habitius.db")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_items():
    db = SessionLocal()
    
    pet_food_items = [
        {
            "id": "food1",
            "name": "Treat",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "common",
            "details": {"xp": 10}
        },
        {
            "id": "food2",
            "name": "Strawberry",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "uncommon",
            "details": {"xp": 25}
        },
        {
            "id": "food3",
            "name": "Blueberry",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "uncommon",
            "details": {"xp": 25}
        },
        {
            "id": "food4",
            "name": "Melon",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "uncommon",
            "details": {"xp": 25}
        },
        {
            "id": "food5",
            "name": "Apple",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "uncommon",
            "details": {"xp": 25}
        },
        {
            "id": "food6",
            "name": "Pepper",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "rare",
            "details": {"xp": 50}
        },
        {
            "id": "food7",
            "name": "Pomegranate",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "rare",
            "details": {"xp": 50}
        },
        {
            "id": "food8",
            "name": "Melon",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "rare",
            "details": {"xp": 50}
        },
        {
            "id": "food9",
            "name": "Grapes",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "rare",
            "details": {"xp": 50}
        },
        {
            "id": "food10",
            "name": "Golden Apple",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "epic",
            "details": {"xp": 150}
        },
        {
            "id": "food11",
            "name": "Star Treat",
            "description": "",
            "type": ItemType.FOOD,
            "rarity": "legendary",
            "details": {"xp": 300}
        }
    ]
    
    quest_items = [
        {
            "id": "quest1",
            "name": "Acorn Collector",
            "description": "Collect 20 acorns from the forest",
            "type": ItemType.QUEST,
            "rarity": "common",
            "details": {
                "questType": "collection",
                "target": 20,
                "difficulty": 1,
                "reward": {
                    "xp": 100,
                    "items": [{"id": "food1", "count": 3}]
                }
            }
        },
        {
            "id": "quest2",
            "name": "Dragon Slayer",
            "description": "Kill the dragon",
            "type": ItemType.QUEST,
            "rarity": "rare",
            "details": {
                "questType": "damage",
                "target": 1000,
                "difficulty": 6,
                "reward": {
                    "xp": 1000,
                    "items": [{"id": "food10", "count": 1}]
                }
            }
        },
        {
            "id": "quest3",
            "name": "Gem Hunter",
            "description": "Find 50 rare gems in the mines",
            "type": ItemType.QUEST,
            "rarity": "epic",
            "details": {
                "questType": "collection",
                "target": 50,
                "difficulty": 8,
                "reward": {
                    "xp": 500,
                    "items": [{"id": "food11", "count": 3}]
                }
            }
        }
    ]
    
    treasure_items = [
        {
            "id": "chest1",
            "name": "Basic Treasure Chest",
            "description": "A simple chest that might contain common items",
            "type": ItemType.CHEST,
            "rarity": "common",
            "details": {
                "rewards": [
                    {"chance": 0.7, "items": [{"id": "food1", "count": 1}]},
                    {"chance": 0.3, "items": [{"id": "food2", "count": 1}]}
                ]
            }
        },
        {
            "id": "chest2",
            "name": "Golden Treasure Chest",
            "description": "A valuable chest with better rewards",
            "type": ItemType.CHEST,
            "rarity": "rare",
            "details": {
                "rewards": [
                    {"chance": 0.5, "items": [{"id": "food2", "count": 2}]},
                    {"chance": 0.3, "items": [{"id": "food3", "count": 1}]},
                    {"chance": 0.2, "items": [{"id": "fragment1", "count": 1}]}
                ]
            }
        }
    ]
    
    fragment_items = [
        {
            "id": "fragment1",
            "name": "Basic Sword Fragment",
            "description": "A fragment of a basic sword",
            "type": ItemType.FRAGMENT,
            "rarity": "common",
            "details": {
                "equipment_type": "weapon",
                "fragments_needed": 5
            }
        },
        {
            "id": "fragment2",
            "name": "Magic Staff Fragment",
            "description": "A fragment of a magical staff",
            "type": ItemType.FRAGMENT,
            "rarity": "rare",
            "details": {
                "equipment_type": "weapon",
                "fragments_needed": 8
            }
        }
    ]
    
    special_items = [
        {
            "id": "special1",
            "name": "Pet Rename Token",
            "description": "Allows you to rename one of your pets",
            "type": ItemType.SPECIAL,
            "rarity": "uncommon",
            "details": {
                "action": "rename_pet"
            }
        },
        {
            "id": "special2",
            "name": "Reset Potion",
            "description": "Resets a pet's stat distribution",
            "type": ItemType.SPECIAL,
            "rarity": "rare",
            "details": {
                "action": "reset_stats"
            }
        }
    ]
    
    all_items = pet_food_items + quest_items + treasure_items + fragment_items + special_items
    
    for item_data in all_items:
        existing = db.query(ItemDefinition).filter(ItemDefinition.id == item_data["id"]).first()
        if not existing:
            item = ItemDefinition(**item_data)
            db.add(item)
    
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_items() 