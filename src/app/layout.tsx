import type { Metadata } from 'next'
import './globals.css'
import ToastProvider from '@/components/Toast'

export const metadata: Metadata = {
  title: 'Cozy B&B — Premium Stays, Direct Bookings',
  description: 'Discover handpicked bed & breakfast properties with the best prices. Book directly with hosts at Cozy B&B.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo-cozybnb.jpg" />
      </head>
      <body>
        <ToastProvider />
        {children}
      </body>
    </html>
  )
}
