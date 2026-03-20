import { getPropertyById } from '@/actions/propertyDetailActions'
import Link from 'next/link'
import PropertyDetailClient from '@/components/PropertyDetailClient'
import { notFound } from 'next/navigation'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await getPropertyById(id)

  if (!property) notFound()

  let images: string[] = []
  try { if (property.imageUrls) images = JSON.parse(property.imageUrls) } catch {}
  let amenities: string[] = []
  try { if (property.amenities) amenities = JSON.parse(property.amenities) } catch {}

  const bookings = property.bookings.map(b => ({
    checkIn: b.checkInDate.toISOString(),
    checkOut: b.checkOutDate.toISOString(),
  }))

  const serializedProperty = {
    ...property,
    images,
    amenities,
    pBookings: bookings,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  }

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
            <Link href="/" className="btn btn-primary" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              🏠 Stays
            </Link>
            <Link href="/properties-for-sale" className="btn btn-outline" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              🏷️ Buy Property
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ borderRadius: '24px', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}>
              Host Login
            </Link>
          </div>
        </div>
      </nav>

      <PropertyDetailClient property={serializedProperty} />

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
