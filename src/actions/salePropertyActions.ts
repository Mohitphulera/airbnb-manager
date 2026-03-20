'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getSaleProperties() {
  return await prisma.saleProperty.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getAvailableSaleProperties() {
  return await prisma.saleProperty.findMany({
    where: { status: { not: 'SOLD' } },
    orderBy: { createdAt: 'desc' }
  })
}

export async function addSaleProperty(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const price = parseFloat(formData.get('price') as string)
  const areaStr = formData.get('area') as string
  const area = areaStr ? parseFloat(areaStr) : null
  const bedroomsStr = formData.get('bedrooms') as string
  const bedrooms = bedroomsStr ? parseInt(bedroomsStr) : null
  const bathroomsStr = formData.get('bathrooms') as string
  const bathrooms = bathroomsStr ? parseInt(bathroomsStr) : null
  const propertyType = formData.get('propertyType') as string
  const whatsappNumber = formData.get('whatsappNumber') as string
  const rentalStr = formData.get('monthlyRentalEstimate') as string
  const monthlyRentalEstimate = rentalStr ? parseFloat(rentalStr) : null

  const imageUrlsString = formData.get('imageUrls') as string
  const imageUrls = imageUrlsString ? JSON.stringify(imageUrlsString.split(',').map(s => s.trim()).filter(Boolean)) : null

  const featuresString = formData.get('features') as string
  const features = featuresString ? JSON.stringify(featuresString.split(',').filter(Boolean)) : null

  await prisma.saleProperty.create({
    data: { title, description, location, price, area, bedrooms, bathrooms, propertyType, whatsappNumber, imageUrls, features, monthlyRentalEstimate }
  })

  revalidatePath('/admin/sale-properties')
  revalidatePath('/properties-for-sale')
}

export async function updateSalePropertyStatus(id: string, status: string) {
  await prisma.saleProperty.update({
    where: { id },
    data: { status }
  })
  revalidatePath('/admin/sale-properties')
  revalidatePath('/properties-for-sale')
}

export async function deleteSaleProperty(id: string) {
  await prisma.saleProperty.delete({ where: { id } })
  revalidatePath('/admin/sale-properties')
  revalidatePath('/properties-for-sale')
}
