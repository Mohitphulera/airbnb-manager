import { PrismaClient } from '@prisma/client'

/**
 * Standard PrismaClient singleton.
 * Works on Vercel (Node.js serverless) + Neon PostgreSQL without any custom adapter.
 * Neon accepts standard PostgreSQL connections over TCP/TLS.
 */
const prismaClientSingleton = () => new PrismaClient()

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>
} & typeof global

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
