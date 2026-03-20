'use client'

import { useState } from 'react'
import { confirmBookingRequest, updateBookingRequestStatus } from '@/actions/bookingRequestActions'
import { showToast } from '@/components/Toast'

const STATUS_STYLES: Record<string, { className: string; label: string }> = {
  PENDING: { className: 'badge-yellow', label: '⏳ Pending' },
  CONFIRMED: { className: 'badge-green', label: '✅ Confirmed' },
  REJECTED: { className: 'badge-gray', label: '❌ Rejected' },
  CANCELLED: { className: 'badge-gray', label: '🚫 Cancelled' },
}

export default function BookingRequestsPanel({ requests }: { requests: any[] }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleConfirm = async (id: string) => {
    setLoading(id)
    try {
      await confirmBookingRequest(id)
      showToast('Booking confirmed! Guest notified via WhatsApp. ✅', 'success')
    } catch {
      showToast('Failed to confirm', 'error')
    }
    setLoading(null)
  }

  const handleReject = async (id: string) => {
    setLoading(id)
    try {
      await updateBookingRequestStatus(id, 'REJECTED')
      showToast('Request rejected', 'success')
    } catch {
      showToast('Failed to reject', 'error')
    }
    setLoading(null)
  }

  const sendWhatsApp = (req: any, action: 'confirm' | 'reject') => {
    const phone = req.guestPhone.replace(/\D/g, '')
    const checkIn = new Date(req.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const checkOut = new Date(req.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const msg = action === 'confirm'
      ? `Hello ${req.guestName}! 🎉 Your booking for *${req.property.name}* has been CONFIRMED!\n\n📅 Check-in: ${checkIn}\n📅 Check-out: ${checkOut}\n💰 Total: ₹${req.totalAmount.toLocaleString('en-IN')}\n\nWe look forward to hosting you! 🏠`
      : `Hello ${req.guestName}, unfortunately your booking request for ${req.property.name} (${checkIn} - ${checkOut}) could not be confirmed at this time. Please feel free to try other dates.`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (requests.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {requests.map(req => {
        const status = STATUS_STYLES[req.status] || STATUS_STYLES.PENDING
        const isPending = req.status === 'PENDING'
        const isConfirmed = req.status === 'CONFIRMED'

        return (
          <div key={req.id} style={{
            padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)',
            background: isPending ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{req.guestName}</span>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  {req.property.name} · {new Date(req.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(req.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>📞 {req.guestPhone}</span>
                  {req.guestEmail && <span>📧 {req.guestEmail}</span>}
                  <span>👥 {req.guests} guest{req.guests > 1 ? 's' : ''}</span>
                  <span style={{ fontWeight: 700, color: 'var(--cozy-success)' }}>₹{req.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {req.message && (
                  <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--primary)' }}>
                    💬 "{req.message}"
                  </div>
                )}
              </div>

              {isPending && (
                <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                  <button
                    onClick={() => { handleConfirm(req.id); sendWhatsApp(req, 'confirm') }}
                    className={`btn btn-primary ${loading === req.id ? 'btn-loading' : ''}`}
                    disabled={loading === req.id}
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '8px' }}
                  >✅ Confirm</button>
                  <button
                    onClick={() => { handleReject(req.id); sendWhatsApp(req, 'reject') }}
                    className="btn btn-danger"
                    disabled={loading === req.id}
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '8px' }}
                  >❌ Reject</button>
                </div>
              )}

              {isConfirmed && (
                <button
                  onClick={() => sendWhatsApp(req, 'confirm')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem', borderRadius: '8px' }}
                >💬 WhatsApp</button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
