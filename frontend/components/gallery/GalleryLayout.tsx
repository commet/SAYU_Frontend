'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, House, User, Heart, GridFour, Plus } from 'phosphor-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface GalleryLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  rightContent?: ReactNode;
}

export function GalleryLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true,
  rightContent 
}: GalleryLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: House, label: 'Home' },
    { href: '/gallery', icon: GridFour, label: 'Gallery' },
    { href: '/quiz', icon: Plus, label: 'Discover' },
    { href: '/archive', icon: Heart, label: 'Archive' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-sayu-bg-primary">
      {/* Elegant Header */}
      <header className="sticky top-0 z-50 bg-sayu-bg-primary/95 backdrop-blur-sm border-b border-sayu-powder-blue/30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBackButton && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="p-2 rounded-lg hover:bg-sayu-powder-blue/20 transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} weight="bold" />
                </motion.button>
              )}
              {title && (
                <div>
                  <h1 className="text-2xl font-display">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-sayu-text-secondary mt-0.5">{subtitle}</p>
                  )}
                </div>
              )}
            </div>
            {rightContent && (
              <div className="flex items-center gap-3">
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with Page Transition */}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="page-enter"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </motion.main>
      </AnimatePresence>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-sayu-bg-primary/95 backdrop-blur-sm border-t border-sayu-powder-blue/30 md:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                  isActive ? "text-sayu-tangerine-zest" : "text-sayu-text-secondary hover:text-sayu-text-primary"
                )}
              >
                <Icon size={24} weight={isActive ? "fill" : "regular"} />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}