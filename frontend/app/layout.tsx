import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import GlobalNav from '@/components/navigation/GlobalNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SAYU - Your Aesthetic Journey',
  description: 'Discover your unique aesthetic personality through art',
  // manifest removed due to Vercel 401 errors
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8b5cf6',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* Removed head tag content due to 401 errors */}
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
