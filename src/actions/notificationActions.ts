'use server'

import prisma from '@/lib/prisma'

export type Notification = {
  id: string
  type: 'booking_request' | 'check_in' | 'check_out' | 'cleaning'
  title: string
  description: string
  time: string
  actionUrl?: string
  urgent: boolean
}

export async function getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)
  const weekEnd = new Date(todayStart)
  weekEnd.setDate(weekEnd.getDate() + 3)

  const [pendingRequests, todayCheckIns, todayCheckOuts, cleaningNeeded] = await Promise.all([
    prisma.bookingRequest.findMany({
      where: { status: 'PENDING' },
      include: { property: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { checkInDate: { gte: todayStart, lt: todayEnd } },
      include: { property: { select: { name: true } } },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { checkOutDate: { gte: todayStart, lt: todayEnd } },
      include: { property: { select: { name: true } } },
      take: 5,
    }),
    prisma.booking.findMany({
      where: {
        checkOutDate: { gte: todayStart, lt: weekEnd },
        cleaningStatus: 'PENDING',
      },
      include: { property: { select: { name: true } } },
      take: 3,
    }),
  ])

  const notifications: Notification[] = []

  for (const req of pendingRequests) {
    notifications.push({
      id: `req-${req.id}`,
      type: 'booking_request',
      title: `New request from ${req.guestName}`,
      description: `${req.property.name} · ₹${req.totalAmount.toLocaleString('en-IN')}`,
      time: timeAgo(req.createdAt),
      actionUrl: '/admin/requests',
      urgent: true,
    })
  }

  for (const b of todayCheckIns) {
    notifications.push({
      id: `ci-${b.id}`,
      type: 'check_in',
      title: `Check-in: ${b.customerName}`,
      description: `${b.property.name} · Today`,
      time: 'Today',
      actionUrl: '/admin/bookings',
      urgent: false,
    })
  }

  for (const b of todayCheckOuts) {
    notifications.push({
      id: `co-${b.id}`,
      type: 'check_out',
      title: `Check-out: ${b.customerName}`,
      description: `${b.property.name} · Today`,
      time: 'Today',
      actionUrl: '/admin/bookings',
      urgent: false,
    })
  }

  for (const b of cleaningNeeded) {
    notifications.push({
      id: `cl-${b.id}`,
      type: 'cleaning',
      title: `Cleaning needed`,
      description: `${b.property.name} after checkout`,
      time: 'Pending',
      actionUrl: '/admin/bookings',
      urgent: true,
    })
  }

  return {
    notifications,
    unreadCount: pendingRequests.length + cleaningNeeded.length,
  }
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
