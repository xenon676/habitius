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
  isEquipped?: boolean
}
