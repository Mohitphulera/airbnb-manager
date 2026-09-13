import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

function formatDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').split('T')[0]
}

function escapeICS(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const propertyId = req.nextUrl.searchParams.get('propertyId')

  const bookings = await prisma.booking.findMany({
    where: { property: { userId: user.id }, ...(propertyId ? { propertyId } : {}) },
    include: { property: true },
    orderBy: { checkInDate: 'asc' },
  })

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//StayDesk//Bookings//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(user.businessName || 'Bookings')}`,
    'X-WR-TIMEZONE:Asia/Kolkata',
  ]

  bookings.forEach(b => {
    const start = formatDate(b.checkInDate)
    const end = formatDate(b.checkOutDate)
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeICS(b.customerName)} @ ${escapeICS(b.property.name)}`,
      `DESCRIPTION:${escapeICS(`Guest: ${b.customerName}\\nPhone: ${b.customerPhone || 'N/A'}\\nProperty: ${b.property.name}\\nAmount: ₹${b.totalAmount.toLocaleString('en-IN')}\\nSource: ${b.source}`)}`,
      `LOCATION:${escapeICS(b.property.name)}`,
      `UID:${b.id}@staydesk`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
    )
  })

  lines.push('END:VCALENDAR')

  return new NextResponse(lines.join('\r\n'), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="bookings.ics"',
    },
  })
}
