import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Production (Neon): PrismaNeonHttp uses Neon's HTTP API — no WebSockets, no
 * persistent TCP, works in Vercel serverless and edge functions.
 *
 * Local development (any non-Neon Postgres URL): use the standard pg driver,
 * since the Neon HTTP adapter can only talk to Neon endpoints.
 */
const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL is not set')

  const adapter = url.includes('neon.tech')
    ? new PrismaNeonHttp(url, { arrayMode: false, fullResults: false })
    : new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
