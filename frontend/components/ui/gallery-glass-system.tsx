"use client"

import { useEffect, useRef, useState } from 'react'

// Gallery Glass 시스템의 핵심 훅
export function useGalleryGlass() {
  const elementRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })
    }
    
    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      setMousePosition({ x: 50, y: 50 })
    }
    
    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])
  
  return {
    ref: elementRef,
    mousePosition,
    isHovered,
    glassStyles: {
      '--mouse-x': `${mousePosition.x}%`,
      '--mouse-y': `${mousePosition.y}%`,
    } as React.CSSProperties
  }
}

// 주변 색상을 감지하고 반영하는 훅
export function useContextualColor() {
  const [dominantColor, setDominantColor] = useState<string>('#6B5B95')
  const [accentColor, setAccentColor] = useState<string>('#8B7BAB')
  
  // 실제 구현에서는 Canvas API를 사용해 주변 이미지의 색상을 추출
  // 여기서는 데모를 위해 시뮬레이션
  useEffect(() => {
    const colors = [
      { dominant: '#6B5B95', accent: '#8B7BAB' }, // 보라
      { dominant: '#E63946', accent: '#F1616D' }, // 빨강
      { dominant: '#F1C40F', accent: '#F4D03F' }, // 노랑
      { dominant: '#1A5490', accent: '#2874A6' }, // 파랑
    ]
    
    // 페이지의 스크롤이나 상황에 따라 색상 변경 시뮬레이션
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight)
      const colorIndex = Math.floor(scrollPercent * colors.length)
      const color = colors[Math.min(colorIndex, colors.length - 1)]
      setDominantColor(color.dominant)
      setAccentColor(color.accent)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return { dominantColor, accentColor }
}

// Gallery Glass 스타일 생성기
export function createGalleryGlassStyle(options: {
  variant?: 'light' | 'dark' | 'artistic'
  intensity?: number
  colorAdaptive?: boolean
}) {
  const { variant = 'light', intensity = 1, colorAdaptive = true } = options
  
  const baseStyles = {
    light: {
      background: `rgba(255, 255, 255, ${0.7 * intensity})`,
      border: `1px solid rgba(255, 255, 255, ${0.3 * intensity})`,
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, ${0.06 * intensity}),
        inset 0 1px 0 rgba(255, 255, 255, ${0.5 * intensity}),
        inset 0 -1px 0 rgba(0, 0, 0, ${0.05 * intensity})
      `,
    },
    dark: {
      background: `rgba(0, 0, 0, ${0.5 * intensity})`,
      border: `1px solid rgba(255, 255, 255, ${0.2 * intensity})`,
      boxShadow: `
        0 8px 32px rgba(0, 0, 0, ${0.3 * intensity}),
        inset 0 1px 0 rgba(255, 255, 255, ${0.1 * intensity}),
        inset 0 -1px 0 rgba(0, 0, 0, ${0.2 * intensity})
      `,
    },
    artistic: {
      background: `linear-gradient(135deg, 
        rgba(107, 91, 149, ${0.1 * intensity}) 0%,
        rgba(255, 255, 255, ${0.7 * intensity}) 50%,
        rgba(230, 57, 70, ${0.05 * intensity}) 100%
      )`,
      border: `1px solid rgba(255, 255, 255, ${0.4 * intensity})`,
      boxShadow: `
        0 12px 48px rgba(107, 91, 149, ${0.15 * intensity}),
        inset 0 2px 0 rgba(255, 255, 255, ${0.6 * intensity}),
        inset 0 -2px 0 rgba(107, 91, 149, ${0.1 * intensity})
      `,
    },
  }
  
  return baseStyles[variant]
}

// 노이즈 텍스처 SVG 생성기
export function NoiseTexture({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
      <filter id="noiseFilter">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="0.9" 
          numOctaves="4" 
          seed="5"
        />
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect 
        width="100%" 
        height="100%" 
        filter="url(#noiseFilter)" 
        opacity={opacity}
      />
    </svg>
  )
}

// 스펙큘러 하이라이트 컴포넌트
export function SpecularHighlight({ mouseX, mouseY, isHovered }: {
  mouseX: number
  mouseY: number
  isHovered: boolean
}) {
  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-inherit"
      style={{
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.3s ease-out',
      }}
    >
      {/* 메인 하이라이트 */}
      <div
        className="absolute w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mouseX}%`,
          top: `${mouseY}%`,
          background: `radial-gradient(circle at center, 
            rgba(255, 255, 255, 0.8) 0%, 
            rgba(255, 255, 255, 0.4) 20%, 
            rgba(255, 255, 255, 0.1) 40%, 
            transparent 70%
          )`,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1 : 0.8})`,
          transition: 'transform 0.3s ease-out',
        }}
      />
      
      {/* 보조 하이라이트 (프리즘 효과) */}
      <div
        className="absolute w-[150%] h-[150%] -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${mouseX}%`,
          top: `${mouseY}%`,
          background: `conic-gradient(from 45deg at center, 
            transparent, 
            rgba(107, 91, 149, 0.1), 
            transparent, 
            rgba(230, 57, 70, 0.1), 
            transparent, 
            rgba(241, 196, 15, 0.1), 
            transparent
          )`,
          transform: `translate(-50%, -50%) rotate(${mouseX + mouseY}deg)`,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  )
}