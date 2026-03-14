import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import type { UserStats } from '../../api/authApi';

const formatNumber = (value: number): string => {
  const fullNumber = value.toString();
  
  if (Number.isInteger(value)) {
    return fullNumber;
  }

  const [whole, decimal] = fullNumber.split('.');
  if (!decimal) return fullNumber;

  const significantDecimals = decimal.replace(/0+$/, '');
  const cappedDecimals = significantDecimals.slice(0, 3);
  
  return `${whole}.${cappedDecimals}`;
};

const FixValues: React.FC = () => {
  const { user, updateStats } = useAuth();
  const [values, setValues] = useState<Partial<UserStats>>({
    hp: user?.hp || 0,
    xp: user?.xp || 0,
    mana: user?.mana || 0,
    gold: user?.gold || 0,
    level: user?.level || 0,
    // For development only
    strength: user?.strength || 0,
    constitution: user?.constitution || 0,
    intelligence: user?.intelligence || 0,
    perception: user?.perception || 0,
  });

  // Keep track of input values separately to allow empty strings
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    hp: user?.hp !== undefined ? formatNumber(user.hp) : '0',
    xp: user?.xp !== undefined ? formatNumber(user.xp) : '0',
    mana: user?.mana !== undefined ? formatNumber(user.mana) : '0',
    gold: user?.gold !== undefined ? formatNumber(user.gold) : '0',
    level: user?.level !== undefined ? user.level.toString() : '0',
    strength: user?.strength !== undefined ? user.strength.toString() : '0',
    constitution: user?.constitution !== undefined ? user.constitution.toString() : '0',
    intelligence: user?.intelligence !== undefined ? user.intelligence.toString() : '0',
    perception: user?.perception !== undefined ? user.perception.toString() : '0',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = parseFloat(value);
    if (value === '' || isNaN(parsedValue)) {
      setInputValues(prev => ({
        ...prev,
        [name]: values[name as keyof typeof values] ? formatNumber(values[name as keyof typeof values] as number) : ''
      }));
      return;
    }

    const formattedValue = formatNumber(parsedValue);
    setInputValues(prev => ({
      ...prev,
      [name]: formattedValue
    }));
    setValues(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedValues: Partial<UserStats> = {};
    Object.entries(inputValues).forEach(([key, value]) => {
      if (value !== '') {
        updatedValues[key as keyof UserStats] = parseFloat(value);
      }
    });

    try {
      await updateStats(updatedValues);
      setValues(prev => ({
        ...prev,
        ...updatedValues
      }));
      setInputValues(prev => {
        const newInputs = { ...prev };
        Object.entries(updatedValues).forEach(([key, value]) => {
          newInputs[key] = formatNumber(value);
        });
        return newInputs;
      });
    } catch (error) {
      console.error('Failed to update values:', error);
    }
  };

  const renderInput = (label: string, name: string) => (
    <div className="mb-4">
      <label className="block text-main-gray8 mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={inputValues[name]}
        onChange={handleChange}
        onBlur={handleBlur}
        step="0.001"
        className="w-full px-3 py-2 bg-main-gray3 text-main-gray7 border border-main-gray4 rounded focus:outline-none focus:border-main-gray6 focus:bg-main-gray2"
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-main-black mb-4">Fix Values</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-8">
          <h2 className="text-xl font-medium text-main-gray8 mb-2">Basic Stats</h2>
          {renderInput('HP', 'hp')}
          {renderInput('XP', 'xp')}
          {renderInput('Mana', 'mana')}
          {renderInput('Gold', 'gold')}
          {renderInput('Level', 'level')}
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-medium text-main-gray8 mb-2">Development Only Stats</h2>
          {renderInput('Strength', 'strength')}
          {renderInput('Constitution', 'constitution')}
          {renderInput('Intelligence', 'intelligence')}
          {renderInput('Perception', 'perception')}
        </div>

        <button
          type="submit"
          className="w-full bg-main-teal1 text-white font-medium py-2 px-4 rounded hover:bg-main-teal2/90 hover:cursor-pointer transition-colors"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default FixValues; 