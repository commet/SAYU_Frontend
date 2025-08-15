'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Sparkles, 
  Users, 
  User, 
  Menu, 
  X, 
  GalleryVerticalEnd,
  Calendar,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface NavItem {
  icon: React.ElementType;
  label: { en: string; ko: string };
  path: string;
  requiresAuth?: boolean;
}

// 하단 탭 바 아이템 (5개 핵심 메뉴) - FloatingNav와 동일
const bottomTabItems: NavItem[] = [
  { icon: Home, label: { en: 'Home', ko: '홈' }, path: '/' },
  { icon: Sparkles, label: { en: 'Quiz', ko: '퀴즈' }, path: '/quiz' },
  { icon: Users, label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
  { icon: LayoutDashboard, label: { en: 'Dashboard', ko: '대시보드' }, path: '/dashboard', requiresAuth: true },
  { icon: User, label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
];

// 사이드 드로어 메뉴 아이템 (전체 메뉴) - FloatingNav 구조와 동일하게
const drawerMenuItems = [
  { 
    title: { en: 'Main', ko: '메인' },
    items: [
      { icon: Home, label: { en: 'Home', ko: '홈' }, path: '/' },
      { icon: Sparkles, label: { en: 'Discover', ko: '탐색' }, path: '/quiz' },
    ]
  },
  {
    title: { en: 'Art Collection', ko: '아트 컬렉션' },
    items: [
      { icon: LayoutDashboard, label: { en: 'Dashboard', ko: '대시보드' }, path: '/dashboard', requiresAuth: true },
      { icon: GalleryVerticalEnd, label: { en: 'My Collection', ko: '내 컬렉션' }, path: '/gallery', requiresAuth: true },
      { icon: Calendar, label: { en: 'Exhibitions', ko: '전시회' }, path: '/exhibitions', requiresAuth: false },
    ]
  },
  {
    title: { en: 'Community', ko: '커뮤니티' },
    items: [
      { icon: Users, label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
    ]
  },
  {
    title: { en: 'Account', ko: '계정' },
    items: [
      { icon: User, label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
      { icon: Settings, label: { en: 'Settings', ko: '설정' }, path: '/settings', requiresAuth: true },
    ]
  }
];

export default function MobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      toast.error(language === 'ko' ? '로그인이 필요합니다' : 'Login required');
      router.push('/login');
      return;
    }
    router.push(path);
    setIsDrawerOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDrawerOpen(false);
      toast.success(language === 'ko' ? '로그아웃되었습니다' : 'Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error(language === 'ko' ? '로그아웃 실패' : 'Logout failed');
    }
  };

  return (
    <>
      {/* 모바일 상단 헤더 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="hover:opacity-80 transition-opacity touch-manipulation"
          >
            <div className="relative group">
              {/* 로고 스타일: Artistic Script - 모바일 버전 */}
              <div className="text-2xl italic relative" 
                   style={{ fontFamily: 'var(--font-playfair), serif', letterSpacing: '-0.02em' }}>
                <span className="bg-gradient-to-br from-purple-500 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                  Sayu
                </span>
                {/* 점 장식 */}
                <div className="absolute -top-1 -right-2 w-1 h-1 rounded-full bg-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </button>
          
          <div className="w-10" /> {/* 균형을 위한 spacer */}
        </div>
      </div>

      {/* 사이드 드로어 */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />
            
            {/* 드로어 */}
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 z-[9999] shadow-2xl lg:hidden overflow-y-auto"
            >
              {/* 드로어 헤더 */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {language === 'ko' ? '메뉴' : 'Menu'}
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors touch-manipulation"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* 사용자 정보 */}
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user.nickname?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.nickname || user.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user.personalityType || 'SAYU Explorer'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* 로그인 버튼 (비로그인 시) */}
                {!user && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      router.push('/login');
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity touch-manipulation"
                  >
                    {language === 'ko' ? '로그인' : 'Login'}
                  </button>
                )}
              </div>
              
              {/* 메뉴 섹션들 */}
              <div className="py-4">
                {drawerMenuItems.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-6">
                    <h3 className="px-6 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {section.title[language]}
                    </h3>
                    <div>
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        const isDisabled = item.requiresAuth && !user;
                        
                        return (
                          <button
                            key={itemIndex}
                            onClick={() => !isDisabled && handleNavigation(item.path, item.requiresAuth)}
                            disabled={isDisabled}
                            className={`
                              w-full px-6 py-3 flex items-center gap-3 transition-colors touch-manipulation
                              ${isActive 
                                ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-r-4 border-purple-600' 
                                : isDisabled
                                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="flex-1 text-left">
                              {item.label[language]}
                            </span>
                            {item.requiresAuth && !user && (
                              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                {language === 'ko' ? '로그인 필요' : 'Login'}
                              </span>
                            )}
                            {isActive && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* 로그아웃 버튼 (로그인 시) */}
                {user && (
                  <div className="px-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors touch-manipulation"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{language === 'ko' ? '로그아웃' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* 하단 탭 바 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40 safe-area-bottom">
        <div className="flex items-center justify-around">
          {bottomTabItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const isDisabled = item.requiresAuth && !user;
            
            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleNavigation(item.path, item.requiresAuth)}
                disabled={isDisabled}
                className={`
                  flex-1 py-2 px-2 flex flex-col items-center gap-1 transition-colors touch-manipulation
                  ${isActive 
                    ? 'text-purple-600 dark:text-purple-400' 
                    : isDisabled
                      ? 'text-gray-400 dark:text-gray-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">
                  {item.label[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}