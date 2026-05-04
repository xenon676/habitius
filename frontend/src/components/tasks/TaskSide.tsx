import { PlusIcon, MinusIcon, CheckIcon } from '@phosphor-icons/react'
import type { TaskSideProps } from '../../types/task'

function TaskSide(props: TaskSideProps) {
  const { taskType, color, onTaskAction } = props

  const handleClick = () => {
    if (!onTaskAction) return

    if (taskType === 'habit') {
      // For habits, clicking always triggers completion (positive or negative)
      onTaskAction(props.isPositive ? 'complete-positive' : 'complete-negative')
    } else if (taskType === 'daily' || taskType === 'todo') {
      onTaskAction('complete')
    }
  }

  const stopDrag = (e: React.PointerEvent) => e.stopPropagation()

  if (taskType === 'habit') {
    const { isPositive, isAccepted } = props
    const style = isAccepted ? { backgroundColor: `var(--color-${color})` } : {}
    
    return (
      <div 
        className={`w-1/9 flex items-center justify-center ${isAccepted ? '' : 'bg-main-gray3'} cursor-pointer`} 
        style={style}
        onClick={handleClick}
        onPointerDown={stopDrag}
      >
        <div className="relative w-8 h-8 group">
          {isAccepted ? (
            <>
              <div className="absolute inset-0 bg-black/20 rounded-full group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                {isPositive ? (
                  <PlusIcon className="w-4 h-4 text-white" size={16} weight="bold" />
                ) : (
                  <MinusIcon className="w-4 h-4 text-white" size={16} weight="bold" />
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-1 border-main-gray5 rounded-full flex items-center justify-center">
                {isPositive ? (
                  <PlusIcon className="w-4 h-4 text-main-gray5" size={16} weight="bold" />
                ) : (
                  <MinusIcon className="w-4 h-4 text-main-gray5" size={16} weight="bold" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  } else if (taskType === 'daily') {
    const { isDue, isCompleted } = props
    const isGray = !isDue || isCompleted
    const style = isGray ? {} : { backgroundColor: `var(--color-${color})` }
    
    return (
      <div 
        className={`w-1/9 flex items-center justify-center ${isGray ? 'bg-main-gray5' : ''} cursor-pointer`} 
        style={style}
        onClick={handleClick}
        onPointerDown={stopDrag}
      >
        <div className="relative w-8 h-8 group">
          {isGray ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/30 rounded-sm group-hover:bg-white/60 transition-colors flex items-center justify-center">
                <CheckIcon className={`text-black ${isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} weight="bold" size={16} />
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/30 rounded-sm group-hover:bg-white/60 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <CheckIcon className="text-black" size={16} weight="bold" />
              </div>
            </>
          )}
        </div>
      </div>
    )
  } else {
    const { isCompleted } = props
    const style = isCompleted ? {} : { backgroundColor: `var(--color-${color})` }
    
    return (
      <div 
        className={`w-1/9 flex items-center justify-center ${isCompleted ? 'bg-main-gray5' : ''} cursor-pointer`} 
        style={style}
        onClick={handleClick}
        onPointerDown={stopDrag}
      >
        <div className="relative w-8 h-8 group">
          {isCompleted ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-white/30 rounded-sm group-hover:bg-white/60 transition-colors flex items-center justify-center">
              <CheckIcon className="text-black" opacity={100} transition-opacity weight="bold" size={16} />
              </div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-white/30 rounded-sm group-hover:bg-white/60 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CheckIcon className="text-black" size={16} weight="bold" />
              </div>
            </>
          )}
        </div>
      </div>
    )
  }
}

export default TaskSide 