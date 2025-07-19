"use client"

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TextAnimationProps {
  children: string
  className?: string
  delay?: number
  duration?: number
  stagger?: number
}

// 페이드 인 애니메이션
export function FadeInText({ 
  children, 
  className,
  delay = 0,
  duration = 1000 
}: TextAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block transition-all",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </span>
  )
}

// 글자별 애니메이션
export function StaggerText({ 
  children, 
  className,
  delay = 0,
  duration = 50,
  stagger = 30
}: TextAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {children.split('').map((char, i) => (
        <span
          key={i}
          className={cn(
            "inline-block transition-all",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{
            transitionDelay: `${i * stagger}ms`,
            transitionDuration: `${duration}ms`,
            transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  )
}

// 타이핑 애니메이션
export function TypewriterText({ 
  children, 
  className,
  delay = 0,
  duration = 50
}: TextAnimationProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isStarted) {
          setTimeout(() => setIsStarted(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay, isStarted])

  useEffect(() => {
    if (!isStarted) return

    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < children.length) {
        setDisplayedText(children.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, duration)

    return () => clearInterval(interval)
  }, [isStarted, children, duration])

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {displayedText}
      {displayedText.length < children.length && (
        <span className="inline-block w-[2px] h-[1.2em] bg-current animate-pulse" />
      )}
    </span>
  )
}

// 그라디언트 애니메이션 텍스트
export function GradientText({ 
  children, 
  className,
  gradient = "from-primary to-secondary"
}: TextAnimationProps & { gradient?: string }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <span
      className={cn(
        "inline-block bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500",
        isHovered ? "scale-105" : "scale-100",
        gradient,
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </span>
  )
}

// 플로팅 애니메이션
export function FloatingText({ 
  children, 
  className 
}: TextAnimationProps) {
  return (
    <span
      className={cn(
        "inline-block animate-float",
        className
      )}
    >
      {children}
    </span>
  )
}

// 블러 인 애니메이션
export function BlurInText({ 
  children, 
  className,
  delay = 0,
  duration = 1000
}: TextAnimationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [delay])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block transition-all",
        isVisible ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {children}
    </span>
  )
}

// 언더라인 드로우 애니메이션
export function UnderlineDrawText({ 
  children, 
  className 
}: TextAnimationProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <span
      className={cn(
        "relative inline-block cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-primary to-secondary transition-all duration-500",
          isHovered ? "w-full" : "w-0"
        )}
      />
    </span>
  )
}

// 회전 애니메이션 텍스트
export function RotateText({ 
  texts,
  className,
  duration = 3000
}: { texts: string[], className?: string, duration?: number }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, duration)

    return () => clearInterval(interval)
  }, [texts.length, duration])

  return (
    <span className={cn("relative inline-block", className)}>
      {texts.map((text, index) => (
        <span
          key={index}
          className={cn(
            "absolute left-0 transition-all duration-500",
            index === currentIndex 
              ? "opacity-100 translate-y-0" 
              : "opacity-0 -translate-y-2"
          )}
        >
          {text}
        </span>
      ))}
      <span className="invisible">{texts[0]}</span>
    </span>
  )
}