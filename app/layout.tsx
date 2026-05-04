import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lüğət — Azərbaycan Dili Lüğəti',
  description: 'Azərbaycan dilinin elektron lüğəti. Sözlər, təriflər, nümunə cümlələr.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="az">
      <body>{children}</body>
    </html>
  )
}
