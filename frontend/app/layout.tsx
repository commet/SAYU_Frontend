import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond, Abril_Fatface } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

import { SystemInitializer, PerformanceMonitor, SpatialPreloader } from '@/components/system/SystemInitializer'

import { WelcomeModalV2 } from '@/components/onboarding/WelcomeModalV2'

const inter = Inter({ subsets: ['latin'] })
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})
const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})
const abril = Abril_Fatface({ 
  subsets: ['latin'],
  variable: '--font-abril',
  weight: '400',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://sayu.art' : 'http://localhost:3000'),
  title: 'SAYU - 당신의 감정과 예술이 만나는 곳',
  description: '인공지능이 당신의 감정을 이해하고 맞춤형 예술 작품을 추천합니다. 16가지 예술 성향 테스트를 통해 나만의 미술관을 만들어보세요.',
  keywords: ['예술', '감정', 'AI', '성격테스트', '미술관', '전시', '큐레이션', 'SAYU', '아트테크'],
  authors: [{ name: 'SAYU Team' }],
  creator: 'SAYU',
  publisher: 'SAYU',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://sayu.art',
    siteName: 'SAYU',
    title: 'SAYU - 당신의 감정과 예술이 만나는 곳',
    description: 'AI가 당신의 감정을 이해하고 맞춤형 예술 작품을 추천합니다',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SAYU - Art & Emotion Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAYU - 당신의 감정과 예술이 만나는 곳',
    description: 'AI가 당신의 감정을 이해하고 맞춤형 예술 작품을 추천합니다',
    images: ['/twitter-image.png'],
    creator: '@sayu_art',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      naver: 'naver-site-verification-code',
    },
  },
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const darkMode = localStorage.getItem('darkMode');
                // 기본값을 다크 모드로 설정 (lightMode가 명시적으로 true가 아닌 이상 다크 모드)
                if (darkMode === 'false') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${playfair.variable} ${cormorant.variable} ${abril.variable} min-h-screen transition-colors bg-gray-900 dark:bg-gray-900`}>
        <Providers>
          {/* <SystemInitializer /> */}
          {/* Temporarily disabled for debugging
          <PerformanceMonitor />
          <SpatialPreloader />
          */}

          <main className="pb-20 safe-area-bottom lg:pt-4 lg:pb-4 bg-gray-900">
            {children}
          </main>
          {/* WelcomeModalV2 제거 - 프로필 페이지의 JourneySection에서 필요시 표시 */}
        </Providers>
      </body>
    </html>
  )
}
