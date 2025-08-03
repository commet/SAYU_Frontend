'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Sparkles, Users, User, Menu, X, Sun, Moon, Zap, LayoutDashboard, Calendar, LogIn, LogOut, GalleryVerticalEnd, ChevronDown, History } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDarkMode } from '@/contexts/DarkModeContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface NavItem {
  iconType: 'home' | 'sparkles' | 'users' | 'user' | 'zap' | 'dashboard' | 'calendar' | 'collection';
  label: { en: string; ko: string };
  path: string;
  requiresAuth?: boolean;
  children?: NavItem[];
}

// 데스크탑 메뉴 (상단) - 모든 항목
const desktopNavItems: NavItem[] = [
  { iconType: 'home', label: { en: 'Home', ko: '홈' }, path: '/' },
  { iconType: 'sparkles', label: { en: 'Discover', ko: '탐색' }, path: '/quiz' },
  { iconType: 'users', label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
  { 
    iconType: 'collection', 
    label: { en: 'Art Collection', ko: '아트 컬렉션' }, 
    path: '#',
    requiresAuth: true,
    children: [
      { iconType: 'dashboard', label: { en: 'Dashboard', ko: '대시보드' }, path: '/dashboard' },
      { iconType: 'collection', label: { en: 'My Collection', ko: '내 컬렉션' }, path: '/gallery' },
      { iconType: 'calendar', label: { en: 'Exhibition History', ko: '전시 히스토리' }, path: '/exhibitions/history' }
    ]
  },
  { iconType: 'user', label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
];

// 모바일 메뉴 (하단) - 중요한 5개
const mobileNavItems: NavItem[] = [
  { iconType: 'home', label: { en: 'Home', ko: '홈' }, path: '/' },
  { iconType: 'sparkles', label: { en: 'Quiz', ko: '퀴즈' }, path: '/quiz' },
  { iconType: 'users', label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
  { iconType: 'dashboard', label: { en: 'Dashboard', ko: '대시보드' }, path: '/dashboard', requiresAuth: true },
  { iconType: 'user', label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
];

const navItems = desktopNavItems; // 모바일 메뉴 오버레이에서 사용

export default function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const supabase = createClientComponentClient();
  
  console.log('=== FLOATING NAV RENDER ===');
  console.log('Pathname:', pathname);
  console.log('User:', user);
  
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'home': return <Home className="w-5 h-5" />;
      case 'sparkles': return <Sparkles className="w-5 h-5" />;
      case 'users': return <Users className="w-5 h-5" />;
      case 'user': return <User className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'dashboard': return <LayoutDashboard className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      case 'collection': return <GalleryVerticalEnd className="w-5 h-5" />;
      default: return null;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const dropdownContainer = target.closest('[data-dropdown-container]');
      if (!dropdownContainer && dropdownOpen) {
        setDropdownOpen(null);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    // Get detailed user info
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserInfo(user);
    };
    
    getUserInfo();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      getUserInfo();
    });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      subscription.unsubscribe();
    };
  }, [dropdownOpen]);

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !user) {
      toast.error(language === 'ko' ? '로그인이 필요한 기능입니다' : 'Please login to access this feature');
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      setIsOpen(false);
      return;
    }
    
    // Handle mobile dropdown for items with children
    if (item.children && item.children.length > 0) {
      setMobileDropdownOpen(mobileDropdownOpen === item.path ? null : item.path);
      return;
    }
    
    if (item.path === '#') return; // Skip items with no path
    
    router.push(item.path);
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    toast.success(language === 'ko' ? '로그아웃되었습니다' : 'Signed out successfully');
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return '📷'; // Instagram
      case 'google':
        return '🔍';
      case 'kakao':
        return '💬';
      case 'discord':
        return '🎮';
      default:
        return '✉️';
    }
  };

  const getProviderName = (provider: string) => {
    if (provider === 'facebook') return 'Instagram';
    return provider?.charAt(0).toUpperCase() + provider?.slice(1) || 'Email';
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Top Floating Bar */}
      <div className="fixed top-0 left-0 right-0 z-[1000] px-4 pt-4 bg-gray-900">
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`mx-auto max-w-7xl ${scrolled ? 'backdrop-blur-xl' : ''} transition-all duration-300`}
          style={{ 
            background: 'rgba(31, 41, 55, 0.95)',
            backgroundColor: 'rgba(31, 41, 55, 0.95) !important',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '20px',
            padding: '12px 24px',
            border: '1px solid rgba(75, 85, 99, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/')}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                SAYU
              </div>
            </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {desktopNavItems.map((item) => {
              const isActive = item.children 
                ? item.children.some(child => pathname === child.path)
                : pathname === item.path;
              const isDisabled = item.requiresAuth && !user;
              const hasDropdown = item.children && item.children.length > 0;
              
              return (
                <div key={item.path} className="relative" data-dropdown-container>
                  <motion.button
                    onClick={() => {
                      if (hasDropdown) {
                        setDropdownOpen(dropdownOpen === item.path ? null : item.path);
                      } else {
                        handleNavClick(item);
                      }
                    }}
                    onMouseEnter={() => {
                      if (isDisabled) setHoveredItem(item.path);
                      if (hasDropdown && !isDisabled) setDropdownOpen(item.path);
                    }}
                    onMouseLeave={() => {
                      setHoveredItem(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    } ${isDisabled ? 'opacity-50 hover:opacity-70' : ''}`}
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                  >
                    {getIcon(item.iconType)}
                    <span className="font-medium whitespace-nowrap">{item.label[language]}</span>
                    {hasDropdown && <ChevronDown className="w-4 h-4 ml-1" />}
                  </motion.button>
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {hasDropdown && dropdownOpen === item.path && !isDisabled && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full mt-2 left-0 bg-gray-800 rounded-xl shadow-xl overflow-hidden min-w-[200px] z-50"
                        onMouseEnter={() => setDropdownOpen(item.path)}
                        onMouseLeave={() => setDropdownOpen(null)}
                      >
                        {item.children?.map((child) => (
                          <motion.button
                            key={child.path}
                            onClick={() => {
                              router.push(child.path);
                              setDropdownOpen(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              pathname === child.path
                                ? 'bg-gray-700 text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            {getIcon(child.iconType)}
                            <span className="text-sm">{child.label[language]}</span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Tooltip */}
                  <AnimatePresence>
                    {isDisabled && hoveredItem === item.path && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50"
                      >
                        {language === 'ko' ? '로그인이 필요합니다' : 'Login required'}
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              {/* User info or Login button */}
              {user && userInfo ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100/50 dark:bg-purple-900/30 rounded-xl">
                    <span className="text-sm">{getProviderIcon(userInfo.app_metadata?.provider || '')}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {userInfo.user_metadata?.full_name || userInfo.email?.split('@')[0] || '사용자'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({getProviderName(userInfo.app_metadata?.provider || '')})
                    </span>
                  </div>
                  <motion.button
                    onClick={handleSignOut}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={language === 'ko' ? "로그아웃" : "Sign out"}
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">{language === 'ko' ? '로그인' : 'Login'}</span>
                </motion.button>
              )}
              
              <motion.button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-gray-300 hover:bg-gray-700 hover:text-white transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>
              <LanguageToggle variant="glass" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-full glass hover:bg-white/20 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.div>
      </div>

      {/* Bottom Floating Navigation - Mobile Only */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="sayu-liquid-glass sayu-floating-nav md:hidden"
        style={{ 
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '30px',
          padding: '12px 20px',
          border: isDarkMode ? '1px solid rgba(75, 85, 99, 0.4)' : '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: isDarkMode 
            ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.2)' 
            : '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
          width: 'auto',
          maxWidth: 'calc(100vw - 40px)',
          zIndex: 1000
        }}
      >
        <div className="flex items-center justify-center gap-1">
          {mobileNavItems.map((item, index) => {
            const isActive = pathname === item.path;
            const isDisabled = item.requiresAuth && !user;
            
            return (
              <motion.div
                key={item.path}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
              >
                <motion.button
                  onClick={() => handleNavClick(item)}
                  onTouchStart={() => isDisabled && setHoveredItem(item.path)}
                  onTouchEnd={() => setTimeout(() => setHoveredItem(null), 2000)}
                  className={`sayu-nav-item flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all min-w-[65px] ${isActive ? 'active text-purple-600' : 'text-gray-600'} ${isDisabled ? 'opacity-70 hover:opacity-100' : 'hover:bg-purple-50'}`}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                >
                {/* Active Indicator */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-purple-100/50 rounded-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                
                <div className="relative flex items-center justify-center">
                  {getIcon(item.iconType)}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                  )}
                </div>
                
                <span className="text-[10px] font-medium whitespace-nowrap mt-1 leading-tight overflow-hidden text-ellipsis max-w-[60px]">
                  {item.label[language]}
                </span>
                </motion.button>
                
                {/* Mobile Tooltip */}
                <AnimatePresence>
                  {isDisabled && hoveredItem === item.path && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50"
                    >
                      {language === 'ko' ? '로그인이 필요합니다' : 'Login required'}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25 }}
              className="absolute right-0 top-0 bottom-0 w-80 glass-dark p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">
                    {language === 'ko' ? '메뉴' : 'Menu'}
                  </h2>
                  <LanguageToggle variant="glass" />
                </div>
                
                {/* User info in mobile menu */}
                {user && userInfo && (
                  <div className="p-4 bg-white/10 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                        {getProviderIcon(userInfo.app_metadata?.provider || '')}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {userInfo.user_metadata?.full_name || userInfo.email?.split('@')[0] || '사용자'}
                        </p>
                        <p className="text-white/60 text-sm">
                          {getProviderName(userInfo.app_metadata?.provider || '')}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">{language === 'ko' ? '로그아웃' : 'Sign out'}</span>
                    </motion.button>
                  </div>
                )}
                
                <nav className="flex flex-col gap-2">
                  {desktopNavItems.map((item) => {
                    const isActive = item.children 
                      ? item.children.some(child => pathname === child.path)
                      : pathname === item.path;
                    const isDisabled = item.requiresAuth && !user;
                    const hasChildren = item.children && item.children.length > 0;
                    const isDropdownOpen = mobileDropdownOpen === item.path;
                    
                    return (
                      <div key={item.path}>
                        <motion.button
                          onClick={() => handleNavClick(item)}
                          className={`
                            w-full flex items-center gap-3 px-4 py-3 rounded-xl
                            transition-all duration-300 text-left
                            ${isActive 
                              ? 'bg-white/20 text-white' 
                              : isDisabled
                                ? 'text-gray-500 opacity-70 hover:opacity-100'
                                : 'text-white/80 hover:bg-white/10'
                            }
                          `}
                          whileHover={!isDisabled ? { x: 4 } : {}}
                          whileTap={!isDisabled ? { scale: 0.98 } : {}}
                        >
                          {getIcon(item.iconType)}
                          <span className="font-medium whitespace-nowrap">{item.label[language]}</span>
                          {hasChildren && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                          {item.requiresAuth && !user && !hasChildren && (
                            <span className="ml-auto text-xs text-gray-500">
                              {language === 'ko' ? '로그인 필요' : 'Login required'}
                            </span>
                          )}
                        </motion.button>
                        
                        {/* Mobile dropdown children */}
                        <AnimatePresence>
                          {hasChildren && isDropdownOpen && !isDisabled && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-8 mt-1 space-y-1"
                            >
                              {item.children?.map((child) => (
                                <motion.button
                                  key={child.path}
                                  onClick={() => {
                                    router.push(child.path);
                                    setIsOpen(false);
                                    setMobileDropdownOpen(null);
                                  }}
                                  className={`
                                    w-full flex items-center gap-3 px-3 py-2 rounded-lg
                                    transition-all duration-300 text-left text-sm
                                    ${pathname === child.path
                                      ? 'bg-white/10 text-white'
                                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                                    }
                                  `}
                                  whileHover={{ x: 2 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  {getIcon(child.iconType)}
                                  <span className="font-medium">{child.label[language]}</span>
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </nav>
                
                {/* Login button for mobile menu */}
                {!user && (
                  <motion.button
                    onClick={() => {
                      router.push('/login');
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">{language === 'ko' ? '로그인' : 'Login'}</span>
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
