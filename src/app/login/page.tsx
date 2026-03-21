'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/authActions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await loginAction(formData)
    if (result && result.error) {
      setError(result.error)
      setLoading(false)
    } else if (result && result.success) {
      router.push('/admin')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-subtle)', position: 'relative', overflow: 'hidden' }}>
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(43, 108, 176, 0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13, 148, 136, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.75rem 2.25rem', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="logo-img" style={{ width: '64px', height: '64px', border: '3px solid rgba(43, 108, 176, 0.15)' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', letterSpacing: '-0.03em' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Log in to manage your properties</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: 'var(--danger)', padding: '0.7rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.8125rem', textAlign: 'center', border: '1px solid rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" name="password" className="form-input" placeholder="Enter admin password" required style={{ textAlign: 'center', fontSize: '1rem', padding: '0.825rem' }} />
          <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} style={{ width: '100%', padding: '0.825rem', borderRadius: '10px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', transition: 'color 0.15s' }}>← Back to listings</Link>
        </div>
      </div>
    </div>
  )
}
