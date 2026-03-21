'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'

export default function ShareProperty({ property }: { property: any }) {
  const [showModal, setShowModal] = useState(false)
  const url = typeof window !== 'undefined' ? window.location.href : ''

  const copy = () => {
    navigator.clipboard.writeText(url)
    showToast('Link copied! 🔗', 'success')
  }

  const shareWhatsApp = () => {
    const msg = `Check out this stay: ${property.name} in ${property.location} — ₹${property.pricePerNight.toLocaleString('en-IN')}/night\n${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn btn-secondary" style={{ borderRadius: '8px', fontSize: '0.8125rem', padding: '0.5rem 1rem' }}>
        🔗 Share
      </button>

      {showModal && (
        <div className="confirm-overlay" onClick={() => setShowModal(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.0625rem' }}>Share this property</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}></button>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&bgcolor=FAFBFF&color=1E3A5F`}
                alt="QR Code"
                style={{ width: '180px', height: '180px', borderRadius: '12px', border: '1px solid var(--border)' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Scan to open on phone</p>
            </div>

            {/* Copy Link */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                readOnly
                value={url}
                className="form-input"
                style={{ flex: 1, fontSize: '0.75rem', background: 'var(--surface)' }}
                onClick={copy}
              />
              <button onClick={copy} className="btn btn-primary" style={{ borderRadius: '8px', whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                Copy
              </button>
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={shareWhatsApp} className="btn btn-secondary" style={{ flex: 1, borderRadius: '8px', fontSize: '0.8125rem' }}>
                💬 WhatsApp
              </button>
              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.name, text: `${property.name} in ${property.location}`, url })
                } else {
                  copy()
                }
              }} className="btn btn-secondary" style={{ flex: 1, borderRadius: '8px', fontSize: '0.8125rem' }}>
                📤 More
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
