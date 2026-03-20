'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/authActions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin', label: '🎯 Dashboard', exact: true },
    { href: '/admin/analytics', label: '📊 Analytics' },
    { href: '/admin/calendar', label: '📅 Calendar' },
    { href: '/admin/properties', label: '🏠 Properties' },
    { href: '/admin/bookings', label: '📋 Bookings' },
    { href: '/admin/expenses', label: '💰 Expenses' },
  ]

  const saleItems = [
    { href: '/admin/sale-properties', label: '🏷️ Sale Listings' },
  ]

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo-cozybnb.jpg" alt="Cozy B&B" className="logo-img-sidebar" style={{ width: '34px', height: '34px' }} />
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Cozy B&B</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '0.5rem 0.875rem', marginBottom: '0.25rem' }}>
            B&B Management
          </div>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href, item.exact) ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.75rem 0.875rem' }} />

          <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '0.5rem 0.875rem', marginBottom: '0.25rem' }}>
            Property Sales
          </div>
          {saleItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}

          <div style={{ flex: 1 }} />

          <Link href="/" className="nav-link" style={{ color: 'rgba(255,255,255,0.4)' }}>← Public Site</Link>
          <form action={logoutAction}>
            <button type="submit" className="nav-link" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.875rem', color: '#F87171' }}>
              🚪 Logout
            </button>
          </form>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem 2.5rem', overflowY: 'auto', background: 'var(--background)' }}>
        {children}
      </main>
    </div>
  )
}
