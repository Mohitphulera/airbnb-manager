import { auth } from '@/lib/auth'

export interface SessionUser {
  id: string
  email: string
  businessName: string
  slug: string
  logoUrl?: string
  plan: string
}

/**
 * Get the current session user from NextAuth.
 * Throws if the user is not authenticated.
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  const u = session.user as any
  return {
    id: u.id,
    email: u.email ?? '',
    businessName: u.businessName ?? '',
    slug: u.slug ?? '',
    logoUrl: u.logoUrl,
    plan: u.plan ?? 'FREE',
  }
}

/**
 * Get the current session user, returns null if not authenticated.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    return await requireUser()
  } catch {
    return null
  }
}
