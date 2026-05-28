import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const secret = process.env.AUTH_SECRET ?? 'fallback-dev-secret-change-in-prod'

/**
 * Lightweight proxy (formerly middleware) — only verifies the JWT cookie,
 * does NOT import Prisma or bcryptjs, so the bundle stays well under 1 MB.
 */
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret })
  const path = request.nextUrl.pathname

  // Protect all /admin/* routes
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.nextUrl))
    }
    return NextResponse.next()
  }

  // Redirect already-logged-in users away from /login
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/admin', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
