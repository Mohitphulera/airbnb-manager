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
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="logo-img" style={{ width: '38px', height: '38px' }} />
            <div className="nav-logo-text-group">
              <span className="nav-logo-text">Cozy BnB</span>
              <span className="nav-logo-sub">& Properties</span>
            </div>
          </Link>
          <div className="public-nav-links">
            <Link href="/" className="btn btn-glass">
              Stays
            </Link>
            <Link href="/properties-for-sale" className="btn btn-primary nav-btn-active">
              Buy Property
            </Link>
            <Link href="/login" className="btn btn-secondary">
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero-section">
        <div className="container">
          <div className="hero-content">
            <FadeUp delay={0.1}>
              <div className="hero-badge">
                <span className="hero-badge-dot" />
                Premium properties for sale
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <h1 className="hero-title">
                Find your dream
                <br />
                property to own
              </h1>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p className="hero-subtitle">
                Explore our curated selection of apartments, villas, plots, and more. Inquire directly and make it yours.
              </p>
            </FadeUp>
          </div>
        </div>
      </header>

      {/* Browser */}
      <SalePropertyBrowser properties={JSON.parse(JSON.stringify(serialized))} />

      <footer className="site-footer">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="logo-img" style={{ width: '28px', height: '28px' }} />
            <span style={{ fontWeight: 700, color: 'var(--cozy-dark)' }}>Cozy B&B</span>
          </div>
          © {new Date().getFullYear()} Cozy B&B · All rights reserved
        </div>
      </footer>
    </>
  )
}
