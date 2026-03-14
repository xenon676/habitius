import React, { useState } from 'react';
import { CaretDownIcon, CaretRightIcon, CurrencyDollarIcon } from '@phosphor-icons/react';

interface MarketItemProps {
  name: string;
  totalCount: number;
  items: {
    id: string;
    name: string;
    price: number;
    description?: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  }[];
}

const MarketItem: React.FC<MarketItemProps> = ({ name, totalCount, items }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasItems = items.length > 0;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-main-gray6'
      case 'uncommon': return 'text-green-600'
      case 'rare': return 'text-blue-600'
      case 'epic': return 'text-purple-600'
      case 'legendary': return 'text-orange-500'
      default: return 'text-main-gray6'
    }
  }

  return (
    <div className="p-1 mb-1">
      <div 
        className={`flex items-center gap-2 mb-4 ${hasItems ? 'cursor-pointer' : ''}`}
        onClick={() => hasItems && setIsExpanded(!isExpanded)}
      >
        {hasItems ? (
          isExpanded ? (
            <CaretDownIcon className="text-main-gray5" size={20} weight="bold" />
          ) : (
            <CaretRightIcon className="text-main-gray5" size={20} weight="bold" />
          )
        ) : (
          <div className="w-5 h-5" />
        )}
        <h2 className="text-xl font-semibold">{name}</h2>
        <div className="bg-main-gray3 rounded-full w-6 h-6 flex items-center justify-center">
          <span className="text-main-gray6 text-sm font-medium">{totalCount}</span>
        </div>
      </div>

      {isExpanded && hasItems && (
        <div className="space-y-2 pl-7">
          {items.map((item) => (
            <div 
              key={item.id}
              className="bg-main-white rounded-lg p-4 shadow-sm shadow-main-gray3 flex items-center justify-between"
            >
              <div className="flex flex-col">
                <span className={`font-medium ${getRarityColor(item.rarity)}`}>
                  {item.name}
                </span>
                {item.description && (
                  <span className="text-sm text-main-gray5">{item.description}</span>
                )}
              </div>
              <button className="bg-main-teal1 text-main-white px-4 py-2 rounded-sm text-sm font-medium shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer flex items-center gap-2">
                <CurrencyDollarIcon className="w-4 h-4" />
                {item.price}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketItem; 