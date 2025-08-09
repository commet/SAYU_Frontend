'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Grid3X3, Heart, Bookmark, User, Filter, Search, Loader2, ArrowLeft, Shuffle, ExternalLink, Eye, UserPlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ArtworkActions from '@/components/ui/ArtworkActions';
import ArtworkAttribution from '@/components/ui/ArtworkAttribution';
import { useLanguage } from '@/contexts/LanguageContext';
import { galleryApi, Artwork, FollowingArtist } from '@/lib/gallery-api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import toast from 'react-hot-toast';

// 새로운 컴포넌트들 import
import { SayuBeamsBackground } from '@/components/ui/sayu-beams-background';
import { Badge } from '@/components/ui/badge';
import { CategoryFilter, FloatingDock, MobileBottomNav, GalleryStats } from './gallery-components';
import { Gallery4 } from '@/components/ui/gallery4';
import { SayuGalleryGrid } from '@/components/ui/sayu-gallery-grid';
import { ChevronRight, LayoutGrid, List } from 'lucide-react';
import { aptRecommendations } from './sayu-recommendations';

interface UserProfile {
  id: string;
  sayuType: string;
  email: string;
  name: string;
  typeCode?: string;
  personalityType?: string;
}

interface GalleryArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium: string;
  department: string;
  culture?: string;
  period?: string;
  dimensions?: string;
  museumUrl?: string;
  isPublicDomain?: boolean;
  license?: string;
  matchPercent?: number;
  curatorNote?: string;
  description?: string;
}

const ART_CATEGORIES = [
  { id: 'all', name: '전체', icon: Sparkles },
  { id: 'paintings', name: '회화', metDepartment: 11 },
  { id: 'sculpture', name: '조각', metDepartment: 12 },
  { id: 'photography', name: '사진', metDepartment: 12 },
  { id: 'asian-art', name: '동양미술', metDepartment: 6 },
  { id: 'modern', name: '현대미술', metDepartment: 21 },
  { id: 'contemporary', name: '컨템포러리', metDepartment: 21 }
];

function GalleryContent() {
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams?.get('guest') === 'true';
  const [galleryArtworks, setGalleryArtworks] = useState<GalleryArtwork[]>([]);
  const [loading_artworks, setLoadingArtworks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [viewedArtworks, setViewedArtworks] = useState<Set<string>>(new Set());
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());
  
  // 새로운 통계 상태
  const [monthlyCollected, setMonthlyCollected] = useState(0);
  const [todayDiscovered, setTodayDiscovered] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState<any[]>([]);
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'list'>('masonry');

  // Load user profile and preferences
  useEffect(() => {
    if (user && !isGuestMode) {
      fetchUserProfile();
      loadUserPreferences();
    } else if (isGuestMode) {
      loadUserPreferences();
    }
  }, [user, isGuestMode]);

  // Load artworks when category changes
  useEffect(() => {
    console.log('🔄 useEffect triggered for category:', selectedCategory);
    fetchArtworks(selectedCategory);
  }, [selectedCategory]);

  // Load recommended artworks
  useEffect(() => {
    loadRecommendedArtworks();
  }, [userProfile, selectedCategory]);

  const fetchUserProfile = async () => {
    try {
      if (user) {
        setUserProfile({
          id: user.id,
          sayuType: user.personalityType || 'SREF',
          email: user.auth?.email || '',
          name: user.nickname || '',
          personalityType: user.personalityType || 'SREF',
          typeCode: user.typeCode || user.personalityType || 'SREF'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      const mockProfile: UserProfile = {
        id: 'guest',
        sayuType: 'SREF',
        email: '',
        name: 'Guest',
        typeCode: 'SREF',
        personalityType: 'SREF'
      };
      setUserProfile(mockProfile);
    }
  };

  const loadUserPreferences = async () => {
    // Check if in guest mode
    const guestMode = !user || isGuestMode;
    
    if (guestMode) {
      // For guest mode, load from guest storage
      const { GuestStorage } = await import('@/lib/guest-storage');
      const guestData = GuestStorage.getData();
      setLikedArtworks(new Set(guestData.savedArtworks));
      setViewedArtworks(new Set(guestData.viewedArtworks));
    } else {
      // For logged-in users, load from localStorage
      const liked = localStorage.getItem('likedArtworks');
      const viewed = localStorage.getItem('viewedArtworks');
      if (liked) setLikedArtworks(new Set(JSON.parse(liked)));
      if (viewed) setViewedArtworks(new Set(JSON.parse(viewed)));
    }
  };

  const saveUserPreferences = () => {
    localStorage.setItem('likedArtworks', JSON.stringify([...likedArtworks]));
    localStorage.setItem('viewedArtworks', JSON.stringify([...viewedArtworks]));
  };

  const loadRecommendedArtworks = async () => {
    try {
      // Import the new recommendation system
      const { getPersonalizedRecommendations } = await import('./artwork-recommendations');
      
      const userType = userProfile?.typeCode || userProfile?.personalityType || user?.aptType || 'SREF';
      const recommendations = getPersonalizedRecommendations(userType, selectedCategory);
      
      // Transform to match existing interface
      const formattedRecommendations = recommendations.slice(0, 5).map((rec, i) => ({
        id: rec.id || `rec-${i}`,
        title: rec.title,
        artist: rec.artist,
        year: rec.year,
        description: rec.description || rec.curatorNote,
        href: '#',
        image: rec.cloudinaryUrl || rec.imageUrl || `https://picsum.photos/600/400?random=rec${i}`,
        matchPercent: rec.matchPercent,
        curatorNote: rec.curatorNote
      }));
      
      setRecommendedArtworks(formattedRecommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendedArtworks([]);
    }
  };

  const fetchArtworks = async (category: string) => {
    console.log('🎨 fetchArtworks started for category:', category);
    console.log('🔄 Setting loading to true...');
    setLoadingArtworks(true);
    
    try {
      console.log('Fetching artworks for category:', category);
      
      // 유저의 APT 유형에 따른 맞춤 추천 작품 가져오기
      const getPersonalizedArtworks = async () => {
        try {
          const { getPersonalizedRecommendations } = await import('./artwork-recommendations');
          const userType = user?.aptType || userProfile?.typeCode || 'SREF';
          const recommendations = getPersonalizedRecommendations(userType, category);
          
          return recommendations.map((artwork, i) => ({
            id: artwork.id || `apt-${userType}-${i}`,
            title: artwork.title,
            artist: artwork.artist,
            year: artwork.year,
            imageUrl: artwork.cloudinaryUrl || artwork.imageUrl || 'https://via.placeholder.com/400x300',
            museum: artwork.museum || 'SAYU Curated Collection',
            medium: artwork.medium || 'Mixed Media',
            department: artwork.department || category,
            isPublicDomain: artwork.isPublicDomain !== undefined ? artwork.isPublicDomain : true,
            license: 'CC0',
            matchPercent: artwork.matchPercent,
            curatorNote: artwork.curatorNote,
            description: artwork.description
          }));
        } catch (error) {
          console.error('Error getting personalized artworks:', error);
          return [];
        }
      };
      
      // Get personalized artworks based on user type and category
      const personalizedArtworks = await getPersonalizedArtworks();
      
      // If we have personalized artworks, use them
      // Otherwise, get from recommendation system
      let selectedArtworks = [];
      
      if (personalizedArtworks.length > 0) {
        selectedArtworks = personalizedArtworks;
      } else {
        // Fallback: get recommendations from the system
        try {
          const { getRandomRecommendations } = await import('./artwork-recommendations');
          const fallbackArtworks = getRandomRecommendations(category);
          selectedArtworks = fallbackArtworks.map(artwork => ({
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist,
            year: artwork.year,
            imageUrl: artwork.cloudinaryUrl || artwork.imageUrl,
            museum: artwork.museum,
            medium: artwork.medium,
            department: artwork.department,
            isPublicDomain: artwork.isPublicDomain,
            license: 'CC0',
            matchPercent: artwork.matchPercent,
            curatorNote: artwork.curatorNote,
            description: artwork.description
          }));
        } catch (error) {
          console.error('Error loading fallback artworks:', error);
          selectedArtworks = [];
        }
      }
      const mockArtworks: GalleryArtwork[] = selectedArtworks.map((artwork, i) => ({
        id: artwork.id || `${category}-${i}`,
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year,
        imageUrl: artwork.imageUrl,
        museum: artwork.museum || 'The Metropolitan Museum of Art',
        medium: artwork.medium || (category === 'sculpture' ? 'Marble/Bronze' : category === 'photography' ? 'Photography' : 'Oil on canvas'),
        department: artwork.department || category,
        isPublicDomain: artwork.isPublicDomain !== undefined ? artwork.isPublicDomain : true,
        license: artwork.license || 'CC0',
        matchPercent: artwork.matchPercent,
        curatorNote: artwork.curatorNote,
        description: artwork.description
      }));
      
      console.log('✅ Mock artworks created:', mockArtworks.length);
      setGalleryArtworks(mockArtworks);
      console.log('🔄 Setting loading to false...');
      setLoadingArtworks(false);
      console.log('✅ fetchArtworks completed successfully');
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks. Please try again.');
    } finally {
      setLoadingArtworks(false);
    }
  };

  const handleLike = async (artworkId: string) => {
    console.log('🚀 handleLike called with artworkId:', artworkId);
    
    const newLiked = new Set(likedArtworks);
    const isLiking = !newLiked.has(artworkId);
    
    console.log('Current liked artworks:', [...likedArtworks]);
    console.log('Is liking:', isLiking);
    
    if (isLiking) {
      newLiked.add(artworkId);
      toast.success('❤️ Added to favorites!');
      console.log('✅ Added to favorites');
    } else {
      newLiked.delete(artworkId);
      toast.success('💔 Removed from favorites');
      console.log('❌ Removed from favorites');
    }
    
    setLikedArtworks(newLiked);
    console.log('New liked artworks:', [...newLiked]);
    
    // Save to guest storage if in guest mode
    if (effectiveGuestMode) {
      const { GuestStorage } = await import('@/lib/guest-storage');
      if (isLiking) {
        GuestStorage.addSavedArtwork(artworkId);
      } else {
        GuestStorage.removeSavedArtwork(artworkId);
      }
      
      // Show prompt after first save
      if (isLiking && GuestStorage.getData().savedArtworks.length === 1) {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('guest-milestone', { 
            detail: { milestone: 'first_save' }
          }));
        }, 1000);
      }
    } else {
      saveUserPreferences();
    }
  };
  
  const handleSave = async (artworkId: string) => {
    const newSaved = new Set(savedArtworks);
    const isSaving = !newSaved.has(artworkId);
    
    console.log('handleSave called:', { artworkId, isSaving });
    console.log('recommendedArtworks:', recommendedArtworks);
    
    if (isSaving) {
      newSaved.add(artworkId);
      toast.success('📌 내 아트 컬렉션에 추가되었습니다!');
      
      // 오늘 발견한 작품 카운트 증가
      setTodayDiscovered(prev => prev + 1);
      
      // 추천 작품에서 보관한 작품을 galleryArtworks 맨 앞에 추가 (최신 순)
      const savedArtwork = recommendedArtworks.find(artwork => artwork.id === artworkId);
      console.log('Found savedArtwork:', savedArtwork);
      
      if (savedArtwork) {
        setGalleryArtworks(prev => {
          console.log('Current galleryArtworks length:', prev.length);
          const exists = prev.some(artwork => artwork.id === artworkId);
          console.log('Artwork exists in gallery:', exists);
          
          if (!exists) {
            // 새로운 작품을 배열의 맨 앞에 추가 (unshift 효과)
            const newArtwork = {
              id: savedArtwork.id,
              title: savedArtwork.title,
              artist: savedArtwork.artist,
              year: savedArtwork.year,
              imageUrl: savedArtwork.image || savedArtwork.imageUrl || savedArtwork.cloudinaryUrl,
              museum: savedArtwork.museum || 'SAYU Curated',
              medium: savedArtwork.medium || 'Mixed Media',
              department: savedArtwork.department || 'Contemporary Art',
              isPublicDomain: savedArtwork.isPublicDomain || true,
              license: savedArtwork.license || 'CC0',
              matchPercent: savedArtwork.matchPercent,
              curatorNote: savedArtwork.description || savedArtwork.curatorNote,
              description: savedArtwork.description
            };
            console.log('Adding newArtwork to gallery:', newArtwork);
            
            // 맨 앞에 새 작품 추가 + 저장 상태 표시
            const updatedArtworks = [{ ...newArtwork, isNewlyAdded: true }, ...prev];
            console.log('Updated galleryArtworks length:', updatedArtworks.length);
            return updatedArtworks;
          }
          return prev;
        });
      } else {
        console.log('savedArtwork not found in recommendedArtworks');
      }
    } else {
      newSaved.delete(artworkId);
      toast.success('📌 컬렉션에서 제거되었습니다');
    }
    
    setSavedArtworks(newSaved);
    
    // Save to storage
    if (effectiveGuestMode) {
      const { GuestStorage } = await import('@/lib/guest-storage');
      if (isSaving) {
        GuestStorage.addSavedArtwork(artworkId);
      } else {
        GuestStorage.removeSavedArtwork(artworkId);
      }
    } else {
      saveUserPreferences();
    }
  };

  const handleView = async (artworkId: string) => {
    const newViewed = new Set(viewedArtworks);
    if (!newViewed.has(artworkId)) {
      newViewed.add(artworkId);
      setViewedArtworks(newViewed);
      saveUserPreferences();
    }
  };

  const shuffleArtworks = () => {
    const shuffled = [...galleryArtworks].sort(() => Math.random() - 0.5);
    setGalleryArtworks(shuffled);
    toast.success('Gallery shuffled!');
  };

  if (loading && !isGuestMode) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
        style={{ 
          backgroundImage: `url('/images/backgrounds/warm-corner-gallery-solitary-contemplation.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="text-center relative z-10">
          <Eye className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-slate-300">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  // 임시로 인증 체크를 비활성화하여 guest 모드로 항상 접근 가능하도록 함
  const effectiveGuestMode = !user || isGuestMode;

  // 사용자 APT 타입 가져오기
  const userAptType = userProfile?.typeCode || userProfile?.personalityType || 'SREF';

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{ 
        backgroundImage: `url('/images/backgrounds/warm-corner-gallery-solitary-contemplation.jpg')`
      }}
    >
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px]" />
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-slate-700 backdrop-blur-md sticky top-0 z-20 bg-slate-900/80 relative"
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  내 컬렉션
                  {effectiveGuestMode && (
                    <Badge variant="secondary" className="ml-2 rounded-full bg-slate-700 text-slate-300">
                      Guest Mode
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {effectiveGuestMode 
                    ? `놀라운 작품들을 발견하세요`
                    : `${userAptType} 님을 위한 맞춤 큐레이션`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {effectiveGuestMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => router.push('/quiz')} className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Get Personalized
                  </Button>
                  <Button size="sm" onClick={() => router.push('/register')} className="bg-purple-600 hover:bg-purple-700">
                    Sign Up Free
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    onClick={shuffleArtworks}
                    className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border-0"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                  <GalleryStats 
                    monthlyCollected={savedArtworks.size}  // 컬렉션한 작품 수
                    totalLiked={likedArtworks.size}        // 좋아요한 작품 수
                    todayDiscovered={todayDiscovered}      // 오늘 새로 발견한 작품 수
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Category Filter - 개선된 스타일 */}
          <div className="mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {ART_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 relative z-10">
        {/* 추천 섹션 */}
        {!effectiveGuestMode && recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1 text-white">
                  {userAptType} 유형을 위한 추천 작품
                </h2>
                <p className="text-sm text-gray-300 mb-2">
                  AI Curator가 당신의 APT 분석을 기반으로 큐레이션한 작품들입니다
                </p>
                <div className="flex gap-4 text-xs text-white">
                  <span className="flex items-center gap-1">
                    ❤️ <strong>좋아요</strong>: AI가 비슷한 작품을 더 추천해줍니다
                  </span>
                  <span className="flex items-center gap-1">
                    📌 <strong>보관하기</strong>: 내 아트 컬렉션에 추가됩니다
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
                더보기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {/* 추천 작품 horizontal scroll */}
            <div className="relative overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {recommendedArtworks.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-64 bg-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-slate-700 hover:border-purple-500"
                  >
                    <div className="aspect-[4/3] bg-slate-700 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* 추천 작품 액션 버튼 */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-10">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full backdrop-blur-md bg-slate-800/80 hover:bg-slate-700/90 shadow-lg border border-slate-600 group/like"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('❤️ 추천 작품 좋아요:', item.id);
                            handleLike(item.id);
                          }}
                          title="좋아요 - AI가 비슷한 작품을 더 추천해줍니다"
                        >
                          <Heart className={`w-4 h-4 transition-colors ${likedArtworks.has(item.id) ? 'text-red-500 fill-red-500' : 'text-purple-400 group-hover/like:text-red-400'}`} />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full backdrop-blur-md bg-slate-800/80 hover:bg-slate-700/90 shadow-lg border border-slate-600 group/save"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('📌 추천 작품 보관:', item.id);
                            handleSave(item.id);
                          }}
                          title="보관하기 - 내 아트 컬렉션에 추가됩니다"
                        >
                          <Bookmark className={`w-4 h-4 transition-colors ${savedArtworks.has(item.id) ? 'text-green-500 fill-green-500' : 'text-purple-400 group-hover/save:text-green-400'}`} />
                        </motion.button>
                      </div>
                      
                      <Sparkles className="absolute bottom-4 left-4 w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
                      
                      {/* 실제 이미지 표시 - Cloudinary에서 직접 로드 */}
                      <img 
                        src={item.image || `https://picsum.photos/600/450?random=${item.id}`} 
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 text-white">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.artist} · {item.year}</p>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.curatorNote || item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300 border border-purple-500/30">
                          {userAptType} 매치 {item.matchPercent || 95}%
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 아카이빙 섹션 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-white">
                {language === 'ko' ? '내 아트 아카이빙' : 'My Art Collection'}
              </h2>
              <p className="text-sm text-gray-300">
                {language === 'ko' 
                  ? '지금까지 수집한 작품들을 한눈에 볼 수 있습니다'
                  : 'View all the artworks you\'ve collected'}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
              {language === 'ko' ? '모두 보기' : 'View All'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>


        {/* APT 유형별 맞춤 추천 배너 */}
        {user?.aptType && selectedCategory === 'all' && galleryArtworks.some(a => a.matchPercent) && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-600/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {user.aptType} 유형 맞춤 추천 🎨
                </h3>
                <p className="text-sm text-slate-300 mb-2">
                  당신의 성격 유형에 특별히 선별된 작품들입니다. 각 작품은 당신의 감상 성향과 얼마나 잘 맞는지 매치 퍼센트로 표시됩니다.
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 rounded-full">
                    개인화된 추천
                  </span>
                  <span className="text-slate-400">
                    {galleryArtworks.filter(a => a.matchPercent).length}개 작품
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Grid */}
        {loading_artworks ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-slate-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : galleryArtworks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryArtworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-purple-500">
                  <div className="aspect-square bg-slate-700 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={artwork.imageUrl || `https://picsum.photos/400/400?random=${artwork.id}`} 
                      alt={artwork.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                  </div>
                  
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm line-clamp-2">
                      {artwork.title}
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">{artwork.artist}</p>
                    <p className="text-slate-500 text-xs">{artwork.year}</p>
                    
                    {/* APT 유형 맞춤 추천 정보 */}
                    {artwork.matchPercent && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">{artwork.matchPercent}% 매치</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('❤️ Heart button clicked for:', artwork.id);
                            handleLike(artwork.id);
                          }}
                          className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-all hover:scale-110"
                          title="좋아요"
                        >
                          <Heart className={`w-4 h-4 transition-colors ${likedArtworks.has(artwork.id) ? 'text-red-500 fill-red-500' : 'text-slate-300 hover:text-red-400'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('👁️ View button clicked for:', artwork.id);
                            handleView(artwork.id);
                          }}
                          className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-all hover:scale-110"
                          title="보기"
                        >
                          <Eye className={`w-4 h-4 transition-colors ${viewedArtworks.has(artwork.id) ? 'text-blue-400' : 'text-slate-300 hover:text-blue-400'}`} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('📌 Save button clicked for:', artwork.id);
                            handleSave(artwork.id);
                          }}
                          className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-600 transition-all hover:scale-110"
                          title="저장"
                        >
                          <Bookmark className={`w-4 h-4 transition-colors ${savedArtworks.has(artwork.id) ? 'text-green-500 fill-green-500' : 'text-slate-300 hover:text-green-400'}`} />
                        </button>
                      </div>
                    </div>
                    
                    {artwork.curatorNote && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 italic">
                        "{artwork.curatorNote}"
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12">
            <Eye className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-semibold mb-2 text-white">No artworks found</h3>
            <p className="text-slate-400 mb-4">Try selecting a different category</p>
            <Button onClick={() => fetchArtworks(selectedCategory)} className="bg-purple-600 hover:bg-purple-700">
              Retry
            </Button>
          </div>
        )}

        {/* Guest Mode CTA Banner */}
        {effectiveGuestMode && (
          <div className="mt-8 p-6 bg-slate-800 rounded-xl border border-slate-700">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-2">
                🎨 {language === 'ko' ? '나만의 예술 여정을 시작하세요' : 'Unlock Your Personal Art Journey'}
              </h3>
              <p className="text-slate-400 mb-4">
                {language === 'ko' 
                  ? '성격 테스트를 통해 맞춤 추천을 받고, 좋아하는 작품을 저장하고, 당신과 공명하는 예술을 발견하세요.'
                  : 'Take our personality quiz to get curated recommendations, save favorites, and discover art that truly resonates with you.'}
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push('/quiz')} className="bg-purple-600 hover:bg-purple-700">
                  {language === 'ko' ? '성격 테스트 하기' : 'Take Personality Quiz'}
                </Button>
                <Button onClick={() => router.push('/register')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  {language === 'ko' ? '무료 계정 만들기' : 'Create Free Account'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Met Museum Attribution */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg text-sm border border-slate-700">
          <p className="flex items-center gap-2 mb-2 text-slate-300">
            <ExternalLink className="w-4 h-4" />
            <strong>{language === 'ko' ? '작품 컬렉션' : 'Artwork Collection'}</strong>
          </p>
          <p className="text-slate-400">
            {language === 'ko' 
              ? '이 갤러리는 메트로폴리탄 미술관의 오픈 액세스 컬렉션 작품들을 선보입니다. 모든 작품은 크리에이티브 커먼즈 제로(CC0) 라이선스 하에 제공되며, 퍼블릭 도메인으로 자유롭게 사용 가능합니다.'
              : 'This gallery features artworks from The Metropolitan Museum of Art\'s Open Access collection, available under the Creative Commons Zero (CC0) license. All displayed artworks are in the public domain and free to use.'}
          </p>
          <p className="mt-2">
            <a 
              href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline"
            >
              {language === 'ko' ? 'Met 오픈 액세스 이니셔티브 자세히 보기 →' : 'Learn more about The Met\'s Open Access initiative →'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
        style={{ 
          backgroundImage: `url('/images/backgrounds/warm-corner-gallery-solitary-contemplation.jpg')`
        }}
      >
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="text-center relative z-10">
          <Eye className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-slate-300">Loading gallery...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}