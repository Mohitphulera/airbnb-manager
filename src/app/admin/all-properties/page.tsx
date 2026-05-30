import { getProperties } from '@/actions/propertyActions'
import { getSaleProperties } from '@/actions/salePropertyActions'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AllPropertiesPage() {
  const [airbnbs, saleProps] = await Promise.all([
    getProperties(),
    getSaleProperties(),
  ])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>All Listings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{airbnbs.length} Airbnb/rental properties · {saleProps.length} for-sale listings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href="/admin/properties" className="btn btn-primary" style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>add</span>
            Add Property
          </Link>
          <Link href="/admin/sale-properties" className="btn btn-secondary" style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>sell</span>
            List for Sale
          </Link>
        </div>
      </div>

      {/* Airbnb / Rental Properties */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF385C' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Airbnb &amp; Rentals</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.125rem 0.625rem', borderRadius: '999px', border: '1px solid var(--border)' }}>{airbnbs.length}</span>
        </div>
        {airbnbs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏠</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No properties yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Add your first property to start managing bookings</p>
            <Link href="/admin/properties" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Add Property</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {airbnbs.map((p) => {
              const imgs: string[] = (() => { try { return JSON.parse(p.imageUrls || '[]') } catch { return [] } })()
              const thumb = imgs[0] || null
              return (
                <Link key={p.id} href={`/property/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div className="card" style={{ overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }}>
                    <div style={{ height: '160px', background: thumb ? `url(${thumb}) center/cover` : 'linear-gradient(135deg, #667eea, #764ba2)', position: 'relative' }}>
                      {!thumb && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏠</div>}
                      <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem' }}>
                        <span className={`badge ${p.type === 'COMMISSION' ? 'badge-yellow' : 'badge-green'}`}>{p.type === 'COMMISSION' ? 'Commission' : 'Owned'}</span>
                      </div>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="material-icons-outlined" style={{ fontSize: '14px' }}>location_on</span>
                        {p.location}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{p.pricePerNight.toLocaleString('en-IN')}<span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--text-muted)' }}>/night</span></div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>View details →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* For Sale Properties */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Properties for Sale</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.125rem 0.625rem', borderRadius: '999px', border: '1px solid var(--border)' }}>{saleProps.length}</span>
        </div>
        {saleProps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '16px', border: '2px dashed var(--border)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏷️</div>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No sale listings yet</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>List a property to sell through your platform</p>
            <Link href="/admin/sale-properties" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>List Property</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {saleProps.map((p) => {
              const imgs: string[] = (() => { try { return JSON.parse(p.imageUrls || '[]') } catch { return [] } })()
              const thumb = imgs[0] || null
              return (
                <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
                  <div style={{ height: '160px', background: thumb ? `url(${thumb}) center/cover` : 'linear-gradient(135deg, #059669, #047857)', position: 'relative' }}>
                    {!thumb && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏷️</div>}
                    <div style={{ position: 'absolute', top: '0.625rem', left: '0.625rem' }}>
                      <span className={`badge ${p.status === 'SOLD' ? 'badge-gray' : p.status === 'UNDER_NEGOTIATION' ? 'badge-yellow' : 'badge-green'}`}>{p.status}</span>
                    </div>
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{p.title}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '14px' }}>location_on</span>
                      {p.location}
                    </div>
                    <div style={{ fontWeight: 700, color: '#059669', fontSize: '1.0625rem' }}>₹{p.price.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
