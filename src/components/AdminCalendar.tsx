'use client'

import { useState } from 'react'
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, subMonths, addMonths, format, isSameMonth,
  isSameDay, isAfter, isBefore, startOfDay
} from 'date-fns'

export default function AdminCalendar({ bookings, properties }: { bookings: any[], properties: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedProperty, setSelectedProperty] = useState('ALL')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays: Date[] = []
  let day = startDate
  while (day <= endDate) { calendarDays.push(day); day = addDays(day, 1) }

  const filtered = selectedProperty === 'ALL' ? bookings : bookings.filter((b: any) => b.propertyId === selectedProperty)

  const colors = ['#FF385C', '#008489', '#E0A800', '#6366F1', '#EC4899', '#14B8A6']
  const getColor = (pid: string) => colors[properties.findIndex((p: any) => p.id === pid) % colors.length]

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="btn btn-outline" style={{ padding: '0.375rem 0.75rem' }}>←</button>
          <h2 style={{ margin: 0, minWidth: '160px', textAlign: 'center' }}>{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn btn-outline" style={{ padding: '0.375rem 0.75rem' }}>→</button>
        </div>
        <select className="form-select" style={{ width: 'auto', maxWidth: '200px', padding: '0.4rem 0.75rem', fontSize: '0.8125rem' }} value={selectedProperty} onChange={e => setSelectedProperty(e.target.value)}>
          <option value="ALL">All Properties</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {properties.map((p: any, i: number) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: colors[i % colors.length] }} />
            {p.name}
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#FAFAFA' }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((date, i) => {
            const isCurrentMonth = isSameMonth(date, monthStart)
            const isToday = isSameDay(date, new Date())
            const target = startOfDay(date)
            const daysBookings = filtered.filter((b: any) => {
              const cIn = startOfDay(new Date(b.checkInDate))
              const cOut = startOfDay(new Date(b.checkOutDate))
              return (isSameDay(target, cIn) || isAfter(target, cIn)) && isBefore(target, cOut)
            })

            return (
              <div key={date.toISOString()} style={{
                minHeight: '80px', padding: '0.375rem',
                borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < calendarDays.length - 7 ? '1px solid var(--border)' : 'none',
                background: isToday ? '#FFF5F6' : '#fff',
                opacity: isCurrentMonth ? 1 : 0.4
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--primary)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {format(date, 'd')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {daysBookings.map((b: any) => (
                    <div key={b.id} style={{
                      background: getColor(b.propertyId), color: '#fff',
                      fontSize: '0.5625rem', padding: '1px 4px', borderRadius: '3px',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }} title={`${b.property.name} — ${b.customerName}`}>
                      {b.customerName}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
