'use client'

import { useState } from 'react'
import ImageGallery from '@/components/ImageGallery'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: 'Apartment',
  VILLA: 'Villa',
  PLOT: 'Plot / Land',
  COMMERCIAL: 'Commercial',
  FARMHOUSE: 'Farmhouse',
}

const FEATURE_ICONS: Record<string, string> = {
  'Garden': 'yard',
  'Parking': 'local_parking',
  'Swimming Pool': 'pool',
  '24x7 Security': 'security',
  'Lift': 'elevator',
  'Power Backup': 'bolt',
  'Gym': 'fitness_center',
  'Club House': 'bungalow',
  'Park': 'park',
  'Gated Community': 'fence',
  'Corner Plot': 'crop_square',
  'Vastu Compliant': 'explore',
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
    <div style={{ paddingBottom: '6rem', maxWidth: '1920px', margin: '0 auto', width: '100%' }}>
      {/* Search & Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '3rem' }} className="fade-up fade-up-1">
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #1c1b1b', paddingBottom: '0.75rem', width: '100%', maxWidth: '640px' }}>
          <span className="material-icons-outlined" style={{ color: '#1c1b1b', marginRight: '1rem', fontSize: '1.25rem' }}>search</span>
          <input
            placeholder="Search by property name or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontFamily: 'Inter, sans-serif', fontSize: '1.125rem', color: '#1c1b1b' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {[
            { value: 'ALL', label: 'All Investments' },
            { value: 'APARTMENT', label: 'Penthouses & Apartments' },
            { value: 'VILLA', label: 'Villas & Estates' },
            { value: 'PLOT', label: 'Land Acquisitions' },
            { value: 'COMMERCIAL', label: 'Commercial Yielder' },
            { value: 'FARMHOUSE', label: 'Private Reserves' },
          ].map(t => (
            <button 
              key={t.value} 
              onClick={() => setTypeFilter(t.value)}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '0.75rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                background: typeFilter === t.value ? '#1c1b1b' : 'transparent',
                color: typeFilter === t.value ? '#ffffff' : '#1c1b1b',
                border: `1px solid ${typeFilter === t.value ? '#1c1b1b' : 'rgba(0,0,0,0.2)'}`
              }}
            >
              {t.label}
            </button>
          ))}
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.2)', margin: '0 0.5rem' }} />
          {[
            { value: 'ALL', label: 'Any Capital' },
            { value: 'UNDER_50L', label: 'Under ₹50L' },
            { value: '50L_1CR', label: '₹50L – ₹1Cr' },
            { value: '1CR_PLUS', label: '₹1Cr+' },
          ].map(r => (
            <button 
              key={r.value} 
              onClick={() => setPriceRange(r.value)}
              style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase',
                padding: '0.75rem 1.5rem', cursor: 'pointer', transition: 'all 0.2s',
                background: priceRange === r.value ? '#1c1b1b' : 'transparent',
                color: priceRange === r.value ? '#ffffff' : '#1c1b1b',
                border: `1px solid ${priceRange === r.value ? '#1c1b1b' : 'rgba(0,0,0,0.2)'}`
              }}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: '#858383', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2rem' }} className="fade-up fade-up-2">
        {filtered.length} {filtered.length === 1 ? 'Opportunity' : 'Opportunities'} Discovered
      </p>

      {/* Grid */}
      <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '3rem 2rem' }} className="fade-up fade-up-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((p, idx) => {
            const roi = getROI(p)
            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={p.id} 
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/11', overflow: 'hidden', marginBottom: '1.25rem', background: '#e5e2e1' }}>
                  <ImageGallery urls={p.images} />
                  {p.status === 'UNDER_NEGOTIATION' && (
                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#ffffff', color: '#1c1b1b', padding: '0.35rem 0.875rem', fontSize: '0.625rem', fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', zIndex: 10 }}>
                      Under Offer
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(28,27,27,0.85)', backdropFilter: 'blur(8px)', color: '#ffffff', padding: '0.35rem 0.875rem', fontSize: '0.625rem', fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', zIndex: 10 }}>
                    {TYPE_LABELS[p.propertyType] || p.propertyType}
                  </div>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1b1b', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>{p.title}</h3>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#444748', fontSize: '0.875rem' }}>
                        {p.location}
                      </p>
                    </div>
                  </div>

                  {/* Quick stats */}
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.25rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1.25rem' }}>
                    {p.area && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
                        <span style={{ fontSize: '0.5625rem', color: '#858383', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Total Area</span>
                        <span style={{ fontSize: '0.875rem', color: '#1c1b1b', fontWeight: 600 }}>{p.area} sqft</span>
                      </div>
                    )}
                    {p.bedrooms && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
                        <span style={{ fontSize: '0.5625rem', color: '#858383', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Bedrooms</span>
                        <span style={{ fontSize: '0.875rem', color: '#1c1b1b', fontWeight: 600 }}>{p.bedrooms} BHK</span>
                      </div>
                    )}
                    {p.bathrooms && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'Inter, sans-serif' }}>
                        <span style={{ fontSize: '0.5625rem', color: '#858383', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Baths</span>
                        <span style={{ fontSize: '0.875rem', color: '#1c1b1b', fontWeight: 600 }}>{p.bathrooms}</span>
                      </div>
                    )}
                  </div>

                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#444748', lineHeight: 1.6, marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.description}
                  </p>

                  {/* ROI Badge */}
                  {(p.monthlyRentalEstimate || 0) > 0 && roi && (
                    <div style={{ background: '#fcf9f8', padding: '1rem', border: '1px solid rgba(119,90,25,0.2)', cursor: 'pointer', marginBottom: '1.5rem', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }} onClick={() => { setRoiProperty(p); setCustomRent(''); }} onMouseOver={e => e.currentTarget.style.background = '#ffdea5'} onMouseOut={e => e.currentTarget.style.background = '#fcf9f8'}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', color: '#775a19', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>analytics</span> Financial Model
                        </span>
                        <span style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.125rem', fontWeight: 800, color: '#1c1b1b' }}>{roi.roi}% Yield</span>
                      </div>
                    </div>
                  )}

                  <div style={{ flex: 1 }} />

                  {/* Price & Action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <div>
                      <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.5625rem', color: '#858383', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.25rem' }}>Capital Required</span>
                      <span style={{ fontFamily: '"Noto Serif", serif', fontWeight: 800, fontSize: '1.5rem', color: '#1c1b1b', lineHeight: 1 }}>{formatPrice(p.price)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => { setRoiProperty(p); setCustomRent(''); }} style={{ background: 'transparent', border: '1px solid #1c1b1b', color: '#1c1b1b', cursor: 'pointer', padding: '0.625rem 1.25rem', fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s' }} onMouseOver={e => {e.currentTarget.style.background = '#1c1b1b'; e.currentTarget.style.color = '#ffffff'}} onMouseOut={e => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1c1b1b'}}>
                        Data
                      </button>
                      <button
                        onClick={() => setSelectedProperty(p)}
                        style={{ background: '#1c1b1b', border: '1px solid #1c1b1b', color: '#ffffff', cursor: 'pointer', padding: '0.625rem 1.25rem', fontFamily: 'Inter, sans-serif', fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#333333'} onMouseOut={e => e.currentTarget.style.background = '#1c1b1b'}
                      >
                        Inquire
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
        <div style={{ textAlign: 'center', padding: '8rem 1rem', color: '#858383', fontFamily: 'Inter, sans-serif' }}>
          <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: '#1c1b1b', letterSpacing: '-0.02em' }}>Portfolio Empty</p>
          <p style={{ letterSpacing: '0.1em', fontSize: '0.8125rem', textTransform: 'uppercase' }}>No architectural gems match your criteria.</p>
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fcf9f8', padding: '3rem', maxWidth: '600px', width: '100%', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1b1b' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: '"Noto Serif", serif', fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.04em' }}>Investment Thesis</h3>
                <span className="material-icons-outlined" onClick={() => setRoiProperty(null)} style={{ cursor: 'pointer', fontSize: '1.5rem', opacity: 0.5 }}>close</span>
              </div>

              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '2rem', marginBottom: '2rem' }}>
                <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{roiProperty.title}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: '#858383' }}>{roiProperty.location}</p>
                  <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1b1b' }}>{formatPrice(roiProperty.price)}</p>
                </div>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', color: '#858383' }}>Projected Monthly Yield (₹)</label>
                <input
                  type="number"
                  placeholder={roiProperty.monthlyRentalEstimate ? `Market Estimate: ₹${roiProperty.monthlyRentalEstimate.toLocaleString('en-IN')}` : 'Enter amount'}
                  value={customRent}
                  onChange={e => setCustomRent(e.target.value)}
                  style={{ width: '100%', background: 'none', border: '1px solid rgba(0,0,0,0.2)', padding: '1rem', fontFamily: 'Inter, sans-serif', fontSize: '1rem', outline: 'none', color: '#1c1b1b' }}
                />
              </div>

              {(() => {
                const roi = getROI(roiProperty)
                if (!roi) return null
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                    <div style={{ background: '#fcf9f8', padding: '1.5rem 1rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#858383', marginBottom: '0.5rem' }}>Annual ROI</p>
                      <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '2rem', fontWeight: 800, color: '#775a19', lineHeight: 1 }}>{roi.roi}%</p>
                    </div>
                    <div style={{ background: '#fcf9f8', padding: '1.5rem 1rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#858383', marginBottom: '0.5rem' }}>Capital Payback</p>
                      <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.5rem', fontWeight: 800, color: '#1c1b1b', lineHeight: 1, marginTop: '0.5rem' }}>{roi.paybackYears} yrs</p>
                    </div>
                    <div style={{ background: '#fcf9f8', padding: '1.5rem 1rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#858383', marginBottom: '0.5rem' }}>Monthly Cashflow</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.125rem', fontWeight: 600 }}>₹{roi.monthlyRent.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ background: '#fcf9f8', padding: '1.5rem 1rem', textAlign: 'center' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#858383', marginBottom: '0.5rem' }}>Annual Cashflow</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.125rem', fontWeight: 600 }}>₹{roi.annualRent.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                )
              })()}

              <button
                onClick={() => { setRoiProperty(null); setSelectedProperty(roiProperty); }}
                style={{ width: '100%', background: '#1c1b1b', color: '#ffffff', border: 'none', padding: '1.25rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = '#333333'} onMouseOut={e => e.currentTarget.style.background = '#1c1b1b'}
              >
                Request Access
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
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)', padding: '1rem' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#fcf9f8', padding: '3rem', maxWidth: '440px', width: '100%', border: '1px solid rgba(0,0,0,0.1)', color: '#1c1b1b' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.75rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Inquire</h3>
                <span className="material-icons-outlined" onClick={() => setSelectedProperty(null)} style={{ cursor: 'pointer', fontSize: '1.5rem', opacity: 0.5 }}>close</span>
              </div>

              <div style={{ borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedProperty.title}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8125rem', color: '#858383', marginBottom: '0.5rem' }}>{selectedProperty.location}</p>
                <p style={{ fontFamily: '"Noto Serif", serif', fontSize: '1.25rem', fontWeight: 800, color: '#1c1b1b' }}>{formatPrice(selectedProperty.price)}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', color: '#858383' }}>Primary Concierge Name</label>
                  <input
                    placeholder="Enter full name"
                    value={inquiryName}
                    onChange={e => setInquiryName(e.target.value)}
                    style={{ width: '100%', background: 'none', border: '1px solid rgba(0,0,0,0.2)', padding: '1rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', outline: 'none', color: '#1c1b1b' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', color: '#858383' }}>Direct Line (Phone)</label>
                  <input
                    placeholder="Enter phone number"
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    style={{ width: '100%', background: 'none', border: '1px solid rgba(0,0,0,0.2)', padding: '1rem', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', outline: 'none', color: '#1c1b1b' }}
                  />
                </div>

                <button
                  onClick={() => handleInquiry(selectedProperty)}
                  style={{ width: '100%', background: '#1c1b1b', color: '#ffffff', border: 'none', padding: '1.25rem', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background 0.2s', marginTop: '1rem' }}
                  onMouseOver={e => e.currentTarget.style.background = '#333333'} onMouseOut={e => e.currentTarget.style.background = '#1c1b1b'}
                >
                  Contact Equity Partner
                </button>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.625rem', color: '#858383', textAlign: 'center', letterSpacing: '0.05em' }}>
                  A representative will connect via WhatsApp.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
