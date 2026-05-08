import { getReferrals } from '@/actions/referralActions'
import ReferralManager from '@/components/ReferralManager'

export const dynamic = 'force-dynamic'

export default async function ReferralsPage() {
  const referrals = await getReferrals()
  const serialized = referrals.map(r => ({ ...r, createdAt: r.createdAt.toISOString() }))

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>Referral Program</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Create referral codes for guests to share with friends</p>
      </div>
      <ReferralManager referrals={serialized} />
    </div>
  )
}
