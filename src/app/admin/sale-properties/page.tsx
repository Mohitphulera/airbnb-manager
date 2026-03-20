import { getSaleProperties, deleteSaleProperty, updateSalePropertyStatus } from '@/actions/salePropertyActions'
import SalePropertyForm from '@/components/SalePropertyForm'

const TYPE_LABELS: Record<string, string> = {
  APARTMENT: '🏢 Apartment',
  VILLA: '🏡 Villa',
  PLOT: '📐 Plot',
  COMMERCIAL: '🏪 Commercial',
  FARMHOUSE: '🌾 Farmhouse',
}

const STATUS_BADGE: Record<string, string> = {
  AVAILABLE: 'badge-green',
  SOLD: 'badge-gray',
  UNDER_NEGOTIATION: 'badge-yellow',
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

export default async function SalePropertiesPage() {
  const properties = await getSaleProperties()

  const totalListed = properties.length
  const available = properties.filter(p => p.status === 'AVAILABLE').length
  const sold = properties.filter(p => p.status === 'SOLD').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>🏷️ Properties for Sale</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {totalListed} listed · {available} available · {sold} sold
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-sidebar-card">
          <h3 style={{ marginBottom: '1rem' }}>➕ List New Property</h3>
          <SalePropertyForm />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>Inventory</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p: any) => {
                  let features: string[] = []
                  try { if (p.features) features = JSON.parse(p.features) } catch {}
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600, maxWidth: '180px' }}>{p.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{p.location}</td>
                      <td>
                        <span style={{ fontSize: '0.8125rem' }}>{TYPE_LABELS[p.propertyType] || p.propertyType}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--cozy-success)', whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.area && <span>{p.area} sqft</span>}
                        {p.bedrooms && <span> · {p.bedrooms} BHK</span>}
                        {p.bathrooms && <span> · {p.bathrooms} Bath</span>}
                      </td>
                      <td>
                        <form action={async () => { 'use server'; const next = p.status === 'AVAILABLE' ? 'UNDER_NEGOTIATION' : p.status === 'UNDER_NEGOTIATION' ? 'SOLD' : 'AVAILABLE'; await updateSalePropertyStatus(p.id, next) }}>
                          <button type="submit" className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                            {p.status.replace('_', ' ')}
                          </button>
                        </form>
                      </td>
                      <td>
                        <form action={async () => { 'use server'; await deleteSaleProperty(p.id) }}>
                          <button type="submit" className="btn btn-danger">Remove</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
                {properties.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No properties listed for sale yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
