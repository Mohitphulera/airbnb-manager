'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function submitReview(formData: FormData) {
  const propertyId = formData.get('propertyId') as string
  const guestName = formData.get('guestName') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string

  if (!propertyId || !guestName || !rating || rating < 1 || rating > 5) {
    throw new Error('Invalid review data')
  }

  await prisma.review.create({
    data: { propertyId, guestName, rating, comment: comment || null }
  })

  revalidatePath(`/property/${propertyId}`)
}

export async function getReviewsForProperty(propertyId: string) {
  return prisma.review.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPropertyAverageRating(propertyId: string) {
  const result = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { rating: true },
  })
  return {
    avg: result._avg.rating ? Math.round(result._avg.rating * 10) / 10 : 0,
    count: result._count.rating,
  }
}

export async function getAllPropertyRatings() {
  const reviews = await prisma.review.findMany({
    select: { propertyId: true, rating: true }
  })
  const map: Record<string, { total: number; count: number }> = {}
  for (const r of reviews) {
    if (!map[r.propertyId]) map[r.propertyId] = { total: 0, count: 0 }
    map[r.propertyId].total += r.rating
    map[r.propertyId].count++
  }
  const result: Record<string, { avg: number; count: number }> = {}
  for (const [id, data] of Object.entries(map)) {
    result[id] = { avg: Math.round((data.total / data.count) * 10) / 10, count: data.count }
  }
  return result
}
