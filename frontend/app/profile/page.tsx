'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/lib/responsive';
import { useActivityTracker } from '@/hooks/useActivityTracker';
import dynamic from 'next/dynamic';

// Lazy load mobile component
const MobileProfile = dynamic(() => import('@/components/mobile/MobileProfile'), {
  ssr: false
});
import { followAPI } from '@/lib/follow-api';
import { profileApi } from '@/lib/profile-api';
import { getPioneerProfile } from '@/lib/api/pioneer';
import { PioneerBadge } from '@/components/ui/PioneerBadge';
import PersonalArtMap from '@/components/artmap/PersonalArtMap';
import ExhibitionRecord from '@/components/exhibition/ExhibitionRecord';
import ExhibitionArchiveForm from '@/components/exhibition/ExhibitionArchiveForm';
import BadgeSystem from '@/components/gamification/BadgeSystem';
import { useGamificationV2 } from '@/hooks/useGamificationV2';
import { Trophy, MapPin, BookOpen, Settings, LogIn, Palette, Share2, Sparkles, User, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { personalityDescriptions } from '@/data/personality-descriptions';
import { personalityGradients, getGradientStyle } from '@/constants/personality-gradients';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import CompactStats from '@/components/profile/CompactStats';
import ProfileShareCard from '@/components/profile/ProfileShareCard';
import ProfileIDCard from '@/components/profile/ProfileIDCard';
import SocialLoginModal from '@/components/SocialLoginModal';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { JourneySection } from '@/components/profile/JourneySection';
import ShareModal from '@/components/share/ShareModal';
import ProfileCompletion from '@/components/dashboard/ProfileCompletion';
// import { useGamificationDashboard } from '@/hooks/useGamification';

// Mock data - in real app, would fetch from API
const mockMuseums = [
  {
    id: '1',
    name: 'National Museum of Modern and Contemporary Art',
    location: { lat: 37.5789, lng: 126.9770 },
    visitCount: 5,
    lastVisit: '2024-01-15',
    favorite: true,
    type: 'visited' as const
  },
  {
    id: '2',
    name: 'Leeum Samsung Museum',
    location: { lat: 37.5385, lng: 127.0050 },
    visitCount: 3,
    lastVisit: '2024-01-10',
    type: 'visited' as const
  },
  {
    id: '3',
    name: 'Seoul Museum of Art',
    location: { lat: 37.5640, lng: 126.9750 },
    visitCount: 0,
    type: 'wishlist' as const
  },
  {
    id: '4',
    name: 'Arario Museum',
    location: { lat: 37.5720, lng: 126.9870 },
    visitCount: 0,
    type: 'nearby' as const
  }
];

const mockVisits = [
  {
    id: '1',
    exhibitionId: 'ex1',
    exhibitionTitle: '론 뮤익: 거대한 인간',
    museum: '국립현대미술관 서울관',
    visitDate: '2025-04-20',
    duration: 120,
    rating: 5,
    photos: ['photo1', 'photo2'],
    notes: '실물 크기를 뛰어넘는 조각들이 전하는 압도적인 감동. 특히 신생아 조각 앞에서 한참을 머물렀다.',
    artworks: [
      { id: 'a1', title: '매스', artist: 'Ron Mueck', liked: true },
      { id: 'a2', title: '젊은 연인', artist: 'Ron Mueck', liked: true },
      { id: 'a3', title: '쇼핑하는 여인', artist: 'Ron Mueck', liked: false }
    ],
    badges: ['First Visit', 'Art Lover'],
    points: 150
  },
  {
    id: '2',
    exhibitionId: 'ex2',
    exhibitionTitle: '한국현대미술 하이라이트',
    museum: '국립현대미술관 서울관',
    visitDate: '2025-05-10',
    duration: 90,
    rating: 4,
    photos: ['photo3'],
    notes: '한국 현대미술의 다양한 스펙트럼을 한 자리에서. 이우환의 여백의 미학이 특히 인상적이었다.',
    artworks: [
      { id: 'a4', title: '무제', artist: '이우환', liked: true },
      { id: 'a5', title: '사이', artist: '서도호', liked: true }
    ],
    points: 100
  }
];

const mockBadges = [
  {
    id: 'first-visit',
    name: { en: 'First Steps', ko: '첫 발걸음' },
    description: { en: 'Complete your first museum visit', ko: '첫 미술관 방문을 완료하세요' },
    icon: <MapPin className="w-6 h-6" />,
    color: 'green',
    unlocked: true,
    rarity: 'common' as const,
    unlockedAt: '2024-01-10'
  },
  {
    id: 'art-lover',
    name: { en: 'Art Lover', ko: '예술 애호가' },
    description: { en: 'Like 10 artworks', ko: '10개의 작품에 좋아요를 누르세요' },
    icon: <Trophy className="w-6 h-6" />,
    color: 'purple',
    unlocked: true,
    progress: 10,
    maxProgress: 10,
    rarity: 'rare' as const,
    unlockedAt: '2024-01-15'
  },
  {
    id: 'explorer',
    name: { en: 'Explorer', ko: '탐험가' },
    description: { en: 'Visit 5 different museums', ko: '5개의 다른 미술관을 방문하세요' },
    icon: <MapPin className="w-6 h-6" />,
    color: 'blue',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    rarity: 'epic' as const
  }
];

const mockUserStats = {
  level: 3,
  currentExp: 450,
  nextLevelExp: 1000,
  totalPoints: 2450,
  visitStreak: 5,
  totalVisits: 8,
  totalArtworks: 25,
  totalPhotos: 12,
  averageVisitDuration: 87,
  favoriteArtStyle: 'Contemporary Abstract',
  lastVisitDate: '2024-01-15',
  followerCount: 0,
  followingCount: 0
};

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { trackProfileView } = useActivityTracker();
  const [isClient, setIsClient] = useState(false);
  const [renderMobile, setRenderMobile] = useState(false);
  
  // Gamification V2 Hook 사용
  const { 
    stats: gameStats, 
    loading: gameLoading,
    handleCreateExhibitionRecord 
  } = useGamificationV2();
  
  // All hooks must be declared before any conditional returns
  const [activeTab, setActiveTab] = useState<'journey' | 'map' | 'records' | 'badges' | 'share'>('records');
  const [redirecting, setRedirecting] = useState(false);
  const [userPersonalityType, setUserPersonalityType] = useState<string | null>(null);
  const [pioneerProfile, setPioneerProfile] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followStats, setFollowStats] = useState({ followerCount: 0, followingCount: 0 });
  const [artProfile, setArtProfile] = useState<any>(null);
  const [loadingArtProfile, setLoadingArtProfile] = useState(true);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [showArchiveForm, setShowArchiveForm] = useState(false);
  const [profileVisitCount, setProfileVisitCount] = useState(1);
  
  // Temporarily disabled due to API issues
  // const { dashboard } = useGamificationDashboard();
  const dashboard = null;
  const userPoints = dashboard?.currentPoints || 0;
  const userStats = dashboard;
  
  // Handle client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setRenderMobile(isMobile);
  }, [isMobile]);

  // Track profile page visit and update visit count
  useEffect(() => {
    if (user && isClient) {
      console.log('📊 Profile page visit tracking:');
      console.log('User ID:', user.id);
      console.log('isClient:', isClient);
      
      // Skip API tracking due to errors, just update localStorage
      // trackProfileView();
      
      // Update visit count in localStorage
      const storageKey = `profile_visits_${user.id}`;
      const currentVisits = parseInt(localStorage.getItem(storageKey) || '0');
      const newVisitCount = currentVisits === 0 ? 1 : currentVisits + 1;  // 첫 방문이면 1, 아니면 +1
      localStorage.setItem(storageKey, newVisitCount.toString());
      setProfileVisitCount(newVisitCount);
      
      console.log('📈 Profile visit count details:');
      console.log('Storage key:', storageKey);
      console.log('Previous visits:', currentVisits);
      console.log('New visit count:', newVisitCount);
      console.log('State updated to:', newVisitCount);
    }
  }, [user, isClient]); // Removed trackProfileView dependency to avoid API errors

  // Load visit count on component mount
  useEffect(() => {
    if (user && isClient) {
      const storageKey = `profile_visits_${user.id}`;
      const savedVisits = parseInt(localStorage.getItem(storageKey) || '1');  // 기본값을 1로 변경
      setProfileVisitCount(savedVisits);
      
      console.log('🔄 Loading saved visit count:');
      console.log('Storage key:', storageKey);
      console.log('Saved visits:', savedVisits);
    }
  }, [user, isClient]);
  
  // Check if profile is completed
  useEffect(() => {
    console.log('=== Profile Completion Check ===');
    console.log('User:', user);
    console.log('isMobile:', isMobile);
    console.log('profile_completed_at:', user?.profile?.profile_completed_at);
    console.log('localStorage profile_completed:', localStorage.getItem('profile_completed'));
    console.log('localStorage profile_skipped:', localStorage.getItem('profile_skipped'));
    
    if (user && isClient) {  // Show on both desktop and mobile after client is ready
      const profileCompletedAt = user?.profile?.profile_completed_at;
      const hasCompletedProfile = profileCompletedAt || localStorage.getItem('profile_completed') || localStorage.getItem('profile_skipped');
      
      console.log('hasCompletedProfile:', hasCompletedProfile);
      
      if (!hasCompletedProfile) {
        console.log('>>> Showing ProfileCompletion');
        setShowProfileCompletion(true);
      } else {
        console.log('>>> Not showing ProfileCompletion (already completed/skipped)');
      }
    } else {
      console.log('>>> Not showing ProfileCompletion (no user or not client)');
    }
  }, [user, isMobile, isClient]);
  
  // ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showProfileCompletion) {
        setShowProfileCompletion(false);
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showProfileCompletion]);
  
  // Load quiz results from localStorage
  // 프로필 완성 모달 표시 로직 - All hooks must be declared before conditional returns
  useEffect(() => {
    // 모달 대신 온보딩이 아래에 있다는 알림만 표시
    if (user && !localStorage.getItem('onboarding_notification_shown')) {
      // 페이지 로드 후 2초 뒤에 알림 표시
      const timer = setTimeout(() => {
        const notification = document.createElement('div');
        notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slide-down flex items-center gap-2';
        notification.innerHTML = `
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
          <span>${language === 'ko' ? '7일 여정이 아래에 준비되어 있습니다' : '7-Day Journey is ready below'}</span>
        `;
        document.body.appendChild(notification);
        
        // 5초 후 알림 제거
        setTimeout(() => {
          notification.style.opacity = '0';
          notification.style.transition = 'opacity 0.5s';
          setTimeout(() => notification.remove(), 500);
        }, 5000);
        
        // 한 번만 표시하도록 설정
        localStorage.setItem('onboarding_notification_shown', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, language]);

  useEffect(() => {
    // Check URL params first for new users coming from auth
    const urlParams = new URLSearchParams(window.location.search);
    const aptFromUrl = urlParams.get('apt');
    const isNewUser = urlParams.get('new_user') === 'true';
    
    if (aptFromUrl && isNewUser) {
      // New user with APT from auth callback
      console.log('New user with APT:', aptFromUrl);
      setUserPersonalityType(aptFromUrl);
      
      // Save to DB via API
      const quizData = {
        personalityType: aptFromUrl,
        scores: {},
        responses: [],
        completedAt: new Date().toISOString()
      };
      
      // Clean up URL
      window.history.replaceState({}, '', '/profile');
      
      // Sync to backend
      import('@/lib/quiz-api').then(({ saveQuizResultsWithSync }) => {
        saveQuizResultsWithSync(quizData).catch(console.error);
      });
    } else if (user?.personalityType) {
      // Use personality type from user object (loaded from DB)
      console.log('Profile - Using personality type from DB:', user.personalityType);
      setUserPersonalityType(user.personalityType);
    } else {
      // Fallback to localStorage for backward compatibility
      const quizResults = localStorage.getItem('quizResults');
      if (quizResults) {
        try {
          const results = JSON.parse(quizResults);
          setUserPersonalityType(results.personalityType);
          console.log('Profile - Using personality type from localStorage:', results.personalityType);
          
          // Migrate to DB if user is logged in
          if (user?.id) {
            import('@/lib/quiz-api').then(({ saveQuizResultsWithSync }) => {
              saveQuizResultsWithSync(results).catch(console.error);
            });
          }
        } catch (e) {
          console.error('Error parsing quiz results:', e);
        }
      }
    }
  }, [user]);

  // Load pioneer profile if user is authenticated
  useEffect(() => {
    const loadPioneerProfile = async () => {
      if (user?.auth?.id) {
        try {
          // Temporarily disabled due to API issues
          // const profile = await getPioneerProfile(user.auth.id);
          // setPioneerProfile(profile);
        } catch (error) {
          console.error('Failed to load pioneer profile:', error);
        }
      }
    };
    loadPioneerProfile();
  }, [user]);

  // Load AI art profile
  useEffect(() => {
    const loadArtProfile = async () => {
      if (user?.auth?.id) {
        try {
          setLoadingArtProfile(true);
          // For now, just set a placeholder since getUserProfiles doesn't exist
          // In real implementation, you would call the actual API method
          // Sample AI art profile for testing
          setArtProfile({
            imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
            style: 'Digital Art Portrait'
          });
        } catch (error) {
          console.error('Failed to load art profile:', error);
        } finally {
          setLoadingArtProfile(false);
        }
      }
    };
    loadArtProfile();
  }, [user]);

  useEffect(() => {
    // Remove Facebook OAuth hash fragment
    if (window.location.hash === '#_=_') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    
    // Only show login modal if user is not logged in and not redirecting
    if (!user && !redirecting) {
      // Check if we just came from OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const fromOAuth = urlParams.get('from') === 'oauth' || window.location.hash === '#_=_';
      
      // Don't show modal immediately after OAuth callback
      if (!fromOAuth) {
        setShowLoginModal(true);
      }
    }
  }, [user, redirecting]);

  // Load follow stats
  useEffect(() => {
    if (user?.auth?.id) {
      loadFollowStats();
    }
  }, [user]);

  const loadFollowStats = async () => {
    try {
      // Temporarily use mock data due to API issues
      setFollowStats({
        followerCount: 12,
        followingCount: 8
      });
      // const stats = await followAPI.getFollowStats(user!.auth.id);
      // setFollowStats({
      //   followerCount: stats.followersCount,
      //   followingCount: stats.followingCount
      // });
    } catch (error) {
      console.error('Failed to load follow stats:', error);
    }
  };
  
  // All conditional returns must be after all hooks
  // Show loading on initial render to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen sayu-gradient-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }
  
  // Render mobile component for mobile devices
  if (renderMobile) {
    return <MobileProfile 
      gameStats={gameStats}
      user={user}
    />;
  }



  // TEMPORARY: Login check disabled for testing
  /*
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center sayu-gradient-bg">
        <motion.div 
          className="text-center sayu-liquid-glass rounded-2xl p-8 max-w-md w-full mx-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <LogIn className="w-10 h-10 text-white" />
          </motion.div>
          
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ko' ? '로그인이 필요합니다' : 'Login Required'}
          </h2>
          <p className="opacity-70 mb-6">
            {language === 'ko' 
              ? '프로필을 보려면 로그인해주세요.' 
              : 'Please login to view your profile.'
            }
          </p>
          
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {language === 'ko' ? '로그인하기' : 'Go to Login'}
            </Button>
            
            <p className="text-sm opacity-60 mt-4">
              {language === 'ko' 
                ? '잠시 후 자동으로 로그인 페이지로 이동합니다...' 
                : 'Redirecting to login page...'
              }
            </p>
          </div>
        </motion.div>
      </div>
    );
  }
  */

  return (
    <div className="min-h-screen sayu-gradient-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Profile Completion Modal */}
        {showProfileCompletion && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProfileCompletion(false)}
          >
            <div 
              className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <ProfileCompletion
                onComplete={() => {
                  setShowProfileCompletion(false);
                  localStorage.setItem('profile_completed', 'true');
                }}
                onSkip={() => {
                  setShowProfileCompletion(false);
                  localStorage.setItem('profile_skipped', 'true');
                }}
              />
            </div>
          </div>
        )}
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sayu-liquid-glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Profile image with AI art overlay */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {artProfile?.imageUrl ? (
                    <img 
                      src={artProfile.imageUrl} 
                      alt="AI Art Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.nickname?.[0] || user?.auth?.email?.[0] || 'U'
                  )}
                </div>
                {artProfile && (
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{user?.nickname || user?.auth?.email || 'Anonymous'}</h1>
                  
                  {/* Personality Type Badge - Inline with name */}
                  {userPersonalityType && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="inline-flex ml-0 sm:ml-2 mt-2 sm:mt-0"
                    >
                      <div 
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-bold inline-flex items-center gap-1.5 sm:gap-2 shadow-xl transform hover:scale-105 transition-transform"
                        style={{ 
                          background: getGradientStyle(userPersonalityType as keyof typeof personalityGradients) || 
                                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <Palette className="w-4 h-4" />
                        <span className="tracking-wider">{userPersonalityType}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {pioneerProfile?.pioneer_number && (
                    <PioneerBadge 
                      pioneerNumber={pioneerProfile.pioneer_number}
                      size="md"
                      variant="default"
                      showAnimation={true}
                    />
                  )}
                </div>
                
                {/* Personality Description - Subtitle */}
                {userPersonalityType && (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-base font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                    >
                      {personalityGradients[userPersonalityType as keyof typeof personalityGradients]?.name || 
                       personalityDescriptions[userPersonalityType]?.title || 
                       '창의적인 예술 탐험가'}
                    </span>
                    {artProfile?.style && (
                      <>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-300">
                          AI Style: {artProfile.style}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log('🎨 AI Art Profile button clicked at:', new Date().toISOString());
                  console.log('Router object:', router);
                  
                  // Add visual feedback
                  const button = e.currentTarget;
                  button.style.opacity = '0.5';
                  
                  // router.push doesn't return a promise in Next.js App Router
                  try {
                    router.push('/profile/art-profile');
                    console.log('✅ Navigation initiated');
                  } catch (error) {
                    console.error('❌ Navigation error:', error);
                    button.style.opacity = '1';
                    // Fallback to window.location
                    console.log('🔄 Trying fallback navigation...');
                    window.location.href = '/profile/art-profile';
                  }
                }}
                title={language === 'ko' ? 'AI 아트 프로필' : 'AI Art Profile'}
              >
                <Sparkles className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowIDCard(true)}
                title={language === 'ko' ? 'ID 카드 보기' : 'View ID Card'}
              >
                <Trophy className="w-5 h-5" />
              </motion.button>
              {/* 프로필 완성 버튼 - 더 subtle하게 */}
              <motion.button
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 backdrop-blur-sm text-gray-500 dark:text-gray-400 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // 온보딩 섹션으로 스크롤
                  const journeySection = document.getElementById('journey-section');
                  if (journeySection) {
                    journeySection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                title={language === 'ko' ? '7일 여정 보기' : 'View 7-Day Journey'}
              >
                <User className="w-5 h-5" />
              </motion.button>
              <motion.button
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-sm text-gray-700 dark:text-gray-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettings(true)}
                title={language === 'ko' ? '설정' : 'Settings'}
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Compact Stats - 실제 데이터 사용 */}
        <div className="mb-6 -mt-3">
          {console.log('🎯 Before passing to CompactStats - profileVisitCount:', profileVisitCount)}
          <CompactStats 
            stats={{
              ...(gameStats ? {
                level: gameStats.level,
                currentExp: gameStats.current_exp,
                nextLevelExp: gameStats.nextLevelExp,
                totalPoints: gameStats.total_points,
                visitStreak: 0, // TODO: 연속 방문 구현
                totalVisits: profileVisitCount, // 프로필 방문 수
                totalArtworks: 0, // TODO: 작품 수 구현
                totalPhotos: 0, // TODO: 사진 수 구현
              } : {
                level: 1,
                currentExp: 0,
                nextLevelExp: 1000,
                totalPoints: 0,
                visitStreak: 0,
                totalVisits: profileVisitCount,
                totalArtworks: 0,
                totalPhotos: 0,
                averageVisitDuration: 0,
                favoriteArtStyle: '',
                lastVisitDate: ''
              }),
              followerCount: gameStats?.followerCount || followStats.followerCount,
              followingCount: gameStats?.followingCount || followStats.followingCount
            }} 
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'records' as const, icon: BookOpen, label: { en: 'Records', ko: '기록' } },
            { id: 'map' as const, icon: MapPin, label: { en: 'Art Map', ko: '아트맵' } },
            { id: 'journey' as const, icon: Sparkles, label: { en: 'Journey', ko: '여정' } },
            { id: 'badges' as const, icon: Trophy, label: { en: 'Badges', ko: '배지' } },
            { id: 'share' as const, icon: Share2, label: { en: 'Share', ko: '공유' } }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'sayu-liquid-glass hover:bg-white/20 text-gray-700 dark:text-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label[language]}
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'journey' && (
            <JourneySection />
          )}
          
          {activeTab === 'map' && (
            <PersonalArtMap
              museums={mockMuseums}
              userLocation={{ lat: 37.5665, lng: 126.9780 }}
              onMuseumClick={(museum) => console.log('Museum clicked:', museum)}
            />
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {language === 'ko' ? '전시 기록' : 'Exhibition Records'}
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                  <span className="text-sm text-gray-300 text-center sm:text-left">
                    {mockVisits.length} {language === 'ko' ? '개의 기록' : 'records'}
                  </span>
                  <motion.button
                    onClick={() => setShowArchiveForm(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl text-white font-medium transition-all shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="w-4 h-4" />
                    {language === 'ko' ? '새 기록 작성' : 'Create New Record'}
                  </motion.button>
                </div>
              </div>
              
              {mockVisits.map((visit) => (
                <ExhibitionRecord
                  key={visit.id}
                  visit={visit}
                  onEdit={() => console.log('Edit visit:', visit.id)}
                  onShare={() => console.log('Share visit:', visit.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'badges' && (
            <BadgeSystem
              badges={mockBadges}
              userStats={gameStats ? {
                level: gameStats.level,
                currentExp: gameStats.current_exp,
                nextLevelExp: gameStats.nextLevelExp,
                totalPoints: gameStats.total_points,
                visitStreak: 0,
                totalVisits: 0,
                totalArtworks: 0,
                totalPhotos: 0
              } : {
                level: 1,
                currentExp: 0,
                nextLevelExp: 1000,
                totalPoints: 0,
                visitStreak: 0,
                totalVisits: profileVisitCount,
                totalArtworks: 0,
                totalPhotos: 0
              }}
              onBadgeClick={(badge) => console.log('Badge clicked:', badge)}
            />
          )}
          
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center">
                <h2 className="text-xl font-bold mb-4">
                  {language === 'ko' ? '내 APT 결과 공유하기' : 'Share My APT Result'}
                </h2>
                <p className="text-gray-300 mb-6">
                  {language === 'ko' 
                    ? '나의 예술 성향을 친구들과 공유해보세요' 
                    : 'Share your art personality with friends'}
                </p>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  {language === 'ko' ? '공유하기' : 'Share'}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Settings Modal */}
      <ProfileSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        userInfo={{
          nickname: user?.nickname || undefined,
          email: user?.auth?.email,
          personalityType: userPersonalityType
        }}
        onUpdate={async (updates) => {
          // 화면 새로고침으로 업데이트된 정보 반영
          window.location.reload();
        }}
      />

      {/* Profile ID Card Modal */}
      {showIDCard && userPersonalityType && (
        <ProfileIDCard
          personalityType={userPersonalityType}
          userName={user?.nickname || user?.auth?.email || 'SAYU Explorer'}
          userLevel={gameStats?.level || 1}
          userPoints={gameStats?.total_points || 0}
          stats={{
            exhibitionsVisited: userStats?.totalExhibitions || 0,
            achievementsUnlocked: userStats?.achievements?.filter((a: any) => a.unlockedAt).length || mockBadges.filter(b => b.unlocked).length,
            companionsMetCount: 0 // This would come from evaluation system
          }}
          recentExhibitions={
            userStats?.recentAchievements?.slice(0, 3).map((achievement: any) => ({
              name: achievement.name,
              date: new Date(achievement.unlockedAt || Date.now()).toLocaleDateString()
            })) || []
          }
          plannedExhibitions={[
            { name: '모네의 정원: 빛과 색의 향연', venue: '국립현대미술관' },
            { name: 'Van Gogh Alive Experience', venue: 'DDP 디자인랩' },
            { name: '디지털 아트 페스티벌', venue: '롯데월드타워' }
          ]}
          topAchievements={
            userStats?.achievements?.filter((a: any) => a.unlockedAt).slice(0, 3).map((achievement: any) => ({
              name: language === 'ko' ? achievement.name_ko : achievement.name,
              icon: achievement.icon
            })) || mockBadges.filter(b => b.unlocked).slice(0, 3).map(badge => ({
              name: language === 'ko' ? badge.name.ko : badge.name.en,
              icon: '🏆'
            }))
          }
          onClose={() => setShowIDCard(false)}
        />
      )}

      {/* Login Modal for unauthorized users */}
      <SocialLoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          router.push('/');
        }}
        onSuccess={() => {
          setShowLoginModal(false);
          window.location.reload();
        }}
        language={language}
      />

      {/* Share Modal */}
      {showShareModal && userPersonalityType && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          quizResult={{
            personalityType: userPersonalityType,
            scores: {},
            responses: []
          }}
        />
      )}

      {/* Exhibition Archive Form Modal */}
      <ExhibitionArchiveForm
        isOpen={showArchiveForm}
        onClose={() => setShowArchiveForm(false)}
        onSave={async (data) => {
          try {
            // Convert data to match API interface
            const exhibitionData = {
              exhibitionId: Date.now().toString(), // Generate temporary ID
              exhibitionTitle: data.exhibitionTitle,
              museum: data.museum,
              visitDate: data.visitDate,
              duration: data.duration,
              rating: data.rating,
              notes: data.notes,
              artworks: data.artworks,
              points: Math.floor(data.duration / 10) + (data.rating * 20), // Calculate points based on duration and rating
              badges: [], // Will be calculated by backend
              photos: data.photos > 0 ? [`photo_${Date.now()}_${Math.random()}`] : [] // Mock photo IDs
            };

            console.log('Saving exhibition record:', exhibitionData);
            
            // Save to backend
            await profileApi.createExhibitionVisit(exhibitionData);
            
            // TODO: Refresh the visit list
            console.log('Exhibition record saved successfully!');
            
            setShowArchiveForm(false);
          } catch (error) {
            console.error('Failed to save exhibition record:', error);
            // TODO: Show user-friendly error message
            alert(language === 'ko' ? '저장에 실패했습니다. 다시 시도해주세요.' : 'Failed to save. Please try again.');
          }
        }}
      />

      {/* Fixed Feedback Button */}
      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'profile',
          personalityType: userPersonalityType,
          userLevel: gameStats?.level || 1
        }}
      />

    </div>
  );
}