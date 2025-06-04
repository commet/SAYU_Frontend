import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '../globals-personalized.css'
import { AuthProvider } from '@/hooks/useAuth'
import { ThemeProvider } from '@/hooks/usePersonalizedTheme'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
            <PersonalizedToaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

// Personalized toaster that adapts to user theme
function PersonalizedToaster() {
  return (
    <Toaster 
      position="bottom-center"
      toastOptions={{
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          borderRadius: 'var(--layout-borderRadius)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--layout-shadows)',
        },
        duration: 4000,
      }}
    />
  );
}
