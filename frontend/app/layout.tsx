import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Cormorant_Garamond, Abril_Fatface } from 'next/font/google'
import './globals.css'
import '@/styles/anti-flicker.css'
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
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtXK-F2qC0s.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Critical CSS inline */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html{visibility:visible!important;background:#111827}body{margin:0;padding:0;background:#111827;color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}*{box-sizing:border-box}html.dark{color-scheme:dark}.skeleton-placeholder{background:linear-gradient(90deg,#1f2937 0%,#374151 50%,#1f2937 100%);background-size:200% 100%;animation:skeleton-loading 1.5s infinite ease-in-out;border-radius:.5rem}@keyframes skeleton-loading{0%{background-position:200% 0}100%{background-position:-200% 0}}.container-stable{min-height:100vh;position:relative}.text-stable{opacity:1!important;visibility:visible!important}.mobile-nav-container{transform:translateZ(0);backface-visibility:hidden;position:fixed;bottom:0;left:0;right:0;z-index:50}img{display:block;max-width:100%;height:auto}button{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}*{transition-property:none}*::after,*::before{transition-property:none}[data-framer-appear-id]{opacity:1!important}.quiz-option-container{min-height:80px;opacity:1}.glass{background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}@media(prefers-color-scheme:dark){html{background:#111827}body{background:#111827}}
            `,
          }}
        />
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Always use dark mode for consistency
                  document.documentElement.classList.add('dark');
                  // Mark fonts as loading
                  document.documentElement.classList.add('fonts-loading');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} ${playfair.variable} ${cormorant.variable} ${abril.variable} min-h-screen bg-gray-900 dark:bg-gray-900 container-stable`}>
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
