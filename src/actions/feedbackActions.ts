'use server'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

// submitFeedback is called from a public guest page — it needs a userId via propertyId
export async function submitFeedback(data: { bookingId?: string; guestName: string; guestPhone?: string; propertyName: string; rating: number; cleanliness?: number; comfort?: number; location?: number; valueForMoney?: number; comment?: string; wouldReturn?: boolean; userId: string }) {
  await prisma.feedback.create({ data: { userId: data.userId, bookingId: data.bookingId || null, guestName: data.guestName, guestPhone: data.guestPhone || null, propertyName: data.propertyName, rating: data.rating, cleanliness: data.cleanliness ?? null, comfort: data.comfort ?? null, location: data.location ?? null, valueForMoney: data.valueForMoney ?? null, comment: data.comment || null, wouldReturn: data.wouldReturn ?? null } })
  revalidatePath('/admin/feedback')
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
