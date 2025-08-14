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
import MobileOptimizedImage from '@/components/ui/MobileOptimizedImage';
import MobileGalleryGrid from '@/components/mobile/MobileGalleryGrid';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useResponsive } from '@/lib/responsive';
import { ArtworkDetailModal } from '@/components/ui/ArtworkDetailModal';
import toast from 'react-hot-toast';

// 새로운 컴포넌트들 import
import { SayuBeamsBackground } from '@/components/ui/sayu-beams-background';
import { Badge } from '@/components/ui/badge';
import { CategoryFilter, FloatingDock, MobileBottomNav, GalleryStats } from './gallery-components';
import { Gallery4 } from '@/components/ui/gallery4';
import { SayuGalleryGrid } from '@/components/ui/sayu-gallery-grid';
import { ChevronRight, LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  const { isMobile } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams?.get('guest') === 'true';
  
  const [galleryArtworks, setGalleryArtworks] = useState<GalleryArtwork[]>([]);
  const [loading_artworks, setLoadingArtworks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [viewedArtworks, setViewedArtworks] = useState<Set<string>>(new Set());
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());
  const [savedArtworksData, setSavedArtworksData] = useState<GalleryArtwork[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'saved' | 'liked' | 'new'>('all');
  
  // 새로운 통계 상태
  const [monthlyCollected, setMonthlyCollected] = useState(0);
  const [todayDiscovered, setTodayDiscovered] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState<any[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(true);
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'list'>('masonry');
  
  // 작품 상세 모달 상태
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load user profile and preferences
  useEffect(() => {
    if (user && !isGuestMode) {
      fetchUserProfile();
      loadUserPreferences();
    } else if (isGuestMode || !user) {
      // Set default SREF profile for guest users to show curated artworks
      const guestProfile: UserProfile = {
        id: 'guest',
        sayuType: 'SREF',
        email: '',
        name: 'Guest',
        typeCode: 'SREF',
        personalityType: 'SREF'
      };
      setUserProfile(guestProfile);
      loadUserPreferences();
      console.log('👥 Setting SREF profile for guest to show 12 curated artworks');
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

  // Auto-expand recommendations for SREF users with 12+ artworks
  useEffect(() => {
    const userType = userProfile?.typeCode || userProfile?.personalityType || user?.aptType || 'SREF';
    if (userType === 'SREF' && recommendedArtworks.length >= 12) {
      console.log('🎨 Auto-expanding recommendations for SREF user with', recommendedArtworks.length, 'artworks');
      setShowAllRecommendations(true);
    }
  }, [recommendedArtworks.length, userProfile, user]);

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
      console.log('👥 Setting default SREF profile for guest user');
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
      
      // Default to SREF for guest users to show the 12 curated artworks
      const userType = userProfile?.typeCode || userProfile?.personalityType || user?.aptType || 'SREF';
      console.log('🎨 Loading recommendations for user type:', userType);
      const guestMode = !user || isGuestMode;
      console.log('👥 Guest mode:', guestMode, '| User profile:', userProfile?.typeCode, '| User apt:', user?.aptType);
      
      const recommendations = getPersonalizedRecommendations(userType, selectedCategory);
      console.log('📚 Got recommendations:', recommendations.length, 'artworks');
      
      if (recommendations.length > 0) {
        console.log('🖼️ First artwork:', recommendations[0]);
        console.log('🌐 First artwork URL:', recommendations[0].imageUrl);
        console.log('🎨 Is Wikimedia URL?:', recommendations[0].imageUrl?.includes('wikimedia'));
      }
      
      // Transform to match existing interface - get more recommendations for expansion
      const formattedRecommendations = recommendations.slice(0, 12).map((rec, i) => ({
        id: rec.id || `rec-${i}`,
        title: rec.title,
        artist: rec.artist,
        year: rec.year,
        description: rec.description || rec.curatorNote,
        href: '#',
        imageUrl: rec.imageUrl || rec.cloudinaryUrl,
        matchPercent: rec.matchPercent,
        curatorNote: rec.curatorNote
      }));
      
      console.log('✅ Formatted recommendations:', formattedRecommendations);
      console.log('🔍 All Image URLs:');
      formattedRecommendations.forEach((rec, i) => {
        console.log(`  ${i+1}. ${rec.title}: ${rec.imageUrl?.substring(0, 80)}...`);
      });
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
      
      // 먼저 실제 API에서 아트워크 데이터 가져오기
      const response = await fetch('/api/artworks');
      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.artworks && data.artworks.length > 0) {
        // API 데이터 사용
        const apiArtworks = data.artworks
          .filter((artwork: any) => {
            if (category === 'all') return true;
            // 카테고리 필터링 로직
            const lowerCategory = category.toLowerCase();
            return (
              artwork.department?.toLowerCase().includes(lowerCategory) ||
              artwork.medium?.toLowerCase().includes(lowerCategory) ||
              artwork.classification?.toLowerCase().includes(lowerCategory)
            );
          })
          .slice(0, 50) // 최대 50개만
          .map((artwork: any) => ({
            id: artwork.objectID || artwork.id,
            title: artwork.title,
            artist: artwork.artist || artwork.artistDisplayName || 'Unknown Artist',
            year: artwork.date || artwork.objectDate || '',
            imageUrl: artwork.cloudinaryUrl || artwork.primaryImage || artwork.primaryImageSmall || '',
            museum: artwork.museum || artwork.repository || 'Museum',
            medium: artwork.medium,
            department: artwork.department,
            isPublicDomain: artwork.isPublicDomain !== undefined ? artwork.isPublicDomain : true,
            license: 'CC0'
          }))
          .filter((artwork: any) => artwork.imageUrl); // 이미지가 있는 것만
        
        if (apiArtworks.length > 0) {
          console.log('Using API artworks:', apiArtworks.length);
          setGalleryArtworks(apiArtworks);
          setLoadingArtworks(false);
          return;
        }
      }
      
      // API 데이터가 없으면 기존 추천 시스템 사용
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
            imageUrl: artwork.cloudinaryUrl || artwork.imageUrl,
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
    const guestMode = !user || isGuestMode;
    if (guestMode) {
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
    console.log('galleryArtworks:', galleryArtworks);
    
    if (isSaving) {
      newSaved.add(artworkId);
      toast.success('📌 내 아트 컬렉션에 추가되었습니다!');
      
      // 오늘 발견한 작품 카운트 증가
      setTodayDiscovered(prev => prev + 1);
      
      // 추천 작품 또는 갤러리 작품에서 저장한 작품 찾기
      let savedArtwork = recommendedArtworks.find(artwork => artwork.id === artworkId);
      
      // 추천 작품에 없으면 갤러리 작품에서 찾기
      if (!savedArtwork) {
        const galleryArtwork = galleryArtworks.find(artwork => artwork.id === artworkId);
        if (galleryArtwork) {
          savedArtwork = {
            id: galleryArtwork.id,
            title: galleryArtwork.title,
            artist: galleryArtwork.artist,
            year: galleryArtwork.year,
            image: galleryArtwork.imageUrl,
            imageUrl: galleryArtwork.imageUrl,
            museum: galleryArtwork.museum,
            medium: galleryArtwork.medium,
            department: galleryArtwork.department,
            matchPercent: galleryArtwork.matchPercent,
            curatorNote: galleryArtwork.curatorNote,
            description: galleryArtwork.description
          };
        }
      }
      
      console.log('Found savedArtwork:', savedArtwork);
      
      if (savedArtwork) {
        // savedArtworksData에 작품 추가 (맨 앞에)
        setSavedArtworksData(prev => {
          const exists = prev.some(artwork => artwork.id === artworkId);
          if (!exists) {
            const newArtwork: GalleryArtwork = {
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
            console.log('Adding newArtwork to savedArtworksData:', newArtwork);
            return [newArtwork, ...prev]; // 맨 앞에 추가 (왼쪽에 새로 추가)
          }
          return prev;
        });
      } else {
        console.log('savedArtwork not found');
      }
    } else {
      newSaved.delete(artworkId);
      setSavedArtworksData(prev => prev.filter(artwork => artwork.id !== artworkId));
      toast.success('📌 컬렉션에서 제거되었습니다');
    }
    
    setSavedArtworks(newSaved);
    
    // Save to storage
    const guestMode = !user || isGuestMode;
    if (guestMode) {
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

  const handleArtworkClick = (artwork: any) => {
    setSelectedArtwork(artwork);
    setIsModalOpen(true);
    handleView(artwork.id);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedArtwork(null);
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
      {/* Header - 모바일 반응형 */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cn(
          "border-b border-slate-700 backdrop-blur-md sticky z-20 bg-slate-900/80 relative top-0"
        )}
      >
        <div className={cn("mx-auto", isMobile ? "px-4 py-2" : "max-w-7xl px-4 py-4")}>
          {/* Mobile Layout */}
          {isMobile ? (
            <>
              {/* First Row - Title and Description side by side */}
              <div className="flex items-end gap-3 mb-2">
                <h1 className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-xl">
                  내 컬렉션
                  {isGuestMode && (
                    <Badge variant="secondary" className="ml-2 rounded-full bg-slate-700 text-slate-300 text-[10px]">
                      Guest
                    </Badge>
                  )}
                </h1>
                <p className="text-xs text-slate-400">
                  {isGuestMode 
                    ? `놀라운 작품들을 발견하세요`
                    : `${userAptType} 님을 위한 맞춤 큐레이션`
                  }
                </p>
              </div>
              
              {/* Second Row - Stats on left, Shuffle on right */}
              <div className="flex items-center justify-between gap-2">
                {isGuestMode ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => router.push('/quiz')} className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white flex-1">
                      <UserPlus className="w-4 h-4 mr-1" />
                      <span className="text-xs">Get Personalized</span>
                    </Button>
                    <Button size="sm" onClick={() => router.push('/register')} className="bg-purple-600 hover:bg-purple-700 flex-1">
                      <span className="text-xs">Sign Up Free</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <GalleryStats 
                      monthlyCollected={savedArtworks.size}  // 보관한 작품 수
                      totalLiked={likedArtworks.size}        // 좋아요한 작품 수
                      todayDiscovered={todayDiscovered}      // 오늘 새로 발견한 작품 수
                      className="text-xs"
                    />
                    <Button 
                      size="sm" 
                      onClick={shuffleArtworks}
                      className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border-0 px-2 py-1.5"
                    >
                      <Shuffle className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            /* Desktop Layout - Keep existing */
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
                  <h1 className="font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-2xl">
                    내 컬렉션
                    {isGuestMode && (
                      <Badge variant="secondary" className="ml-2 rounded-full bg-slate-700 text-slate-300">
                        Guest Mode
                      </Badge>
                    )}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    {isGuestMode 
                      ? `놀라운 작품들을 발견하세요`
                      : `${userAptType} 님을 위한 맞춤 큐레이션`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isGuestMode ? (
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
          )}
          
          {/* Category Filter - 모바일 최적화 */}
          <div className={cn(isMobile ? "mt-1" : "mt-4")}>
            <div className={cn(
              "flex gap-2 overflow-x-auto scrollbar-hide",
              isMobile ? "" : "pb-2"
            )}>
              {ART_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "rounded-full font-medium whitespace-nowrap transition-all",
                    isMobile ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm",
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600'
                  )}
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
        {/* Art Fair Mode Teaser */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-gradient-to-r from-amber-900/20 to-orange-900/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎪</span>
                <div>
                  <h3 className="text-amber-300 font-semibold flex items-center gap-2">
                    아트 페어 모드 
                    <span className="text-xs bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-200">Coming Soon</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    8월 말 KIAF & Frieze Seoul 2025를 위한 특별 기능이 준비중입니다
                  </p>
                </div>
              </div>
              <button 
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg text-sm font-medium transition-all duration-200 border border-amber-500/30 hover:border-amber-500/50"
                onClick={() => toast('🎨 아트 페어 모드는 8월 말에 만나요!', { icon: '🎪' })}
              >
                알림 받기
              </button>
            </div>
          </div>
        </motion.div>

        {/* 추천 섹션 - Show for both logged-in and SREF guest users */}
        {recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1 text-white">
                  {isGuestMode ? 'SREF 유형 큐레이션 작품' : `${userAptType} 유형을 위한 추천 작품`}
                </h2>
                <p className="text-sm text-gray-300 mb-2">
                  {isGuestMode ? 
                    'SREF 유형을 위한 특별 큐레이션 - 인간관계와 따뜻함을 담은 작품들' :
                    'AI Curator가 당신의 APT 분석을 기반으로 큐레이션한 작품들입니다'
                  }
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
              {/* Only show expand/collapse if there are more than 4 artworks */}
              {recommendedArtworks.length > 4 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                  onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                >
                  {showAllRecommendations ? '접기' : `모든 ${recommendedArtworks.length}개 보기`} 
                  <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showAllRecommendations ? 'rotate-90' : ''}`} />
                </Button>
              )}
            </div>
            
            {/* 추천 작품 grid or horizontal scroll */}
            {showAllRecommendations ? (
              // Grid layout for expanded view (4x3) - Show all 12 artworks for SREF users
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendedArtworks.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-slate-700 hover:border-purple-500"
                    onClick={() => handleArtworkClick(item)}
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
                            handleSave(item.id);
                          }}
                          title="보관하기 - 내 아트 컬렉션에 추가됩니다"
                        >
                          <Bookmark className={`w-4 h-4 transition-colors ${savedArtworks.has(item.id) ? 'text-green-500 fill-green-500' : 'text-purple-400 group-hover/save:text-green-400'}`} />
                        </motion.button>
                      </div>
                      
                      <Sparkles className="absolute bottom-4 left-4 w-6 h-6 text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
                      
                      {/* 실제 이미지 표시 - Wikimedia Commons images */}
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-artwork.jpg';
                        }}
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // Horizontal scroll for collapsed view
              <div className="relative overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                  {recommendedArtworks.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-64 bg-slate-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-slate-700 hover:border-purple-500"
                    onClick={() => handleArtworkClick(item)}
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
                      
                      {/* 실제 이미지 표시 - Wikimedia Commons images */}
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.currentTarget.src = '/images/placeholder-artwork.jpg';
                        }}
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
            )}
          </motion.div>
        )}


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

        {/* My Art Collection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-white">
                {language === 'ko' ? 'My Art Collection' : 'My Art Collection'}
              </h2>
              <p className="text-sm text-gray-300">
                {language === 'ko' 
                  ? 'View all the artworks you\'ve collected'
                  : 'View all the artworks you\'ve collected'}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
              {language === 'ko' ? 'View All' : 'View All'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid - 모바일/데스크탑 반응형 */}
        {savedArtworksData.length > 0 ? (
          isMobile ? (
            // 모바일: 가상화 스크롤 갤러리
            <MobileGalleryGrid
              artworks={savedArtworksData}
              onLike={handleLike}
              onSave={handleSave}
              onView={handleArtworkClick}
              likedItems={likedArtworks}
              savedItems={savedArtworks}
            />
          ) : (
            // 데스크탑: 기존 그리드 레이아웃
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedArtworksData.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => handleArtworkClick(artwork)}
              >
                <div className="relative overflow-hidden rounded-xl bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-700 hover:border-purple-500">
                  <div className="aspect-square bg-slate-700 flex items-center justify-center relative overflow-hidden">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-artwork.jpg';
                      }}
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
          )
        ) : (
          /* Empty state */
          <div className="bg-slate-800/50 rounded-lg p-8 text-center border border-slate-700">
            <Bookmark className="w-8 h-8 mx-auto mb-3 text-slate-500" />
            <p className="text-sm text-slate-400">
              {language === 'ko' 
                ? '아직 저장한 작품이 없습니다. 위 추천 작품에서 마음에 드는 작품을 보관해보세요!'
                : 'No saved artworks yet. Save your favorite artworks from the recommendations above!'}
            </p>
          </div>
        )}

        {/* Guest Mode CTA Banner */}
        {isGuestMode && (
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

        {/* Artwork Attribution */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg text-sm border border-slate-700">
          <p className="flex items-center gap-2 mb-2 text-slate-300">
            <ExternalLink className="w-4 h-4" />
            <strong>{language === 'ko' ? '작품 출처 및 라이선스' : 'Artwork Sources & Licensing'}</strong>
          </p>
          <p className="text-slate-400">
            {language === 'ko' 
              ? 'SAYU는 전 세계 유명 미술관과 갤러리의 오픈 액세스 작품들을 큐레이션합니다. 메트로폴리탄 미술관, 시카고 미술관, 국립현대미술관 등 다양한 기관의 퍼블릭 도메인 작품과 오픈 라이선스 작품들을 선별하여 제공합니다.'
              : 'SAYU curates open access artworks from renowned museums and galleries worldwide, including The Metropolitan Museum of Art, Art Institute of Chicago, National Museum of Modern and Contemporary Art, and more. All featured works are either in the public domain or available under open licenses.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Met Museum</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">AIC Chicago</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">MMCA Korea</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Rijksmuseum</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">WikiArt</span>
            <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">Artvee</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {language === 'ko' 
              ? '각 작품의 라이선스 정보는 작품 상세 페이지에서 확인할 수 있습니다. CC0, Public Domain, CC BY 등 다양한 오픈 라이선스 작품을 포함합니다.'
              : 'License information for each artwork is available on the artwork detail page. Collection includes CC0, Public Domain, CC BY, and other open license works.'}
          </p>
        </div>
      </div>

      {/* 작품 상세 모달 */}
      <ArtworkDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        artwork={selectedArtwork}
        onLike={handleLike}
        onSave={handleSave}
        isLiked={selectedArtwork ? likedArtworks.has(selectedArtwork.id) : false}
        isSaved={selectedArtwork ? savedArtworks.has(selectedArtwork.id) : false}
        userType={userAptType}
      />
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