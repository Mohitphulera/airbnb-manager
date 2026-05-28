import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig, Pool } from '@neondatabase/serverless'

// Use WebSockets for Neon connections in serverless environments
// This avoids the TCP connection timeout issue with Vercel serverless functions
if (typeof WebSocket === 'undefined') {
  // Node.js environment (local dev) — use ws package if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ws = require('ws')
    neonConfig.webSocketConstructor = ws
  } catch {
    // ws not available, will use HTTP fallback
  }
} else {
  // Browser / Edge environment — use native WebSocket
  neonConfig.webSocketConstructor = WebSocket
}

const connectionString = process.env.DATABASE_URL!

const prismaClientSingleton = () => {
  const pool = new Pool({ connectionString })
  const adapter = new PrismaNeon(pool)
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
