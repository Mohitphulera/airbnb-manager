'use client'

import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('cozy-dark-mode')
    if (saved === 'true') {
      setDark(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('cozy-dark-mode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('cozy-dark-mode', 'false')
    }
  }

  return (
    <button
      onClick={toggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        background: 'none',
        border: '1.5px solid var(--border)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1rem',
        transition: 'all 0.2s ease',
      }}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
