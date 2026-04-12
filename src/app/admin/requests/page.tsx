import { getBookingRequests } from '@/actions/bookingRequestActions'
import BookingRequestManager from '@/components/BookingRequestManager'

export const dynamic = 'force-dynamic'

export default async function RequestsPage() {
  const requests = await getBookingRequests()

  const serialized = JSON.parse(JSON.stringify(requests))
  const pendingCount = requests.filter((r: any) => r.status === 'PENDING').length
  const confirmedCount = requests.filter((r: any) => r.status === 'CONFIRMED').length
  const rejectedCount = requests.filter((r: any) => r.status === 'REJECTED').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Booking Requests
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage incoming guest booking requests
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: 'Pending', count: pendingCount, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Confirmed', count: confirmedCount, color: '#059669', bg: '#ecfdf5' },
            { label: 'Rejected', count: rejectedCount, color: '#dc2626', bg: '#fef2f2' },
          ].map(s => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 0.875rem', borderRadius: '8px',
              background: s.bg, fontSize: '0.75rem', fontWeight: 600,
            }}>
              <span style={{ color: s.color }}>{s.count}</span>
              <span style={{ color: '#6b7280' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <BookingRequestManager requests={serialized} />
    </div>
  )
}
