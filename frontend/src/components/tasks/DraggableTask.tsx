import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HabitData, DailyData, TodoData, getTaskColor } from '../../types/task'
import Habit from './Habit'
import Daily from './Daily'
import ToDo from './ToDo'

interface DraggableTaskProps {
  id: string
  type: 'habit' | 'daily' | 'todo'
  data: HabitData | DailyData | TodoData
  onEdit: () => void
  onRefresh: () => Promise<void>
  onChecklistItemToggle?: (index: number) => void
}

export default function DraggableTask({ id, type, data, onEdit, onRefresh, onChecklistItemToggle }: DraggableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  }

  const renderTask = () => {
    switch (type) {
      case 'habit':
        const habit = data as HabitData
        return (
          <Habit
            id={habit.id}
            acceptsPositive={habit.acceptsPositive}
            acceptsNegative={habit.acceptsNegative}
            color={getTaskColor(habit.taskCounter)}
            title={habit.title}
            notes={habit.notes}
            positiveStreak={habit.positiveStreak}
            negativeStreak={habit.negativeStreak}
            onEdit={onEdit}
            onRefresh={onRefresh}
          />
        )
      case 'daily':
        const daily = data as DailyData
        return (
          <Daily
            id={daily.id}
            isDue={daily.isDue}
            isCompleted={daily.isCompleted}
            color={getTaskColor(daily.taskCounter)}
            title={daily.title}
            notes={daily.notes}
            streak={daily.streak}
            checklistItems={daily.checklistItems}
            onEdit={onEdit}
            onRefresh={onRefresh}
            onChecklistItemToggle={onChecklistItemToggle}
          />
        )
      case 'todo':
        const todo = data as TodoData
        return (
          <ToDo
            id={todo.id}
            color={getTaskColor(todo.taskCounter)}
            title={todo.title}
            notes={todo.notes}
            checklistItems={todo.checklistItems}
            isCompleted={!!todo.completionDate}
            completionDate={todo.completionDate}
            dueDate={todo.dueDate}
            onEdit={onEdit}
            onRefresh={onRefresh}
            onChecklistItemToggle={onChecklistItemToggle}
          />
        )
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {renderTask()}
    </div>
  )
} 