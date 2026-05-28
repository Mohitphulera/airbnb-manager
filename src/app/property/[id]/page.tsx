import { getPropertyById } from '@/actions/propertyDetailActions'
import { getReviewsForProperty, getPropertyAverageRating } from '@/actions/reviewActions'
import { getPropertyRevenueSummary } from '@/actions/propertyRevenueActions'
import Link from 'next/link'
import PropertyDetailClient from '@/components/PropertyDetailClient'
import ReviewSection from '@/components/ReviewSection'
import PropertyRevenueWidget from '@/components/PropertyRevenueWidget'
import MobileNav from '@/components/MobileNav'
import { auth } from '@/lib/auth'
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

  const bookings = property.bookings.map((b: any) => ({
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

  const serializedReviews = reviews.map((r: any) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="st-page cinema-detail-page">
      {/* ═══ Cinematic Navigation ═══ */}
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
            <Link href="/login" className="st-nav-link">Host Login</Link>
          </div>
          <div className="st-nav-actions">
            <Link href="/signup" className="st-btn-outline">List Your Property</Link>
          </div>
          <MobileNav activePage="home" />
        </div>
      </nav>

      <div style={{ paddingTop: '5rem' }}>
        {/* Admin Revenue Widget — only shown when logged in */}
        {await (async () => {
          const session = await auth()
          const isAdmin = !!session?.user
          if (!isAdmin) return null
          const revenue = await getPropertyRevenueSummary(id)
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
              <Link href="/" className="st-nav-brand">
                <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" style={{ filter: 'brightness(0.8)' }} />
                <span className="st-nav-name">Cozy B&B</span>
              </Link>
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
