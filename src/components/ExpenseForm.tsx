'use client'

import { addExpense } from '@/actions/expenseActions'
import { useState, useRef } from 'react'
import { showToast } from '@/components/Toast'

export default function ExpenseForm({ properties }: { properties: any[] }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) setReceiptUrl(data.url)
    } catch { showToast('Upload failed', 'error') }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    formData.set('receiptUrl', receiptUrl)
    const result = await addExpense(formData)
    if (result && result.success) {
      showToast('Expense logged successfully!', 'success')
      formRef.current?.reset()
      setReceiptUrl('')
    } else {
      showToast('Failed to log expense', 'error')
    }
    setSubmitting(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {error && <div style={{ background: '#FEF2F2', color: 'var(--danger)', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.8125rem', border: '1px solid rgba(220,38,38,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{error}</div>}

      <div className="form-group">
        <label className="form-label">Property</label>
        <select name="propertyId" className="form-select" required>
          <option value="">Select property</option>
          {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input name="description" className="form-input" required placeholder="e.g. Deep cleaning" />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Amount (₹)</label>
          <input type="number" step="1" name="amount" className="form-input" required placeholder="500" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="form-label">Category</label>
          <select name="category" className="form-select" required>
            <option value="CLEANING">Cleaning</option>
            <option value="REPAIR">Repair</option>
            <option value="UTILITY">Utility</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input type="date" name="date" className="form-input" required />
      </div>

      <div className="form-group">
        <label className="form-label">Receipt (optional)</label>
        <input type="file" accept="image/*" onChange={handleUpload} style={{ fontSize: '0.8125rem' }} />
        {uploading && <p style={{ fontSize: '0.6875rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Uploading...</p>}
        {receiptUrl && (
          <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src={receiptUrl} alt="Receipt" style={{ width: 48, height: 48, borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border)' }} />
            <span style={{ fontSize: '0.6875rem', color: '#16a34a', fontWeight: 600 }}>Uploaded ✓</span>
          </div>
        )}
      </div>

      <button type="submit" className={`btn btn-primary ${submitting ? 'btn-loading' : ''}`} style={{ width: '100%' }} disabled={submitting || uploading}>
        {submitting ? 'Logging Expense...' : 'Log Expense'}
      </button>
    </form>
  )
}
