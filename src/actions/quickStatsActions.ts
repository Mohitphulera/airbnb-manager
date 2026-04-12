'use server'

import prisma from '@/lib/prisma'

export type QuickStats = {
  monthRevenue: number
  pendingRequests: number
  todayCheckIns: number
  todayCheckOuts: number
  totalProperties: number
}

export async function getQuickStats(): Promise<QuickStats> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const [monthBookings, pendingRequests, todayCheckIns, todayCheckOuts, totalProperties] = await Promise.all([
    prisma.booking.findMany({
      where: { checkInDate: { gte: monthStart } },
      select: { totalAmount: true },
    }),
    prisma.bookingRequest.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { checkInDate: { gte: todayStart, lt: todayEnd } } }),
    prisma.booking.count({ where: { checkOutDate: { gte: todayStart, lt: todayEnd } } }),
    prisma.property.count(),
  ])

  return {
    monthRevenue: monthBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    pendingRequests,
    todayCheckIns,
    todayCheckOuts,
    totalProperties,
  }
}
