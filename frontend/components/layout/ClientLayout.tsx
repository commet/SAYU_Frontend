'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { MainNav } from '@/components/layout/MainNav'
import { Footer } from '@/components/ui/Footer'
import { MinimalGuideBot } from '@/components/chatbot/MinimalGuideBot'

const noLayoutPaths = ['/quiz', '/quiz/narrative', '/quiz/results', '/exhibitions/art-fair', '/contemplative-walk']

interface ClientLayoutProps {
  children: React.ReactNode
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const hideLayout = noLayoutPaths.some((path) => pathname?.startsWith(path))

  if (hideLayout) {
    return (
      <>
        {children}
        <MinimalGuideBot />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNav />
      <main className="flex-1">{children}</main>
      <Footer />
      <MinimalGuideBot />
    </div>
  )
}