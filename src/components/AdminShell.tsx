'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/authActions'
import AdminSearch from '@/components/AdminSearch'
import NotificationDropdown from '@/components/NotificationDropdown'
import type { QuickStats } from '@/actions/quickStatsActions'

export default function AdminShell({ children, stats }: { children: React.ReactNode; stats: QuickStats }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true, icon: 'dashboard' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'insights' },
    { href: '/admin/calendar', label: 'Calendar', icon: 'calendar_today' },
    { href: '/admin/properties', label: 'Listings', icon: 'home_work' },
    { href: '/admin/bookings', label: 'Bookings', icon: 'assignment' },
    { href: '/admin/expenses', label: 'Earnings', icon: 'payments' },
    { href: '/admin/requests', label: 'Requests', icon: 'inbox', badge: stats.pendingRequests },
  ]

  const saleItems = [
    { href: '/admin/sale-properties', label: 'Sale Listings', icon: 'sell' },
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
        {/* Logo / Brand */}
        <div className="sidebar-logo">
          <Image src="/logo-cozybnb.jpg" alt="Cozy BnB" width={36} height={36} className="logo-img-sidebar" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#0F172A', lineHeight: 1.2 }}>The Architect</div>
            <div style={{ fontSize: '0.5625rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>Superhost Status</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: '10px', padding: '0.75rem', color: '#fff',
          }}>
            <div style={{ fontSize: '0.5rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
              This Month
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
              ₹{stats.monthRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Properties</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{stats.totalProperties}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.5rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Today</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                  {stats.todayCheckIns + stats.todayCheckOuts > 0
                    ? `${stats.todayCheckIns}↓ ${stats.todayCheckOuts}↑`
                    : '—'
                  }
                </div>
              </div>
            </div>
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
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              </span>
              {item.label}
              {item.badge && item.badge > 0 ? (
                <span style={{
                  marginLeft: 'auto', background: '#ef4444', color: '#fff',
                  borderRadius: '50%', fontSize: '0.5625rem', fontWeight: 700,
                  padding: '0.1rem 0.4rem', minWidth: '18px', textAlign: 'center',
                }}>
                  {item.badge}
                </span>
              ) : null}
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
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              </span>
              {item.label}
            </Link>
          ))}

          {/* Add Property Button */}
          <Link href="/admin/properties" className="sidebar-add-btn" style={{ textDecoration: 'none', marginTop: '0.5rem' }}>
            + Add Property
          </Link>

          <div style={{ flex: 1 }} />

          <Link href="/" className="nav-link" style={{ color: '#94A3B8' }}>
            <span className="nav-link-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>language</span>
            </span>
            View Website
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="nav-link nav-link-logout">
              <span className="nav-link-icon">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
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
          <AdminSearch />
          <div className="admin-topbar-actions">
            <Link href="/" className="topbar-icon-btn" aria-label="View Website" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>language</span>
            </Link>
            <NotificationDropdown />
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
