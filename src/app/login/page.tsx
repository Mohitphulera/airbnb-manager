'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
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
    const result = await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <div className="cinema-login">
      <div className="cinema-orb cinema-orb-1" />
      <div className="cinema-orb cinema-orb-2" />

      <div className="cinema-login-card" style={{ animation: 'fadeInUp 0.6s ease both' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#fff' }}>apartment</span>
            </div>
          </div>
          <h1 style={{ marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Sign in to your property dashboard
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.8125rem', textAlign: 'center', border: '1px solid rgba(220,38,38,0.15)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input type="email" name="email" placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input type="password" name="password" placeholder="Your password" required />
          </div>
          <button type="submit" disabled={loading} className="cinema-login-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
            New here?{' '}
            <Link href="/signup" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Create your free account
            </Link>
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link href="/" style={{ fontSize: '0.6875rem', fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(255,255,255,0.3)' }}>
            ← Back to platform
          </Link>
        </div>
      </div>
    </div>
  )
}
