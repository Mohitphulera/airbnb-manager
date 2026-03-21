import { getProperties } from '@/actions/propertyActions'
import { getBookings } from '@/actions/bookingActions'
import { getAllPropertyRatings } from '@/actions/reviewActions'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'
import DarkModeToggle from '@/components/DarkModeToggle'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [properties, bookings, ratings] = await Promise.all([
    getProperties(),
    getBookings(),
    getAllPropertyRatings(),
  ])

  const serialized = properties.map((p: any) => {
    let images: string[] = []
    try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
    let amenities: string[] = []
    try { if (p.amenities) amenities = JSON.parse(p.amenities) } catch {}
    
    const pBookings = bookings.filter((b: any) => b.propertyId === p.id).map((b: any) => ({
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
      {/* ───── Sticky Navigation ───── */}
      <nav className="public-nav">
        <div className="container public-nav-inner">
          <Link href="/" className="nav-logo-wrap">
            <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={40} height={40} className="logo-img" />
            <div className="nav-logo-text-group">
              <span className="nav-logo-text">Cozy BnB</span>
              <span className="nav-logo-sub">& Properties</span>
            </div>
          </Link>
          <div className="public-nav-links">
            <DarkModeToggle />
            <Link href="/" className="btn btn-primary nav-btn-active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              Stays
            </Link>
            <Link href="/properties-for-sale" className="btn btn-glass">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              Buy Property
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ───── Hero Section ───── */}
      <header className="hero-section">
        {/* Animated gradient mesh */}
        <div className="hero-bg" />
        
        {/* Animated orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        
        {/* Decorative grid dots */}
        <div className="hero-dots" />

        {/* Floating property card preview */}
        <div className="hero-float-card fade-up fade-up-3">
          <div className="hero-float-inner">
            <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={56} height={56} className="hero-float-logo" />
            <div>
              <div className="hero-float-title">Cozy BnB</div>
              <div className="hero-float-desc">Trusted by hosts & guests</div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div className="hero-badge fade-up fade-up-1">
              <span className="hero-badge-dot" />
              Handpicked stays, direct bookings
            </div>
            <h1 className="hero-title fade-up fade-up-1">
              Find places to stay
              <br />
              <span className="gradient-text">that you'll love</span>
            </h1>
            <p className="hero-subtitle fade-up fade-up-2">
              Curated bed & breakfast properties for your perfect getaway. 
              Book directly with verified hosts for the best experience, always.
            </p>

            {/* Trust Stats Bar */}
            <div className="trust-stats fade-up fade-up-3">
              <div className="trust-stat">
                <span className="trust-stat-value">{totalProperties > 0 ? `${totalProperties}+` : '50+'}</span>
                <span className="trust-stat-label">Properties</span>
              </div>
              <div className="trust-stat-divider" />
              <div className="trust-stat">
                <span className="trust-stat-value">{totalBookings > 0 ? `${totalBookings}+` : '100+'}</span>
                <span className="trust-stat-label">Happy Stays</span>
              </div>
              <div className="trust-stat-divider" />
              <div className="trust-stat">
                <span className="trust-stat-value">{avgRating > 0 ? `${avgRating.toFixed(1)}` : '5.0'}</span>
                <span className="trust-stat-label">Avg Rating</span>
              </div>
              <div className="trust-stat-divider" />
              <div className="trust-stat">
                <span className="trust-stat-value">24/7</span>
                <span className="trust-stat-label">Support</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ───── Search & Property Grid ───── */}
      <SearchFilter properties={JSON.parse(JSON.stringify(serialized))} />

      {/* ───── Footer ───── */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={36} height={36} className="logo-img" />
              <div>
                <div className="footer-brand-name">Cozy BnB & Properties</div>
                <div className="footer-brand-tagline">Premium stays, direct bookings</div>
              </div>
            </div>
            <div className="footer-links">
              <Link href="/">Stays</Link>
              <Link href="/properties-for-sale">Buy Property</Link>
              <Link href="/login">Host Login</Link>
            </div>
            <div className="footer-copyright">
              &copy; {new Date().getFullYear()} Cozy BnB & Properties. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
