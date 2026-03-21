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
      <h1 style={{ marginBottom: '2rem' }}>Booking Calendar</h1>
      <AdminCalendar bookings={serializableBookings} properties={properties} />
    </div>
  )
}
