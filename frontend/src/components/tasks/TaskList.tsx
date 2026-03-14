import { useState, useEffect, useRef } from 'react'
import TaskMenu from './TaskMenu'
import { ArrowCounterClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import { HabitData, DailyData, TodoData } from '../../types/task'
import * as tasksApi from '../../api/tasksApi'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import DraggableTask from './DraggableTask'

function TaskList() {
  // State for task data
  const [habits, setHabits] = useState<HabitData[]>([])
  const [dailies, setDailies] = useState<DailyData[]>([])
  const [todos, setTodos] = useState<TodoData[]>([])
  const [todoView, setTodoView] = useState<'active' | 'completed'>('active')

  // Use the helper functions to get counts
  const [dailiesIncompleteCount, setDailiesIncompleteCount] = useState(0)
  const [todosIncompleteCount, setTodosIncompleteCount] = useState(0)

  // Edit menu state
  const [isEditMenuOpen, setIsEditMenuOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<{
    type: 'habit' | 'daily' | 'todo'
    data: HabitData | DailyData | TodoData
  } | null>(null)

  // Add Task dropdown state
  const [isAddTaskDropdownOpen, setIsAddTaskDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAddTaskDropdownOpen(false)
      }
    }

    if (isAddTaskDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAddTaskDropdownOpen])

  // Fetch todos and habits on component mount
  useEffect(() => {
    fetchHabits()
    fetchDailies()
    fetchTodos()
  }, [])

  const fetchHabits = async () => {
    try {
      const data = await tasksApi.getHabits()
      setHabits(data)
    } catch (err) {
      console.error('Error fetching habits:', err)
    }
  }

  const fetchDailies = async () => {
    try {
      const data = await tasksApi.getDailies()
      setDailies(data)
      setDailiesIncompleteCount(data.filter(daily => !daily.isCompleted && daily.isDue).length)
    } catch (err) {
      console.error('Error fetching dailies:', err)
    }
  }

  const fetchTodos = async () => {
    try {
      const data = await tasksApi.getTodos()
      setTodos(data)
      setTodosIncompleteCount(data.filter(todo => !todo.completionDate).length)
    } catch (err) {
      console.error('Error fetching todos:', err)
    }
  }

  // Update counts when data changes
  useEffect(() => {
    setDailiesIncompleteCount(dailies.filter(daily => !daily.isCompleted && daily.isDue).length)
    setTodosIncompleteCount(todos.filter(todo => !todo.completionDate).length)
  }, [dailies, todos])

  const buttonClass = "bg-main-teal1 text-main-white px-4 py-1 rounded-sm flex items-center gap-1 shadow shadow-main-black/50 hover:shadow-lg hover:shadow-main-black/50 transition-all duration-300 ease-in-out cursor-pointer"
  const badgeClass = "bg-main-teal1 rounded-full w-5 h-5 flex items-center justify-center"
  const columnClass = "flex flex-col h-full"
  const contentClass = "bg-main-gray2 rounded-sm p-1 flex-1"

  const handleEditTask = (taskType: 'habit' | 'daily' | 'todo', task?: HabitData | DailyData | TodoData) => {
    if (taskType === 'habit') {
      const defaultHabit: Partial<HabitData> = {
        title: '',
        notes: '',
        acceptsPositive: true,
        acceptsNegative: true,
        positiveStreak: 0,
        negativeStreak: 0,
        taskCounter: 0,
        rewardAmount: 3,
        damageAmount: 3
      }
      setEditingTask({ type: taskType, data: task || defaultHabit as HabitData })
    } else {
      setEditingTask(task ? { type: taskType, data: task } : null)
    }
    setIsEditMenuOpen(true)
  }

  const handleSaveTask = async (updatedTask: any) => {
    if (editingTask) {
      try {
        if (editingTask.type === 'daily') {
          if (updatedTask.id) {
            // Update existing daily
            const updated = await tasksApi.updateDaily(updatedTask.id, updatedTask)
            setDailies(dailies.map(d => d.id === updated.id ? updated : d))
          } else {
            // Create new daily
            const created = await tasksApi.createDaily(updatedTask)
            setDailies([...dailies, created])
          }
        } else if (editingTask.type === 'todo') {
          if (updatedTask.id) {
            // Update existing todo
            const updated = await tasksApi.updateTodo(updatedTask.id, updatedTask)
            setTodos(todos.map(t => t.id === updated.id ? updated : t))
          } else {
            // Create new todo
            const created = await tasksApi.createTodo(updatedTask)
            setTodos([...todos, created])
          }
        } else if (editingTask.type === 'habit') {
          if (updatedTask.id) {
            // Update existing habit
            const updated = await tasksApi.updateHabit(updatedTask.id, updatedTask)
            setHabits(habits.map(h => h.id === updated.id ? updated : h))
          } else {
            // Create new habit
            const created = await tasksApi.createHabit(updatedTask)
            setHabits([...habits, created])
          }
        }
      } catch (err) {
        console.error('Error saving task:', err)
      }
    }
    setIsEditMenuOpen(false)
    setEditingTask(null)
  }

  const handleCloseEditMenu = () => {
    setIsEditMenuOpen(false)
    setEditingTask(null)
  }

  const handleDeleteTask = async () => {
    if (editingTask) {
      try {
        if (editingTask.type === 'todo' && 'id' in editingTask.data) {
          await tasksApi.deleteTodo(editingTask.data.id)
          setTodos(todos.filter(t => t.id !== editingTask.data.id))
        } else if (editingTask.type === 'habit' && 'id' in editingTask.data) {
          await tasksApi.deleteHabit(editingTask.data.id)
          setHabits(habits.filter(h => h.id !== editingTask.data.id))
        } else if (editingTask.type === 'daily' && 'id' in editingTask.data) {
          await tasksApi.deleteDaily(editingTask.data.id)
          setDailies(dailies.filter(d => d.id !== editingTask.data.id))
        }
        setIsEditMenuOpen(false)
        setEditingTask(null)
      } catch (err) {
        console.error('Error deleting task:', err)
      }
    }
  }

  const handleAddTask = (taskType: 'habit' | 'daily' | 'todo') => {
    // Create empty task data based on type
    const baseTask: Partial<HabitData | DailyData | TodoData> = {
      title: '',
      notes: '',
      taskCounter: 0,
      rewardAmount: 3,
      damageAmount: 3
    }

    let emptyTask: Partial<HabitData | DailyData | TodoData>;

    if (taskType === 'habit') {
      emptyTask = {
        ...baseTask,
        acceptsPositive: true,
        acceptsNegative: true,
        positiveStreak: 0,
        negativeStreak: 0
      }
    } else if (taskType === 'daily') {
      emptyTask = {
        ...baseTask,
        streak: 0,
        isCompleted: false,
        isDue: true,
        repeatInterval: "daily",
        everyX: 1,
        daysOfWeek: [0,1,2,3,4,5,6],
        monthlyByDay: true
      }
    } else {
      emptyTask = {
        ...baseTask,
        checklistItems: []
      }
    }

    setEditingTask({ type: taskType, data: emptyTask as HabitData | DailyData | TodoData })
    setIsEditMenuOpen(true)
    setIsAddTaskDropdownOpen(false)
  }

  const toggleAddTaskDropdown = () => {
    setIsAddTaskDropdownOpen(!isAddTaskDropdownOpen)
  }

  const handleChecklistItemToggle = (taskId: string, taskType: 'daily' | 'todo', index: number) => {
    if (taskType === 'daily') {
      const daily = dailies.find(d => d.id === taskId)
      if (!daily || !daily.checklistItems) return

      const updatedDaily = { ...daily }
      updatedDaily.checklistItems = [...daily.checklistItems]
      updatedDaily.checklistItems[index].completed = !updatedDaily.checklistItems[index].completed

      const dailyIndex = dailies.findIndex(d => d.id === taskId)
      if (dailyIndex !== -1) {
        const newDailies = [...dailies]
        newDailies[dailyIndex] = updatedDaily
        setDailies(newDailies)
      }
    } else if (taskType === 'todo') {
      const todo = todos.find(t => t.id === taskId)
      if (!todo || !todo.checklistItems) return

      const updatedTodo = { ...todo }
      updatedTodo.checklistItems = [...todo.checklistItems]
      updatedTodo.checklistItems[index].completed = !updatedTodo.checklistItems[index].completed

      tasksApi.updateTodo(taskId, updatedTodo)
        .then(updated => {
          setTodos(todos.map(t => t.id === taskId ? updated : t))
        })
        .catch(err => {
          console.error('Error updating todo checklist:', err)
        })
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the task type and array
    let taskArray: HabitData[] | DailyData[] | TodoData[]
    let updatePosition: (id: string, position: number) => Promise<any>
    let setTaskArray: React.Dispatch<React.SetStateAction<any[]>>

    if (habits.some(h => h.id === activeId)) {
      taskArray = habits
      updatePosition = tasksApi.updateHabitPosition
      setTaskArray = setHabits
    } else if (dailies.some(d => d.id === activeId)) {
      taskArray = dailies
      updatePosition = tasksApi.updateDailyPosition
      setTaskArray = setDailies
    } else {
      taskArray = todos
      updatePosition = tasksApi.updateTodoPosition
      setTaskArray = setTodos
    }

    const oldIndex = taskArray.findIndex(t => t.id === activeId)
    const newIndex = taskArray.findIndex(t => t.id === overId)

    // Update local state
    const newArray = [...taskArray]
    const [movedItem] = newArray.splice(oldIndex, 1)
    newArray.splice(newIndex, 0, movedItem)

    // Update positions
    const updatedArray = newArray.map((item, index) => ({
      ...item,
      position: index
    }))
    setTaskArray(updatedArray)

    // Update backend
    try {
      await updatePosition(activeId, newIndex)
    } catch (err) {
      console.error('Error updating task position:', err)
      // Revert on error
      setTaskArray(taskArray)
    }
  }

  return (
    <div className="h-full w-full p-4">
      <div className="flex justify-end gap-2 mb-4">
        <button className={buttonClass}>
          <ArrowCounterClockwiseIcon size={16} weight="bold" />
          <span className="text-sm font-medium">Undo</span>
        </button>
        <div className="relative" ref={dropdownRef}>
          <button 
            className={buttonClass}
            onClick={toggleAddTaskDropdown}
          >
            <PlusIcon size={16} weight="bold" />
            <span className="text-sm font-medium">Add Task</span>
          </button>
          
          {/* Add Task Dropdown */}
          {isAddTaskDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 bg-main-white rounded-sm shadow-lg shadow-main-black/50 border border-main-gray3 z-30 min-w-[120px]">
              <button
                className="w-full px-4 py-2 text-left text-sm text-main-gray6 hover:bg-main-gray2 hover:text-main-teal1 transition-colors cursor-pointer"
                onClick={() => handleAddTask('habit')}
              >
                Habit
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-main-gray6 hover:bg-main-gray2 hover:text-main-teal1 transition-colors cursor-pointer"
                onClick={() => handleAddTask('daily')}
              >
                Daily
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-main-gray6 hover:bg-main-gray2 hover:text-main-teal1 transition-colors cursor-pointer"
                onClick={() => handleAddTask('todo')}
              >
                To Do
              </button>
            </div>
          )}
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-3 gap-4 h-full">
          {/* Habits Column */}
          <div className={columnClass}>
            <h2 className="text-xl font-medium mb-1">Habits</h2>
            <div className={contentClass}>
              <SortableContext
                items={habits.map(h => h.id)}
                strategy={verticalListSortingStrategy}
              >
                {habits.map((habit) => (
                  <DraggableTask
                    key={habit.id}
                    id={habit.id}
                    type="habit"
                    data={habit}
                    onEdit={() => handleEditTask('habit', habit)}
                    onRefresh={fetchHabits}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          {/* Dailies Column */}
          <div className={columnClass}>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-medium">Dailies</h2>
              <div className={badgeClass}>
                <span className="text-main-white text-xs">{dailiesIncompleteCount}</span>
              </div>
            </div>
            <div className={contentClass}>
              <SortableContext
                items={dailies.map(d => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {dailies.map((daily) => (
                  <DraggableTask
                    key={daily.id}
                    id={daily.id}
                    type="daily"
                    data={daily}
                    onEdit={() => handleEditTask('daily', daily)}
                    onRefresh={fetchDailies}
                    onChecklistItemToggle={(index) => handleChecklistItemToggle(daily.id, 'daily', index)}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          {/* To Do's Column */}
          <div className={columnClass}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-medium">To Do's</h2>
                {todoView === 'active' && (
                  <div className={badgeClass}>
                    <span className="text-main-white text-xs">{todosIncompleteCount}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setTodoView('active')}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    todoView === 'active'
                      ? 'text-main-teal1 underline decoration-2 underline-offset-10'
                      : 'text-main-gray6 hover:text-main-teal1'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setTodoView('completed')}
                  className={`text-sm font-medium transition-colors cursor-pointer ${
                    todoView === 'completed'
                      ? 'text-main-teal1 underline decoration-2 underline-offset-10'
                      : 'text-main-gray6 hover:text-main-teal1'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
            <div className={contentClass}>
              <SortableContext
                items={todos
                  .filter(todo => todoView === 'active' ? !todo.completionDate : todo.completionDate)
                  .map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {todos
                  .filter(todo => todoView === 'active' ? !todo.completionDate : todo.completionDate)
                  .map((todo) => (
                    <DraggableTask
                      key={todo.id}
                      id={todo.id}
                      type="todo"
                      data={todo}
                      onEdit={() => handleEditTask('todo', todo)}
                      onRefresh={fetchTodos}
                      onChecklistItemToggle={(index) => handleChecklistItemToggle(todo.id, 'todo', index)}
                    />
                  ))}
              </SortableContext>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Edit Task Menu */}
      {isEditMenuOpen && editingTask && (
        <TaskMenu
          isOpen={isEditMenuOpen}
          onClose={handleCloseEditMenu}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          taskType={editingTask.type}
          initialData={editingTask.data}
        />
      )}
    </div>
  )
}

export default TaskList 