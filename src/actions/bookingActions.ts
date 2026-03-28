'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getBookings() {
  return await prisma.booking.findMany({
    include: { property: true },
    orderBy: { createdAt: 'desc' }
  })
}

export async function addBooking(formData: FormData) {
  const propertyId = formData.get('propertyId') as string
  const customerName = formData.get('customerName') as string
  const customerPhone = formData.get('customerPhone') as string
  const checkInDate = new Date(formData.get('checkInDate') as string)
  const checkOutDate = new Date(formData.get('checkOutDate') as string)
  const source = formData.get('source') as string
  const notes = formData.get('notes') as string

  const property = await prisma.property.findUnique({ where: { id: propertyId } })
  if (!property) return { error: "Property not found" }

  // Double-booking check
  const existingBookings = await prisma.booking.findMany({
    where: {
      propertyId: propertyId,
      OR: [
        {
          checkInDate: { lt: checkOutDate },
          checkOutDate: { gt: checkInDate }
        }
      ]
    }
  })

  if (existingBookings.length > 0) {
    return { error: 'Overlap detected: Property is already booked during these dates.' }
  }

  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  const totalAmount = diffDays * property.pricePerNight;

  let commissionOwed = null
  if (property.type === 'COMMISSION' && property.commissionRate) {
    commissionOwed = (totalAmount * property.commissionRate) / 100
  }

  await prisma.booking.create({
    data: {
      propertyId,
      customerName,
      customerPhone,
      checkInDate,
      checkOutDate,
      totalAmount,
      source,
      commissionOwed,
      notes: notes || null,
    }
  })

  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
  return { success: true }
}

export async function updateCleaningStatus(id: string, cleaningStatus: string) {
  await prisma.booking.update({
    where: { id },
    data: { cleaningStatus }
  })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}

export async function updateBookingNotes(id: string, notes: string) {
  await prisma.booking.update({
    where: { id },
    data: { notes }
  })
  revalidatePath('/admin')
  revalidatePath('/admin/bookings')
}

export async function deleteBooking(id: string) {
  await prisma.booking.delete({ where: { id } })
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

export async function updateBooking(id: string, data: Record<string, any>) {
  const updateData: Record<string, any> = {}
  if (data.customerName !== undefined) updateData.customerName = data.customerName
  if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone
  if (data.source !== undefined) updateData.source = data.source
  if (data.totalAmount !== undefined) updateData.totalAmount = parseFloat(data.totalAmount)
  if (data.notes !== undefined) updateData.notes = data.notes || null
  if (data.checkInDate !== undefined) updateData.checkInDate = new Date(data.checkInDate)
  if (data.checkOutDate !== undefined) updateData.checkOutDate = new Date(data.checkOutDate)

  await prisma.booking.update({ where: { id }, data: updateData })
  revalidatePath('/admin/bookings')
  revalidatePath('/admin')
}

// ===== ANALYTICS HELPERS =====

export async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const weekEnd = new Date(today)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [allBookings, allProperties, allExpenses] = await Promise.all([
    prisma.booking.findMany({ include: { property: true }, orderBy: { checkInDate: 'asc' } }),
    prisma.property.findMany(),
    prisma.expense.findMany({ include: { property: true }, orderBy: { date: 'desc' } })
  ])

  // Today's check-ins
  const todayCheckIns = allBookings.filter(b => {
    const d = new Date(b.checkInDate)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })

  // Today's check-outs
  const todayCheckOuts = allBookings.filter(b => {
    const d = new Date(b.checkOutDate)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  })

  // Upcoming check-ins (next 7 days)
  const upcomingCheckIns = allBookings.filter(b => {
    const d = new Date(b.checkInDate)
    d.setHours(0, 0, 0, 0)
    return d > today && d <= weekEnd
  })

  // Cleaning needed (check-outs today/tomorrow with PENDING status)
  const cleaningNeeded = allBookings.filter(b => {
    const d = new Date(b.checkOutDate)
    d.setHours(0, 0, 0, 0)
    return d.getTime() >= today.getTime() && d <= tomorrow && b.cleaningStatus !== 'DONE'
  })

  // Empty nights in next 30 days
  const next30 = new Date(today)
  next30.setDate(next30.getDate() + 30)
  
  const emptyNights: { property: string; propertyId: string; dates: string[] }[] = []
  
  allProperties.forEach(prop => {
    const propBookings = allBookings.filter(b => b.propertyId === prop.id)
    const empty: string[] = []
    for (let d = new Date(today); d < next30; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      const isBooked = propBookings.some(b => {
        const ci = new Date(b.checkInDate)
        ci.setHours(0, 0, 0, 0)
        const co = new Date(b.checkOutDate)
        co.setHours(0, 0, 0, 0)
        return d >= ci && d < co
      })
      if (!isBooked) empty.push(dateStr)
    }
    if (empty.length > 0) {
      emptyNights.push({ property: prop.name, propertyId: prop.id, dates: empty })
    }
  })

  // Per-property P&L
  const propertyPnL = allProperties.map(prop => {
    const propBookings = allBookings.filter(b => b.propertyId === prop.id)
    const propExpenses = allExpenses.filter(e => e.propertyId === prop.id)
    const revenue = propBookings.reduce((s, b) => s + b.totalAmount, 0)
    const commission = propBookings.reduce((s, b) => s + (b.commissionOwed || 0), 0)
    const expenses = propExpenses.reduce((s, e) => s + e.amount, 0)
    const profit = revenue - commission - expenses
    const totalNights = propBookings.reduce((s, b) => {
      const diff = Math.ceil((new Date(b.checkOutDate).getTime() - new Date(b.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
      return s + diff
    }, 0)
    
    // Occupancy rate (last 90 days)
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const recentBookings = propBookings.filter(b => new Date(b.checkInDate) >= ninetyDaysAgo)
    const bookedNightsLast90 = recentBookings.reduce((s, b) => {
      const ci = new Date(b.checkInDate) < ninetyDaysAgo ? ninetyDaysAgo : new Date(b.checkInDate)
      const co = new Date(b.checkOutDate) > today ? today : new Date(b.checkOutDate)
      return s + Math.max(0, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)))
    }, 0)
    const occupancyRate = Math.round((bookedNightsLast90 / 90) * 100)
    
    // RevPAR
    const revPAR = Math.round(revenue / Math.max(90, 1))

    return {
      id: prop.id,
      name: prop.name,
      type: prop.type,
      pricePerNight: prop.pricePerNight,
      revenue,
      commission,
      expenses,
      profit,
      totalNights,
      occupancyRate,
      revPAR,
      bookingCount: propBookings.length,
    }
  })

  // Monthly revenue trend (last 12 months)
  const monthlyTrend = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(today)
    d.setMonth(d.getMonth() - (11 - i))
    const month = d.getMonth()
    const year = d.getFullYear()
    const mb = allBookings.filter(b => {
      const bd = new Date(b.checkInDate)
      return bd.getMonth() === month && bd.getFullYear() === year
    })
    const me = allExpenses.filter(e => {
      const ed = new Date(e.date)
      return ed.getMonth() === month && ed.getFullYear() === year
    })
    const revenue = mb.reduce((s, b) => s + b.totalAmount, 0)
    const expenses = me.reduce((s, e) => s + e.amount, 0)
    const commission = mb.reduce((s, b) => s + (b.commissionOwed || 0), 0)
    return {
      month: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      revenue,
      expenses,
      commission,
      profit: revenue - commission - expenses,
    }
  })

  // Revenue by source
  const revenueBySource = {
    AIRBNB: allBookings.filter(b => b.source === 'AIRBNB').reduce((s, b) => s + b.totalAmount, 0),
    DIRECT: allBookings.filter(b => b.source === 'DIRECT').reduce((s, b) => s + b.totalAmount, 0),
    OTHER: allBookings.filter(b => b.source === 'OTHER').reduce((s, b) => s + b.totalAmount, 0),
  }

  // Smart pricing suggestions
  const pricingSuggestions = allProperties.map(prop => {
    const propBookings = allBookings.filter(b => b.propertyId === prop.id)
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentBookings = propBookings.filter(b => new Date(b.checkInDate) >= thirtyDaysAgo)
    
    // Occupancy last 30 days
    const bookedNights30 = recentBookings.reduce((s, b) => {
      const ci = new Date(b.checkInDate) < thirtyDaysAgo ? thirtyDaysAgo : new Date(b.checkInDate)
      const co = new Date(b.checkOutDate) > today ? today : new Date(b.checkOutDate)
      return s + Math.max(0, Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)))
    }, 0)
    const occ30 = bookedNights30 / 30

    let suggestion = ''
    let suggestedPrice = prop.pricePerNight
    let type: 'increase' | 'decrease' | 'neutral' = 'neutral'

    if (occ30 > 0.8) {
      suggestion = `High demand (${Math.round(occ30 * 100)}% occupancy). Consider raising price by 15-20%.`
      suggestedPrice = Math.round(prop.pricePerNight * 1.15)
      type = 'increase'
    } else if (occ30 > 0.5) {
      suggestion = `Good occupancy (${Math.round(occ30 * 100)}%). Price is well-calibrated.`
      type = 'neutral'
    } else if (occ30 > 0.2) {
      suggestion = `Moderate demand (${Math.round(occ30 * 100)}%). Try a 10% discount to attract bookings.`
      suggestedPrice = Math.round(prop.pricePerNight * 0.9)
      type = 'decrease'
    } else {
      suggestion = `Low occupancy (${Math.round(occ30 * 100)}%). Recommend 15-20% discount or promoting on more platforms.`
      suggestedPrice = Math.round(prop.pricePerNight * 0.8)
      type = 'decrease'
    }

    // Weekend pricing
    const weekendBookings = propBookings.filter(b => {
      const day = new Date(b.checkInDate).getDay()
      return day === 5 || day === 6
    })
    const weekdayBookings = propBookings.filter(b => {
      const day = new Date(b.checkInDate).getDay()
      return day >= 1 && day <= 4
    })
    
    let weekendInsight = ''
    if (weekendBookings.length > weekdayBookings.length * 1.3) {
      weekendInsight = '🔥 Weekends are 30%+ busier — consider premium weekend pricing.'
    }

    return {
      propertyId: prop.id,
      propertyName: prop.name,
      currentPrice: prop.pricePerNight,
      suggestedPrice,
      suggestion,
      type,
      weekendInsight,
      occupancy30: Math.round(occ30 * 100),
    }
  })

  // Expense breakdown by category
  const expenseByCategory = {
    CLEANING: allExpenses.filter(e => e.category === 'CLEANING').reduce((s, e) => s + e.amount, 0),
    REPAIR: allExpenses.filter(e => e.category === 'REPAIR').reduce((s, e) => s + e.amount, 0),
    UTILITY: allExpenses.filter(e => e.category === 'UTILITY').reduce((s, e) => s + e.amount, 0),
    OTHER: allExpenses.filter(e => e.category === 'OTHER').reduce((s, e) => s + e.amount, 0),
  }

  // Smart insights
  const insights: string[] = []
  const totalRevenue = allBookings.reduce((s, b) => s + b.totalAmount, 0)
  const totalExpensesAmt = allExpenses.reduce((s, e) => s + e.amount, 0)
  const totalCommission = allBookings.reduce((s, b) => s + (b.commissionOwed || 0), 0)
  
  if (revenueBySource.DIRECT > revenueBySource.AIRBNB) {
    insights.push('✅ Direct bookings exceed Airbnb — great margin! Keep promoting your direct channel.')
  } else if (revenueBySource.AIRBNB > 0) {
    const pct = Math.round((revenueBySource.AIRBNB / totalRevenue) * 100)
    insights.push(`📊 ${pct}% of revenue comes from Airbnb. Growing direct bookings could save you platform fees.`)
  }
  
  if (totalExpensesAmt > totalRevenue * 0.3) {
    insights.push(`⚠️ Expenses are ${Math.round((totalExpensesAmt / totalRevenue) * 100)}% of revenue — review costs to improve margins.`)
  }
  
  const bestMonth = monthlyTrend.reduce((best, m) => m.revenue > best.revenue ? m : best, monthlyTrend[0])
  if (bestMonth && bestMonth.revenue > 0) {
    insights.push(`🏆 Best month: ${bestMonth.month} with ₹${bestMonth.revenue.toLocaleString('en-IN')} revenue.`)
  }

  emptyNights.forEach(en => {
    if (en.dates.length > 15) {
      insights.push(`🔴 ${en.property} has ${en.dates.length} empty nights in the next 30 days — consider discounting.`)
    }
  })

  return {
    todayCheckIns: todayCheckIns.map(b => ({ ...b, checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(), property: { ...b.property, createdAt: b.property.createdAt.toISOString(), updatedAt: b.property.updatedAt.toISOString() } })),
    todayCheckOuts: todayCheckOuts.map(b => ({ ...b, checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(), property: { ...b.property, createdAt: b.property.createdAt.toISOString(), updatedAt: b.property.updatedAt.toISOString() } })),
    upcomingCheckIns: upcomingCheckIns.map(b => ({ ...b, checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(), property: { ...b.property, createdAt: b.property.createdAt.toISOString(), updatedAt: b.property.updatedAt.toISOString() } })),
    cleaningNeeded: cleaningNeeded.map(b => ({ ...b, checkInDate: b.checkInDate.toISOString(), checkOutDate: b.checkOutDate.toISOString(), createdAt: b.createdAt.toISOString(), updatedAt: b.updatedAt.toISOString(), property: { ...b.property, createdAt: b.property.createdAt.toISOString(), updatedAt: b.property.updatedAt.toISOString() } })),
    emptyNights,
    propertyPnL,
    monthlyTrend,
    revenueBySource,
    pricingSuggestions,
    expenseByCategory,
    insights,
    totals: {
      revenue: totalRevenue,
      expenses: totalExpensesAmt,
      commission: totalCommission,
      profit: totalRevenue - totalCommission - totalExpensesAmt,
      properties: allProperties.length,
      bookings: allBookings.length,
    }
  }
}
