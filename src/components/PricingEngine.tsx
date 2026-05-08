'use client'
import { useState, useTransition } from 'react'

interface Suggestion {
  propertyId: string; propertyName: string; currentPrice: number; suggestedPrice: number;
  suggestion: string; type: 'increase' | 'decrease' | 'neutral'; weekendInsight: string; occupancy30: number;
}

export default function PricingEngine({ suggestions, onApply }: { suggestions: Suggestion[]; onApply: (id: string, price: number) => Promise<void> }) {
  const [applied, setApplied] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const apply = (id: string, price: number) => {
    startTransition(async () => {
      await onApply(id, price)
      setApplied(prev => new Set(prev).add(id))
    })
  }

  const typeStyles: Record<string, { bg: string; border: string; icon: string; color: string }> = {
    increase: { bg: '#f0fdf4', border: '#bbf7d0', icon: 'trending_up', color: '#16a34a' },
    decrease: { bg: '#fef2f2', border: '#fecaca', icon: 'trending_down', color: '#dc2626' },
    neutral: { bg: '#f8fafc', border: '#e2e8f0', icon: 'trending_flat', color: '#64748b' },
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
      {suggestions.map(s => {
        const st = typeStyles[s.type]
        const diff = s.suggestedPrice - s.currentPrice
        const diffPct = Math.round((diff / s.currentPrice) * 100)
        const done = applied.has(s.propertyId)
        return (
          <div key={s.propertyId} style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{s.propertyName}</div>
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>calendar_month</span>
                  {s.occupancy30}% occupancy (30d)
                </div>
              </div>
              <div style={{ background: st.bg, border: `1px solid ${st.border}`, borderRadius: '8px', padding: '0.375rem 0.625rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: st.color }}>{st.icon}</span>
                <span style={{ fontSize: '0.625rem', fontWeight: 700, color: st.color, textTransform: 'uppercase' }}>{s.type}</span>
              </div>
            </div>
            {/* Prices */}
            <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8', marginBottom: '0.25rem' }}>Current</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{s.currentPrice.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: st.color }}>arrow_forward</span>
                {diff !== 0 && <span style={{ fontSize: '0.625rem', fontWeight: 700, color: st.color }}>{diff > 0 ? '+' : ''}{diffPct}%</span>}
              </div>
              <div>
                <div style={{ fontSize: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: st.color, marginBottom: '0.25rem' }}>Suggested</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: st.color }}>₹{s.suggestedPrice.toLocaleString('en-IN')}</div>
              </div>
            </div>
            {/* Insight */}
            <div style={{ padding: '0 1.25rem 0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', lineHeight: 1.6 }}>{s.suggestion}</p>
              {s.weekendInsight && <p style={{ fontSize: '0.6875rem', color: '#d97706', marginTop: '0.375rem' }}>{s.weekendInsight}</p>}
            </div>
            {/* Action */}
            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              {done ? (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#16a34a', padding: '0.375rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '0.25rem' }}>check_circle</span>
                  Price updated!
                </div>
              ) : s.type === 'neutral' ? (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', padding: '0.375rem' }}>No change needed</div>
              ) : (
                <button onClick={() => apply(s.propertyId, s.suggestedPrice)} disabled={isPending} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: 'none', background: st.color, color: '#fff', fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'pointer', transition: 'opacity 0.2s' }}>
                  Apply ₹{s.suggestedPrice.toLocaleString('en-IN')}/night
                </button>
              )}
            </div>
          </div>
        )
      })}
      {suggestions.length === 0 && <p style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' }}>No properties found. Add properties and bookings first.</p>}
    </div>
  )
}
