'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Sparkles, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { artProfileAPI } from '@/lib/art-profile-api';
import Image from 'next/image';

interface AIArtIdentitySectionProps {
  userId: string;
  personalityType?: string | null;
}

export default function AIArtIdentitySection({ userId, personalityType }: AIArtIdentitySectionProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [artProfile, setArtProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtProfile();
  }, [userId]);

  const loadArtProfile = async () => {
    try {
      setLoading(true);
      const profiles = await artProfileAPI.getUserProfiles(userId);
      if (profiles && profiles.length > 0) {
        // Get the most recent profile
        setArtProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Failed to load art profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    router.push('/profile/art-profile');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="sayu-liquid-glass rounded-2xl p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          {language === 'ko' ? 'AI 아트 아이덴티티' : 'AI Art Identity'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateProfile}
          className="flex items-center gap-2"
        >
          {artProfile ? (
            <>
              <RefreshCw className="w-4 h-4" />
              {language === 'ko' ? '재생성' : 'Regenerate'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              {language === 'ko' ? '생성하기' : 'Create'}
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      ) : artProfile ? (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Image
              src={artProfile.imageUrl}
              alt={artProfile.prompt}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-sm text-white/90 font-medium">
                {artProfile.style}
              </p>
              <p className="text-xs text-white/70 mt-1 line-clamp-2">
                {artProfile.prompt}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="opacity-70">
              {language === 'ko' ? '생성일' : 'Created'}: {new Date(artProfile.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              ❤️ {artProfile.likes || 0}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
            <Sparkles className="w-10 h-10 text-purple-500" />
          </div>
          <div>
            <h3 className="font-medium mb-2">
              {language === 'ko' 
                ? '당신만의 AI 아트를 만들어보세요' 
                : 'Create Your Unique AI Art'}
            </h3>
            <p className="text-sm opacity-70 mb-4">
              {language === 'ko'
                ? personalityType 
                  ? `${personalityType} 성격에 맞는 독특한 아트를 생성해드립니다`
                  : '퀴즈를 완료하면 성격에 맞는 아트를 생성할 수 있습니다'
                : personalityType
                  ? `Generate unique art based on your ${personalityType} personality`
                  : 'Complete the quiz to generate art based on your personality'}
            </p>
            <Button
              onClick={handleCreateProfile}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {language === 'ko' ? 'AI 아트 생성하기' : 'Generate AI Art'}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}