import ShopSubheader from '../ui/ShopSubheader'
import MarketItem from './MarketItem'
import { marketSections } from '../../types/market'

function Market() {
  return (
    <div className="min-h-screen">
      <ShopSubheader />
      <div className="p-4">
        <h1 className="text-2xl font-medium mb-4 text-main-teal1">Market</h1>
        {marketSections.map((section) => (
          <MarketItem key={section.name} {...section} />
        ))}
      </div>
    </div>
  )
}

export default Market 