import { useState } from 'react'
import { HeartStraightIcon, StarIcon, LightningIcon, SwordIcon } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { API_BASE_URL } from '../../api/config'
import * as tasksApi from '../../api/tasksApi'

const formatHp = (hp: number): string => {
  return hp < 10 ? hp.toFixed(1) : hp.toFixed(0);
};

function Header() {
  const { user } = useAuth();

  // Example quest data - will be connected to game state later
  const [currentQuest] = useState({
    title: "Dragon Slayer",
    type: "damage",
    target: "Moltraz",
    current: 1500, // Current health for damage quests, current items for collection
    required: 10000, // Starting health for damage quests, required items for collection
    pending: 125.5
  })

  const getProgressPercentage = () => {
    if (currentQuest.type === "damage") {
      // For damage quests, bar goes from full to empty
      return ((currentQuest.required - currentQuest.current) / currentQuest.required) * 100
    } else {
      // For collection quests, bar goes from empty to full
      return (currentQuest.current / currentQuest.required) * 100
    }
  }

  const handleCronTrigger = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/cron/trigger`, {}, {
        withCredentials: true
      });
      console.log('Cron triggered:', response.data);

      await Promise.all([
        tasksApi.getHabits(),
        tasksApi.getDailies(),
        tasksApi.getTodos()
      ]);

      window.location.reload();
    } catch (error) {
      console.error('Error triggering cron:', error);
    }
  };

  if (!user) return null;

  return (
    <header className="bg-main-black text-main-white">
      <div className="flex justify-between items-center">
        <div className="flex gap-12">
          {/* Level Display */}
          <div className="flex items-center justify-center pl-12">
            <div className="flex flex-col items-center">
              <span className="text-sm text-main-gray2">LEVEL</span>
              <span className="text-2xl font-bold text-habit-neutral">{user.level}</span>
            </div>
          </div>

          {/* Stats Bars - Stacked vertically on the left */}
          <div className="flex flex-col gap-3 bg-main-gray8 p-3">
            {/* HP Bar */}
            <div className="flex items-center gap-3">
              <HeartStraightIcon className="text-habit-weak3" weight="duotone" size={24} />
              <div className="w-48 h-3 bg-main-gray7 rounded-[2px]">
                <div 
                  className="h-full bg-habit-weak3 rounded-[2px]"
                  style={{ width: `${(user.hp / user.max_hp) * 100}%` }}
                />
              </div>
              <span className="text-main-gray2 text-xs w-[45px] text-right">
                {formatHp(user.hp)}/{user.max_hp}
              </span>
            </div>

            {/* XP Bar */}
            <div className="flex items-center gap-3">
              <StarIcon className="text-habit-neutral" weight="duotone" size={24} />
              <div className="w-48 h-3 bg-main-gray7 rounded-[2px]">
                <div 
                  className="h-full bg-habit-neutral rounded-[2px]"
                  style={{ width: `${(user.xp / user.max_xp) * 100}%` }}
                />
              </div>
              <span className="text-main-gray2 text-xs w-[45px] text-right">
                {user.xp.toFixed(0)}/{user.max_xp}
              </span>
            </div>

            {/* Mana Bar */}
            <div className="flex items-center gap-3">
              <LightningIcon className="text-habit-strong3" weight="duotone" size={24} />
              <div className="w-48 h-3 bg-main-gray7 rounded-[2px]">
                <div 
                  className="h-full bg-habit-strong3 rounded-[2px]"
                  style={{ width: `${(user.mana / user.max_mana) * 100}%` }}
                />
              </div>
              <span className="text-main-gray2 text-xs w-[45px] text-right">
                {user.mana.toFixed(0)}/{user.max_mana}
              </span>
            </div>
          </div>

          {/* Quest Progress - Stacked vertically to the right of stats */}
          <div className="flex flex-col gap-3 justify-center">
            <div className="flex items-center gap-10">
              <span className="font-medium w-[120px]">{currentQuest.title}</span>
              <span className="text-main-gray2 w-[100px] text-right">{currentQuest.target}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-48 h-3 bg-main-gray7 rounded-[2px]">
                <div 
                  className={`h-full rounded-[2px] ${currentQuest.type === "damage" ? "bg-habit-weak3" : "bg-main-cyan"}`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
              <span className="text-main-gray2 text-xs w-[45px] text-right">
                {currentQuest.type === "damage" 
                  ? `${Math.round(currentQuest.required - currentQuest.current)}/${Math.round(currentQuest.required)}`
                  : `${Math.round(currentQuest.current)}/${Math.round(currentQuest.required)}`}
              </span>
            </div>
            
            <div className="flex items-center gap-2 justify-center">
              {currentQuest.type === "damage" && (
                <SwordIcon className="w-5 h-5" />
              )}
              <span className="text-main-gray2 text-sm whitespace-nowrap">
                {currentQuest.type === "damage" 
                  ? `${currentQuest.pending.toFixed(1)} damage`
                  : `${Math.round(currentQuest.pending)} items`} pending
              </span>
            </div>
          </div>
        </div>

        {/* DEV: CRON Button */}
        {false && (
          <button
            onClick={handleCronTrigger}
            className="bg-main-gray8 hover:bg-main-gray7 text-main-white px-4 py-2 rounded mr-4"
          >
            DEV: CRON
          </button>
        )}
      </div>
    </header>
  )
}

export default Header 