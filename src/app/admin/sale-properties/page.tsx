import { getSaleProperties } from '@/actions/salePropertyActions'
import SalePropertyForm from '@/components/SalePropertyForm'
import SalePropertyTable from '@/components/SalePropertyTable'

export const dynamic = 'force-dynamic'

export default async function SalePropertiesPage() {
  const properties = await getSaleProperties()

  const totalListed = properties.length
  const available = properties.filter(p => p.status === 'AVAILABLE').length
  const sold = properties.filter(p => p.status === 'SOLD').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Properties for Sale</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {totalListed} listed · {available} available · {sold} sold
          </p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-sidebar-card">
          <h3 style={{ marginBottom: '1rem' }}>List New Property</h3>
          <SalePropertyForm />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>Inventory</h3>
          <SalePropertyTable properties={JSON.parse(JSON.stringify(properties))} />
        </div>
      </div>
    </div>
  )
}
