'use client'

import { useState } from 'react'
import { submitReview } from '@/actions/reviewActions'
import { showToast } from '@/components/Toast'

export default function ReviewSection({ propertyId, reviews, avgRating, reviewCount }: {
  propertyId: string
  reviews: any[]
  avgRating: number
  reviewCount: number
}) {
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true)
    try {
      formData.set('propertyId', propertyId)
      formData.set('rating', String(rating))
      await submitReview(formData)
      showToast('Thank you for your review! ⭐', 'success')
      setShowForm(false)
      setRating(5)
    } catch {
      showToast('Failed to submit review', 'error')
    }
    setSubmitting(false)
  }

  const renderStars = (r: number, size = '1rem') => (
    <span style={{ letterSpacing: '2px', fontSize: size }}>
      {'★'.repeat(r)}{'☆'.repeat(5 - r)}
    </span>
  )

  const timeAgo = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Yesterday'
    if (diff < 30) return `${diff} days ago`
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`
    return `${Math.floor(diff / 365)} years ago`
  }

  return (
    <div>
      <div style={{ height: '1px', background: 'var(--border)', margin: '1.25rem 0' }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Guest Reviews
          </h3>
          {reviewCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#F59E0B', fontSize: '1.125rem' }}>★</span>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{avgRating}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>· {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '0.8125rem' }}>
          {showForm ? 'Cancel' : '✍️ Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form action={handleSubmit} style={{
          background: 'var(--cozy-blue-light)', borderRadius: '12px', padding: '1.25rem',
          marginBottom: '1.25rem', border: '1px solid rgba(43,108,176,0.1)',
        }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Your Name</label>
            <input name="guestName" required className="form-input" placeholder="e.g. Rahul Sharma" style={{ background: '#fff' }} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '2px',
                    color: (hoveredStar || rating) >= s ? '#F59E0B' : '#CBD5E1',
                    transition: 'transform 0.15s, color 0.15s',
                    transform: (hoveredStar || rating) >= s ? 'scale(1.1)' : 'scale(1)',
                  }}
                >★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.375rem' }}>Your experience (optional)</label>
            <textarea name="comment" className="form-input" rows={3} placeholder="Tell us about your stay..." style={{ background: '#fff' }} />
          </div>
          <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} disabled={submitting} style={{ width: '100%', borderRadius: '8px' }}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r.id} style={{
              padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    fontWeight: 700, fontSize: '0.8125rem',
                  }}>
                    {r.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.guestName}</span>
                    <div style={{ color: '#F59E0B', fontSize: '0.75rem' }}>{renderStars(r.rating, '0.75rem')}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '0.375rem' }}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1.5rem 0' }}>
          No reviews yet. Be the first to share your experience!
        </p>
      ) : null}
    </div>
  )
}
