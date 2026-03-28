import { getBookings } from '@/actions/bookingActions'
import { getProperties } from '@/actions/propertyActions'
import { getBookingRequests } from '@/actions/bookingRequestActions'
import BookingForm from '@/components/BookingForm'
import BookingRequestsPanel from '@/components/BookingRequestsPanel'
import BookingTable from '@/components/BookingTable'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const [bookings, properties, requests] = await Promise.all([
    getBookings(),
    getProperties(),
    getBookingRequests(),
  ])

  const pendingCount = requests.filter((r: any) => r.status === 'PENDING').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Reservations</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{bookings.length} bookings recorded</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/api/export-expenses" className="btn btn-secondary" download style={{ fontSize: '0.8125rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>download</span>
            Export CSV
          </a>
          <a href="/api/export" className="btn btn-secondary" download="airbnb-data.xlsx" style={{ fontSize: '0.8125rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '16px' }}>table_chart</span>
            Export Excel
          </a>
        </div>
      </div>

      {/* Booking Requests */}
      {requests.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="metric-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>inbox</span>
                Guest Booking Requests
                {pendingCount > 0 && (
                  <span style={{
                    background: '#EF4444', color: '#fff', borderRadius: '50%',
                    fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem',
                  }}>{pendingCount}</span>
                )}
              </h3>
            </div>
            <BookingRequestsPanel requests={JSON.parse(JSON.stringify(requests))} />
          </div>
        </div>
      )}

      <div className="admin-grid">
        <div className="admin-sidebar-card">
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>add_circle</span>
            New Booking
          </h3>
          <BookingForm properties={properties} />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>All Reservations</h3>
          <BookingTable bookings={JSON.parse(JSON.stringify(bookings))} />
        </div>
      </div>
    </div>
  )
}
