import { getPropertyById } from '@/actions/propertyDetailActions'
import { getReviewsForProperty, getPropertyAverageRating } from '@/actions/reviewActions'
import Link from 'next/link'
import PropertyDetailClient from '@/components/PropertyDetailClient'
import ReviewSection from '@/components/ReviewSection'
import MobileNav from '@/components/MobileNav'
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
    <div className="st-page">
      {/* Navigation */}
      <nav className="st-nav">
        <div className="st-nav-inner">
          <Link href="/" className="st-nav-brand">
            <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" />
            <span className="st-nav-name">Cozy B&B</span>
          </Link>
          <div className="st-nav-links">
            <Link href="/" className="st-nav-link">Airbnb Listings</Link>
            <Link href="/properties-for-sale" className="st-nav-link">Properties for Sale</Link>
            <Link href="/login" className="st-nav-link">Admin Login</Link>
          </div>
          <div className="st-nav-actions">
            <a href="https://wa.me/" target="_blank" className="st-btn-outline">WhatsApp Us</a>
          </div>
          <MobileNav />
        </div>
      </nav>

      <div style={{ paddingTop: '5rem' }}>
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

      {/* Footer */}
      <footer className="st-footer">
        <div className="st-footer-inner">
          <div className="st-footer-top">
            <div className="st-footer-brand">
              <Link href="/" className="st-nav-brand">
                <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="st-nav-logo" style={{ filter: 'grayscale(1) brightness(0.5)' }} />
                <span className="st-nav-name">Cozy B&B</span>
              </Link>
              <p className="st-footer-tagline">Premium stays and investment properties, curated for you.</p>
            </div>
            <div className="st-footer-cols">
              <div className="st-footer-col">
                <span className="st-footer-heading">Company</span>
                <Link href="/">Discover</Link>
                <Link href="/properties-for-sale">Investments</Link>
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
