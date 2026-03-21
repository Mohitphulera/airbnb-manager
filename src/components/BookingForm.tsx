'use client'

import { addBooking } from '@/actions/bookingActions'
import { useState, useRef } from 'react'
import { showToast } from '@/components/Toast'

export default function BookingForm({ properties }: { properties: any[] }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const result = await addBooking(formData)
    if (result && result.error) {
      setError(result.error)
      showToast(result.error, 'error')
    } else {
      showToast('Booking added successfully!', 'success')
      formRef.current?.reset()
    }
    setSubmitting(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {error && <div style={{ background: '#FEF2F2', color: 'var(--danger)', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.8125rem', border: '1px solid rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Property</label>
        <select name="propertyId" className="form-select" required>
          <option value="">Select property</option>
          {properties.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name} (₹{p.pricePerNight.toLocaleString('en-IN')}/night)</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Customer Name</label>
        <input name="customerName" className="form-input" required placeholder="Guest name" />
      </div>

      <div className="form-group">
        <label className="form-label">Phone (optional)</label>
        <input name="customerPhone" className="form-input" placeholder="919876543210" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Check-in</label>
          <input type="date" name="checkInDate" className="form-input" required />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Check-out</label>
          <input type="date" name="checkOutDate" className="form-input" required />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Source</label>
        <select name="source" className="form-select" required>
          <option value="AIRBNB">Airbnb</option>
          <option value="DIRECT">Direct Booking</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Staff Notes / Key Handover (optional)</label>
        <textarea name="notes" className="form-input" placeholder="e.g. Key with security, WiFi: CozyGuest123, early check-in requested..." rows={2} style={{ resize: 'vertical' }} />
      </div>

      <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} style={{ width: '100%' }} disabled={submitting}>
        {submitting ? 'Adding Booking...' : 'Add Booking'}
      </button>
    </form>
  )
}
