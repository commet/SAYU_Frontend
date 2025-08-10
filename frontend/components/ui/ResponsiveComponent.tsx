'use client';

import React from 'react';
import { useResponsive } from '@/lib/responsive';

interface ResponsiveComponentProps {
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 디바이스 타입에 따라 다른 컴포넌트를 렌더링하는 래퍼
 */
export function ResponsiveComponent({
  mobile,
  tablet,
  desktop,
  fallback = null,
}: ResponsiveComponentProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // 서버 사이드 렌더링 시 fallback 반환
  if (typeof window === 'undefined') {
    return <>{fallback}</>;
  }

  if (isMobile && mobile) {
    return <>{mobile}</>;
  }

  if (isTablet && tablet) {
    return <>{tablet}</>;
  }

  if (isDesktop && desktop) {
    return <>{desktop}</>;
  }

  // 매칭되는 컴포넌트가 없을 경우 fallback 반환
  return <>{fallback}</>;
}

interface ConditionalRenderProps {
  condition: 'mobile' | 'tablet' | 'desktop' | 'mobileOrTablet' | 'tabletOrDesktop';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * 특정 조건에서만 렌더링하는 컴포넌트
 */
export function ConditionalRender({
  condition,
  children,
  fallback = null,
}: ConditionalRenderProps) {
  const { isMobile, isTablet, isDesktop, isMobileOrTablet, isTabletOrDesktop } = useResponsive();

  const shouldRender = () => {
    switch (condition) {
      case 'mobile':
        return isMobile;
      case 'tablet':
        return isTablet;
      case 'desktop':
        return isDesktop;
      case 'mobileOrTablet':
        return isMobileOrTablet;
      case 'tabletOrDesktop':
        return isTabletOrDesktop;
      default:
        return false;
    }
  };

  return shouldRender() ? <>{children}</> : <>{fallback}</>;
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

/**
 * 반응형 클래스를 적용하는 컨테이너
 */
export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const getClassName = () => {
    let classes = className;
    
    if (isMobile) {
      classes = `${classes} ${mobileClassName}`;
    } else if (isTablet) {
      classes = `${classes} ${tabletClassName}`;
    } else if (isDesktop) {
      classes = `${classes} ${desktopClassName}`;
    }
    
    return classes.trim();
  };

  return <div className={getClassName()}>{children}</div>;
}

/**
 * 모바일 전용 컴포넌트
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  return <ConditionalRender condition="mobile">{children}</ConditionalRender>;
}

/**
 * 태블릿 전용 컴포넌트
 */
export function TabletOnly({ children }: { children: React.ReactNode }) {
  return <ConditionalRender condition="tablet">{children}</ConditionalRender>;
}

/**
 * 데스크탑 전용 컴포넌트
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  return <ConditionalRender condition="desktop">{children}</ConditionalRender>;
}

/**
 * 모바일/태블릿 전용 컴포넌트
 */
export function MobileAndTabletOnly({ children }: { children: React.ReactNode }) {
  return <ConditionalRender condition="mobileOrTablet">{children}</ConditionalRender>;
}

/**
 * 태블릿/데스크탑 전용 컴포넌트
 */
export function TabletAndDesktopOnly({ children }: { children: React.ReactNode }) {
  return <ConditionalRender condition="tabletOrDesktop">{children}</ConditionalRender>;
}