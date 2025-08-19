'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { PWAUpdatePrompt } from './PWAUpdatePrompt';
import { OfflineIndicator } from './OfflineIndicator';

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  isInstallable: boolean;
  isUpdateAvailable: boolean;
  install: () => Promise<void>;
  updateApp: () => void;
  showInstallPrompt: boolean;
  setShowInstallPrompt: (show: boolean) => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [swRegistration, setSWRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    // Check if running as PWA
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isIOSStandalone);
    };

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Install prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      
      // Show install prompt after a delay (don't be too aggressive)
      setTimeout(() => {
        if (!isInstalled) {
          setShowInstallPrompt(true);
        }
      }, 10000); // Show after 10 seconds
    };

    // App installed detection
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkIfInstalled();
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [mounted, isInstalled]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    // Service Worker registration disabled
    // PWA features are currently disabled to avoid 403 errors in production
    console.log('Service Worker registration is disabled');
  }, [mounted]);

  const install = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallPrompt(false);
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const updateApp = () => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const value: PWAContextType = {
    isOnline,
    isInstalled,
    isInstallable,
    isUpdateAvailable,
    install,
    updateApp,
    showInstallPrompt,
    setShowInstallPrompt,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineIndicator />
    </PWAContext.Provider>
  );
}