import Link from 'next/link'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PropertyImage from '@/components/PropertyImage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

async function getTenantData(slug: string) {
  const user = await prisma.user.findUnique({
    where: { slug },
    include: {
      properties: { orderBy: { createdAt: 'desc' } },
      saleProperties: { where: { status: { not: 'SOLD' } }, orderBy: { createdAt: 'desc' } },
    },
  })
  return user
}

export default async function TenantPage({ params }: Props) {
  const { slug } = await params
  const owner = await getTenantData(slug)
  if (!owner) notFound()

  const { properties, saleProperties } = owner

  return (
    <div className="st-page" style={{ background: '#0a0a0f', minHeight: '100vh' }}>
      {/* Nav */}
      <nav className="cinema-nav st-nav">
        <div className="st-nav-inner">
          <div className="st-nav-brand">
            {owner.logoUrl ? (
              <img src={owner.logoUrl} alt={owner.businessName} className="st-nav-logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>apartment</span>
              </div>
            )}
            <span className="st-nav-name">{owner.businessName}</span>
          </div>
          <div className="st-nav-links">
            <a href="#rentals" className="st-nav-link st-nav-link-active">Rentals</a>
            {saleProperties.length > 0 && <a href="#forsale" className="st-nav-link">For Sale</a>}
          </div>
          <div className="st-nav-actions">
            {owner.whatsappNumber && (
              <a href={`https://wa.me/${owner.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="st-btn-outline">
                WhatsApp Us
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="cinema-hero" style={{ paddingTop: '8rem', paddingBottom: '4rem' }}>
        <div className="cinema-orb cinema-orb-1" />
        <div className="cinema-orb cinema-orb-2" />
        <div className="cinema-hero-inner" style={{ textAlign: 'center' }}>
          <span className="cinema-label">Welcome to</span>
          <h1 className="cinema-hero-title" style={{ marginTop: '0.5rem' }}>
            {owner.businessName}
          </h1>
          <p className="cinema-hero-subtitle">
            {properties.length} curated propert{properties.length === 1 ? 'y' : 'ies'} available for your stay
          </p>
          <a href="#rentals" className="cinema-search-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '2rem', padding: '0.875rem 2rem', textDecoration: 'none', borderRadius: '100px', fontSize: '0.875rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>explore</span>
            Browse Properties
          </a>
        </div>
      </section>

      {/* Rental Properties */}
      <section id="rentals" className="cinema-section cinema-card-section">
        <span className="cinema-section-label" style={{ color: '#1a1a1a' }}>Available Now</span>
        <h2 className="cinema-section-title" style={{ color: '#1a1a1a' }}>Rental Properties</h2>
        <p className="cinema-section-desc">Find your perfect stay from our curated collection.</p>

        <div className="st-grid" style={{ marginTop: '3rem' }}>
          {properties.map((p: any) => {
            let images: string[] = []
            try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
            return (
              <Link href={`/${slug}/property/${p.id}`} key={p.id} className="cinema-card">
                <div className="cinema-card-image">
                  {images.length > 0 ? (
                    <PropertyImage src={images[0]} alt={p.name} className="cinema-card-img" />
                  ) : (
                    <div className="st-card-placeholder">
                      <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>apartment</span>
                    </div>
                  )}
                  <div className="cinema-card-badge">{p.type === 'OWNED' ? 'Direct' : 'Partner'}</div>
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
            )
          })}
          {properties.length === 0 && (
            <div className="st-empty" style={{ gridColumn: '1/-1' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#d1d5db' }}>villa</span>
              <p>No properties listed yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* For Sale (if any) */}
      {saleProperties.length > 0 && (
        <section id="forsale" className="cinema-section-dark" style={{ paddingBlock: '4rem' }}>
          <div className="cinema-section-inner">
            <span className="cinema-section-label">Investment Opportunity</span>
            <h2 className="cinema-section-title" style={{ color: 'var(--cinema-text)' }}>Properties for Sale</h2>

            <div className="st-grid" style={{ marginTop: '2.5rem' }}>
              {saleProperties.map((p: any) => {
                let images: string[] = []
                try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
                return (
                  <div key={p.id} className="cinema-card">
                    <div className="cinema-card-image">
                      {images.length > 0 ? (
                        <PropertyImage src={images[0]} alt={p.title} className="cinema-card-img" />
                      ) : (
                        <div className="st-card-placeholder">
                          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>sell</span>
                        </div>
                      )}
                      <div className="cinema-card-badge" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>{p.propertyType}</div>
                    </div>
                    <div className="cinema-card-info">
                      <div className="cinema-card-row">
                        <div>
                          <h3 className="cinema-card-title">{p.title}</h3>
                          <p className="cinema-card-location">{p.location}</p>
                        </div>
                        <div className="cinema-card-price">
                          <p className="cinema-card-price-val">₹{(p.price / 100000).toFixed(0)}L</p>
                          <p className="cinema-card-price-unit">asking price</p>
                        </div>
                      </div>
                      {owner.whatsappNumber && (
                        <a
                          href={`https://wa.me/${owner.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi! I'm interested in ${p.title} listed on your website.`)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="cinema-card-cta"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#22c55e', color: '#fff', borderRadius: '8px', padding: '0.5rem', marginTop: '0.75rem' }}
                        >
                          Enquire on WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="cinema-footer" style={{ paddingBlock: '2.5rem' }}>
        <div className="cinema-footer-inner" style={{ textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8125rem' }}>
            © {new Date().getFullYear()} {owner.businessName} · Powered by{' '}
            <Link href="/" style={{ color: 'rgba(255,255,255,0.5)' }}>StayDesk</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
