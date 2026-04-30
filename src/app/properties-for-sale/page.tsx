import { getAvailableSaleProperties } from '@/actions/salePropertyActions'
import Link from 'next/link'
import SalePropertyBrowser from '@/components/SalePropertyBrowser'
import MobileNav from '@/components/MobileNav'
import ScrollReveal from '@/components/ScrollReveal'

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
    <div className="st-page" style={{ background: '#0a0a0f' }}>
      {/* Cinematic Navigation */}
      <nav className="cinema-nav st-nav">
        <div className="st-nav-inner">
          <Link href="/" className="st-nav-brand">
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" />
            <span className="st-nav-name">Cozy B&B</span>
          </Link>
          <div className="st-nav-links">
            <Link href="/" className="st-nav-link">Airbnb Listings</Link>
            <Link href="/properties-for-sale" className="st-nav-link st-nav-link-active">Properties for Sale</Link>
            <Link href="/login" className="st-nav-link">Admin Login</Link>
          </div>
          <div className="st-nav-actions">
            <a href="https://wa.me/" target="_blank" className="st-btn-outline">WhatsApp Us</a>
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
