'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getProperties() {
  return await prisma.property.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function addProperty(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const type = formData.get('type') as string
  const pricePerNight = parseFloat(formData.get('pricePerNight') as string)
  const whatsappNumber = formData.get('whatsappNumber') as string

  let commissionRate = null
  if (type === 'COMMISSION') {
    commissionRate = parseFloat(formData.get('commissionRate') as string)
  }

  const imageUrlsString = formData.get('imageUrls') as string
  const imageUrls = imageUrlsString ? JSON.stringify(imageUrlsString.split(',').map(s => s.trim()).filter(Boolean)) : null

  const amenitiesString = formData.get('amenities') as string
  const amenities = amenitiesString ? JSON.stringify(amenitiesString.split(',').filter(Boolean)) : null

  await prisma.property.create({
    data: { name, description, location, type, pricePerNight, commissionRate, whatsappNumber, imageUrls, amenities }
  })

  revalidatePath('/admin/properties')
  revalidatePath('/')
}

export async function deleteProperty(id: string) {
  await prisma.booking.deleteMany({ where: { propertyId: id } })
  await prisma.expense.deleteMany({ where: { propertyId: id } })
  await prisma.property.delete({ where: { id } })
  revalidatePath('/admin/properties')
  revalidatePath('/')
}
