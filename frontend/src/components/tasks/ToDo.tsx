import TaskSide from './TaskSide'
import TaskDetails from './TaskDetails'
import { completeTodo } from '../../api/tasksApi'
import { useAuth } from '../../contexts/AuthContext'
import type { TaskColor } from '../../types/task'
import { CalendarIcon } from '@phosphor-icons/react'

interface ToDoProps {
  id: string
  color: TaskColor
  title: string
  notes?: string
  streak?: number
  checklistItems?: {
    text: string
    completed: boolean
  }[]
  isCompleted: boolean
  completionDate?: Date
  dueDate?: Date
  onEdit?: () => void
  onRefresh?: () => Promise<void>
  onChecklistItemToggle?: (index: number) => void
}

function ToDo({ id, color, title, notes, streak, checklistItems, isCompleted, dueDate, onEdit, onRefresh, onChecklistItemToggle }: ToDoProps) {
  const { refreshStats } = useAuth();

  const handleTaskAction = async () => {
    try {
      await completeTodo(id);
      await refreshStats();
      if (onRefresh) { await onRefresh(); }
    } catch (error) {
      console.error('Failed to complete todo:', error);
    }
  };

  const formatDueDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dueDate = new Date(date)
    
    // Remove time component for comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    dueDate.setHours(0, 0, 0, 0)
    
    if (dueDate.getTime() === today.getTime()) return 'Today'
    if (dueDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
    return dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <div className={`relative flex w-full min-h-24 bg-main-white rounded-lg overflow-hidden shadow-sm shadow-main-gray3 mb-[1px] hover:shadow-lg hover:shadow-main-black/50 hover:z-20 transition-all duration-300 ease-in-out cursor-pointer ${isCompleted ? 'opacity-70' : ''}`}>
      <TaskSide 
        taskType="todo" 
        color={color}
        isCompleted={isCompleted}
        onTaskAction={handleTaskAction}
      />
      <TaskDetails 
        title={title} 
        notes={notes} 
        streak={streak} 
        taskType="todo"
        checklistItems={checklistItems}
        onEdit={onEdit}
        onChecklistItemToggle={onChecklistItemToggle}
      />
      {dueDate && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-main-gray5">
          <CalendarIcon size={14} />
          <span>{formatDueDate(dueDate)}</span>
        </div>
      )}
    </div>
  )
}

export default ToDo 