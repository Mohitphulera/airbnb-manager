import { getQuickStats } from '@/actions/quickStatsActions'
import { getSessionUser } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hard server-side auth check — belt-and-suspenders alongside the proxy
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect('/login')

  // Read branding from the database, not the JWT: the token is minted at login
  // and would keep showing the old name/logo after the host edits Settings.
  const [stats, dbUser] = await Promise.all([
    getQuickStats(),
    prisma.user.findUnique({ where: { id: sessionUser.id }, select: { businessName: true, slug: true, logoUrl: true } }),
  ])
  if (!dbUser) redirect('/login')

  const user = { businessName: dbUser.businessName, slug: dbUser.slug, logoUrl: dbUser.logoUrl ?? undefined }

  return <AdminShell stats={stats} user={user}>{children}</AdminShell>
}
