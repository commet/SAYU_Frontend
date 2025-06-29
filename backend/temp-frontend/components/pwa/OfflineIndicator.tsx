'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from './PWAProvider';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      setWasOffline(false);
      
      // Hide reconnected message after 3 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-4">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">
                You're offline. Some features may be limited.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconnected Indicator */}
      <AnimatePresence>
        {showReconnected && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-600 text-white"
          >
            <div className="flex items-center justify-center gap-2 py-2 px-4">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">
                Back online! All features are now available.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}