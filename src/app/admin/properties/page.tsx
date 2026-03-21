import { getProperties, deleteProperty } from '@/actions/propertyActions'
import PropertyForm from '@/components/PropertyForm'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const properties = await getProperties()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Properties</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{properties.length} properties in your portfolio</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-sidebar-card">
          <h3 style={{ marginBottom: '1rem' }}>Add Property</h3>
          <PropertyForm />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>Portfolio</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Price/Night</th>
                  <th>Amenities</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p: any) => {
                  let amenities: string[] = []
                  try { if (p.amenities) amenities = JSON.parse(p.amenities) } catch {}
                  return (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.location}</td>
                      <td><span className={`badge ${p.type === 'OWNED' ? 'badge-blue' : 'badge-yellow'}`}>{p.type === 'OWNED' ? 'Owned' : 'Partner'}</span></td>
                      <td style={{ fontWeight: 600 }}>₹{p.pricePerNight.toLocaleString('en-IN')}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {amenities.slice(0, 3).map((a: string) => <span key={a} className="badge badge-gray" style={{ fontSize: '0.5625rem' }}>{a}</span>)}
                          {amenities.length > 3 && <span className="badge badge-gray" style={{ fontSize: '0.5625rem' }}>+{amenities.length - 3}</span>}
                          {amenities.length === 0 && <span style={{ color: '#ccc', fontSize: '0.75rem' }}>—</span>}
                        </div>
                      </td>
                      <td>
                        <form action={async () => { 'use server'; await deleteProperty(p.id) }}>
                          <button type="submit" className="btn btn-danger">Remove</button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
                {properties.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No properties added yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
