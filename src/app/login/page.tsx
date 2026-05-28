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
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim()
    const password = (form.elements.namedItem('password') as HTMLInputElement).value

    try {
      // NextAuth v5 beta throws on failure — must use try/catch, not result.error
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      // result is undefined on success in some v5 beta versions
      if (!result || result.error) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      // NextAuth v5 beta throws CredentialsSignin on bad credentials
      setError('Invalid email or password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-card">
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
          <p className="auth-subtitle">Sign in to your property dashboard</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">mail</span>
              <input
                id="login-email"
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
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">lock</span>
              <input
                id="login-password"
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
                <span className="material-symbols-outlined">
                  {showPass ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn" style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <><span className="auth-spinner" />Signing in...</>
            ) : (
              <>Sign In<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <div className="auth-footer-links">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="auth-link">Create one free →</Link>
          </p>
          <Link href="/" className="auth-back-link">← Back to platform</Link>
        </div>
      </div>
    </div>
  )
}
