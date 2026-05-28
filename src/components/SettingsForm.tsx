'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/actions/authActions'

interface Props {
  user: { id: string; businessName: string; slug: string; email: string; whatsappNumber: string | null; logoUrl: string | null; plan: string }
}

export default function SettingsForm({ user }: Props) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
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

        <div>
          <label className="form-label">Logo URL</label>
          <input name="logoUrl" defaultValue={user.logoUrl ?? ''} placeholder="https://..." />
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>Shown in your sidebar and public listing page</p>
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
