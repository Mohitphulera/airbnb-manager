'use client'

import { useState } from 'react'

export default function PropertyImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="st-card-placeholder">
        <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>apartment</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}
