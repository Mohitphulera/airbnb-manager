'use client'

import { useState } from 'react'

export default function ImageGallery({ urls }: { urls: string[] }) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(false)

  if (!urls || urls.length === 0) {
    return (
      <div style={{
        width: '100%', height: '100%', minHeight: '180px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)', background: 'var(--surface, #f1f5f9)',
        fontSize: '0.875rem'
      }}>
        No photos yet
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
      {/* Real <img> tag for reliable rendering */}
      <img
        src={urls[index]}
        alt="Property"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          const target = e.currentTarget
          target.style.display = 'none'
        }}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          display: 'block', transition: 'opacity 0.3s ease',
          opacity: loaded ? 1 : 0,
        }}
      />

      {/* Skeleton placeholder while loading */}
      {!loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s ease-in-out infinite',
        }} />
      )}

      {urls.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLoaded(false); setIndex(i => (i - 1 + urls.length) % urls.length) }}
            style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.92)', border: 'none', color: '#1a1a1a', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: 0, transition: 'opacity 0.2s ease' }}
            className="gallery-nav-btn"
          >‹</button>
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLoaded(false); setIndex(i => (i + 1) % urls.length) }}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.92)', border: 'none', color: '#1a1a1a', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', opacity: 0, transition: 'opacity 0.2s ease' }}
            className="gallery-nav-btn"
          >›</button>

          <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px' }}>
            {urls.map((_, i) => (
              <div key={i} style={{
                width: i === index ? '16px' : '6px', height: '6px',
                borderRadius: '3px',
                background: i === index ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.25s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            ))}
          </div>
        </>
      )}

      <style>{`
        .gallery-nav-btn { opacity: 0 !important; }
        div:hover > .gallery-nav-btn { opacity: 1 !important; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}
