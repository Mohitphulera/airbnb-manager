'use client'

import { useState, useRef } from 'react'
import { addProperty } from '@/actions/propertyActions'
import { showToast } from '@/components/Toast'

const ALL_AMENITIES = ['WiFi', 'Pool', 'AC', 'Kitchen', 'Parking', 'TV', 'Washer', 'Pet-Friendly', 'Gym', 'Balcony']

export default function PropertyForm() {
  const [type, setType] = useState('OWNED')
  const [amenities, setAmenities] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const toggleAmenity = (a: string) => {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    let uploadedUrls: string[] = []
    setUploading(true)
    try {
      // 1. Get secure signature from our backend
      const signRes = await fetch('/api/sign-cloudinary', { method: 'POST' })
      const { timestamp, signature, cloudName, apiKey } = await signRes.json()

      // 2. Upload directly from browser to Cloudinary (bypassing Vercel's strict 4MB limit)
      const uploadPromises = Array.from(files).map(async (file) => {
        const uploadData = new FormData()
        uploadData.append('file', file)
        uploadData.append('api_key', apiKey)
        uploadData.append('timestamp', timestamp)
        uploadData.append('signature', signature)
        uploadData.append('folder', 'airbnb-manager')
        
        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: uploadData
        })
        const data = await res.json()
        
        let finalUrl = data.secure_url
        finalUrl = finalUrl.replace('/upload/', '/upload/f_auto,q_auto/')
        finalUrl = finalUrl.replace(/\.[^/.]+$/, ".jpg")
        return finalUrl
      })
      
      uploadedUrls = await Promise.all(uploadPromises)
      if (uploadedUrls.length > 0) {
        setImageUrls(prev => [...prev, ...uploadedUrls])
        showToast(`${uploadedUrls.length} photo(s) uploaded`, 'success')
      }
    } catch (error) {
      console.error('Direct Cloudinary upload failed:', error)
      showToast('Photo upload failed', 'error')
      alert('Failed to upload photos. Please try again or use smaller files.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
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
      await addProperty(formData)
      showToast('🏠 Property added successfully!', 'success')
      formRef.current?.reset()
      setType('OWNED')
      setAmenities([])
      setImageUrls([])
      setUrlInput('')
    } catch {
      showToast('Failed to add property', 'error')
    }
    setSubmitting(false)
  }

  return (
    <form ref={formRef} action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="form-group">
        <label className="form-label">Property Name</label>
        <input name="name" className="form-input" required placeholder="e.g. Sunset Villa" />
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea name="description" className="form-input" rows={3} required placeholder="A beautiful 2BHK with mountain views..." />
      </div>

      <div className="form-group">
        <label className="form-label">Location</label>
        <input name="location" className="form-input" required placeholder="e.g. Jaipur, Rajasthan" />
      </div>

      <div className="form-group">
        <label className="form-label">WhatsApp Number</label>
        <input name="whatsappNumber" className="form-input" placeholder="e.g. 919876543210" required />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Type</label>
          <select name="type" className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="OWNED">Owned (Mine)</option>
            <option value="COMMISSION">Commission (Partner)</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Price / Night (₹)</label>
          <input type="number" step="1" name="pricePerNight" className="form-input" required placeholder="3000" />
        </div>
      </div>

      {type === 'COMMISSION' && (
        <div className="form-group">
          <label className="form-label">Commission Rate (%)</label>
          <input type="number" step="0.1" name="commissionRate" className="form-input" required placeholder="15" />
        </div>
      )}

      {/* Amenities */}
      <div className="form-group">
        <label className="form-label">Amenities</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {ALL_AMENITIES.map(a => (
            <button
              key={a}
              type="button"
              className={`filter-pill ${amenities.includes(a) ? 'active' : ''}`}
              onClick={() => toggleAmenity(a)}
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
            >
              {a}
            </button>
          ))}
        </div>
        <input type="hidden" name="amenities" value={amenities.join(',')} />
      </div>

      {/* Image Upload Section */}
      <div className="form-group">
        <label className="form-label">Property Photos</label>
        
        {/* Upload from device */}
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

        {/* Or add URL */}
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

        {/* Image Preview Grid */}
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
        {submitting ? 'Adding Property...' : 'Add Property'}
      </button>
    </form>
  )
}
