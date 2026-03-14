import { useState } from 'react'
import Subheader from '../ui/Subheader'
import { InventoryRow, EquipmentSlot, EquipmentType, EquipmentItem } from './EquipmentRow'
import { EquipmentSelect } from './EquipmentSelect'
import { 
  SwordIcon,
  ShieldIcon,
  HardHatIcon,
  TShirtIcon,
  PantsIcon,
  BootIcon,
  GearSixIcon,
  CircleIcon,
  HoodieIcon,
  HandIcon,
  DiamondsFourIcon
} from '@phosphor-icons/react'

// Sample data; move to backend
const availableEquipmentData: EquipmentItem[] = [
  { name: 'Wooden Staff', rarity: 'common', type: 'main-hand' },
  { name: 'Iron Sword', rarity: 'uncommon', type: 'main-hand' },
  { name: 'Fire Staff', rarity: 'rare', type: 'main-hand' },
  { name: 'Wooden Shield', rarity: 'common', type: 'off-hand' },
  { name: 'Iron Shield', rarity: 'uncommon', type: 'off-hand' },
  { name: 'Leather Cap', rarity: 'common', type: 'helmet' },
  { name: 'Iron Helmet', rarity: 'uncommon', type: 'helmet' },
  { name: 'Iron Breastplate', rarity: 'uncommon', type: 'chestplate' },
  { name: 'Steel Breastplate', rarity: 'rare', type: 'chestplate' },
  { name: 'Leather Boots', rarity: 'common', type: 'boots' },
  { name: 'Iron Boots', rarity: 'uncommon', type: 'boots' },
  { name: 'Magic Bracelet', rarity: 'epic', type: 'bracelet' },
  { name: 'Amulet of Power', rarity: 'legendary', type: 'necklace' }
]

// Should also be from backend
function InventoryEquipment() {
  const [equipment, setEquipment] = useState<EquipmentSlot[]>([
    // Weapons
    { type: 'main-hand', icon: <SwordIcon className="w-6 h-6" weight="regular" />, category: 'main-hand', item: { name: 'Wooden Staff', rarity: 'common', type: 'main-hand' } },
    { type: 'off-hand', icon: <ShieldIcon className="w-6 h-6" weight="regular" />, category: 'off-hand' },
    
    // Armor
    { type: 'helmet', icon: <HardHatIcon className="w-6 h-6" weight="regular" />, category: 'helmet', item: { name: 'Leather Cap', rarity: 'common', type: 'helmet' } },
    { type: 'chestplate', icon: <TShirtIcon className="w-6 h-6" weight="regular" />, category: 'chestplate', item: { name: 'Iron Breastplate', rarity: 'uncommon', type: 'chestplate' } },
    { type: 'leggings', icon: <PantsIcon className="w-6 h-6" weight="regular" />, category: 'leggings' },
    { type: 'boots', icon: <BootIcon className="w-6 h-6" weight="regular" />, category: 'boots', item: { name: 'Studded Boots', rarity: 'rare', type: 'boots' } },
    
    // Accessories
    { type: 'belt', icon: <GearSixIcon className="w-6 h-6" weight="regular" />, category: 'belt' },
    { type: 'bracelet', icon: <CircleIcon className="w-6 h-6" weight="regular" />, category: 'bracelet', item: { name: 'Magic Bracelet', rarity: 'epic', type: 'bracelet' } },
    { type: 'cloak', icon: <HoodieIcon className="w-6 h-6" weight="regular" />, category: 'cloak' },
    { type: 'glove', icon: <HandIcon className="w-6 h-6" weight="regular" />, category: 'glove' },
    { type: 'necklace', icon: <DiamondsFourIcon className="w-6 h-6" weight="regular" />, category: 'necklace', item: { name: 'Amulet of Power', rarity: 'legendary', type: 'necklace' } }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSlotType, setSelectedSlotType] = useState<EquipmentType | null>(null)

  const handleReplace = (type: EquipmentType) => {
    setSelectedSlotType(type)
    setIsModalOpen(true)
  }

  const handleRemove = (type: EquipmentType) => {
    setEquipment(prev => prev.map(slot => 
      slot.type === type ? { ...slot, item: undefined } : slot
    ))
  }

  const handleEquip = (type: EquipmentType) => {
    setSelectedSlotType(type)
    setIsModalOpen(true)
  }

  const handleSelectEquipment = (item: EquipmentItem) => {
    setEquipment(prev => prev.map(slot => 
      slot.type === selectedSlotType ? { ...slot, item } : slot
    ))
    setIsModalOpen(false)
    setSelectedSlotType(null)
  }

  const getCurrentEquipment = () => {
    if (!selectedSlotType) return undefined
    return equipment.find(slot => slot.type === selectedSlotType)?.item
  }

  const getAvailableEquipment = () => {
    if (!selectedSlotType) return []
    
    // Get all currently equipped items
    const equippedItems = equipment
      .filter(slot => slot.item)
      .map(slot => slot.item!.name)
    
    // Filter available equipment by type and exclude equipped items
    return availableEquipmentData.filter(item => 
      item.type === selectedSlotType && !equippedItems.includes(item.name)
    )
  }

  return (
    <div className="min-h-screen">
      <Subheader />
      <div className="p-4">
        <h1 className="text-2xl font-medium mb-4 text-main-teal1">Equipment</h1>
        
        <div className="space-y-6">
          {/* Weapons Section */}
          <div>
            <h2 className="text-lg font-medium mb-3 text-main-gray7">Weapons</h2>
            <div className="space-y-2">
              {equipment
                .filter(slot => slot.type === 'main-hand' || slot.type === 'off-hand')
                .map(slot => (
                  <InventoryRow
                    key={slot.type}
                    slot={slot}
                    onReplace={handleReplace}
                    onRemove={handleRemove}
                    onEquip={handleEquip}
                  />
                ))}
            </div>
          </div>

          {/* Armor Section */}
          <div>
            <h2 className="text-lg font-medium mb-3 text-main-gray7">Armor</h2>
            <div className="space-y-2">
              {equipment
                .filter(slot => slot.type === 'helmet' || slot.type === 'chestplate' || slot.type === 'leggings' || slot.type === 'boots')
                .map(slot => (
                  <InventoryRow
                    key={slot.type}
                    slot={slot}
                    onReplace={handleReplace}
                    onRemove={handleRemove}
                    onEquip={handleEquip}
                  />
                ))}
            </div>
          </div>

          {/* Accessories Section */}
          <div>
            <h2 className="text-lg font-medium mb-3 text-main-gray7">Accessories</h2>
            <div className="space-y-2">
              {equipment
                .filter(slot => slot.type === 'belt' || slot.type === 'bracelet' || slot.type === 'cloak' || slot.type === 'glove' || slot.type === 'necklace')
                .map(slot => (
                  <InventoryRow
                    key={slot.type}
                    slot={slot}
                    onReplace={handleReplace}
                    onRemove={handleRemove}
                    onEquip={handleEquip}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Equipment Selection Modal */}
        {selectedSlotType && (
          <EquipmentSelect
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedSlotType(null)
            }}
            onSelect={handleSelectEquipment}
            slotType={selectedSlotType}
            currentEquipment={getCurrentEquipment()}
            availableEquipment={getAvailableEquipment()}
          />
        )}
      </div>
    </div>
  )
}

export default InventoryEquipment 