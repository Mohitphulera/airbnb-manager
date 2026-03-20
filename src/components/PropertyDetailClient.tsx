'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isWithinInterval, startOfDay, differenceInDays } from 'date-fns'
import Link from 'next/link'

const AMENITY_ICONS: Record<string, string> = {
  'WiFi': '📶', 'Pool': '🏊', 'AC': '❄️', 'Kitchen': '🍳',
  'Parking': '🅿️', 'TV': '📺', 'Washer': '👕', 'Pet-Friendly': '🐾',
  'Gym': '💪', 'Balcony': '🌅',
}

export default function PropertyDetailClient({ property }: { property: any }) {
  const [currentImg, setCurrentImg] = useState(0)
  const [selectedRange, setSelectedRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined })
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [lightbox, setLightbox] = useState(false)

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
      {/* Lightbox */}
      {lightbox && images.length > 0 && (
        <div onClick={() => setLightbox(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
        }}>
          <img
            src={images[currentImg]}
            alt="Property"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          {images.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImg(i => (i - 1 + images.length) % images.length) }}
                style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                ‹
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImg(i => (i + 1) % images.length) }}
                style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                ›
              </button>
            </>
          )}
          <button onClick={() => setLightbox(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '20px', cursor: 'pointer' }}>✕</button>
          <div style={{ position: 'absolute', bottom: '24px', color: '#fff', fontSize: '0.875rem', fontWeight: 600 }}>
            {currentImg + 1} / {images.length}
          </div>
        </div>
      )}

      <div className="container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        {/* Breadcrumb */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
          <Link href="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to all stays</Link>
        </div>

        {/* Image Gallery */}
        <div className="fade-up fade-up-1" style={{ marginBottom: '2rem' }}>
          {images.length > 0 ? (
            <div className="detail-gallery" style={{
              display: 'grid',
              gridTemplateColumns: images.length === 1 ? '1fr' : '2fr 1fr',
              gap: '0.5rem',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              maxHeight: '460px',
            }}>
              {/* Main image */}
              <div onClick={() => setLightbox(true)} style={{
                cursor: 'zoom-in',
                backgroundImage: `url(${images[currentImg]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '300px',
                borderRadius: images.length === 1 ? 'var(--radius-xl)' : '0',
                transition: 'transform 0.3s ease',
              }} />

              {/* Thumbnail column */}
              {images.length > 1 && (
                <div style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${Math.min(images.length - 1, 3)}, 1fr)`,
                  gap: '0.5rem',
                  maxHeight: '460px',
                  overflow: 'hidden',
                }}>
                  {images.slice(0, 4).map((url, i) => (
                    i > 0 && (
                      <div key={i} onClick={() => { setCurrentImg(i); setLightbox(true) }} style={{
                        cursor: 'zoom-in',
                        backgroundImage: `url(${url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}>
                        {i === 3 && images.length > 4 && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: '1.125rem',
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
              height: '320px', background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1rem'
            }}>
              📷 No photos available
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {images.map((url, i) => (
                <div key={i} onClick={() => setCurrentImg(i)} style={{
                  width: '72px', height: '52px', borderRadius: '8px', overflow: 'hidden',
                  border: i === currentImg ? '2.5px solid var(--primary)' : '2px solid transparent',
                  cursor: 'pointer', flexShrink: 0, transition: 'border-color 0.2s',
                  backgroundImage: `url(${url})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  opacity: i === currentImg ? 1 : 0.6,
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="fade-up fade-up-2" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Left Column — Details */}
          <div>
            {/* Title + Location */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>{property.name}</h1>
                {property.type === 'OWNED' && <span className="badge badge-blue">✓ Verified</span>}
                {property.type === 'COMMISSION' && <span className="badge badge-yellow">Partner</span>}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                📍 {property.location}
              </p>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />

            {/* Description */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>About this place</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9375rem' }}>
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <>
                <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>What this place offers</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {(showAllAmenities ? amenities : amenities.slice(0, 6)).map((a: string) => (
                      <div key={a} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.75rem 1rem', borderRadius: '12px',
                        border: '1px solid var(--border)', background: '#fff',
                        fontSize: '0.9375rem',
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>{AMENITY_ICONS[a] || '✦'}</span>
                        <span style={{ fontWeight: 500 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                  {amenities.length > 6 && !showAllAmenities && (
                    <button onClick={() => setShowAllAmenities(true)} className="btn btn-outline" style={{ marginTop: '1rem', borderRadius: '8px' }}>
                      Show all {amenities.length} amenities
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Policies */}
            <div style={{ height: '1px', background: 'var(--border)', margin: '1.5rem 0' }} />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Things to know</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check-in</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>After 2:00 PM</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Self check-in with lockbox</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Check-out</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>Before 11:00 AM</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>House Rules</h4>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>No smoking</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>No parties or events</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Booking Card */}
          <div style={{
            position: 'sticky', top: '5rem',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: '1.5rem',
            boxShadow: 'var(--shadow-card)',
          }}>
            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{property.pricePerNight.toLocaleString('en-IN')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>/ night</span>
            </div>

            {/* Calendar */}
            <div style={{ borderRadius: '12px', border: '1px solid var(--border)', padding: '0.75rem', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Select your dates
              </p>

              <style dangerouslySetInnerHTML={{__html: `
                .rdp { --rdp-cell-size: 38px; --rdp-accent-color: var(--primary); font-size: 0.8125rem; margin: 0; }
                .rdp-day_selected { background-color: var(--primary) !important; color: #fff !important; }
                .rdp-day_disabled { opacity: 0.2; text-decoration: line-through; }
                .rdp-day_range_start, .rdp-day_range_end { background: var(--primary) !important; color: #fff !important; border-radius: 50% !important; }
              `}} />

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DayPicker mode="range" selected={selectedRange as any} onSelect={setSelectedRange as any} disabled={disabledDates} numberOfMonths={1} />
              </div>
            </div>

            {/* Price Breakdown */}
            {nights > 0 && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'var(--cozy-blue-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>₹{property.pricePerNight.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}</span>
                  <span style={{ fontWeight: 600 }}>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(43,108,176,0.15)', margin: '0.5rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700 }}>
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleWhatsApp}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '12px', padding: '0.875rem', fontSize: '1rem' }}
              disabled={!selectedRange.from || !selectedRange.to}
            >
              {selectedRange.from && selectedRange.to
                ? `💬 Book via WhatsApp — ₹${totalPrice.toLocaleString('en-IN')}`
                : '📅 Pick dates to book'
              }
            </button>

            {selectedRange.from && selectedRange.to && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                You won&apos;t be charged yet
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
