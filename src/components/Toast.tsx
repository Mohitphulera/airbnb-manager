'use client'

import { useState, useEffect, useCallback } from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

let toastId = 0
let addToastFn: ((message: string, type: ToastType) => void) | null = null

export function showToast(message: string, type: ToastType = 'success') {
  if (addToastFn) addToastFn(message, type)
}

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  useEffect(() => {
    addToastFn = addToast
    return () => { addToastFn = null }
  }, [addToast])

  const dismiss = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const icons: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  }

  const bgColors: Record<ToastType, string> = {
    success: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    error: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
    info: 'linear-gradient(135deg, #2B6CB0 0%, #3B82F6 100%)',
  }

  return (
    <div style={{
      position: 'fixed',
      top: '1.5rem',
      right: '1.5rem',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.625rem',
      pointerEvents: 'none',
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            background: bgColors[toast.type],
            color: '#fff',
            padding: '0.875rem 1.25rem',
            borderRadius: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            fontFamily: 'inherit',
            animation: 'toastSlideIn 0.4s cubic-bezier(0.16,1,0.3,1)',
            pointerEvents: 'auto',
            minWidth: '280px',
            maxWidth: '400px',
            backdropFilter: 'blur(8px)',
            cursor: 'pointer',
          }}
          onClick={() => dismiss(toast.id)}
        >
          <span style={{ fontSize: '1.125rem', flexShrink: 0 }}>{icons[toast.type]}</span>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={(e) => { e.stopPropagation(); dismiss(toast.id) }}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >×</button>
        </div>
      ))}
    </div>
  )
}
