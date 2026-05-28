import FeedbackForm from '@/components/FeedbackForm'
import prisma from '@/lib/prisma'

export default async function FeedbackPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const propertyName = decodeURIComponent(id)

  // Look up property by name to get the owner's userId
  const property = await prisma.property.findFirst({
    where: { name: { equals: propertyName, mode: 'insensitive' } },
    select: { userId: true },
  })

  // Fall back to first user if property not found (backward compat)
  const userId = property?.userId ?? (await prisma.user.findFirst({ select: { id: true } }))?.id ?? ''

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '520px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Guest Feedback</div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.25rem' }}>We value your opinion</div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: 1.6 }}>Please take a moment to share your experience at <strong>{propertyName}</strong>.</p>
        </div>
        <FeedbackForm propertyName={propertyName} userId={userId} />
      </div>
    </div>
  )
}
