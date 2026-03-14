import { useState, useEffect, useRef } from 'react'
import { 
  PlusIcon,
  MinusIcon,
  StarIcon,
  TrashIcon,
  CheckIcon,
  CaretUpIcon
} from '@phosphor-icons/react'
import { getTaskColor, TaskMenuProps, ChecklistItem } from '../../types/task'
import Dropdown from '../ui/Dropdown'

// Helper functions for date formatting
function getWeekOrdinal(date?: Date | string) {
  const d = date ? new Date(date) : new Date()
  const weekNum = Math.ceil(d.getDate() / 7)
  const ordinals = ['first', 'second', 'third', 'fourth', 'fifth']
  return ordinals[weekNum - 1] || 'last'
}

function getWeekday(date?: Date | string) {
  const d = date ? new Date(date) : new Date()
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()]
}

function getIntervalUnit(interval: string, count: number) {
  const units = {
    daily: ['day', 'days'],
    weekly: ['week', 'weeks'],
    monthly: ['month', 'months'],
    yearly: ['year', 'years']
  }
  const [singular, plural] = units[interval as keyof typeof units]
  return count === 1 ? singular : plural
}

function TaskMenu({ isOpen, onClose, onSave, onDelete, taskType, initialData }: TaskMenuProps) {
  const [title, setTitle] = useState(initialData.title)
  const [notes, setNotes] = useState(initialData.notes || '')
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(initialData.checklistItems || [])
  const [acceptsPositive, setAcceptsPositive] = useState(initialData.acceptsPositive ?? true)
  const [acceptsNegative, setAcceptsNegative] = useState(initialData.acceptsNegative ?? true)
  const [rewardAmount, setRewardAmount] = useState(initialData.rewardAmount || 3)
  const [damageAmount, setDamageAmount] = useState(initialData.damageAmount || 3)
  const [repeatInterval, setRepeatInterval] = useState(initialData.repeatInterval || 'daily')
  const [resetCounterInterval, setResetCounterInterval] = useState(initialData.resetCounterInterval || 'daily')
  const [everyX, setEveryX] = useState(initialData.everyX || 1)
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initialData.daysOfWeek || [0,1,2,3,4,5,6])
  const [monthlyByDay, setMonthlyByDay] = useState(initialData.monthlyByDay ?? true)
  const [isChecklistOpen, setIsChecklistOpen] = useState(true)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemText, setNewItemText] = useState('')
  const newItemInputRef = useRef<HTMLInputElement>(null)
  const [dueDate, setDueDate] = useState<string>(
    initialData.dueDate 
      ? new Date(initialData.dueDate).toISOString().split('T')[0]
      : ''
  )

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData.title)
      setNotes(initialData.notes || '')
      setChecklistItems(initialData.checklistItems || [])
      setAcceptsPositive(initialData.acceptsPositive ?? true)
      setAcceptsNegative(initialData.acceptsNegative ?? true)
      setRewardAmount(initialData.rewardAmount || 3)
      setDamageAmount(initialData.damageAmount || 3)
      setRepeatInterval(initialData.repeatInterval || 'daily')
      setResetCounterInterval(initialData.resetCounterInterval || 'daily')
      setDueDate(initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '')
    }
  }, [isOpen, initialData])

  const handleSave = () => {
    const updatedTask = {
      ...initialData,
      title,
      notes: notes ?? undefined,
      checklistItems: checklistItems.length > 0 ? checklistItems : undefined,
      acceptsPositive,
      acceptsNegative,
      rewardAmount,
      damageAmount,
      repeatInterval,
      resetCounterInterval,
      everyX,
      daysOfWeek,
      monthlyByDay,
      dueDate: dueDate ? new Date(dueDate) : undefined
    }
    onSave(updatedTask)
    onClose()
  }

  const handleNewItemClick = () => {
    setIsAddingItem(true)
    setNewItemText('')
    // Focus the input on next render
    setTimeout(() => {
      newItemInputRef.current?.focus()
    }, 0)
  }

  const handleNewItemSubmit = () => {
    if (newItemText.trim()) {
      setChecklistItems([...checklistItems, { text: newItemText.trim(), completed: false }])
    }
    setIsAddingItem(false)
    setNewItemText('')
  }

  const handleNewItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNewItemSubmit()
    } else if (e.key === 'Escape') {
      setIsAddingItem(false)
      setNewItemText('')
    }
  }

  const removeChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  const updateChecklistItem = (index: number, text: string) => {
    const newItems = [...checklistItems]
    newItems[index].text = text
    setChecklistItems(newItems)
  }

  const toggleChecklistItem = (index: number) => {
    const newItems = [...checklistItems]
    newItems[index].completed = !newItems[index].completed
    setChecklistItems(newItems)
  }

  if (!isOpen) return null

  const getHeaderText = () => {
    switch (taskType) {
      case 'habit': return 'Edit Habit'
      case 'daily': return 'Edit Daily'
      case 'todo': return 'Edit To Do'
      default: return 'Edit Task'
    }
  }

  const taskColor = getTaskColor(initialData.taskCounter)
  const isGray = taskType === 'daily' && (initialData.isDue === false || initialData.isCompleted)
  const headerStyle = isGray ? { backgroundColor: 'var(--color-main-gray6)' } : { backgroundColor: `var(--color-${taskColor})` }
  
  // Determine if we need light text on dark background
  const isDarkBackground = isGray || ['habit-weak3', 'habit-strong3'].includes(taskColor)
  const textColor = isDarkBackground ? 'text-main-white' : 'text-main-gray7'

  // Check if save should be disabled (for habits that don't accept either action)
  const isSaveDisabled = taskType === 'habit' && !acceptsPositive && !acceptsNegative

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-main-white rounded-lg shadow-lg w-full max-w-md min-h-[700px] mx-4 max-h-[90vh] overflow-y-auto text-[0.95rem]">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b border-main-gray3"
          style={headerStyle}
        >
          <h2 className={`text-lg font-medium ${textColor}`}>{getHeaderText()}</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className={`hover:underline underline-offset-2 transition-colors cursor-pointer ${textColor}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaveDisabled}
              className={`px-4 py-2 rounded-sm shadow shadow-main-black/50 transition-all duration-300 ease-in-out font-medium ${
                isSaveDisabled 
                  ? 'bg-main-gray4 text-main-gray6 cursor-not-allowed' 
                  : 'bg-main-white text-main-gray7 hover:shadow-lg hover:shadow-main-black/50 cursor-pointer'
              }`}
            >
              Save
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-main-gray7 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-main-gray3 rounded-sm focus:outline-none focus:ring-2 focus:ring-main-gray3"
              placeholder="Enter task title"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-main-gray7 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-main-gray3 rounded-sm focus:outline-none focus:ring-2 focus:ring-main-gray3 resize-none"
              placeholder="Enter notes (optional)"
            />
          </div>

          {/* +/- Buttons (for habits) */}
          {taskType === 'habit' && (
            <div>
              <div className="flex justify-center gap-8">
                {/* Positive Action */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setAcceptsPositive(!acceptsPositive)}
                    className="relative w-8 h-8 group cursor-pointer"
                  >
                    {acceptsPositive ? (
                      <>
                        <div className="absolute inset-0 bg-black/20 rounded-full group-hover:bg-black/40 transition-colors" style={{ backgroundColor: `var(--color-${taskColor})` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PlusIcon className="text-white" size={16} weight="bold" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-1 border-main-gray5 rounded-full flex items-center justify-center">
                          <PlusIcon className="text-main-gray5" size={16} weight="bold" />
                        </div>
                      </div>
                    )}
                  </button>
                  <span className={`text-xs ${acceptsPositive ? `text-${taskColor}` : 'text-main-gray5'}`}>
                    Positive
                  </span>
                </div>

                {/* Negative Action */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setAcceptsNegative(!acceptsNegative)}
                    className="relative w-8 h-8 group cursor-pointer"
                  >
                    {acceptsNegative ? (
                      <>
                        <div className="absolute inset-0 bg-black/20 rounded-full group-hover:bg-black/40 transition-colors" style={{ backgroundColor: `var(--color-${taskColor})` }} />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <MinusIcon className="text-white" size={16} weight="bold" />
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-1 border-main-gray5 rounded-full flex items-center justify-center">
                          <MinusIcon className="text-main-gray5" size={16} weight="bold" />
                        </div>
                      </div>
                    )}
                  </button>
                  <span className={`text-xs ${acceptsNegative ? `text-${taskColor}` : 'text-main-gray5'}`}>
                    Negative
                  </span>
                </div>
              </div>
              
              {/* Hint text when both actions are disabled */}
              {isSaveDisabled && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-habit-weak3 font-medium">
                    Enable at least one action to save
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reward and Damage Amounts Side by Side */}
          {taskType === 'habit' ? (
            <div className={`grid ${acceptsPositive && acceptsNegative ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
              {/* Reward Amount - Only show if positive is accepted */}
              {acceptsPositive && (
                <div className={!acceptsNegative ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-main-gray7 mb-2 text-center">Reward Amount</label>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setRewardAmount(amount)}
                        style={{ color: rewardAmount >= amount ? `var(--color-${taskColor})` : 'var(--color-main-gray4)' }}
                        className="p-1 rounded-sm transition-colors cursor-pointer"
                      >
                        {rewardAmount >= amount ? (
                          <StarIcon className="w-5 h-5" weight="fill" />
                        ) : (
                          <StarIcon className="w-5 h-5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Damage Amount - Only show if negative is accepted */}
              {acceptsNegative && (
                <div className={!acceptsPositive ? 'col-span-2' : ''}>
                  <label className="block text-sm font-medium text-main-gray7 mb-2 text-center">Damage Amount</label>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDamageAmount(amount)}
                        style={{ color: damageAmount >= amount ? `var(--color-${taskColor})` : 'var(--color-main-gray4)' }}
                        className="p-1 rounded-sm transition-colors cursor-pointer"
                      >
                        {damageAmount >= amount ? (
                          <StarIcon className="w-5 h-5" weight="fill" />
                        ) : (
                          <StarIcon className="w-5 h-5" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* Regular reward/damage display for non-habits */}
              <div>
                <label className="block text-sm font-medium text-main-gray7 mb-2 text-center">Reward Amount</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setRewardAmount(amount)}
                      className={`p-1 rounded-sm transition-colors cursor-pointer ${
                        rewardAmount >= amount ? `text-${taskColor}` : 'text-main-gray4'
                      }`}
                    >
                      {rewardAmount >= amount ? (
                        <StarIcon className="w-5 h-5" weight="fill" />
                      ) : (
                        <StarIcon className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-main-gray7 mb-2 text-center">Damage Amount</label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDamageAmount(amount)}
                      className={`p-1 rounded-sm transition-colors cursor-pointer ${
                        damageAmount >= amount ? `text-${taskColor}` : 'text-main-gray4'
                      }`}
                    >
                      {damageAmount >= amount ? (
                        <StarIcon className="w-5 h-5" weight="fill" />
                      ) : (
                        <StarIcon className="w-5 h-5" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reset Counter (for habits) */}
          {taskType === 'habit' && (
            <div>
              <label className="block text-sm font-medium text-main-gray7 mb-2">Reset Counter</label>
              <Dropdown
                value={resetCounterInterval}
                onChange={setResetCounterInterval}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                ]}
              />
            </div>
          )}

          {/* Repeat Interval (for dailies) */}
          {taskType === 'daily' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-main-gray7 mb-2">Repeat Interval</label>
                <Dropdown
                  value={repeatInterval}
                  onChange={setRepeatInterval}
                  options={[
                    { value: 'daily', label: 'Daily' },
                    { value: 'weekly', label: 'Weekly' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'yearly', label: 'Yearly' },
                  ]}
                />
              </div>

              {/* Every X input for all intervals */}
              <div>
                <label className="block text-sm font-medium text-main-gray7 mb-2">
                  Repeat Every
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={everyX}
                    onChange={(e) => setEveryX(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 px-3 py-2 border border-main-gray3 rounded-sm focus:outline-none focus:ring-2 focus:ring-main-gray3"
                  />
                  <span className="text-main-gray6">
                    {getIntervalUnit(repeatInterval, everyX)}
                  </span>
                </div>
              </div>

              {/* Weekly specific options */}
              {repeatInterval === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-main-gray7 mb-2">On These Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <button
                        key={day}
                        onClick={() => {
                          const newDays = daysOfWeek.includes(index)
                            ? daysOfWeek.filter(d => d !== index)
                            : [...daysOfWeek, index].sort()
                          setDaysOfWeek(newDays)
                        }}
                        className={`px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
                          daysOfWeek.includes(index)
                            ? 'bg-main-teal1 text-main-white'
                            : 'bg-main-gray2 text-main-gray6 hover:bg-main-gray3'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-main-gray6">
                    {`Repeats every ${everyX} ${getIntervalUnit(repeatInterval, everyX)} on the selected days`}
                  </div>
                </div>
              )}

              {/* Monthly specific options */}
              {repeatInterval === 'monthly' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-main-gray7 mb-2">Repeat By</label>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setMonthlyByDay(true)}
                        className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                          monthlyByDay
                            ? 'bg-main-teal1 text-main-white'
                            : 'bg-main-gray2 text-main-gray6 hover:bg-main-gray3'
                        }`}
                      >
                        Day of Month
                      </button>
                      <button
                        onClick={() => setMonthlyByDay(false)}
                        className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
                          !monthlyByDay
                            ? 'bg-main-teal1 text-main-white'
                            : 'bg-main-gray2 text-main-gray6 hover:bg-main-gray3'
                        }`}
                      >
                        Day of Week
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-main-gray6">
                    {monthlyByDay
                      ? `Repeats every ${everyX} ${getIntervalUnit(repeatInterval, everyX)} on day ${initialData.createdAt ? new Date(initialData.createdAt).getDate() : new Date().getDate()}`
                      : `Repeats every ${everyX} ${getIntervalUnit(repeatInterval, everyX)} on the ${getWeekOrdinal(initialData.createdAt)} ${getWeekday(initialData.createdAt)}`
                    }
                  </div>
                </div>
              )}

              {/* Yearly specific options */}
              {repeatInterval === 'yearly' && (
                <div className="text-sm text-main-gray6">
                  {`Repeats every ${everyX} ${getIntervalUnit(repeatInterval, everyX)} on ${initialData.createdAt 
                    ? new Date(initialData.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
                    : new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })
                  }`}
                </div>
              )}
            </div>
          )}

          {/* Due Date (for todos) */}
          {taskType === 'todo' && (
            <div>
              <label className="block text-sm font-medium text-main-gray7 mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-main-gray3 rounded-sm focus:outline-none focus:ring-2 focus:ring-main-gray3"
              />
            </div>
          )}

          {/* Checklist (for dailies and todos) */}
          {(taskType === 'daily' || taskType === 'todo') && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-main-gray7">Checklist</label>
                <button
                  onClick={() => setIsChecklistOpen(!isChecklistOpen)}
                  className="text-main-gray4 hover:text-main-gray6 transition-colors cursor-pointer"
                >
                  <CaretUpIcon className={`w-5 h-5 transform transition-transform ${isChecklistOpen ? '' : 'rotate-180'}`} />
                </button>
              </div>
              {isChecklistOpen && (
                <div className="space-y-0">
                {checklistItems.map((item, index) => (
                    <div key={index} className="group relative border-b border-main-gray3">
                      <div className="flex items-center gap-2 py-1.5">
                        <div 
                          onClick={() => toggleChecklistItem(index)}
                          className={`w-4 h-4 border rounded-sm ${item.completed ? 'bg-main-gray7' : 'bg-main-white'} flex items-center justify-center cursor-pointer`}
                        >
                          {item.completed && <CheckIcon className="text-white" size={12} weight="bold" />}
                        </div>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                          className="flex-1 text-sm focus:outline-none text-main-gray7"
                      placeholder="Checklist item"
                    />
                    <button
                      onClick={() => removeChecklistItem(index)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                          <TrashIcon className="text-main-gray4 hover:text-habit-weak3" size={16} weight="bold" />
                    </button>
                      </div>
                    </div>
                  ))}
                  <div 
                    className="group relative border-b border-main-gray3 last:border-b-0 hover:bg-main-gray1"
                    onClick={!isAddingItem ? handleNewItemClick : undefined}
                  >
                    <div className="flex items-center gap-2 py-1.5">
                      <div className="w-4 h-4 flex items-center justify-center cursor-default">
                        <PlusIcon className="w-4 h-4 text-main-gray4" />
                      </div>
                      {isAddingItem ? (
                        <input
                          ref={newItemInputRef}
                          type="text"
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={handleNewItemKeyDown}
                          onBlur={handleNewItemSubmit}
                          className="flex-1 text-sm focus:outline-none text-main-gray7 bg-transparent cursor-text placeholder:text-main-gray4"
                          placeholder="New checklist item"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm text-main-gray4 cursor-text">New checklist item</span>
                      )}
                    </div>
                  </div>
              </div>
              )}
            </div>
          )}

          {/* Delete Section */}
          <div className="flex items-center justify-center mt-8">
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 text-habit-weak3 hover:text-habit-weak2 transition-colors cursor-pointer group"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete this {taskType === 'habit' ? 'Habit' : taskType === 'daily' ? 'Daily' : 'To Do'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskMenu 