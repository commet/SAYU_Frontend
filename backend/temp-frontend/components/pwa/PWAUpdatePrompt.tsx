'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from './PWAProvider';
import { useState } from 'react';

export function PWAUpdatePrompt() {
  const { isUpdateAvailable, updateApp } = usePWA();
  const [dismissed, setDismissed] = useState(false);

  const handleUpdate = () => {
    updateApp();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  const shouldShow = isUpdateAvailable && !dismissed;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-blue-600 border border-blue-500 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  Update Available
                </h3>
                <p className="text-blue-100 text-sm mb-3">
                  A new version of SAYU is ready. Update now for the latest features and improvements.
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdate}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Update Now
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className="px-3 py-1.5 text-blue-100 hover:text-white text-sm transition-colors"
                  >
                    Later
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-1 text-blue-200 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}