import Link from 'next/link'
import prisma from '@/lib/prisma'
import ScrollReveal, { StaggerGroup, StaggerItem } from '@/components/ScrollReveal'

export const dynamic = 'force-dynamic'

async function getStats() {
  try {
    const [owners, properties, bookings] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.booking.count(),
    ])
    return { owners, properties, bookings }
  } catch { return { owners: 0, properties: 0, bookings: 0 } }
}

export default async function PlatformLandingPage() {
  const stats = await getStats()

  const features = [
    { icon: 'dashboard', title: 'Smart Dashboard', desc: 'Revenue analytics, occupancy tracking, P&L reports — everything at a glance.' },
    { icon: 'calendar_today', title: 'Booking Calendar', desc: 'Visual calendar with real-time availability, check-in/check-out alerts, and clash detection.' },
    { icon: 'receipt_long', title: 'Bill Generator', desc: 'Generate professional PDF bills for guests in one click, pre-filled from bookings.' },
    { icon: 'group', title: 'Guest CRM', desc: 'Track loyalty tiers, stay history, and preferences for every guest automatically.' },
    { icon: 'link', title: 'Your Own URL', desc: 'Share yoursite.com/your-brand — a beautiful public listing page for your guests.' },
    { icon: 'trending_up', title: 'Pricing Intelligence', desc: 'AI-driven pricing suggestions based on your occupancy and demand trends.' },
  ]

  return (
    <div className="st-page" style={{ background: '#0a0a0f' }}>
      {/* ═══ Nav ═══ */}
      <nav className="cinema-nav st-nav">
        <div className="st-nav-inner">
          <Link href="/" className="st-nav-brand">
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>apartment</span>
            </div>
            <span className="st-nav-name">StayDesk</span>
          </Link>
          <div className="st-nav-links">
            <a href="#features" className="st-nav-link">Features</a>
            <a href="#how-it-works" className="st-nav-link">How It Works</a>
            <Link href="/login" className="st-nav-link">Sign In</Link>
          </div>
          <div className="st-nav-actions">
            <Link href="/signup" className="st-btn-outline" style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', color: '#fff', fontWeight: 700 }}>
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="cinema-hero">
        <div className="cinema-orb cinema-orb-1" />
        <div className="cinema-orb cinema-orb-2" />
        <div className="cinema-orb cinema-orb-3" />

        <div className="cinema-hero-inner">
          <ScrollReveal>
            <span className="cinema-label">Property Management Platform</span>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h1 className="cinema-hero-title">
              Manage your rentals.<br /><em>Share your brand.</em>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <p className="cinema-hero-subtitle">
              A complete property management suite for independent hosts — with your own shareable listing page at <strong style={{ color: '#c9a84c' }}>yoursite.com/your-brand</strong>.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.35}>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
              <Link href="/signup" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                color: '#fff', fontWeight: 700, textDecoration: 'none',
                padding: '0.875rem 2rem', borderRadius: '100px', fontSize: '0.9375rem',
                boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
                Start for Free
              </Link>
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                color: 'rgba(255,255,255,0.7)', fontWeight: 600, textDecoration: 'none',
                padding: '0.875rem 1.5rem', borderRadius: '100px', fontSize: '0.9375rem',
                border: '1px solid rgba(255,255,255,0.15)',
              }}>
                Sign In →
              </Link>
            </div>
          </ScrollReveal>

          {/* Stats */}
          <ScrollReveal delay={0.5}>
            <div className="cinema-stats">
              <div className="cinema-stat">
                <span className="cinema-stat-value">{stats.owners > 0 ? `${stats.owners}+` : '∞'}</span>
                <span className="cinema-stat-label">Property Owners</span>
              </div>
              <div className="cinema-stat">
                <span className="cinema-stat-value">{stats.properties > 0 ? `${stats.properties}+` : '0'}</span>
                <span className="cinema-stat-label">Properties Listed</span>
              </div>
              <div className="cinema-stat">
                <span className="cinema-stat-value">{stats.bookings > 0 ? `${stats.bookings}+` : '0'}</span>
                <span className="cinema-stat-label">Bookings Managed</span>
              </div>
              <div className="cinema-stat">
                <span className="cinema-stat-value">Free</span>
                <span className="cinema-stat-label">To Get Started</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section id="features" className="cinema-section cinema-card-section">
        <ScrollReveal>
          <span className="cinema-section-label" style={{ color: '#1a1a1a' }}>Everything You Need</span>
          <h2 className="cinema-section-title" style={{ color: '#1a1a1a' }}>Built for property owners</h2>
          <p className="cinema-section-desc">
            From booking management to guest loyalty — all the tools independent hosts need to run their business professionally.
          </p>
        </ScrollReveal>

        <StaggerGroup style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
          {features.map((f) => (
            <StaggerItem key={f.title}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563eb' }}>{f.icon}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ═══ How It Works ═══ */}
      <section id="how-it-works" className="cinema-section-dark" style={{ paddingBlock: '5rem' }}>
        <div className="cinema-section-inner">
          <ScrollReveal>
            <span className="cinema-section-label">Simple Setup</span>
            <h2 className="cinema-section-title" style={{ color: 'var(--cinema-text)' }}>Live in 3 minutes</h2>
          </ScrollReveal>

          <StaggerGroup className="cinema-features" style={{ marginTop: '3rem' }}>
            {[
              { step: '01', icon: 'person_add', title: 'Create your account', desc: 'Sign up with your business name and pick your unique URL slug.' },
              { step: '02', icon: 'add_home', title: 'Add your properties', desc: 'List your rentals with photos, pricing, and amenities.' },
              { step: '03', icon: 'share', title: 'Share your link', desc: 'Send guests to yoursite.com/your-brand to browse and request bookings.' },
            ].map((s) => (
              <StaggerItem key={s.step}>
                <div className="cinema-feature">
                  <div className="cinema-feature-icon" style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#c9a84c', color: '#000', fontSize: '0.5rem', fontWeight: 800, borderRadius: '4px', padding: '2px 5px' }}>{s.step}</span>
                    <span className="material-symbols-outlined">{s.icon}</span>
                  </div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="cinema-cta">
        <div className="cinema-cta-inner">
          <ScrollReveal>
            <span className="cinema-section-label">Get Started Today</span>
            <h2 className="cinema-section-title" style={{ color: 'var(--cinema-text)' }}>Your properties deserve<br />better management</h2>
            <p className="cinema-section-desc" style={{ color: 'var(--cinema-text-muted)', marginInline: 'auto', marginBottom: '2rem' }}>
              Join property owners already managing their rentals with StayDesk.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', fontWeight: 700, textDecoration: 'none',
              padding: '1rem 2.5rem', borderRadius: '100px', fontSize: '1rem',
              boxShadow: '0 8px 32px rgba(37,99,235,0.35)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>rocket_launch</span>
              Create Free Account
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="cinema-footer">
        <div className="cinema-footer-inner">
          <div className="st-footer-top">
            <div className="st-footer-brand">
              <div className="st-nav-brand">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>apartment</span>
                </div>
                <span className="st-nav-name">StayDesk</span>
              </div>
              <p className="st-footer-tagline">
                The all-in-one property management platform for independent hosts.
              </p>
            </div>
            <div className="st-footer-cols">
              <div className="st-footer-col">
                <span className="st-footer-heading">Product</span>
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <Link href="/signup">Sign Up</Link>
                <Link href="/login">Sign In</Link>
              </div>
              <div className="st-footer-col">
                <span className="st-footer-heading">Legal</span>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="st-footer-bottom">
            <p>© {new Date().getFullYear()} StayDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
