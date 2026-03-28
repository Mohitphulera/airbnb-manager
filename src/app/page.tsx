import { getProperties } from '@/actions/propertyActions'
import { getBookings } from '@/actions/bookingActions'
import { getAllPropertyRatings } from '@/actions/reviewActions'
import Link from 'next/link'
import SearchFilter from '@/components/SearchFilter'
import DarkModeToggle from '@/components/DarkModeToggle'
import Image from 'next/image'
import FadeUp from '@/components/FadeUp'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [properties, bookings, ratings] = await Promise.all([
    getProperties(),
    getBookings(),
    getAllPropertyRatings(),
  ])

  const serialized = properties.map((p: any) => {
    let images: string[] = []
    try { if (p.imageUrls) images = JSON.parse(p.imageUrls) } catch {}
    let amenities: string[] = []
    try { if (p.amenities) amenities = JSON.parse(p.amenities) } catch {}
    
    const pBookings = bookings.filter((b: any) => b.propertyId === p.id).map((b: any) => ({
      checkIn: b.checkInDate.toISOString(),
      checkOut: b.checkOutDate.toISOString()
    }))

    const rating = ratings[p.id] || { avg: 0, count: 0 }
    
    return { ...p, images, amenities, pBookings, rating }
  })

  const totalBookings = bookings.length
  const totalProperties = properties.length
  const avgRating = Object.values(ratings).filter((r: any) => r.count > 0).reduce((sum: number, r: any) => sum + r.avg, 0) / Math.max(Object.values(ratings).filter((r: any) => r.count > 0).length, 1)

  return (
    <>
      {/* ───── Sticky Navigation ───── */}
      <nav style={{ position: 'fixed', top: 0, width: '100%', zIndex: 50, background: 'rgba(252, 249, 248, 0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 3rem', maxWidth: '1920px', margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.05em', color: '#1c1b1b' }}>
            COZY<span style={{ color: '#775a19' }}>.</span>
          </Link>
          <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', fontFamily: '"Noto Serif", serif', fontSize: '1.05rem', color: '#444748' }}>
            <Link href="/" style={{ color: '#1c1b1b', borderBottom: '1px solid #1c1b1b', paddingBottom: '0.25rem' }}>Discover</Link>
            <Link href="/properties-for-sale" style={{ transition: 'color 0.2s' }}>Investments</Link>
            <Link href="/login" style={{ transition: 'color 0.2s' }}>Host Portal</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <span className="material-icons-outlined" style={{ cursor: 'pointer', color: '#1c1b1b' }}>search</span>
            <Link href="/login" style={{ background: '#1c1b1b', color: '#ffffff', padding: '0.6rem 2rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
              Contact
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ background: '#fcf9f8', color: '#1c1b1b', minHeight: '100vh' }}>
        {/* ───── Hero Section ───── */}
        <section style={{ position: 'relative', height: '100vh', minHeight: '800px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.7), transparent)', zIndex: 1 }} />
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2560&q=80" 
              alt="Luxury Villa" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ position: 'relative', zIndex: 10, padding: '0 3rem', maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
            <FadeUp delay={0.1}>
              <span style={{ display: 'inline-block', padding: '0.35rem 1rem', background: '#ffdea5', color: '#5d4201', fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 700 }}>
                Exclusive Opportunities
              </span>
            </FadeUp>
            <FadeUp delay={0.2}>
              <h1 style={{ fontFamily: '"Noto Serif", serif', color: '#ffffff', fontSize: 'clamp(4rem, 8vw, 6.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 0.9, marginBottom: '2rem' }}>
                Escape to <br />Extraordinary
              </h1>
            </FadeUp>
            <FadeUp delay={0.3}>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'Inter, sans-serif', fontSize: '1.125rem', maxWidth: '540px', marginBottom: '3rem', lineHeight: 1.7 }}>
                The finest architectural gems curated for the global investor. Access properties that define the future of luxury living and wealth preservation.
              </p>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href="#collections" style={{ background: '#ffffff', color: '#1c1b1b', padding: '1.25rem 3rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Explore Gems
                </Link>
                <Link href="/properties-for-sale" style={{ border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '1.25rem 3rem', fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  Request Access
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ───── Curated Collections ───── */}
        <section id="collections" style={{ padding: '8rem 3rem', maxWidth: '1920px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5rem' }}>
            <div style={{ maxWidth: '640px' }}>
              <h2 style={{ fontFamily: '"Noto Serif", serif', fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.5rem', color: '#1c1b1b' }}>
                Curated Collections
              </h2>
              <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', fontSize: '1.125rem', lineHeight: 1.6 }}>
                Hand-picked by our resident architects and investment analysts, these properties represent the pinnacle of design and yield.
              </p>
            </div>
            <Link href="/properties-for-sale" style={{ color: '#775a19', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', borderBottom: '1px solid rgba(119,90,25,0.3)', paddingBottom: '0.4rem', fontWeight: 600 }}>
              View All Destinations
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '4rem' }}>
            {serialized.slice(0, 3).map((p, i) => (
              <FadeUp key={p.id} delay={0.1 * i}>
                <Link href={`/property/${p.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ position: 'relative', aspectRatio: '4/5', marginBottom: '2rem', overflow: 'hidden', background: '#e5e2e1' }}>
                    <img 
                      src={p.images[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800'} 
                      alt={p.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease', filter: 'grayscale(15%)' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
                      <span style={{ background: '#ffffff', color: '#1c1b1b', padding: '0.4rem 1rem', fontSize: '0.625rem', fontFamily: 'Inter, sans-serif', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 700 }}>
                        {p.type === 'OWNED' ? 'Exclusive' : 'Partner'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#1c1b1b' }}>{p.name}</h3>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{p.location}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '1.5rem' }}>
                      <div>
                        <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', color: '#444748', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Nightly Rate</span>
                        <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.25rem', fontWeight: 700, color: '#1c1b1b' }}>₹{p.pricePerNight.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', color: '#444748', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Avg Rating</span>
                        <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.25rem', fontWeight: 700, color: '#775a19' }}>{p.rating?.avg ? `${p.rating.avg.toFixed(1)} / 5.0` : 'New'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* ───── Investment Philosophy ───── */}
        <section style={{ padding: '10rem 3rem', background: '#eae7e7', marginTop: '6rem' }}>
          <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-3rem', left: '-3rem', width: '12rem', height: '12rem', background: 'rgba(255, 222, 165, 0.4)', zIndex: 0 }} />
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
                alt="Architecture" 
                style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }} 
              />
              <div style={{ position: 'absolute', bottom: '-2rem', right: '-2rem', padding: '3rem', background: '#1c1b1b', color: '#ffffff', zIndex: 2, maxWidth: '320px' }}>
                <p style={{ fontFamily: '"Noto Serif", serif', fontStyle: 'italic', fontSize: '1.25rem', lineHeight: 1.4 }}>
                  "Architecture is the art of how we elevate space."
                </p>
                <span style={{ display: 'block', marginTop: '1.5rem', fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', opacity: 0.6 }}>— The Curator</span>
              </div>
            </div>
            
            <div>
              <h2 style={{ fontFamily: '"Noto Serif", serif', fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '4rem', color: '#1c1b1b' }}>
                Investment <br/>Philosophy
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem 3rem' }}>
                <div>
                  <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '2.5rem', color: '#775a19', display: 'block', marginBottom: '1rem' }}>01</span>
                  <h4 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1c1b1b' }}>Vetted Assets</h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', lineHeight: 1.6, fontSize: '0.9375rem' }}>Every property undergoes a strict architectural and financial audit to ensure longevity and capital growth.</p>
                </div>
                <div>
                  <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '2.5rem', color: '#775a19', display: 'block', marginBottom: '1rem' }}>02</span>
                  <h4 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1c1b1b' }}>Global Mobility</h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', lineHeight: 1.6, fontSize: '0.9375rem' }}>Investors gain exclusive access to stay at any property within our portfolio worldwide at preferred rates.</p>
                </div>
                <div>
                  <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '2.5rem', color: '#775a19', display: 'block', marginBottom: '1rem' }}>03</span>
                  <h4 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1c1b1b' }}>Fractional Ownership</h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', lineHeight: 1.6, fontSize: '0.9375rem' }}>Diversify your portfolio by owning high-yield shares in multi-million dollar architectural masterpieces.</p>
                </div>
                <div>
                  <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '2.5rem', color: '#775a19', display: 'block', marginBottom: '1rem' }}>04</span>
                  <h4 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#1c1b1b' }}>End-to-End Mgmt</h4>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', lineHeight: 1.6, fontSize: '0.9375rem' }}>From interior maintenance to high-end concierge services, we handle the complexity of asset management.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───── Full Search / Booking ───── */}
        <section style={{ padding: '8rem 3rem', maxWidth: '1920px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontFamily: '"Noto Serif", serif', fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#1c1b1b', marginBottom: '1rem' }}>Explore All Destinations</h2>
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', fontSize: '1.125rem' }}>Find the perfect architectural retreat for your next stay.</p>
          </div>
          <SearchFilter properties={JSON.parse(JSON.stringify(serialized))} />
        </section>

        {/* ───── Footer ───── */}
        <footer style={{ background: '#fcf9f8', padding: '6rem 3rem 3rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4rem', marginBottom: '6rem' }}>
            <div>
              <div style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1b1b', marginBottom: '1.5rem' }}>COZY<span style={{ color: '#775a19' }}>.</span></div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#858383', lineHeight: 1.8 }}>
                Defining the future of architectural investment since 2012.
              </p>
            </div>
            <div>
              <h5 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1c1b1b', marginBottom: '1.5rem' }}>Experience</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <Link href="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#858383' }}>Discover</Link>
                <Link href="/properties-for-sale" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#858383' }}>Investments</Link>
              </div>
            </div>
            <div>
              <h5 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1c1b1b', marginBottom: '1.5rem' }}>Legal</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#858383', cursor: 'pointer' }}>Terms</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#858383', cursor: 'pointer' }}>Privacy</span>
              </div>
            </div>
            <div>
              <h5 style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1c1b1b', marginBottom: '1.5rem' }}>Access</h5>
              <Link href="/login" style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#858383' }}>Host Login</Link>
            </div>
          </div>
          <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '2rem' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#858383' }}>
              &copy; {new Date().getFullYear()} COZY ARCHITECTURAL INVESTMENTS
            </p>
            <span className="material-icons-outlined" style={{ color: '#858383', fontSize: '1.25rem' }}>language</span>
          </div>
        </footer>
      </main>
    </>
  )
}
