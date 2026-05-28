import { getQuickStats } from '@/actions/quickStatsActions'
import { getSessionUser } from '@/lib/session'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [stats, sessionUser] = await Promise.all([getQuickStats(), getSessionUser()])

  const user = sessionUser ? {
    businessName: sessionUser.businessName,
    slug: sessionUser.slug,
    logoUrl: sessionUser.logoUrl,
  } : undefined

  return <AdminShell stats={stats} user={user}>{children}</AdminShell>
}
