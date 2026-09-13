'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

const PROPERTY_TYPES = ['OWNED', 'COMMISSION']

export async function getProperties() {
  const user = await requireUser()
  return await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })
}

export async function addProperty(formData: FormData) {
  const user = await requireUser()
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as string
  const pricePerNight = parseFloat(formData.get('pricePerNight') as string)
  const whatsappNumber = formData.get('whatsappNumber') as string

  if (!name?.trim() || !location?.trim()) return { error: 'Name and location are required' }
  if (!PROPERTY_TYPES.includes(type)) return { error: 'Invalid property type' }
  if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) return { error: 'Price per night must be a positive number' }

  let commissionRate = null
  if (type === 'COMMISSION') {
    commissionRate = parseFloat(formData.get('commissionRate') as string)
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      return { error: 'Commission rate must be between 0 and 100' }
    }
  }

  const imageUrlsString = formData.get('imageUrls') as string
  const imageUrls = imageUrlsString ? JSON.stringify(imageUrlsString.split(',').map(s => s.trim()).filter(Boolean)) : null

  const amenitiesString = formData.get('amenities') as string
  const amenities = amenitiesString ? JSON.stringify(amenitiesString.split(',').filter(Boolean)) : null

  await prisma.property.create({
    data: { userId: user.id, name: name.trim(), description: description ?? '', location: location.trim(), type, pricePerNight, commissionRate, whatsappNumber: whatsappNumber || null, imageUrls, amenities }
  })

  revalidatePath('/admin', 'layout')
  revalidatePath(`/${user.slug}`)
  return { success: true }
}

export async function deleteProperty(id: string) {
  const user = await requireUser()
  // Ensure property belongs to this user
  const prop = await prisma.property.findFirst({ where: { id, userId: user.id } })
  if (!prop) throw new Error('Not found')

  // Remove every child row first — these relations have no ON DELETE CASCADE, so
  // leftover reviews or booking requests would make the property delete fail.
  // (Sequential rather than $transaction: the Neon HTTP adapter has no transactions.)
  await prisma.booking.deleteMany({ where: { propertyId: id } })
  await prisma.expense.deleteMany({ where: { propertyId: id } })
  await prisma.review.deleteMany({ where: { propertyId: id } })
  await prisma.bookingRequest.deleteMany({ where: { propertyId: id } })
  await prisma.property.delete({ where: { id } })
  revalidatePath('/admin/properties')
  revalidatePath(`/${user.slug}`)
}

export async function updateProperty(id: string, data: Record<string, any>) {
  const user = await requireUser()
  const prop = await prisma.property.findFirst({ where: { id, userId: user.id } })
  if (!prop) throw new Error('Not found')

  const updateData: Record<string, any> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.location !== undefined) updateData.location = data.location
  if (data.type !== undefined) updateData.type = data.type
  if (data.type !== undefined && !PROPERTY_TYPES.includes(data.type)) return { error: 'Invalid property type' }
  if (data.pricePerNight !== undefined) {
    const price = parseFloat(data.pricePerNight)
    if (!Number.isFinite(price) || price <= 0) return { error: 'Price per night must be a positive number' }
    updateData.pricePerNight = price
  }
  if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber
  if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate ? parseFloat(data.commissionRate) : null

  await prisma.property.update({ where: { id }, data: updateData })
  revalidatePath('/admin', 'layout')
  revalidatePath(`/${user.slug}`)
  return { success: true }
}
