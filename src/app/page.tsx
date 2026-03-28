import { getProperties } from '@/actions/propertyActions'
import { getBookings } from '@/actions/bookingActions'
import { getAllPropertyRatings } from '@/actions/reviewActions'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'
import DarkModeToggle from '@/components/DarkModeToggle'
import Image from 'next/image'
import FadeUp from '@/components/FadeUp'

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
              <span className="nav-logo-sub">&amp; Properties</span>
            </div>
          </Link>
          <div className="public-nav-links">
            <DarkModeToggle />
            <Link href="/" className="btn btn-primary nav-btn-active">
              Discover
            </Link>
            <Link href="/properties-for-sale" className="btn btn-glass">
              Investments
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      {/* ───── Dark Hero Section ───── */}
      <header className="hero-section">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          alt="Luxury property"
          className="hero-bg-img"
        />
        <div className="hero-content">
          <FadeUp delay={0.1}>
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Curated Stays &amp; Investments
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <h1 className="hero-title">
              Escape to
              <br />
              Extraordinary
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="hero-subtitle">
              The finest properties curated for the discerning traveler and investor.
              Access handpicked stays that define the future of luxury living.
            </p>
          </FadeUp>
          <FadeUp delay={0.4}>
            <div className="hero-cta-row">
              <Link href="#stays" className="btn btn-primary">Discover Stays</Link>
              <Link href="/properties-for-sale" className="btn btn-ghost">View Investments</Link>
            </div>
          </FadeUp>
        </div>
      </header>

      {/* ───── Trust Stats ───── */}
      <div className="container" style={{ paddingTop: '3rem' }}>
        <FadeUp>
          <div className="trust-stats">
            <div className="trust-stat">
              <span className="trust-stat-value">{totalProperties > 0 ? `${totalProperties}+` : '50+'}</span>
              <span className="trust-stat-label">Properties</span>
            </div>
            <div className="trust-stat">
              <span className="trust-stat-value">{totalBookings > 0 ? `${totalBookings}+` : '100+'}</span>
              <span className="trust-stat-label">Happy Stays</span>
            </div>
            <div className="trust-stat">
              <span className="trust-stat-value">{avgRating > 0 ? `${avgRating.toFixed(1)}` : '5.0'}</span>
              <span className="trust-stat-label">Avg Rating</span>
            </div>
            <div className="trust-stat">
              <span className="trust-stat-value">24/7</span>
              <span className="trust-stat-label">Support</span>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* ───── Curated Collections ───── */}
      <section id="stays" className="container" style={{ paddingTop: '4rem' }}>
        <FadeUp>
          <p className="section-label">Curated Collections</p>
          <h2 className="section-title">Handpicked properties for your perfect stay</h2>
          <p className="section-desc">
            Browse our selection of verified bed &amp; breakfast stays.
            Book directly with trusted hosts for the best experience.
          </p>
        </FadeUp>
      </section>

      {/* ───── Search & Property Grid ───── */}
      <SearchFilter properties={JSON.parse(JSON.stringify(serialized))} />

      {/* ───── Investment Philosophy ───── */}
      <section className="philosophy-section">
        <div className="container">
          <FadeUp>
            <div className="philosophy-grid">
              <div className="philosophy-image">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"
                  alt="Architecture"
                />
                <blockquote>
                  &ldquo;Hospitality is not just a business—it&apos;s the art of creating belonging.&rdquo;
                </blockquote>
              </div>
              <div>
                <p className="section-label">Our Approach</p>
                <h2 className="section-title">Investment Philosophy</h2>
                <div className="philosophy-pillars" style={{ marginTop: '2rem' }}>
                  <div className="philosophy-pillar">
                    <div className="pillar-num">01</div>
                    <h4>Curated Access</h4>
                    <p>Every property is personally vetted for quality, location, and guest experience potential.</p>
                  </div>
                  <div className="philosophy-pillar">
                    <div className="pillar-num">02</div>
                    <h4>Direct Ownership</h4>
                    <p>Book or invest directly—no middlemen, transparent pricing, and verified hosts.</p>
                  </div>
                  <div className="philosophy-pillar">
                    <div className="pillar-num">03</div>
                    <h4>Market Returns</h4>
                    <p>Properties selected for high-yield rental income with long-term capital appreciation.</p>
                  </div>
                  <div className="philosophy-pillar">
                    <div className="pillar-num">04</div>
                    <h4>Full-Stack Support</h4>
                    <p>End-to-end property management—from guest acquisition to maintenance and reporting.</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ───── CTA / Newsletter ───── */}
      <section className="cta-section">
        <div className="container">
          <FadeUp>
            <h2 className="section-title">Join the inner circle.</h2>
            <p className="section-desc">
              Receive early access to new properties, exclusive deals, and market insights delivered to your inbox.
            </p>
            <div className="cta-form">
              <input type="email" placeholder="your@email.com" />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="footer-brand-name">Cozy BnB</div>
                <div className="footer-brand-tagline">
                  Curated stays and investment properties.
                  Premium experiences, direct bookings.
                </div>
              </div>
              <div className="footer-col">
                <h5>Company</h5>
                <Link href="/">Discover</Link>
                <Link href="/properties-for-sale">Investments</Link>
                <Link href="/login">Host Portal</Link>
              </div>
              <div className="footer-col">
                <h5>Legal</h5>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
              </div>
              <div className="footer-col">
                <h5>Stay</h5>
                <a href="#">FAQs</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div className="footer-bottom">
              <span>&copy; {new Date().getFullYear()} Cozy BnB &amp; Properties. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
