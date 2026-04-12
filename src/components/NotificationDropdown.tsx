'use client'

import { useState, useEffect, useRef } from 'react'
import { getNotifications, type Notification } from '@/actions/notificationActions'
import { useRouter } from 'next/navigation'

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fetch on first open
  const handleToggle = async () => {
    if (!open && !loaded) {
      try {
        const data = await getNotifications()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
        setLoaded(true)
      } catch {}
    }
    setOpen(!open)
  }

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fetch count on mount
  useEffect(() => {
    getNotifications().then(data => {
      setUnreadCount(data.unreadCount)
      setNotifications(data.notifications)
      setLoaded(true)
    }).catch(() => {})
  }, [])

  const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    booking_request: { icon: 'inbox', color: '#2563eb', bg: '#eff6ff' },
    check_in: { icon: 'key', color: '#059669', bg: '#ecfdf5' },
    check_out: { icon: 'logout', color: '#dc2626', bg: '#fef2f2' },
    cleaning: { icon: 'cleaning_services', color: '#d97706', bg: '#fffbeb' },
  }

  const navigate = (url?: string) => {
    setOpen(false)
    if (url) router.push(url)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="topbar-icon-btn"
        aria-label="Notifications"
        onClick={handleToggle}
        style={{ position: 'relative' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>notifications</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: '2px', right: '2px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#ef4444', color: '#fff', fontSize: '0.5625rem',
            fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          width: '360px', background: '#fff', borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb',
          zIndex: 999, maxHeight: '480px', overflowY: 'auto',
        }}>
          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid #f1f5f9',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#ef4444' }}>
                {unreadCount} pending
              </span>
            )}
          </div>

          {/* Items */}
          {notifications.length > 0 ? (
            <div style={{ padding: '0.25rem 0' }}>
              {notifications.map(n => {
                const style = iconMap[n.type] || iconMap.booking_request
                return (
                  <button
                    key={n.id}
                    onClick={() => navigate(n.actionUrl)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      width: '100%', padding: '0.75rem 1.25rem', border: 'none',
                      background: n.urgent ? '#fefce8' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = n.urgent ? '#fefce8' : 'transparent'}
                  >
                    <span style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: style.bg, color: style.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{style.icon}</span>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3 }}>{n.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#6b7280', lineHeight: 1.4 }}>{n.description}</div>
                    </div>
                    <span style={{ fontSize: '0.5625rem', color: '#94a3b8', fontWeight: 500, flexShrink: 0, marginTop: '2px' }}>
                      {n.time}
                    </span>
                  </button>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem', opacity: 0.4 }}>
                notifications_active
              </span>
              All caught up! No new notifications.
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '0.75rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <button
              onClick={() => navigate('/admin/requests')}
              style={{
                fontSize: '0.6875rem', fontWeight: 700, color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                border: 'none', background: 'transparent', cursor: 'pointer',
              }}
            >
              View All Requests
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
