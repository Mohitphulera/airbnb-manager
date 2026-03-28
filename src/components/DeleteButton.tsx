'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'

interface DeleteButtonProps {
  id: string
  action: (id: string) => Promise<void>
  label?: string
  confirmMessage?: string
}

export default function DeleteButton({ id, action, label = 'Remove', confirmMessage = 'Are you sure you want to delete this?' }: DeleteButtonProps) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(confirmMessage)) return
    setDeleting(true)
    try {
      await action(id)
      showToast('Deleted successfully', 'success')
    } catch {
      showToast('Failed to delete', 'error')
    }
    setDeleting(false)
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className={`btn btn-danger ${deleting ? 'btn-loading' : ''}`}
      style={{ fontSize: '0.75rem', padding: '0.3rem 0.625rem' }}
    >
      {deleting ? '...' : label}
    </button>
  )
}
