'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/actions/authActions'

interface Props {
  user: { id: string; businessName: string; slug: string; email: string; whatsappNumber: string | null; logoUrl: string | null; plan: string }
}

export default function SettingsForm({ user }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [logoUrl, setLogoUrl] = useState(user.logoUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    await updateProfileAction(user.id, {
      businessName: fd.get('businessName') as string,
      whatsappNumber: fd.get('whatsappNumber') as string,
      logoUrl: fd.get('logoUrl') as string,
    })
    setSaved(true)
    setLoading(false)
    setTimeout(() => { setSaved(false); router.refresh() }, 2000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data?.urls?.[0]) {
        setLogoUrl(data.urls[0])
      }
    } catch (err) {
      console.error('Upload failed', err)
    } finally {
      setUploading(false)
      // Reset so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '560px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {saved && (
        <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
          ✓ Settings saved successfully
        </div>
      )}

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Business Profile</h3>

        <div>
          <label className="form-label">Business / Brand Name</label>
          <input name="businessName" defaultValue={user.businessName} required />
        </div>

        <div>
          <label className="form-label">WhatsApp Number</label>
          <input name="whatsappNumber" defaultValue={user.whatsappNumber ?? ''} placeholder="+91 98765 43210" />
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Guests will use this to contact you</p>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="form-label">Logo</label>

          {/* Hidden actual file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {/* Hidden form field carrying the URL */}
          <input type="hidden" name="logoUrl" value={logoUrl} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Logo preview */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo preview"
                style={{
                  width: '72px',
                  height: '72px',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  background: '#f8fafc',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '10px',
                  border: '1px dashed var(--border)',
                  background: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: 'var(--text-muted)',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                No logo
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: uploading ? '#f1f5f9' : '#fff',
                  color: uploading ? 'var(--text-muted)' : 'var(--text)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s',
                }}
              >
                {uploading ? (
                  <>
                    <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid var(--text-muted)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Uploading…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>upload</span>
                    {logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </>
                )}
              </button>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl('')}
                  style={{
                    padding: '0.375rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(239,68,68,0.25)',
                    background: 'rgba(239,68,68,0.04)',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Shown in your sidebar and public listing page
          </p>

          {/* Spin keyframe */}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Account Info</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="form-label">Email</label>
            <input value={user.email} readOnly style={{ opacity: 0.5 }} />
          </div>
          <div>
            <label className="form-label">Plan</label>
            <input value={user.plan} readOnly style={{ opacity: 0.5 }} />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Your Public URL</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.875rem 1rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>link</span>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600 }}>
              {typeof window !== 'undefined' ? window.location.origin : ''}/{user.slug}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>Share this link with your guests</div>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ marginLeft: 'auto', fontSize: '0.75rem' }}
            onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/${user.slug}`)}
          >
            Copy
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
