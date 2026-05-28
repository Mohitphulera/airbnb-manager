'use client'

import { useState, useRef, useEffect } from 'react'
import { format, differenceInDays } from 'date-fns'

interface BookingItem {
  id: string
  customerName: string
  customerPhone: string | null
  checkInDate: string
  checkOutDate: string
  totalAmount: number
  source: string
  property: {
    id: string
    name: string
    location: string
    pricePerNight: number
  }
}

interface BillData {
  invoiceNo: string; invoiceDate: string
  guestName: string; guestPhone: string; guestEmail: string
  propertyName: string; propertyLocation: string
  checkIn: string; checkOut: string
  pricePerNight: number; extraCharges: { label: string; amount: number }[]
  discount: number; advancePaid: number; notes: string; paymentMethod: string
}

const makeEmpty = (): BillData => ({
  invoiceNo: `INV-${Date.now().toString(36).toUpperCase()}`,
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  guestName: '', guestPhone: '', guestEmail: '',
  propertyName: '', propertyLocation: '',
  checkIn: '', checkOut: '',
  pricePerNight: 0, extraCharges: [],
  discount: 0, advancePaid: 0, notes: '', paymentMethod: 'Cash',
})

interface BillGeneratorProps {
  bookings?: BookingItem[]
  initialBookingId?: string | null
}

export default function BillGenerator({ bookings = [], initialBookingId }: BillGeneratorProps) {
  const [bill, setBill] = useState<BillData>(makeEmpty())
  const [preview, setPreview] = useState(false)
  const [linkedBooking, setLinkedBooking] = useState<BookingItem | null>(null)
  const [bookingSearch, setBookingSearch] = useState('')
  const [showBookingPicker, setShowBookingPicker] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Auto-load booking from URL param on mount
  useEffect(() => {
    if (initialBookingId && bookings.length > 0) {
      const found = bookings.find(b => b.id === initialBookingId)
      if (found) loadFromBooking(found)
    }
  }, [initialBookingId, bookings]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close picker when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowBookingPicker(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadFromBooking = (booking: BookingItem) => {
    setBill(prev => ({
      ...prev,
      guestName: booking.customerName,
      guestPhone: booking.customerPhone ?? '',
      propertyName: booking.property.name,
      propertyLocation: booking.property.location,
      checkIn: booking.checkInDate.split('T')[0],
      checkOut: booking.checkOutDate.split('T')[0],
      pricePerNight: booking.property.pricePerNight,
    }))
    setLinkedBooking(booking)
    setShowBookingPicker(false)
    setBookingSearch('')
  }

  const clearBill = () => {
    setBill(makeEmpty())
    setLinkedBooking(null)
    setBookingSearch('')
  }

  const set = (k: keyof BillData, v: any) => setBill(p => ({ ...p, [k]: v }))

  const nights = bill.checkIn && bill.checkOut
    ? Math.max(differenceInDays(new Date(bill.checkOut), new Date(bill.checkIn)), 0) : 0
  const roomTotal = nights * bill.pricePerNight
  const extrasTotal = bill.extraCharges.reduce((s, c) => s + c.amount, 0)
  const subtotal = roomTotal + extrasTotal
  const discountAmt = bill.discount
  const grandTotal = subtotal - discountAmt
  const remaining = Math.max(grandTotal - bill.advancePaid, 0)

  const addCharge = () => set('extraCharges', [...bill.extraCharges, { label: '', amount: 0 }])
  const removeCharge = (i: number) => set('extraCharges', bill.extraCharges.filter((_, idx) => idx !== i))
  const updateCharge = (i: number, field: 'label' | 'amount', val: any) => {
    const c = [...bill.extraCharges]
    c[i] = { ...c[i], [field]: field === 'amount' ? Number(val) : val }
    set('extraCharges', c)
  }

  const handlePrint = () => {
    setPreview(true)
    setTimeout(() => {
      const content = printRef.current
      if (!content) return
      const w = window.open('', '_blank', 'width=800,height=1000')
      if (!w) return
      w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${bill.invoiceNo}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:800px;margin:0 auto;position:relative}
.inv-watermark{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);opacity:0.08;pointer-events:none;z-index:0;width:360px;height:360px}
.inv-watermark img{width:100%;height:100%;object-fit:contain;border-radius:50%}
.inv-content{position:relative;z-index:1}
.inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #c9a84c}
.inv-brand{font-size:24px;font-weight:800;letter-spacing:-0.02em}
.inv-brand small{display:block;font-size:10px;font-weight:600;color:#9ca3af;letter-spacing:0.15em;text-transform:uppercase;margin-top:2px}
.inv-meta{text-align:right;font-size:12px;color:#6b7280;line-height:1.8}
.inv-meta strong{color:#1a1a1a;font-size:13px}
.inv-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:32px}
.inv-box{background:#f9fafb;border-radius:8px;padding:16px}
.inv-box-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:#c9a84c;margin-bottom:10px}
.inv-box p{font-size:13px;color:#374151;line-height:1.7}
.inv-box p strong{color:#1a1a1a}
table{width:100%;border-collapse:collapse;margin-bottom:24px}
th{background:#0a0a0f;color:#f0ece4;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:10px 14px;text-align:left}
th:last-child{text-align:right}
td{padding:10px 14px;font-size:13px;border-bottom:1px solid #f1f1f1}
td:last-child{text-align:right;font-weight:600}
.inv-totals{display:flex;justify-content:flex-end;margin-bottom:24px}
.inv-totals-box{width:300px}
.inv-total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280}
.inv-total-row.grand{border-top:2px solid #c9a84c;margin-top:8px;padding-top:12px;font-size:18px;font-weight:800;color:#1a1a1a}
.inv-total-row.advance{color:#2563eb;font-weight:600}
.inv-total-row.remaining{color:#d97706;font-weight:700;font-size:14px}
.inv-payment{background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:14px;font-size:12px;color:#0369a1;line-height:1.7;margin-bottom:24px}
.inv-notes{background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:14px;font-size:12px;color:#92400e;line-height:1.7;margin-bottom:24px}
.inv-rules{border:1px solid #e5e7eb;border-radius:8px;padding:18px;margin-bottom:24px}
.inv-rules-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#c9a84c;margin-bottom:10px}
.inv-rules ul{list-style:none;padding:0}
.inv-rules ul li{font-size:11px;color:#4b5563;line-height:1.9;padding-left:16px;position:relative}
.inv-rules ul li::before{content:'•';position:absolute;left:0;color:#c9a84c;font-weight:bold}
.inv-refund{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 14px;font-size:11px;color:#166534;line-height:1.6;margin-bottom:24px;font-weight:500}
.inv-footer{text-align:center;padding-top:24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af}
.inv-footer strong{color:#c9a84c}
@media print{body{padding:20px}button{display:none!important}.inv-watermark{position:fixed}}
</style></head><body>
<div class="inv-watermark"><img src="/logo-cozybnb.jpg" alt="" /></div>
${content.innerHTML}
</body></html>`)
      w.document.close()
      setTimeout(() => { w.print() }, 400)
    }, 100)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
    border: '1px solid var(--border)', background: '#fff', fontSize: '0.875rem',
    fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.3s',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.5625rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b',
    marginBottom: '0.375rem',
  }
  const sectionStyle: React.CSSProperties = {
    background: '#fff', borderRadius: '14px', padding: '1.5rem',
    border: '1px solid var(--border)', marginBottom: '1.25rem',
  }
  const sectionTitle = (icon: string, text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>{icon}</span>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>{text}</h3>
    </div>
  )

  // Filtered bookings for picker
  const filteredBookings = bookings.filter(b => {
    const q = bookingSearch.toLowerCase()
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.property.name.toLowerCase().includes(q) ||
      (b.customerPhone ?? '').includes(q)
    )
  })

  const bookedTotal = linkedBooking?.totalAmount ?? null
  const totalMismatch = bookedTotal !== null && grandTotal > 0 && Math.abs(grandTotal - bookedTotal) > 1

  return (
    <div>

      {/* ═══ BOOKING INTEGRATION BANNER ═══ */}
      {bookings.length > 0 && (
        <div style={{
          background: linkedBooking
            ? 'linear-gradient(135deg, #ecfdf5, #f0fdf4)'
            : 'linear-gradient(135deg, #eff6ff, #f0f9ff)',
          border: `1px solid ${linkedBooking ? '#a7f3d0' : '#bae6fd'}`,
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          {linkedBooking ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#059669', flexShrink: 0 }}>link</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>
                    Loaded from Booking
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#047857', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {linkedBooking.customerName} · {linkedBooking.property.name} ·{' '}
                    {new Date(linkedBooking.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} →{' '}
                    {new Date(linkedBooking.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              {bookedTotal !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Booked Total</div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#1a1a1a' }}>₹{bookedTotal.toLocaleString('en-IN')}</div>
                  </div>
                  {grandTotal > 0 && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280' }}>Bill Total</div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: totalMismatch ? '#d97706' : '#059669' }}>
                        ₹{grandTotal.toLocaleString('en-IN')}
                        {totalMismatch && <span style={{ fontSize: '0.625rem', marginLeft: '0.25rem' }}>⚠️</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <button
                  onClick={() => setShowBookingPicker(!showBookingPicker)}
                  style={{ background: 'none', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#065f46', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>swap_horiz</span>
                  Switch
                </button>
                <button
                  onClick={clearBill}
                  style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                  Clear
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#0369a1', flexShrink: 0 }}>receipt_long</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0c4a6e' }}>Auto-fill from a Booking</div>
                <div style={{ fontSize: '0.8125rem', color: '#0369a1' }}>Select an existing booking to pre-populate all guest & stay details instantly.</div>
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }} ref={pickerRef}>
                <button
                  onClick={() => setShowBookingPicker(!showBookingPicker)}
                  style={{
                    background: 'var(--gradient-primary)', border: 'none', borderRadius: '9999px',
                    padding: '0.5rem 1.25rem', fontSize: '0.75rem', fontWeight: 700,
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.375rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>search</span>
                  Load from Booking
                </button>

                {showBookingPicker && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: '#fff', border: '1px solid var(--border)', borderRadius: '14px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.15)', zIndex: 50, width: '380px', overflow: 'hidden',
                  }}>
                    <div style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #f1f5f9' }}>
                      <input
                        autoFocus
                        value={bookingSearch}
                        onChange={e => setBookingSearch(e.target.value)}
                        placeholder="Search by guest name, property…"
                        style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8125rem', outline: 'none', fontFamily: 'inherit' }}
                      />
                    </div>
                    <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
                      {filteredBookings.length === 0 ? (
                        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.8125rem' }}>No bookings found</div>
                      ) : filteredBookings.map(b => (
                        <button
                          key={b.id}
                          onClick={() => loadFromBooking(b)}
                          style={{
                            display: 'flex', width: '100%', padding: '0.75rem 1rem',
                            border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
                            gap: '0.75rem', alignItems: 'center', borderBottom: '1px solid #f8fafc',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563eb' }}>person</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#1e293b' }}>{b.customerName}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.property.name} · {new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#059669' }}>₹{b.totalAmount.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.625rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{b.source}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ FORM ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Left Column */}
        <div>
          {/* Invoice Info */}
          <div style={sectionStyle}>
            {sectionTitle('receipt_long', 'Invoice Details')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Invoice Number</label>
                <input style={inputStyle} value={bill.invoiceNo} onChange={e => set('invoiceNo', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Invoice Date</label>
                <input type="date" style={inputStyle} value={bill.invoiceDate} onChange={e => set('invoiceDate', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div style={sectionStyle}>
            {sectionTitle('person', 'Guest Information')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Guest Name *</label>
                <input style={inputStyle} placeholder="Full name" value={bill.guestName} onChange={e => set('guestName', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input style={inputStyle} placeholder="+91 98765 43210" value={bill.guestPhone} onChange={e => set('guestPhone', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" style={inputStyle} placeholder="guest@email.com" value={bill.guestEmail} onChange={e => set('guestEmail', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div style={sectionStyle}>
            {sectionTitle('home_work', 'Property & Stay')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Property Name *</label>
                  <input style={inputStyle} placeholder="e.g. Sunset Villa" value={bill.propertyName} onChange={e => set('propertyName', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Location</label>
                  <input style={inputStyle} placeholder="City, State" value={bill.propertyLocation} onChange={e => set('propertyLocation', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Check-in *</label>
                  <input type="date" style={inputStyle} value={bill.checkIn} onChange={e => set('checkIn', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Check-out *</label>
                  <input type="date" style={inputStyle} value={bill.checkOut} onChange={e => set('checkOut', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Price / Night *</label>
                  <input type="number" style={inputStyle} placeholder="₹0" value={bill.pricePerNight || ''} onChange={e => set('pricePerNight', Number(e.target.value))} />
                </div>
              </div>
              {nights > 0 && (
                <div style={{ background: 'var(--cozy-blue-light)', borderRadius: '8px', padding: '0.625rem 0.875rem', fontSize: '0.8125rem' }}>
                  <strong>{nights}</strong> night{nights > 1 ? 's' : ''} · Room total: <strong>₹{roomTotal.toLocaleString('en-IN')}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Extra Charges */}
          <div style={sectionStyle}>
            {sectionTitle('add_circle', 'Additional Charges')}
            {bill.extraCharges.map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 32px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
                <div>
                  {i === 0 && <label style={labelStyle}>Description</label>}
                  <input style={inputStyle} placeholder="e.g. Cleaning fee" value={c.label} onChange={e => updateCharge(i, 'label', e.target.value)} />
                </div>
                <div>
                  {i === 0 && <label style={labelStyle}>Amount</label>}
                  <input type="number" style={inputStyle} placeholder="₹0" value={c.amount || ''} onChange={e => updateCharge(i, 'amount', e.target.value)} />
                </div>
                <button onClick={() => removeCharge(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '18px', paddingBottom: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                </button>
              </div>
            ))}
            <button onClick={addCharge} style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: '8px', padding: '0.625rem', width: '100%', fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', cursor: 'pointer' }}>
              + Add Charge
            </button>
          </div>

          {/* Discount & Payment */}
          <div style={sectionStyle}>
            {sectionTitle('payments', 'Payment Details')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Discount (₹)</label>
                <input type="number" style={inputStyle} placeholder="0" value={bill.discount || ''} onChange={e => set('discount', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Payment Method</label>
                <select style={inputStyle} value={bill.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
                  <option>Cash</option><option>UPI</option><option>Bank Transfer</option><option>Card</option><option>Other</option>
                </select>
              </div>
            </div>
            {/* Total + Advance + Remaining */}
            {grandTotal > 0 && (
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: '10px', padding: '0.875rem 1rem', marginBottom: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.25rem' }}>Total Amount</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#fff' }}>₹{grandTotal.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#60a5fa', marginBottom: '0.25rem' }}>Advance Paid</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#60a5fa' }}>₹{bill.advancePaid.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: remaining > 0 ? '#fbbf24' : '#4ade80', marginBottom: '0.25rem' }}>Remaining</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: remaining > 0 ? '#fbbf24' : '#4ade80' }}>₹{remaining.toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Advance Paid (₹)</label>
                <input type="number" style={inputStyle} placeholder="0" value={bill.advancePaid || ''} onChange={e => set('advancePaid', Number(e.target.value))} />
              </div>
              <div>
                <label style={labelStyle}>Remaining at Check-in</label>
                <div style={{ ...inputStyle, background: remaining > 0 ? '#fef3c7' : '#d1fae5', display: 'flex', alignItems: 'center', fontWeight: 700, color: remaining > 0 ? '#92400e' : '#059669', border: `1px solid ${remaining > 0 ? '#fde68a' : '#a7f3d0'}` }}>
                  ₹{remaining.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '70px' }} placeholder="Thank you for your stay..." value={bill.notes} onChange={e => set('notes', e.target.value)} />
            </div>
          </div>

          {/* Summary */}
          <div style={{ ...sectionStyle, background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', border: 'none' }}>
            <h3 style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', marginBottom: '1rem' }}>Bill Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                <span>Room ({nights} night{nights > 1 ? 's' : ''})</span><span style={{ color: '#fff' }}>₹{roomTotal.toLocaleString('en-IN')}</span>
              </div>
              {bill.extraCharges.filter(c => c.amount > 0).map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                  <span>{c.label || 'Extra charge'}</span><span style={{ color: '#fff' }}>₹{c.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {discountAmt > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}>
                  <span>Discount</span><span>-₹{discountAmt.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                <span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              {bill.advancePaid > 0 && (
                <>
                  <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0.5rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa', fontSize: '0.8125rem' }}>
                    <span>Advance Paid</span><span>₹{bill.advancePaid.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fbbf24', fontWeight: 700 }}>
                    <span>Due at Check-in</span><span>₹{remaining.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={clearBill}
              style={{
                padding: '0.975rem 1.25rem', borderRadius: '9999px', border: '1px solid var(--border)',
                background: '#fff', color: '#64748b', fontFamily: "'Manrope', sans-serif", fontSize: '0.6875rem',
                fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#ef4444' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = '#64748b' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
              New Bill
            </button>
            <button
              onClick={handlePrint}
              disabled={!bill.guestName || !bill.propertyName || !bill.checkIn || !bill.checkOut || nights <= 0}
              style={{
                flex: 1, padding: '0.975rem', borderRadius: '9999px', border: 'none',
                background: (!bill.guestName || !bill.propertyName || !bill.checkIn || !bill.checkOut || nights <= 0) ? '#d1d5db' : 'var(--gradient-primary)',
                color: '#fff', fontFamily: "'Manrope', sans-serif", fontSize: '0.6875rem',
                fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase',
                cursor: (!bill.guestName || !bill.propertyName || !bill.checkIn || !bill.checkOut || nights <= 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(37,99,235,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>picture_as_pdf</span>
              Generate PDF Bill
            </button>
          </div>
        </div>
      </div>

      {/* ═══ HIDDEN PRINT TEMPLATE ═══ */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={printRef}>
          <div className="inv-content">
          <div className="inv-header">
            <div>
              <div className="inv-brand">Cozy B&B<small>Premium Hospitality</small></div>
            </div>
            <div className="inv-meta">
              <strong>INVOICE</strong><br />
              {bill.invoiceNo}<br />
              Date: {bill.invoiceDate ? format(new Date(bill.invoiceDate), 'dd MMM yyyy') : ''}
            </div>
          </div>

          <div className="inv-grid">
            <div className="inv-box">
              <div className="inv-box-title">Bill To</div>
              <p><strong>{bill.guestName}</strong></p>
              {bill.guestPhone && <p>{bill.guestPhone}</p>}
              {bill.guestEmail && <p>{bill.guestEmail}</p>}
            </div>
            <div className="inv-box">
              <div className="inv-box-title">Stay Details</div>
              <p><strong>{bill.propertyName}</strong></p>
              {bill.propertyLocation && <p>{bill.propertyLocation}</p>}
              <p>Check-in: {bill.checkIn ? format(new Date(bill.checkIn), 'dd MMM yyyy') : '—'}</p>
              <p>Check-out: {bill.checkOut ? format(new Date(bill.checkOut), 'dd MMM yyyy') : '—'}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Room Charges — {bill.propertyName}</td>
                <td>{nights} night{nights > 1 ? 's' : ''}</td>
                <td>₹{bill.pricePerNight.toLocaleString('en-IN')}</td>
                <td>₹{roomTotal.toLocaleString('en-IN')}</td>
              </tr>
              {bill.extraCharges.filter(c => c.amount > 0).map((c, i) => (
                <tr key={i}>
                  <td>{c.label || 'Additional charge'}</td><td>1</td><td>₹{c.amount.toLocaleString('en-IN')}</td><td>₹{c.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="inv-totals">
            <div className="inv-totals-box">
              <div className="inv-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              {discountAmt > 0 && <div className="inv-total-row"><span>Discount</span><span>-₹{discountAmt.toLocaleString('en-IN')}</span></div>}
              <div className="inv-total-row grand"><span>Grand Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
              {bill.advancePaid > 0 && (
                <>
                  <div className="inv-total-row advance"><span>Advance Paid</span><span>₹{bill.advancePaid.toLocaleString('en-IN')}</span></div>
                  <div className="inv-total-row remaining"><span>Balance Due at Check-in</span><span>₹{remaining.toLocaleString('en-IN')}</span></div>
                </>
              )}
            </div>
          </div>

          {bill.advancePaid > 0 && (
            <div className="inv-payment">
              <strong>Payment Summary:</strong> An advance of ₹{bill.advancePaid.toLocaleString('en-IN')} has been received via {bill.paymentMethod}. The remaining balance of ₹{remaining.toLocaleString('en-IN')} is to be paid at the time of check-in.
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Payment Method: <strong style={{ color: '#1a1a1a' }}>{bill.paymentMethod}</strong>
          </div>

          {bill.notes && <div className="inv-notes">{bill.notes}</div>}

          <div className="inv-rules">
            <div className="inv-rules-title">House Rules & Policies</div>
            <ul>
              <li>Check-in time is after 2:00 PM and check-out time is before 11:00 AM.</li>
              <li>Please carry a valid government-issued photo ID at the time of check-in.</li>
              <li>Smoking is strictly prohibited inside the property.</li>
              <li>No parties, events, or loud music after 10:00 PM.</li>
              <li>Pets are not allowed unless explicitly approved in advance.</li>
              <li>Guests are liable for any damage to the property or its furnishings during their stay.</li>
              <li>Additional guests beyond the booked occupancy may incur extra charges.</li>
              <li>The management reserves the right to cancel a booking in case of violation of house rules.</li>
            </ul>
          </div>

          <div className="inv-refund">
            <strong>Refund Policy:</strong> The advance amount paid is fully refundable if the booking is cancelled at least 48 hours before the scheduled check-in date. Cancellations made within 48 hours of check-in are non-refundable.
          </div>

          <div className="inv-footer">
            Thank you for choosing <strong>Cozy B&B</strong>. We hope you enjoy your stay!<br />
            For queries, reach us on WhatsApp or email.
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
