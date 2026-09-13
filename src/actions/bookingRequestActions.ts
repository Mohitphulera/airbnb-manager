'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'
import { commissionFor, findOverlappingBooking, nightsBetween, validateStayDates } from '@/lib/bookings'
import { addGuestFromBooking } from './guestActions'

const REQUEST_STATUSES = ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED']

// Public: called from guest-facing pages — no auth, so never trust client-sent
// amounts. Price is computed from the property's nightly rate.
export async function submitBookingRequest(formData: FormData) {
  const propertyId = String(formData.get('propertyId') ?? '')
  const guestName = String(formData.get('guestName') ?? '').trim().slice(0, 100)
  const guestPhone = String(formData.get('guestPhone') ?? '').trim().slice(0, 20)
  const guestEmail = String(formData.get('guestEmail') ?? '').trim().slice(0, 200) || null
  const checkIn = new Date(String(formData.get('checkIn')))
  const checkOut = new Date(String(formData.get('checkOut')))
  const guests = Math.min(Math.max(parseInt(String(formData.get('guests'))) || 1, 1), 50)
  const message = String(formData.get('message') ?? '').trim().slice(0, 1000) || null

  if (!propertyId || !guestName || !guestPhone) {
    return { error: 'Please fill in your name and phone number' }
  }
  if (!/^[+\d][\d\s-]{6,}$/.test(guestPhone)) {
    return { error: 'Please enter a valid phone number' }
  }
  const dateError = validateStayDates(checkIn, checkOut)
  if (dateError) return { error: dateError }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (checkIn < today) return { error: 'Check-in date is in the past' }

  const property = await prisma.property.findUnique({ where: { id: propertyId }, select: { id: true, pricePerNight: true } })
  if (!property) return { error: 'This property is no longer available' }

  if (await findOverlappingBooking(propertyId, checkIn, checkOut)) {
    return { error: 'Sorry, these dates are already booked. Please pick different dates.' }
  }

  const totalAmount = nightsBetween(checkIn, checkOut) * property.pricePerNight

  const request = await prisma.bookingRequest.create({
    data: { propertyId, guestName, guestPhone, guestEmail, checkIn, checkOut, guests, message, totalAmount, status: 'PENDING' }
  })

  revalidatePath('/admin', 'layout')
  return { success: true, id: request.id, totalAmount }
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
  if (!REQUEST_STATUSES.includes(status)) throw new Error('Invalid status')
  await prisma.bookingRequest.updateMany({ where: { id, property: { userId: user.id } }, data: { status } })
  revalidatePath('/admin', 'layout')
}

export async function confirmBookingRequest(id: string) {
  const user = await requireUser()
  const req = await prisma.bookingRequest.findFirst({ where: { id, property: { userId: user.id } }, include: { property: true } })
  if (!req) return { error: 'Request not found' }
  if (req.status === 'CONFIRMED') return { error: 'This request is already confirmed' }

  // Dates may have been taken since the guest asked
  const clash = await findOverlappingBooking(req.propertyId, req.checkIn, req.checkOut)
  if (clash) {
    return { error: `Dates overlap with ${clash.customerName}'s booking. Reject this request or move the other booking first.` }
  }

  // Create the booking first so a failure never leaves a "confirmed" request without a booking
  await prisma.booking.create({
    data: {
      propertyId: req.propertyId,
      customerName: req.guestName,
      customerPhone: req.guestPhone,
      checkInDate: req.checkIn,
      checkOutDate: req.checkOut,
      totalAmount: req.totalAmount,
      source: 'DIRECT',
      commissionOwed: commissionFor(req.totalAmount, req.property),
      notes: req.message,
    }
  })
  await prisma.bookingRequest.update({ where: { id }, data: { status: 'CONFIRMED' } })

  try {
    await addGuestFromBooking({ customerName: req.guestName, customerPhone: req.guestPhone, checkInDate: req.checkIn, checkOutDate: req.checkOut, totalAmount: req.totalAmount, propertyName: req.property.name })
  } catch { /* guest sync is best-effort */ }

  revalidatePath('/admin', 'layout')
  return { success: true }
}
