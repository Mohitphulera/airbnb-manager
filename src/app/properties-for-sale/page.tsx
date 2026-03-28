import { getAvailableSaleProperties } from '@/actions/salePropertyActions'
import Link from 'next/link'
import SalePropertyBrowser from '@/components/SalePropertyBrowser'
import FadeUp from '@/components/FadeUp'

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
    <>
      {/* Sticky Nav */}
      <nav className="public-nav">
        <div className="container public-nav-inner">
          <Link href="/" className="nav-logo-wrap">
            <img src="/logo-cozybnb.jpg" alt="Cozy BnB" className="logo-img" style={{ width: '38px', height: '38px' }} />
            <div className="nav-logo-text-group">
              <span className="nav-logo-text">Cozy BnB</span>
              <span className="nav-logo-sub">&amp; Properties</span>
            </div>
          </Link>
          <div className="public-nav-links">
            <Link href="/" className="btn btn-glass">
              Discover
            </Link>
            <Link href="/properties-for-sale" className="btn btn-primary nav-btn-active">
              Investments
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero-section" style={{ minHeight: '380px' }}>
        <img
          src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80"
          alt="Investment property"
          className="hero-bg-img"
        />
        <div className="hero-content">
          <FadeUp delay={0.1}>
            <p className="section-label" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem' }}>
              Investment-Grade Assets
            </p>
          </FadeUp>
          <FadeUp delay={0.2}>
            <h1 className="hero-title">
              Investment
              <br />
              Catalog
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="hero-subtitle">
              Curated opportunities in architectural excellence and high-yield personal real&nbsp;estate.
            </p>
          </FadeUp>
        </div>
      </header>

      {/* Browser */}
      <SalePropertyBrowser properties={JSON.parse(JSON.stringify(serialized))} />

      {/* Footer */}
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
