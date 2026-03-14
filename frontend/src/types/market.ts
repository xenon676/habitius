export interface MarketItem {
  id: string;
  name: string;
  price: number;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface MarketSection {
  name: string;
  totalCount: number;
  items: MarketItem[];
}

export const marketSections: MarketSection[] = [
  {
    name: "Pet Food",
    totalCount: 3,
    items: [
      { 
        id: "food1", 
        name: "Basic Pet Food",
        price: 5,
        description: "Should have elements",
        rarity: "common"
      },
      { 
        id: "food2", 
        name: "Premium Pet Food",
        price: 15,
        description: "Levels of pet food could be a good idea",
        rarity: "uncommon"
      },
      { 
        id: "food3", 
        name: "Royal Pet Feast",
        price: 50,
        description: "Slightly discount higher level pet food",
        rarity: "rare"
      }
    ]
  },
  {
    name: "Treasure Chests",
    totalCount: 2,
    items: [
      {
        id: "chest1",
        name: "Common Treasure Chest",
        price: 50,
        description: "Write loot table; consider whether it should be purchasable with gold.",
        rarity: "common"
      },
      {
        id: "chest2",
        name: "Uncommon Treasure Chest",
        price: 250,
        description: "Write loot table; consider whether it should be purchasable with gold.",
        rarity: "uncommon"
      }
    ]
  },
  {
    name: "Equipment Fragments",
    totalCount: 3,
    items: [
      {
        id: "frag1",
        name: "Common Equipment Fragment",
        price: 25,
        description: "Used to craft common equipment",
        rarity: "common"
      },
      {
        id: "frag2",
        name: "Rare Equipment Fragment",
        price: 75,
        description: "Used to craft rare equipment",
        rarity: "rare"
      },
      {
        id: "frag3",
        name: "Legendary Equipment Fragment",
        price: 250,
        description: "Used to craft legendary equipment",
        rarity: "legendary"
      }
    ]
  },
  {
    name: "Special Items",
    totalCount: 2,
    items: [
      {
        id: "special1",
        name: "Experience Boost",
        price: 150,
        description: "Doubles experience gain for 24 hours",
        rarity: "epic"
      },
      {
        id: "special2",
        name: "Pet Egg",
        price: 500,
        description: "Contains a random pet with a chance for rare breeds",
        rarity: "legendary"
      }
    ]
  }
]; 