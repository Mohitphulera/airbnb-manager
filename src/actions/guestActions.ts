'use server'

import prisma from '@/lib/prisma'
import { requireUser } from '@/lib/session'

function calcTier(stays: number): string {
  if (stays >= 11) return 'PLATINUM'
  if (stays >= 7) return 'GOLD'
  if (stays >= 4) return 'SILVER'
  if (stays >= 2) return 'BRONZE'
  return 'NEW'
}

export async function getAllGuests(search?: string, tierFilter?: string, tagFilter?: string) {
  const user = await requireUser()
  const where: any = { userId: user.id }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (tierFilter && tierFilter !== 'ALL') where.loyaltyTier = tierFilter
  if (tagFilter) where.tags = { contains: tagFilter }
  return prisma.guest.findMany({ where, orderBy: { updatedAt: 'desc' }, take: 200 })
}

export async function getGuestById(id: string) {
  const user = await requireUser()
  return prisma.guest.findFirst({ where: { id, userId: user.id } })
}

export async function upsertGuest(data: {
  name: string; phone: string; email?: string;
  tags?: string; notes?: string; birthday?: string; city?: string
}) {
  const user = await requireUser()
  const existing = await prisma.guest.findUnique({ where: { userId_phone: { userId: user.id, phone: data.phone } } })
  if (existing) {
    return prisma.guest.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        email: data.email || existing.email,
        tags: data.tags ?? existing.tags,
        notes: data.notes ?? existing.notes,
        birthday: data.birthday ? new Date(data.birthday) : existing.birthday,
        city: data.city || existing.city,
      },
    })
  }
  return prisma.guest.create({
    data: {
      userId: user.id,
      name: data.name, phone: data.phone,
      email: data.email || null, tags: data.tags || null,
      notes: data.notes || null,
      birthday: data.birthday ? new Date(data.birthday) : null,
      city: data.city || null,
    },
  })
}

export async function addGuestFromBooking(booking: {
  customerName: string; customerPhone: string;
  checkInDate: Date; checkOutDate: Date;
  totalAmount: number; propertyName: string;
}) {
  // This may be called without a session (from addBooking), so we call requireUser
  const user = await requireUser()
  if (!booking.customerPhone) return null
  const phone = booking.customerPhone.replace(/\s/g, '')
  const existing = await prisma.guest.findUnique({ where: { userId_phone: { userId: user.id, phone } } })
  if (existing) {
    const newStays = existing.totalStays + 1
    return prisma.guest.update({
      where: { id: existing.id },
      data: {
        name: booking.customerName, totalStays: newStays,
        totalSpent: existing.totalSpent + booking.totalAmount,
        lastCheckIn: booking.checkInDate, lastCheckOut: booking.checkOutDate,
        lastProperty: booking.propertyName, loyaltyTier: calcTier(newStays),
        tags: newStays >= 2 && !(existing.tags || '').includes('Repeat')
          ? JSON.stringify([...JSON.parse(existing.tags || '[]'), 'Repeat']) : existing.tags,
      },
    })
  }
  return prisma.guest.create({
    data: {
      userId: user.id, name: booking.customerName, phone,
      totalStays: 1, totalSpent: booking.totalAmount,
      lastCheckIn: booking.checkInDate, lastCheckOut: booking.checkOutDate,
      lastProperty: booking.propertyName, loyaltyTier: 'NEW',
    },
  })
}

export async function updateGuestTags(id: string, tags: string[]) {
  const user = await requireUser()
  return prisma.guest.updateMany({ where: { id, userId: user.id }, data: { tags: JSON.stringify(tags) } })
}

export async function updateGuestNotes(id: string, notes: string) {
  const user = await requireUser()
  return prisma.guest.updateMany({ where: { id, userId: user.id }, data: { notes } })
}

export async function deleteGuest(id: string) {
  const user = await requireUser()
  return prisma.guest.deleteMany({ where: { id, userId: user.id } })
}

export async function getGuestStats() {
  const user = await requireUser()
  const [total, tiers, recentMonth] = await Promise.all([
    prisma.guest.count({ where: { userId: user.id } }),
    prisma.guest.groupBy({ by: ['loyaltyTier'], where: { userId: user.id }, _count: true }),
    prisma.guest.count({
      where: { userId: user.id, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
    }),
  ])
  const repeat = await prisma.guest.count({ where: { userId: user.id, totalStays: { gte: 2 } } })
  const tierMap: Record<string, number> = {}
  tiers.forEach(t => { tierMap[t.loyaltyTier] = t._count })
  return { total, newThisMonth: recentMonth, repeatRate: total > 0 ? Math.round((repeat / total) * 100) : 0, tiers: tierMap }
}
