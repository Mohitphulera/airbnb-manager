'use client'

import { useState } from 'react'
import ImageGallery from '@/components/ImageGallery'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: '🏢 Apartment',
  VILLA: '🏡 Villa',
  PLOT: '📐 Plot / Land',
  COMMERCIAL: '🏪 Commercial',
  FARMHOUSE: '🌾 Farmhouse',
}

const FEATURE_ICONS: Record<string, string> = {
  'Garden': '🌿',
  'Parking': '🅿️',
  'Swimming Pool': '🏊',
  '24x7 Security': '🔒',
  'Lift': '🛗',
  'Power Backup': '⚡',
  'Gym': '💪',
  'Club House': '🏛️',
  'Park': '🌳',
  'Gated Community': '',
  'Corner Plot': '📐',
  'Vastu Compliant': '🧭',
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export default function SalePropertyBrowser({ properties }: { properties: any[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [priceRange, setPriceRange] = useState('ALL')
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null)
  const [inquiryName, setInquiryName] = useState('')
  const [inquiryPhone, setInquiryPhone] = useState('')
  const [roiProperty, setRoiProperty] = useState<any | null>(null)
  const [customRent, setCustomRent] = useState('')

  const filtered = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'ALL' || p.propertyType === typeFilter
    let matchesPrice = true
    if (priceRange === 'UNDER_50L') matchesPrice = p.price < 5000000
    if (priceRange === '50L_1CR') matchesPrice = p.price >= 5000000 && p.price < 10000000
    if (priceRange === '1CR_PLUS') matchesPrice = p.price >= 10000000
    return matchesSearch && matchesType && matchesPrice
  })

  const handleInquiry = (property: any) => {
    const number = property.whatsappNumber
    if (!number) { alert('Contact not available.'); return }
    const nameStr = inquiryName ? `\n\nName: ${inquiryName}` : ''
    const phoneStr = inquiryPhone ? `\nPhone: ${inquiryPhone}` : ''
    const details = [
      property.area && `${property.area} sqft`,
      property.bedrooms && `${property.bedrooms} BHK`,
    ].filter(Boolean).join(' · ')
    const msg = `Hi! I'm interested in your property:\n\nLocation: *${property.title}*\n${property.location}\n${formatPrice(property.price)}${details ? `\n${details}` : ''}\n\nI would like to inquire about this property and schedule a visit.${nameStr}${phoneStr}`
    window.open(`https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
    setSelectedProperty(null)
    setInquiryName('')
    setInquiryPhone('')
  }

  // ROI Calculator
  const getROI = (property: any) => {
    const monthlyRent = customRent ? parseFloat(customRent) : (property.monthlyRentalEstimate || 0)
    if (!monthlyRent || !property.price) return null
    const annualRent = monthlyRent * 12
    const roi = (annualRent / property.price) * 100
    const paybackYears = property.price / annualRent
    return { monthlyRent, annualRent, roi: roi.toFixed(1), paybackYears: paybackYears.toFixed(1) }
  }

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      {/* Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }} className="fade-up fade-up-1">
        <div className="search-bar-wrap">
          <svg style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35" />
          </svg>
          <input
            placeholder="Search by property name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {[
            { value: 'ALL', label: 'All Types' },
            { value: 'APARTMENT', label: '🏢 Apartment' },
            { value: 'VILLA', label: '🏡 Villa' },
            { value: 'PLOT', label: '📐 Plot' },
            { value: 'COMMERCIAL', label: '🏪 Commercial' },
            { value: 'FARMHOUSE', label: '🌾 Farmhouse' },
          ].map(t => (
            <button key={t.value} className={`filter-pill ${typeFilter === t.value ? 'active' : ''}`} onClick={() => setTypeFilter(t.value)}>
              {t.label}
            </button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem' }} />
          {[
            { value: 'ALL', label: 'Any Budget' },
            { value: 'UNDER_50L', label: '< ₹50 L' },
            { value: '50L_1CR', label: '₹50L–1Cr' },
            { value: '1CR_PLUS', label: '₹1 Cr+' },
          ].map(r => (
            <button key={r.value} className={`filter-pill ${priceRange === r.value ? 'active' : ''}`} onClick={() => setPriceRange(r.value)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }} className="fade-up fade-up-2">
        {filtered.length} {filtered.length === 1 ? 'property' : 'properties'} available
      </p>

      {/* Grid */}
      <motion.div layout className="property-grid fade-up fade-up-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(p => {
            const roi = getROI(p)
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                key={p.id} 
                className="property-card" 
                style={{ border: '1px solid var(--border)' }}
              >
                <div className="property-image-wrap">
                  <ImageGallery urls={p.images} />
                  {p.status === 'UNDER_NEGOTIATION' && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(217, 119, 6, 0.9)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', backdropFilter: 'blur(4px)' }}>
                      Under Negotiation
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 600, backdropFilter: 'blur(4px)' }}>
                    {TYPE_LABELS[p.propertyType] || p.propertyType}
                  </div>
                </div>

                <div className="property-content" style={{ padding: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{p.title}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        Location: {p.location}
                      </p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.625rem', flexWrap: 'wrap' }}>
                    {p.area && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '0.875rem' }}>📏</span> {p.area} sqft
                      </div>
                    )}
                    {p.bedrooms && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '0.875rem' }}></span> {p.bedrooms} BHK
                      </div>
                    )}
                    {p.bathrooms && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '0.875rem' }}>🚿</span> {p.bathrooms} Bath
                      </div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>

                  {/* Features */}
                  {p.features && p.features.length > 0 && (
                    <div className="amenity-list" style={{ marginTop: '0.5rem' }}>
                      {p.features.slice(0, 4).map((f: string) => (
                        <span key={f} className="amenity-tag">
                          {FEATURE_ICONS[f] || '✦'} {f}
                        </span>
                      ))}
                      {p.features.length > 4 && (
                        <span className="amenity-tag">+{p.features.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* ROI Badge */}
                  {(p.monthlyRentalEstimate || 0) > 0 && roi && (
                    <div style={{ background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)', borderRadius: '10px', padding: '0.5rem 0.75rem', marginTop: '0.625rem', border: '1px solid rgba(5,150,105,0.15)', cursor: 'pointer' }} onClick={() => { setRoiProperty(p); setCustomRent(''); }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6875rem', color: '#065F46', fontWeight: 600 }}>📈 Investment Returns</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669' }}>{roi.roi}% ROI</span>
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#065F46', marginTop: '0.125rem' }}>
                        Est. ₹{(roi.monthlyRent).toLocaleString('en-IN')}/mo · Payback in {roi.paybackYears} yrs
                      </div>
                    </div>
                  )}

                  {/* Price & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary)' }}>{formatPrice(p.price)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <button onClick={() => { setRoiProperty(p); setCustomRent(''); }} className="btn btn-outline" style={{ borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}>
                        ROI
                      </button>
                      <button
                        onClick={() => setSelectedProperty(p)}
                        className="btn btn-primary"
                        style={{ borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                      >
                        💬 Inquire
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}></div>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No matching properties</p>
          <p>Try adjusting your search or filters</p>
        </div>
      )}

      {/* ROI Calculator Modal */}
      <AnimatePresence>
        {roiProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRoiProperty(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.2 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 'var(--radius-lg)',
                padding: '2rem', maxWidth: '480px', width: '100%',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>ROI Calculator</h3>
              <button onClick={() => setRoiProperty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ background: 'var(--cozy-blue-light)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{roiProperty.title}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Location: {roiProperty.location}</p>
              <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.125rem' }}>{formatPrice(roiProperty.price)}</p>
            </div>

            <div className="form-group" style={{ margin: '0 0 1rem 0' }}>
              <label className="form-label">Expected Monthly Rental Income (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder={roiProperty.monthlyRentalEstimate ? `Estimated: ₹${roiProperty.monthlyRentalEstimate.toLocaleString('en-IN')}` : 'e.g. 25000'}
                value={customRent}
                onChange={e => setCustomRent(e.target.value)}
              />
              {roiProperty.monthlyRentalEstimate && !customRent && (
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Using seller's estimate. Enter your own for custom calculation.</p>
              )}
            </div>

            {(() => {
              const roi = getROI(roiProperty)
              if (!roi) return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Enter monthly rent to see ROI</p>
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ background: '#ECFDF5', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(5,150,105,0.15)' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Annual ROI</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>{roi.roi}%</p>
                  </div>
                  <div style={{ background: 'var(--cozy-blue-light)', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid rgba(43,108,176,0.1)' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Payback Period</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{roi.paybackYears} yrs</p>
                  </div>
                  <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Monthly Income</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>₹{roi.monthlyRent.toLocaleString('en-IN')}</p>
                  </div>
                  <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '1rem', textAlign: 'center', border: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Annual Income</p>
                    <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>₹{roi.annualRent.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              )
            })()}

            <button
              onClick={() => { setRoiProperty(null); setSelectedProperty(roiProperty); }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.825rem', borderRadius: '10px', fontSize: '0.9375rem', marginTop: '1rem' }}
            >
              💬 Interested? Inquire Now
            </button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Inquiry Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProperty(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(4px)', padding: '1rem'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.2 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff', borderRadius: 'var(--radius-lg)',
                padding: '2rem', maxWidth: '440px', width: '100%',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Inquire About Property</h3>
              <button onClick={() => setSelectedProperty(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ background: 'var(--cozy-blue-light)', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{selectedProperty.title}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Location: {selectedProperty.location}</p>
              <p style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatPrice(selectedProperty.price)}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Name (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Raj Sharma"
                  value={inquiryName}
                  onChange={e => setInquiryName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Your Phone (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. 9876543210"
                  value={inquiryPhone}
                  onChange={e => setInquiryPhone(e.target.value)}
                />
              </div>
              <button
                onClick={() => handleInquiry(selectedProperty)}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.825rem', borderRadius: '10px', fontSize: '0.9375rem' }}
              >
                💬 Send Inquiry via WhatsApp
              </button>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                You&apos;ll be redirected to WhatsApp with a pre-filled message
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}
