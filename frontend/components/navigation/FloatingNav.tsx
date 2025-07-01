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

const navItems: NavItem[] = [
  { icon: <Home className="w-5 h-5" />, label: { en: 'Home', ko: '홈' }, path: '/' },
  { icon: <Sparkles className="w-5 h-5" />, label: { en: 'Discover', ko: '발견' }, path: '/quiz' },
  { icon: <Users className="w-5 h-5" />, label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
  { icon: <User className="w-5 h-5" />, label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
];

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
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sayu-liquid-glass ${scrolled ? 'backdrop-blur-xl' : ''}`}
        style={{ 
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 40px)',
          maxWidth: '1200px',
          padding: '12px 24px',
          borderRadius: '20px',
          zIndex: 1000
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

          <div className="flex items-center gap-3">
            <LanguageToggle variant="glass" className="hidden md:flex" />
            
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

      {/* Bottom Floating Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="sayu-liquid-glass"
        style={{ 
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: '30px',
          padding: '8px',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          gap: '4px',
          zIndex: 1000
        }}
      >
        <div className="flex items-center justify-around gap-2 px-2">
          {navItems.map((item, index) => {
            const isActive = pathname === item.path;
            const isDisabled = item.requiresAuth && !user;
            
            return (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item)}
                disabled={isDisabled}
                className={`sayu-nav-item ${isActive ? 'active' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                
                <span className="text-xs font-medium text-center">
                  {item.label[language]}
                </span>
              </motion.button>
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
                
                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
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