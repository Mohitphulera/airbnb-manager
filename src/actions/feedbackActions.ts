'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

const optionalStars = (v?: number) => (v && Number.isInteger(v) && v >= 1 && v <= 5 ? v : null)

// Public (guest-facing). The owner and property name are resolved server-side
// from propertyId so a guest cannot file feedback against another host.
export async function submitFeedback(data: { propertyId: string; bookingId?: string; guestName: string; guestPhone?: string; rating: number; cleanliness?: number; comfort?: number; location?: number; valueForMoney?: number; comment?: string; wouldReturn?: boolean }) {
  const guestName = data.guestName?.trim().slice(0, 100)
  if (!guestName || !optionalStars(data.rating)) return { error: 'Please add your name and an overall rating' }

  const property = await prisma.property.findUnique({ where: { id: data.propertyId }, select: { id: true, name: true, userId: true } })
  if (!property) return { error: 'Property not found' }

  const booking = data.bookingId
    ? await prisma.booking.findFirst({ where: { id: data.bookingId, propertyId: property.id }, select: { id: true } })
    : null

  await prisma.feedback.create({
    data: {
      userId: property.userId,
      bookingId: booking?.id ?? null,
      guestName,
      guestPhone: data.guestPhone?.trim() || null,
      propertyName: property.name,
      rating: data.rating,
      cleanliness: optionalStars(data.cleanliness),
      comfort: optionalStars(data.comfort),
      location: optionalStars(data.location),
      valueForMoney: optionalStars(data.valueForMoney),
      comment: data.comment?.trim().slice(0, 2000) || null,
      wouldReturn: data.wouldReturn ?? null,
    },
  })
  revalidatePath('/admin/feedback')
  return { success: true }
}

export async function getAllFeedback() {
  const user = await requireUser()
  return prisma.feedback.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 200 })
}

export async function getFeedbackStats() {
  const user = await requireUser()
  const all = await prisma.feedback.findMany({ where: { userId: user.id } })
  if (all.length === 0) return { count: 0, avgRating: 0, avgCleanliness: 0, avgComfort: 0, avgLocation: 0, avgValue: 0, returnRate: 0 }
  const avg = (arr: (number | null)[]) => { const valid = arr.filter(v => v != null) as number[]; return valid.length ? +(valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1) : 0 }
  return {
    count: all.length,
    avgRating: avg(all.map(f => f.rating)),
    avgCleanliness: avg(all.map(f => f.cleanliness)),
    avgComfort: avg(all.map(f => f.comfort)),
    avgLocation: avg(all.map(f => f.location)),
    avgValue: avg(all.map(f => f.valueForMoney)),
    returnRate: Math.round((all.filter(f => f.wouldReturn === true).length / all.length) * 100),
  }
}
