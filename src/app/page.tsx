import Link from 'next/link'
import prisma from '@/lib/prisma'
import MobileNav from '@/components/MobileNav'
import PropertyImage from '@/components/PropertyImage'
import ScrollReveal, { StaggerGroup, StaggerItem } from '@/components/ScrollReveal'

export const dynamic = 'force-dynamic'

async function getProperties() {
  try {
    return await prisma.property.findMany({ orderBy: { createdAt: 'desc' }, take: 6 })
  } catch { return [] }
}

export default async function Home() {
  const properties = await getProperties()

  return (
    <div className="st-page" style={{ background: '#0a0a0f' }}>
      {/* ═══ Cinematic Navigation ═══ */}
      <nav className="cinema-nav st-nav">
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

      {/* ═══ Cinematic Hero ═══ */}
      <section className="cinema-hero">
        {/* Ambient orbs */}
        <div className="cinema-orb cinema-orb-1" />
        <div className="cinema-orb cinema-orb-2" />
        <div className="cinema-orb cinema-orb-3" />

        <div className="cinema-hero-inner">
          <ScrollReveal>
            <span className="cinema-label">The Collection</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="cinema-hero-title">
              Discover<br /><em>Premium</em> Stays
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="cinema-hero-subtitle">
              A curated selection of architectural masterpieces designed for the contemporary traveler.
            </p>
          </ScrollReveal>

          {/* Search Bar */}
          <ScrollReveal delay={0.35}>
            <div className="cinema-search">
              <div className="cinema-search-field cinema-search-field-bordered">
                <span className="cinema-search-label">Destination</span>
                <input type="text" placeholder="Where to?" className="cinema-search-input" />
              </div>
              <div className="cinema-search-field cinema-search-field-bordered">
                <span className="cinema-search-label">Arrival & Departure</span>
                <input type="text" placeholder="Select dates" className="cinema-search-input" />
              </div>
              <div className="cinema-search-field">
                <span className="cinema-search-label">Occupancy</span>
                <input type="text" placeholder="Add guests" className="cinema-search-input" />
              </div>
              <button className="cinema-search-btn">
                <span className="material-symbols-outlined">search</span>
              </button>
            </div>
          </ScrollReveal>

          {/* Trust Stats */}
          <ScrollReveal delay={0.5}>
            <div className="cinema-stats">
              <div className="cinema-stat">
                <span className="cinema-stat-value">50+</span>
                <span className="cinema-stat-label">Properties</span>
              </div>
              <div className="cinema-stat">
                <span className="cinema-stat-value">4.9</span>
                <span className="cinema-stat-label">Avg Rating</span>
              </div>
              <div className="cinema-stat">
                <span className="cinema-stat-value">2K+</span>
                <span className="cinema-stat-label">Happy Guests</span>
              </div>
              <div className="cinema-stat">
                <span className="cinema-stat-value">24/7</span>
                <span className="cinema-stat-label">Concierge</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Property Grid Section ═══ */}
      <section className="cinema-section cinema-card-section">
        <ScrollReveal>
          <span className="cinema-section-label" style={{ color: '#1a1a1a' }}>Curated Stays</span>
          <h2 className="cinema-section-title" style={{ color: '#1a1a1a' }}>Featured Properties</h2>
          <p className="cinema-section-desc">
            Each residence is personally inspected and meets our exacting standards for design, comfort, and location.
          </p>
        </ScrollReveal>

        <StaggerGroup className="st-grid" style={{ marginTop: '3rem' }}>
          {properties.map((p: any) => {
            let images: string[] = []
            try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
            return (
              <StaggerItem key={p.id}>
                <Link href={`/property/${p.id}`} className="cinema-card">
                  <div className="cinema-card-image">
                    {images.length > 0 ? (
                      <PropertyImage src={images[0]} alt={p.name} className="cinema-card-img" />
                    ) : (
                      <div className="st-card-placeholder">
                        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>apartment</span>
                      </div>
                    )}
                    <div className="cinema-card-badge">
                      {p.type === 'OWNED' ? 'Owned' : 'Partner'}
                    </div>
                  </div>
                  <div className="cinema-card-info">
                    <div className="cinema-card-row">
                      <div>
                        <h3 className="cinema-card-title">{p.name}</h3>
                        <p className="cinema-card-location">{p.location}</p>
                      </div>
                      <div className="cinema-card-price">
                        <p className="cinema-card-price-val">₹{p.pricePerNight.toLocaleString('en-IN')}</p>
                        <p className="cinema-card-price-unit">per night</p>
                      </div>
                    </div>
                    <div className="cinema-card-cta">
                      Check Availability
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_forward</span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
          {properties.length === 0 && (
            <div className="st-empty">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db' }}>villa</span>
              <p>No properties available yet.</p>
            </div>
          )}
        </StaggerGroup>
      </section>

      {/* ═══ Why Choose Us — Dark Feature Section ═══ */}
      <section className="cinema-section-dark">
        <div className="cinema-section-inner">
          <ScrollReveal>
            <span className="cinema-section-label">The Experience</span>
            <h2 className="cinema-section-title" style={{ color: 'var(--cinema-text)' }}>Why Cozy B&B</h2>
            <p className="cinema-section-desc" style={{ color: 'var(--cinema-text-muted)' }}>
              We redefine hospitality with unmatched attention to detail and a passion for creating extraordinary moments.
            </p>
          </ScrollReveal>

          <StaggerGroup className="cinema-features">
            <StaggerItem>
              <div className="cinema-feature">
                <div className="cinema-feature-icon">
                  <span className="material-symbols-outlined">verified</span>
                </div>
                <h4>Verified Properties</h4>
                <p>Every listing is personally inspected by our team to ensure it meets our premium quality standards.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="cinema-feature">
                <div className="cinema-feature-icon">
                  <span className="material-symbols-outlined">savings</span>
                </div>
                <h4>Best Price Guarantee</h4>
                <p>Book directly with hosts at the best possible rates. No hidden fees, no middleman markups.</p>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="cinema-feature">
                <div className="cinema-feature-icon">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <h4>24/7 Concierge</h4>
                <p>Our dedicated support team is always available to ensure your stay exceeds expectations.</p>
              </div>
            </StaggerItem>
          </StaggerGroup>
        </div>
      </section>

      {/* ═══ Newsletter CTA ═══ */}
      <section className="cinema-cta">
        <div className="cinema-cta-inner">
          <ScrollReveal>
            <span className="cinema-section-label">Stay Connected</span>
            <h2 className="cinema-section-title" style={{ color: 'var(--cinema-text)' }}>Get Exclusive Access</h2>
            <p className="cinema-section-desc" style={{ color: 'var(--cinema-text-muted)', marginInline: 'auto', marginBottom: '2rem' }}>
              Be the first to discover new properties, seasonal offers, and insider travel experiences.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <div className="cinema-cta-form">
              <input type="email" placeholder="Your email address" />
              <button>Subscribe</button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Cinematic Footer ═══ */}
      <footer className="cinema-footer">
        <div className="cinema-footer-inner">
          <div className="st-footer-top">
            <div className="st-footer-brand">
              <div className="st-nav-brand">
                <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" style={{ filter: 'brightness(0.8)' }} />
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
