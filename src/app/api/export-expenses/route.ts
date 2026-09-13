import prisma from '@/lib/prisma'
import { getSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

// Quote every field and neutralise spreadsheet formula injection (=, +, -, @)
function csvCell(value: string | number): string {
  let s = String(value)
  if (/^[=+\-@\t\r]/.test(s) && typeof value === 'string') s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

const row = (cells: (string | number)[]) => cells.map(csvCell).join(',') + '\n'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [expenses, bookings] = await Promise.all([
    prisma.expense.findMany({
      where: { property: { userId: user.id } },
      include: { property: true },
      orderBy: { date: 'desc' }
    }),
    prisma.booking.findMany({
      where: { property: { userId: user.id } },
      include: { property: true },
      orderBy: { checkInDate: 'desc' }
    }),
  ])

  const fmt = (d: Date) => d.toLocaleDateString('en-IN')

  let csv = row(['Report Type', 'Property', 'Description', 'Category', 'Amount', 'Date'])
  expenses.forEach(e => {
    csv += row(['Expense', e.property.name, e.description, e.category, e.amount, fmt(e.date)])
  })

  csv += '\n\n' + row(['Report Type', 'Property', 'Guest', 'Check-in', 'Check-out', 'Source', 'Revenue', 'Commission'])
  bookings.forEach(b => {
    csv += row(['Booking', b.property.name, b.customerName, fmt(b.checkInDate), fmt(b.checkOutDate), b.source, b.totalAmount, b.commissionOwed || 0])
  })

  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0)
  const totalCommission = bookings.reduce((s, b) => s + (b.commissionOwed || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  csv += '\n\nSUMMARY\n'
  csv += row(['Total Revenue', totalRevenue])
  csv += row(['Total Commission', totalCommission])
  csv += row(['Total Expenses', totalExpenses])
  csv += row(['Net Profit', totalRevenue - totalCommission - totalExpenses])

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${user.slug || 'business'}-report-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
