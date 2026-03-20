'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { format, subMonths } from 'date-fns'

export default function AdminChart({ bookings }: { bookings: any[] }) {
  const months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), 5 - i))

  const data = months.map(m => {
    const mb = bookings.filter((b: any) => {
      const d = new Date(b.checkInDate)
      return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear()
    })
    return { name: format(m, 'MMM'), revenue: mb.reduce((s: number, b: any) => s + b.totalAmount, 0) }
  })

  return (
    <div style={{ width: '100%', height: '260px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2B6CB0" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2B6CB0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94A3B8" fontSize={12} dy={8} />
          <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" fontSize={11} tickFormatter={v => `₹${v}`} dx={-5} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.875rem', boxShadow: '0 4px 16px rgba(43, 108, 176, 0.1)' }}
            formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2B6CB0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
