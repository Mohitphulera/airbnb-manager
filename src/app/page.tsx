import { getProperties } from '@/actions/propertyActions'
import { getBookings } from '@/actions/bookingActions'
import { getAllPropertyRatings } from '@/actions/reviewActions'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'
import DarkModeToggle from '@/components/DarkModeToggle'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [properties, bookings, ratings] = await Promise.all([
    getProperties(),
    getBookings(),
    getAllPropertyRatings(),
  ])

  const serialized = properties.map(p => {
    let images: string[] = []
    try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
    let amenities: string[] = []
    try { if (p.amenities) amenities = JSON.parse(p.amenities) } catch {}
    
    const pBookings = bookings.filter(b => b.propertyId === p.id).map(b => ({
      checkIn: b.checkInDate.toISOString(),
      checkOut: b.checkOutDate.toISOString()
    }))

    const rating = ratings[p.id] || { avg: 0, count: 0 }
    
    return { ...p, images, amenities, pBookings, rating }
  })

  const totalBookings = bookings.length
  const totalProperties = properties.length
  const avgRating = Object.values(ratings).filter((r: any) => r.count > 0).reduce((sum: number, r: any) => sum + r.avg, 0) / Math.max(Object.values(ratings).filter((r: any) => r.count > 0).length, 1)

  return (
    <>
      {/* Sticky Nav */}
      <nav className="public-nav">
        <div className="container public-nav-inner">
          <Link href="/" className="nav-logo-wrap">
            <div className="nav-logo-icon">🏠</div>
            <span className="nav-logo-text">Cozy B&B</span>
          </Link>
          <div className="public-nav-links">
            <DarkModeToggle />
            <Link href="/" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              🏠 Stays
            </Link>
            <Link href="/properties-for-sale" className="btn btn-outline" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              🏷️ Buy Property
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero with animated background */}
      <header className="hero-section">
        {/* Animated mesh gradient */}
        <div className="hero-bg" />
        
        {/* Floating shapes */}
        <div className="hero-shape hero-shape-1" />
        <div className="hero-shape hero-shape-2" />
        <div className="hero-shape hero-shape-3" />
        
        {/* Decorative dots */}
        <div className="hero-dots" />

        <div className="container">
          <div className="hero-content fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--cozy-blue-light)', padding: '0.35rem 0.875rem', borderRadius: '20px', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600, backdropFilter: 'blur(8px)' }}>
              ✨ Handpicked stays, best prices
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: '1.1', marginBottom: '0.75rem', letterSpacing: '-0.035em' }}>
              Find places to stay
              <br />
              <span className="gradient-text">that you&apos;ll love</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', maxWidth: '460px', fontSize: '1.0625rem', lineHeight: '1.7' }}>
              Handpicked bed & breakfast properties for your perfect getaway. Book directly for the best price, always.
            </p>

            {/* Trust Stats */}
            <div className="trust-stats">
              <div className="trust-stat">
                <span className="trust-stat-value">{totalProperties > 0 ? `${totalProperties}+` : '50+'}</span>
                <span className="trust-stat-label">Properties Listed</span>
              </div>
              <div className="trust-stat">
                <span className="trust-stat-value">{totalBookings > 0 ? `${totalBookings}+` : '100+'}</span>
                <span className="trust-stat-label">Happy Stays</span>
              </div>
              <div className="trust-stat">
                <span className="trust-stat-value">{avgRating > 0 ? `${avgRating.toFixed(1)}★` : '5★'}</span>
                <span className="trust-stat-label">Avg. Rating</span>
              </div>
              <div className="trust-stat">
                <span className="trust-stat-value">24/7</span>
                <span className="trust-stat-label">Host Support</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <SearchFilter properties={JSON.parse(JSON.stringify(serialized))} />

      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div className="nav-logo-icon" style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}>🏠</div>
              <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--cozy-dark)' }}>Cozy B&B</span>
            </div>
            <div className="footer-links">
              <Link href="/">Stays</Link>
              <Link href="/properties-for-sale">Buy Property</Link>
              <Link href="/login">Host Login</Link>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} Cozy B&B · Premium stays, direct bookings · All rights reserved
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
