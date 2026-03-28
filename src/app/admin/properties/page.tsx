import { getProperties } from '@/actions/propertyActions'
import PropertyForm from '@/components/PropertyForm'
import PropertyTable from '@/components/PropertyTable'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage() {
  const properties = await getProperties()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>My Listings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{properties.length} properties in your portfolio</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {['All Listings', `Active (${properties.filter((p: any) => p.type === 'OWNED').length})`, `Partners (${properties.filter((p: any) => p.type === 'COMMISSION').length})`].map((label, i) => (
              <span key={label} style={{
                padding: '0.375rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', color: i === 0 ? 'var(--primary)' : '#94A3B8',
                borderBottom: i === 0 ? '2px solid var(--primary)' : '2px solid transparent',
              }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-sidebar-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_home</span>
            Add Property
          </h3>
          <PropertyForm />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>Portfolio</h3>
          <PropertyTable properties={JSON.parse(JSON.stringify(properties))} />
        </div>
      </div>
    </div>
  )
}
