import { useState } from 'react'
import Subheader from '../ui/Subheader'
import { PetCard } from './PetCard'
import { EquippedPet } from './EquippedPet'
import { Pet } from '../../types/pets'

function InventoryPets() {
  const [equippedPet, setEquippedPet] = useState<Pet | null>({
    id: 'pet1',
    name: 'Baby Dragon',
    rarity: 'rare',
    level: 5,
    currentXp: 450,
    xpToNextLevel: 1000,
    stats: {
      health: 100,
      attack: 15,
      defense: 10,
      special: 20
    }
  })

  const [availablePets] = useState<Pet[]>([
    {
      id: 'pet1',
      name: 'Baby Dragon',
      rarity: 'rare',
      level: 5,
      currentXp: 450,
      xpToNextLevel: 1000,
      stats: {
        health: 100,
        attack: 15,
        defense: 10,
        special: 20
      }
    },
    {
      id: 'pet2',
      name: 'Forest Sprite',
      rarity: 'uncommon',
      level: 3,
      currentXp: 200,
      xpToNextLevel: 500,
      stats: {
        health: 60,
        attack: 8,
        defense: 12,
        special: 15
      }
    },
    {
      id: 'pet3',
      name: 'Golden Phoenix',
      rarity: 'legendary',
      level: 10,
      currentXp: 2400,
      xpToNextLevel: 3000,
      stats: {
        health: 200,
        attack: 30,
        defense: 25,
        special: 40
      }
    }
  ])

  const handleEquip = (pet: Pet) => {
    setEquippedPet(pet)
  }

  const handleUnequip = () => {
    setEquippedPet(null)
  }

  const handleFeed = (petId: string) => {
    // In a real implementation, this would call an API to feed the pet and gain XP
    console.log(`Feeding pet ${petId} to gain XP`)
  }

  return (
    <div className="min-h-screen">
      <Subheader />
      <div className="p-4">
        <h1 className="text-2xl font-medium mb-4 text-main-teal1">Pets</h1>
        
        {/* Equipped Pet Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3 text-main-gray7">Currently Equipped</h2>
          {equippedPet ? (
            <EquippedPet 
              pet={equippedPet}
              onUnequip={handleUnequip}
              onFeed={handleFeed}
            />
          ) : (
            <div className="bg-main-white rounded-lg p-6 shadow-sm shadow-main-gray3 text-center text-main-gray4 italic">
              No pet equipped
            </div>
          )}
        </div>

        {/* Available Pets Grid */}
        <div>
          <h2 className="text-lg font-medium mb-3 text-main-gray7">Available Pets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePets
              .filter(pet => pet.id !== equippedPet?.id)
              .map(pet => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  isEquipped={false}
                  onEquip={handleEquip}
                  onFeed={handleFeed}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryPets 