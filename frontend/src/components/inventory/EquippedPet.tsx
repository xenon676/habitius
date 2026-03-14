import { 
  HeartIcon,
  LightningIcon,
  ShieldIcon,
  StarIcon,
  ArrowDownIcon,
  CookieIcon
} from '@phosphor-icons/react'
import { Pet } from '../../types/pets'
import { getRarityBackground, getRarityBorderColor, getRarityColor } from './PetCard'

interface EquippedPetProps {
  pet: Pet
  onUnequip: () => void
  onFeed: (petId: string) => void
}

export function EquippedPet({ pet, onUnequip, onFeed }: EquippedPetProps) {
  const renderStatBar = (value: number, maxValue: number = 200, label: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 text-main-gray6">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-main-gray6">{label}</span>
          <span className="text-sm text-main-gray6">{value}</span>
        </div>
        <div className="h-2 bg-main-gray3 rounded-full overflow-hidden">
          <div 
            className="h-full bg-main-teal2 rounded-full"
            style={{ width: `${(value / maxValue) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-main-white rounded-lg p-6 shadow-sm shadow-main-gray3">
      <div className="flex gap-6">
        {/* Pet Image/Icon */}
        <div className={`w-32 h-32 border-2 rounded-lg flex items-center justify-center ${getRarityBorderColor(pet.rarity)}`}>
          {pet.imageUrl ? (
            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover rounded" />
          ) : (
            <StarIcon size={24} weight="bold" />
          )}
        </div>

        {/* Pet Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityBackground(pet.rarity)} ${getRarityColor(pet.rarity)}`}>
              {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
            </span>
            <h3 className="text-xl font-medium text-main-gray7">{pet.name}</h3>
            <span className="text-sm text-main-gray5">Level {pet.level}</span>
          </div>

          {/* XP Progress */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-main-gray6">XP Progress</span>
                  <span className="text-sm text-main-gray6">{pet.currentXp} / {pet.xpToNextLevel}</span>
                </div>
                <div className="h-2 bg-main-gray3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-main-teal2 rounded-full"
                    style={{ width: `${(pet.currentXp / pet.xpToNextLevel) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-x-8">
            {renderStatBar(pet.stats.health, 200, 'Health', <HeartIcon size={24} weight="bold" />)}
            {renderStatBar(pet.stats.attack, 50, 'Attack', <LightningIcon size={24} weight="bold" />)}
            {renderStatBar(pet.stats.defense, 50, 'Defense', <ShieldIcon size={24} weight="bold" />)}
            {renderStatBar(pet.stats.special, 50, 'Special', <StarIcon size={24} weight="bold" />)}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onFeed(pet.id)}
            className="bg-main-teal1 text-main-white px-4 py-2 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-2 min-w-[120px] justify-center"
          >
            <CookieIcon size={16} weight="bold" />
            Feed
          </button>
          <button
            onClick={onUnequip}
            className="bg-main-gray5 text-main-white px-4 py-2 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-2 min-w-[120px] justify-center"
          >
            <ArrowDownIcon size={16} weight="bold" />
            Unequip
          </button>
        </div>
      </div>
    </div>
  )
} 