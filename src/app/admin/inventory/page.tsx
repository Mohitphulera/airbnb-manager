import { getInventory } from '@/actions/inventoryActions'
import { getProperties } from '@/actions/propertyActions'
import InventoryTracker from '@/components/InventoryTracker'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const [items, properties] = await Promise.all([getInventory(), getProperties()])
  const serialized = items.map(i => ({ ...i, lastRefilled: i.lastRefilled?.toISOString() || null, createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString() }))
  const propNames = properties.map((p: any) => p.name)

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Inventory</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track supplies across all properties</p>
      </div>
      <InventoryTracker items={serialized} properties={propNames} />
    </div>
  )
}
