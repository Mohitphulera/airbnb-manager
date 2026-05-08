import { getBookings } from '@/actions/bookingActions'
import RevenueForecast from '@/components/RevenueForecast'

export const dynamic = 'force-dynamic'

export default async function ForecastPage() {
  const bookings = await getBookings()
  const serialized = bookings.map(b => ({ checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString(), totalAmount: b.totalAmount, propertyName: (b as any).property?.name || 'Unknown' }))

  // Build monthly data from past bookings
  const monthlyMap: Record<string, number> = {}
  bookings.forEach(b => {
    const key = `${b.checkInDate.getFullYear()}-${String(b.checkInDate.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] || 0) + b.totalAmount
  })
  const monthlyData = Object.entries(monthlyMap).sort().slice(-6).map(([k, v]) => ({
    month: new Date(k + '-01').toLocaleDateString('en-IN', { month: 'short' }),
    revenue: v,
  }))

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Revenue Forecast</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Predicted income based on bookings and trends</p>
      </div>
      <RevenueForecast bookings={serialized} monthlyData={monthlyData} />
    </div>
  )
}
