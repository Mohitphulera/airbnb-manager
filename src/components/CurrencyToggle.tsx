'use client'
import { useState } from 'react'

const RATES: Record<string, { symbol: string; rate: number }> = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 1 / 83 },
  EUR: { symbol: '€', rate: 1 / 90 },
}

export function CurrencyProvider({ children, baseAmount }: { children: (fmt: (amt: number) => string, currency: string) => React.ReactNode; baseAmount?: number }) {
  const [currency, setCurrency] = useState('INR')
  const { symbol, rate } = RATES[currency]
  const fmt = (amt: number) => `${symbol}${(amt * rate).toLocaleString('en-IN', { maximumFractionDigits: currency === 'INR' ? 0 : 2 })}`

  return (
    <div>
      <div style={{ display: 'inline-flex', background: '#f1f5f9', borderRadius: '8px', padding: '0.2rem', marginBottom: '0.5rem', gap: '0.125rem' }}>
        {Object.keys(RATES).map(c => (
          <button key={c} onClick={() => setCurrency(c)} style={{
            padding: '0.3rem 0.625rem', borderRadius: '6px', border: 'none', fontSize: '0.6875rem', fontWeight: 600,
            cursor: 'pointer', background: currency === c ? '#fff' : 'transparent',
            color: currency === c ? '#1e293b' : '#94a3b8', boxShadow: currency === c ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s',
          }}>{c}</button>
        ))}
      </div>
      {children(fmt, currency)}
    </div>
  )
}

export function CurrencyToggle({ amount }: { amount: number }) {
  const [currency, setCurrency] = useState('INR')
  const { symbol, rate } = RATES[currency]
  const converted = amount * rate

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <span>{symbol}{converted.toLocaleString('en-IN', { maximumFractionDigits: currency === 'INR' ? 0 : 2 })}</span>
      <button onClick={() => { const keys = Object.keys(RATES); setCurrency(keys[(keys.indexOf(currency) + 1) % keys.length]) }}
        style={{ background: '#f1f5f9', border: 'none', borderRadius: '4px', padding: '0.125rem 0.375rem', fontSize: '0.5625rem', fontWeight: 700, color: '#64748b', cursor: 'pointer', letterSpacing: '0.05em' }}
        title="Toggle currency">{currency}</button>
    </span>
  )
}
