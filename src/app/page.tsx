import Link from 'next/link'
import prisma from '@/lib/prisma'
import ImageGallery from '@/components/ImageGallery'

export const dynamic = 'force-dynamic'

async function getProperties() {
  try {
    return await prisma.property.findMany({ orderBy: { createdAt: 'desc' }, take: 6 })
  } catch { return [] }
}

export default async function Home() {
  const properties = await getProperties()

  return (
    <div className="curator-page">
      {/* Navigation */}
      <nav className="curator-nav">
        <div className="curator-nav-inner">
          <Link href="/" className="curator-logo">CURATOR</Link>
          <div className="curator-nav-links">
            <Link href="#stays" className="curator-nav-link active">Discover</Link>
            <Link href="/properties-for-sale" className="curator-nav-link">Investments</Link>
            <Link href="/login" className="curator-nav-link">Host Login</Link>
          </div>
          <Link href="/properties-for-sale" className="curator-btn-primary">Inquire</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="curator-hero">
        <div className="curator-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
            alt="Luxury villa"
            className="curator-hero-img"
          />
          <div className="curator-hero-gradient" />
        </div>
        <div className="curator-hero-content">
          <div className="curator-hero-badge">
            <span className="curator-badge-dot" />
            Exclusive Opportunities
          </div>
          <h1 className="curator-hero-title">
            Escape to <br /><em>Extraordinary</em>
          </h1>
          <p className="curator-hero-subtitle">
            The most significant architectural homes, curated for the discerning investor. Access private listings that define luxury and long-term legacy.
          </p>
          <div className="curator-hero-ctas">
            <Link href="#stays" className="curator-btn-white">Explore Collection</Link>
            <Link href="/properties-for-sale" className="curator-btn-ghost">View Investments</Link>
          </div>
        </div>
        <div className="curator-scroll-indicator">
          <span>Scroll to Discover</span>
          <div className="curator-scroll-line" />
        </div>
      </header>

      {/* Curated Collections */}
      <section id="stays" className="curator-section">
        <div className="curator-section-header">
          <div>
            <h2 className="curator-heading">Signature Acquisitions</h2>
            <p className="curator-subheading">Hand-picked for their aesthetic merit and investment potential.</p>
          </div>
          <Link href="/properties-for-sale" className="curator-view-all">
            View Full Portfolio
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </Link>
        </div>

        <div className="curator-property-grid">
          {properties.map((p: any, i: number) => {
            let images: string[] = []
            try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
            return (
              <Link href={`/property/${p.id}`} key={p.id} className={`curator-card ${i === 1 ? 'curator-card-offset' : ''}`}>
                <div className="curator-card-image">
                  {images.length > 0 ? (
                    <img src={images[0]} alt={p.name} className="curator-card-img" />
                  ) : (
                    <div className="curator-card-placeholder">
                      <span className="material-icons-outlined">apartment</span>
                    </div>
                  )}
                  <div className="curator-card-overlay" />
                  {i === 0 && <span className="curator-card-badge">Newly Listed</span>}
                </div>
                <div className="curator-card-info">
                  <div>
                    <h3 className="curator-card-title">{p.name}</h3>
                    <p className="curator-card-location">
                      <span className="material-icons-outlined" style={{ fontSize: '14px' }}>location_on</span>
                      {p.location}
                    </p>
                    <div className="curator-card-stats">
                      <div>
                        <span className="curator-stat-label">Per Night</span>
                        <span className="curator-stat-value">₹{p.pricePerNight.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="curator-stat-label">Type</span>
                        <span className="curator-stat-value curator-stat-accent">{p.type === 'OWNED' ? 'Owned' : 'Partner'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="curator-card-arrow">
                    <span className="material-icons-outlined">north_east</span>
                  </div>
                </div>
              </Link>
            )
          })}
          {properties.length === 0 && (
            <div className="curator-empty">
              <span className="material-icons-outlined" style={{ fontSize: '48px', color: '#ccc' }}>villa</span>
              <p>No properties available. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="curator-philosophy">
        <div className="curator-philosophy-inner">
          <div className="curator-philosophy-image-wrap">
            <div className="curator-philosophy-blur" />
            <div className="curator-philosophy-img-container">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
                alt="Modern architecture"
                className="curator-philosophy-img"
              />
            </div>
            <div className="curator-philosophy-quote">
              <p className="curator-quote-text">&ldquo;Architecture is the art of how we waste space.&rdquo;</p>
              <span className="curator-quote-author">— Philip Johnson</span>
            </div>
          </div>
          <div className="curator-philosophy-content">
            <h2 className="curator-heading">Our Investment <br /><em className="curator-accent">Philosophy</em></h2>
            <div className="curator-pillars">
              {[
                { num: '01', title: 'Vetted Heritage', desc: 'Rigorous audits ensure architectural significance and appreciating financial value.' },
                { num: '02', title: 'Personal Touch', desc: 'Every guest receives white-glove concierge service throughout their stay.' },
                { num: '03', title: 'Privileged Access', desc: 'Portfolio members enjoy exclusive usage rights at preferred internal rates.' },
                { num: '04', title: 'Seamless Stewardship', desc: 'From preservation to management, we protect your asset while maximizing utility.' },
              ].map(p => (
                <div key={p.num} className="curator-pillar">
                  <span className="curator-pillar-num">{p.num}</span>
                  <h4 className="curator-pillar-title">{p.title}</h4>
                  <p className="curator-pillar-desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="curator-newsletter">
        <h2 className="curator-heading" style={{ textAlign: 'center' }}>Join the inner circle.</h2>
        <p className="curator-subheading" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          Early access to private listings and quarterly market insights from our curation team.
        </p>
        <form className="curator-newsletter-form">
          <input type="email" placeholder="Your Email Address" className="curator-newsletter-input" />
          <button type="button" className="curator-btn-primary">Apply for Membership</button>
        </form>
        <p className="curator-newsletter-terms">By subscribing you agree to our invitation terms.</p>
      </section>

      {/* Footer */}
      <footer className="curator-footer">
        <div className="curator-footer-grid">
          <div className="curator-footer-brand">
            <div className="curator-logo">CURATOR</div>
            <p className="curator-footer-tagline">Elevating the standards of <br />property investment since 2024.</p>
          </div>
          <div className="curator-footer-col">
            <h5 className="curator-footer-heading">Portfolio</h5>
            <ul className="curator-footer-links">
              <li><Link href="/">Recent Listings</Link></li>
              <li><Link href="/properties-for-sale">Investments</Link></li>
            </ul>
          </div>
          <div className="curator-footer-col">
            <h5 className="curator-footer-heading">Company</h5>
            <ul className="curator-footer-links">
              <li><Link href="/login">Admin Login</Link></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
          <div className="curator-footer-col">
            <h5 className="curator-footer-heading">Connect</h5>
            <p className="curator-footer-quote">&ldquo;Design is intelligence made visible.&rdquo;</p>
          </div>
        </div>
        <div className="curator-footer-bottom">
          <p>© 2024 CURATOR PROPERTY INVESTMENTS. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  )
}
