'use client'

import { useState, useRef } from 'react'
import { addSaleProperty } from '@/actions/salePropertyActions'
import { showToast } from '@/components/Toast'

const ALL_FEATURES = ['Garden', 'Parking', 'Swimming Pool', '24x7 Security', 'Lift', 'Power Backup', 'Gym', 'Club House', 'Park', 'Gated Community', 'Corner Plot', 'Vastu Compliant']
const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: '🏢 Apartment' },
  { value: 'VILLA', label: '🏡 Villa' },
  { value: 'PLOT', label: '📐 Plot / Land' },
  { value: 'COMMERCIAL', label: '🏪 Commercial' },
  { value: 'FARMHOUSE', label: '🌾 Farmhouse' },
]

export default function SalePropertyForm() {
  const [features, setFeatures] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const toggleFeature = (f: string) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)

    const fileArray = Array.from(files)
    const newUrls: string[] = []

    for (const file of fileArray) {
      const formData = new FormData()
      formData.append('files', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.urls && data.urls.length > 0) {
          newUrls.push(...data.urls)
        }
      } catch (err) {
        console.error('Upload failed for', file.name, err)
      }
    }

    if (newUrls.length > 0) {
      setImageUrls(prev => [...prev, ...newUrls])
      showToast(`${newUrls.length} photo${newUrls.length > 1 ? 's' : ''} uploaded ✓`, 'success')
    } else {
      showToast('Photo upload failed', 'error')
    }
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const addUrlManual = () => {
    if (urlInput.trim()) {
      setImageUrls(prev => [...prev, urlInput.trim()])
      setUrlInput('')
    }
  }

  const removeImage = (idx: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true)
    try {
      await addSaleProperty(formData)
      showToast('🏷️ Property listed for sale successfully!', 'success')
      formRef.current?.reset()
      setFeatures([])
      setImageUrls([])
      setUrlInput('')
    } catch {
      showToast('Failed to list property', 'error')
    }
    setSubmitting(false)
  }

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="form-group">
        <label className="form-label">Property Title</label>
        <input name="title" className="form-input" required placeholder="e.g. 3BHK Premium Apartment" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-input" rows={3} required placeholder="Spacious apartment with modern amenities..." />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input name="location" className="form-input" required placeholder="e.g. Malviya Nagar, Jaipur" />
      </div>

      <div className="form-group">
        <label className="form-label">WhatsApp Number</label>
        <input name="whatsappNumber" className="form-input" placeholder="e.g. 919876543210" required />
      </div>

      <div className="form-group">
        <label className="form-label">Property Type</label>
        <select name="propertyType" className="form-select">
          {PROPERTY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Price (₹)</label>
          <input type="number" step="1" name="price" className="form-input" required placeholder="5000000" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Area (sq ft)</label>
          <input type="number" step="1" name="area" className="form-input" placeholder="1200" />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Bedrooms</label>
          <input type="number" name="bedrooms" className="form-input" placeholder="3" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Bathrooms</label>
          <input type="number" name="bathrooms" className="form-input" placeholder="2" />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Est. Monthly Rental Income (₹) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— for ROI calculator</span></label>
        <input type="number" step="1" name="monthlyRentalEstimate" className="form-input" placeholder="e.g. 25000" />
      </div>

      {/* Features */}
      <div className="form-group">
        <label className="form-label">Features</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {ALL_FEATURES.map(f => (
            <button
              key={f}
              type="button"
              className={`filter-pill ${features.includes(f) ? 'active' : ''}`}
              onClick={() => toggleFeature(f)}
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              {f}
            </button>
          ))}
        </div>
        <input type="hidden" name="features" value={features.join(',')} />
      </div>

      {/* Image Upload Section */}
      <div className="form-group">
        <label className="form-label">Property Photos</label>

        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: 'var(--cozy-blue-light)',
            transition: 'all 0.15s ease',
            marginBottom: '0.75rem'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
            {uploading ? 'Uploading...' : 'Click to upload photos'}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG, WebP • Max 5MB each</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            className="form-input"
            placeholder="Or paste an image URL..."
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrlManual() }}}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={addUrlManual} className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>+ Add</button>
        </div>

        {imageUrls.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
            {imageUrls.map((url, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={url} alt={`Photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  style={{
                    position: 'absolute', top: '4px', right: '4px',
                    background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none',
                    borderRadius: '50%', width: '22px', height: '22px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '12px'
                  }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        <input type="hidden" name="imageUrls" value={imageUrls.join(',')} />
      </div>

      <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} style={{ width: '100%', marginTop: '0.5rem' }} disabled={submitting}>
        {submitting ? 'Listing Property...' : 'List Property for Sale'}
      </button>
    </form>
  )
}
