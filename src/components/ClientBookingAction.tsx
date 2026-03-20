'use client'

import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isWithinInterval, startOfDay } from 'date-fns'

export default function ClientBookingAction({ property, bookings }: { property: any, bookings: any[] }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{from: Date | undefined, to: Date | undefined}>({ from: undefined, to: undefined })

  const disabledDates = (date: Date) => {
    if (startOfDay(date) < startOfDay(new Date())) return true
    for (const b of bookings) {
      if (isWithinInterval(date, { start: new Date(b.checkIn), end: new Date(b.checkOut) })) return true
    }
    return false
  }

  const handleWhatsApp = () => {
    if (!selectedRange.from || !selectedRange.to) return
    const number = property.whatsappNumber
    if (!number) { alert("Host contact not available."); return }
    const msg = `Hi! I'd like to book "${property.name}" in ${property.location} from ${format(selectedRange.from, 'PPP')} to ${format(selectedRange.to, 'PPP')}. Is it available?`
    window.open(`https://wa.me/${number.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  return (
    <div>
      {!showCalendar ? (
        <button onClick={() => setShowCalendar(true)} className="btn btn-outline" style={{ width: '100%', borderRadius: '8px' }}>
          Check availability
        </button>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Select dates</span>
            <button onClick={() => setShowCalendar(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}>×</button>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            .rdp { --rdp-cell-size: 36px; --rdp-accent-color: var(--primary); font-size: 0.8125rem; margin: 0; }
            .rdp-day_selected { background-color: var(--primary) !important; color: #fff !important; }
            .rdp-day_disabled { opacity: 0.2; text-decoration: line-through; }
            .rdp-day_range_start, .rdp-day_range_end { background: var(--primary) !important; color: #fff !important; border-radius: 50% !important; }
          `}} />

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <DayPicker mode="range" selected={selectedRange as any} onSelect={setSelectedRange as any} disabled={disabledDates} />
          </div>

          <button onClick={handleWhatsApp} className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', borderRadius: '8px' }} disabled={!selectedRange.from || !selectedRange.to}>
            {selectedRange.from && selectedRange.to ? '💬 Request on WhatsApp' : 'Pick check-in & out dates'}
          </button>
        </div>
      )}
    </div>
  )
}
