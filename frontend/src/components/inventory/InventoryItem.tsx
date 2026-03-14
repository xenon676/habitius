import React, { useState, useEffect } from 'react';
import { CaretDownIcon, CaretRightIcon, CurrencyDollarIcon } from '@phosphor-icons/react';
import Tooltip from '../ui/Tooltip';
import type { InventorySection, ItemDefinition, QuestData } from '../../types/inventory';
import { getItemDefinitions } from '../../api/tasksApi';

const InventoryItem: React.FC<InventorySection> = ({ name, totalCount, items }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemDefinitions, setItemDefinitions] = useState<Record<string, ItemDefinition>>({});
  const hasItems = items.length > 0;

  useEffect(() => {
    const fetchItemDefinitions = async () => {
      try {
        const definitions = await getItemDefinitions();
        // Create a map of id to definition
        const definitionMap = definitions.reduce((acc: Record<string, ItemDefinition>, def: ItemDefinition) => {
          acc[def.id] = def;
          return acc;
        }, {});
        setItemDefinitions(definitionMap);
      } catch (error) {
        console.error('Failed to fetch item definitions:', error);
      }
    };

    if (hasItems) {
      fetchItemDefinitions();
    }
  }, [hasItems]);

  const getQuestData = (itemId: string): QuestData | undefined => {
    const def = itemDefinitions[itemId];
    if (!def || def.type !== 'quest') return undefined;

    return {
      title: def.name,
      effects: {
        questType: def.details?.questType || 'collection',
        target: def.details?.target || 0,
        difficulty: def.details?.difficulty || 0
      }
    };
  };

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
        <div className="grid grid-cols-4 gap-4 max-w-md">
          {items
            .sort((a, b) => b.count - a.count)
            .map((item) => {
              const itemDef = itemDefinitions[item.item_id];
              const questData = getQuestData(item.item_id);
              
              return (
                <div key={item.id} className="relative group">
                  <div className="bg-main-white rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm shadow-main-gray3 transition-all duration-200 group-hover:shadow-lg cursor-pointer">
                    <CurrencyDollarIcon className="w-8 h-8 text-main-gray5" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-main-gray5 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">
                    <span className="text-main-white text-sm font-medium">{item.count}</span>
                  </div>
                  {name === 'Quests' && questData && (
                    <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-18">
                      <Tooltip 
                        type="quest" 
                        title={questData.title}
                        questType={questData.effects.questType}
                        target={questData.effects.target}
                        difficulty={questData.effects.difficulty}
                      />
                    </div>
                  )}
                  {name === 'Pet Food' && itemDef && (
                    <div className="absolute top-full left-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -ml-12">
                      <Tooltip type="large" text={itemDef.name} />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default InventoryItem; 