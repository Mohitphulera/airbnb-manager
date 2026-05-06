'use client'

import { useState, useRef } from 'react'
import { format, differenceInDays } from 'date-fns'

interface BillData {
  invoiceNo: string; invoiceDate: string
  guestName: string; guestPhone: string; guestEmail: string
  propertyName: string; propertyLocation: string
  checkIn: string; checkOut: string
  pricePerNight: number; extraCharges: { label: string; amount: number }[]
  discount: number; notes: string; paymentMethod: string
}

const empty: BillData = {
  invoiceNo: `INV-${Date.now().toString(36).toUpperCase()}`,
  invoiceDate: format(new Date(), 'yyyy-MM-dd'),
  guestName: '', guestPhone: '', guestEmail: '',
  propertyName: '', propertyLocation: '',
  checkIn: '', checkOut: '',
  pricePerNight: 0, extraCharges: [],
  discount: 0, notes: '', paymentMethod: 'Cash',
}

export default function BillGenerator() {
  const [bill, setBill] = useState<BillData>(empty)
  const [preview, setPreview] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const set = (k: keyof BillData, v: any) => setBill(p => ({ ...p, [k]: v }))

  const nights = bill.checkIn && bill.checkOut
    ? Math.max(differenceInDays(new Date(bill.checkOut), new Date(bill.checkIn)), 0) : 0
  const roomTotal = nights * bill.pricePerNight
  const extrasTotal = bill.extraCharges.reduce((s, c) => s + c.amount, 0)
  const subtotal = roomTotal + extrasTotal
  const discountAmt = bill.discount
  const grandTotal = subtotal - discountAmt

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
body{font-family:'Segoe UI',system-ui,sans-serif;color:#1a1a1a;background:#fff;padding:40px;max-width:800px;margin:0 auto}
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
.inv-totals{display:flex;justify-content:flex-end;margin-bottom:32px}
.inv-totals-box{width:280px}
.inv-total-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#6b7280}
.inv-total-row.grand{border-top:2px solid #c9a84c;margin-top:8px;padding-top:12px;font-size:18px;font-weight:800;color:#1a1a1a}
.inv-notes{background:#fffbeb;border:1px solid #fef3c7;border-radius:8px;padding:14px;font-size:12px;color:#92400e;line-height:1.7;margin-bottom:32px}
.inv-footer{text-align:center;padding-top:24px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af}
.inv-footer strong{color:#c9a84c}
@media print{body{padding:20px}button{display:none!important}}
</style></head><body>
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

  return (
    <div>
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
            </div>
          </div>

          {/* Actions */}
          <button
            onClick={handlePrint}
            disabled={!bill.guestName || !bill.propertyName || !bill.checkIn || !bill.checkOut || nights <= 0}
            style={{
              width: '100%', padding: '0.975rem', borderRadius: '9999px', border: 'none',
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

      {/* ═══ HIDDEN PRINT TEMPLATE ═══ */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div ref={printRef}>
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
            </div>
          </div>

          <div className="inv-total-row" style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            <span>Payment Method: <strong style={{ color: '#1a1a1a' }}>{bill.paymentMethod}</strong></span>
          </div>

          {bill.notes && <div className="inv-notes">{bill.notes}</div>}

          <div className="inv-footer">
            Thank you for choosing <strong>Cozy B&B</strong>. We hope you enjoyed your stay!
          </div>
        </div>
      </div>
    </div>
  )
}
