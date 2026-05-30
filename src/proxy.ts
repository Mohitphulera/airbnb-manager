import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const secret = process.env.AUTH_SECRET ?? 'fallback-dev-secret-change-in-prod'
  const path = request.nextUrl.pathname

  // IMPORTANT: On Vercel (HTTPS), NextAuth v5 sets __Secure-authjs.session-token
  // We must pass secureCookie: true so getToken looks for the right cookie name
  const isSecure = request.nextUrl.protocol === 'https:'

  const token = await getToken({ req: request, secret, secureCookie: isSecure })

  if (path.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.nextUrl)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  if ((path === '/login' || path === '/signup') && token) {
    return NextResponse.redirect(new URL('/admin', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup'],
}
