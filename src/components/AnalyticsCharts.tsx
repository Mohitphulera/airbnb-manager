'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, ComposedChart, Line, Legend } from 'recharts'

const COLORS = ['#2B6CB0', '#0D9488', '#D97706', '#7C3AED', '#DC2626', '#059669']

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: '280px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2B6CB0" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#2B6CB0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="#94A3B8" fontSize={11} dy={8} />
          <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" fontSize={11} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} dx={-5} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8125rem', boxShadow: '0 4px 16px rgba(43, 108, 176, 0.1)' }}
            formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Area type="monotone" dataKey="revenue" stroke="#2B6CB0" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
          <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} dot={false} name="Profit" />
          <Bar dataKey="expenses" fill="#F59E0B" opacity={0.5} barSize={12} radius={[3,3,0,0]} name="Expenses" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SourcePieChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
  
  if (chartData.length === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No data yet</div>

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} style={{ fontSize: '0.6875rem', fontWeight: 600 }}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']} contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8125rem' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function OccupancyChart({ data }: { data: any[] }) {
  return (
    <div style={{ width: '100%', height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#94A3B8" fontSize={10} angle={-20} textAnchor="end" dy={8} interval={0} />
          <YAxis axisLine={false} tickLine={false} stroke="#94A3B8" fontSize={11} tickFormatter={v => `${v}%`} domain={[0, 100]} />
          <Tooltip formatter={(val: any) => [`${val}%`, 'Occupancy']} contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8125rem' }} />
          <Bar dataKey="occupancy" radius={[6, 6, 0, 0]} barSize={28}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.occupancy > 70 ? '#059669' : entry.occupancy > 40 ? '#D97706' : '#DC2626'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ExpensePieChart({ data }: { data: Record<string, number> }) {
  const LABELS: Record<string, string> = { CLEANING: '🧹 Cleaning', REPAIR: '🔧 Repair', UTILITY: '⚡ Utility', OTHER: '📦 Other' }
  const chartData = Object.entries(data).filter(([, v]) => v > 0).map(([name, value]) => ({ name: LABELS[name] || name, value }))
  
  if (chartData.length === 0) return <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expenses</div>

  return (
    <div style={{ width: '100%', height: '200px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} style={{ fontSize: '0.625rem', fontWeight: 600 }}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']} contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8125rem' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
