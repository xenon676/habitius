import TaskSide from './TaskSide'
import TaskDetails from './TaskDetails'
import { completeDaily } from '../../api/tasksApi'
import { useAuth } from '../../contexts/AuthContext'
import type { TaskColor } from '../../types/task'

interface DailyProps {
  id: string
  isDue: boolean
  isCompleted: boolean
  color: TaskColor
  title: string
  notes?: string
  streak?: number
  checklistItems?: {
    text: string
    completed: boolean
  }[]
  onEdit?: () => void
  onRefresh?: () => Promise<void>
  onChecklistItemToggle?: (index: number) => void
}

function Daily({ id, isDue, isCompleted, color, title, notes, streak, checklistItems, onEdit, onRefresh, onChecklistItemToggle }: DailyProps) {
  const { refreshStats } = useAuth();

  const handleTaskAction = async () => {
    try {
      await completeDaily(id);
      await refreshStats();
      if (onRefresh) { await onRefresh(); }
    } catch (error) {
      console.error('Failed to complete daily:', error);
    }
  };

  return (
    <div className="relative flex w-full min-h-24 bg-main-white rounded-lg overflow-hidden shadow-sm shadow-main-gray3 mb-[1px] hover:shadow-lg hover:shadow-main-black/50 hover:z-20 transition-all duration-300 ease-in-out cursor-pointer">
      <TaskSide 
        taskType="daily" 
        isDue={isDue} 
        isCompleted={isCompleted}
        color={color}
        onTaskAction={handleTaskAction}
      />
      <TaskDetails 
        title={title} 
        notes={notes} 
        streak={streak} 
        taskType="daily"
        checklistItems={checklistItems}
        onEdit={onEdit}
        onChecklistItemToggle={onChecklistItemToggle}
      />
    </div>
  )
}

export default Daily 