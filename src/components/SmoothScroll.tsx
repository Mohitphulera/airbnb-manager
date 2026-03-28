'use client'

import { ReactLenis } from '@studio-freight/react-lenis'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SmoothScroll({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.0, smoothWheel: true }}>
      {children}
    </ReactLenis>
  )
}
