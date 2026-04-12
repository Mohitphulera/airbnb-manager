'use server'

import prisma from '@/lib/prisma'

export type PropertyRevenueSummary = {
  totalRevenue: number
  totalBookings: number
  avgNightlyRate: number
  occupancyRate: number  // percentage
  revenueThisMonth: number
  bookingsThisMonth: number
}

export async function getPropertyRevenueSummary(propertyId: string): Promise<PropertyRevenueSummary> {
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
      where: { propertyId, checkInDate: { gte: monthStart } },
      select: { totalAmount: true },
    }),
    prisma.booking.findMany({
      where: { propertyId, checkInDate: { gte: ninetyDaysAgo } },
      select: { checkInDate: true, checkOutDate: true },
    }),
  ])

  const totalRevenue = allBookings.reduce((s, b) => s + b.totalAmount, 0)
  const revenueThisMonth = monthBookings.reduce((s, b) => s + b.totalAmount, 0)

  // Calculate occupancy for last 90 days
  let bookedNights = 0
  for (const b of recentBookings) {
    const nights = Math.max(1, Math.ceil((b.checkOutDate.getTime() - b.checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
    bookedNights += nights
  }
  const occupancyRate = Math.min(100, Math.round((bookedNights / 90) * 100))

  return {
    totalRevenue,
    totalBookings: allBookings.length,
    avgNightlyRate: allBookings.length > 0 ? Math.round(totalRevenue / allBookings.length) : 0,
    occupancyRate,
    revenueThisMonth,
    bookingsThisMonth: monthBookings.length,
  }
}
