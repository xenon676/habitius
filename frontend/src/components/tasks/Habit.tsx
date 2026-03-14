import TaskSide from './TaskSide'
import TaskDetails from './TaskDetails'
import { incrementHabit } from '../../api/tasksApi'
import { useAuth } from '../../contexts/AuthContext'
import type { TaskColor } from '../../types/task'

interface HabitProps {
  id: string
  acceptsPositive: boolean
  acceptsNegative: boolean
  title: string
  notes?: string
  positiveStreak?: number
  negativeStreak?: number
  color: TaskColor
  onEdit?: () => void
  onRefresh?: () => Promise<void>
}

function Habit({ id, acceptsPositive, acceptsNegative, title, notes, positiveStreak, negativeStreak, color, onEdit, onRefresh }: HabitProps) {
  const { refreshStats } = useAuth();

  const handleTaskAction = async (action: string) => {
    try {
      await incrementHabit(id, action === 'complete-positive');
      await refreshStats();
      if (onRefresh) { await onRefresh(); }
    } catch (error) {
      console.error('Failed to increment habit:', error);
    }
  };

  return (
    <div className="relative flex w-full min-h-24 bg-main-white rounded-lg overflow-hidden shadow-sm shadow-main-gray3 mb-[1px] hover:shadow-lg hover:shadow-main-black/50 hover:z-20 transition-all duration-300 ease-in-out cursor-pointer">
      <TaskSide 
        taskType="habit" 
        isPositive={true} 
        isAccepted={acceptsPositive} 
        color={color}
        onTaskAction={() => handleTaskAction('complete-positive')}
      />
      <TaskDetails 
        title={title} 
        notes={notes} 
        taskType="habit" 
        positiveStreak={positiveStreak}
        negativeStreak={negativeStreak}
        acceptsPositive={acceptsPositive}
        acceptsNegative={acceptsNegative}
        onEdit={onEdit} 
      />
      <TaskSide 
        taskType="habit" 
        isPositive={false} 
        isAccepted={acceptsNegative} 
        color={color}
        onTaskAction={() => handleTaskAction('complete-negative')}
      />
    </div>
  )
}

export default Habit 