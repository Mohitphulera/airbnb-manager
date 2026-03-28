'use client'

import { useState } from 'react'
import { deleteExpense, updateExpense } from '@/actions/expenseActions'
import { showToast } from '@/components/Toast'

const catColor: Record<string, string> = { CLEANING: 'badge-blue', REPAIR: 'badge-yellow', UTILITY: 'badge-green', OTHER: 'badge-gray' }

interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  property: { name: string }
}

export default function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const startEdit = (e: Expense) => {
    setEditingId(e.id)
    setEditData({
      description: e.description,
      amount: e.amount,
      category: e.category,
      date: new Date(e.date).toISOString().split('T')[0],
    })
  }

  const handleSave = async (id: string) => {
    setSaving(true)
    try {
      await updateExpense(id, editData)
      showToast('Expense updated', 'success')
      setEditingId(null)
    } catch {
      showToast('Failed to update', 'error')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    setDeletingId(id)
    try {
      await deleteExpense(id)
      showToast('Expense deleted', 'success')
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
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Date</th>
            <th style={{ minWidth: '120px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(e => {
            const isEditing = editingId === e.id

            if (isEditing) {
              return (
                <tr key={e.id} style={{ background: 'rgba(37,99,235,0.04)' }}>
                  <td style={{ fontWeight: 600 }}>{e.property.name}</td>
                  <td>
                    <input className="form-input" value={editData.description} onChange={ev => setEditData(d => ({ ...d, description: ev.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td>
                    <select className="form-select" value={editData.category} onChange={ev => setEditData(d => ({ ...d, category: ev.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem' }}>
                      <option value="CLEANING">Cleaning</option>
                      <option value="REPAIR">Repair</option>
                      <option value="UTILITY">Utility</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-input" value={editData.amount} onChange={ev => setEditData(d => ({ ...d, amount: ev.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem', width: '80px' }} />
                  </td>
                  <td>
                    <input type="date" className="form-input" value={editData.date} onChange={ev => setEditData(d => ({ ...d, date: ev.target.value }))} style={{ fontSize: '0.75rem', padding: '0.25rem 0.375rem' }} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => handleSave(e.id)} disabled={saving} className="btn btn-primary" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
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
              <tr key={e.id}>
                <td style={{ fontWeight: 600 }}>{e.property.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{e.description}</td>
                <td><span className={`badge ${catColor[e.category] || 'badge-gray'}`}>{e.category}</span></td>
                <td style={{ fontWeight: 700, color: '#B45309' }}>₹{e.amount.toLocaleString('en-IN')}</td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => startEdit(e)} className="btn btn-outline" style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                      <span className="material-icons-outlined" style={{ fontSize: '14px' }}>edit</span>
                    </button>
                    <button onClick={() => handleDelete(e.id)} disabled={deletingId === e.id} className={`btn btn-danger ${deletingId === e.id ? 'btn-loading' : ''}`} style={{ fontSize: '0.6875rem', padding: '0.25rem 0.5rem' }}>
                      {deletingId === e.id ? '...' : 'Remove'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {expenses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No expenses recorded</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
