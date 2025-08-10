'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Palette, LogOut } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: {
    nickname?: string;
    email?: string;
    personalityType?: string | null;
  };
  onUpdate: (updates: any) => void;
}

export default function ProfileSettingsModal({ 
  isOpen, 
  onClose, 
  userInfo,
  onUpdate 
}: ProfileSettingsModalProps) {
  const { language } = useLanguage();
  const { signOut } = useAuth();
  const [nickname, setNickname] = useState(userInfo.nickname || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In real app, would make API call here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onUpdate({ nickname });
      toast.success(language === 'ko' ? '프로필이 업데이트되었습니다' : 'Profile updated successfully');
      onClose();
    } catch (error) {
      toast.error(language === 'ko' ? '업데이트 실패' : 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      onClose(); // Close modal first
      await signOut();
      toast.success(language === 'ko' ? '로그아웃되었습니다' : 'Logged out successfully');
      // The useAuth hook will handle the redirect to '/' via onAuthStateChange
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(language === 'ko' ? '로그아웃 실패' : 'Logout failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="sayu-liquid-glass rounded-2xl p-6 max-w-md w-full"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {language === 'ko' ? '프로필 설정' : 'Profile Settings'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                      {nickname[0] || userInfo.email?.[0] || 'U'}
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Nickname */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ko' ? '닉네임' : 'Nickname'}
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:border-purple-500 focus:outline-none transition-colors"
                    placeholder={language === 'ko' ? '닉네임을 입력하세요' : 'Enter your nickname'}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ko' ? '이메일' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={userInfo.email || ''}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 opacity-70 cursor-not-allowed"
                  />
                </div>

                {/* Personality Type */}
                {userInfo.personalityType && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === 'ko' ? '예술 성향' : 'Art Personality'}
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
                      <Palette className="w-5 h-5 opacity-70" />
                      <span>{userInfo.personalityType}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isLoading 
                      ? (language === 'ko' ? '저장 중...' : 'Saving...') 
                      : (language === 'ko' ? '변경사항 저장' : 'Save Changes')
                    }
                  </Button>

                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'ko' ? '로그아웃' : 'Logout'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}