import { useState } from 'react'
import Dashboard from './components/Dashboard'
import Library from './components/Library'
import DataAnalytics from './components/DataAnalytics'
import AddTaskModal from './components/AddTaskModal'
import { Plus } from 'lucide-react'

type Tab = 'home' | 'library' | 'analytics'

const NAV_ITEMS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'home', label: '首页', icon: <HomeIcon /> },
  { key: 'library', label: '目标库', icon: <LibraryIcon /> },
  { key: 'analytics', label: '数据', icon: <ChartIcon /> },
]

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}

function LibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--color-cream)',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '560px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Header */}
      <header
        style={{
          background: 'var(--color-cream)',
          borderBottom: '1px solid var(--border-soft)',
          padding: '0 20px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          width: '100%',
          maxWidth: '560px',
          alignSelf: 'center',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            好好学习
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Smart Reviewer
          </p>
        </div>

        {/* Settings button */}
        <button
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-surface-300)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            transition: 'color 150ms ease',
          }}
          title="设置"
        >
          <SettingsIcon />
        </button>
      </header>

      {/* Content */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: '140px',
          padding: '0 20px',
          width: '100%',
          maxWidth: '560px',
          alignSelf: 'center',
          boxSizing: 'border-box',
        }}
      >
        {activeTab === 'home' && <Dashboard />}
        {activeTab === 'library' && <Library />}
        {activeTab === 'analytics' && <DataAnalytics />}
      </main>

      {/* Floating Add Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '72px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 25,
        }}
      >
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--color-dark)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(38,37,30,0.25)',
            transition: 'transform 150ms ease, box-shadow 150ms ease',
          }}
          title="添加目标"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Nav */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: '560px',
          margin: '0 auto',
          background: 'var(--color-cream)',
          borderTop: '1px solid var(--border-soft)',
          padding: '0 8px',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
          zIndex: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            height: '56px',
          }}
        >
          {NAV_ITEMS.map(({ key, label, icon }) => {
            const isActive = activeTab === key
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '3px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  transition: 'color 150ms ease',
                  padding: '0',
                }}
              >
                <span
                  style={{
                    transition: 'color 150ms ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {icon}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.625rem',
                    fontWeight: isActive ? 600 : 500,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    width: '16px',
                    height: '2px',
                    borderRadius: '1px',
                    background: isActive ? 'var(--text-primary)' : 'transparent',
                    transition: 'background 150ms ease',
                    marginTop: '1px',
                  }}
                />
              </button>
            )
          })}
        </div>
      </nav>

      {showAddModal && <AddTaskModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}
