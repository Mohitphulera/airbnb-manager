'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

type NavItem = { href: string; label: string; icon: string; exact?: boolean; badge?: number }

function buildNav(stats: QuickStats): { title: string; items: NavItem[] }[] {
  return [
    {
      title: 'Overview',
      items: [
        { href: '/admin', label: 'Dashboard', exact: true, icon: 'space_dashboard' },
        { href: '/admin/calendar', label: 'Calendar', icon: 'calendar_month' },
        { href: '/admin/analytics', label: 'Analytics', icon: 'insights' },
        { href: '/admin/forecast', label: 'Forecast', icon: 'query_stats' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { href: '/admin/bookings', label: 'Bookings', icon: 'event_available' },
        { href: '/admin/requests', label: 'Requests', icon: 'inbox', badge: stats.pendingRequests },
        { href: '/admin/tasks', label: 'Tasks', icon: 'task_alt' },
        { href: '/admin/inventory', label: 'Inventory', icon: 'inventory_2' },
      ],
    },
    {
      title: 'Properties',
      items: [
        { href: '/admin/properties', label: 'Rental listings', icon: 'home_work' },
        { href: '/admin/all-properties', label: 'Portfolio', icon: 'grid_view' },
        { href: '/admin/occupancy', label: 'Occupancy', icon: 'calendar_view_month' },
        { href: '/admin/pricing', label: 'Pricing', icon: 'sell' },
        { href: '/admin/sale-properties', label: 'For sale', icon: 'real_estate_agent' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { href: '/admin/expenses', label: 'Expenses', icon: 'account_balance_wallet' },
        { href: '/admin/bills', label: 'Invoices', icon: 'receipt_long' },
      ],
    },
    {
      title: 'Guests',
      items: [
        { href: '/admin/guests', label: 'Guest CRM', icon: 'group' },
        { href: '/admin/feedback', label: 'Feedback', icon: 'reviews' },
        { href: '/admin/referrals', label: 'Referrals', icon: 'loyalty' },
      ],
    },
  ]
}

function BrandMark({ user, size = 36 }: { user?: AdminShellProps['user']; size?: number }) {
  if (user?.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- host logos come from arbitrary https URLs
    return <img src={user.logoUrl} alt="" width={size} height={size} style={{ borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
  }
  return (
    <div className="brand-mark" style={{ width: size, height: size }} aria-hidden>
      {(user?.businessName ?? 'S').slice(0, 1).toUpperCase()}
    </div>
  )
}

export default function AdminShell({ children, stats, user }: AdminShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sections = buildNav(stats)

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const current = sections.flatMap(s => s.items).find(i => isActive(i.href, i.exact))
  const pageTitle = pathname.startsWith('/admin/settings') ? 'Settings' : current?.label ?? 'Dashboard'

  // Close the mobile drawer on navigation and with Escape
  useEffect(() => {
    if (!sidebarOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSidebarOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sidebarOpen])

  const todayMoves = stats.todayCheckIns + stats.todayCheckOuts

  return (
    <div className="admin-layout">
      {/* Mobile top bar */}
      <header className="admin-mobile-topbar">
        <button onClick={() => setSidebarOpen(o => !o)} className="hamburger-btn" aria-label={sidebarOpen ? 'Close menu' : 'Open menu'} aria-expanded={sidebarOpen}>
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${sidebarOpen ? 'open' : ''}`} />
        </button>
        <div className="admin-mobile-brand">
          <BrandMark user={user} size={28} />
          <span>{pageTitle}</span>
        </div>
        <NotificationDropdown />
      </header>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-logo">
          <BrandMark user={user} />
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-brand-name">{user?.businessName ?? 'My Business'}</div>
            {user?.slug && (
              <Link href={`/${user.slug}`} target="_blank" className="sidebar-brand-link">
                /{user.slug}
                <span className="material-symbols-outlined" style={{ fontSize: 12 }} aria-hidden>open_in_new</span>
              </Link>
            )}
          </div>
        </div>

        {/* This month at a glance */}
        <div className="sidebar-stats">
          <div className="sidebar-stats-label">Revenue this month</div>
          <div className="sidebar-stats-value">₹{stats.monthRevenue.toLocaleString('en-IN')}</div>
          <div className="sidebar-stats-row">
            <span>{stats.totalProperties} {stats.totalProperties === 1 ? 'property' : 'properties'}</span>
            <span>
              {todayMoves > 0
                ? `${stats.todayCheckIns} in · ${stats.todayCheckOuts} out today`
                : 'No moves today'}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map(section => (
            <div key={section.title} className="sidebar-section">
              <div className="sidebar-section-label">{section.title}</div>
              {section.items.map(item => {
                const active = isActive(item.href, item.exact)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-link ${active ? 'nav-link-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="nav-link-icon">
                      <span className="material-symbols-outlined" style={{ fontSize: 19 }} aria-hidden>{item.icon}</span>
                    </span>
                    {item.label}
                    {item.badge ? <span className="nav-badge" aria-label={`${item.badge} pending`}>{item.badge}</span> : null}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link href="/admin/settings" className={`nav-link ${isActive('/admin/settings') ? 'nav-link-active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-link-icon"><span className="material-symbols-outlined" style={{ fontSize: 19 }} aria-hidden>settings</span></span>
            Settings
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="nav-link nav-link-logout">
              <span className="nav-link-icon"><span className="material-symbols-outlined" style={{ fontSize: 19 }} aria-hidden>logout</span></span>
              Log out
            </button>
          </form>
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <span className="admin-topbar-title">{pageTitle}</span>
          <AdminSearch />
          <div className="admin-topbar-actions">
            <Link href="/admin/bookings#new-booking" className="topbar-primary-btn">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>add</span>
              New booking
            </Link>
            <NotificationDropdown />
            <div className="topbar-avatar" title={user?.businessName} aria-hidden>
              {user?.businessName?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
          </div>
        </header>
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  )
}
