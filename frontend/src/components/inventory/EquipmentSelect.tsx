import { XIcon } from '@phosphor-icons/react'
import { EquipmentItem, EquipmentType, getRarityBackground, getRarityBorderColor, getRarityColor } from './EquipmentRow'

interface EquipmentSelectProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (item: EquipmentItem) => void
  slotType: EquipmentType
  currentEquipment: EquipmentItem | undefined
  availableEquipment: EquipmentItem[]
}

export function EquipmentSelect({ 
  isOpen, 
  onClose, 
  onSelect, 
  slotType, 
  currentEquipment,
  availableEquipment 
}: EquipmentSelectProps) {
  if (!isOpen) return null

  const capitalizeEquipmentType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const renderEquipmentItem = (item: EquipmentItem, isCurrent: boolean = false) => (
    <div 
      key={item.name}
      className={`flex items-center p-3 rounded-lg border-2 ${getRarityBorderColor(item.rarity)} ${
        isCurrent ? 'bg-main-gray2' : 'bg-main-white hover:bg-main-gray1 cursor-pointer'
      }`}
      onClick={() => !isCurrent && onSelect(item)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityBackground(item.rarity)} ${getRarityColor(item.rarity)}`}>
            {item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1)}
          </span>
          <span className="font-medium text-main-gray7">{item.name}</span>
        </div>
        {isCurrent && (
          <span className="text-sm text-main-gray5">Currently Equipped</span>
        )}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-main-white rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-main-gray3">
          <h2 className="text-xl font-medium text-main-gray7">
            Select {capitalizeEquipmentType(slotType)}
          </h2>
          <button
            onClick={onClose}
            className="text-main-gray5 hover:text-main-gray6 cursor-pointer"
          >
            <XIcon className="text-main-gray4" size={24} weight="bold" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-4rem)]">
          <div className="space-y-3">
            {/* Currently Equipped Section */}
            {currentEquipment && (
              <div>
                <h3 className="text-sm font-medium text-main-gray6 mb-2">Currently Equipped</h3>
                {renderEquipmentItem(currentEquipment, true)}
              </div>
            )}

            {/* Available Equipment Section */}
            <div>
              <h3 className="text-sm font-medium text-main-gray6 mb-2">Available Equipment</h3>
              <div className="space-y-2">
                {availableEquipment.length === 0 ? (
                  <div className="text-center py-4 text-main-gray5 bg-main-gray1 rounded-lg">
                    No available equipment for this slot
                  </div>
                ) : (
                  availableEquipment
                    .filter(item => item !== currentEquipment)
                    .map(item => renderEquipmentItem(item))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 