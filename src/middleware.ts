import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/'

  const token = request.cookies.get('admin_token')?.value || ''

  // If trying to access admin without token
  if (path.startsWith('/admin') && token !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  // If trying to access login page while authenticated
  if (path === '/login' && token === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login'
  ]
}
