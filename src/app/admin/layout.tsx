'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/authActions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true, icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
    )},
    { href: '/admin/analytics', label: 'Analytics', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m19 9-5 5-4-4-3 3"/></svg>
    )},
    { href: '/admin/calendar', label: 'Calendar', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
    )},
    { href: '/admin/properties', label: 'Properties', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
    )},
    { href: '/admin/bookings', label: 'Bookings', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3"/><path d="m15 9 6-6"/></svg>
    )},
    { href: '/admin/expenses', label: 'Expenses', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
    )},
  ]

  const saleItems = [
    { href: '/admin/sale-properties', label: 'Sale Listings', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
    )},
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div className="admin-layout">
      {/* Mobile top bar */}
      <div className="admin-mobile-topbar">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hamburger-btn" aria-label="Toggle menu">
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={30} height={30} className="logo-img-sidebar" />
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff' }}>Cozy BnB</span>
        </div>
        <div style={{ width: '36px' }} />
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={36} height={36} className="logo-img-sidebar" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.2 }}>Cozy BnB</div>
            <div style={{ fontSize: '0.625rem', color: 'rgba(255,255,255,0.4)', fontWeight: 500, letterSpacing: '0.03em' }}>& Properties</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className="sidebar-section-label">Management</div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href, item.exact) ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div className="sidebar-divider" />

          <div className="sidebar-section-label">Sales</div>
          {saleItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-link-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          <Link href="/" className="nav-link" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            Public Site
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="nav-link nav-link-logout">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </form>
        </nav>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}
