import Link from 'next/link'
import prisma from '@/lib/prisma'
import MobileNav from '@/components/MobileNav'

export const dynamic = 'force-dynamic'

async function getProperties() {
  try {
    return await prisma.property.findMany({ orderBy: { createdAt: 'desc' }, take: 6 })
  } catch { return [] }
}

export default async function Home() {
  const properties = await getProperties()

  return (
    <div className="st-page">
      {/* Navigation */}
      <nav className="st-nav">
        <div className="st-nav-inner">
          <Link href="/" className="st-nav-brand">
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" />
            <span className="st-nav-name">Cozy B&B</span>
          </Link>
          <div className="st-nav-links">
            <Link href="/" className="st-nav-link st-nav-link-active">Airbnb Listings</Link>
            <Link href="/properties-for-sale" className="st-nav-link">Properties for Sale</Link>
            <Link href="/login" className="st-nav-link">Admin Login</Link>
          </div>
          <div className="st-nav-actions">
            <a href="https://wa.me/" target="_blank" className="st-btn-outline">WhatsApp Us</a>
          </div>
          <MobileNav activePage="home" />
        </div>
      </nav>

      {/* Hero */}
      <section className="st-hero">
        <div className="st-hero-inner">
          <div className="st-hero-row">
            <div className="st-hero-text">
              <span className="st-label">The Collection</span>
              <h1 className="st-hero-title">
                Discover <br /><em>Premium</em> Stays
              </h1>
            </div>
            <div className="st-hero-desc">
              <p className="st-hero-subtitle">
                A curated selection of architectural masterpieces designed for the contemporary traveler.
              </p>
            </div>
          </div>
          {/* Search Bar */}
          <div className="st-search">
            <div className="st-search-field st-search-field-bordered">
              <span className="st-search-label">Destination</span>
              <input type="text" placeholder="Where to?" className="st-search-input" />
            </div>
            <div className="st-search-field st-search-field-bordered">
              <span className="st-search-label">Arrival & Departure</span>
              <input type="text" placeholder="Select dates" className="st-search-input" />
            </div>
            <div className="st-search-field">
              <span className="st-search-label">Occupancy</span>
              <input type="text" placeholder="Add guests" className="st-search-input" />
            </div>
            <button className="st-search-btn">
              <span className="material-symbols-outlined">search</span>
            </button>
          </div>
        </div>
      </section>

      {/* Property Grid */}
      <section className="st-grid-section">
        <div className="st-grid">
          {properties.map((p: any) => {
            let images: string[] = []
            try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
            return (
              <Link href={`/property/${p.id}`} key={p.id} className="st-card">
                <div className="st-card-image">
                  {images.length > 0 ? (
                    <img src={images[0]} alt={p.name} className="st-card-img" />
                  ) : (
                    <div className="st-card-placeholder">
                      <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>apartment</span>
                    </div>
                  )}
                  <div className="st-card-badge">
                    {p.type === 'OWNED' ? 'Owned' : 'Partner'}
                  </div>
                </div>
                <div className="st-card-info">
                  <div className="st-card-row">
                    <div>
                      <h3 className="st-card-title">{p.name}</h3>
                      <p className="st-card-location">{p.location}</p>
                    </div>
                    <div className="st-card-price">
                      <p className="st-card-price-val">₹{p.pricePerNight.toLocaleString('en-IN')}</p>
                      <p className="st-card-price-unit">per night</p>
                    </div>
                  </div>
                  <div className="st-card-cta">
                    Check Availability
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                  </div>
                </div>
              </Link>
            )
          })}
          {properties.length === 0 && (
            <div className="st-empty">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db' }}>villa</span>
              <p>No properties available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="st-footer">
        <div className="st-footer-inner">
          <div className="st-footer-top">
            <div className="st-footer-brand">
              <div className="st-nav-brand">
                <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" style={{ filter: 'grayscale(1) brightness(0.5)' }} />
                <span className="st-nav-name">Cozy B&B</span>
              </div>
              <p className="st-footer-tagline">
                Defining the future of luxury hospitality through meticulous curation and architectural excellence.
              </p>
            </div>
            <div className="st-footer-cols">
              <div className="st-footer-col">
                <span className="st-footer-heading">Company</span>
                <Link href="/">Discover</Link>
                <Link href="/properties-for-sale">Investments</Link>
                <Link href="/login">Host Portal</Link>
              </div>
              <div className="st-footer-col">
                <span className="st-footer-heading">Legal</span>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="st-footer-bottom">
            <p>&copy; {new Date().getFullYear()} Cozy B&B. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
