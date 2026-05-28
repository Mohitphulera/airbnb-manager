'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'

// Public: called from guest-facing pages — no auth needed, just propertyId
export async function submitBookingRequest(formData: FormData) {
  const propertyId = formData.get('propertyId') as string
  const guestName = formData.get('guestName') as string
  const guestPhone = formData.get('guestPhone') as string
  const guestEmail = (formData.get('guestEmail') as string) || null
  const checkIn = new Date(formData.get('checkIn') as string)
  const checkOut = new Date(formData.get('checkOut') as string)
  const guests = parseInt(formData.get('guests') as string) || 1
  const message = (formData.get('message') as string) || null
  const totalAmount = parseFloat(formData.get('totalAmount') as string)

  if (!propertyId || !guestName || !guestPhone || !checkIn || !checkOut) {
    throw new Error('Missing required booking fields')
  }

  const request = await prisma.bookingRequest.create({
    data: { propertyId, guestName, guestPhone, guestEmail, checkIn, checkOut, guests, message, totalAmount, status: 'PENDING' }
  })

  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
  return request.id
}

// Admin: scoped to current user's properties
export async function getBookingRequests() {
  const user = await requireUser()
  return prisma.bookingRequest.findMany({
    where: { property: { userId: user.id } },
    include: { property: { select: { name: true, whatsappNumber: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateBookingRequestStatus(id: string, status: string) {
  const user = await requireUser()
  await prisma.bookingRequest.updateMany({ where: { id, property: { userId: user.id } }, data: { status } })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}

export async function confirmBookingRequest(id: string) {
  const user = await requireUser()
  const req = await prisma.bookingRequest.findFirst({ where: { id, property: { userId: user.id } }, include: { property: true } })
  if (!req) throw new Error('Not found')
  await prisma.bookingRequest.update({ where: { id }, data: { status: 'CONFIRMED' } })
  await prisma.booking.create({
    data: {
      propertyId: req.propertyId,
      customerName: req.guestName,
      customerPhone: req.guestPhone,
      checkInDate: req.checkIn,
      checkOutDate: req.checkOut,
      totalAmount: req.totalAmount,
      source: 'DIRECT',
      commissionOwed: req.property.type === 'COMMISSION' && req.property.commissionRate
        ? req.totalAmount * (req.property.commissionRate / 100) : null,
    }
  })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}
