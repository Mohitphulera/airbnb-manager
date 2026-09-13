/**
 * Seeds a local development database with two demo hosts and realistic data.
 * Two tenants make it easy to verify that one host can never see another's data.
 *
 * Run with: npm run seed   (requires DATABASE_URL pointing at a NON-production DB)
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')
if (url.includes('neon.tech') && process.env.ALLOW_SEED_REMOTE !== '1') {
  throw new Error('Refusing to seed a Neon (likely production) database. Set ALLOW_SEED_REMOTE=1 to override.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })

const day = (offset) => {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + offset)
  return d
}

async function createHost({ email, businessName, slug, whatsappNumber }) {
  // Booking/expense/review/request rows don't cascade from Property, so clear them first
  const property = { user: { email } }
  await prisma.booking.deleteMany({ where: { property } })
  await prisma.expense.deleteMany({ where: { property } })
  await prisma.review.deleteMany({ where: { property } })
  await prisma.bookingRequest.deleteMany({ where: { property } })
  await prisma.user.deleteMany({ where: { email } })
  const passwordHash = await bcrypt.hash('demo1234', 12)
  return prisma.user.create({ data: { email, passwordHash, businessName, slug, whatsappNumber } })
}

async function main() {
  const host = await createHost({ email: 'demo@staydesk.dev', businessName: 'Sunset Villas', slug: 'sunset-villas', whatsappNumber: '919876543210' })
  const other = await createHost({ email: 'other@staydesk.dev', businessName: 'Other Host', slug: 'other-host', whatsappNumber: '919000000000' })

  const img = (id) => `https://images.unsplash.com/${id}?w=1200&q=80`
  const villa = await prisma.property.create({
    data: {
      userId: host.id, name: 'Cliffside Villa', location: 'Goa, India', type: 'OWNED', pricePerNight: 8500,
      description: 'A 3-bedroom villa with a private pool and sea views, five minutes from Vagator beach.',
      imageUrls: JSON.stringify([img('photo-1613490493576-7fde63acd811'), img('photo-1600596542815-ffad4c1539a9')]),
      amenities: JSON.stringify(['WiFi', 'Pool', 'AC', 'Kitchen', 'Parking']),
      whatsappNumber: '919876543210', wifiName: 'Cliffside-5G', wifiPassword: 'secret-wifi-pass', emergencyPhone: '919876543210',
    },
  })
  const loft = await prisma.property.create({
    data: {
      userId: host.id, name: 'Old Town Loft', location: 'Jaipur, India', type: 'COMMISSION', commissionRate: 20, pricePerNight: 4200,
      description: 'A restored haveli loft inside the pink city walls, walking distance to Hawa Mahal.',
      imageUrls: JSON.stringify([img('photo-1502672260266-1c1ef2d93688')]),
      amenities: JSON.stringify(['WiFi', 'AC', 'Kitchen']),
      whatsappNumber: '919876543210',
    },
  })
  const otherProp = await prisma.property.create({
    data: { userId: other.id, name: 'Other Host Cabin', location: 'Manali, India', type: 'OWNED', pricePerNight: 3000, description: 'Belongs to another tenant.' },
  })

  const booking = (property, name, phone, ci, co, source, notes) => {
    const nights = co - ci
    const totalAmount = nights * property.pricePerNight
    const commissionOwed = property.type === 'COMMISSION' ? (totalAmount * property.commissionRate) / 100 : null
    return { propertyId: property.id, customerName: name, customerPhone: phone, checkInDate: day(ci), checkOutDate: day(co), totalAmount, source, commissionOwed, notes }
  }
  await prisma.booking.createMany({
    data: [
      booking(villa, 'Aarav Sharma', '9811111111', -60, -55, 'AIRBNB'),
      booking(villa, 'Priya Nair', '9822222222', -30, -26, 'DIRECT'),
      booking(villa, 'Rohan Mehta', '9833333333', -2, 0, 'AIRBNB', 'Late checkout requested'),
      booking(villa, 'Isha Kapoor', '9844444444', 0, 3, 'DIRECT', 'Keys with security guard'),
      booking(villa, 'Aarav Sharma', '9811111111', 10, 14, 'DIRECT'),
      booking(loft, 'Kabir Singh', '9855555555', -20, -17, 'OTHER'),
      booking(loft, 'Meera Iyer', '9866666666', 2, 5, 'AIRBNB'),
      booking(otherProp, 'Secret Guest', '9000000001', 1, 4, 'DIRECT'),
    ],
  })

  await prisma.guest.createMany({
    data: [
      { userId: host.id, name: 'Aarav Sharma', phone: '9811111111', totalStays: 2, totalSpent: 76500, loyaltyTier: 'BRONZE', tags: JSON.stringify(['Repeat']), city: 'Delhi' },
      { userId: host.id, name: 'Priya Nair', phone: '9822222222', totalStays: 1, totalSpent: 34000, city: 'Kochi' },
      { userId: other.id, name: 'Secret Guest', phone: '9000000001', totalStays: 1, totalSpent: 9000 },
    ],
  })

  await prisma.expense.createMany({
    data: [
      { propertyId: villa.id, description: 'Deep cleaning', amount: 3500, category: 'CLEANING', date: day(-25) },
      { propertyId: villa.id, description: 'Pool pump repair', amount: 12000, category: 'REPAIR', date: day(-10) },
      { propertyId: loft.id, description: 'Electricity bill', amount: 2800, category: 'UTILITY', date: day(-5) },
    ],
  })

  await prisma.bookingRequest.createMany({
    data: [
      { propertyId: villa.id, guestName: 'Neha Verma', guestPhone: '9877777777', guestEmail: 'neha@example.com', checkIn: day(20), checkOut: day(23), guests: 4, totalAmount: 25500, message: 'Family trip with two kids' },
      { propertyId: loft.id, guestName: 'Dev Patel', guestPhone: '9888888888', checkIn: day(3), checkOut: day(4), guests: 2, totalAmount: 4200, message: 'Overlaps an existing booking' },
    ],
  })

  await prisma.review.createMany({
    data: [
      { propertyId: villa.id, guestName: 'Priya Nair', rating: 5, comment: 'Stunning views and a spotless pool.' },
      { propertyId: villa.id, guestName: 'Aarav Sharma', rating: 4, comment: 'Great stay, WiFi was a bit slow.' },
    ],
  })

  await prisma.task.createMany({
    data: [
      { userId: host.id, title: 'Turnover clean after Rohan', property: villa.name, assignedTo: 'Sunita', priority: 'HIGH', dueDate: day(0) },
      { userId: host.id, title: 'Replace AC filter', property: loft.name, category: 'MAINTENANCE', status: 'IN_PROGRESS', dueDate: day(4) },
    ],
  })

  await prisma.inventoryItem.createMany({
    data: [
      { userId: host.id, name: 'Shampoo', property: villa.name, quantity: 3, minStock: 6, unit: 'bottles' },
      { userId: host.id, name: 'Bath towels', property: villa.name, category: 'LINEN', quantity: 14, minStock: 8, unit: 'pcs' },
    ],
  })

  await prisma.feedback.create({
    data: { userId: host.id, guestName: 'Priya Nair', propertyName: villa.name, rating: 5, cleanliness: 5, comfort: 5, location: 4, valueForMoney: 4, wouldReturn: true, comment: 'Would come back!' },
  })

  await prisma.referral.create({ data: { userId: host.id, referrerName: 'Priya Nair', referrerPhone: '9822222222', code: 'PRIYA10', discountPct: 10 } })

  await prisma.saleProperty.createMany({
    data: [
      { userId: host.id, title: '2BHK Sea-view Apartment', description: 'Rental-ready apartment in Candolim.', location: 'Goa, India', price: 9500000, area: 1150, bedrooms: 2, bathrooms: 2, propertyType: 'APARTMENT', monthlyRentalEstimate: 65000, features: JSON.stringify(['Parking', 'Pool', '24x7 Security']) },
      { userId: host.id, title: 'Farmland Plot', description: 'Half-acre plot near Alibaug.', location: 'Alibaug, India', price: 4200000, area: 21780, propertyType: 'PLOT', status: 'SOLD' },
    ],
  })

  console.log('Seeded. Log in with demo@staydesk.dev / demo1234 (second tenant: other@staydesk.dev)')
}

main().finally(() => prisma.$disconnect())
