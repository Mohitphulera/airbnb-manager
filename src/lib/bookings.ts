import prisma from '@/lib/prisma'

const DAY_MS = 1000 * 60 * 60 * 24

/** Whole nights between two dates. Returns 0 for invalid or reversed ranges. */
export function nightsBetween(checkIn: Date, checkOut: Date): number {
  const diff = checkOut.getTime() - checkIn.getTime()
  if (!Number.isFinite(diff) || diff <= 0) return 0
  return Math.round(diff / DAY_MS) || 1
}

/** Validates a stay's dates. Returns an error message, or null when valid. */
export function validateStayDates(checkIn: Date, checkOut: Date): string | null {
  if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return 'Please choose valid check-in and check-out dates'
  if (checkOut <= checkIn) return 'Check-out must be after check-in'
  if (nightsBetween(checkIn, checkOut) > 365) return 'Stays longer than a year are not supported'
  return null
}

/** Finds a booking on the property that overlaps the given range (optionally ignoring one booking). */
export function findOverlappingBooking(propertyId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string) {
  return prisma.booking.findFirst({
    where: {
      propertyId,
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true, customerName: true, checkInDate: true, checkOutDate: true },
  })
}

export function commissionFor(totalAmount: number, property: { type: string; commissionRate: number | null }) {
  return property.type === 'COMMISSION' && property.commissionRate
    ? (totalAmount * property.commissionRate) / 100
    : null
}
