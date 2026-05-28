import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

/**
 * Lightweight proxy (Next.js 16 convention, replaces middleware.ts).
 * Only verifies the JWT cookie — does NOT import Prisma or bcryptjs,
 * keeping the bundle well under the 1 MB edge function size limit.
 */
export async function proxy(request: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? 'fallback-dev-secret-change-in-prod'
  const token = await getToken({ req: request, secret })
  const path = request.nextUrl.pathname

  // Protect all /admin/* routes
  if (path.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.nextUrl)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Redirect already-logged-in users away from /login and /signup
  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/admin', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup'],
}
