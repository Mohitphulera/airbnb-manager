'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/authActions'
import AdminSearch from '@/components/AdminSearch'
import NotificationDropdown from '@/components/NotificationDropdown'
import type { QuickStats } from '@/actions/quickStatsActions'

interface AdminShellProps {
  children: React.ReactNode
  stats: QuickStats
  user?: { businessName: string; slug: string; logoUrl?: string }
}

export default function AdminShell({ children, stats, user }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true, icon: 'dashboard' },
    { href: '/admin/analytics', label: 'Analytics', icon: 'insights' },
    { href: '/admin/calendar', label: 'Calendar', icon: 'calendar_today' },
    { href: '/admin/properties', label: 'Listings', icon: 'home_work' },
    { href: '/admin/all-properties', label: 'All Listings', icon: 'grid_view' },
    { href: '/admin/bookings', label: 'Bookings', icon: 'assignment' },
    { href: '/admin/expenses', label: 'Earnings', icon: 'payments' },
    { href: '/admin/bills', label: 'Bills', icon: 'receipt_long' },
    { href: '/admin/guests', label: 'Guests', icon: 'group' },
    { href: '/admin/pricing', label: 'Pricing', icon: 'trending_up' },
    { href: '/admin/occupancy', label: 'Occupancy', icon: 'grid_view' },
    { href: '/admin/tasks', label: 'Tasks', icon: 'task_alt' },
    { href: '/admin/feedback', label: 'Feedback', icon: 'rate_review' },
    { href: '/admin/forecast', label: 'Forecast', icon: 'insights' },
    { href: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
    { href: '/admin/referrals', label: 'Referrals', icon: 'loyalty' },
    { href: '/admin/requests', label: 'Requests', icon: 'inbox', badge: stats.pendingRequests },
    { href: '/admin/settings', label: 'Settings', icon: 'settings' },
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
          {user?.logoUrl ? (
            <img src={user.logoUrl} alt={user.businessName} width={36} height={36} style={{ borderRadius: '10px', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#fff' }}>apartment</span>
            </div>
          )}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: '#fff', lineHeight: 1.2, fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>{user?.businessName ?? 'My Business'}</div>
            <div style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' as const }}>Property Manager</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', padding: '0.875rem', color: '#fff',
          }}>
            <div style={{ fontSize: '0.45rem', fontWeight: 800, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '0.5rem' }}>
              This Month
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.25rem', fontFamily: 'Manrope, sans-serif' }}>
              ₹{stats.monthRevenue.toLocaleString('en-IN')}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Properties</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{stats.totalProperties}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Today</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
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

          <Link href={user?.slug ? `/${user.slug}` : '/'} className="nav-link" style={{ color: 'rgba(255,255,255,0.4)' }} target="_blank">
            <span className="nav-link-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>open_in_new</span>
            </span>
            View My Site
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
            {user?.slug && (
              <Link href={`/${user.slug}`} className="topbar-icon-btn" aria-label="View My Site" style={{ textDecoration: 'none', color: 'inherit' }} target="_blank">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>open_in_new</span>
              </Link>
            )}
            <NotificationDropdown />
            <div className="topbar-avatar" title={user?.businessName}>
              {user?.businessName?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
          </div>
        </div>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
