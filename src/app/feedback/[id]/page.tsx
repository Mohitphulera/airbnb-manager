import FeedbackForm from '@/components/FeedbackForm'

export default async function FeedbackPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eff6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '520px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Cozy B&B</div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.25rem' }}>Guest Feedback</div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: 1.6 }}>We value your opinion! Please take a moment to share your experience.</p>
        </div>
        <FeedbackForm propertyName={decodeURIComponent(id)} />
      </div>
    </div>
  )
}
