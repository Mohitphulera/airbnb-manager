import { getExpenses, deleteExpense } from '@/actions/expenseActions'
import { getProperties } from '@/actions/propertyActions'
import { getBookings } from '@/actions/bookingActions'
import ExpenseForm from '@/components/ExpenseForm'

export const dynamic = 'force-dynamic'

export default async function ExpensesPage() {
  const [expenses, properties, bookings] = await Promise.all([getExpenses(), getProperties(), getBookings()])
  const total = expenses.reduce((sum: number, e: any) => sum + e.amount, 0)

  const catColor: Record<string, string> = { CLEANING: 'badge-blue', REPAIR: 'badge-yellow', UTILITY: 'badge-green', OTHER: 'badge-gray' }

  // Category breakdown
  const categories: Record<string, number> = {}
  expenses.forEach((e: any) => { categories[e.category] = (categories[e.category] || 0) + e.amount })

  // Monthly P&L
  const totalRevenue = bookings.reduce((s: number, b: any) => s + b.totalAmount, 0)
  const totalCommission = bookings.reduce((s: number, b: any) => s + (b.commissionOwed || 0), 0)
  const netProfit = totalRevenue - totalCommission - total

  // Per-property expense breakdown
  const propExpenses: Record<string, { name: string; amount: number }> = {}
  expenses.forEach((e: any) => {
    if (!propExpenses[e.propertyId]) propExpenses[e.propertyId] = { name: e.property.name, amount: 0 }
    propExpenses[e.propertyId].amount += e.amount
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Expense & Tax Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{expenses.length} expenses logged · Track every rupee</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/api/export-expenses" className="btn btn-outline" download style={{ fontSize: '0.8125rem' }}>Export CSV</a>
          <a href="/api/export" className="btn btn-outline" download="airbnb-data.xlsx" style={{ fontSize: '0.8125rem' }}>Export Excel</a>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="metrics-row" style={{ marginBottom: '1.5rem' }}>
        <div className="metric-card">
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Revenue</p>
          <p style={{ fontSize: '1.375rem', fontWeight: 800 }}>₹{totalRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Commission</p>
          <p style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--danger)' }}>₹{totalCommission.toLocaleString('en-IN')}</p>
        </div>
        <div className="metric-card">
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Total Expenses</p>
          <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#B45309' }}>₹{total.toLocaleString('en-IN')}</p>
        </div>
        <div className="metric-card" style={{ borderLeft: '3px solid var(--cozy-success)' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>Net Profit</p>
          <p style={{ fontSize: '1.375rem', fontWeight: 800, color: netProfit >= 0 ? 'var(--cozy-success)' : 'var(--danger)' }}>₹{netProfit.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Category + Property Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.875rem' }}>Analytics: By Category</h3>
          {Object.entries(categories).map(([cat, amt]) => (
            <div key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
              <span className={`badge ${catColor[cat] || 'badge-gray'}`}>{cat}</span>
              <span style={{ fontWeight: 700, color: '#B45309' }}>₹{amt.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {Object.keys(categories).length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No expenses</p>}
        </div>
        <div className="metric-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.875rem' }}>Home By Property</h3>
          {Object.values(propExpenses).sort((a, b) => b.amount - a.amount).map((pe, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{pe.name}</span>
              <span style={{ fontWeight: 700, color: '#B45309' }}>₹{pe.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
          {Object.keys(propExpenses).length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No expenses</p>}
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-sidebar-card">
          <h3 style={{ marginBottom: '1rem' }}>Log Expense</h3>
          <ExpenseForm properties={properties} />
        </div>

        <div className="admin-main-card">
          <h3 style={{ marginBottom: '1rem' }}>All Expenses</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e: any) => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 600 }}>{e.property.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{e.description}</td>
                    <td><span className={`badge ${catColor[e.category] || 'badge-gray'}`}>{e.category}</span></td>
                    <td style={{ fontWeight: 700, color: '#B45309' }}>₹{e.amount.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>
                      <form action={async () => { 'use server'; await deleteExpense(e.id) }}>
                        <button type="submit" className="btn btn-danger">Remove</button>
                      </form>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expenses recorded</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
