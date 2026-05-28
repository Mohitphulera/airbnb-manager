'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { registerAction, checkSlugAvailability } from '@/actions/authActions'

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [formData, setFormData] = useState({ businessName: '', email: '', password: '', slug: '' })
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)

  const checkSlugLive = (slug: string) => {
    if (slugTimer.current) clearTimeout(slugTimer.current)
    if (slug.length < 3) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    slugTimer.current = setTimeout(async () => {
      const res = await checkSlugAvailability(slug)
      setSlugStatus(res.available ? 'available' : 'taken')
    }, 500)
  }

  const handleBusinessName = (val: string) => {
    const slug = generateSlug(val)
    setFormData(p => ({ ...p, businessName: val, slug }))
    checkSlugLive(slug)
  }

  const handleSlug = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setFormData(p => ({ ...p, slug: clean }))
    checkSlugLive(clean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (slugStatus === 'taken') {
      setError('Please choose a different URL slug')
      setLoading(false)
      return
    }

    const fd = new FormData()
    fd.append('businessName', formData.businessName)
    fd.append('email', formData.email)
    fd.append('password', formData.password)
    fd.append('slug', formData.slug)

    const result = await registerAction(fd)
    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Auto-login after registration — use try/catch (NextAuth v5 beta throws on error)
    try {
      const loginResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })
      if (!loginResult || loginResult.error) {
        router.push('/login?registered=1')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      // Registration succeeded, auto-login failed — just send to login
      router.push('/login?registered=1')
    }
  }

  const slugStatusIcon = slugStatus === 'available' ? 'check_circle'
    : slugStatus === 'taken' ? 'cancel'
    : slugStatus === 'checking' ? 'progress_activity'
    : 'link'
  const slugStatusColor = slugStatus === 'available' ? '#4ade80'
    : slugStatus === 'taken' ? '#f87171'
    : 'rgba(255,255,255,0.28)'
  const canSubmit = !loading && slugStatus !== 'taken' && slugStatus !== 'checking'
    && formData.businessName.length >= 2 && formData.email && formData.password.length >= 6

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-grid" />
      </div>

      <div className="auth-card" style={{ maxWidth: '500px' }}>
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
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start managing properties for free — no credit card needed</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-field">
            <label className="auth-label" htmlFor="biz-name">Business / Brand Name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">storefront</span>
              <input
                id="biz-name"
                type="text"
                placeholder="e.g. Sunset Villas, Mohit Stays..."
                value={formData.businessName}
                onChange={e => handleBusinessName(e.target.value)}
                required minLength={2}
                className="auth-input"
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="slug-input">Your Public URL</label>
            <div className="auth-input-wrap">
              <span className="auth-slug-prefix">staydesk.app/</span>
              <input
                id="slug-input"
                type="text"
                placeholder="your-brand"
                value={formData.slug}
                onChange={e => handleSlug(e.target.value)}
                required minLength={3}
                className="auth-input auth-slug-input"
              />
              <span
                className="material-symbols-outlined auth-slug-status"
                style={{ color: slugStatusColor, animation: slugStatus === 'checking' ? 'spin 0.8s linear infinite' : 'none' }}
              >{slugStatusIcon}</span>
            </div>
            {slugStatus === 'available' && <p className="auth-hint auth-hint-green">✓ Available!</p>}
            {slugStatus === 'taken' && <p className="auth-hint auth-hint-red">✗ Taken — try another</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-email">Email Address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">mail</span>
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                required autoComplete="email"
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="signup-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon material-symbols-outlined">lock</span>
              <input
                id="signup-password"
                type={showPass ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                required minLength={6} autoComplete="new-password"
                className="auth-input"
              />
              <button type="button" className="auth-eye-btn" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">
                <span className="material-symbols-outlined">{showPass ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <button type="submit" disabled={!canSubmit} className="auth-submit-btn" style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <><span className="auth-spinner" />Creating account...</>
            ) : (
              <>Create Free Account <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span></>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>
        <div className="auth-footer-links">
          <p>Already have an account?{' '}<Link href="/login" className="auth-link">Sign in →</Link></p>
        </div>
      </div>
    </div>
  )
}
