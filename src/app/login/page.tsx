'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { loginAction } from '@/actions/authActions'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="auth-submit-btn" style={{ marginTop: '0.5rem' }}>
      {pending ? (
        <><span className="auth-spinner" />Signing in...</>
      ) : (
        <>Sign In <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span></>
      )}
    </button>
  )
}

export default function LoginPage() {
  const [state, action] = useActionState(loginAction, null)

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

        {state?.error && (
          <div className="auth-error" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
            {state.error}
          </div>
        )}

        <form action={action} className="auth-form" noValidate>
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
                type="password"
                name="password"
                placeholder="Your password"
                required
                autoComplete="current-password"
                className="auth-input"
              />
            </div>
          </div>

          <SubmitButton />
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
