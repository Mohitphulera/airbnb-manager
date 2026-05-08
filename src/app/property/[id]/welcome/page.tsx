import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function WelcomePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const property = await prisma.property.findUnique({ where: { id } })
  if (!property) return notFound()

  const images: string[] = property.imageUrls ? JSON.parse(property.imageUrls) : []
  const rules: string[] = property.houseRules ? JSON.parse(property.houseRules) : ['Check-in after 2:00 PM', 'Check-out before 11:00 AM', 'No smoking inside the property', 'No parties or loud music after 10 PM', 'Please keep the property clean', 'Carry a valid photo ID']
  const guide: { name: string; type: string; distance: string }[] = property.localGuide ? JSON.parse(property.localGuide) : []

  const S = {
    section: { background: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' } as React.CSSProperties,
    title: { fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: '#c9a84c', marginBottom: '0.875rem' },
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)' }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
        {images[0] && <img src={images[0]} alt={property.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem', color: '#fff' }}>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c9a84c', marginBottom: '0.25rem' }}>Welcome to</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>{property.name}</h1>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.25rem' }}>{property.location}</p>
        </div>
      </div>

      <div style={{ padding: '1rem', maxWidth: '480px', margin: '0 auto', marginTop: '-1.5rem', position: 'relative', zIndex: 1 }}>
        {/* WiFi */}
        {(property.wifiName || property.wifiPassword) && (
          <div style={S.section}>
            <div style={S.title}>📶 WiFi</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.125rem' }}>Network</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{property.wifiName || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.125rem' }}>Password</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{property.wifiPassword || '—'}</div>
              </div>
            </div>
          </div>
        )}

        {/* House Rules */}
        <div style={S.section}>
          <div style={S.title}>📋 House Rules</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {rules.map((r, i) => (
              <li key={i} style={{ padding: '0.5rem 0', borderBottom: i < rules.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.8125rem', color: '#374151', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.5 }}>
                <span style={{ color: '#c9a84c', fontWeight: 700, flexShrink: 0 }}>•</span>{r}
              </li>
            ))}
          </ul>
        </div>

        {/* Local Guide */}
        {guide.length > 0 && (
          <div style={S.section}>
            <div style={S.title}>📍 Local Guide</div>
            {guide.map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: i < guide.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{g.name}</div>
                  <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>{g.type}</div>
                </div>
                <span style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: 600 }}>{g.distance}</span>
              </div>
            ))}
          </div>
        )}

        {/* Emergency */}
        <div style={S.section}>
          <div style={S.title}>🚨 Emergency Contacts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {property.emergencyPhone && (
              <a href={`tel:${property.emergencyPhone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px', textDecoration: 'none', color: '#166534', fontWeight: 600, fontSize: '0.8125rem' }}>
                📞 Host: {property.emergencyPhone}
              </a>
            )}
            {property.whatsappNumber && (
              <a href={`https://wa.me/${property.whatsappNumber.replace(/\D/g, '')}`} target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px', textDecoration: 'none', color: '#166534', fontWeight: 600, fontSize: '0.8125rem' }}>
                💬 WhatsApp: {property.whatsappNumber}
              </a>
            )}
            <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: '10px', fontSize: '0.75rem', color: '#991b1b' }}>
              Police: 100 · Ambulance: 108 · Fire: 101
            </div>
          </div>
        </div>

        {/* Checkout */}
        <div style={S.section}>
          <div style={S.title}>✅ Checkout Checklist</div>
          {['Return all keys to the lockbox', 'Turn off all ACs and fans', 'Close all windows and doors', 'Check for personal belongings', 'Place used towels in the bathroom'].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0', fontSize: '0.8125rem', color: '#374151' }}>
              <span style={{ width: 18, height: 18, borderRadius: '4px', border: '2px solid #e5e7eb', flexShrink: 0 }} />
              {item}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '1.5rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.6875rem' }}>
          Thank you for choosing <strong style={{ color: '#c9a84c' }}>Cozy B&B</strong>
        </div>
      </div>
    </div>
  )
}
