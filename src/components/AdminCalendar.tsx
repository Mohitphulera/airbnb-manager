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
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

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

  const getBookingsForDate = (date: Date) => {
    const target = startOfDay(date)
    return filtered.filter((b: any) => {
      const cIn = startOfDay(new Date(b.checkInDate))
      const cOut = startOfDay(new Date(b.checkOutDate))
      return (isSameDay(target, cIn) || isAfter(target, cIn)) && isBefore(target, cOut)
    })
  }

  const selectedBookings = selectedDate ? getBookingsForDate(selectedDate) : []

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="btn btn-outline" style={{ padding: '0.375rem 0.75rem' }}>←</button>
          <h2 style={{ margin: 0, minWidth: '140px', textAlign: 'center', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>{format(currentDate, 'MMMM yyyy')}</h2>
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

      {/* Calendar Grid */}
      <div className="calendar-scroll-wrap">
        <div className="calendar-grid-outer">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#FAFAFA' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {calendarDays.map((date, i) => {
              const isCurrentMonth = isSameMonth(date, monthStart)
              const isToday = isSameDay(date, new Date())
              const daysBookings = getBookingsForDate(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)

              return (
                <div
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(isSelected ? null : date)}
                  className="calendar-cell"
                  style={{
                    minHeight: '72px', padding: '0.375rem',
                    borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                    borderBottom: i < calendarDays.length - 7 ? '1px solid var(--border)' : 'none',
                    background: isSelected ? 'var(--cozy-blue-light)' : isToday ? '#FFF5F6' : '#fff',
                    opacity: isCurrentMonth ? 1 : 0.4,
                    cursor: 'pointer',
                    outline: isSelected ? '2px solid var(--primary)' : 'none',
                    outlineOffset: '-2px',
                    borderRadius: isSelected ? '4px' : '0',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--primary)' : 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {format(date, 'd')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {daysBookings.slice(0, 3).map((b: any) => (
                      <div key={b.id} style={{
                        background: getColor(b.propertyId), color: '#fff',
                        fontSize: '0.5625rem', padding: '1px 4px', borderRadius: '3px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }} title={`${b.property.name} — ${b.customerName}`}>
                        {b.customerName}
                      </div>
                    ))}
                    {daysBookings.length > 3 && (
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>+{daysBookings.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDate && (
        <div className="calendar-detail-panel" style={{ marginTop: '1.25rem', animation: 'fadeUp 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>
              📅 {format(selectedDate, 'EEEE, d MMMM yyyy')}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
              ✕ Close
            </button>
          </div>

          {selectedBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏖️</div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No bookings on this date</p>
              <p style={{ fontSize: '0.8125rem' }}>This day is available for all properties</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }} className="calendar-detail-grid">
              {selectedBookings.map((b: any) => (
                <div key={b.id} style={{
                  background: '#fff',
                  border: `2px solid ${getColor(b.propertyId)}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  borderLeft: `5px solid ${getColor(b.propertyId)}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.125rem' }}>{b.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: getColor(b.propertyId), fontWeight: 600 }}>{b.property.name}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${b.source === 'AIRBNB' ? 'badge-pink' : b.source === 'DIRECT' ? 'badge-green' : 'badge-gray'}`}>
                        {b.source}
                      </span>
                      <span className={`badge ${b.cleaningStatus === 'DONE' ? 'badge-green' : b.cleaningStatus === 'IN_PROGRESS' ? 'badge-yellow' : 'badge-gray'}`}>
                        🧹 {b.cleaningStatus}
                      </span>
                    </div>
                  </div>

                  <div className="booking-detail-info">
                    <div className="booking-detail-item">
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Check-in</span>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{format(new Date(b.checkInDate), 'd MMM yyyy')}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Check-out</span>
                      <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{format(new Date(b.checkOutDate), 'd MMM yyyy')}</span>
                    </div>
                    <div className="booking-detail-item">
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Amount</span>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--cozy-success)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                    {b.customerPhone && (
                      <div className="booking-detail-item">
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Phone</span>
                        <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{b.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  {b.notes && (
                    <div style={{ marginTop: '0.625rem', padding: '0.5rem 0.75rem', background: '#FFFBEB', borderRadius: '8px', fontSize: '0.8125rem', color: '#92400E' }}>
                      📝 {b.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
