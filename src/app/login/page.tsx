'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error || !result?.ok) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="auth-page">
      {/* Background */}
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-grid" />
      </div>

      {/* Card */}
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-wrap">
          <div className="auth-logo-icon">
            <span className="material-symbols-outlined">apartment</span>
          </div>
          <div>
            <div className="auth-logo-name">StayDesk</div>
            <div className="auth-logo-tag">Property Management</div>
          </div>
        </div>

        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your dashboard</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">mail</span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">lock</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="auth-input"
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPass(v => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <>
                <span className="auth-spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-footer-links">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="auth-link">Create one free →</Link>
          </p>
          <Link href="/" className="auth-back-link">← Back to platform</Link>
        </div>
      </div>
    </div>
  )
}
