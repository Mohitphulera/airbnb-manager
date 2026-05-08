'use client'

import { useState } from 'react'
import { deleteBooking, updateBooking } from '@/actions/bookingActions'
import CleaningStatusToggle from '@/components/CleaningStatusToggle'
import { showToast } from '@/components/Toast'

interface Booking {
  id: string
  customerName: string
  customerPhone: string | null
  checkInDate: string
  checkOutDate: string
  totalAmount: number
  source: string
  commissionOwed: number | null
  cleaningStatus: string
  notes: string | null
  property: { name: string; type: string }
}

export default function BookingTable({ bookings }: { bookings: Booking[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const startEdit = (b: Booking) => {
    setEditingId(b.id)
    setEditData({
      customerName: b.customerName,
      customerPhone: b.customerPhone ?? '',
      source: b.source,
      totalAmount: b.totalAmount,
      notes: b.notes ?? '',
    })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await updateBooking(id, editData)
      showToast('Booking updated', 'success')
      setEditingId(null)
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this booking?')) return
    setDeletingId(id)
    try {
      await deleteBooking(id)
      showToast('Booking deleted', 'success')
    } catch {
      showToast('Failed to delete', 'error')
    }
    setDeletingId(null)
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Guest</th>
            <th>Dates</th>
            <th>Source</th>
            <th>Revenue</th>
            <th>Commission</th>
            <th>Cleaning</th>
            <th style={{ minWidth: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => {
            const isEditing = editingId === b.id

            if (isEditing) {
              return (
                <tr key={b.id} style={{ background: 'rgba(37,99,235,0.04)' }}>
                  <td style={{ fontWeight: 600 }}>{b.property.name}</td>
                  <td>
                    <input className="form-input" value={editData.customerName} onChange={e => setEditData(d => ({ ...d, customerName: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', marginBottom: '0.125rem' }} />
                    <input className="form-input" value={editData.customerPhone} onChange={e => setEditData(d => ({ ...d, customerPhone: e.target.value }))} placeholder="Phone" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <select className="form-select" value={editData.source} onChange={e => setEditData(d => ({ ...d, source: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                      <option value="DIRECT">Direct</option>
                      <option value="AIRBNB">Airbnb</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-input" value={editData.totalAmount} onChange={e => setEditData(d => ({ ...d, totalAmount: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', width: '80px' }} />
                  </td>
                  <td style={{ color: '#ccc' }}>—</td>
                  <td><CleaningStatusToggle bookingId={b.id} currentStatus={b.cleaningStatus} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => handleSave(b.id)} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                        {saving ? '...' : 'Save'}
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              )
            }

            return (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.property.name}</div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.property.type === 'COMMISSION' ? 'Partner' : 'Owned'}</div>
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{b.customerName}</div>
                  {b.customerPhone && <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{b.customerPhone}</div>}
                  {b.notes && <div style={{ fontSize: '0.625rem', color: 'var(--primary)', marginTop: '0.125rem', fontStyle: 'italic' }}>{b.notes.length > 30 ? b.notes.slice(0, 30) + '…' : b.notes}</div>}
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(b.checkInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} → {new Date(b.checkOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <span className={`badge ${b.source === 'DIRECT' ? 'badge-green' : b.source === 'AIRBNB' ? 'badge-pink' : 'badge-gray'}`}>{b.source}</span>
                </td>
                <td style={{ fontWeight: 700, color: 'var(--cozy-success)' }}>₹{b.totalAmount.toLocaleString('en-IN')}</td>
                <td>
                  {b.commissionOwed !== null
                    ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>−₹{b.commissionOwed.toLocaleString('en-IN')}</span>
                    : <span style={{ color: '#ccc' }}>—</span>}
                </td>
                <td><CleaningStatusToggle bookingId={b.id} currentStatus={b.cleaningStatus} /></td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <WhatsAppMenu name={b.customerName} phone={b.customerPhone} property={b.property.name} checkIn={b.checkInDate} checkOut={b.checkOutDate} />
                    <button onClick={() => startEdit(b)} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '14px' }}>edit</span>
                    </button>
                    <button onClick={() => handleDelete(b.id)} disabled={deletingId === b.id} className={`btn btn-danger ${deletingId === b.id ? 'btn-loading' : ''}`} style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                      {deletingId === b.id ? '...' : 'Remove'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {bookings.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No bookings yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function WhatsAppMenu({ name, phone, property, checkIn, checkOut }: { name: string; phone: string | null; property: string; checkIn: string; checkOut: string }) {
  const [open, setOpen] = useState(false)
  if (!phone) return null

  const ci = new Date(checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const co = new Date(checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  const msgs = [
    { label: 'Check-in Info', icon: 'login', msg: `Hi ${name}! Welcome to ${property} 🏡\n\nCheck-in: ${ci} (after 2 PM)\nAddress: [Property Address]\nWiFi: [Network] / [Password]\nLockbox Code: [Code]\n\nReach out if you need anything!` },
    { label: 'Checkout Reminder', icon: 'logout', msg: `Hi ${name}, hope you're enjoying ${property}! 😊\n\nJust a reminder — checkout is on ${co} before 11 AM.\nPlease leave the keys on the table.\n\nThank you for staying with us!` },
    { label: 'Review Request', icon: 'star', msg: `Hi ${name}! Thank you for staying at ${property} 🙏\n\nWe'd love your feedback! Could you leave us a quick review?\n\nYour review helps other travelers and means a lot to us. Thank you!` },
    { label: 'Thank You + Offer', icon: 'redeem', msg: `Hi ${name}! Thank you for choosing ${property} ❤️\n\nAs a valued guest, enjoy 10% off your next stay with us!\nJust mention "RETURNING GUEST" when you book directly.\n\nHope to see you again soon! — Cozy B&B` },
  ]
  const send = (msg: string) => { window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank'); setOpen(false) }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem', color: '#16a34a', borderColor: '#bbf7d0' }}>
        <span className="material-icons-outlined" style={{ fontSize: '14px' }}>chat</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '4px', background: '#fff', borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', zIndex: 20, width: '200px', overflow: 'hidden' }}>
            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', borderBottom: '1px solid #f1f5f9' }}>WhatsApp Message</div>
            {msgs.map((m, i) => (
              <button key={i} onClick={() => send(m.msg)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500, color: '#374151', textAlign: 'left', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f0fdf4')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <span className="material-icons-outlined" style={{ fontSize: '16px', color: '#16a34a' }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
