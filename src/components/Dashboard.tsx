import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { getDaysUntil, isOverdue, getFutureReviewDates } from '../utils/ebbinghaus'
import { CheckCircle, Circle, Trash2, Flame, ChevronDown } from 'lucide-react'
import type { Task, Intensity } from '../types'

const INTENSITY_OPTIONS: { value: Intensity; label: string }[] = [
  { value: 'low', label: '半月' },
  { value: 'mid', label: '一月' },
  { value: 'high', label: '季度' },
]

export default function Dashboard() {
  const { tasks, dailyLogs, streak, checkIn, deleteTask } = useTaskStore()
  const today = formatDate(new Date())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 待打卡：未掌握、下次复习在今天或之前、且今天未打卡
  const pendingTasks = tasks.filter(
    (t) => t.status !== 'mastered' && t.nextReview <= today && t.lastCheckIn !== today
  )
  // 今日待新学
  const pendingNewTasks = pendingTasks.filter((t) => t.status === 'learning')
  // 今日待复习
  const pendingReviewTasks = pendingTasks.filter((t) => t.status === 'reviewing')
  // 今日已打卡：今天打卡过的任务
  const checkedInToday = tasks.filter(
    (t) => t.status !== 'mastered' && t.lastCheckIn === today
  )
  const mastered = tasks.filter((t) => t.status === 'mastered').length
  const total = tasks.length

  const todayLog = dailyLogs.find((l) => l.date === today)
  const todayDone = todayLog?.count ?? 0

  return (
    <div style={{ width: '100%' }}>
      {/* Streak Banner */}
      <div style={{ padding: '20px 0 12px', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--color-surface-300)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-pill)', padding: '8px 16px',
        }}>
          <Flame size={15} style={{ color: 'var(--color-gold)' }} strokeWidth={2} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            {streak} 天连续
          </span>
        </div>
      </div>

      {/* 今日待新学 */}
      <Section
        title="今日待新学"
        tasks={pendingNewTasks}
        expandedId={expandedId}
        onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        onCheckIn={checkIn}
        onDelete={deleteTask}
        today={today}
        emptyText={total === 0 ? '还没有学习目标' : '新学目标已全部完成'}
        emptyHint={total === 0 ? '点击底部 + 添加第一个目标' : '继续加油'}
        showCheckbox
      />

      {/* 今日待复习 */}
      <Section
        title="今日待复习"
        tasks={pendingReviewTasks}
        expandedId={expandedId}
        onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
        onCheckIn={checkIn}
        onDelete={deleteTask}
        today={today}
        emptyText={pendingNewTasks.length === 0 && total > 0 ? '复习目标已全部完成' : ''}
        emptyHint={pendingNewTasks.length === 0 && total > 0 ? '明天继续加油' : ''}
        showCheckbox
      />

      {/* 今日已打卡 */}
      {checkedInToday.length > 0 && (
        <Section
          title="今日已打卡"
          tasks={checkedInToday}
          expandedId={expandedId}
          onToggle={(id) => setExpandedId(expandedId === id ? null : id)}
          onCheckIn={checkIn}
          onDelete={deleteTask}
          today={today}
          emptyText=""
          emptyHint=""
          showCheckbox={false}
        />
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '12px 0 0' }}>
        {[
          { label: '总目标', value: total, color: 'var(--text-primary)' },
          { label: '已掌握', value: mastered, color: 'var(--color-success)' },
          { label: '今日完成', value: todayDone, color: 'var(--color-accent)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--color-surface-400)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color, lineHeight: 1, marginBottom: '4px' }}>{value}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Today Progress */}
      {pendingTasks.length > 0 && (
        <div style={{ padding: '12px 0 0' }}>
          <div style={{ background: 'var(--color-surface-400)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-secondary)' }}>今日进度</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>{todayDone}/{pendingTasks.length + todayDone}</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border-soft)', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (todayDone / (pendingTasks.length + todayDone)) * 100)}%`, background: 'var(--color-dark)', borderRadius: '9999px', transition: 'width 400ms ease' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface SectionProps {
  title: string
  tasks: Task[]
  expandedId: string | null
  onToggle: (id: string) => void
  onCheckIn: (id: string) => void
  onDelete: (id: string) => void
  today: string
  emptyText: string
  emptyHint: string
  showCheckbox: boolean
}

function Section({ title, tasks, expandedId, onToggle, onCheckIn, onDelete, today, emptyText, emptyHint, showCheckbox }: SectionProps) {
  return (
    <div style={{ padding: '0 0 8px' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
        {title}
      </p>
      {tasks.length === 0 ? (
        <div style={{ background: 'var(--color-surface-400)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--text-secondary)', margin: '0 0 6px' }}>{emptyText}</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>{emptyHint}</p>
        </div>
      ) : (
        <div style={{ background: 'var(--color-surface-400)', border: '1px solid var(--border-soft)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isExpanded={expandedId === task.id}
              onToggle={() => onToggle(task.id)}
              onCheckIn={() => onCheckIn(task.id)}
              onDelete={() => onDelete(task.id)}
              today={today}
              showCheckbox={showCheckbox}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface TaskRowProps {
  task: Task
  isExpanded: boolean
  onToggle: () => void
  onCheckIn: () => void
  onDelete: () => void
  today: string
  showCheckbox: boolean
}

function TaskRow({ task, isExpanded, onToggle, onCheckIn, onDelete, today, showCheckbox }: TaskRowProps) {
  const { setIntensity } = useTaskStore()
  const days = getDaysUntil(task.nextReview)
  const overdue = isOverdue(task.nextReview)
  const done = task.status === 'mastered'

  // Past check-in dates (all history)
  const historyDates = task.reviewHistory.map((e) => e.date)
  // Future reviews starting from after current scheduled review
  const futureDates = getFutureReviewDates(task.nextReview, 1, task.intensity, 6)

  return (
    <div>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px' }}>
        {/* Check button */}
        {showCheckbox && (
          <button
            onClick={done ? undefined : onCheckIn}
            style={{
              width: '34px', height: '34px', borderRadius: '50%',
              border: done || task.lastCheckIn === today ? 'none' : '1.5px solid var(--border-medium)',
              background: done || task.lastCheckIn === today ? 'var(--color-success)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: done ? 'default' : 'pointer',
              flexShrink: 0, transition: 'all 150ms ease',
              color: done || task.lastCheckIn === today ? '#fff' : 'var(--text-muted)',
            }}
          >
            {(done || task.lastCheckIn === today) ? <CheckCircle size={16} strokeWidth={2} /> : <Circle size={16} strokeWidth={1.5} />}
          </button>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 500,
            color: done ? 'var(--text-muted)' : 'var(--text-primary)',
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textDecoration: done ? 'line-through' : 'none',
          }}>
            {task.content}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.5625rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              background: task.status === 'learning' ? 'rgba(31,138,101,0.12)' : task.status === 'reviewing' ? 'rgba(192,133,50,0.12)' : 'rgba(38,37,30,0.08)',
              color: task.status === 'learning' ? '#1f8a65' : task.status === 'reviewing' ? '#9a6a2a' : 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}>
              {task.status === 'learning' ? '新学' : task.status === 'reviewing' ? '复习' : '已掌握'}
            </span>
            <span className={`tag ${task.intensity === 'high' ? 'tag-high' : task.intensity === 'mid' ? 'tag-mid' : 'tag-low'}`}>
              {task.intensity === 'high' ? '季度' : task.intensity === 'mid' ? '一月' : '半月'}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>·</span>
            <span style={{ fontSize: '0.6875rem', color: overdue ? 'var(--color-error)' : 'var(--text-muted)', fontWeight: overdue ? 600 : 400 }}>
              {overdue ? `逾期 ${Math.abs(days)} 天` : days === 0 ? '今日' : `${days} 天后`}
            </span>
            {task.reviewHistory.length > 0 && (
              <>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>·</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {task.reviewHistory.length} 次打卡
                </span>
              </>
            )}
          </div>
        </div>

        {/* Expand / Delete */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <button
            onClick={onToggle}
            style={{
              background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
              color: isExpanded ? 'var(--text-primary)' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
              transition: 'transform 200ms ease',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <ChevronDown size={15} strokeWidth={2} />
          </button>
          <button
            onClick={onDelete}
            style={{
              background: 'none', border: 'none', padding: '4px', cursor: 'pointer',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              transition: 'color 150ms ease',
            }}
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Expanded timeline */}
      {isExpanded && (
        <div style={{ padding: '0 16px 14px 16px', borderTop: '1px solid var(--border-soft)', marginTop: '0' }}>
          {/* Intensity selector */}
          <div style={{ paddingTop: '12px', marginBottom: '10px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>记忆目标</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {INTENSITY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setIntensity(task.id, value)}
                  style={{
                    flex: 1,
                    padding: '5px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${task.intensity === value ? (value === 'high' ? 'rgba(207,45,86,0.4)' : value === 'mid' ? 'rgba(192,133,50,0.4)' : 'rgba(31,138,101,0.4)') : 'var(--border-soft)'}`,
                    background: task.intensity === value ? (value === 'high' ? 'rgba(207,45,86,0.08)' : value === 'mid' ? 'rgba(192,133,50,0.08)' : 'rgba(31,138,101,0.08)') : 'transparent',
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    fontWeight: task.intensity === value ? 600 : 400,
                    color: task.intensity === value ? (value === 'high' ? '#a82545' : value === 'mid' ? '#9a6a2a' : '#1f8a65') : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Full timeline */}
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>复习时间轴</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {/* 添加时间 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--text-muted)', width: '56px', flexShrink: 0, whiteSpace: 'nowrap' }}>{task.createdAt}</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(38,37,30,0.2)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>添加</span>
            </div>

            {/* 历史打卡 */}
            {historyDates.map((date, idx) => {
              const daysAgo = Math.abs(getDaysUntil(date))
              const isToday = date === today
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--text-muted)', width: '56px', flexShrink: 0, whiteSpace: 'nowrap' }}>{date}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isToday ? 'var(--color-accent)' : 'var(--border-medium)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: isToday ? 'var(--color-accent)' : 'var(--text-muted)', fontWeight: isToday ? 600 : 400 }}>
                    {isToday ? '今日打卡' : `${daysAgo} 天前`}
                  </span>
                </div>
              )
            })}

            {/* 当前复习时间（重点标注） */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--color-accent)', width: '56px', flexShrink: 0, fontWeight: 600, whiteSpace: 'nowrap' }}>{task.nextReview}</span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0, boxShadow: '0 0 0 2px rgba(245,78,0,0.25)' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                {overdue ? `已逾期 ${Math.abs(days)} 天` : days === 0 ? '今日复习' : `${days} 天后复习`}
              </span>
            </div>

            {/* 将来的复习 */}
            {futureDates.map((date, idx) => {
              const daysUntil = getDaysUntil(date)
              const seq = idx + 1
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--text-muted)', width: '56px', flexShrink: 0, whiteSpace: 'nowrap' }}>{date}</span>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(38,37,30,0.15)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    第{seq}次复习 · {daysUntil} 天后
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
