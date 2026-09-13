'use client'
import { useState, useTransition } from 'react'
import { submitFeedback } from '@/actions/feedbackActions'

type RatingField = 'rating' | 'cleanliness' | 'comfort' | 'location' | 'valueForMoney'

function Stars({ value, label, onChange }: { value: number; label: string; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={n === value}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="feedback-star"
          style={{ color: n <= value ? '#c9a84c' : '#e5e7eb' }}
        >★</button>
      ))}
    </div>
  )
}

export default function FeedbackForm({ propertyId, bookingId, guestName }: { propertyId: string; bookingId?: string; guestName?: string }) {
  const [form, setForm] = useState({ guestName: guestName || '', rating: 0, cleanliness: 0, comfort: 0, location: 0, valueForMoney: 0, comment: '', wouldReturn: null as boolean | null })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const setRating = (field: RatingField) => (n: number) => setForm(f => ({ ...f, [field]: n }))
  const canSubmit = !!form.guestName.trim() && form.rating > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    setError('')
    startTransition(async () => {
      try {
        const result = await submitFeedback({
          propertyId, bookingId, guestName: form.guestName, rating: form.rating,
          cleanliness: form.cleanliness || undefined, comfort: form.comfort || undefined,
          location: form.location || undefined, valueForMoney: form.valueForMoney || undefined,
          comment: form.comment || undefined, wouldReturn: form.wouldReturn ?? undefined,
        })
        if ('error' in result) setError(result.error ?? 'Something went wrong')
        else setSubmitted(true)
      } catch {
        setError('Could not submit feedback. Please try again.')
      }
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
  const inputStyle: React.CSSProperties = { width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '0.875rem', fontFamily: 'inherit' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <style>{`.feedback-star{background:none;border:none;cursor:pointer;font-size:1.5rem;line-height:1;padding:0.125rem;transition:transform .15s}.feedback-star:hover,.feedback-star:focus-visible{transform:scale(1.2)}`}</style>
      <div>
        <label htmlFor="fb-name" style={labelStyle}>Your Name *</label>
        <input id="fb-name" value={form.guestName} onChange={e => setForm(f => ({ ...f, guestName: e.target.value }))} style={inputStyle} placeholder="Full name" />
      </div>
      <div><span style={labelStyle}>Overall Rating *</span><Stars label="Overall rating" value={form.rating} onChange={setRating('rating')} /></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        <div><span style={labelStyle}>Cleanliness</span><Stars label="Cleanliness" value={form.cleanliness} onChange={setRating('cleanliness')} /></div>
        <div><span style={labelStyle}>Comfort</span><Stars label="Comfort" value={form.comfort} onChange={setRating('comfort')} /></div>
        <div><span style={labelStyle}>Location</span><Stars label="Location" value={form.location} onChange={setRating('location')} /></div>
        <div><span style={labelStyle}>Value for Money</span><Stars label="Value for money" value={form.valueForMoney} onChange={setRating('valueForMoney')} /></div>
      </div>
      <div><span style={labelStyle}>Would you stay with us again?</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[{ v: true, l: 'Yes! 😊' }, { v: false, l: 'No 😔' }].map(o => (
            <button key={String(o.v)} onClick={() => setForm(f => ({ ...f, wouldReturn: o.v }))} type="button" aria-pressed={form.wouldReturn === o.v} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: `2px solid ${form.wouldReturn === o.v ? (o.v ? '#16a34a' : '#dc2626') : '#e5e7eb'}`, background: form.wouldReturn === o.v ? (o.v ? '#f0fdf4' : '#fef2f2') : '#fff', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}>{o.l}</button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="fb-comment" style={labelStyle}>Comments (optional)</label>
        <textarea id="fb-comment" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Tell us about your experience..." maxLength={2000} />
      </div>
      {error && <div role="alert" style={{ color: '#dc2626', fontSize: '0.8125rem' }}>{error}</div>}
      <button onClick={handleSubmit} disabled={isPending || !canSubmit} style={{ padding: '0.875rem', borderRadius: '10px', border: 'none', background: !canSubmit ? '#d1d5db' : 'linear-gradient(135deg, #c9a84c, #b8941f)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: !canSubmit ? 'not-allowed' : 'pointer' }}>{isPending ? 'Submitting...' : 'Submit Feedback'}</button>
    </div>
  )
}
