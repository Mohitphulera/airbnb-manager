'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/session'
import { addGuestFromBooking } from './guestActions'
import { commissionFor, findOverlappingBooking, nightsBetween, validateStayDates } from '@/lib/bookings'

const BOOKING_SOURCES = ['AIRBNB', 'DIRECT', 'OTHER']
const CLEANING_STATUSES = ['PENDING', 'IN_PROGRESS', 'DONE']

export async function getBookings() {
  const user = await requireUser()
  return await prisma.booking.findMany({
    where: { property: { userId: user.id } },
    include: { property: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function addBooking(formData: FormData) {
  const user = await requireUser()
  const propertyId = String(formData.get('propertyId') ?? '')
  const customerName = String(formData.get('customerName') ?? '').trim()
  const customerPhone = String(formData.get('customerPhone') ?? '').trim()
  const checkInDate = new Date(String(formData.get('checkInDate')))
  const checkOutDate = new Date(String(formData.get('checkOutDate')))
  const source = String(formData.get('source') ?? 'DIRECT')
  const notes = String(formData.get('notes') ?? '').trim()

  if (!customerName) return { error: 'Guest name is required' }
  if (!BOOKING_SOURCES.includes(source)) return { error: 'Invalid booking source' }
  const dateError = validateStayDates(checkInDate, checkOutDate)
  if (dateError) return { error: dateError }

  // Ensure property belongs to user
  const property = await prisma.property.findFirst({ where: { id: propertyId, userId: user.id } })
  if (!property) return { error: 'Property not found' }

  const clash = await findOverlappingBooking(propertyId, checkInDate, checkOutDate)
  if (clash) {
    return { error: `Overlap detected: ${property.name} is already booked by ${clash.customerName} during these dates.` }
  }

  const totalAmount = nightsBetween(checkInDate, checkOutDate) * property.pricePerNight
  const commissionOwed = commissionFor(totalAmount, property)

  await prisma.booking.create({
    data: { propertyId, customerName, customerPhone: customerPhone || null, checkInDate, checkOutDate, totalAmount, source, commissionOwed, notes: notes || null },
  })

  try {
    await addGuestFromBooking({ customerName, customerPhone, checkInDate, checkOutDate, totalAmount, propertyName: property.name })
  } catch { /* guest sync is best-effort */ }

  revalidatePath('/admin', 'layout')
  return { success: true }
}

export async function updateCleaningStatus(id: string, cleaningStatus: string) {
  const user = await requireUser()
  if (!CLEANING_STATUSES.includes(cleaningStatus)) throw new Error('Invalid cleaning status')
  await prisma.booking.updateMany({ where: { id, property: { userId: user.id } }, data: { cleaningStatus } })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}

export async function updateBookingNotes(id: string, notes: string) {
  const user = await requireUser()
  await prisma.booking.updateMany({ where: { id, property: { userId: user.id } }, data: { notes } })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}

export async function deleteBooking(id: string) {
  const user = await requireUser()
  await prisma.booking.deleteMany({ where: { id, property: { userId: user.id } } })
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

export async function updateBooking(id: string, data: Record<string, unknown>) {
  const user = await requireUser()
  const booking = await prisma.booking.findFirst({ where: { id, property: { userId: user.id } }, include: { property: true } })
  if (!booking) return { error: 'Not found' }

  const updateData: Record<string, unknown> = {}
  if (data.customerName !== undefined) updateData.customerName = String(data.customerName).trim()
  if (data.customerPhone !== undefined) updateData.customerPhone = String(data.customerPhone).trim() || null
  if (data.source !== undefined) {
    if (!BOOKING_SOURCES.includes(String(data.source))) return { error: 'Invalid booking source' }
    updateData.source = data.source
  }
  if (data.notes !== undefined) updateData.notes = String(data.notes) || null

  const checkIn = data.checkInDate !== undefined ? new Date(String(data.checkInDate)) : booking.checkInDate
  const checkOut = data.checkOutDate !== undefined ? new Date(String(data.checkOutDate)) : booking.checkOutDate
  if (data.checkInDate !== undefined || data.checkOutDate !== undefined) {
    const dateError = validateStayDates(checkIn, checkOut)
    if (dateError) return { error: dateError }
    if (await findOverlappingBooking(booking.propertyId, checkIn, checkOut, id)) {
      return { error: 'These dates overlap another booking' }
    }
    updateData.checkInDate = checkIn
    updateData.checkOutDate = checkOut
  }

  if (data.totalAmount !== undefined) {
    const totalAmount = parseFloat(String(data.totalAmount))
    if (!Number.isFinite(totalAmount) || totalAmount < 0) return { error: 'Invalid amount' }
    updateData.totalAmount = totalAmount
    // Keep the partner's commission in sync with the new amount
    updateData.commissionOwed = commissionFor(totalAmount, booking.property)
  }

  await prisma.booking.update({ where: { id }, data: updateData })
  revalidatePath('/admin', 'layout')
  return { success: true }
}

// ===== ANALYTICS HELPERS =====

export async function getDashboardData() {
  const user = await requireUser()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [allBookings, allProperties, allExpenses] = await Promise.all([
    prisma.booking.findMany({
      where: { property: { userId: user.id } },
      include: { property: true },
      orderBy: { checkInDate: 'asc' },
    }),
    prisma.property.findMany({ where: { userId: user.id } }),
    prisma.expense.findMany({
      where: { property: { userId: user.id } },
      include: { property: true },
      orderBy: { date: 'desc' },
    }),
  ])

  const todayCheckIns = allBookings.filter(b => { const d = new Date(b.checkInDate); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
  const todayCheckOuts = allBookings.filter(b => { const d = new Date(b.checkOutDate); d.setHours(0,0,0,0); return d.getTime() === today.getTime() })
  const upcomingCheckIns = allBookings.filter(b => { const d = new Date(b.checkInDate); d.setHours(0,0,0,0); return d > today && d <= weekEnd })
  const cleaningNeeded = allBookings.filter(b => { const d = new Date(b.checkOutDate); d.setHours(0,0,0,0); return d.getTime() >= today.getTime() && d <= tomorrow && b.cleaningStatus !== 'DONE' })

  const next30 = new Date(today)
  next30.setDate(next30.getDate() + 30)
  const emptyNights: { property: string; propertyId: string; dates: string[] }[] = []
  allProperties.forEach(prop => {
    const propBookings = allBookings.filter(b => b.propertyId === prop.id)
    const empty: string[] = []
    for (let d = new Date(today); d < next30; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const isBooked = propBookings.some(b => {
        const ci = new Date(b.checkInDate); ci.setHours(0,0,0,0)
        const co = new Date(b.checkOutDate); co.setHours(0,0,0,0)
        return d >= ci && d < co
      })
      if (!isBooked) empty.push(dateStr)
    }
    if (empty.length > 0) emptyNights.push({ property: prop.name, propertyId: prop.id, dates: empty })
  })

  const propertyPnL = allProperties.map(prop => {
    const propBookings = allBookings.filter(b => b.propertyId === prop.id)
    const propExpenses = allExpenses.filter(e => e.propertyId === prop.id)
    const revenue = propBookings.reduce((s, b) => s + b.totalAmount, 0)
    const commission = propBookings.reduce((s, b) => s + (b.commissionOwed || 0), 0)
    const expenses = propExpenses.reduce((s, e) => s + e.amount, 0)
    const profit = revenue - commission - expenses
    const totalNights = propBookings.reduce((s, b) => s + nightsBetween(new Date(b.checkInDate), new Date(b.checkOutDate)), 0)
    const ninetyDaysAgo = new Date(today); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    // Include stays that started before the window but overlap it; clip to [90 days ago, today]
    const bookedNightsLast90 = propBookings.reduce((s, b) => {
      const ci = new Date(b.checkInDate) < ninetyDaysAgo ? ninetyDaysAgo : new Date(b.checkInDate)
      const co = new Date(b.checkOutDate) > today ? today : new Date(b.checkOutDate)
      return s + Math.max(0, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)))
    }, 0)
    const occupancyRate = Math.min(100, Math.round((bookedNightsLast90 / 90) * 100))
    // RevPAR = revenue earned from nights in the last 90 days / 90 available nights
    const revenueLast90 = propBookings.reduce((s, b) => {
      const nights = nightsBetween(new Date(b.checkInDate), new Date(b.checkOutDate))
      if (nights === 0) return s
      const ci = new Date(b.checkInDate) < ninetyDaysAgo ? ninetyDaysAgo : new Date(b.checkInDate)
      const co = new Date(b.checkOutDate) > today ? today : new Date(b.checkOutDate)
      const inWindow = Math.max(0, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)))
      return s + (b.totalAmount / nights) * inWindow
    }, 0)
    const revPAR = Math.round(revenueLast90 / 90)
    return { id: prop.id, name: prop.name, type: prop.type, pricePerNight: prop.pricePerNight, revenue, commission, expenses, profit, totalNights, occupancyRate, revPAR, bookingCount: propBookings.length }
  })

  const monthlyTrend = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(today); d.setMonth(d.getMonth() - (11 - i))
    const month = d.getMonth(); const year = d.getFullYear()
    const mb = allBookings.filter(b => { const bd = new Date(b.checkInDate); return bd.getMonth() === month && bd.getFullYear() === year })
    const me = allExpenses.filter(e => { const ed = new Date(e.date); return ed.getMonth() === month && ed.getFullYear() === year })
    const revenue = mb.reduce((s, b) => s + b.totalAmount, 0)
    const expenses = me.reduce((s, e) => s + e.amount, 0)
    const commission = mb.reduce((s, b) => s + (b.commissionOwed || 0), 0)
    return { month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }), revenue, expenses, commission, profit: revenue - commission - expenses }
  })

  const revenueBySource = {
    AIRBNB: allBookings.filter(b => b.source === 'AIRBNB').reduce((s, b) => s + b.totalAmount, 0),
    DIRECT: allBookings.filter(b => b.source === 'DIRECT').reduce((s, b) => s + b.totalAmount, 0),
    OTHER: allBookings.filter(b => b.source === 'OTHER').reduce((s, b) => s + b.totalAmount, 0),
  }

  const pricingSuggestions = allProperties.map(prop => {
    const propBookings = allBookings.filter(b => b.propertyId === prop.id)
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentBookings = propBookings.filter(b => new Date(b.checkOutDate) > thirtyDaysAgo)
    const bookedNights30 = recentBookings.reduce((s, b) => {
      const ci = new Date(b.checkInDate) < thirtyDaysAgo ? thirtyDaysAgo : new Date(b.checkInDate)
      const co = new Date(b.checkOutDate) > new Date() ? new Date() : new Date(b.checkOutDate)
      return s + Math.max(0, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)))
    }, 0)
    const occ30 = bookedNights30 / 30
    let suggestion = '', suggestedPrice = prop.pricePerNight, type: 'increase' | 'decrease' | 'neutral' = 'neutral'
    if (occ30 > 0.8) { suggestion = `High demand (${Math.round(occ30*100)}% occupancy). Consider raising price by 15–20%.`; suggestedPrice = Math.round(prop.pricePerNight * 1.15); type = 'increase' }
    else if (occ30 > 0.5) { suggestion = `Good occupancy (${Math.round(occ30*100)}%). Price is well-calibrated.` }
    else if (occ30 > 0.2) { suggestion = `Moderate demand (${Math.round(occ30*100)}%). Try a 10% discount.`; suggestedPrice = Math.round(prop.pricePerNight * 0.9); type = 'decrease' }
    else { suggestion = `Low occupancy (${Math.round(occ30*100)}%). Recommend 15–20% discount or more platforms.`; suggestedPrice = Math.round(prop.pricePerNight * 0.8); type = 'decrease' }
    return { propertyId: prop.id, propertyName: prop.name, currentPrice: prop.pricePerNight, suggestedPrice, suggestion, type, weekendInsight: '', occupancy30: Math.round(occ30 * 100) }
  })

  const expenseByCategory = {
    CLEANING: allExpenses.filter(e => e.category === 'CLEANING').reduce((s, e) => s + e.amount, 0),
    REPAIR: allExpenses.filter(e => e.category === 'REPAIR').reduce((s, e) => s + e.amount, 0),
    UTILITY: allExpenses.filter(e => e.category === 'UTILITY').reduce((s, e) => s + e.amount, 0),
    OTHER: allExpenses.filter(e => e.category === 'OTHER').reduce((s, e) => s + e.amount, 0),
  }

  const totalRevenue = allBookings.reduce((s, b) => s + b.totalAmount, 0)
  const totalExpensesAmt = allExpenses.reduce((s, e) => s + e.amount, 0)
  const totalCommission = allBookings.reduce((s, b) => s + (b.commissionOwed || 0), 0)
  const insights: string[] = []
  if (revenueBySource.DIRECT > revenueBySource.AIRBNB) insights.push('✅ Direct bookings exceed Airbnb — great margin!')
  else if (revenueBySource.AIRBNB > 0) { const pct = Math.round((revenueBySource.AIRBNB / Math.max(totalRevenue, 1)) * 100); insights.push(`📊 ${pct}% of revenue from Airbnb. Grow direct bookings to save on fees.`) }
  if (totalExpensesAmt > totalRevenue * 0.3) insights.push(`⚠️ Expenses are ${Math.round((totalExpensesAmt / Math.max(totalRevenue, 1)) * 100)}% of revenue — review costs.`)
  const bestMonth = monthlyTrend.reduce((best, m) => m.revenue > best.revenue ? m : best, monthlyTrend[0])
  if (bestMonth?.revenue > 0) insights.push(`🏆 Best month: ${bestMonth.month} with ₹${bestMonth.revenue.toLocaleString('en-IN')} revenue.`)
  emptyNights.forEach(en => { if (en.dates.length > 15) insights.push(`🔴 ${en.property} has ${en.dates.length} empty nights in next 30 days.`) })

  const serialize = (b: any) => ({ ...b, checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(), property: { ...b.property, createdAt: b.property.createdAt.toISOString(), updatedAt: b.property.updatedAt.toISOString() } })

  return {
    todayCheckIns: todayCheckIns.map(serialize),
    todayCheckOuts: todayCheckOuts.map(serialize),
    upcomingCheckIns: upcomingCheckIns.map(serialize),
    cleaningNeeded: cleaningNeeded.map(serialize),
    emptyNights, propertyPnL, monthlyTrend, revenueBySource, pricingSuggestions, expenseByCategory, insights,
    totals: {
      revenue: totalRevenue, expenses: totalExpensesAmt, commission: totalCommission,
      profit: totalRevenue - totalCommission - totalExpensesAmt,
      properties: allProperties.length, bookings: allBookings.length,
      nights: propertyPnL.reduce((s, p) => s + p.totalNights, 0),
    }
  }
}
