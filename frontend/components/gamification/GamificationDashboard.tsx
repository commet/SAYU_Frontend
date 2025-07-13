'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import ProfileLevel from './ProfileLevel';
import TitleBadges from './TitleBadges';
import ExhibitionMode from './ExhibitionMode';

interface DashboardStats {
  level: number;
  levelName: string;
  currentPoints: number;
  totalPoints: number;
  nextLevelPoints: number;
  weeklyStreak: number;
  totalExhibitions: number;
  averageDuration: number;
  mainTitle: string;
  recentAchievements: Achievement[];
  upcomingChallenges: Challenge[];
  leaderboardRank?: number;
  friendsActivity?: FriendActivity[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedAt: Date;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  expiresAt: Date;
}

interface FriendActivity {
  userId: string;
  userName: string;
  action: string;
  timestamp: Date;
}

export default function GamificationDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'titles' | 'challenges' | 'social'>('overview');
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const router = useRouter();

  // WebSocket 연결 for 실시간 업데이트
  useEffect(() => {
    // TODO: Socket.io 연결 구현
    const mockSocket = {
      on: (event: string, handler: Function) => {
        if (event === 'levelUp') {
          setTimeout(() => {
            handler({ newLevel: 28, rewards: ['+100 포인트', '새로운 칭호 해금'] });
            triggerLevelUpCelebration();
          }, 5000);
        }
      }
    };
    
    mockSocket.on('levelUp', handleLevelUp);
    mockSocket.on('achievementUnlocked', handleNewAchievement);
    
    return () => {
      // socket.disconnect();
    };
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    // TODO: 실제 API 호출
    const mockStats: DashboardStats = {
      level: 27,
      levelName: "눈뜨는 중",
      currentPoints: 2750,
      totalPoints: 12750,
      nextLevelPoints: 3000,
      weeklyStreak: 5,
      totalExhibitions: 42,
      averageDuration: 95,
      mainTitle: "느긋한 산책자",
      recentAchievements: [
        {
          id: '1',
          title: 'K-아트 서포터',
          description: '한국 작가전 10회 달성',
          earnedAt: new Date(),
          points: 500,
          rarity: 'rare'
        }
      ],
      upcomingChallenges: [
        {
          id: '1',
          title: '주말 미술관 정복',
          description: '이번 주말 2개 이상 전시 관람',
          progress: 1,
          target: 2,
          reward: 200,
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      ],
      leaderboardRank: 127,
      friendsActivity: [
        {
          userId: '1',
          userName: '아트러버123',
          action: '《모네와 친구들》 전시 관람 완료',
          timestamp: new Date(Date.now() - 3600000)
        }
      ]
    };
    
    setStats(mockStats);
  };

  const handleLevelUp = (data: any) => {
    setShowLevelUpModal(true);
    triggerLevelUpCelebration();
  };

  const handleNewAchievement = (achievement: Achievement) => {
    setNewAchievement(achievement);
    setTimeout(() => setNewAchievement(null), 5000);
  };

  const triggerLevelUpCelebration = () => {
    // 컨페티 효과
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    // 진동 피드백 (모바일)
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  if (!stats) {
    return <div className="animate-pulse">로딩 중...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* 상단 요약 카드 */}
      <motion.div 
        className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* 레벨 표시 */}
          <div className="flex justify-center md:justify-start">
            <ProfileLevel size="large" />
          </div>
          
          {/* 주요 통계 */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {stats.mainTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                총 {stats.totalExhibitions}개 전시 | 평균 {stats.averageDuration}분 관람
              </p>
            </div>
            
            {/* 진행도 바 */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">다음 레벨까지</span>
                <span className="font-medium">
                  {stats.currentPoints} / {stats.nextLevelPoints} pts
                </span>
              </div>
              <div className="h-3 bg-white/50 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.currentPoints / stats.nextLevelPoints) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            
            {/* 주간 스트릭 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-2xl">🔥</span>
                <span className="font-bold text-orange-500">{stats.weeklyStreak}일 연속</span>
              </div>
              {stats.leaderboardRank && (
                <div className="flex items-center gap-1">
                  <span className="text-2xl">🏆</span>
                  <span className="font-medium">전체 {stats.leaderboardRank}위</span>
                </div>
              )}
            </div>
          </div>
          
          {/* 빠른 액션 */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => router.push('/exhibitions')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              전시 찾아보기
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
            >
              도전 과제 보기
            </button>
          </div>
        </div>
      </motion.div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: '개요', icon: '📊' },
          { id: 'titles', label: '칭호', icon: '🏅' },
          { id: 'challenges', label: '도전과제', icon: '🎯' },
          { id: 'social', label: '소셜', icon: '👥' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              px-4 py-2 font-medium transition-all
              ${activeTab === tab.id 
                ? 'border-b-2 border-purple-600 text-purple-600' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'titles' && <TitleBadges showProgress={true} />}
          {activeTab === 'challenges' && <ChallengesTab challenges={stats.upcomingChallenges} />}
          {activeTab === 'social' && <SocialTab friends={stats.friendsActivity} />}
        </motion.div>
      </AnimatePresence>

      {/* 레벨업 모달 */}
      <AnimatePresence>
        {showLevelUpModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLevelUpModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-md mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-2">레벨업!</h2>
                <p className="text-xl text-gray-600 mb-4">
                  이제 <span className="font-bold text-purple-600">Lv.28 눈뜨는 중</span>입니다!
                </p>
                <div className="space-y-2 mb-6">
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                    +100 보너스 포인트 획득
                  </div>
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                    새로운 칭호 해금: 갤러리 단골
                  </div>
                </div>
                <button
                  onClick={() => setShowLevelUpModal(false)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 성취 알림 토스트 */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl p-4 max-w-sm"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl">🏆</div>
              <div>
                <h4 className="font-bold text-gray-800">{newAchievement.title}</h4>
                <p className="text-sm text-gray-600">{newAchievement.description}</p>
                <p className="text-sm text-purple-600 font-medium mt-1">
                  +{newAchievement.points} 포인트
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 하위 컴포넌트들
function OverviewTab({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 최근 성취 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">🏆 최근 성취</h3>
        <div className="space-y-3">
          {stats.recentAchievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`
                w-2 h-12 rounded-full
                ${achievement.rarity === 'legendary' ? 'bg-gradient-to-b from-yellow-400 to-orange-500' :
                  achievement.rarity === 'epic' ? 'bg-purple-500' :
                  achievement.rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-400'}
              `} />
              <div className="flex-1">
                <div className="font-medium">{achievement.title}</div>
                <div className="text-sm text-gray-600">{achievement.description}</div>
              </div>
              <div className="text-sm font-medium text-purple-600">
                +{achievement.points}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📊 나의 아트 여정</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">총 방문 전시</span>
            <span className="font-bold text-xl">{stats.totalExhibitions}개</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">평균 관람 시간</span>
            <span className="font-bold text-xl">{stats.averageDuration}분</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">획득한 총 포인트</span>
            <span className="font-bold text-xl">{stats.totalPoints.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">현재 랭킹</span>
            <span className="font-bold text-xl">전체 {stats.leaderboardRank}위</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChallengesTab({ challenges }: { challenges: Challenge[] }) {
  return (
    <div className="space-y-4">
      {challenges.map((challenge) => (
        <motion.div
          key={challenge.id}
          className="bg-white rounded-lg shadow p-6"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-bold text-lg">{challenge.title}</h4>
              <p className="text-gray-600">{challenge.description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">+{challenge.reward}</div>
              <div className="text-xs text-gray-500">포인트</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행도</span>
              <span>{challenge.progress}/{challenge.target}</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {Math.ceil((challenge.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}일 남음
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SocialTab({ friends }: { friends?: FriendActivity[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">👥 친구 활동</h3>
        <div className="space-y-3">
          {friends?.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                {activity.userName[0]}
              </div>
              <div className="flex-1">
                <div className="font-medium">{activity.userName}</div>
                <div className="text-sm text-gray-600">{activity.action}</div>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}