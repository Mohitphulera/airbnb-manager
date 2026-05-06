import { getAllGuests, getGuestStats } from '@/actions/guestActions'
import GuestCRM from '@/components/GuestCRM'

export const dynamic = 'force-dynamic'

export default async function GuestsPage() {
  const [guests, stats] = await Promise.all([getAllGuests(), getGuestStats()])
  const serialized = guests.map(g => ({
    ...g,
    lastCheckIn: g.lastCheckIn?.toISOString() || null,
    lastCheckOut: g.lastCheckOut?.toISOString() || null,
    birthday: g.birthday?.toISOString() || null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Guest CRM
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage guests, track loyalty, and send WhatsApp offers
          </p>
        </div>
      </div>
      <GuestCRM guests={serialized} stats={stats} />
    </div>
  )
}
