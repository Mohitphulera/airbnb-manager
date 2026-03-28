'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileNav({ activePage = 'home' }: { activePage?: 'home' | 'investments' | 'login' }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Hamburger button — visible only on mobile via CSS */}
      <button
        className="st-hamburger"
        onClick={() => setOpen(!open)}
        aria-label="Open menu"
      >
        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
          {open ? 'close' : 'menu'}
        </span>
      </button>

      {/* Slide-down menu */}
      {open && (
        <div className="st-mobile-menu" onClick={() => setOpen(false)}>
          <Link
            href="/"
            className={`st-mobile-link ${activePage === 'home' ? 'st-mobile-link-active' : ''}`}
          >
            Airbnb Listings
          </Link>
          <Link
            href="/properties-for-sale"
            className={`st-mobile-link ${activePage === 'investments' ? 'st-mobile-link-active' : ''}`}
          >
            Properties for Sale
          </Link>
          <Link
            href="/login"
            className={`st-mobile-link ${activePage === 'login' ? 'st-mobile-link-active' : ''}`}
          >
            Admin Login
          </Link>
          <a
            href="https://wa.me/"
            target="_blank"
            className="st-mobile-link"
          >
            WhatsApp Us
          </a>
        </div>
      )}
    </>
  )
}
