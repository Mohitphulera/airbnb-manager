'use client'

import type { PropertyRevenueSummary } from '@/actions/propertyRevenueActions'

export default function PropertyRevenueWidget({ revenue }: { revenue: PropertyRevenueSummary }) {
  if (revenue.totalBookings === 0) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '16px', padding: '1.25rem',
      color: '#fff', marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94a3b8' }}>analytics</span>
        <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Property Performance
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Total Revenue
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ₹{revenue.totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            This Month
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ₹{revenue.revenueThisMonth.toLocaleString('en-IN')}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Occupancy (90d)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{revenue.occupancyRate}%</div>
            <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${revenue.occupancyRate}%`,
                background: revenue.occupancyRate > 60 ? '#10b981' : revenue.occupancyRate > 30 ? '#f59e0b' : '#ef4444',
              }} />
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            Total Bookings
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{revenue.totalBookings}</div>
        </div>
      </div>
    </div>
  )
}
