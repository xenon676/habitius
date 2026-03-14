import { useEffect, useState } from 'react'
import Subheader from '../ui/Subheader'
import InventoryItem from './InventoryItem'
import { InventorySection } from '../../types/inventory'
import { getInventory } from '../../api/tasksApi'

function InventoryItems() {
  const [sections, setSections] = useState<InventorySection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true)
        const data = await getInventory()
        setSections(data)
      } catch (err) {
        setError('Failed to load inventory')
        console.error('Error loading inventory:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInventory()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Subheader />
        <div className="p-4">
          <h1 className="text-2xl font-medium mb-4 text-main-teal1">Loading items...</h1>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Subheader />
        <div className="p-4">
          <h1 className="text-2xl font-medium mb-4 text-main-teal1">Items</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Subheader />
      <div className="p-4">
        <h1 className="text-2xl font-medium mb-4 text-main-teal1">Items</h1>
        {sections.map((section) => (
          <InventoryItem key={section.name} {...section} />
        ))}
      </div>
    </div>
  )
}

export default InventoryItems 