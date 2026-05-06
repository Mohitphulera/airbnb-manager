import BillGenerator from '@/components/BillGenerator'

export const dynamic = 'force-dynamic'

export default function BillsPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Bill Generator
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Create professional booking invoices for your guests
          </p>
        </div>
      </div>
      <BillGenerator />
    </div>
  )
}
