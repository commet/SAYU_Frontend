import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SAYU Minimal',
  description: 'Minimal test page',
}

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  )
}