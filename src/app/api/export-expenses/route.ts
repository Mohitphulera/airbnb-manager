import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  const expenses = await prisma.expense.findMany({
    include: { property: true },
    orderBy: { date: 'desc' }
  })

  const bookings = await prisma.booking.findMany({
    include: { property: true },
    orderBy: { checkInDate: 'desc' }
  })

  // CSV for expenses
  let csv = 'Report Type,Property,Description,Category,Amount,Date\n'
  
  expenses.forEach(e => {
    csv += `Expense,"${e.property.name}","${e.description}",${e.category},${e.amount},${new Date(e.date).toLocaleDateString('en-IN')}\n`
  })
  
  csv += '\n\nReport Type,Property,Guest,Check-in,Check-out,Source,Revenue,Commission\n'
  
  bookings.forEach(b => {
    csv += `Booking,"${b.property.name}","${b.customerName}",${new Date(b.checkInDate).toLocaleDateString('en-IN')},${new Date(b.checkOutDate).toLocaleDateString('en-IN')},${b.source},${b.totalAmount},${b.commissionOwed || 0}\n`
  })

  // Summary
  const totalRevenue = bookings.reduce((s, b) => s + b.totalAmount, 0)
  const totalCommission = bookings.reduce((s, b) => s + (b.commissionOwed || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  
  csv += `\n\nSUMMARY\nTotal Revenue,${totalRevenue}\nTotal Commission,${totalCommission}\nTotal Expenses,${totalExpenses}\nNet Profit,${totalRevenue - totalCommission - totalExpenses}\n`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="cozy-bnb-report-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  })
}
