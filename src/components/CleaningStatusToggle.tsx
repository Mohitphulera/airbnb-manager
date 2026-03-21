'use client'

import { updateCleaningStatus } from '@/actions/bookingActions'
import { showToast } from '@/components/Toast'
import { useState } from 'react'

const STATUS_CONFIG: Record<string, { emoji: string; label: string; badge: string; next: string }> = {
  PENDING: { emoji: '', label: 'Pending', badge: 'badge-gray', next: 'IN_PROGRESS' },
  IN_PROGRESS: { emoji: '🔄', label: 'Cleaning', badge: 'badge-yellow', next: 'DONE' },
  DONE: { emoji: '✅', label: 'Clean', badge: 'badge-green', next: 'PENDING' },
}

export default function CleaningStatusToggle({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING

  const handleClick = async () => {
    setLoading(true)
    const nextStatus = config.next
    try {
      await updateCleaningStatus(bookingId, nextStatus)
      setStatus(nextStatus)
      const nextConfig = STATUS_CONFIG[nextStatus]
      showToast(`Cleaning: ${nextConfig.label}`, 'success')
    } catch {
      showToast('Failed to update status', 'error')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`badge ${config.badge}`}
      style={{
        cursor: 'pointer',
        border: 'none',
        fontFamily: 'inherit',
        fontSize: '0.625rem',
        transition: 'all 0.2s',
        opacity: loading ? 0.6 : 1,
      }}
      title={`Click to change: ${config.label} → ${STATUS_CONFIG[config.next].label}`}
    >
      {config.emoji} {config.label}
    </button>
  )
}
