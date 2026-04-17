import { useState, useEffect, useRef } from 'react'
import { useTaskStore } from '../store/taskStore'
import type { Intensity } from '../types'
import { X, Plus } from 'lucide-react'

interface Props {
  onClose: () => void
}

const INTENSITIES: { value: Intensity; label: string; sub: string }[] = [
  { value: 'low', label: '半月记忆', sub: '复习紧凑' },
  { value: 'mid', label: '一月记忆', sub: '循序渐进' },
  { value: 'high', label: '季度记忆', sub: '间隔宽松' },
]

export default function AddTaskModal({ onClose }: Props) {
  const [content, setContent] = useState('')
  const [intensity, setIntensity] = useState<Intensity>('mid')
  const { addTask } = useTaskStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!content.trim()) return
    addTask(content.trim(), intensity)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(38, 37, 30, 0.5)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 50,
        padding: '0 0 0 0',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--color-cream)',
          width: '100%',
          maxWidth: '480px',
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px 32px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            添加学习目标
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px', borderRadius: 'var(--radius-md)' }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="例如：贝多芬《月光曲》、印象派油画鉴赏..."
          className="input"
          rows={3}
        />

        {/* Intensity selector */}
        <div>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '10px',
            }}
          >
            复习强度
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {INTENSITIES.map(({ value, label, sub }) => (
              <button
                key={value}
                onClick={() => setIntensity(value)}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${
                    intensity === value
                      ? value === 'high'
                        ? 'rgba(207,45,86,0.4)'
                        : value === 'mid'
                        ? 'rgba(192,133,50,0.4)'
                        : 'rgba(31,138,101,0.4)'
                      : 'var(--border-soft)'
                  }`,
                  background:
                    intensity === value
                      ? value === 'high'
                        ? 'rgba(207,45,86,0.08)'
                        : value === 'mid'
                        ? 'rgba(192,133,50,0.08)'
                        : 'rgba(31,138,101,0.08)'
                      : 'var(--color-surface-400)',
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.8125rem',
                  fontWeight: intensity === value ? 600 : 400,
                  color:
                    intensity === value
                      ? value === 'high'
                        ? '#a82545'
                        : value === 'mid'
                        ? '#9a6a2a'
                        : '#1f8a65'
                      : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>{label}</span>
                <span style={{ fontSize: '0.5625rem', opacity: 0.7, fontWeight: 400 }}>{sub}</span>
              </button>
            ))}
          </div>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.6875rem',
              color: 'var(--text-muted)',
              marginTop: '8px',
            }}
          >
            目标时间越短，复习越紧凑；时间越长，间隔越宽松
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ flex: 1 }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="btn-primary"
            style={{
              flex: 2,
              opacity: content.trim() ? 1 : 0.4,
              gap: '6px',
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            添加目标
          </button>
        </div>
      </div>
    </div>
  )
}
