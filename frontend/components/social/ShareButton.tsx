'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  contentType: 'artwork' | 'quiz' | 'exhibition' | 'achievement' | 'community';
  contentId: string;
  additionalData?: any;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ShareUrls {
  platforms: {
    twitter: string;
    facebook: string;
    linkedin: string;
    reddit: string;
    pinterest?: string;
  };
  shareData: {
    title: string;
    text: string;
    url: string;
  };
  directUrl: string;
}

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  reddit: MessageCircle,
  pinterest: Share2
};

const platformColors = {
  twitter: 'bg-blue-500 hover:bg-blue-600',
  facebook: 'bg-blue-700 hover:bg-blue-800',
  linkedin: 'bg-blue-600 hover:bg-blue-700',
  reddit: 'bg-orange-500 hover:bg-orange-600',
  pinterest: 'bg-red-500 hover:bg-red-600'
};

export function ShareButton({ 
  contentType, 
  contentId, 
  additionalData = {}, 
  variant = 'button',
  size = 'md',
  className = '' 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrls, setShareUrls] = useState<ShareUrls | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const generateShareUrls = async () => {
    if (shareUrls) {
      setIsOpen(!isOpen);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/social-share/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          additionalData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShareUrls(data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to generate share URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformShare = async (platform: string, url: string) => {
    // Track the share
    try {
      await fetch('/api/social-share/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          platform
        })
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }

    // Open share window
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;

    window.open(
      url,
      'share',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      // Fallback to generating URLs
      generateShareUrls();
      return;
    }

    try {
      const response = await fetch('/api/social-share/native', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          additionalData
        })
      });

      if (response.ok) {
        const shareData = await response.json();
        await navigator.share(shareData);
        
        // Track native share
        await fetch('/api/social-share/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            contentType,
            contentId,
            platform: 'native'
          })
        });
      }
    } catch (error) {
      console.error('Failed to share:', error);
      // Fallback to URL generation
      generateShareUrls();
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrls) return;

    try {
      await navigator.clipboard.writeText(shareUrls.directUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Track copy action
      await fetch('/api/social-share/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          contentType,
          contentId,
          platform: 'copy_link'
        })
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const renderButton = () => {
    switch (variant) {
      case 'icon':
        return (
          <button
            onClick={navigator.share ? handleNativeShare : generateShareUrls}
            disabled={loading}
            className={`p-2 rounded-lg border border-gray-600 hover:border-purple-500 text-gray-400 hover:text-white transition-colors ${className}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full border-2 border-gray-300 border-t-purple-500" style={{ width: iconSizes[size].split(' ')[0].slice(2), height: iconSizes[size].split(' ')[1].slice(2) }}></div>
            ) : (
              <Share2 className={iconSizes[size]} />
            )}
          </button>
        );
      
      case 'text':
        return (
          <button
            onClick={navigator.share ? handleNativeShare : generateShareUrls}
            disabled={loading}
            className={`text-purple-400 hover:text-purple-300 transition-colors ${className}`}
          >
            {loading ? 'Loading...' : 'Share'}
          </button>
        );
      
      default:
        return (
          <button
            onClick={navigator.share ? handleNativeShare : generateShareUrls}
            disabled={loading}
            className={`flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-purple-500 text-white rounded-lg transition-colors ${sizeClasses[size]} ${className}`}
          >
            {loading ? (
              <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-purple-500 ${iconSizes[size]}`}></div>
            ) : (
              <Share2 className={iconSizes[size]} />
            )}
            {loading ? 'Loading...' : 'Share'}
          </button>
        );
    }
  };

  return (
    <div className="relative">
      {renderButton()}

      <AnimatePresence>
        {isOpen && shareUrls && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-xl p-4 shadow-xl z-50 min-w-[280px]"
          >
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-white mb-3">Share this content</h3>
              
              {/* Platform buttons */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(shareUrls.platforms).map(([platform, url]) => {
                  if (!url) return null;
                  
                  const Icon = platformIcons[platform as keyof typeof platformIcons];
                  const colorClass = platformColors[platform as keyof typeof platformColors];
                  
                  return (
                    <button
                      key={platform}
                      onClick={() => handlePlatformShare(platform, url)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm transition-colors ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="capitalize">{platform}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Copy link */}
              <div className="pt-3 border-t border-gray-700">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 hover:text-white text-sm transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Close overlay */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}