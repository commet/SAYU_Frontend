'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { usePWA } from './PWAProvider';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, showInstallPrompt, setShowInstallPrompt, install } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) { // Don't show again for 7 days
        setDismissed(true);
      }
    }
  }, []);

  const handleInstall = async () => {
    try {
      await install();
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Install failed:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const shouldShow = isInstallable && !isInstalled && showInstallPrompt && !dismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl backdrop-blur-lg">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Smartphone className="w-6 h-6 text-purple-400" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Install SAYU App
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add SAYU to your home screen for the best experience. Access your aesthetic journey anytime, even offline.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleInstall}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Install
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Features List */}
            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Offline access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Push notifications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Native experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Quick access</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}