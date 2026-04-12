'use server'

import prisma from '@/lib/prisma'

export type SearchResult = {
  properties: { id: string; name: string; location: string; type: string }[]
  bookings: { id: string; customerName: string; propertyName: string; checkIn: string; checkOut: string }[]
  saleProperties: { id: string; title: string; location: string; price: number }[]
}

export async function globalSearch(query: string): Promise<SearchResult> {
  if (!query || query.trim().length < 2) {
    return { properties: [], bookings: [], saleProperties: [] }
  }

  const q = query.trim()

  const [properties, bookings, saleProperties] = await Promise.all([
    prisma.property.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, location: true, type: true },
      take: 5,
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          { customerName: { contains: q, mode: 'insensitive' } },
          { customerPhone: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { property: { select: { name: true } } },
      take: 5,
      orderBy: { checkInDate: 'desc' },
    }),
    prisma.saleProperty.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, location: true, price: true },
      take: 5,
    }),
  ])

  return {
    properties,
    bookings: bookings.map(b => ({
      id: b.id,
      customerName: b.customerName,
      propertyName: b.property.name,
      checkIn: b.checkInDate.toISOString(),
      checkOut: b.checkOutDate.toISOString(),
    })),
    saleProperties,
  }
}
