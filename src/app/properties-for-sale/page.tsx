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
    <main style={{ minHeight: '100vh', background: '#fcf9f8', color: '#1c1b1b', overflowX: 'hidden' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#1c1b1b', color: '#ffffff', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#ffffff', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Inspire</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#775a19', marginTop: '0.25rem' }}>& Invest</span>
          </Link>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#ffffff', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.2s' }}>Curated Stays</Link>
            <Link href="/properties-for-sale" style={{ textDecoration: 'none', color: '#775a19', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: '1px solid #775a19', paddingBottom: '0.25rem' }}>Acquisitions</Link>
            <Link href="/login" style={{ textDecoration: 'none', color: '#1c1b1b', background: '#ffffff', padding: '0.75rem 1.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s' }}>Equity Partner Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ padding: '8rem 2rem 6rem', background: '#fcf9f8', color: '#1c1b1b', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FadeUp delay={0.1}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(119,90,25,0.1)', color: '#775a19', padding: '0.5rem 1rem', fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#775a19' }} />
              Exclusive Portfolio
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <h1 style={{ fontFamily: '"Noto Serif", serif', fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              Acquire <br /> Exceptional Spaces
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.25rem', color: '#444748', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto' }}>
              Discover architectural gems curated for high-yield returns and unparalleled equity growth.
            </p>
          </FadeUp>
        </div>
      </header>

      {/* Browser */}
      <div style={{ padding: '0 2rem' }}>
        <SalePropertyBrowser properties={JSON.parse(JSON.stringify(serialized))} />
      </div>

      <footer style={{ background: '#1c1b1b', color: '#ffffff', padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '3rem' }}>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>Inspire</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#775a19', marginTop: '0.25rem' }}>& Invest</span>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#a0a0a0', maxWidth: '300px', lineHeight: 1.6 }}>
              Curating architectural excellence and high-yield equity opportunities globally.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.5rem' }}>Portfolio</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#a0a0a0', textDecoration: 'none', transition: 'color 0.2s' }}>Curated Stays</Link>
                <Link href="/properties-for-sale" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#a0a0a0', textDecoration: 'none', transition: 'color 0.2s' }}>Acquisitions</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.5rem' }}>System</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="/login" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#a0a0a0', textDecoration: 'none', transition: 'color 0.2s' }}>Equity Partner Login</Link>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1920px', margin: '4rem auto 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#a0a0a0' }}>© {new Date().getFullYear()} Inspire & Invest. All rights reserved.</span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#a0a0a0', letterSpacing: '0.05em' }}>DESIGNED FOR EXCELLENCE</span>
        </div>
      </footer>
    </main>
  )
}
