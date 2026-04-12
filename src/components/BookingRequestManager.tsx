'use client'

import { useState } from 'react'
import { confirmBookingRequest, updateBookingRequestStatus } from '@/actions/bookingRequestActions'
import { useRouter } from 'next/navigation'

type Request = {
  id: string
  guestName: string
  guestPhone: string
  guestEmail: string | null
  checkIn: string
  checkOut: string
  guests: number
  message: string | null
  status: string
  totalAmount: number
  createdAt: string
  property: { name: string; whatsappNumber: string | null }
}

export default function BookingRequestManager({ requests }: { requests: Request[] }) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL')
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter)

  const handleConfirm = async (id: string) => {
    setProcessing(id)
    try {
      await confirmBookingRequest(id)
      router.refresh()
    } catch {}
    setProcessing(null)
  }

  const handleReject = async (id: string) => {
    setProcessing(id)
    try {
      await updateBookingRequestStatus(id, 'REJECTED')
      router.refresh()
    } catch {}
    setProcessing(null)
  }

  const handleWhatsApp = (req: Request) => {
    const number = req.guestPhone.replace(/\D/g, '')
    const msg = `Hi ${req.guestName}! Regarding your booking request for ${req.property.name} (${new Date(req.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(req.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}). `
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const statusColors: Record<string, { color: string; bg: string }> = {
    PENDING: { color: '#d97706', bg: '#fffbeb' },
    CONFIRMED: { color: '#059669', bg: '#ecfdf5' },
    REJECTED: { color: '#dc2626', bg: '#fef2f2' },
    CANCELLED: { color: '#6b7280', bg: '#f3f4f6' },
  }

  return (
    <div>
      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', borderRadius: '8px', padding: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'REJECTED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.375rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem',
              fontWeight: 600, border: 'none', cursor: 'pointer',
              background: filter === f ? '#fff' : 'transparent',
              color: filter === f ? '#0f172a' : '#94a3b8',
              boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            {f === 'PENDING' && requests.filter(r => r.status === 'PENDING').length > 0 && (
              <span style={{ marginLeft: '0.375rem', background: '#f59e0b', color: '#fff', borderRadius: '50%', padding: '0.05rem 0.35rem', fontSize: '0.5625rem' }}>
                {requests.filter(r => r.status === 'PENDING').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {filtered.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(req => {
            const sc = statusColors[req.status] || statusColors.CANCELLED
            const nights = Math.max(1, Math.ceil((new Date(req.checkOut).getTime() - new Date(req.checkIn).getTime()) / (1000 * 60 * 60 * 24)))
            const isProcessing = processing === req.id

            return (
              <div key={req.id} className="metric-card" style={{
                padding: '1.25rem',
                borderLeft: `3px solid ${sc.color}`,
                opacity: isProcessing ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{req.guestName}</h3>
                      <span style={{
                        padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.5625rem',
                        fontWeight: 700, background: sc.bg, color: sc.color, textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        {req.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle' }}>home</span>{' '}
                      {req.property.name}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                      ₹{req.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{nights} night{nights > 1 ? 's' : ''}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.625rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Check-in</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {new Date(req.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Check-out</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {new Date(req.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Phone</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{req.guestPhone}</div>
                  </div>
                  <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Guests</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{req.guests} guest{req.guests > 1 ? 's' : ''}</div>
                  </div>
                </div>

                {req.message && (
                  <div style={{ background: '#fffbeb', borderRadius: '8px', padding: '0.5rem 0.75rem', marginBottom: '0.75rem', fontSize: '0.8125rem', color: '#92400e', fontStyle: 'italic', lineHeight: 1.4 }}>
                    &quot;{req.message}&quot;
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {req.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleConfirm(req.id)}
                        disabled={isProcessing}
                        style={{
                          padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.75rem',
                          fontWeight: 700, border: 'none', cursor: 'pointer',
                          background: '#059669', color: '#fff', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check</span>
                        {isProcessing ? 'Confirming...' : 'Confirm Booking'}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={isProcessing}
                        style={{
                          padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.75rem',
                          fontWeight: 700, border: '1px solid #fca5a5', cursor: 'pointer',
                          background: '#fff', color: '#dc2626', transition: 'all 0.2s',
                          display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleWhatsApp(req)}
                    style={{
                      padding: '0.5rem 1.25rem', borderRadius: '8px', fontSize: '0.75rem',
                      fontWeight: 700, border: '1px solid #d1d5db', cursor: 'pointer',
                      background: '#fff', color: '#374151', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '0.375rem',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chat</span>
                    WhatsApp
                  </button>
                </div>

                <div style={{ fontSize: '0.5625rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Received {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="metric-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#d1d5db', display: 'block', marginBottom: '0.75rem' }}>
            inbox
          </span>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {filter === 'ALL' ? 'No booking requests yet' : `No ${filter.toLowerCase()} requests`}
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
            When guests submit booking requests from the property page, they&apos;ll appear here.
          </p>
        </div>
      )}
    </div>
  )
}
