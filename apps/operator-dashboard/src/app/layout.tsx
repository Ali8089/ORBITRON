import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ORBITRON – Operator Dashboard',
  description: 'ORBITRON UTM Operator Dashboard for Hong Kong airspace management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white antialiased">{children}</body>
    </html>
  )
}
