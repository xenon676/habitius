export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface PetStats {
  health: number
  attack: number
  defense: number
  special: number
}

export interface Pet {
  id: string
  name: string
  rarity: Rarity
  level: number
  currentXp: number
  xpToNextLevel: number
  stats: PetStats
  imageUrl?: string
  isEquipped: boolean
}

export interface InventoryItem {
  id: string
  count: number
  name: string
  item_id: string
}

export interface InventorySection {
  name: string
  totalCount: number
  items: InventoryItem[]
}

export interface QuestData {
  title: string
  effects: {
    questType: 'collection' | 'damage'
    target: number | string
    difficulty: number
  }
}

export interface ItemDefinition {
  id: string
  name: string
  description?: string
  type: 'food' | 'quest' | 'chest' | 'fragment' | 'special'
  rarity: Rarity
  details: any
} 