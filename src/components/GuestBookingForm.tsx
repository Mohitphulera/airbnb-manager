'use client'

import { useState } from 'react'
import { submitBookingRequest } from '@/actions/bookingRequestActions'
import { showToast } from '@/components/Toast'
import { format } from 'date-fns'

export default function GuestBookingForm({ property, checkIn, checkOut, nights, totalPrice, onClose }: {
  property: any
  checkIn: Date
  checkOut: Date
  nights: number
  totalPrice: number
  onClose: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('propertyId', property.id)
    formData.set('checkIn', checkIn.toISOString())
    formData.set('checkOut', checkOut.toISOString())
    formData.set('totalAmount', String(totalPrice))

    try {
      await submitBookingRequest(formData)
      setSuccess(true)
      showToast('Booking request sent! The host will confirm shortly.', 'success')
    } catch {
      showToast('Failed to submit request', 'error')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Booking Request Sent!</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
          <strong>{property.name}</strong> · {format(checkIn, 'MMM d')} → {format(checkOut, 'MMM d')}
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          The host will confirm your booking shortly. You&apos;ll receive a WhatsApp message with confirmation details.
        </p>
        <button onClick={onClose} className="btn btn-primary" style={{ borderRadius: '8px' }}>Done</button>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: 0 }}>Complete Your Booking</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
      </div>

      {/* Summary */}
      <div style={{ background: 'var(--cozy-blue-light)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{property.name}</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {format(checkIn, 'MMM d, yyyy')} → {format(checkOut, 'MMM d, yyyy')} · {nights} night{nights > 1 ? 's' : ''}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginTop: '0.375rem' }}>₹{totalPrice.toLocaleString('en-IN')}</div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Full Name *</label>
          <input name="guestName" required className="form-input" placeholder="e.g. Rahul Sharma" />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Phone (WhatsApp) *</label>
          <input name="guestPhone" required className="form-input" placeholder="e.g. 919876543210" />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Email (optional)</label>
          <input name="guestEmail" type="email" className="form-input" placeholder="you@email.com" />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Number of Guests</label>
          <input name="guests" type="number" min="1" defaultValue="1" className="form-input" />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.25rem' }}>Message to Host (optional)</label>
          <textarea name="message" className="form-input" rows={2} placeholder="Any special requests..." />
        </div>
        <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting} style={{ width: '100%', borderRadius: '10px', padding: '0.75rem', fontSize: '0.9375rem', marginTop: '0.25rem' }}>
          {submitting ? 'Sending...' : `📩 Request Booking — ₹${totalPrice.toLocaleString('en-IN')}`}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          No payment needed now. The host will confirm availability first.
        </p>
      </form>
    </div>
  )
}
