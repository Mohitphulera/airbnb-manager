'use client'

import { useState } from 'react'
import Link from 'next/link'
import ImageGallery from './ImageGallery'
import ClientBookingAction from './ClientBookingAction'
import { motion, AnimatePresence } from 'framer-motion'

const AMENITY_ICONS: Record<string, string> = {
  'WiFi': 'wifi', 'Pool': 'pool', 'AC': 'ac_unit', 'Kitchen': 'kitchen',
  'Parking': 'local_parking', 'TV': 'tv', 'Washer': 'local_laundry_service', 'Pet-Friendly': 'pets',
  'Gym': 'fitness_center', 'Balcony': 'balcony',
}

export default function SearchFilter({ properties }: { properties: any[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'OWNED' | 'COMMISSION'>('ALL')
  const [priceRange, setPriceRange] = useState<'ALL' | 'LOW' | 'MID' | 'HIGH'>('ALL')

  const filtered = properties.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchesType = filter === 'ALL' || p.type === filter
    let matchesPrice = true
    if (priceRange === 'LOW') matchesPrice = p.pricePerNight <= 2000
    if (priceRange === 'MID') matchesPrice = p.pricePerNight > 2000 && p.pricePerNight <= 5000
    if (priceRange === 'HIGH') matchesPrice = p.pricePerNight > 5000
    return matchesSearch && matchesType && matchesPrice
  })

  return (
    <div className="container" style={{ paddingBottom: '2rem' }}>
      {/* Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }} className="fade-up fade-up-1">
        <div className="search-bar-wrap">
          <svg style={{ width: '18px', height: '18px', color: 'var(--text-muted)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2"/>
            <path strokeLinecap="round" strokeWidth="2" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            placeholder="Search by property name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills">
          {(['ALL', 'OWNED', 'COMMISSION'] as const).map(t => (
            <button key={t} className={`filter-pill ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>
              {t === 'ALL' ? 'All' : t === 'OWNED' ? 'Our Properties' : 'Partner Properties'}
            </button>
          ))}
          <div style={{ width: '1px', background: 'var(--border)', margin: '0 0.25rem' }} />
          {(['ALL', 'LOW', 'MID', 'HIGH'] as const).map(r => (
            <button key={r} className={`filter-pill ${priceRange === r ? 'active' : ''}`} onClick={() => setPriceRange(r)}>
              {r === 'ALL' ? 'Any Price' : r === 'LOW' ? '≤ ₹2,000' : r === 'MID' ? '₹2k–5k' : '₹5,000+'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }} className="fade-up fade-up-2">
        {filtered.length} {filtered.length === 1 ? 'stay' : 'stays'} found
      </p>

      {/* Grid */}
      <motion.div layout className="property-grid fade-up fade-up-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(p => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              key={p.id} 
              className="property-card"
            >
              <Link href={`/property/${p.id}`}>
                <div className="property-image-wrap" style={{ cursor: 'pointer' }}>
                  <ImageGallery urls={p.images} />
                </div>
              </Link>

              <div className="property-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Link href={`/property/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, cursor: 'pointer' }}>{p.name}</h3>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{p.location}</p>
                      {p.rating && p.rating.count > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem' }}>
                          <span style={{ color: '#F59E0B' }}>★</span>
                          <span style={{ fontWeight: 700 }}>{p.rating.avg}</span>
                          <span style={{ color: 'var(--text-muted)' }}>({p.rating.count})</span>
                        </span>
                      )}
                    </div>
                  </div>
                  {p.type === 'OWNED' && <span className="badge badge-blue">Verified</span>}
                  {p.type === 'COMMISSION' && <span className="badge badge-yellow">Partner</span>}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>

                {/* Amenities */}
                {p.amenities && p.amenities.length > 0 && (
                  <div className="amenity-list">
                    {p.amenities.slice(0, 5).map((a: string) => (
                      <span key={a} className="amenity-tag">
                        <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>{AMENITY_ICONS[a] || 'star_outline'}</span>
                        {a}
                      </span>
                    ))}
                    {p.amenities.length > 5 && (
                      <span className="amenity-tag">+{p.amenities.length - 5}</span>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>₹{p.pricePerNight.toLocaleString('en-IN')}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}> / night</span>
                  </div>
                  <Link href={`/property/${p.id}`} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.375rem 0.875rem', borderRadius: '8px' }}>
                    View Details →
                  </Link>
                </div>

                <div style={{ marginTop: '0.75rem' }}>
                  <ClientBookingAction property={p} bookings={p.pBookings} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No matching stays</p>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
