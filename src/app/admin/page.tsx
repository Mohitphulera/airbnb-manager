import { getDashboardData } from '@/actions/bookingActions'
import { RevenueChart, SourcePieChart, OccupancyChart, ExpensePieChart } from '@/components/AnalyticsCharts'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const data = await getDashboardData()
  const { totals, todayCheckIns, todayCheckOuts, upcomingCheckIns, cleaningNeeded, emptyNights, propertyPnL, monthlyTrend, revenueBySource, pricingSuggestions, expenseByCategory, insights } = data

  const occupancyData = propertyPnL.map(p => ({ name: p.name.length > 14 ? p.name.slice(0, 14) + '…' : p.name, occupancy: p.occupancyRate }))
  const avgOccupancy = propertyPnL.length > 0 ? Math.round(propertyPnL.reduce((s, p) => s + p.occupancyRate, 0) / propertyPnL.length) : 0
  const avgRevPAR = propertyPnL.length > 0 ? Math.round(propertyPnL.reduce((s, p) => s + p.revPAR, 0) / propertyPnL.length) : 0
  // ADR = revenue per booked night (not per booking)
  const adr = totals.nights > 0 ? Math.round(totals.revenue / totals.nights) : 0
  const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

  const todayActions = todayCheckIns.length + todayCheckOuts.length + cleaningNeeded.length
  const topProperties = [...propertyPnL].sort((x, y) => y.revenue - x.revenue).slice(0, 5)

  return (
    <div>
      {/* ===== HEADER ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Portfolio overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {totals.properties} {totals.properties === 1 ? 'property' : 'properties'} · {totals.bookings} bookings
            {todayActions > 0 && <span style={{ marginLeft: '0.375rem', color: 'var(--primary)', fontWeight: 600 }}>· {todayActions} {todayActions === 1 ? 'action' : 'actions'} today</span>}
          </p>
        </div>
        <div className="quick-actions">
          <Link href="/admin/bookings#new-booking" className="quick-action quick-action-primary">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden>event_available</span>
            New booking
          </Link>
          <Link href="/admin/properties" className="quick-action">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden>add_home</span>
            Add rental
          </Link>
          <Link href="/admin/expenses" className="quick-action">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden>receipt</span>
            Log expense
          </Link>
          <Link href="/admin/sale-properties" className="quick-action">
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }} aria-hidden>real_estate_agent</span>
            List for sale
          </Link>
        </div>
      </div>

      {/* ===== KPI ROW ===== */}
      <div className="kpi-row">
        <div className="kpi-tile">
          <div className="kpi-tile-label">Total revenue</div>
          <div className="kpi-tile-value">{inr(totals.revenue)}</div>
          <div className="kpi-tile-sub">{totals.nights} nights booked</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-tile-label">Net profit</div>
          <div className="kpi-tile-value" style={{ color: totals.profit < 0 ? 'var(--danger)' : undefined }}>{inr(totals.profit)}</div>
          <div className="kpi-tile-sub">after {inr(totals.expenses)} expenses{totals.commission > 0 ? ` & ${inr(totals.commission)} commission` : ''}</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-tile-label">Occupancy</div>
          <div className="kpi-tile-value">{avgOccupancy}%</div>
          <div style={{ height: '4px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden', margin: '0.375rem 0 0.25rem' }}>
            <div style={{ height: '100%', width: `${avgOccupancy}%`, background: 'var(--primary)', borderRadius: '2px' }} />
          </div>
          <div className="kpi-tile-sub">average, last 90 days</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-tile-label">Avg. daily rate</div>
          <div className="kpi-tile-value">{inr(adr)}</div>
          <div className="kpi-tile-sub">RevPAR {inr(avgRevPAR)} · last 90 days</div>
        </div>
      </div>

      {/* ===== EARNINGS + TODAY ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.125rem' }}>Earnings</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue, profit and expenses by month · last 12 months</p>
          </div>
          <RevenueChart data={monthlyTrend} />
        </div>

        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Today</h3>
          <div className="priority-actions">
            {todayCheckIns.slice(0, 3).map((b: any) => (
              <div key={`ci-${b.id}`} className="priority-action">
                <div className="priority-action-icon blue">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>key</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Check-in: {b.customerName}</div>
                  <div className="priority-action-desc">{b.property.name}</div>
                  {b.notes && <div className="priority-action-desc" style={{ fontStyle: 'italic' }}>{b.notes}</div>}
                </div>
              </div>
            ))}

            {todayCheckOuts.slice(0, 3).map((b: any) => (
              <div key={`co-${b.id}`} className="priority-action">
                <div className="priority-action-icon red">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>logout</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Check-out: {b.customerName}</div>
                  <div className="priority-action-desc">{b.property.name}</div>
                </div>
              </div>
            ))}

            {cleaningNeeded.slice(0, 3).map((b: any) => (
              <Link key={`cl-${b.id}`} href="/admin/bookings" className="priority-action" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="priority-action-icon yellow">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>cleaning_services</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Turnover clean</div>
                  <div className="priority-action-desc">{b.property.name} · after {b.customerName} checks out</div>
                </div>
                <span className="priority-action-time">{b.cleaningStatus === 'IN_PROGRESS' ? 'In progress' : 'Pending'}</span>
              </Link>
            ))}

            {todayActions === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                <span className="material-icons-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.375rem', opacity: 0.4 }}>check_circle</span>
                All caught up — no check-ins, check-outs or cleans today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== TOP PROPERTIES ===== */}
      <div className="metric-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Property performance</h3>
          <Link href="/admin/analytics" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Full report →</Link>
        </div>
        <div className="table-container" style={{ overflowX: 'auto' }}>
          <table className="top-properties-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Property</th>
                <th style={{ textAlign: 'right' }}>Revenue</th>
                <th style={{ textAlign: 'right' }}>Profit</th>
                <th style={{ textAlign: 'right' }}>Nights</th>
                <th style={{ textAlign: 'right' }}>Occupancy (90d)</th>
              </tr>
            </thead>
            <tbody>
              {topProperties.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="property-row-info">
                      <div className="property-row-thumb">
                        <span className="material-icons-outlined" style={{ color: '#94A3B8' }}>apartment</span>
                      </div>
                      <div>
                        <div className="property-row-name">{p.name}</div>
                        <div className="property-row-location">{p.type === 'COMMISSION' ? 'Partner' : 'Owned'} · {inr(p.pricePerNight)}/night</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{inr(p.revenue)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: p.profit < 0 ? 'var(--danger)' : undefined }}>{inr(p.profit)}</td>
                  <td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{p.totalNights}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600 }}>
                      <span className={`status-dot ${p.occupancyRate > 60 ? 'booked' : p.occupancyRate > 30 ? 'available' : 'maintenance'}`} />
                      {p.occupancyRate}%
                    </span>
                  </td>
                </tr>
              ))}
              {propertyPnL.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  <Link href="/admin/properties" style={{ color: 'var(--primary)', fontWeight: 600 }}>Add your first property</Link> to see performance
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== CHARTS ROW ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Revenue by Source</h3>
          <SourcePieChart data={revenueBySource} />
        </div>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Expense Breakdown</h3>
          <ExpensePieChart data={expenseByCategory} />
        </div>
      </div>

      {/* ===== INSIGHTS ===== */}
      {insights.length > 0 && (
        <div className="metric-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '18px', color: '#D97706' }}>lightbulb</span>
            Smart Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {insights.map((insight, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8125rem', lineHeight: '1.5' }}>
                <span style={{ flexShrink: 0, color: 'var(--text-muted)' }}>•</span>
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== OCCUPANCY + PRICING ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Occupancy by Property</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Last 90 days</p>
          {propertyPnL.length > 0 ? <OccupancyChart data={occupancyData} /> : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </div>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Smart Pricing Suggestions</h3>
          {pricingSuggestions.length > 0 ? pricingSuggestions.slice(0, 3).map(s => (
            <div key={s.propertyId} style={{ background: s.type === 'increase' ? '#F0FDF4' : s.type === 'decrease' ? '#FEF2F2' : '#F8FAFC', borderRadius: '10px', padding: '0.875rem', marginBottom: '0.625rem', border: `1px solid ${s.type === 'increase' ? 'rgba(5,150,105,0.12)' : s.type === 'decrease' ? 'rgba(220,38,38,0.08)' : 'var(--border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.8125rem' }}>{s.propertyName}</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{s.occupancy30}% occ.</span>
              </div>
              <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '0.25rem' }}>{s.suggestion}</p>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Add properties to get pricing suggestions</div>
          )}
        </div>
      </div>

      {/* ===== UPCOMING CHECK-INS ===== */}
      {upcomingCheckIns.length > 0 && (
        <div className="metric-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 0.875rem 0' }}>Upcoming Check-ins (Next 7 Days)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.625rem' }}>
            {upcomingCheckIns.map((b: any) => (
              <div key={b.id} style={{ background: '#F8FAFC', borderRadius: '10px', padding: '0.75rem', border: '1px solid var(--border)' }}>
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
          <h3 style={{ margin: '0 0 0.875rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-icons-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>handshake</span>
            Commission Settlements
          </h3>
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
