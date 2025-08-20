'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Search, 
  MessageSquare, 
  User, 
  Palette,
  Menu,
  X,
  Calendar,
  Building2,
  Archive,
  GalleryVerticalEnd
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigationItems = [
  { 
    href: '/', 
    label: 'Home', 
    icon: Home,
    description: 'Your aesthetic journey starts here'
  },
  { 
    href: '/quiz', 
    label: 'Quiz', 
    icon: Palette,
    description: 'Discover your aesthetic personality'
  },
  { 
    href: '/exhibitions', 
    label: 'Exhibitions', 
    icon: GalleryVerticalEnd,
    description: 'Browse current exhibitions'
  },
  { 
    href: '/exhibition-archive', 
    label: 'Archive', 
    icon: Archive,
    description: 'Your exhibition insights'
  },
  { 
    href: '/gallery', 
    label: 'Gallery', 
    icon: Search,
    description: 'Explore curated artworks'
  },
  { 
    href: '/museums', 
    label: 'Museums', 
    icon: Building2,
    description: 'Browse museum collections'
  },
  { 
    href: '/community', 
    label: 'Community', 
    icon: MessageSquare,
    description: 'Connect with art lovers'
  },
];

const userItems = [
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: User,
    description: 'Your aesthetic profile'
  },
  { 
    href: '/reservations', 
    label: 'Reservations', 
    icon: Calendar,
    description: 'Manage your bookings'
  },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('/');
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    setActiveTab(pathname);
    setIsOpen(false); // Close menu when navigating
  }, [pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('.mobile-nav')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="mobile-nav fixed bottom-0 left-0 right-0 z-40 lg:hidden px-4 pb-4 safe-area-bottom">
        <div className="sayu-bottom-nav mx-auto max-w-sm">
          <div className="flex items-center justify-around px-4 py-3">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    active
                      ? 'text-sayu-tangerine-zest bg-sayu-tangerine-zest/10 scale-110'
                      : 'text-sayu-text-secondary hover:text-sayu-tangerine-zest hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {/* Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                isOpen
                  ? 'text-sayu-tangerine-zest bg-sayu-tangerine-zest/10 scale-110'
                  : 'text-sayu-text-secondary hover:text-sayu-tangerine-zest hover:scale-105'
              }`}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="text-xs font-medium">More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mobile-nav fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            {/* Menu Content */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 sayu-liquid-glass rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-sayu-text-primary">Navigation</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-sayu-text-secondary hover:text-sayu-text-primary transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Main Navigation */}
                <div className="space-y-2 mb-8">
                  <h3 className="text-sm font-medium text-sayu-text-secondary uppercase tracking-wide mb-3">
                    Explore
                  </h3>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                          active
                            ? 'bg-sayu-tangerine-zest/20 border border-sayu-tangerine-zest/30 text-sayu-tangerine-zest'
                            : 'text-sayu-text-primary hover:bg-sayu-powder-blue/10 hover:text-sayu-tangerine-zest'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          active ? 'bg-sayu-tangerine-zest/20' : 'bg-sayu-powder-blue/20'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-sm opacity-75">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* User Section */}
                {user && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-sayu-text-secondary uppercase tracking-wide mb-3">
                      Your Account
                    </h3>
                    {userItems.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                            active
                              ? 'bg-sayu-tangerine-zest/20 border border-sayu-tangerine-zest/30 text-sayu-tangerine-zest'
                              : 'text-sayu-text-primary hover:bg-sayu-powder-blue/10 hover:text-sayu-tangerine-zest'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${
                            active ? 'bg-sayu-tangerine-zest/20' : 'bg-sayu-powder-blue/20'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm opacity-75">{item.description}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* User Info */}
                {user && (
                  <div className="mt-8 pt-6 border-t border-sayu-powder-blue/30">
                    <div className="flex items-center gap-3 p-4 bg-sayu-powder-blue/10 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-br from-sayu-tangerine-zest to-sayu-lavender-dream rounded-full flex items-center justify-center text-white font-semibold">
                        {user.nickname?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sayu-text-primary truncate">
                          {user.nickname || user.email}
                        </div>
                        <div className="text-sm text-sayu-text-secondary">
                          Aesthetic Explorer
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auth Actions */}
                {!user && (
                  <div className="mt-8 pt-6 border-t border-sayu-powder-blue/30 space-y-3">
                    <Link
                      href="/login"
                      className="block w-full text-center py-3 bg-sayu-tangerine-zest hover:bg-sayu-dark-purple text-white rounded-xl transition-colors shadow-md hover:shadow-lg"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full text-center py-3 border border-sayu-powder-blue/50 hover:border-sayu-powder-blue text-sayu-text-primary hover:bg-sayu-powder-blue/10 rounded-xl transition-colors"
                    >
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Safe area for bottom navigation */}
      <div className="h-20 lg:hidden" />
    </>
  );
}