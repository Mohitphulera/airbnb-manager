import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'
import SettingsForm from '@/components/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const sessionUser = await requireUser()
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } })
  if (!user) return <div>User not found</div>

  const formUser = {
    id: user.id,
    businessName: user.businessName,
    slug: user.slug,
    email: user.email,
    whatsappNumber: user.whatsappNumber,
    logoUrl: user.logoUrl,
    plan: user.plan,
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your business profile and account</p>
      </div>

      <SettingsForm user={formUser} />
    </div>
  )
}
