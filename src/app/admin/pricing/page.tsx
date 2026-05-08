import { getDashboardData } from '@/actions/bookingActions'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import PricingEngine from '@/components/PricingEngine'

export const dynamic = 'force-dynamic'

async function applyPrice(id: string, price: number) {
  'use server'
  await prisma.property.update({ where: { id }, data: { pricePerNight: price } })
  revalidatePath('/admin/pricing')
  revalidatePath('/admin/properties')
}

export default async function PricingPage() {
  const data = await getDashboardData()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Dynamic Pricing
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            AI-powered price suggestions based on occupancy trends
          </p>
        </div>
      </div>
      <PricingEngine suggestions={data.pricingSuggestions} onApply={applyPrice} />
    </div>
  )
}
