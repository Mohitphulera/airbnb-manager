'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { globalSearch, type SearchResult } from '@/actions/searchActions'
import { useRouter } from 'next/navigation'

export default function AdminSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const router = useRouter()

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults(null)
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await globalSearch(q)
      setResults(res)
      setOpen(true)
    } catch {
      setResults(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navigate = (url: string) => {
    setOpen(false)
    setQuery('')
    router.push(url)
  }

  const totalResults = results
    ? results.properties.length + results.bookings.length + results.saleProperties.length
    : 0

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
      <div className="admin-topbar-search">
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94A3B8' }}>search</span>
        <input
          type="text"
          placeholder="Search properties, guests, or bookings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results && totalResults > 0) setOpen(true) }}
        />
        {loading && (
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94A3B8', animation: 'spin 1s linear infinite' }}>progress_activity</span>
        )}
      </div>

      {open && results && totalResults > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb', zIndex: 999, maxHeight: '400px', overflowY: 'auto',
          padding: '0.5rem 0',
        }}>
          {/* Properties */}
          {results.properties.length > 0 && (
            <div>
              <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.5625rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Rental Properties
              </div>
              {results.properties.map(p => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/admin/properties`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                    padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontSize: '0.8125rem', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6b7280' }}>home_work</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>{p.location} · {p.type === 'OWNED' ? 'Owned' : 'Partner'}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Bookings */}
          {results.bookings.length > 0 && (
            <div>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '0.25rem 0' }} />
              <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.5625rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Guest Bookings
              </div>
              {results.bookings.map(b => (
                <button
                  key={b.id}
                  onClick={() => navigate('/admin/bookings')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                    padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontSize: '0.8125rem', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6b7280' }}>person</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.customerName}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                      {b.propertyName} · {new Date(b.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Sale Properties */}
          {results.saleProperties.length > 0 && (
            <div>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '0.25rem 0' }} />
              <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.5625rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sale Listings
              </div>
              {results.saleProperties.map(sp => (
                <button
                  key={sp.id}
                  onClick={() => navigate('/admin/sale-properties')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%',
                    padding: '0.5rem 1rem', border: 'none', background: 'transparent', cursor: 'pointer',
                    textAlign: 'left', fontSize: '0.8125rem', transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#6b7280' }}>sell</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{sp.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: '#6b7280' }}>
                      {sp.location} · ₹{sp.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {open && results && totalResults === 0 && query.length >= 2 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#fff', borderRadius: '12px', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          border: '1px solid #e5e7eb', zIndex: 999, padding: '1.5rem',
          textAlign: 'center', color: '#94A3B8', fontSize: '0.8125rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px', display: 'block', marginBottom: '0.375rem', opacity: 0.5 }}>search_off</span>
          No results for &quot;{query}&quot;
        </div>
      )}
    </div>
  )
}
