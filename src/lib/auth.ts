import NextAuth, { CredentialsSignin } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          const user = await prisma.user.findUnique({
            where: { email: (credentials.email as string).toLowerCase().trim() },
          })
          if (!user || !user.passwordHash) return null

          const valid = await bcrypt.compare(credentials.password as string, user.passwordHash)
          if (!valid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.businessName,
            slug: user.slug,
            businessName: user.businessName,
            logoUrl: user.logoUrl ?? undefined,
            plan: user.plan,
          }
        } catch (err) {
          console.error('[auth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.slug = (user as any).slug
        token.businessName = (user as any).businessName
        token.logoUrl = (user as any).logoUrl
        token.plan = (user as any).plan
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        ;(session.user as any).slug = token.slug
        ;(session.user as any).businessName = token.businessName
        ;(session.user as any).logoUrl = token.logoUrl
        ;(session.user as any).plan = token.plan
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET ?? 'fallback-dev-secret-change-in-prod',
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
})
