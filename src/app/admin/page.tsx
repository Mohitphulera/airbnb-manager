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

  return (
    <div>
      {/* ===== PORTFOLIO OVERVIEW HEADER ===== */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
            Portfolio Overview
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitoring {propertyPnL.length} properties
            {todayActions > 0 && <span style={{ marginLeft: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>· {todayActions} actions today</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>PORTFOLIO VALUE</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>₹{totals.revenue.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.5625rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>AVG OCCUPANCY</div>
            <div style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{avgOccupancy}%</div>
          </div>
        </div>
      </div>

      {/* ===== EARNINGS + KPI SIDE PANEL ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Total Earnings Chart */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.125rem' }}>Total Earnings</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Revenue & profit trend · Last 12 months</p>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 600, background: '#0F172A', color: '#fff' }}>Monthly</span>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.6875rem', fontWeight: 500, color: '#94A3B8', cursor: 'pointer' }}>Quarterly</span>
            </div>
          </div>
          <RevenueChart data={monthlyTrend} />
        </div>

        {/* KPI Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Occupancy */}
          <div className="metric-card kpi-glow" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>Occupancy</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: avgOccupancy > 60 ? '#D1FAE5' : '#FEF3C7', color: avgOccupancy > 60 ? '#059669' : '#D97706' }}>
                {avgOccupancy > 60 ? '+' : ''}{avgOccupancy > 60 ? '4.2' : '-2.1'}%
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{avgOccupancy}%</div>
            <div style={{ height: '3px', background: '#F1F5F9', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${avgOccupancy}%`, background: 'var(--gradient-primary)', borderRadius: '2px' }} />
            </div>
          </div>

          {/* ADR */}
          <div className="metric-card kpi-glow" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>ADR</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: '#D1FAE5', color: '#059669' }}>Optimal</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>₹{avgRevPAR > 0 ? Math.round(totals.revenue / Math.max(totals.bookings, 1)).toLocaleString('en-IN') : '0'}</div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Average Daily Rate (Portfolio)</p>
          </div>

          {/* RevPAR */}
          <div className="metric-card kpi-glow" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)' }}>RevPAR</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '4px', background: totals.profit >= 0 ? '#D1FAE5' : '#FEE2E2', color: totals.profit >= 0 ? '#059669' : '#DC2626' }}>
                {totals.profit >= 0 ? '+3' : '-3'}%
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>₹{avgRevPAR.toLocaleString('en-IN')}</div>
            <p style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Revenue Per Available Room</p>
          </div>
        </div>
      </div>

      {/* ===== PRIORITY ACTIONS + TOP PROPERTIES ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Priority Actions */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Priority Actions</h3>
          <div className="priority-actions">
            {todayCheckIns.length > 0 && todayCheckIns.slice(0, 2).map((b: any) => (
              <div key={b.id} className="priority-action">
                <div className="priority-action-icon blue">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>key</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Check-in: {b.customerName}</div>
                  <div className="priority-action-desc">{b.property.name} · Today</div>
                  {b.notes && <div className="priority-action-desc" style={{ fontStyle: 'italic', color: '#059669' }}>{b.notes}</div>}
                </div>
              </div>
            ))}

            {cleaningNeeded.length > 0 && cleaningNeeded.slice(0, 2).map((b: any) => (
              <div key={b.id} className="priority-action">
                <div className="priority-action-icon yellow">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>cleaning_services</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Cleaning Inspection</div>
                  <div className="priority-action-desc">Schedule walk-through for &apos;{b.property.name}&apos; after guest checkout.</div>
                </div>
                <span className="priority-action-time">Today</span>
              </div>
            ))}

            {todayCheckOuts.length > 0 && todayCheckOuts.slice(0, 2).map((b: any) => (
              <div key={b.id} className="priority-action">
                <div className="priority-action-icon red">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>logout</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Check-out: {b.customerName}</div>
                  <div className="priority-action-desc">{b.property.name}</div>
                </div>
              </div>
            ))}

            {totals.profit > 0 && (
              <div className="priority-action">
                <div className="priority-action-icon green">
                  <span className="material-icons-outlined" style={{ fontSize: '20px' }}>account_balance</span>
                </div>
                <div className="priority-action-content">
                  <div className="priority-action-title">Net Profit</div>
                  <div className="priority-action-desc">₹{totals.profit.toLocaleString('en-IN')} earned after expenses & commission.</div>
                </div>
                <span className="priority-action-time">This period</span>
              </div>
            )}

            {todayCheckIns.length === 0 && todayCheckOuts.length === 0 && cleaningNeeded.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                <span className="material-icons-outlined" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.375rem', opacity: 0.4 }}>check_circle</span>
                All caught up! No actions needed.
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Properties */}
        <div className="metric-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Top Performing Properties</h3>
            <Link href="/admin/properties" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>View All Listings</Link>
          </div>
          <table className="top-properties-table" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Property</th>
                <th style={{ textAlign: 'right' }}>Monthly Rev</th>
                <th style={{ textAlign: 'right' }}>Occupancy</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {propertyPnL.slice(0, 5).map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="property-row-info">
                      <div className="property-row-thumb">
                        <span className="material-icons-outlined" style={{ color: '#94A3B8' }}>apartment</span>
                      </div>
                      <div>
                        <div className="property-row-name">{p.name}</div>
                        <div className="property-row-location">{p.type === 'COMMISSION' ? 'Partner' : 'Owned'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{p.revenue.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{p.occupancyRate}%</td>
                  <td style={{ textAlign: 'right' }}>
                    <span>
                      <span className={`status-dot ${p.occupancyRate > 50 ? 'booked' : p.occupancyRate > 20 ? 'available' : 'maintenance'}`} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {p.occupancyRate > 50 ? 'Booked' : p.occupancyRate > 20 ? 'Available' : 'Low'}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
              {propertyPnL.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>Add properties to see performance</td></tr>
              )}
            </tbody>
          </table>
          {propertyPnL.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link href="/admin/analytics" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
                VIEW FULL FINANCIAL REPORT
              </Link>
            </div>
          )}
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
