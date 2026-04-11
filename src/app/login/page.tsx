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
    <div className="st-page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#faf9f6', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle background circles */}
      <div style={{ position: 'absolute', top: '-20%', right: '-15%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,26,26,0.03) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(26,26,26,0.02) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '420px', width: '100%', padding: '3rem 2.5rem', position: 'relative', zIndex: 1, background: '#fff', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.05)', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', fontWeight: 400, marginBottom: '0.5rem', color: '#1a1a1a', letterSpacing: '-0.02em' }}>Welcome back</h1>
          <p style={{ color: '#6b7280', fontSize: '0.8125rem', fontFamily: "'Manrope', sans-serif", fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Host Administration Portal</p>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', color: '#9f403d', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.8125rem', textAlign: 'center', border: '1px solid rgba(159,64,61,0.1)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter admin password"
              required
              style={{
                width: '100%', padding: '0.875rem 1rem', borderRadius: '8px',
                border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: '0.9375rem',
                fontFamily: "'Inter', sans-serif", outline: 'none', transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.background = '#fff'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#f9fafb'; }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: '9999px',
              background: loading ? '#9ca3af' : '#1a1a1a', color: '#fff', border: 'none',
              fontFamily: "'Manrope', sans-serif", fontSize: '0.6875rem', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ color: '#6b7280', fontSize: '0.6875rem', fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.2s' }}>
            ← Back to listings
          </Link>
        </div>
      </div>
    </div>
  )
}
