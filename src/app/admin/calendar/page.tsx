import { getBookings } from '@/actions/bookingActions'
import { getProperties } from '@/actions/propertyActions'
import AdminCalendar from '@/components/AdminCalendar'

export const dynamic = 'force-dynamic'

export default async function CalendarPage() {
  const [bookings, properties] = await Promise.all([
    getBookings(),
    getProperties()
  ])

  // Convert dates to string so they can be passed to the Client Component
  const serializableBookings = bookings.map(b => ({
    ...b,
    checkInDate: b.checkInDate.toISOString(),
    checkOutDate: b.checkOutDate.toISOString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Master Calendar</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overview of bookings across {properties.length} properties</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/api/calendar-export" download="cozybnb-bookings.ics" className="btn btn-secondary" style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>download</span>
            Export .ics
          </a>
          <div style={{ display: 'flex', gap: '0.25rem', background: '#F1F5F9', borderRadius: '8px', padding: '0.25rem' }}>
            {['Two Weeks', 'Month', 'Quarter'].map((label, i) => (
              <span key={label} style={{
                padding: '0.375rem 0.875rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', background: i === 1 ? '#fff' : 'transparent',
                color: i === 1 ? 'var(--text-main)' : '#94A3B8',
                boxShadow: i === 1 ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
      <AdminCalendar bookings={serializableBookings} properties={properties} />
    </div>
  )
}
