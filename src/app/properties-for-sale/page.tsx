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
    <>
      {/* Sticky Nav */}
      <nav className="public-nav">
        <div className="container public-nav-inner">
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="logo-img" style={{ width: '38px', height: '38px' }} />
            <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.03em', color: 'var(--cozy-dark)' }}>Cozy B&B</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link href="/" className="btn btn-outline" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              🏠 Stays
            </Link>
            <Link href="/properties-for-sale" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              🏷️ Buy Property
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="container hero-section fade-up">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ECFDF5', padding: '0.35rem 0.875rem', borderRadius: '20px', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--cozy-success)', fontWeight: 600 }}>
            🏷️ Premium properties for sale
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, maxWidth: '560px', lineHeight: '1.1', marginBottom: '0.75rem', letterSpacing: '-0.035em' }}>
            Find your dream
            <br />
            <span className="gradient-text">property to own</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', fontSize: '1.0625rem', lineHeight: '1.7' }}>
            Explore our curated selection of apartments, villas, plots, and more. Inquire directly and make it yours.
          </p>
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
