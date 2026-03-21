import { getDashboardData } from '@/actions/bookingActions'
import { RevenueChart, SourcePieChart, OccupancyChart, ExpensePieChart } from '@/components/AnalyticsCharts'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const data = await getDashboardData()
  const { totals, todayCheckIns, todayCheckOuts, upcomingCheckIns, cleaningNeeded, emptyNights, propertyPnL, monthlyTrend, revenueBySource, pricingSuggestions, expenseByCategory, insights } = data

  const occupancyData = propertyPnL.map(p => ({ name: p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name, occupancy: p.occupancyRate }))
  const avgOccupancy = propertyPnL.length > 0 ? Math.round(propertyPnL.reduce((s, p) => s + p.occupancyRate, 0) / propertyPnL.length) : 0
  const avgRevPAR = propertyPnL.length > 0 ? Math.round(propertyPnL.reduce((s, p) => s + p.revPAR, 0) / propertyPnL.length) : 0

  const todayActions = todayCheckIns.length + todayCheckOuts.length + cleaningNeeded.length
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div className="dash-header">
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              {greeting} 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {todayActions > 0 && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>· {todayActions} actions today</span>}
            </p>
          </div>
          <Link href="/admin/analytics" className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>
            📊 Full Analytics
          </Link>
        </div>
      </div>

      {/* ===== TOP METRICS ===== */}
      <div className="metrics-row" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Gross Revenue</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>₹{totals.revenue.toLocaleString('en-IN')}</p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{totals.bookings} bookings</p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Net Profit</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: totals.profit >= 0 ? 'var(--cozy-success)' : 'var(--danger)' }}>₹{totals.profit.toLocaleString('en-IN')}</p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>after expenses & commission</p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Avg Occupancy</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: avgOccupancy > 60 ? 'var(--cozy-success)' : avgOccupancy > 30 ? '#D97706' : 'var(--danger)' }}>{avgOccupancy}%</p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>last 90 days</p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>RevPAR</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>₹{avgRevPAR.toLocaleString('en-IN')}</p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>revenue per available room</p>
        </div>
      </div>

      {/* ===== DAILY OPS SECTION ===== */}
      <div className="dash-ops-grid">
        {/* Today's Check-ins */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>🔑 Check-ins Today</h3>
            <span className="badge badge-green">{todayCheckIns.length}</span>
          </div>
          {todayCheckIns.length > 0 ? todayCheckIns.map((b: any) => (
            <div key={b.id} style={{ background: '#ECFDF5', borderRadius: '10px', padding: '0.625rem 0.75rem', marginBottom: '0.5rem', border: '1px solid rgba(5,150,105,0.1)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{b.customerName}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.property.name}</div>
              {b.notes && <div style={{ fontSize: '0.6875rem', color: '#065F46', marginTop: '0.25rem', fontStyle: 'italic' }}>📝 {b.notes}</div>}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✨</div>
              No check-ins today
            </div>
          )}
        </div>

        {/* Today's Check-outs */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>🚪 Check-outs Today</h3>
            <span className="badge badge-yellow">{todayCheckOuts.length}</span>
          </div>
          {todayCheckOuts.length > 0 ? todayCheckOuts.map((b: any) => (
            <div key={b.id} style={{ background: '#FFFBEB', borderRadius: '10px', padding: '0.625rem 0.75rem', marginBottom: '0.5rem', border: '1px solid rgba(217,119,6,0.1)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{b.customerName}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.property.name}</div>
              <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem' }}>
                <span className={`badge ${b.cleaningStatus === 'DONE' ? 'badge-green' : b.cleaningStatus === 'IN_PROGRESS' ? 'badge-yellow' : 'badge-gray'}`} style={{ fontSize: '0.5625rem' }}>
                  🧹 {b.cleaningStatus}
                </span>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✨</div>
              No check-outs today
            </div>
          )}
        </div>

        {/* Cleaning Schedule */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
            <h3 style={{ margin: 0, fontSize: '0.9375rem' }}>🧹 Cleaning Queue</h3>
            <span className={`badge ${cleaningNeeded.length > 0 ? 'badge-pink' : 'badge-green'}`}>{cleaningNeeded.length}</span>
          </div>
          {cleaningNeeded.length > 0 ? cleaningNeeded.map((b: any) => (
            <div key={b.id} style={{ background: 'var(--cozy-blue-light)', borderRadius: '10px', padding: '0.625rem 0.75rem', marginBottom: '0.5rem', border: '1px solid rgba(43,108,176,0.1)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{b.property.name}</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>After {b.customerName}'s checkout</div>
              <div style={{ fontSize: '0.6875rem', marginTop: '0.25rem', color: 'var(--primary)', fontWeight: 600 }}>
                {b.cleaningStatus === 'PENDING' ? '⏳ Pending' : '🔄 In Progress'}
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✅</div>
              All clean!
            </div>
          )}
        </div>
      </div>

      {/* ===== ALERTS & INSIGHTS ===== */}
      {(insights.length > 0 || emptyNights.some(e => e.dates.length > 10)) && (
        <div className="metric-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1px solid rgba(217,119,6,0.15)' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem' }}>💡 Smart Insights</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.map((insight, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', lineHeight: '1.5' }}>
                <span style={{ flexShrink: 0 }}>•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== CHARTS ROW ===== */}
      <div className="dash-charts-grid">
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Revenue & Profit Trend</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Last 12 months · Revenue, profit & expenses</p>
          <RevenueChart data={monthlyTrend} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="metric-card" style={{ padding: '1.25rem', flex: 1 }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Revenue by Source</h3>
            <SourcePieChart data={revenueBySource} />
          </div>
          <div className="metric-card" style={{ padding: '1.25rem', flex: 1 }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Expense Breakdown</h3>
            <ExpensePieChart data={expenseByCategory} />
          </div>
        </div>
      </div>

      {/* ===== PROPERTY P&L + OCCUPANCY ===== */}
      <div className="dash-two-col">
        {/* Per-Property P&L */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>💰 Property P&L</h3>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Revenue</th>
                  <th>Costs</th>
                  <th>Profit</th>
                  <th>Occ%</th>
                </tr>
              </thead>
              <tbody>
                {propertyPnL.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>{p.bookingCount} bookings · {p.type === 'COMMISSION' ? 'Partner' : 'Owned'}</div>
                    </td>
                    <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#B45309', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                      ₹{(p.expenses + p.commission).toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: 700, color: p.profit >= 0 ? 'var(--cozy-success)' : 'var(--danger)', whiteSpace: 'nowrap' }}>
                      ₹{p.profit.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`badge ${p.occupancyRate > 60 ? 'badge-green' : p.occupancyRate > 30 ? 'badge-yellow' : 'badge-gray'}`}>
                        {p.occupancyRate}%
                      </span>
                    </td>
                  </tr>
                ))}
                {propertyPnL.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Add properties to see P&L</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>📊 Occupancy by Property</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Last 90 days · Green = good, red = needs attention</p>
          {propertyPnL.length > 0 ? <OccupancyChart data={occupancyData} /> : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </div>
      </div>

      {/* ===== PRICING SUGGESTIONS + EMPTY NIGHTS ===== */}
      <div className="dash-two-col">
        {/* Smart Pricing */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🤖 Smart Pricing Suggestions</h3>
          {pricingSuggestions.length > 0 ? pricingSuggestions.map(s => (
            <div key={s.propertyId} style={{ background: s.type === 'increase' ? '#ECFDF5' : s.type === 'decrease' ? '#FEF2F2' : 'var(--cozy-blue-light)', borderRadius: '10px', padding: '0.875rem', marginBottom: '0.625rem', border: `1px solid ${s.type === 'increase' ? 'rgba(5,150,105,0.15)' : s.type === 'decrease' ? 'rgba(220,38,38,0.1)' : 'rgba(43,108,176,0.1)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{s.propertyName}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.occupancy30}% occ.</span>
              </div>
              <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>₹{s.currentPrice.toLocaleString('en-IN')}</span>
                {s.type !== 'neutral' && (
                  <>
                    <span>→</span>
                    <span style={{ fontWeight: 700, color: s.type === 'increase' ? 'var(--cozy-success)' : 'var(--danger)' }}>
                      ₹{s.suggestedPrice.toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{s.suggestion}</p>
              {s.weekendInsight && <p style={{ fontSize: '0.6875rem', marginTop: '0.25rem', fontWeight: 600, color: '#92400E' }}>{s.weekendInsight}</p>}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Add properties to get pricing suggestions</div>
          )}
        </div>

        {/* Empty Nights Filler */}
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🔥 Empty Nights Filler</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.875rem' }}>Upcoming empty nights in the next 30 days</p>
          {emptyNights.length > 0 ? emptyNights.map(en => {
            const consecutive = findConsecutiveGaps(en.dates)
            return (
              <div key={en.propertyId} style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{en.property}</span>
                  <span className={`badge ${en.dates.length > 15 ? 'badge-pink' : en.dates.length > 7 ? 'badge-yellow' : 'badge-green'}`}>
                    {en.dates.length} nights
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                  {consecutive.slice(0, 3).map((gap, i) => (
                    <span key={i} style={{ fontSize: '0.6875rem', background: '#FEF2F2', color: '#DC2626', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: 500 }}>
                      {gap.start} → {gap.end} ({gap.count}n)
                    </span>
                  ))}
                  {consecutive.length > 3 && <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>+{consecutive.length - 3} more gaps</span>}
                </div>
                {en.dates.length > 10 && (
                  <p style={{ fontSize: '0.6875rem', color: '#B45309', marginTop: '0.375rem', fontWeight: 600 }}>
                    💡 Suggest 10-15% discount to fill these dates
                  </p>
                )}
              </div>
            )
          }) : <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Add properties to track availability</div>}
        </div>
      </div>

      {/* ===== UPCOMING CHECK-INS ===== */}
      {upcomingCheckIns.length > 0 && (
        <div className="metric-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.875rem 0' }}>📅 Upcoming Check-ins (Next 7 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.625rem' }}>
            {upcomingCheckIns.map((b: any) => (
              <div key={b.id} style={{ background: 'var(--cozy-blue-light)', borderRadius: '10px', padding: '0.75rem', border: '1px solid rgba(43,108,176,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{b.customerName}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.property.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </div>
                    <span className={`badge ${b.source === 'AIRBNB' ? 'badge-pink' : 'badge-green'}`} style={{ fontSize: '0.5625rem' }}>{b.source}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== COMMISSION SETTLEMENTS ===== */}
      {propertyPnL.filter(p => p.type === 'COMMISSION' && p.commission > 0).length > 0 && (
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.875rem 0' }}>🤝 Commission Settlements</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Outstanding commission to property partners</p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Partner Property</th>
                  <th>Total Revenue</th>
                  <th>Commission Owed</th>
                  <th>Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {propertyPnL.filter(p => p.type === 'COMMISSION').map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>₹{p.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--danger)', fontWeight: 700 }}>₹{p.commission.toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--cozy-success)', fontWeight: 700 }}>₹{(p.revenue - p.commission).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to convert array of date strings into consecutive gaps
function findConsecutiveGaps(dates: string[]): { start: string; end: string; count: number }[] {
  if (dates.length === 0) return []
  const sorted = [...dates].sort()
  const gaps: { start: string; end: string; count: number }[] = []
  let start = sorted[0]
  let prev = sorted[0]
  let count = 1
  
  for (let i = 1; i < sorted.length; i++) {
    const prevDate = new Date(prev)
    const currDate = new Date(sorted[i])
    const diff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (diff === 1) {
      count++
      prev = sorted[i]
    } else {
      gaps.push({ 
        start: new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        end: new Date(prev).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        count 
      })
      start = sorted[i]
      prev = sorted[i]
      count = 1
    }
  }
  gaps.push({ 
    start: new Date(start).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    end: new Date(prev).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    count 
  })
  return gaps
}
