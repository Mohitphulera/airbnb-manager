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
      showToast('Thank you for your review!', 'success')
      setShowForm(false)
      setRating(5)
    } catch {
      showToast('Failed to submit review', 'error')
    }
    setSubmitting(false)
  }

  const renderStars = (r: number, size = '1rem') => (
    <span style={{ letterSpacing: '2px', fontSize: size, color: 'var(--cinema-gold)' }}>
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
      <div className="cinema-divider" />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 className="cinema-detail-section-title" style={{ marginBottom: '0.25rem' }}>
            Guest Reviews
          </h3>
          {reviewCount > 0 && (
            <div className="cinema-rating">
              <span className="cinema-rating-star" style={{ fontSize: '1.125rem' }}>★</span>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{avgRating}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>· {reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.625rem 1.25rem', borderRadius: '8px',
            border: '1px solid rgba(201,168,76,0.2)', background: 'transparent',
            color: 'var(--cinema-gold)', fontFamily: "'Manrope', sans-serif",
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
          }}
        >
          {showForm ? 'Cancel' : 'Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form action={handleSubmit} style={{
          background: 'rgba(201,168,76,0.04)', borderRadius: '16px', padding: '1.5rem',
          marginBottom: '1.5rem', border: '1px solid rgba(201,168,76,0.1)',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--cinema-gold)', marginBottom: '0.5rem' }}>Your Name</label>
            <input name="guestName" required className="form-input" placeholder="e.g. Rahul Sharma" style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.06)', borderRadius: '10px' }} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--cinema-gold)', marginBottom: '0.5rem' }}>Rating</label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoveredStar(s)}
                  onMouseLeave={() => setHoveredStar(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '2px',
                    color: (hoveredStar || rating) >= s ? 'var(--cinema-gold)' : '#d1d5db',
                    transition: 'transform 0.15s, color 0.15s',
                    transform: (hoveredStar || rating) >= s ? 'scale(1.1)' : 'scale(1)',
                  }}
                >★</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--cinema-gold)', marginBottom: '0.5rem' }}>Your experience (optional)</label>
            <textarea name="comment" className="form-input" rows={3} placeholder="Tell us about your stay..." style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.06)', borderRadius: '10px' }} />
          </div>
          <button
            type="submit"
            className={`cinema-book-btn cinema-book-btn-gold ${submitting ? 'btn-loading' : ''}`}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r.id} className="cinema-review-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="cinema-review-avatar">
                    {r.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1a1a1a' }}>{r.guestName}</span>
                    <div>{renderStars(r.rating, '0.75rem')}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.625rem', fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af' }}>
                  {timeAgo(r.createdAt)}
                </span>
              </div>
              {r.comment && (
                <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: 1.7, marginTop: '0.375rem' }}>{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.875rem', padding: '2rem 0', fontFamily: "'Manrope', sans-serif" }}>
          No reviews yet. Be the first to share your experience!
        </p>
      ) : null}
    </div>
  )
}
