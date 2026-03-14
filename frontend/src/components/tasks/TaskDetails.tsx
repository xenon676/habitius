import { FireIcon, CheckIcon } from '@phosphor-icons/react'

type TaskType = 'habit' | 'daily' | 'todo'

interface BaseTaskContentProps {
  title: string
  notes?: string
  streak?: number
  taskType: TaskType
  onEdit?: () => void
  onChecklistItemToggle?: (index: number) => void
}

interface HabitTaskContentProps extends BaseTaskContentProps {
  taskType: 'habit'
  positiveStreak?: number
  negativeStreak?: number
  acceptsPositive?: boolean
  acceptsNegative?: boolean
}

interface DailyTaskContentProps extends BaseTaskContentProps {
  taskType: 'daily'
  checklistItems?: {
    text: string
    completed: boolean
  }[]
}

interface TodoTaskContentProps extends BaseTaskContentProps {
  taskType: 'todo'
  checklistItems?: {
    text: string
    completed: boolean
  }[]
}

type TaskContentProps = HabitTaskContentProps | DailyTaskContentProps | TodoTaskContentProps

function TaskContent({ title, notes, streak = 0, taskType, onEdit, onChecklistItemToggle, ...props }: TaskContentProps) {
  return (
    <div 
      className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto relative cursor-pointer"
      onClick={onEdit}
    >
      {/* Title */}
      <h3 className="text-base font-medium text-main-gray7">{title}</h3>
      
      {/* Notes Section */}
      {notes && (
        <div className="flex-1">
          <p className="text-xs text-main-gray6 whitespace-pre-wrap leading-tight pr-16">{notes}</p>
        </div>
      )}

      {/* Checklist Items (only for non-habit tasks) */}
      {taskType !== 'habit' && 'checklistItems' in props && props.checklistItems && (
        <div className="mt-2 space-y-1" onClick={(e) => e.stopPropagation()}>
          {props.checklistItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2 hover:bg-main-gray2 rounded-sm px-1 py-0.5 transition-colors">
              <div 
                className={`w-4 h-4 border rounded-sm ${item.completed ? 'bg-main-gray7' : 'bg-main-white'} flex items-center justify-center cursor-pointer`}
                onClick={() => onChecklistItemToggle?.(index)}
              >
                {item.completed && <CheckIcon className="text-white" size={12} weight="bold" />}
              </div>
              <span className="text-xs text-main-gray6">{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Streak Counter */}
      {taskType !== 'todo' && (
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5">
          <FireIcon className="text-main-gray5" size={16} weight="fill" />
          {taskType === 'habit' && 'positiveStreak' in props && 'negativeStreak' in props && 'acceptsPositive' in props && 'acceptsNegative' in props ? (
            // Habit with separate positive/negative streaks
            <span className="text-xs text-main-gray5">
              {props.acceptsPositive && props.acceptsNegative ? (
                `${props.positiveStreak || 0} | ${props.negativeStreak || 0}`
              ) : props.acceptsPositive ? (
                `${props.positiveStreak || 0}`
              ) : props.acceptsNegative ? (
                `${props.negativeStreak || 0}`
              ) : (
                '0'
              )}
            </span>
          ) : (
            // Daily with single streak
            <span className="text-xs text-main-gray5">{streak}</span>
          )}
        </div>
      )}
    </div>
  )
}

export default TaskContent 