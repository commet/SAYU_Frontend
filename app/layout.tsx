import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'SAYU - Your Aesthetic Journey',
  description: 'Discover your unique aesthetic personality through art',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster 
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              borderRadius: '8px',
            },
            duration: 4000,
          }}
        />
      </body>
    </html>
  )
}