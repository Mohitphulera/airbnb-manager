'use client'

import { useState } from 'react'
import { deleteProperty, updateProperty } from '@/actions/propertyActions'
import { showToast } from '@/components/Toast'

interface Property {
  id: string
  name: string
  description: string
  location: string
  type: string
  pricePerNight: number
  commissionRate: number | null
  amenities: string | null
  whatsappNumber: string | null
}

export default function PropertyTable({ properties }: { properties: Property[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const startEdit = (p: Property) => {
    setEditingId(p.id)
    setEditData({
      name: p.name,
      location: p.location,
      type: p.type,
      pricePerNight: p.pricePerNight,
      commissionRate: p.commissionRate ?? '',
    })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await updateProperty(id, editData)
      showToast('Property updated', 'success')
      setEditingId(null)
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property and all its bookings/expenses?')) return
    setDeletingId(id)
    try {
      await deleteProperty(id)
      showToast('Property deleted', 'success')
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
            <th>Location</th>
            <th>Type</th>
            <th>Price/Night</th>
            <th>Amenities</th>
            <th style={{ minWidth: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(p => {
            let amenities: string[] = []
            try { if (p.amenities) amenities = JSON.parse(p.amenities) } catch {}
            const isEditing = editingId === p.id

            if (isEditing) {
              return (
                <tr key={p.id} style={{ background: 'rgba(37,99,235,0.04)' }}>
                  <td>
                    <input className="form-input" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td>
                    <input className="form-input" value={editData.location} onChange={e => setEditData(d => ({ ...d, location: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td>
                    <select className="form-select" value={editData.type} onChange={e => setEditData(d => ({ ...d, type: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                      <option value="OWNED">Owned</option>
                      <option value="COMMISSION">Partner</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-input" value={editData.pricePerNight} onChange={e => setEditData(d => ({ ...d, pricePerNight: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', width: '80px' }} />
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>—</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => handleSave(p.id)} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
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
              <tr key={p.id}>
                <td>
                  <div className="property-row-info">
                    <div className="property-row-thumb">
                      <span className="material-icons-outlined" style={{ color: '#94A3B8' }}>apartment</span>
                    </div>
                    <div className="property-row-name">{p.name}</div>
                  </div>
                </td>
                <td style={{ color: 'var(--text-muted)' }}>{p.location}</td>
                <td><span className={`badge ${p.type === 'OWNED' ? 'badge-blue' : 'badge-yellow'}`}>{p.type === 'OWNED' ? 'Owned' : 'Partner'}</span></td>
                <td style={{ fontWeight: 600 }}>₹{p.pricePerNight.toLocaleString('en-IN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                    {amenities.slice(0, 3).map((a: string) => <span key={a} className="badge badge-gray" style={{ fontSize: '0.5625rem' }}>{a}</span>)}
                    {amenities.length > 3 && <span className="badge badge-gray" style={{ fontSize: '0.5625rem' }}>+{amenities.length - 3}</span>}
                    {amenities.length === 0 && <span style={{ color: '#ccc', fontSize: '0.75rem' }}>—</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => startEdit(p)} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '14px' }}>edit</span>
                    </button>
                    <button onClick={() => handleDelete(p.id)} disabled={deletingId === p.id} className={`btn btn-danger ${deletingId === p.id ? 'btn-loading' : ''}`} style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                      {deletingId === p.id ? '...' : 'Remove'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {properties.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No properties added yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
