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
  const { signOut, updateProfile } = useAuth();
  const [nickname, setNickname] = useState(userInfo.nickname || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // 실제 데이터베이스 업데이트
      await updateProfile({ nickname });
      
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
                <h2 className="text-xl font-bold text-white">
                  {language === 'ko' ? '프로필 설정' : 'Profile Settings'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
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

                {/* Nickname - Disabled for now */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    {language === 'ko' ? '닉네임' : 'Nickname'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={nickname}
                      disabled
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed"
                      placeholder={language === 'ko' ? '닉네임 변경 준비 중' : 'Nickname change coming soon'}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                      {language === 'ko' ? '준비 중' : 'Coming Soon'}
                    </span>
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    {language === 'ko' ? '이메일' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={userInfo.email || ''}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 cursor-not-allowed"
                  />
                </div>

                {/* Personality Type */}
                {userInfo.personalityType && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      {language === 'ko' ? '예술 성향' : 'Art Personality'}
                    </label>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20">
                      <Palette className="w-5 h-5 text-purple-400" />
                      <span className="text-white">{userInfo.personalityType}</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  {/* Save button - disabled since nickname can't be changed */}
                  <Button
                    disabled={true}
                    className="w-full bg-gray-600 cursor-not-allowed opacity-50"
                  >
                    {language === 'ko' ? '변경 가능한 항목 없음' : 'No editable fields'}
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