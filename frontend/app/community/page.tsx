'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ForumList } from '@/components/community/ForumList';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MessageSquare, Sparkles, Heart, Palette, Eye, Calendar, MapPin, ChevronRight, Info, MoreVertical, Flag, Ban, Filter, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-400 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">커뮤니티</h2>
          <p className="text-gray-600 mb-6">로그인 후 이용해주세요</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            로그인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/backgrounds/classical-gallery-floor-sitting-contemplation.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            {language === 'ko' ? 'SAYU 커뮤니티' : 'SAYU Community'}
          </h1>
          <p className="text-white/80 text-lg">
            {language === 'ko' ? '예술을 사랑하는 사람들과의 만남' : 'Connect with fellow art enthusiasts'}
          </p>
        </motion.div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {language === 'ko' ? '커뮤니티 기능 준비 중' : 'Community Features Coming Soon'}
            </h2>
            <p className="text-gray-600 mb-6">
              {language === 'ko' 
                ? '더 나은 커뮤니티 경험을 위해 개발 중입니다. 곧 만나요!' 
                : 'We are working on better community features. See you soon!'}
            </p>
            <button
              onClick={() => router.push('/gallery')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              {language === 'ko' ? '갤러리로 이동' : 'Go to Gallery'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}