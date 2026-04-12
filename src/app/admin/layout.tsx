import { getQuickStats } from '@/actions/quickStatsActions'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const stats = await getQuickStats()

  return <AdminShell stats={stats}>{children}</AdminShell>
}
