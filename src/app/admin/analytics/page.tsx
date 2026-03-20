import { getDashboardData } from '@/actions/bookingActions'
import { RevenueChart, SourcePieChart, OccupancyChart, ExpensePieChart } from '@/components/AnalyticsCharts'
import Link from 'next/link'

export default async function AnalyticsPage() {
  const data = await getDashboardData()
  const { totals, propertyPnL, monthlyTrend, revenueBySource, expenseByCategory, insights, pricingSuggestions, emptyNights } = data

  const occupancyData = propertyPnL.map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, occupancy: p.occupancyRate }))
  const avgOccupancy = propertyPnL.length > 0 ? Math.round(propertyPnL.reduce((s, p) => s + p.occupancyRate, 0) / propertyPnL.length) : 0
  const avgRevPAR = propertyPnL.length > 0 ? Math.round(propertyPnL.reduce((s, p) => s + p.revPAR, 0) / propertyPnL.length) : 0
  const totalEmptyNights = emptyNights.reduce((s, e) => s + e.dates.length, 0)
  const profitMargin = totals.revenue > 0 ? Math.round((totals.profit / totals.revenue) * 100) : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>📊 Advanced Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Deep insights into your property business performance</p>
        </div>
        <Link href="/admin" className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>← Dashboard</Link>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
        {[
          { label: 'Revenue', value: `₹${totals.revenue.toLocaleString('en-IN')}`, color: 'var(--text-main)' },
          { label: 'Net Profit', value: `₹${totals.profit.toLocaleString('en-IN')}`, color: totals.profit >= 0 ? 'var(--cozy-success)' : 'var(--danger)' },
          { label: 'Profit Margin', value: `${profitMargin}%`, color: profitMargin > 50 ? 'var(--cozy-success)' : profitMargin > 20 ? '#D97706' : 'var(--danger)' },
          { label: 'Avg Occupancy', value: `${avgOccupancy}%`, color: avgOccupancy > 60 ? 'var(--cozy-success)' : '#D97706' },
          { label: 'RevPAR', value: `₹${avgRevPAR.toLocaleString('en-IN')}`, color: 'var(--primary)' },
          { label: 'Empty Nights (30d)', value: `${totalEmptyNights}`, color: totalEmptyNights > 30 ? 'var(--danger)' : 'var(--cozy-success)' },
        ].map((kpi, i) => (
          <div key={i} className="metric-card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{kpi.label}</p>
            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: kpi.color, letterSpacing: '-0.02em' }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="metric-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)', border: '1px solid rgba(217,119,6,0.15)' }}>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '0.9375rem' }}>💡 AI Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            {insights.map((insight, i) => (
              <div key={i} style={{ fontSize: '0.8125rem', lineHeight: 1.5, padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.7)', borderRadius: '8px' }}>{insight}</div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Revenue, Expenses & Profit</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>12-month trend</p>
          <RevenueChart data={monthlyTrend} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="metric-card" style={{ padding: '1.25rem', flex: 1 }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Booking Sources</h3>
            <SourcePieChart data={revenueBySource} />
          </div>
          <div className="metric-card" style={{ padding: '1.25rem', flex: 1 }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Expense Categories</h3>
            <ExpensePieChart data={expenseByCategory} />
          </div>
        </div>
      </div>

      {/* Occupancy + Property P&L */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Occupancy by Property</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>90-day rolling window</p>
          {propertyPnL.length > 0 ? <OccupancyChart data={occupancyData} /> : <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No data</p>}
        </div>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Property Profitability</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Property</th><th>Revenue</th><th>Costs</th><th>Profit</th><th>Occ%</th><th>RevPAR</th></tr>
              </thead>
              <tbody>
                {propertyPnL.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#B45309', whiteSpace: 'nowrap' }}>₹{(p.expenses + p.commission).toLocaleString('en-IN')}</td>
                    <td style={{ fontWeight: 700, color: p.profit >= 0 ? 'var(--cozy-success)' : 'var(--danger)', whiteSpace: 'nowrap' }}>₹{p.profit.toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${p.occupancyRate > 60 ? 'badge-green' : p.occupancyRate > 30 ? 'badge-yellow' : 'badge-gray'}`}>{p.occupancyRate}%</span></td>
                    <td style={{ fontWeight: 600 }}>₹{p.revPAR}</td>
                  </tr>
                ))}
                {propertyPnL.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>No properties</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing + Empty Nights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>🤖 Smart Pricing</h3>
          {pricingSuggestions.map(s => (
            <div key={s.propertyId} style={{ background: s.type === 'increase' ? '#ECFDF5' : s.type === 'decrease' ? '#FEF2F2' : 'var(--cozy-blue-light)', borderRadius: '10px', padding: '0.75rem', marginBottom: '0.5rem', border: `1px solid ${s.type === 'increase' ? 'rgba(5,150,105,0.15)' : s.type === 'decrease' ? 'rgba(220,38,38,0.1)' : 'rgba(43,108,176,0.1)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{s.propertyName}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.occupancy30}% occupancy</span>
              </div>
              <div style={{ fontSize: '0.8125rem', gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>₹{s.currentPrice.toLocaleString('en-IN')}/night</span>
                {s.type !== 'neutral' && <><span>→</span><span style={{ fontWeight: 700, color: s.type === 'increase' ? 'var(--cozy-success)' : 'var(--danger)' }}>₹{s.suggestedPrice.toLocaleString('en-IN')}</span></>}
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{s.suggestion}</p>
            </div>
          ))}
          {pricingSuggestions.length === 0 && <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Add properties first</p>}
        </div>

        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>🔥 Empty Nights (Next 30 Days)</h3>
          {emptyNights.length > 0 ? emptyNights.map(en => (
            <div key={en.propertyId} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: en.dates.length > 15 ? '#FEF2F2' : '#FAFAFA', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{en.property}</span>
                <span className={`badge ${en.dates.length > 15 ? 'badge-pink' : en.dates.length > 7 ? 'badge-yellow' : 'badge-green'}`}>{en.dates.length} nights</span>
              </div>
              {en.dates.length > 10 && <p style={{ fontSize: '0.6875rem', color: '#B45309', fontWeight: 600 }}>💡 Consider offering a 10-15% discount</p>}
            </div>
          )) : <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>All nights are accounted for!</p>}
        </div>
      </div>
    </div>
  )
}
