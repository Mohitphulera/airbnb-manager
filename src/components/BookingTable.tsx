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
