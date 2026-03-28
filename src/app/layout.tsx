import type { Metadata } from 'next'
import './globals.css'
import ToastProvider from '@/components/Toast'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata: Metadata = {
  title: 'Cozy B&B — Premium Stays, Direct Bookings',
  description: 'Discover handpicked bed & breakfast properties with the best prices. Book directly with hosts at Cozy B&B.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@200;400;500;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo-cozybnb.jpg" />
      </head>
      <body>
        <SmoothScroll>
          <ToastProvider />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
