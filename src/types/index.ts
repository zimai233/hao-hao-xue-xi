export type Intensity = 'high' | 'mid' | 'low'
export type TaskStatus = 'learning' | 'reviewing' | 'mastered'

export interface ReviewEntry {
  date: string // YYYY-MM-DD
}

export interface Task {
  id: string
  content: string
  intensity: Intensity
  status: TaskStatus
  createdAt: string // YYYY-MM-DD
  nextReview: string // YYYY-MM-DD
  reviewCount: number
  lastCheckIn: string | null // YYYY-MM-DD
  reviewHistory: ReviewEntry[]
}
