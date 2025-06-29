'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, MessageCircle, Calendar, Trophy, 
  Sparkles, Heart, Share2, TrendingUp 
} from 'lucide-react';

interface PersonalityLoungeProps {
  userType: string;
  userId: string;
}

export const PersonalityLounge: React.FC<PersonalityLoungeProps> = ({ userType, userId }) => {
  const [loungeData, setLoungeData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('feed');

  // 타입별 라운지 정보
  const loungeInfo = {
    GAMF: {
      name: '트렌드세터 큐레이터',
      emoji: '🚀',
      theme: {
        primary: '#FF6B6B',
        secondary: '#FFA07A',
        gradient: 'from-red-500 to-orange-500'
      },
      welcomeMessage: '새로운 예술 트렌드를 함께 만들어가요!'
    }
    // ... 16개 타입별 정보
  };

  const currentLounge = loungeInfo[userType] || loungeInfo.GAMF;

  // 라운지 피드 컴포넌트
  const LoungeFeed = () => (
    <div className="space-y-4">
      {/* 오늘의 발견 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          오늘의 발견
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer"
          >
            <img 
              src="/images/discovery1.jpg" 
              alt="발견 작품"
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="flex flex-col justify-center">
            <h4 className="font-semibold text-white mb-2">
              "이런 작품 처음 봐요!"
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              @아트러버님이 발견한 숨은 명작
            </p>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 text-pink-400 hover:text-pink-300">
                <Heart className="w-4 h-4" />
                <span className="text-sm">234</span>
              </button>
              <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">45</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 이번 주 전시 모임 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          이번 주 전시 모임
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <h4 className="font-semibold text-white">
                서울시립미술관 - "디지털 아트의 미래"
              </h4>
              <p className="text-sm text-gray-400 mt-1">
                토요일 오후 2시 • 12명 참여 중
              </p>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity">
              참여하기
            </button>
          </div>
        </div>
      </motion.div>

      {/* 타입별 통계 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          우리 타입의 취향 분석
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">가장 좋아하는 작가</span>
            <span className="text-white font-semibold">뱅크시 (42%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">선호하는 미술관</span>
            <span className="text-white font-semibold">리움미술관 (38%)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">평균 관람 시간</span>
            <span className="text-white font-semibold">2시간 30분</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // 매칭 탭
  const MatchingTab = () => (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          취향 궁합 매칭
        </h3>
        
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <span className="text-4xl">🎯</span>
          </div>
          <h4 className="text-2xl font-bold text-white mb-2">95% 매치!</h4>
          <p className="text-gray-300 mb-6">
            @아트매니아 님과 취향이 거의 일치해요
          </p>
          <button className="px-6 py-3 bg-white text-purple-600 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            대화 시작하기
          </button>
        </div>
      </motion.div>

      {/* 다른 타입과의 궁합 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          다른 타입과의 케미
        </h3>
        
        <div className="space-y-3">
          {['SREF', 'GAMC', 'GREC'].map((type, index) => (
            <div key={type} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{['🌙', '📸', '☕'][index]}</span>
                <div>
                  <p className="text-white font-medium">
                    {['고독한 몽상가', '미술관 인플루언서', '감성 토론가'][index]}
                  </p>
                  <p className="text-sm text-gray-400">
                    {['깊이 있는 대화', '활발한 교류', '감성적 공감'][index]}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-purple-400">
                  {[85, 72, 90][index]}%
                </p>
                <p className="text-xs text-gray-400">궁합도</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // 챌린지 탭
  const ChallengeTab = () => (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30"
      >
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          이번 주 챌린지
        </h3>
        
        <div className="text-center">
          <h4 className="text-2xl font-bold text-white mb-2">
            "숨은 명작 찾기"
          </h4>
          <p className="text-gray-300 mb-4">
            잘 알려지지 않은 작가의 작품을 발견하고 공유해주세요
          </p>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">127</p>
              <p className="text-sm text-gray-400">참여자</p>
            </div>
            <div className="w-px h-12 bg-gray-600" />
            <div className="text-center">
              <p className="text-3xl font-bold text-green-400">89</p>
              <p className="text-sm text-gray-400">발견 작품</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full font-semibold hover:opacity-90 transition-opacity">
            챌린지 참여하기
          </button>
        </div>
      </motion.div>

      {/* 지난 챌린지 우승자 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
      >
        <h3 className="text-xl font-bold text-white mb-4">
          지난 주 우승자
        </h3>
        
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl border border-yellow-500/20">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
            <span className="text-2xl">👑</span>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-semibold">@예술탐험가</h4>
            <p className="text-gray-400 text-sm">
              "색채의 마술사" 챌린지 우승
            </p>
          </div>
          <div className="text-right">
            <p className="text-yellow-400 font-bold">+500</p>
            <p className="text-xs text-gray-400">포인트</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* 라운지 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r ${currentLounge.theme.gradient} p-8 rounded-3xl mb-8`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-5xl">{currentLounge.emoji}</span>
              {currentLounge.name} 라운지
            </h1>
            <p className="text-white/80 text-lg">
              {currentLounge.welcomeMessage}
            </p>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-sm">현재 접속</p>
            <p className="text-3xl font-bold text-white">234명</p>
          </div>
        </div>
      </motion.div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'feed', label: '피드', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'matching', label: '매칭', icon: <Users className="w-4 h-4" /> },
          { id: 'challenge', label: '챌린지', icon: <Trophy className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'feed' && <LoungeFeed />}
          {activeTab === 'matching' && <MatchingTab />}
          {activeTab === 'challenge' && <ChallengeTab />}
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          {/* 내 프로필 카드 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
              <div>
                <h3 className="text-white font-semibold">내 프로필</h3>
                <p className="text-sm text-gray-400">{currentLounge.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-white">42</p>
                <p className="text-xs text-gray-400">발견</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">127</p>
                <p className="text-xs text-gray-400">팔로워</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">89%</p>
                <p className="text-xs text-gray-400">활동</p>
              </div>
            </div>
          </motion.div>

          {/* 라운지 멤버 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              활발한 멤버
            </h3>
            <div className="space-y-3">
              {['아트러버', '갤러리킹', '전시매니아'].map((name, index) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">@{name}</p>
                    <p className="text-xs text-gray-400">
                      {['방금 전', '5분 전', '10분 전'][index]}
                    </p>
                  </div>
                  <button className="text-purple-400 hover:text-purple-300">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityLounge;