import { getAllFeedback, getFeedbackStats } from '@/actions/feedbackActions'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage() {
  const [feedback, stats] = await Promise.all([getAllFeedback(), getFeedbackStats()])
  const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Guest Feedback</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{stats.count} responses collected</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { l: 'Avg Rating', v: stats.avgRating, max: 5 },
          { l: 'Cleanliness', v: stats.avgCleanliness, max: 5 },
          { l: 'Comfort', v: stats.avgComfort, max: 5 },
          { l: 'Would Return', v: `${stats.returnRate}%`, max: 0 },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.375rem' }}>{s.l}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.v}{s.max ? <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/{s.max}</span> : ''}</div>
          </div>
        ))}
      </div>

      {/* Feedback list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {feedback.map((f: any) => (
          <div key={f.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <span style={{ fontWeight: 700 }}>{f.guestName}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: '0.5rem' }}>{f.propertyName}</span>
              </div>
              <span style={{ color: '#c9a84c', fontSize: '0.875rem', letterSpacing: '0.05em' }}>{stars(f.rating)}</span>
            </div>
            {f.comment && <p style={{ fontSize: '0.8125rem', color: '#4b5563', lineHeight: 1.6, marginBottom: '0.5rem' }}>{f.comment}</p>}
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.6875rem', color: '#94a3b8' }}>
              {f.cleanliness && <span>Clean: {f.cleanliness}/5</span>}
              {f.comfort && <span>Comfort: {f.comfort}/5</span>}
              {f.location && <span>Location: {f.location}/5</span>}
              {f.valueForMoney && <span>Value: {f.valueForMoney}/5</span>}
              {f.wouldReturn !== null && <span style={{ color: f.wouldReturn ? '#16a34a' : '#dc2626' }}>{f.wouldReturn ? '✓ Would return' : '✗ Would not return'}</span>}
            </div>
            <div style={{ fontSize: '0.625rem', color: '#cbd5e1', marginTop: '0.375rem' }}>{new Date(f.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          </div>
        ))}
        {feedback.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No feedback yet. Share the feedback link with guests after checkout.</div>}
      </div>
    </div>
  )
}
