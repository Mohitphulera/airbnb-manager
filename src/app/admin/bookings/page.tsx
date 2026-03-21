import { getBookings, deleteBooking } from '@/actions/bookingActions'
import { getProperties } from '@/actions/propertyActions'
import { getBookingRequests } from '@/actions/bookingRequestActions'
import BookingForm from '@/components/BookingForm'
import CleaningStatusToggle from '@/components/CleaningStatusToggle'
import BookingRequestsPanel from '@/components/BookingRequestsPanel'

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
          <h1>Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{bookings.length} bookings recorded</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/api/export-expenses" className="btn btn-outline" download style={{ fontSize: '0.8125rem' }}>Export CSV</a>
          <a href="/api/export" className="btn btn-outline" download="airbnb-data.xlsx" style={{ fontSize: '0.8125rem' }}>Export Excel</a>
        </div>
      </div>

      {/* Booking Requests */}
      {requests.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div className="metric-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>
                Guest Booking Requests
                {pendingCount > 0 && (
                  <span style={{
                    background: '#EF4444', color: '#fff', borderRadius: '50%',
                    fontSize: '0.6875rem', fontWeight: 700, padding: '0.125rem 0.5rem',
                    marginLeft: '0.5rem', verticalAlign: 'super',
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
          <h3 style={{ marginBottom: '1rem' }}>New Booking</h3>
          <BookingForm properties={properties} />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>All Bookings</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Guest</th>
                  <th>Dates</th>
                  <th>Source</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                  <th>🧹</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.property.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.property.type === 'COMMISSION' ? 'Partner' : 'Owned'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.customerName}</div>
                      {b.customerPhone && <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.customerPhone}</div>}
                      {b.notes && <div style={{ fontSize: '0.625rem', color: 'var(--primary)', marginTop: '0.125rem', fontStyle: 'italic' }}>{b.notes.length > 30 ? b.notes.slice(0, 30) + '…' : b.notes}</div>}
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span className={`badge ${b.source === 'DIRECT' ? 'badge-green' : b.source === 'AIRBNB' ? 'badge-pink' : 'badge-gray'}`}>{b.source}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--cozy-success)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                    <td>
                      {b.commissionOwed !== null
                        ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>−₹{b.commissionOwed.toLocaleString('en-IN')}</span>
                        : <span style={{ color: '#ccc' }}>—</span>}
                    </td>
                    <td>
                      <CleaningStatusToggle bookingId={b.id} currentStatus={b.cleaningStatus} />
                    </td>
                    <td>
                      <form action={async () => { 'use server'; await deleteBooking(b.id) }}>
                        <button type="submit" className="btn btn-danger">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bookings yet</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
