import { getPropertyById } from '@/actions/propertyDetailActions'
import { getReviewsForProperty, getPropertyAverageRating } from '@/actions/reviewActions'
import { getPropertyRevenueSummary } from '@/actions/propertyRevenueActions'
import Link from 'next/link'
import PropertyDetailClient from '@/components/PropertyDetailClient'
import ReviewSection from '@/components/ReviewSection'
import PropertyRevenueWidget from '@/components/PropertyRevenueWidget'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [property, reviews, ratingData] = await Promise.all([
    getPropertyById(id),
    getReviewsForProperty(id),
    getPropertyAverageRating(id),
  ])

  if (!property) notFound()

  let images: string[] = []
  try { if (property.imageUrls) images = JSON.parse(property.imageUrls) } catch {}
  let amenities: string[] = []
  try { if (property.amenities) amenities = JSON.parse(property.amenities) } catch {}

  const host = property.user
  const bookings = property.bookings.map(b => ({
    checkIn: b.checkInDate.toISOString(),
    checkOut: b.checkOutDate.toISOString(),
  }))

  const serializedProperty = {
    ...property,
    // Fall back to the host's business number when the listing has none
    whatsappNumber: property.whatsappNumber || host.whatsappNumber,
    images,
    amenities,
    pBookings: bookings,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  }

  const serializedReviews = reviews.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="st-page cinema-detail-page">
      {/* ═══ Cinematic Navigation ═══ */}
      <nav className="cinema-nav st-nav">
        <div className="st-nav-inner">
          <Link href={`/${host.slug}`} className="st-nav-brand">
            {host.logoUrl ? (
              <img src={host.logoUrl} alt={host.businessName} style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>apartment</span>
              </div>
            )}
            <span className="st-nav-name">{host.businessName}</span>
          </Link>
          <div className="st-nav-links">
            <Link href={`/${host.slug}`} className="st-nav-link">All stays</Link>
          </div>
          <div className="st-nav-actions" />
        </div>
      </nav>

      <div style={{ paddingTop: '5rem' }}>
        {/* Admin Revenue Widget — only shown when logged in */}
        {await (async () => {
          // Returns null unless the viewer owns this property
          const revenue = await getPropertyRevenueSummary(id)
          if (!revenue) return null
          return (
            <div className="container" style={{ paddingTop: '1.5rem' }}>
              <PropertyRevenueWidget revenue={revenue} />
            </div>
          )
        })()}
        <PropertyDetailClient
          property={serializedProperty}
          avgRating={ratingData.avg}
          reviewCount={ratingData.count}
        />

        {/* Reviews Section */}
        <div className="container" style={{ paddingBottom: '2rem' }}>
          <ReviewSection
            propertyId={id}
            reviews={serializedReviews}
            avgRating={ratingData.avg}
            reviewCount={ratingData.count}
          />
        </div>
      </div>

      {/* ═══ Cinematic Footer ═══ */}
      <footer className="cinema-footer">
        <div className="cinema-footer-inner">
          <div className="st-footer-top">
            <div className="st-footer-brand">
              <Link href={`/${host.slug}`} className="st-nav-brand">
                <span className="st-nav-name">{host.businessName}</span>
              </Link>
              <p className="st-footer-tagline">
                Book directly with the host for the best rates.
              </p>
            </div>
            <div className="st-footer-cols">
              <div className="st-footer-col">
                <span className="st-footer-heading">Explore</span>
                <Link href={`/${host.slug}`}>All stays by {host.businessName}</Link>
              </div>
            </div>
          </div>
          <div className="st-footer-bottom">
            <p>&copy; {new Date().getFullYear()} {host.businessName} · Powered by <Link href="/">StayDesk</Link></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
