'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/actions/authActions'
import Link from 'next/link'
import { motion } from 'framer-motion'

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
    <div className="cinema-login">
      {/* Ambient orbs */}
      <div className="cinema-orb cinema-orb-1" />
      <div className="cinema-orb cinema-orb-2" />

      <motion.div
        className="cinema-login-card"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <motion.div
            style={{ display: 'inline-flex', marginBottom: '1.5rem' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', boxShadow: '0 0 30px rgba(201,168,76,0.15)' }} />
          </motion.div>
          <h1>Welcome back</h1>
          <p style={{ fontSize: '0.8125rem', fontFamily: "'Manrope', sans-serif", fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '0.5rem' }}>
            Host Administration Portal
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ background: 'rgba(220,38,38,0.1)', color: '#f87171', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.8125rem', textAlign: 'center', border: '1px solid rgba(220,38,38,0.15)' }}
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontFamily: "'Manrope', sans-serif", fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter admin password"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="cinema-login-btn"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ fontSize: '0.6875rem', fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
            ← Back to listings
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
