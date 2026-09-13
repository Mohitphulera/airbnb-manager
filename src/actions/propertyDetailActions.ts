'use server'

import prisma from '@/lib/prisma'

// Public: only fields that are safe to show to anyone. Never include wifi
// credentials, emergency contacts or booking guest details here.
export async function getPropertyById(id: string) {
  return prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      location: true,
      imageUrls: true,
      amenities: true,
      type: true,
      pricePerNight: true,
      whatsappNumber: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { businessName: true, slug: true, logoUrl: true, whatsappNumber: true } },
      bookings: {
        where: { checkOutDate: { gte: new Date() } },
        orderBy: { checkInDate: 'asc' },
        select: { checkInDate: true, checkOutDate: true },
      },
    },
  })
}
