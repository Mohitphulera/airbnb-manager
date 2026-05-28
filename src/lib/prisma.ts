import { PrismaClient } from '@prisma/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'

/**
 * PrismaNeonHttp uses Neon's HTTP API — no WebSockets, no persistent TCP,
 * works perfectly in Vercel serverless (Node.js) and edge functions.
 *
 * Constructor signature: PrismaNeonHttp(connectionString: string, options: HTTPQueryOptions)
 */
const prismaClientSingleton = () => {
  const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {
    arrayMode: false,
    fullResults: false,
  })
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
