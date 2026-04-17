import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, Intensity, TaskStatus } from '../types'
import { getNextReviewDate, formatDate } from '../utils/ebbinghaus'

interface TaskStore {
  tasks: Task[]
  dailyLogs: { date: string; count: number }[]
  streak: number

  addTask: (content: string, intensity: Intensity) => void
  deleteTask: (id: string) => void
  checkIn: (id: string) => void
  setIntensity: (id: string, intensity: Intensity) => void
  getTodayTasks: () => Task[]
  getOverdueTasks: () => Task[]
  getAllTasks: () => Task[]
  getMasteredCount: () => number
  getTotalCount: () => number
  getStreak: () => number
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      dailyLogs: [],
      streak: 0,

      addTask: (content, intensity) => {
        const task: Task = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          content,
          intensity,
          status: 'learning',
          createdAt: formatDate(new Date()),
          nextReview: formatDate(new Date()),
          reviewCount: 0,
          lastCheckIn: null,
          reviewHistory: [],
        }
        set((state) => ({ tasks: [...state.tasks, task] }))
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
      },

      checkIn: (id) => {
        set((state) => {
          const today = formatDate(new Date())
          const tasks = state.tasks.map((task) => {
            if (task.id !== id) return task
            const newReviewCount = task.reviewCount + 1
            const nextReview = getNextReviewDate(newReviewCount, task.intensity, today)
            const newStatus: TaskStatus =
              newReviewCount >= (task.intensity === 'high' ? 8 : task.intensity === 'mid' ? 6 : 5)
                ? 'mastered'
                : 'reviewing'
            return {
              ...task,
              reviewCount: newReviewCount,
              status: newStatus,
              nextReview,
              lastCheckIn: today,
              reviewHistory: [
                ...task.reviewHistory,
                { date: today },
              ],
            }
          })

          const dailyLogs = state.dailyLogs.some((l) => l.date === today)
            ? state.dailyLogs.map((l) => l.date === today ? { ...l, count: l.count + 1 } : l)
            : [...state.dailyLogs, { date: today, count: 1 }]

          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = formatDate(yesterday)
          const didYesterday = state.dailyLogs.some((l) => l.date === yesterdayStr && l.count > 0)
          const streak = didYesterday || state.streak === 0
            ? (didYesterday ? state.streak + 1 : 1)
            : state.streak

          return { tasks, dailyLogs, streak }
        })
      },

      setIntensity: (id, intensity) => {
        set((state) => {
          const today = formatDate(new Date())
          const tasks = state.tasks.map((task) => {
            if (task.id !== id) return task
            // If task was overdue or due today, keep it due today after intensity change
            // This preserves "today's" tasks when user intentionally changes schedule
            const wasDueSoon = task.nextReview <= today
            const nextReview = wasDueSoon
              ? today
              : getNextReviewDate(task.reviewCount, intensity, today)
            return { ...task, intensity, nextReview }
          })
          return { tasks }
        })
      },

      getTodayTasks: () => {
        const today = formatDate(new Date())
        return get().tasks.filter((t) => t.status !== 'mastered' && t.nextReview <= today)
      },

      getOverdueTasks: () => {
        const today = formatDate(new Date())
        return get().tasks.filter((t) => t.status !== 'mastered' && t.nextReview < today)
      },

      getAllTasks: () => get().tasks,

      getMasteredCount: () => get().tasks.filter((t) => t.status === 'mastered').length,

      getTotalCount: () => get().tasks.length,

      getStreak: () => get().streak,
    }),
    { name: 'smart-reviewer-storage' }
  )
)
