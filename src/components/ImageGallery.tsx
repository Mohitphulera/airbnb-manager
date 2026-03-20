'use client'

import { useState } from 'react'

export default function ImageGallery({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0)

  if (!urls || urls.length === 0) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--surface)', fontSize: '0.875rem' }}>
        No photos yet
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', backgroundImage: `url(${urls[index]})`, backgroundSize: 'cover', backgroundPosition: 'center', transition: 'background-image 0.3s ease' }} />

      {urls.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIndex(i => (i - 1 + urls.length) % urls.length) }}
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', color: '#222', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.18)', opacity: 0.8, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
          >‹</button>
          <button onClick={(e) => { e.stopPropagation(); setIndex(i => (i + 1) % urls.length) }}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', border: 'none', color: '#222', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.18)', opacity: 0.8, transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
          >›</button>

          <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
            {urls.map((_, i) => (
              <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === index ? '#fff' : 'rgba(255,255,255,0.5)', transition: 'background 0.2s' }} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
