'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
    data: {
      propertyId,
      guestName,
      guestPhone,
      guestEmail,
      checkIn,
      checkOut,
      guests,
      message,
      totalAmount,
      status: 'PENDING',
    }
  })

  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
  return request.id
}

export async function getBookingRequests() {
  return prisma.bookingRequest.findMany({
    include: { property: { select: { name: true, whatsappNumber: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateBookingRequestStatus(id: string, status: string) {
  await prisma.bookingRequest.update({
    where: { id },
    data: { status },
  })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}

export async function confirmBookingRequest(id: string) {
  const req = await prisma.bookingRequest.update({
    where: { id },
    data: { status: 'CONFIRMED' },
    include: { property: true },
  })
  // Also create an actual Booking record
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
        ? req.totalAmount * (req.property.commissionRate / 100)
        : null,
    }
  })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}
