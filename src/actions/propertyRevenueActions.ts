'use server'

import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export type PropertyRevenueSummary = {
  totalRevenue: number
  totalBookings: number
  avgNightlyRate: number
  occupancyRate: number  // percentage
  revenueThisMonth: number
  bookingsThisMonth: number
}

// Returns null unless the signed-in user owns the property.
export async function getPropertyRevenueSummary(propertyId: string): Promise<PropertyRevenueSummary | null> {
  const user = await getSessionUser()
  if (!user) return null
  const owned = await prisma.property.findFirst({ where: { id: propertyId, userId: user.id }, select: { id: true } })
  if (!owned) return null

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [allBookings, monthBookings, recentBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { propertyId },
      select: { totalAmount: true, checkInDate: true, checkOutDate: true },
    }),
    prisma.booking.findMany({
      where: { propertyId, checkInDate: { gte: monthStart, lt: new Date(now.getFullYear(), now.getMonth() + 1, 1) } },
      select: { totalAmount: true },
    }),
    prisma.booking.findMany({
      where: { propertyId, checkOutDate: { gt: ninetyDaysAgo }, checkInDate: { lt: now } },
      select: { checkInDate: true, checkOutDate: true },
    }),
  ])

  const totalRevenue = allBookings.reduce((s, b) => s + b.totalAmount, 0)
  const revenueThisMonth = monthBookings.reduce((s, b) => s + b.totalAmount, 0)

  // Occupancy over the last 90 days: only count nights that fall inside the window
  let bookedNights = 0
  for (const b of recentBookings) {
    const start = Math.max(b.checkInDate.getTime(), ninetyDaysAgo.getTime())
    const end = Math.min(b.checkOutDate.getTime(), now.getTime())
    bookedNights += Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
  }
  const occupancyRate = Math.min(100, Math.round((bookedNights / 90) * 100))

  const totalNights = allBookings.reduce(
    (s, b) => s + Math.max(1, Math.round((b.checkOutDate.getTime() - b.checkInDate.getTime()) / (1000 * 60 * 60 * 24))), 0)

  return {
    totalRevenue,
    totalBookings: allBookings.length,
    avgNightlyRate: totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0,
    occupancyRate,
    revenueThisMonth,
    bookingsThisMonth: monthBookings.length,
  }
}
