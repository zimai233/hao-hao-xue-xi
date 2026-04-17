import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { getDaysUntil, isOverdue, isToday } from '../utils/ebbinghaus'
import type { TaskStatus } from '../types'
import { CheckCircle, Circle, Trash2 } from 'lucide-react'

type SortKey = 'createdAt' | 'nextReview' | 'status'
type FilterStatus = 'all' | TaskStatus

const STATUS_LABELS: Record<TaskStatus, string> = {
  learning: '新学',
  reviewing: '复习中',
  mastered: '已掌握',
}

const INTENSITY_LABELS: Record<string, string> = {
  high: '高强度',
  mid: '中强度',
  low: '低强度',
}

export default function Library() {
  const { tasks, checkIn, deleteTask } = useTaskStore()
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const filtered = tasks
    .filter((t) => filterStatus === 'all' || t.status === filterStatus)
    .sort((a, b) => {
      if (sortKey === 'createdAt') return b.createdAt.localeCompare(a.createdAt)
      if (sortKey === 'nextReview') return a.nextReview.localeCompare(b.nextReview)
      if (sortKey === 'status') return a.status.localeCompare(b.status)
      return 0
    })

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingTop: '16px',
        paddingBottom: '24px',
      }}
    >
      {/* Filter + Sort Row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="input"
          style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 36px 8px 10px' }}
        >
          <option value="all">全部状态</option>
          <option value="learning">新学</option>
          <option value="reviewing">复习中</option>
          <option value="mastered">已掌握</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="input"
          style={{ flex: 1, fontSize: '0.8125rem', padding: '8px 36px 8px 10px' }}
        >
          <option value="createdAt">按添加时间</option>
          <option value="nextReview">按复习时间</option>
          <option value="status">按状态</option>
        </select>
      </div>

      {/* Count */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          全部目标
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          {filtered.length} 项
        </span>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '64px 24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            暂无目标
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((task) => {
            const days = getDaysUntil(task.nextReview)
            const overdue = isOverdue(task.nextReview)
            const dueToday = isToday(task.nextReview)
            const done = task.status === 'mastered'

            return (
              <div
                key={task.id}
                style={{
                  background: 'var(--color-surface-400)',
                  border: `1px solid ${done ? 'rgba(31,138,101,0.2)' : 'var(--border-soft)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  opacity: done ? 0.7 : 1,
                  transition: 'opacity 150ms ease',
                }}
              >
                {/* Check button */}
                {!done ? (
                  <button
                    onClick={() => checkIn(task.id)}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      border: dueToday || overdue
                        ? '1.5px solid var(--border-medium)'
                        : '1.5px solid var(--border-soft)',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'border-color 150ms ease',
                    }}
                  >
                    <Circle
                      size={18}
                      strokeWidth={1.5}
                      style={{ color: 'var(--text-muted)' }}
                    />
                  </button>
                ) : (
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--color-success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CheckCircle size={18} strokeWidth={2} style={{ color: '#fff' }} />
                  </div>
                )}

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: done ? 'var(--text-muted)' : 'var(--text-primary)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      textDecoration: done ? 'line-through' : 'none',
                    }}
                  >
                    {task.content}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                    }}
                  >
                    <span
                      className={`tag ${
                        task.status === 'learning'
                          ? 'tag-learning'
                          : task.status === 'reviewing'
                          ? 'tag-reviewing'
                          : 'tag-mastered'
                      }`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                    <span
                      className={`tag ${
                        task.intensity === 'high'
                          ? 'tag-high'
                          : task.intensity === 'mid'
                          ? 'tag-mid'
                          : 'tag-low'
                      }`}
                    >
                      {INTENSITY_LABELS[task.intensity]}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                      ·
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.6875rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      打卡 {task.reviewCount} 次
                    </span>
                    {!done && (
                      <>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
                          ·
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '0.6875rem',
                            fontWeight: overdue ? 600 : 400,
                            color: overdue
                              ? 'var(--color-error)'
                              : dueToday
                              ? 'var(--color-accent)'
                              : 'var(--text-muted)',
                          }}
                        >
                          {overdue
                            ? `逾期 ${Math.abs(days)} 天`
                            : dueToday
                            ? '今日待打卡'
                            : `${days} 天后复习`}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 'var(--radius-sm)',
                    flexShrink: 0,
                    transition: 'color 150ms ease',
                  }}
                >
                  <Trash2 size={14} strokeWidth={1.5} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
