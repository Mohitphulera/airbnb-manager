'use client'

import { useState } from 'react'
import { deleteSaleProperty, updateSaleProperty, updateSalePropertyStatus } from '@/actions/salePropertyActions'
import { showToast } from '@/components/Toast'

const TYPE_LABELS: Record<string, string> = { APARTMENT: 'Apartment', VILLA: 'Villa', PLOT: 'Plot', COMMERCIAL: 'Commercial', FARMHOUSE: 'Farmhouse' }
const STATUS_BADGE: Record<string, string> = { AVAILABLE: 'badge-green', SOLD: 'badge-gray', UNDER_NEGOTIATION: 'badge-yellow' }

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`
  return `₹${price.toLocaleString('en-IN')}`
}

interface SaleProperty {
  id: string
  title: string
  description: string
  location: string
  price: number
  area: number | null
  bedrooms: number | null
  bathrooms: number | null
  propertyType: string
  status: string
  features: string | null
  whatsappNumber: string | null
}

export default function SalePropertyTable({ properties }: { properties: SaleProperty[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const startEdit = (p: SaleProperty) => {
    setEditingId(p.id)
    setEditData({
      title: p.title,
      location: p.location,
      price: p.price,
      propertyType: p.propertyType,
      status: p.status,
      area: p.area ?? '',
      bedrooms: p.bedrooms ?? '',
      bathrooms: p.bathrooms ?? '',
    })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await updateSaleProperty(id, editData)
      showToast('Property updated', 'success')
      setEditingId(null)
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sale property?')) return
    setDeletingId(id)
    try {
      await deleteSaleProperty(id)
      showToast('Property deleted', 'success')
    } catch {
      showToast('Failed to delete', 'error')
    }
    setDeletingId(null)
  }

  const cycleStatus = async (id: string, currentStatus: string) => {
    const next = currentStatus === 'AVAILABLE' ? 'UNDER_NEGOTIATION' : currentStatus === 'UNDER_NEGOTIATION' ? 'SOLD' : 'AVAILABLE'
    try {
      await updateSalePropertyStatus(id, next)
      showToast(`Status → ${next.replace('_', ' ')}`, 'success')
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Property</th>
            <th>Location</th>
            <th>Type</th>
            <th>Price</th>
            <th>Details</th>
            <th>Status</th>
            <th style={{ minWidth: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {properties.map(p => {
            const isEditing = editingId === p.id

            if (isEditing) {
              return (
                <tr key={p.id} style={{ background: 'rgba(37,99,235,0.04)' }}>
                  <td>
                    <input className="form-input" value={editData.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td>
                    <input className="form-input" value={editData.location} onChange={e => setEditData(d => ({ ...d, location: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td>
                    <select className="form-select" value={editData.propertyType} onChange={e => setEditData(d => ({ ...d, propertyType: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                      {Object.keys(TYPE_LABELS).map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-input" value={editData.price} onChange={e => setEditData(d => ({ ...d, price: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', width: '100px' }} />
                  </td>
                  <td style={{ fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      <input type="number" className="form-input" value={editData.area} onChange={e => setEditData(d => ({ ...d, area: e.target.value }))} placeholder="sqft" style={{ fontSize: '0.6875rem', padding: '0.2rem', width: '60px' }} />
                      <input type="number" className="form-input" value={editData.bedrooms} onChange={e => setEditData(d => ({ ...d, bedrooms: e.target.value }))} placeholder="BHK" style={{ fontSize: '0.6875rem', padding: '0.2rem', width: '40px' }} />
                      <input type="number" className="form-input" value={editData.bathrooms} onChange={e => setEditData(d => ({ ...d, bathrooms: e.target.value }))} placeholder="Bath" style={{ fontSize: '0.6875rem', padding: '0.2rem', width: '40px' }} />
                    </div>
                  </td>
                  <td>
                    <select className="form-select" value={editData.status} onChange={e => setEditData(d => ({ ...d, status: e.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                      <option value="AVAILABLE">Available</option>
                      <option value="UNDER_NEGOTIATION">Negotiation</option>
                      <option value="SOLD">Sold</option>
                    </select>
                  </td>
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
                <td style={{ fontWeight: 600, maxWidth: '180px' }}>{p.title}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{p.location}</td>
                <td><span style={{ fontSize: '0.8125rem' }}>{TYPE_LABELS[p.propertyType] || p.propertyType}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--cozy-success)', whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {p.area && <span>{p.area} sqft</span>}
                  {p.bedrooms && <span> · {p.bedrooms} BHK</span>}
                  {p.bathrooms && <span> · {p.bathrooms} Bath</span>}
                </td>
                <td>
                  <button onClick={() => cycleStatus(p.id, p.status)} className={`badge ${STATUS_BADGE[p.status] || 'badge-gray'}`} style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}>
                    {p.status.replace('_', ' ')}
                  </button>
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
          {properties.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No properties listed for sale yet</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
