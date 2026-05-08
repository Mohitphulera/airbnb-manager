'use client'

interface Booking { checkInDate: string; checkOutDate: string; totalAmount: number; propertyName: string }

export default function RevenueForecast({ bookings, monthlyData }: { bookings: Booking[]; monthlyData: { month: string; revenue: number }[] }) {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0)
  const nextMonthLabel = nextMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })

  // Confirmed bookings for next month
  const confirmed = bookings.filter(b => {
    const ci = new Date(b.checkInDate)
    return ci >= nextMonth && ci <= nextMonthEnd
  })
  const confirmedRevenue = confirmed.reduce((s, b) => s + b.totalAmount, 0)

  // Historical average (past months)
  const avgMonthly = monthlyData.length > 0 ? Math.round(monthlyData.reduce((s, m) => s + m.revenue, 0) / monthlyData.length) : 0

  // Forecast = confirmed + estimated walk-ins based on historical fill rate
  const confirmedNights = confirmed.reduce((s, b) => {
    const ci = new Date(b.checkInDate); const co = new Date(b.checkOutDate)
    return s + Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)
  const daysInMonth = nextMonthEnd.getDate()
  const fillRate = Math.min(confirmedNights / daysInMonth, 1)
  const forecast = Math.round(confirmedRevenue + (avgMonthly * (1 - fillRate) * 0.6))

  const maxRev = Math.max(...monthlyData.map(m => m.revenue), forecast, 1)

  return (
    <div>
      {/* Forecast Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '14px', padding: '1.5rem', color: '#fff' }}>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c9a84c', marginBottom: '0.5rem' }}>Forecast — {nextMonthLabel}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹{forecast.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>Based on {confirmed.length} confirmed booking{confirmed.length !== 1 ? 's' : ''} + trends</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.5rem' }}>Confirmed Revenue</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a' }}>₹{confirmedRevenue.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>{confirmed.length} booking{confirmed.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.5rem' }}>Historical Avg/Month</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>₹{avgMonthly.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>{monthlyData.length} months of data</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '1.25rem' }}>Monthly Revenue Trend</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '180px' }}>
          {[...monthlyData, { month: nextMonthLabel.split(' ')[0].slice(0, 3), revenue: forecast }].map((m, i) => {
            const isForecast = i === monthlyData.length
            const h = Math.max((m.revenue / maxRev) * 160, 4)
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: isForecast ? '#c9a84c' : '#6b7280' }}>₹{(m.revenue / 1000).toFixed(0)}k</span>
                <div style={{ width: '100%', height: h, borderRadius: '6px 6px 2px 2px', background: isForecast ? 'repeating-linear-gradient(135deg, #c9a84c, #c9a84c 4px, #e5c76b 4px, #e5c76b 8px)' : 'linear-gradient(180deg, #2563eb, #1d4ed8)', transition: 'height 0.3s' }} />
                <span style={{ fontSize: '0.5rem', color: isForecast ? '#c9a84c' : '#94a3b8', fontWeight: 600 }}>{m.month}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Confirmed Bookings for Next Month */}
      {confirmed.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '1rem' }}>Confirmed for {nextMonthLabel}</div>
          {confirmed.map((b, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < confirmed.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{b.propertyName}</span>
                <span style={{ fontSize: '0.6875rem', color: '#94a3b8', marginLeft: '0.5rem' }}>{new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              </div>
              <span style={{ fontWeight: 700, color: '#16a34a' }}>₹{b.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
