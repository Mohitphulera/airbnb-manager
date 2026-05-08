'use client'
import { useState, useTransition } from 'react'
import { addInventoryItem, updateStock, deleteInventoryItem } from '@/actions/inventoryActions'

const CATS: Record<string, { color: string; bg: string }> = { TOILETRIES: { color: '#7c3aed', bg: '#f5f3ff' }, LINEN: { color: '#2563eb', bg: '#eff6ff' }, KITCHEN: { color: '#d97706', bg: '#fffbeb' }, CLEANING: { color: '#16a34a', bg: '#f0fdf4' }, OTHER: { color: '#64748b', bg: '#f8fafc' } }

interface Item { id: string; name: string; property: string; category: string; quantity: number; minStock: number; unit: string; lastRefilled: string | null }

export default function InventoryTracker({ items: initial, properties }: { items: Item[]; properties: string[] }) {
  const [items] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [filter, setFilter] = useState('')
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ name: '', property: '', category: 'TOILETRIES', quantity: 0, minStock: 5, unit: 'pcs' })
  const [restockId, setRestockId] = useState<string | null>(null)
  const [restockQty, setRestockQty] = useState(0)

  const S = {
    input: { width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties,
    label: { display: 'block', fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#64748b', marginBottom: '0.25rem' },
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    btn: { padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
  }

  const filtered = filter ? items.filter(i => i.property === filter) : items
  const lowStock = items.filter(i => i.quantity <= i.minStock)

  const handleAdd = () => {
    if (!form.name || !form.property) return
    startTransition(async () => { await addInventoryItem(form); setShowAdd(false); window.location.reload() })
  }

  const handleRestock = (id: string) => {
    startTransition(async () => { await updateStock(id, restockQty); setRestockId(null); window.location.reload() })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete item?')) return
    startTransition(async () => { await deleteInventoryItem(id); window.location.reload() })
  }

  return (
    <div>
      {/* Alerts */}
      {lowStock.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#dc2626' }}>warning</span>
          <div>
            <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: '#991b1b' }}>{lowStock.length} item{lowStock.length > 1 ? 's' : ''} low on stock</span>
            <span style={{ fontSize: '0.6875rem', color: '#b91c1c', marginLeft: '0.5rem' }}>{lowStock.map(i => i.name).join(', ')}</span>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...S.input, width: 'auto', minWidth: '160px' }}>
          <option value="">All Properties</option>
          {properties.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, background: 'var(--gradient-primary)', color: '#fff' }}>+ Add Item</button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Item', 'Property', 'Category', 'Stock', 'Min', 'Status', 'Last Refilled', 'Actions'].map(h => (
                <th key={h} style={{ padding: '0.625rem 0.875rem', fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const isLow = item.quantity <= item.minStock
              const cat = CATS[item.category] || CATS.OTHER
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 0.875rem', fontWeight: 600, fontSize: '0.8125rem' }}>{item.name}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#6b7280' }}>{item.property}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}><span style={{ padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.5625rem', fontWeight: 700, background: cat.bg, color: cat.color }}>{item.category}</span></td>
                  <td style={{ padding: '0.75rem 0.875rem', fontWeight: 700, fontSize: '0.875rem', color: isLow ? '#dc2626' : '#1e293b' }}>
                    {restockId === item.id ? <input type="number" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} style={{ width: '60px', padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '0.8125rem' }} autoFocus /> : <>{item.quantity} <span style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 400 }}>{item.unit}</span></>}
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.75rem', color: '#94a3b8' }}>{item.minStock}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    {isLow ? <span style={{ padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.5625rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626' }}>LOW</span> : <span style={{ padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.5625rem', fontWeight: 700, background: '#f0fdf4', color: '#16a34a' }}>OK</span>}
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem', fontSize: '0.6875rem', color: '#94a3b8' }}>{item.lastRefilled ? new Date(item.lastRefilled).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      {restockId === item.id ? (
                        <>
                          <button onClick={() => handleRestock(item.id)} disabled={isPending} style={{ ...S.btn, padding: '0.2rem 0.5rem', fontSize: '0.625rem', background: '#16a34a', color: '#fff' }}>Save</button>
                          <button onClick={() => setRestockId(null)} style={{ ...S.btn, padding: '0.2rem 0.5rem', fontSize: '0.625rem', background: '#f1f5f9', color: '#64748b' }}>✕</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setRestockId(item.id); setRestockQty(item.quantity) }} style={{ ...S.btn, padding: '0.2rem 0.5rem', fontSize: '0.625rem', background: '#eff6ff', color: '#2563eb' }}>Restock</button>
                          <button onClick={() => handleDelete(item.id)} style={{ ...S.btn, padding: '0.2rem 0.5rem', fontSize: '0.625rem', background: 'none', color: '#ef4444' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No inventory items</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={S.overlay} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Add Inventory Item</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><label style={S.label}>Item Name *</label><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={S.input} placeholder="e.g. Towels" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div><label style={S.label}>Property *</label><select value={form.property} onChange={e => setForm(f => ({ ...f, property: e.target.value }))} style={S.input}><option value="">Select</option>{properties.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label style={S.label}>Category</label><select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={S.input}><option>TOILETRIES</option><option>LINEN</option><option>KITCHEN</option><option>CLEANING</option><option>OTHER</option></select></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div><label style={S.label}>Quantity</label><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={S.input} /></div>
                <div><label style={S.label}>Min Stock</label><input type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: Number(e.target.value) }))} style={S.input} /></div>
                <div><label style={S.label}>Unit</label><select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={S.input}><option>pcs</option><option>sets</option><option>bottles</option><option>rolls</option><option>kg</option></select></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={handleAdd} disabled={isPending || !form.name || !form.property} style={{ ...S.btn, background: 'var(--gradient-primary)', color: '#fff', flex: 1 }}>{isPending ? 'Adding...' : 'Add Item'}</button>
              <button onClick={() => setShowAdd(false)} style={{ ...S.btn, background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
