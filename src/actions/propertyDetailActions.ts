'use server'

import prisma from '@/lib/prisma'

export async function getPropertyById(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      bookings: {
        orderBy: { checkInDate: 'asc' },
        select: {
          checkInDate: true,
          checkOutDate: true,
          source: true,
        }
      }
    }
  })
  return property
}
