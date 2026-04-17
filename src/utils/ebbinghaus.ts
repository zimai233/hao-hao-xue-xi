import type { Intensity } from '../types'

// 艾宾浩斯间隔因子
const K: Record<Intensity, number> = {
  high: 2.5,
  mid: 2.0,
  low: 1.5,
}

// 基础间隔序列（天）
const BASE: Record<Intensity, number[]> = {
  high: [1, 3, 7, 14, 30, 60],
  mid: [1, 2, 4, 7, 14, 30],
  low: [1, 1, 2, 4, 7, 14],
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function isToday(dateStr: string): boolean {
  return dateStr === formatDate(new Date())
}

export function isOverdue(dateStr: string): boolean {
  return dateStr < formatDate(new Date())
}

export function getDaysUntil(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 计算下次复习日期：从 startDate 起加 interval
export function getNextReviewDate(
  reviewCount: number,
  intensity: Intensity,
  startDate?: string
): string {
  const intervals = BASE[intensity]
  const idx = Math.min(reviewCount, intervals.length - 1)
  const interval = intervals[idx] * K[intensity]

  const base = startDate ? new Date(startDate) : new Date()
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() + Math.round(interval))
  return formatDate(base)
}

// 推算从 startDate 起接下来 count 个复习日期（各从 startDate 独立计算）
export function getFutureReviewDates(
  startDate: string,
  fromCount: number,
  intensity: Intensity,
  count: number = 6
): string[] {
  const dates: string[] = []
  for (let i = 0; i < count; i++) {
    dates.push(getNextReviewDate(fromCount + i, intensity, startDate))
  }
  return dates
}

export function getForgettingCurveData() {
  const points: { day: number; without: number; with: number }[] = []
  for (let day = 0; day <= 30; day++) {
    const without = Math.round(100 * Math.exp(-day / 7))
    const withReview = Math.max(60, Math.min(100, 100 - 3 * day + (day > 2 ? 8 : 0)))
    points.push({ day, without, with: withReview })
  }
  return points
}
