'use client'
import { useState, useTransition } from 'react'
import { createReferral, toggleReferral, deleteReferral } from '@/actions/referralActions'

interface Ref { id: string; referrerName: string; referrerPhone: string; code: string; discountPct: number; timesUsed: number; isActive: boolean; createdAt: string }

export default function ReferralManager({ referrals: initial }: { referrals: Ref[] }) {
  const [referrals] = useState(initial)
  const [showAdd, setShowAdd] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({ referrerName: '', referrerPhone: '', discountPct: 10 })
  const [copied, setCopied] = useState<string | null>(null)

  const S = {
    input: { width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties,
    label: { display: 'block', fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#64748b', marginBottom: '0.25rem' },
    btn: { padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  }

  const handleCreate = () => {
    if (!form.referrerName || !form.referrerPhone) return
    startTransition(async () => { await createReferral(form); setShowAdd(false); setForm({ referrerName: '', referrerPhone: '', discountPct: 10 }); window.location.reload() })
  }

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); setCopied(code); setTimeout(() => setCopied(null), 2000) }

  const totalRedeemed = referrals.reduce((s, r) => s + r.timesUsed, 0)

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[{ l: 'Total Codes', v: referrals.length, c: '#1e293b' }, { l: 'Active', v: referrals.filter(r => r.isActive).length, c: '#16a34a' }, { l: 'Times Redeemed', v: totalRedeemed, c: '#c9a84c' }].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.375rem' }}>{s.l}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => setShowAdd(true)} style={{ ...S.btn, background: 'var(--gradient-primary)', color: '#fff' }}>+ Create Referral Code</button>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {referrals.map(r => (
          <div key={r.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', opacity: r.isActive ? 1 : 0.6 }}>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{r.referrerName}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{r.referrerPhone}</div>
                </div>
                <span style={{ padding: '0.125rem 0.5rem', borderRadius: '4px', fontSize: '0.5625rem', fontWeight: 700, background: r.isActive ? '#f0fdf4' : '#fef2f2', color: r.isActive ? '#16a34a' : '#dc2626' }}>{r.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              {/* Code */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.1em' }}>{r.code}</span>
                <button onClick={() => copyCode(r.code)} style={{ ...S.btn, padding: '0.25rem 0.625rem', fontSize: '0.625rem', background: copied === r.code ? '#16a34a' : '#e5e7eb', color: copied === r.code ? '#fff' : '#374151' }}>{copied === r.code ? 'Copied!' : 'Copy'}</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                <span>{r.discountPct}% discount</span>
                <span>Used {r.timesUsed} time{r.timesUsed !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.375rem' }}>
                <button onClick={() => startTransition(async () => { await toggleReferral(r.id, !r.isActive); window.location.reload() })} style={{ ...S.btn, padding: '0.3rem 0.625rem', fontSize: '0.625rem', background: r.isActive ? '#fef2f2' : '#f0fdf4', color: r.isActive ? '#dc2626' : '#16a34a', flex: 1 }}>{r.isActive ? 'Deactivate' : 'Activate'}</button>
                <button onClick={() => { if (confirm('Delete?')) startTransition(async () => { await deleteReferral(r.id); window.location.reload() }) }} style={{ ...S.btn, padding: '0.3rem 0.625rem', fontSize: '0.625rem', background: 'none', color: '#ef4444' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>delete</span></button>
              </div>
            </div>
          </div>
        ))}
        {referrals.length === 0 && <p style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>No referral codes yet. Create one to start your guest referral program.</p>}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div style={S.overlay} onClick={() => setShowAdd(false)}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Create Referral Code</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div><label style={S.label}>Guest Name *</label><input value={form.referrerName} onChange={e => setForm(f => ({ ...f, referrerName: e.target.value }))} style={S.input} placeholder="John Doe" /></div>
              <div><label style={S.label}>Phone *</label><input value={form.referrerPhone} onChange={e => setForm(f => ({ ...f, referrerPhone: e.target.value }))} style={S.input} placeholder="+91..." /></div>
              <div><label style={S.label}>Discount %</label><input type="number" value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: Number(e.target.value) }))} style={S.input} min={1} max={50} /></div>
            </div>
            <p style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.5rem' }}>A unique code will be auto-generated (e.g. COZYJOHN3X2)</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <button onClick={handleCreate} disabled={isPending || !form.referrerName || !form.referrerPhone} style={{ ...S.btn, background: 'var(--gradient-primary)', color: '#fff', flex: 1 }}>{isPending ? 'Creating...' : 'Create Code'}</button>
              <button onClick={() => setShowAdd(false)} style={{ ...S.btn, background: '#f1f5f9', color: '#64748b' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
