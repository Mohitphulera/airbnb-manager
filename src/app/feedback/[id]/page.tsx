import FeedbackForm from '@/components/FeedbackForm'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

// /feedback/<propertyId>?b=<bookingId>. Older links used the property name, so
// fall back to a name lookup — but only when it is unambiguous across all hosts.
async function resolveProperty(ref: string) {
  const select = { id: true, name: true, user: { select: { businessName: true } } }
  const byId = await prisma.property.findUnique({ where: { id: ref }, select })
  if (byId) return byId
  const byName = await prisma.property.findMany({
    where: { name: { equals: ref, mode: 'insensitive' } },
    select,
    take: 2,
  })
  return byName.length === 1 ? byName[0] : null
}

export default async function FeedbackPublicPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ b?: string }> }) {
  const [{ id }, { b: bookingId }] = await Promise.all([params, searchParams])
  const property = await resolveProperty(decodeURIComponent(id))
  if (!property) notFound()

  const booking = bookingId
    ? await prisma.booking.findFirst({ where: { id: bookingId, propertyId: property.id }, select: { id: true, customerName: true } })
    : null

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: 'clamp(1.5rem, 5vw, 2.5rem)', width: '100%', maxWidth: '520px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{property.user.businessName}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.25rem' }}>How was your stay?</div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: 1.6 }}>Please take a moment to share your experience at <strong>{property.name}</strong>.</p>
        </div>
        <FeedbackForm propertyId={property.id} bookingId={booking?.id} guestName={booking?.customerName} />
      </div>
    </div>
  )
}
