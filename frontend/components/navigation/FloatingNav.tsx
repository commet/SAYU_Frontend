'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Sparkles, Users, User, Menu, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface NavItem {
  icon: React.ReactNode;
  label: { en: string; ko: string };
  path: string;
  requiresAuth?: boolean;
}

// 데스크탑 메뉴 (상단) - 모든 항목
const desktopNavItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: { en: 'Home', ko: '홈' }, path: '/' },
  { icon: <Sparkles className="w-5 h-5" />, label: { en: 'Discover', ko: '탐색' }, path: '/quiz' },
  { icon: <Users className="w-5 h-5" />, label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
  { icon: <User className="w-5 h-5" />, label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
];

// 모바일 메뉴 (하단) - 중요한 3개만
const mobileNavItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: { en: 'Home', ko: '홈' }, path: '/' },
  { icon: <Sparkles className="w-5 h-5" />, label: { en: 'Quiz', ko: '퀴즈' }, path: '/quiz' },
  { icon: <User className="w-5 h-5" />, label: { en: 'My', ko: '마이' }, path: '/profile', requiresAuth: true },
];

const navItems = desktopNavItems; // 모바일 메뉴 오버레이에서 사용

export default function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (item: NavItem) => {
    if (item.requiresAuth && !user) {
      toast(language === 'ko' 
        ? '로그인이 필요합니다' 
        : 'Please login to access this feature', 
        {
          icon: '🔒',
          style: {
            background: 'rgba(147, 51, 234, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(147, 51, 234, 0.2)',
            color: '#fff',
          },
        }
      );
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      setIsOpen(false);
      return;
    }
    router.push(item.path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Top Floating Bar */}
      <div className="fixed top-0 left-0 right-0 z-[1000] px-4 pt-4">
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`mx-auto max-w-7xl ${scrolled ? 'backdrop-blur-xl' : ''}`}
          style={{ 
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px) saturate(180%)',
            borderRadius: '20px',
            padding: '12px 24px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SAYU
              </div>
            </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {desktopNavItems.map((item) => {
              const isActive = pathname === item.path;
              const isDisabled = item.requiresAuth && !user;
              
              return (
                <motion.button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  disabled={isDisabled}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-purple-100 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
                  } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileHover={!isDisabled ? { scale: 1.05 } : {}}
                  whileTap={!isDisabled ? { scale: 0.95 } : {}}
                >
                  {item.icon}
                  <span className="font-medium">{item.label[language]}</span>
                </motion.button>
              );
            })}
            <LanguageToggle variant="glass" />
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
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '30px',
          padding: '12px 20px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
          width: 'auto',
          maxWidth: 'calc(100vw - 40px)',
          zIndex: 1000
        }}
      >
        <div className="flex items-center justify-center gap-4">
          {mobileNavItems.map((item, index) => {
            const isActive = pathname === item.path;
            const isDisabled = item.requiresAuth && !user;
            
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item)}
                disabled={isDisabled}
                className={`sayu-nav-item flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${isActive ? 'active text-purple-600' : 'text-gray-600'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-50'}`}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  transition: { delay: index * 0.1 }
                }}
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
                  {item.icon}
                  {isActive && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-2 h-2 bg-purple-600 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    />
                  )}
                </div>
                
                <span className="text-xs font-medium whitespace-nowrap mt-1">
                  {item.label[language]}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
      </div>

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
                
                <nav className="flex flex-col gap-2">
                  {desktopNavItems.map((item) => {
                    const isActive = pathname === item.path;
                    const isDisabled = item.requiresAuth && !user;
                    
                    return (
                      <motion.button
                        key={item.path}
                        onClick={() => handleNavClick(item)}
                        disabled={isDisabled}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-300 text-left
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : isDisabled
                              ? 'text-gray-500 opacity-50 cursor-not-allowed'
                              : 'text-white/80 hover:bg-white/10'
                          }
                        `}
                        whileHover={!isDisabled ? { x: 4 } : {}}
                        whileTap={!isDisabled ? { scale: 0.98 } : {}}
                      >
                        {item.icon}
                        <span className="font-medium">{item.label[language]}</span>
                        {item.requiresAuth && !user && (
                          <span className="ml-auto text-xs text-gray-500">
                            {language === 'ko' ? '로그인 필요' : 'Login required'}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}