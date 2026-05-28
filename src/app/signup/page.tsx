'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { registerAction, checkSlugAvailability } from '@/actions/authActions'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [formData, setFormData] = useState({ businessName: '', email: '', password: '', slug: '' })
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Auto-generate slug from businessName
  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30)

  const handleBusinessNameChange = (val: string) => {
    const slug = generateSlug(val)
    setFormData(p => ({ ...p, businessName: val, slug }))
    checkSlug(slug)
  }

  const checkSlug = (slug: string) => {
    if (slugTimer.current) clearTimeout(slugTimer.current)
    if (slug.length < 3) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    slugTimer.current = setTimeout(async () => {
      const res = await checkSlugAvailability(slug)
      setSlugStatus(res.available ? 'available' : 'taken')
    }, 500)
  }

  const handleSlugChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setFormData(p => ({ ...p, slug: clean }))
    checkSlug(clean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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

    // Auto-login after registration
    const loginResult = await signIn('credentials', {
      email: formData.email,
      password: formData.password,
      redirect: false,
    })

    if (loginResult?.error) {
      router.push('/login')
    } else {
      router.push('/admin')
    }
  }

  const slugColor = slugStatus === 'available' ? '#22c55e' : slugStatus === 'taken' ? '#ef4444' : '#94a3b8'
  const slugIcon = slugStatus === 'available' ? 'check_circle' : slugStatus === 'taken' ? 'cancel' : slugStatus === 'checking' ? 'sync' : 'link'

  return (
    <div className="cinema-login" style={{ minHeight: '100vh', paddingBlock: '2rem' }}>
      <div className="cinema-orb cinema-orb-1" />
      <div className="cinema-orb cinema-orb-2" />

      <div className="cinema-login-card" style={{ maxWidth: '480px', width: '100%', margin: '0 auto', animation: 'fadeInUp 0.6s ease both' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#fff' }}>apartment</span>
            </div>
          </div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Create your account</h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>
            Start managing your properties for free
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.8125rem', textAlign: 'center', border: '1px solid rgba(220,38,38,0.15)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Business Name */}
          <div>
            <label style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Business / Brand Name
            </label>
            <input
              type="text" placeholder="e.g. Mohit Stays, Sunset Villas..."
              value={formData.businessName}
              onChange={e => handleBusinessNameChange(e.target.value)}
              required minLength={2}
            />
          </div>

          {/* Slug */}
          <div>
            <label style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Your Public URL
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', overflow: 'hidden' }}>
              <span style={{ padding: '0 0.75rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                yoursite.com/
              </span>
              <input
                type="text" placeholder="your-brand-name"
                value={formData.slug}
                onChange={e => handleSlugChange(e.target.value)}
                required minLength={3}
                style={{ background: 'transparent', border: 'none', borderRadius: 0, flex: 1, paddingLeft: '0.75rem' }}
              />
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: slugColor, padding: '0 0.75rem', flexShrink: 0, animation: slugStatus === 'checking' ? 'spin 1s linear infinite' : 'none' }}>
                {slugIcon}
              </span>
            </div>
            {slugStatus === 'available' && (
              <p style={{ fontSize: '0.6875rem', color: '#22c55e', marginTop: '0.375rem' }}>✓ This URL is available!</p>
            )}
            {slugStatus === 'taken' && (
              <p style={{ fontSize: '0.6875rem', color: '#ef4444', marginTop: '0.375rem' }}>✗ This URL is taken — try another</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Email
            </label>
            <input
              type="email" placeholder="you@example.com"
              value={formData.email}
              onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontFamily: "'Manrope',sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password" placeholder="At least 6 characters"
              value={formData.password}
              onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
              required minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading || slugStatus === 'taken' || slugStatus === 'checking'}
            className="cinema-login-btn"
            style={{ marginTop: '0.5rem', opacity: (loading || slugStatus === 'taken') ? 0.6 : 1 }}
          >
            {loading ? 'Creating account...' : 'Create Free Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
