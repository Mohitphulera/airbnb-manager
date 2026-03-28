'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'

interface EditableRowProps {
  record: Record<string, any>
  fields: { key: string; label: string; type?: 'text' | 'number' | 'date' | 'select'; options?: { value: string; label: string }[]; editable?: boolean }[]
  onSave: (id: string, data: Record<string, any>) => Promise<void>
  renderActions?: (record: Record<string, any>, isEditing: boolean) => React.ReactNode
  children?: React.ReactNode
}

export default function EditableRow({ record, fields, onSave, renderActions, children }: EditableRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<Record<string, any>>({})

  const startEdit = () => {
    const data: Record<string, any> = {}
    fields.forEach(f => {
      if (f.editable !== false) {
        let val = record[f.key]
        if (f.type === 'date' && val) {
          val = new Date(val).toISOString().split('T')[0]
        }
        data[f.key] = val ?? ''
      }
    })
    setEditData(data)
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(record.id, editData)
      showToast('Updated successfully', 'success')
      setIsEditing(false)
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  if (!isEditing) {
    return (
      <tr>
        {children}
        <td>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button type="button" onClick={startEdit} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
              <span className="material-icons-outlined" style={{ fontSize: '14px' }}>edit</span>
            </button>
            {renderActions?.(record, false)}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ background: 'rgba(37,99,235,0.04)' }}>
      {fields.map(f => (
        <td key={f.key}>
          {f.editable === false ? (
            <span>{f.type === 'date' && record[f.key] ? new Date(record[f.key]).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : String(record[f.key] ?? '—')}</span>
          ) : f.type === 'select' && f.options ? (
            <select
              value={editData[f.key] || ''}
              onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="form-select"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', minWidth: '80px' }}
            >
              {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input
              type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
              value={editData[f.key] ?? ''}
              onChange={e => setEditData(prev => ({ ...prev, [f.key]: f.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))}
              className="form-input"
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', minWidth: f.type === 'date' ? '130px' : '70px' }}
              step={f.type === 'number' ? 'any' : undefined}
            />
          )}
        </td>
      ))}
      <td>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button type="button" onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
            {saving ? '...' : 'Save'}
          </button>
          <button type="button" onClick={cancelEdit} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
            Cancel
          </button>
        </div>
      </td>
    </tr>
  )
}
