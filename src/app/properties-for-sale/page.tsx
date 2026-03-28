import { getAvailableSaleProperties } from '@/actions/salePropertyActions'
import Link from 'next/link'
import SalePropertyBrowser from '@/components/SalePropertyBrowser'

export const dynamic = 'force-dynamic'

export default async function PropertiesForSalePage() {
  const properties = await getAvailableSaleProperties()

  const serialized = properties.map(p => {
    let images: string[] = []
    try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
    let features: string[] = []
    try { if (p.features) features = JSON.parse(p.features) } catch {}
    return { ...p, images, features }
  })

  return (
    <div className="curator-page">
      {/* Navigation */}
      <nav className="curator-nav">
        <div className="curator-nav-inner">
          <Link href="/" className="curator-logo-wrap">
            <img src="/logo-cozybnb.jpg" alt="Cozy BnB" className="curator-logo-img" />
            <span className="curator-logo-text">Cozy BnB</span>
          </Link>
          <div className="curator-nav-links">
            <Link href="/" className="curator-nav-link">Discover</Link>
            <Link href="/properties-for-sale" className="curator-nav-link active">Investments</Link>
            <Link href="/login" className="curator-nav-link">Host Login</Link>
          </div>
          <Link href="/properties-for-sale" className="curator-btn-primary">Inquire</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="curator-hero" style={{ minHeight: '60vh' }}>
        <div className="curator-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
            alt="Investment property"
            className="curator-hero-img"
          />
          <div className="curator-hero-gradient" />
        </div>
        <div className="curator-hero-content">
          <div className="curator-hero-badge">
            <span className="curator-badge-dot" />
            Investment-Grade Assets
          </div>
          <h1 className="curator-hero-title" style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
            Investment<br /><em>Catalog</em>
          </h1>
          <p className="curator-hero-subtitle">
            Curated opportunities in architectural excellence and high-yield real&nbsp;estate.
          </p>
        </div>
        <div className="curator-scroll-indicator">
          <span>Browse Properties</span>
          <div className="curator-scroll-line" />
        </div>
      </header>

      {/* Property Browser */}
      <section className="curator-section">
        <SalePropertyBrowser properties={JSON.parse(JSON.stringify(serialized))} />
      </section>

      {/* Footer */}
      <footer className="curator-footer">
        <div className="curator-footer-grid">
          <div className="curator-footer-brand">
            <Link href="/" className="curator-logo-wrap">
              <img src="/logo-cozybnb.jpg" alt="Cozy BnB" className="curator-logo-img" />
              <span className="curator-logo-text">Cozy BnB</span>
            </Link>
            <p className="curator-footer-tagline">Premium stays and investment<br />properties, curated for you.</p>
          </div>
          <div className="curator-footer-col">
            <h5 className="curator-footer-heading">Portfolio</h5>
            <ul className="curator-footer-links">
              <li><Link href="/">Discover Stays</Link></li>
              <li><Link href="/properties-for-sale">Investments</Link></li>
            </ul>
          </div>
          <div className="curator-footer-col">
            <h5 className="curator-footer-heading">Company</h5>
            <ul className="curator-footer-links">
              <li><Link href="/login">Host Portal</Link></li>
              <li><a href="#">Privacy</a></li>
            </ul>
          </div>
          <div className="curator-footer-col">
            <h5 className="curator-footer-heading">Connect</h5>
            <p className="curator-footer-quote">&ldquo;Real estate is the foundation of all wealth.&rdquo;</p>
          </div>
        </div>
        <div className="curator-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Cozy BnB &amp; Properties. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
