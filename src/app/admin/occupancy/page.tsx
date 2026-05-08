import { getBookings } from '@/actions/bookingActions'
import { getProperties } from '@/actions/propertyActions'
import OccupancyHeatmap from '@/components/OccupancyHeatmap'

export const dynamic = 'force-dynamic'

export default async function OccupancyPage() {
  const [bookings, properties] = await Promise.all([getBookings(), getProperties()])
  const serialized = bookings.map(b => ({ propertyId: b.propertyId, customerName: b.customerName, checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString() }))

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Occupancy Heatmap</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>30-day view of bookings across {properties.length} properties</p>
      </div>
      <OccupancyHeatmap properties={properties.map((p: any) => ({ id: p.id, name: p.name }))} bookings={serialized} />
    </div>
  )
}
