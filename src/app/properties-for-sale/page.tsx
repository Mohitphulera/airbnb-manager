import { getPublicSaleProperties } from '@/actions/salePropertyActions'
import Link from 'next/link'
import SalePropertyBrowser from '@/components/SalePropertyBrowser'
import MobileNav from '@/components/MobileNav'
import ScrollReveal from '@/components/ScrollReveal'

export const dynamic = 'force-dynamic'

export default async function PropertiesForSalePage() {
  const properties = await getPublicSaleProperties()

  const serialized = properties.map(p => {
    let images: string[] = []
    try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
    let features: string[] = []
    try { if (p.features) features = JSON.parse(p.features) } catch {}
    return { ...p, images, features }
  })

  return (
    <div className="st-page" style={{ background: '#0a0a0f' }}>
      {/* Cinematic Navigation */}
      <nav className="cinema-nav st-nav">
        <div className="st-nav-inner">
          <Link href="/" className="st-nav-brand">
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>apartment</span>
            </div>
            <span className="st-nav-name">StayDesk</span>
          </Link>
          <div className="st-nav-links">
            <Link href="/" className="st-nav-link">Home</Link>
            <Link href="/properties-for-sale" className="st-nav-link st-nav-link-active">Properties for Sale</Link>
            <Link href="/login" className="st-nav-link">Host Login</Link>
          </div>
          <div className="st-nav-actions">
            <Link href="/signup" className="st-btn-outline">List Your Property</Link>
          </div>
          <MobileNav activePage="investments" />
        </div>
      </nav>

      {/* Cinematic Hero */}
      <section className="cinema-hero" style={{ minHeight: '60vh' }}>
        <div className="cinema-orb cinema-orb-1" />
        <div className="cinema-orb cinema-orb-2" />

        <div className="cinema-hero-inner" style={{ paddingBottom: '4rem' }}>
          <ScrollReveal>
            <span className="cinema-label">Investment-Grade Assets</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="cinema-hero-title" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)' }}>
              Investment<br /><em>Catalog</em>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="cinema-hero-subtitle">
              Curated opportunities in architectural excellence and high-yield real&nbsp;estate.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Property Browser */}
      <section className="cinema-section cinema-card-section" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <SalePropertyBrowser properties={JSON.parse(JSON.stringify(serialized))} />
      </section>

      {/* Cinematic Footer */}
      <footer className="cinema-footer">
        <div className="cinema-footer-inner">
          <div className="st-footer-top">
            <div className="st-footer-brand">
              <div className="st-nav-brand">
                <span className="st-nav-name">StayDesk</span>
              </div>
              <p className="st-footer-tagline">
                Property management and direct bookings for independent hosts.
              </p>
            </div>
            <div className="st-footer-cols">
              <div className="st-footer-col">
                <span className="st-footer-heading">Company</span>
                <Link href="/">Discover</Link>
                <Link href="/properties-for-sale">Investments</Link>
                <Link href="/login">Host Portal</Link>
              </div>
            </div>
          </div>
          <div className="st-footer-bottom">
            <p>&copy; {new Date().getFullYear()} StayDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
