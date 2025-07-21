'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, Palette, Users, User, MessageSquare, GalleryVerticalEnd, Settings, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    icon: Home,
    label: { ko: '홈', en: 'Home' }
  },
  {
    href: '/quiz',
    icon: Palette,
    label: { ko: '퀴즈', en: 'Quiz' }
  },
  {
    href: '/gallery',
    icon: GalleryVerticalEnd,
    label: { ko: '갤러리', en: 'Gallery' }
  },
  {
    href: '/community',
    icon: MessageSquare,
    label: { ko: '커뮤니티', en: 'Community' },
    requireAuth: true
  },
  {
    href: '/profile',
    icon: User,
    label: { ko: '프로필', en: 'Profile' },
    requireAuth: true
  }
];

const getNavItemsWithAdmin = (user: any) => {
  const items = [...navItems];
  
  // 관리자인 경우 Admin 메뉴 추가
  if (user?.role === 'admin') {
    items.push({
      href: '/admin',
      icon: Settings,
      label: { ko: '관리자', en: 'Admin' },
      requireAuth: true,
      adminOnly: true
    });
  }
  
  return items;
};

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  console.log('GlobalNav rendered, pathname:', pathname, 'user:', user);

  // Don't show nav on auth pages
  const hideNavPaths = ['/login', '/signup', '/register', '/onboarding', '/forgot-password'];
  if (hideNavPaths.some(path => pathname.startsWith(path))) return null;

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    e.preventDefault();
    console.log('===== NAVIGATION CLICKED =====');
    console.log('Item:', item);
    console.log('Path:', item.href);
    console.log('User:', user);
    console.log('RequireAuth:', item.requireAuth);
    
    if (item.requireAuth && !user) {
      console.log('>>> REDIRECTING TO LOGIN - NO USER');
      router.push('/login');
      return;
    }
    
    console.log('>>> NAVIGATING TO:', item.href);
    router.push(item.href);
  };

  const currentNavItems = getNavItemsWithAdmin(user);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 md:top-0 md:bottom-auto transition-colors">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center justify-around md:justify-start md:space-x-8 flex-1">
            {currentNavItems.map((item) => {
            const isActive = pathname === item.href;
            const isLocked = item.requireAuth && !user;
            
            return (
              <button
                key={item.href}
                onClick={(e) => {
                  console.log('Button clicked!', item.label);
                  handleNavClick(e, item);
                }}
                className={cn(
                  "flex flex-col md:flex-row items-center justify-center md:justify-start",
                  "p-2 md:px-3 md:py-2 rounded-lg transition-colors",
                  "text-xs md:text-sm font-medium",
                  isActive && "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400",
                  !isActive && !isLocked && "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800",
                  isLocked && "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                )}
                disabled={isLocked}
              >
                <item.icon className="w-5 h-5 md:mr-2 mb-1 md:mb-0" />
                <span className="hidden md:inline">{item.label[language]}</span>
              </button>
            );
          })}
          </div>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={cn(
              "p-2 md:p-3 rounded-lg transition-all duration-200",
              "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
              "dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800",
              "hidden md:flex items-center justify-center"
            )}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}