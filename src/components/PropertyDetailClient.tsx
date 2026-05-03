'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isWithinInterval, startOfDay, differenceInDays } from 'date-fns'
import Link from 'next/link'
import GuestBookingForm from './GuestBookingForm'
import ShareProperty from './ShareProperty'

const AMENITY_ICONS: Record<string, string> = {
  'WiFi': 'wifi', 'Pool': 'pool', 'AC': 'ac_unit', 'Kitchen': 'countertops',
  'Parking': 'local_parking', 'TV': 'tv', 'Washer': 'local_laundry_service', 'Pet-Friendly': 'pets',
  'Gym': 'fitness_center', 'Balcony': 'balcony',
}

export default function PropertyDetailClient({ property, avgRating, reviewCount }: { property: any; avgRating: number; reviewCount: number }) {
  const [currentImg, setCurrentImg] = useState(0)
  const [selectedRange, setSelectedRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined })
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const images: string[] = property.images || []
  const amenities: string[] = property.amenities || []
  const bookings = property.pBookings || []

  const disabledDates = (date: Date) => {
    if (startOfDay(date) < startOfDay(new Date())) return true
    for (const b of bookings) {
      if (isWithinInterval(date, { start: new Date(b.checkIn), end: new Date(b.checkOut) })) return true
    }
    return false
  }

  const nights = selectedRange.from && selectedRange.to
    ? differenceInDays(selectedRange.to, selectedRange.from)
    : 0

  const totalPrice = nights * property.pricePerNight

  const handleWhatsApp = () => {
    if (!selectedRange.from || !selectedRange.to) return
    const number = property.whatsappNumber
    if (!number) { alert("Host contact not available."); return }
    const msg = `Hi! I'd like to book "${property.name}" in ${property.location} from ${format(selectedRange.from, 'PPP')} to ${format(selectedRange.to, 'PPP')} (${nights} nights, ₹${totalPrice.toLocaleString('en-IN')}). Is it available?`
    window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <>
      {/* ═══ Cinematic Lightbox ═══ */}
      <AnimatePresence>
        {lightbox && images.length > 0 && (
          <motion.div
            className="cinema-lightbox"
            onClick={() => setLightbox(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.img
              src={images[currentImg]}
              alt="Property"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ cursor: 'default' }}
            />
            {images.length > 1 && (
              <>
                <button
                  className="cinema-lightbox-btn"
                  style={{ left: '20px' }}
                  onClick={(e) => { e.stopPropagation(); setCurrentImg(i => (i - 1 + images.length) % images.length) }}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  className="cinema-lightbox-btn"
                  style={{ right: '20px' }}
                  onClick={(e) => { e.stopPropagation(); setCurrentImg(i => (i + 1) % images.length) }}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </>
            )}
            <button className="cinema-lightbox-close" onClick={() => setLightbox(false)}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
            <div className="cinema-lightbox-counter">
              {currentImg + 1} of {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* ═══ Breadcrumb ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <Link href="/" className="cinema-breadcrumb">
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
            Back to all stays
          </Link>
        </motion.div>

        {/* ═══ Image Gallery ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {images.length > 0 ? (
            <div
              className="cinema-gallery"
              style={{ gridTemplateColumns: images.length === 1 ? '1fr' : '2fr 1fr' }}
            >
              <div
                className="cinema-gallery-main"
                onClick={() => setLightbox(true)}
                style={{
                  backgroundImage: `url(${images[currentImg]})`,
                  borderRadius: images.length === 1 ? '16px' : '0',
                }}
              />
              {images.length > 1 && (
                <div className="cinema-gallery-side" style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${Math.min(images.length - 1, 3)}, 1fr)`,
                  gap: '6px', maxHeight: '520px', overflow: 'hidden',
                }}>
                  {images.slice(0, 4).map((url, i) => (
                    i > 0 && (
                      <div
                        key={i}
                        className="cinema-gallery-thumb"
                        onClick={() => { setCurrentImg(i); setLightbox(true) }}
                        style={{ backgroundImage: `url(${url})` }}
                      >
                        {i === 3 && images.length > 4 && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(2px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '1rem',
                            fontFamily: "'Manrope', sans-serif",
                          }}>
                            +{images.length - 4} more
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              height: '260px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.9375rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', marginRight: '0.75rem', opacity: 0.4 }}>image</span>
              No photos available
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="cinema-thumbstrip">
              {images.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentImg(i)}
                  className={`cinema-thumb ${i === currentImg ? 'cinema-thumb-active' : ''}`}
                  style={{ backgroundImage: `url(${url})` }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ═══ Content Grid ═══ */}
        <motion.div
          className="detail-content-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          {/* Left Column */}
          <div>
            {/* Title + Location */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <h1 className="cinema-detail-title">{property.name}</h1>
                {property.type === 'OWNED' && <span className="cinema-detail-badge cinema-detail-badge-verified">Verified</span>}
                {property.type === 'COMMISSION' && <span className="cinema-detail-badge cinema-detail-badge-partner">Partner</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span className="cinema-detail-location">
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                  {property.location}
                </span>
                {reviewCount > 0 && (
                  <span className="cinema-rating">
                    <span className="cinema-rating-star">★</span>
                    <span style={{ fontWeight: 700 }}>{avgRating}</span>
                    <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>({reviewCount})</span>
                  </span>
                )}
                <ShareProperty property={property} />
              </div>
            </div>

            {/* Mobile Price Bar */}
            <div className="cinema-mobile-price">
              <div>
                <span className="cinema-booking-price" style={{ fontSize: '1.375rem' }}>₹{property.pricePerNight.toLocaleString('en-IN')}</span>
                <span className="cinema-booking-price-unit">/ night</span>
              </div>
            </div>

            <div className="cinema-divider" />

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h3 className="cinema-detail-section-title">About this place</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.8, fontSize: '0.9rem' }}>
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <>
                <div className="cinema-divider" />
                <div style={{ marginBottom: '1.25rem' }}>
                  <h3 className="cinema-detail-section-title">What this place offers</h3>
                  <div className="amenity-detail-grid">
                    {(showAllAmenities ? amenities : amenities.slice(0, 6)).map((a: string) => (
                      <div key={a} className="cinema-amenity">
                        <span className="material-symbols-outlined">{AMENITY_ICONS[a] || 'check_circle'}</span>
                        <span style={{ fontWeight: 500 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                  {amenities.length > 6 && !showAllAmenities && (
                    <button
                      onClick={() => setShowAllAmenities(true)}
                      style={{
                        marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '8px',
                        border: '1px solid rgba(201,168,76,0.2)', background: 'transparent',
                        color: 'var(--cinema-gold)', fontFamily: "'Manrope', sans-serif",
                        fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.15em',
                        textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.3s',
                      }}
                    >
                      Show all {amenities.length} amenities
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Policies */}
            <div className="cinema-divider" />
            <div>
              <h3 className="cinema-detail-section-title">Things to know</h3>
              <div className="policies-grid">
                <div className="cinema-policy-card">
                  <h4>Check-in</h4>
                  <p>After 2:00 PM</p>
                  <p>Self check-in with lockbox</p>
                </div>
                <div className="cinema-policy-card">
                  <h4>Check-out</h4>
                  <p>Before 11:00 AM</p>
                </div>
                <div className="cinema-policy-card">
                  <h4>House Rules</h4>
                  <p>No smoking</p>
                  <p>No parties or events</p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ Right Column — Booking Card ═══ */}
          <div className="booking-card-wrap">
            <div className="cinema-booking-card">
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '1.5rem' }}>
                <span className="cinema-booking-price">₹{property.pricePerNight.toLocaleString('en-IN')}</span>
                <span className="cinema-booking-price-unit">/ night</span>
              </div>

              {/* Calendar */}
              <div className="cinema-calendar-wrap">
                <p className="cinema-calendar-label">Select your dates</p>

                <style dangerouslySetInnerHTML={{__html: `
                  .rdp { --rdp-cell-size: 34px; --rdp-accent-color: #c9a84c; font-size: 0.75rem; margin: 0; width: 100%; }
                  .rdp-month { width: 100%; }
                  .rdp-table { width: 100%; }
                  .rdp-day_selected { background-color: #c9a84c !important; color: #0a0a0f !important; }
                  .rdp-day_disabled { opacity: 0.2; text-decoration: line-through; }
                  .rdp-day_range_start, .rdp-day_range_end { background: #c9a84c !important; color: #0a0a0f !important; border-radius: 50% !important; }
                `}} />

                <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                  <DayPicker mode="range" selected={selectedRange as any} onSelect={setSelectedRange as any} disabled={disabledDates} numberOfMonths={1} />
                </div>
              </div>

              {/* Price Breakdown */}
              <AnimatePresence>
                {nights > 0 && (
                  <motion.div
                    className="cinema-price-breakdown"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6b7280' }}>₹{property.pricePerNight.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}</span>
                      <span style={{ fontWeight: 600 }}>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ height: '1px', background: 'rgba(201,168,76,0.15)', margin: '0.5rem 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--cinema-gold)' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA Buttons */}
              {showBookingForm && selectedRange.from && selectedRange.to ? (
                <GuestBookingForm
                  property={property}
                  checkIn={selectedRange.from}
                  checkOut={selectedRange.to}
                  nights={nights}
                  totalPrice={totalPrice}
                  onClose={() => setShowBookingForm(false)}
                />
              ) : (
                <>
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className={`cinema-book-btn ${selectedRange.from && selectedRange.to ? 'cinema-book-btn-gold' : ''}`}
                    disabled={!selectedRange.from || !selectedRange.to}
                  >
                    {selectedRange.from && selectedRange.to
                      ? `Book Now — ₹${totalPrice.toLocaleString('en-IN')}`
                      : 'Pick dates to book'
                    }
                  </button>

                  {selectedRange.from && selectedRange.to && (
                    <button onClick={handleWhatsApp} className="cinema-whatsapp-btn">
                      Or message on WhatsApp
                    </button>
                  )}

                  {selectedRange.from && selectedRange.to && (
                    <p style={{ textAlign: 'center', fontSize: '0.625rem', color: '#9ca3af', marginTop: '0.625rem', fontFamily: "'Manrope', sans-serif", fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      No payment needed now
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
