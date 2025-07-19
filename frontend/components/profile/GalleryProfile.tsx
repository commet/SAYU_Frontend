"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Frame, 
  Palette, 
  Calendar, 
  Heart, 
  Share2, 
  BookOpen,
  Trophy,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryProfileProps {
  user: {
    nickname?: string
    email?: string
    personalityType?: string
    aptCode?: string // e.g., "LAEF"
    level: number
    totalPoints: number
  }
  stats: {
    totalArtworks: number
    exhibitionsVisited: number
    favoriteArtist?: string
    recentActivity?: string
    followerCount: number
    followingCount: number
  }
}

// 갤러리 섹션 컴포넌트
const GallerySection = ({ 
  title, 
  subtitle, 
  children, 
  className 
}: { 
  title: string
  subtitle?: string
  children: React.ReactNode
  className?: string 
}) => (
  <motion.div
    className={cn("bg-white rounded-2xl p-6 shadow-sm border border-gray-100", className)}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2, shadow: "0 8px 30px rgba(0,0,0,0.08)" }}
    transition={{ duration: 0.3 }}
  >
    {/* 갤러리 라벨 스타일의 제목 */}
    <div className="mb-4 pb-4 border-b border-gray-100">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
    {children}
  </motion.div>
)

// 작품 액자 스타일의 카드
const ArtworkFrame = ({ 
  children, 
  label,
  isHighlight = false 
}: { 
  children: React.ReactNode
  label?: string
  isHighlight?: boolean
}) => (
  <div className={cn(
    "relative p-6 rounded-lg border-2 transition-all duration-300",
    isHighlight 
      ? "border-[#6B5B95] bg-gradient-to-br from-[#6B5B95]/5 to-transparent" 
      : "border-gray-200 hover:border-gray-300"
  )}>
    {children}
    {label && (
      <div className="absolute -bottom-3 left-4 bg-white px-2 text-xs text-gray-500">
        {label}
      </div>
    )}
  </div>
)

export default function GalleryProfile({ user, stats }: GalleryProfileProps) {
  const { language } = useLanguage()
  
  // APT 코드와 동물 이름 병기
  const personalityDisplay = user.personalityType && user.aptCode 
    ? `${user.aptCode} - ${user.personalityType}`
    : user.personalityType || user.aptCode || 'Unknown'

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* 갤러리 입구 - 프로필 헤더 */}
      <motion.div
        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            {/* 프로필 사진 = 대표 작품 */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6B5B95] to-[#8B7BAB] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user.nickname?.[0] || 'S'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md">
                <Palette className="w-5 h-5 text-[#6B5B95]" />
              </div>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {user.nickname || 'SAYU Explorer'}
              </h1>
              <p className="text-sm text-gray-600 mb-3">
                {language === 'ko' ? '큐레이터' : 'Curator'} Level {user.level}
              </p>
              
              {/* APT 타입 표시 - 액자 라벨 스타일 */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {personalityDisplay}
                </span>
              </div>
            </div>
          </div>
          
          {/* 갤러리 통계 */}
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.followerCount}</p>
              <p className="text-sm text-gray-500">
                {language === 'ko' ? '팔로워' : 'Followers'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{stats.followingCount}</p>
              <p className="text-sm text-gray-500">
                {language === 'ko' ? '팔로잉' : 'Following'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 전시실 레이아웃 - 3열 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 왼쪽 벽 - 컬렉션 통계 */}
        <GallerySection 
          title={language === 'ko' ? '나의 컬렉션' : 'My Collection'}
          subtitle={language === 'ko' ? '수집한 작품들' : 'Collected Artworks'}
        >
          <div className="space-y-4">
            <ArtworkFrame isHighlight>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Frame className="w-5 h-5 text-[#6B5B95]" />
                  <span className="font-medium">{language === 'ko' ? '작품' : 'Artworks'}</span>
                </div>
                <span className="text-2xl font-bold text-[#6B5B95]">{stats.totalArtworks}</span>
              </div>
            </ArtworkFrame>
            
            <ArtworkFrame>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-medium">{language === 'ko' ? '좋아요' : 'Likes'}</span>
                </div>
                <span className="text-xl font-bold">{Math.floor(stats.totalArtworks * 0.7)}</span>
              </div>
            </ArtworkFrame>
          </div>
        </GallerySection>

        {/* 중앙 벽 - 최근 활동 */}
        <GallerySection 
          title={language === 'ko' ? '전시 기록' : 'Exhibition Records'}
          subtitle={language === 'ko' ? '방문한 전시회' : 'Visited Exhibitions'}
        >
          <div className="space-y-4">
            <ArtworkFrame label={language === 'ko' ? '이번 달' : 'This Month'}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <span className="font-medium">{language === 'ko' ? '전시 방문' : 'Exhibitions'}</span>
                </div>
                <span className="text-2xl font-bold text-blue-500">{stats.exhibitionsVisited}</span>
              </div>
            </ArtworkFrame>
            
            {stats.recentActivity && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {stats.recentActivity}
                </p>
              </div>
            )}
          </div>
        </GallerySection>

        {/* 오른쪽 벽 - 성취 */}
        <GallerySection 
          title={language === 'ko' ? '큐레이터 레벨' : 'Curator Level'}
          subtitle={`${user.totalPoints.toLocaleString()} ${language === 'ko' ? '포인트' : 'points'}`}
        >
          <div className="space-y-4">
            <ArtworkFrame isHighlight>
              <div className="text-center py-2">
                <Trophy className="w-12 h-12 text-[#6B5B95] mx-auto mb-2" />
                <p className="text-3xl font-bold text-[#6B5B95]">Lv.{user.level}</p>
              </div>
            </ArtworkFrame>
            
            {/* 진행률 바 - 갤러리 통로처럼 */}
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#6B5B95] to-[#8B7BAB]"
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {language === 'ko' ? '다음 레벨까지 35%' : '35% to next level'}
              </p>
            </div>
          </div>
        </GallerySection>
      </div>

      {/* 하단 - 특별 전시실 (AI 아트 프로필) */}
      <motion.div
        className="bg-gradient-to-br from-[#6B5B95]/5 to-transparent rounded-3xl p-8 border border-[#6B5B95]/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
            </h3>
            <p className="text-gray-600">
              {language === 'ko' 
                ? 'AI가 당신의 예술적 정체성을 시각화합니다' 
                : 'AI visualizes your artistic identity'}
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-6 py-3 bg-[#6B5B95] text-white rounded-xl font-medium shadow-lg"
            whileHover={{ scale: 1.05, shadow: "0 8px 30px rgba(107,91,149,0.3)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-5 h-5" />
            {language === 'ko' ? '생성하기' : 'Generate'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}