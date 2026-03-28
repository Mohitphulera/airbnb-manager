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
    { href: '/admin', label: 'Dashboard', exact: true, icon: 'dashboard' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'insights' },
    { href: '/admin/calendar', label: 'Calendar', icon: 'calendar_today' },
    { href: '/admin/properties', label: 'Listings', icon: 'home_work' },
    { href: '/admin/bookings', label: 'Bookings', icon: 'assignment' },
    { href: '/admin/expenses', label: 'Earnings', icon: 'payments' },
  ]

  const saleItems = [
    { href: '/admin/sale-properties', label: 'Sale Listings', icon: 'sell' },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const pageTitle = navItems.find(item => isActive(item.href, item.exact))?.label
    || saleItems.find(item => isActive(item.href))?.label
    || 'Portfolio Manager'

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
        {/* Logo / Brand */}
        <div className="sidebar-logo">
          <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={36} height={36} className="logo-img-sidebar" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A', lineHeight: 1.2 }}>The Architect</div>
            <div style={{ fontSize: '0.5625rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Superhost Status</div>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '0.5rem' }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href, item.exact) ? 'nav-link-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-link-icon">
                <span className="material-icons-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              </span>
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
              <span className="nav-link-icon">
                <span className="material-icons-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              </span>
              {item.label}
            </Link>
          ))}

          {/* Add Property Button */}
          <Link href="/admin/properties" className="sidebar-add-btn" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            + Add Property
          </Link>

          <div style={{ flex: 1 }} />

          <Link href="/admin" className="nav-link" style={{ color: '#94A3B8' }}>
            <span className="nav-link-icon">
              <span className="material-icons-outlined" style={{ fontSize: '20px' }}>settings</span>
            </span>
            Settings
          </Link>
          <Link href="/" className="nav-link" style={{ color: '#94A3B8' }}>
            <span className="nav-link-icon">
              <span className="material-icons-outlined" style={{ fontSize: '20px' }}>help_outline</span>
            </span>
            Support
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="nav-link nav-link-logout">
              <span className="nav-link-icon">
                <span className="material-icons-outlined" style={{ fontSize: '20px' }}>logout</span>
              </span>
              Logout
            </button>
          </form>
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <div className="admin-topbar">
          <span className="admin-topbar-title">Portfolio Manager</span>
          <div className="admin-topbar-search">
            <span className="material-icons-outlined" style={{ fontSize: '18px', color: '#94A3B8' }}>search</span>
            <input type="text" placeholder="Search properties, guests, or tasks..." />
          </div>
          <div className="admin-topbar-actions">
            <button className="topbar-icon-btn" aria-label="Switch to Hosting">
              <span className="material-icons-outlined" style={{ fontSize: '18px' }}>swap_horiz</span>
            </button>
            <button className="topbar-icon-btn" aria-label="Notifications">
              <span className="material-icons-outlined" style={{ fontSize: '18px' }}>notifications</span>
            </button>
            <button className="topbar-icon-btn" aria-label="Grid view">
              <span className="material-icons-outlined" style={{ fontSize: '18px' }}>grid_view</span>
            </button>
            <div className="topbar-avatar">CB</div>
          </div>
        </div>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
