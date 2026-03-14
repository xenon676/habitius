export type TaskColor = 'habit-weak3' | 'habit-weak2' | 'habit-weak1' | 'habit-neutral' | 'habit-strong1' | 'habit-strong2' | 'habit-strong3'

export interface TaskMenuData {
    id: string
    title: string
    notes?: string
    streak?: number
    positiveStreak?: number
    negativeStreak?: number
    acceptsPositive?: boolean
    acceptsNegative?: boolean
    isDue?: boolean
    isCompleted?: boolean
    checklistItems?: ChecklistItem[]
    rewardAmount?: number
    damageAmount?: number
    repeatInterval?: string
    resetCounterInterval?: string
    taskCounter: number
    everyX?: number
    daysOfWeek?: number[]
    monthlyByDay?: boolean
    createdAt?: Date | string
    dueDate?: Date | string
}

export interface TaskMenuProps {
    isOpen: boolean
    onClose: () => void
    onSave: (updatedTask: any) => void
    onDelete?: () => void
    taskType: 'habit' | 'daily' | 'todo'
    initialData: TaskMenuData
}

export interface TaskSideProps {
    taskType: 'habit' | 'daily' | 'todo'
    color: TaskColor
    onTaskAction?: (action: string) => void
    isPositive?: boolean
    isAccepted?: boolean
    isCompleted?: boolean
    isDue?: boolean
}

export interface ChecklistItem {
    text: string
    completed: boolean
}

export interface TodoData {
    id: string
    title: string
    notes?: string
    checklistItems?: ChecklistItem[]
    rewardAmount: number
    damageAmount: number
    taskCounter: number
    dueDate?: Date
    completionDate?: Date  // Null when incomplete
    createdAt: Date
    position?: number;
}

export interface HabitData {
    id: string
    title: string
    notes?: string
    acceptsPositive: boolean
    acceptsNegative: boolean
    positiveStreak: number
    negativeStreak: number
    rewardAmount: number
    damageAmount: number
    taskCounter: number
    createdAt: Date
    resetCounterInterval: "daily" | "weekly" | "monthly"
    position?: number;
}

export interface DailyData {
    id: string
    title: string
    notes?: string
    streak: number
    checklistItems?: ChecklistItem[]
    rewardAmount: number
    damageAmount: number
    taskCounter: number
    isCompleted: boolean
    isDue: boolean
    repeatInterval: "daily" | "weekly" | "monthly" | "yearly"
    everyX: number
    daysOfWeek: number[]  // [0,1,2,3,4,5,6]
    monthlyByDay: boolean
    createdAt: Date
    position?: number;
}

export const getTaskColor = (taskCounter: number): TaskColor => {
    if (taskCounter < -20) return 'habit-weak3'
    if (taskCounter >= -20 && taskCounter < -10) return 'habit-weak2'
    if (taskCounter >= -10 && taskCounter < -1) return 'habit-weak1'
    if (taskCounter >= -1 && taskCounter <= 1) return 'habit-neutral'
    if (taskCounter > 1 && taskCounter <= 10) return 'habit-strong1'
    if (taskCounter > 10 && taskCounter <= 20) return 'habit-strong2'
    return 'habit-strong3' // taskCounter > 20
}