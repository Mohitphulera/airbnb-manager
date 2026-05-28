'use client'
import { useState, useTransition } from 'react'
import { submitFeedback } from '@/actions/feedbackActions'

export default function FeedbackForm({ propertyName, bookingId, guestName, userId }: { propertyName: string; bookingId?: string; guestName?: string; userId: string }) {
  const [form, setForm] = useState({ guestName: guestName || '', rating: 0, cleanliness: 0, comfort: 0, location: 0, valueForMoney: 0, comment: '', wouldReturn: null as boolean | null })
  const [submitted, setSubmitted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const Stars = ({ value, field }: { value: number; field: string }) => (
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => set(field, n)} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: n <= value ? '#c9a84c' : '#e5e7eb', transition: 'transform 0.15s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')} onMouseLeave={e => (e.currentTarget.style.transform = '')}>★</button>
      ))}
    </div>
  )

  const handleSubmit = () => {
    if (!form.guestName || form.rating === 0) return
    startTransition(async () => {
      await submitFeedback({ userId, bookingId, guestName: form.guestName, propertyName, rating: form.rating, cleanliness: form.cleanliness || undefined, comfort: form.comfort || undefined, location: form.location || undefined, valueForMoney: form.valueForMoney || undefined, comment: form.comment || undefined, wouldReturn: form.wouldReturn ?? undefined })
      setSubmitted(true)
    })
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Thank you!</h2>
        <p style={{ color: '#6b7280' }}>Your feedback helps us improve. We hope to see you again!</p>
      </div>
    )
  }

  const labelStyle: React.CSSProperties = { fontSize: '0.75rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem', display: 'block' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div><label style={labelStyle}>Your Name *</label><input value={form.guestName} onChange={e => set('guestName', e.target.value)} style={inputStyle} placeholder="Full name" /></div>
      <div><label style={labelStyle}>Overall Rating *</label><Stars value={form.rating} field="rating" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div><label style={labelStyle}>Cleanliness</label><Stars value={form.cleanliness} field="cleanliness" /></div>
        <div><label style={labelStyle}>Comfort</label><Stars value={form.comfort} field="comfort" /></div>
        <div><label style={labelStyle}>Location</label><Stars value={form.location} field="location" /></div>
        <div><label style={labelStyle}>Value for Money</label><Stars value={form.valueForMoney} field="valueForMoney" /></div>
      </div>
      <div><label style={labelStyle}>Would you stay with us again?</label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ v: true, l: 'Yes! 😊' }, { v: false, l: 'No 😔' }].map(o => (
            <button key={String(o.v)} onClick={() => set('wouldReturn', o.v)} type="button" style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: `2px solid ${form.wouldReturn === o.v ? (o.v ? '#16a34a' : '#dc2626') : '#e5e7eb'}`, background: form.wouldReturn === o.v ? (o.v ? '#f0fdf4' : '#fef2f2') : '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>{o.l}</button>
          ))}
        </div>
      </div>
      <div><label style={labelStyle}>Comments (optional)</label><textarea value={form.comment} onChange={e => set('comment', e.target.value)} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Tell us about your experience..." /></div>
      <button onClick={handleSubmit} disabled={isPending || !form.guestName || form.rating === 0} style={{ padding: '0.875rem', borderRadius: '10px', border: 'none', background: (!form.guestName || form.rating === 0) ? '#d1d5db' : 'linear-gradient(135deg, #c9a84c, #b8941f)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: (!form.guestName || form.rating === 0) ? 'not-allowed' : 'pointer' }}>{isPending ? 'Submitting...' : 'Submit Feedback'}</button>
    </div>
  )
}
