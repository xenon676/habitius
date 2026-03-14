import { ArrowsClockwiseIcon, ArrowDownIcon, PlusIcon } from '@phosphor-icons/react'

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type EquipmentType = 'main-hand' | 'off-hand' | 'helmet' | 'chestplate' | 'leggings' | 'boots' | 'belt' | 'bracelet' | 'cloak' | 'glove' | 'necklace'

interface EquipmentItem {
  name: string
  rarity: Rarity
  type: EquipmentType
}

interface EquipmentSlot {
  type: EquipmentType
  icon: React.ReactNode
  category: string
  item?: EquipmentItem
}

interface InventoryRowProps {
  slot: EquipmentSlot
  onReplace: (type: EquipmentType) => void
  onRemove: (type: EquipmentType) => void
  onEquip: (type: EquipmentType) => void
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

const capitalizeEquipmentType = (type: string) => {
  return type.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

export function InventoryRow({ slot, onReplace, onRemove, onEquip }: InventoryRowProps) {
  return (
    <div className="flex items-center bg-main-white rounded-lg p-4 mb-2 shadow-sm shadow-main-gray3">
      {/* Icon Column */}
      <div className="w-16 flex items-center justify-center">
        <div className={`w-12 h-12 border-2 rounded-sm flex items-center justify-center ${
          slot.item ? getRarityBorderColor(slot.item.rarity) : 'border-main-gray3'
        }`}>
          <div className={slot.item ? "text-main-gray6" : "text-main-gray4"}>
            {slot.icon}
          </div>
        </div>
      </div>
      
      {/* Info Column */}
      <div className="flex-1 px-4">
        <div className="text-sm text-main-gray5 mb-1">{capitalizeEquipmentType(slot.category)}</div>
        {slot.item ? (
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityBackground(slot.item.rarity)} ${getRarityColor(slot.item.rarity)}`}>
              {slot.item.rarity.charAt(0).toUpperCase() + slot.item.rarity.slice(1)}
            </span>
            <span className="font-medium text-main-gray7">{slot.item.name}</span>
          </div>
        ) : (
          <div className="text-main-gray4 italic">Empty slot</div>
        )}
      </div>
      
      {/* Options Column */}
      <div className="flex flex-col gap-2">
        {slot.item ? (
          <>
            <button 
              onClick={() => onReplace(slot.type)}
              className="bg-main-teal1 text-main-white px-3 py-1 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-1"
            >
              <ArrowsClockwiseIcon size={16} weight="bold" />
              Replace
            </button>
            <button 
              onClick={() => onRemove(slot.type)}
              className="bg-main-gray5 text-main-white px-3 py-1 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-1"
            >
              <ArrowDownIcon size={16} weight="bold" />
              Remove
            </button>
          </>
        ) : (
          <button 
            onClick={() => onEquip(slot.type)}
            className="bg-main-teal1 text-main-white px-3 py-1 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-1"
          >
            <PlusIcon size={16} weight="bold" />
            Equip
          </button>
        )}
      </div>
    </div>
  )
}

export type { EquipmentType, EquipmentItem, EquipmentSlot }
export { getRarityColor, getRarityBackground, getRarityBorderColor } 