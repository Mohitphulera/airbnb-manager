import BillGenerator from '@/components/BillGenerator'
import { getBookings } from '@/actions/bookingActions'
import { requireUser } from '@/lib/session'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BillsPage({ searchParams }: { searchParams: Promise<{ bookingId?: string }> }) {
  const [bookings, params, sessionUser] = await Promise.all([
    getBookings(),
    searchParams,
    requireUser(),
  ])

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { logoUrl: true, businessName: true },
  })

  const initialBookingId = params.bookingId ?? null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Bill Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create professional booking invoices for your guests
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="btn btn-secondary"
          style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
        >
          <span className="material-icons-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
          Back to Bookings
        </Link>
      </div>
      <BillGenerator
        bookings={JSON.parse(JSON.stringify(bookings))}
        initialBookingId={initialBookingId}
        logoUrl={user?.logoUrl ?? ''}
        businessName={user?.businessName}
      />
    </div>
  )
}
