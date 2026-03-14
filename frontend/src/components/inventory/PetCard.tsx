import { 
  HeartIcon,
  LightningIcon,
  ShieldIcon,
  StarIcon,
  ArrowsClockwiseIcon,
  PlusIcon,
  CookieIcon
} from '@phosphor-icons/react'
import { Pet, Rarity } from '../../types/pets'

interface PetCardProps {
  pet: Pet
  isEquipped?: boolean
  onEquip: (pet: Pet) => void
  onFeed: (petId: string) => void
}

const getRarityColor = (rarity: Rarity) => {
  switch (rarity) {
    case 'common': return 'text-main-gray6'
    case 'uncommon': return 'text-green-600'
    case 'rare': return 'text-blue-600'
    case 'epic': return 'text-purple-600'
    case 'legendary': return 'text-orange-500'
    default: return 'text-main-gray6'
  }
}

const getRarityBackground = (rarity: Rarity) => {
  switch (rarity) {
    case 'common': return 'bg-main-gray3'
    case 'uncommon': return 'bg-green-100'
    case 'rare': return 'bg-blue-100'
    case 'epic': return 'bg-purple-100'
    case 'legendary': return 'bg-orange-100'
    default: return 'bg-main-gray3'
  }
}

const getRarityBorderColor = (rarity: Rarity) => {
  switch (rarity) {
    case 'common': return 'border-main-gray4'
    case 'uncommon': return 'border-green-500'
    case 'rare': return 'border-blue-500'
    case 'epic': return 'border-purple-500'
    case 'legendary': return 'border-orange-500'
    default: return 'border-main-gray4'
  }
}

export function PetCard({ pet, isEquipped, onEquip, onFeed }: PetCardProps) {
  return (
    <div 
      className={`bg-main-white rounded-lg p-4 shadow-sm shadow-main-gray3 border-2 ${getRarityBorderColor(pet.rarity)}`}
    >
      <div className="flex gap-4">
        {/* Pet Image/Icon */}
        <div className={`w-20 h-20 rounded-lg flex items-center justify-center ${getRarityBackground(pet.rarity)}`}>
          {pet.imageUrl ? (
            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover rounded" />
          ) : (
            <StarIcon className="w-10 h-10 text-main-gray4" />
          )}
        </div>

        {/* Pet Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityBackground(pet.rarity)} ${getRarityColor(pet.rarity)}`}>
              {pet.rarity.charAt(0).toUpperCase() + pet.rarity.slice(1)}
            </span>
            <span className="text-sm text-main-gray5">Lvl {pet.level}</span>
          </div>
          <h3 className="font-medium text-main-gray7 mb-2">{pet.name}</h3>
          
          {/* XP Progress */}
          <div className="space-y-2 mb-2">
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
          
          {/* Compact Stats */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-1">
              <HeartIcon className="text-main-gray6" size={16} weight="bold" />
              <span className="text-main-gray6">{pet.stats.health}</span>
            </div>
            <div className="flex items-center gap-1">
              <LightningIcon className="text-main-gray6" size={16} weight="bold" />
              <span className="text-main-gray6">{pet.stats.attack}</span>
            </div>
            <div className="flex items-center gap-1">
              <ShieldIcon className="text-main-gray6" size={16} weight="bold" />
              <span className="text-main-gray6">{pet.stats.defense}</span>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="text-main-gray6" size={16} weight="bold" />
              <span className="text-main-gray6">{pet.stats.special}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onFeed(pet.id)}
            className="bg-main-teal1 text-main-white px-3 py-1 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-1 min-w-[100px] justify-center"
          >
            <CookieIcon size={16} weight="bold" />
            Feed
          </button>
          <button
            onClick={() => onEquip(pet)}
            className="bg-main-teal1 text-main-white px-3 py-1 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-1 min-w-[100px] justify-center"
          >
            {isEquipped ? <ArrowsClockwiseIcon size={16} weight="bold" /> : <PlusIcon size={16} weight="bold" />}
            {isEquipped ? 'Switch' : 'Equip'}
          </button>
        </div>
      </div>
    </div>
  )
}

export { getRarityColor, getRarityBackground, getRarityBorderColor } 