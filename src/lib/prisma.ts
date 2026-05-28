import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

/**
 * PrismaNeonHttp uses Neon's HTTP API — no WebSockets, no persistent TCP,
 * works perfectly in Vercel serverless (Node.js) and edge functions.
 */
const prismaClientSingleton = () => {
  const sql = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeonHttp(sql)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
