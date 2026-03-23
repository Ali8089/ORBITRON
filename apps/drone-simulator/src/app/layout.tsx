import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ORBITRON – Drone Simulator',
  description: 'ORBITRON UTM Drone Simulator for Hong Kong airspace',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white antialiased">{children}</body>
    </html>
  )
}
