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

interface UserProfile {
  id: string;
  sayuType: string;
  email: string;
  name: string;
  // Add other profile fields as needed
}

function PersonalGallery() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterArtist, setFilterArtist] = useState('');
  const [activeTab, setActiveTab] = useState('archived');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [followingArtists, setFollowingArtists] = useState<FollowingArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalArtworks: number;
    likedCount: number;
    archivedCount: number;
    byArtist: Record<string, number>;
    bySayuType: Record<string, number>;
  } | null>(null);

  // Load gallery data
  useEffect(() => {
    const loadGalleryData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load data in parallel
        const [personalGalleryResponse, followingArtistsResponse, statsResponse] = await Promise.all([
          galleryApi.getPersonalGallery({ limit: 100 }),
          galleryApi.getFollowedArtists(),
          galleryApi.getGalleryStats()
        ]);
        
        setArtworks(personalGalleryResponse.data || []);
        setFollowingArtists(followingArtistsResponse);
        setStats(statsResponse);
      } catch (err) {
        console.error('Failed to load gallery data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load gallery data');
      } finally {
        setLoading(false);
      }
    };
    
    loadGalleryData();
  }, []);

  const likedArtworks = artworks.filter(artwork => artwork.isLiked);
  const archivedArtworks = artworks.filter(artwork => artwork.isArchived);

  const filteredArtworks = (artworksList: Artwork[]) => {
    return artworksList.filter(artwork => {
      const matchesSearch = artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           artwork.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesArtist = !filterArtist || artwork.artist === filterArtist;
      return matchesSearch && matchesArtist;
    });
  };

  const uniqueArtists = [...new Set(artworks.map(a => a.artist))].sort();

  const handleLikeToggle = async (artworkId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await galleryApi.unlikeArtwork(artworkId);
      } else {
        await galleryApi.likeArtwork(artworkId);
      }
      
      // Update local state
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId 
          ? { ...artwork, isLiked: !isLiked }
          : artwork
      ));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleArchiveToggle = async (artworkId: string, isArchived: boolean) => {
    try {
      if (isArchived) {
        await galleryApi.unarchiveArtwork(artworkId);
      } else {
        await galleryApi.archiveArtwork(artworkId);
      }
      
      // Update local state
      setArtworks(prev => prev.map(artwork => 
        artwork.id === artworkId 
          ? { ...artwork, isArchived: !isArchived }
          : artwork
      ));
    } catch (error) {
      console.error('Failed to toggle archive:', error);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-xl text-gray-600">
            {language === 'ko' ? '갤러리를 불러오는 중...' : 'Loading gallery...'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            {language === 'ko' ? '오류가 발생했습니다' : 'Error occurred'}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {language === 'ko' ? '다시 시도' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {language === 'ko' ? '내 갤러리' : 'My Gallery'}
                </h1>
                <p className="text-gray-600 text-sm">
                  {language === 'ko' ? '나만의 예술 컬렉션' : 'Your personal art collection'}
                </p>
              </div>
            </div>
            
            {/* 검색 및 필터 */}
            <div className="flex gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={language === 'ko' ? '작품 또는 작가 검색...' : 'Search artworks or artists...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterArtist} onValueChange={setFilterArtist}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={language === 'ko' ? '작가 필터' : 'Filter by artist'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{language === 'ko' ? '모든 작가' : 'All artists'}</SelectItem>
                  {uniqueArtists.map(artist => (
                    <SelectItem key={artist} value={artist}>{artist}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* 탭 메뉴 */}
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              {language === 'ko' ? '보관함' : 'Archived'}
              <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {archivedArtworks.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {language === 'ko' ? '좋아요' : 'Liked'}
              <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {likedArtworks.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="following" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {language === 'ko' ? '팔로잉' : 'Following'}
              <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                {followingArtists.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* 보관함 탭 */}
          <TabsContent value="archived" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ko' ? '보관된 작품' : 'Archived Artworks'}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredArtworks(archivedArtworks).length}개의 작품
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredArtworks(archivedArtworks).map((artwork, index) => (
                <motion.div
                  key={artwork.artveeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Palette className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">{artwork.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{artwork.artist}</p>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ArtworkActions artwork={artwork} className="[&>*]:!bg-white/20 [&>*]:!text-white [&>*]:backdrop-blur-sm [&>*]:rounded-full [&>*]:hover:!bg-white/30" />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {artwork.title}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">{artwork.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 좋아요 탭 */}
          <TabsContent value="liked" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ko' ? '좋아요한 작품' : 'Liked Artworks'}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredArtworks(likedArtworks).length}개의 작품
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredArtworks(likedArtworks).map((artwork, index) => (
                <motion.div
                  key={artwork.artveeId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center p-4">
                        <Palette className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-medium">{artwork.title}</p>
                        <p className="text-xs text-gray-400 mt-1">{artwork.artist}</p>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ArtworkActions artwork={artwork} className="[&>*]:!bg-white/20 [&>*]:!text-white [&>*]:backdrop-blur-sm [&>*]:rounded-full [&>*]:hover:!bg-white/30" />
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {artwork.title}
                    </h3>
                    <p className="text-gray-600 text-xs mt-1">{artwork.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* 팔로잉 탭 */}
          <TabsContent value="following" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {language === 'ko' ? '팔로우하는 작가' : 'Following Artists'}
              </h2>
              <p className="text-sm text-gray-500">
                {followingArtists.length}명의 작가
              </p>
            </div>
            
            <div className="grid gap-4">
              {followingArtists.map((artist, index) => (
                <motion.div
                  key={artist.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{artist.name}</h3>
                        <p className="text-sm text-gray-500">
                          {artist.artworkCount}개의 작품
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {language === 'ko' ? '언팔로우' : 'Unfollow'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 저작권 표시 */}
        <div className="mt-12 pt-8 border-t">
          <ArtworkAttribution className="text-center" />
        </div>
      </div>
    </div>
  );
}

// Interface definitions
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
}

interface UserProfile {
  typeCode?: string;
  archetypeName?: string;
  emotionalTags?: string[];
  artworkScores?: Record<string, number>;
  personalityType?: string;
  preferences?: {
    favoriteStyles: string[];
    favoriteArtists: string[];
  };
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams?.get('guest') === 'true';
  const [galleryArtworks, setGalleryArtworks] = useState<GalleryArtwork[]>([]);
  const [loading_artworks, setLoadingArtworks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [viewedArtworks, setViewedArtworks] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedArtworks, setRecommendedArtworks] = useState<any[]>([]);
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'list'>('masonry');

  // Load user profile and preferences
  useEffect(() => {
    if (user && !isGuestMode) {
      fetchUserProfile();
      loadUserPreferences();
    } else if (isGuestMode) {
      // For guest mode, just load local preferences
      loadUserPreferences();
    }
  }, [user, isGuestMode]);

  // Load artworks only on initial mount
  useEffect(() => {
    fetchArtworks('all');
  }, []);

  // Load recommended artworks
  useEffect(() => {
    loadRecommendedArtworks();
  }, [userProfile, selectedCategory]);

  const fetchUserProfile = async () => {
    try {
      // For now, just use the user data from auth context
      if (user) {
        setUserProfile({
          personalityType: user.personalityType || 'LAEF',
          preferences: {
            favoriteStyles: [],
            favoriteArtists: []
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // 백엔드 오류 시 기본 프로필 사용
      const mockProfile: UserProfile = {
        typeCode: 'LAEF',
        archetypeName: '몽상가',
        emotionalTags: ['dreamy', 'introspective', 'creative'],
        artworkScores: {}
      };
      setUserProfile(mockProfile);
    }
  };

  const loadUserPreferences = () => {
    const liked = localStorage.getItem('likedArtworks');
    const viewed = localStorage.getItem('viewedArtworks');
    if (liked) setLikedArtworks(new Set(JSON.parse(liked)));
    if (viewed) setViewedArtworks(new Set(JSON.parse(viewed)));
  };

  const saveUserPreferences = () => {
    localStorage.setItem('likedArtworks', JSON.stringify([...likedArtworks]));
    localStorage.setItem('viewedArtworks', JSON.stringify([...viewedArtworks]));
  };

  const loadRecommendedArtworks = async () => {
    try {
      // APT 기반 추천 작품 로드 - 카테고리별로 필터링
      const recommendations = [];
      
      // 카테고리별 필터링을 위한 매핑
      const categoryMapping: Record<string, string[]> = {
        'all': [],
        'paintings': ['회화', 'painting'],
        'sculpture': ['조각', 'sculpture'],
        'photography': ['사진', 'photography'],
        'asian-art': ['동양미술', 'asian art'],
        'modern': ['현대미술', 'modern art'],
        'contemporary': ['컨템포러리', 'contemporary']
      };
      
      // Import SAYU recommendations from external file
      const { aptRecommendations } = await import('./sayu-recommendations');
          { 
            title: '별이 빛나는 밤', 
            artist: '빈센트 반 고흐', 
            year: '1889', 
            description: '내면의 감정을 우주적 시각으로 표현한 걸작', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
            matchPercent: 94,
            curatorNote: 'SREF 유형의 깊은 내면 탐구와 우주적 시각이 완벽하게 공명합니다'
          },
          { 
            title: '진주 귀걸이를 한 소녀', 
            artist: '요하네스 베르메르', 
            year: '1665', 
            description: '고요한 순간의 아름다움을 포착한 명작', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg',
            matchPercent: 91,
            curatorNote: '내향적 관찰력과 미묘한 감정 표현이 SREF의 특징과 일치합니다'
          },
          { 
            title: '수련', 
            artist: '클로드 모네', 
            year: '1916', 
            description: '자연과 내면의 평화를 추구하는 인상주의', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Claude_Monet_-_Water_Lilies_-_1906.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906.jpg',
            matchPercent: 89,
            curatorNote: '자연과의 교감, 명상적 분위기가 SREF의 성찰적 특성을 반영합니다'
          },
          { 
            title: '마음의 풍경', 
            artist: '이우환', 
            year: '2018', 
            description: '한국 현대미술의 서정적 추상', 
            category: ['paintings', 'contemporary', 'asian-art'],
            image: 'https://res.cloudinary.com/sayu/image/upload/v1/artworks/lee-ufan-mindscape.jpg',
            matchPercent: 92,
            curatorNote: '동양의 철학적 사유와 현대적 미니멀리즘의 조화'
          },
          { 
            title: '산수화', 
            artist: '겸재 정선', 
            year: '1751', 
            description: '자연과 인간의 조화를 그린 조선시대 산수화', 
            category: ['asian-art', 'paintings'],
            image: 'https://res.cloudinary.com/sayu/image/upload/v1/artworks/jeong-seon-landscape.jpg',
            matchPercent: 88,
            curatorNote: '동양의 자연관과 SREF의 내면 탐구가 만나는 지점'
          }
        ],
        'LAEF': [
          { 
            title: '기억의 지속', 
            artist: '살바도르 달리', 
            year: '1931', 
            description: '꿈과 현실의 경계를 탐구하는 초현실주의', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
            matchPercent: 96,
            curatorNote: 'LAEF의 창의적 상상력과 시간에 대한 철학적 탐구가 만나는 걸작'
          },
          { 
            title: '캘벨 수프 캔', 
            artist: '앤디 워홀', 
            year: '1962', 
            description: '대중문화와 예술의 경계를 허무', 
            category: ['paintings', 'contemporary'],
            image: 'https://upload.wikimedia.org/wikipedia/en/9/95/Warhol-Campbell_Soup-1-screenprint-1968.jpg',
            matchPercent: 87,
            curatorNote: '일상의 재발견과 혁신적 시각이 LAEF의 탐구 정신과 공명'
          },
          { 
            title: '밤새', 
            artist: '에드워드 호퍼', 
            year: '1942', 
            description: '도시의 고독과 소외를 표현', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Nighthawks_by_Edward_Hopper_1942.jpg/1280px-Nighthawks_by_Edward_Hopper_1942.jpg',
            matchPercent: 90,
            curatorNote: '현대인의 내면과 감정적 공간을 탐구하는 LAEF에게 적합'
          },
          { 
            title: '인피니티 룸', 
            artist: '야요이 쿠사마', 
            year: '2013', 
            description: '무한 반복의 환상적 공간', 
            category: ['sculpture', 'contemporary'],
            image: 'https://res.cloudinary.com/sayu/image/upload/v1/artworks/kusama-infinity-room.jpg',
            matchPercent: 93,
            curatorNote: '무한한 상상력과 공간 탐구가 LAEF의 창의성을 자극'
          },
          { 
            title: '우주의 조화', 
            artist: '칸디단스키', 
            year: '1935', 
            description: '음악적 리듬을 시각화한 추상화', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/4/4a/Vasiliy_Kandinsky%2C_1936_-_Composition_IX.jpg',
            matchPercent: 88,
            curatorNote: '감각의 융합과 예술적 실험이 LAEF의 탐구 성향과 일치'
          }
        ],
        'MREF': [
          { 
            title: '다비드', 
            artist: '미켈란젤로', 
            year: '1504', 
            description: '인간 신체의 완벽한 비례와 아름다움', 
            category: ['sculpture'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/%27David%27_by_Michelangelo_JBU0001.JPG/800px-%27David%27_by_Michelangelo_JBU0001.JPG',
            matchPercent: 97,
            curatorNote: 'MREF의 전통적 가치와 완벽함에 대한 추구가 체현된 걸작'
          },
          { 
            title: '아르놀피니 부부의 초상', 
            artist: '얀 반 에이크', 
            year: '1434', 
            description: '섬세한 디테일과 상징적 의미의 결합', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Van_Eyck_-_Arnolfini_Portrait.jpg/800px-Van_Eyck_-_Arnolfini_Portrait.jpg',
            matchPercent: 92,
            curatorNote: '전통과 규범을 중시하는 MREF에게 의미 있는 작품'
          },
          { 
            title: '아테네 학파', 
            artist: '라파엘로', 
            year: '1511', 
            description: '철학과 예술의 조화로운 만남', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
            matchPercent: 94,
            curatorNote: '지적 권위와 학문적 완벽함이 MREF의 이상과 부합'
          },
          { 
            title: '진주 귀걸이를 한 소녀', 
            artist: '요하네스 베르메르', 
            year: '1665', 
            description: '고전적 아름다움의 정수', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg',
            matchPercent: 90,
            curatorNote: '절제된 우아함과 품위가 MREF의 미학과 일치'
          },
          { 
            title: '모나리자', 
            artist: '레오나르도 다 빈치', 
            year: '1503', 
            description: '영원한 미소의 신비', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
            matchPercent: 95,
            curatorNote: '예술의 보편적 가치와 시대를 초월한 완성도'
          }
        ],
        'HAEF': [
          { 
            title: '게르니카', 
            artist: '파블로 피카소', 
            year: '1937', 
            description: '전쟁의 참상을 강렬한 시각 언어로 표현', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg',
            matchPercent: 98,
            curatorNote: 'HAEF의 강렬한 감정 표현과 사회적 메시지가 결합'
          },
          { 
            title: '절규', 
            artist: '에드바르드 뭉크', 
            year: '1893', 
            description: '감정의 극대화와 표현주의의 시작', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
            matchPercent: 96,
            curatorNote: '내면의 불안과 열정을 폭발적으로 표현하는 HAEF의 본질'
          },
          { 
            title: 'No. 5', 
            artist: '잭슨 폴록', 
            year: '1948', 
            description: '추상표현주의의 강렬한 에너지', 
            category: ['paintings', 'contemporary'],
            image: 'https://upload.wikimedia.org/wikipedia/en/4/4a/No._5%2C_1948.jpg',
            matchPercent: 93,
            curatorNote: '통제되지 않은 창조적 에너지가 HAEF의 열정과 공명'
          },
          { 
            title: '민중을 이끄는 자유의 여신', 
            artist: '외젠 들라크로아', 
            year: '1830', 
            description: '혁명적 열정과 희망의 상징', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
            matchPercent: 91,
            curatorNote: '행동과 변화를 추구하는 HAEF의 혁명적 정신'
          },
          { 
            title: '별이 빛나는 밤', 
            artist: '빈센트 반 고흐', 
            year: '1889', 
            description: '감정의 소용돌이', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
            matchPercent: 89,
            curatorNote: '감정의 강렬한 표현과 내면의 열정이 드러나는 작품'
          }
        ],
        'SRIF': [
          { 
            title: '인상, 해돋이', 
            artist: '클로드 모네', 
            year: '1872', 
            description: '인상주의의 시작을 알린 역사적 작품', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg',
            matchPercent: 91,
            curatorNote: 'SRIF의 직관적이고 순간적인 감각 포착 능력과 조화'
          },
          { 
            title: '무용수들', 
            artist: '에드가 드가', 
            year: '1874', 
            description: '움직임의 순간을 포착한 인상주의 걸작', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Edgar_Degas_-_La_Classe_de_danse.jpg/1280px-Edgar_Degas_-_La_Classe_de_danse.jpg',
            matchPercent: 88,
            curatorNote: '현실의 생생한 순간을 포착하는 SRIF의 관찰력 반영'
          },
          { 
            title: '물랑 루즈의 무도회', 
            artist: '툴루즈 로트렉', 
            year: '1890', 
            description: '파리의 밤 문화를 담은 생동감 있는 작품', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Henri_de_Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg/1280px-Henri_de_Toulouse-Lautrec_-_At_the_Moulin_Rouge_-_Google_Art_Project.jpg',
            matchPercent: 87,
            curatorNote: '감각적 경험과 현재의 즐거움을 추구하는 SRIF의 성향'
          },
          { 
            title: '우는 여인', 
            artist: '파블로 피카소', 
            year: '1937', 
            description: '감정의 직접적이고 강렬한 표현', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/1/14/Picasso_The_Weeping_Woman_Tate_identifier_T05010_10.jpg',
            matchPercent: 90,
            curatorNote: '즉각적인 감정 표현과 시각적 충격이 SRIF와 공명'
          },
          { 
            title: '대사들', 
            artist: '한스 홀바인', 
            year: '1533', 
            description: '현실과 죽음의 대비를 담은 르네상스 명작', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg/1280px-Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg',
            matchPercent: 85,
            curatorNote: '현실의 복잡성과 다층적 의미를 감각적으로 파악'
          }
        ],
        'LAIF': [
          { 
            title: '시계의 폭발', 
            artist: '살바도르 달리', 
            year: '1954', 
            description: '시간과 공간의 초현실적 해체', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/3/3f/The_Disintegration_of_the_Persistence_of_Memory.jpg',
            matchPercent: 95,
            curatorNote: 'LAIF의 혁신적 사고와 현실 해체의 완벽한 표현'
          },
          { 
            title: '이것은 파이프가 아니다', 
            artist: '르네 마그리트', 
            year: '1929', 
            description: '언어와 이미지의 관계를 탐구하는 개념미술', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/b/b9/MagrittePipe.jpg',
            matchPercent: 92,
            curatorNote: '관습적 사고를 전복시키는 LAIF의 창의성 체현'
          },
          { 
            title: '샘', 
            artist: '마르셀 뒤샹', 
            year: '1917', 
            description: '현대미술의 개념을 바꾼 레디메이드', 
            category: ['sculpture', 'contemporary'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg/800px-Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg',
            matchPercent: 94,
            curatorNote: '기존 예술관념을 파괴하는 LAIF의 혁명적 사고'
          },
          { 
            title: '하늘로의 계단', 
            artist: '올라퍼 엘리아슨', 
            year: '2020', 
            description: '빛과 공간의 혁신적 설치미술', 
            category: ['sculpture', 'contemporary'],
            image: 'https://images.squarespace-cdn.com/content/v1/5c7294e5b7c92c5176c92a12/1583932481484-3ZZ4Z4Z4Z4Z4Z4Z4Z4Z4/ke17ZwdGBToddI8pDm48kNvT88LknE-K9M4pGNO0Iqd7gQa3H78H3Y0txjaiv_0fDoOvxcdMmMKkDsyUqMSsMWxHk725yiiHCCLfrh8O1z5QPOohDIaIeljMHgDF5CVlOqpeNLcJ80NK65_fV7S1USOFn4xF8vTWDNAUBm5ducQhX-V3oVjSmr829Rco4W2Uo49ZdOtO_QXox0_W7i2zEA/Olafur+Eliasson',
            matchPercent: 89,
            curatorNote: '지각의 경계를 확장하는 LAIF의 실험정신'
          },
          { 
            title: '블랙 스퀘어', 
            artist: '카지미르 말레비치', 
            year: '1915', 
            description: '절대적 추상의 극한', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Malevich.black-square.jpg/800px-Malevich.black-square.jpg',
            matchPercent: 91,
            curatorNote: '예술의 본질을 재정의하는 LAIF의 급진적 사고'
          }
        ],
        'MRIF': [
          { 
            title: '최후의 만찬', 
            artist: '레오나르도 다 빈치', 
            year: '1498', 
            description: '종교와 예술의 완벽한 결합', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
            matchPercent: 96,
            curatorNote: 'MRIF의 영적 가치와 전통의 중요성을 보여주는 걸작'
          },
          { 
            title: '시스티나 성당 천장화', 
            artist: '미켈란젤로', 
            year: '1512', 
            description: '신성과 인간성의 장대한 서사', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg/1280px-Michelangelo_-_Creation_of_Adam_%28cropped%29.jpg',
            matchPercent: 98,
            curatorNote: '종교적 숭고함과 예술적 완성도가 MRIF의 이상 실현'
          },
          { 
            title: '비너스의 탄생', 
            artist: '산드로 보티첼리', 
            year: '1486', 
            description: '고전 신화의 아름다운 재현', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
            matchPercent: 93,
            curatorNote: '전통적 아름다움과 신화적 가치가 MRIF와 조화'
          },
          { 
            title: '라스 메니나스', 
            artist: '디에고 벨라스케스', 
            year: '1656', 
            description: '궁정 생활의 위엄있는 묘사', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/1024px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg',
            matchPercent: 91,
            curatorNote: '권위와 전통의 우아한 표현이 MRIF의 가치관 반영'
          },
          { 
            title: '밀로의 비너스', 
            artist: '알렉산드로스', 
            year: '기원전 130년경', 
            description: '고전 미의 영원한 기준', 
            category: ['sculpture'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Front_views_of_the_Venus_de_Milo.jpg/800px-Front_views_of_the_Venus_de_Milo.jpg',
            matchPercent: 94,
            curatorNote: '시대를 초월한 미적 기준이 MRIF의 보편적 가치 추구와 일치'
          }
        ],
        'HAIF': [
          { 
            title: '붉은 방', 
            artist: '앙리 마티스', 
            year: '1908', 
            description: '색채의 폭발적 향연', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/Matisse_-_La_Desserte_rouge.jpg/1280px-Matisse_-_La_Desserte_rouge.jpg',
            matchPercent: 94,
            curatorNote: 'HAIF의 대담한 색채 실험과 자유로운 표현 추구'
          },
          { 
            title: '아비뇽의 처녀들', 
            artist: '파블로 피카소', 
            year: '1907', 
            description: '큐비즘의 혁명적 시작', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg',
            matchPercent: 96,
            curatorNote: '기존 미술 문법을 파괴하는 HAIF의 혁명적 정신'
          },
          { 
            title: '블루 폴', 
            artist: '잭슨 폴록', 
            year: '1952', 
            description: '액션 페인팅의 정수', 
            category: ['paintings', 'contemporary'],
            image: 'https://www.jackson-pollock.org/images/paintings/blue-poles.jpg',
            matchPercent: 92,
            curatorNote: '즉흥적 행위와 에너지가 HAIF의 역동성과 공명'
          },
          { 
            title: '사랑', 
            artist: '로버트 인디애나', 
            year: '1970', 
            description: '팝아트의 아이콘', 
            category: ['sculpture', 'contemporary'],
            image: 'https://upload.wikimedia.org/wikipedia/en/b/be/LOVE_sculpture_NY.JPG',
            matchPercent: 88,
            curatorNote: '대중문화와 예술의 경계를 허무는 HAIF의 도전정신'
          },
          { 
            title: '풍선 강아지', 
            artist: '제프 쿤스', 
            year: '1994', 
            description: '키치와 고급예술의 경계 파괴', 
            category: ['sculpture', 'contemporary'],
            image: 'https://www.jeffkoons.com/sites/default/files/artwork-images/bal0299s_0.jpg',
            matchPercent: 87,
            curatorNote: '관습을 조롱하고 새로운 가치를 창조하는 HAIF의 특성'
          }
        ],
        'SRIE': [
          { 
            title: '해바라기', 
            artist: '빈센트 반 고흐', 
            year: '1888', 
            description: '생명력과 에너지의 폭발적 표현', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/800px-Vincent_Willem_van_Gogh_127.jpg',
            matchPercent: 93,
            curatorNote: 'SRIE의 활력과 현재의 아름다움을 즐기는 성향 반영'
          },
          { 
            title: '춤', 
            artist: '앙리 마티스', 
            year: '1910', 
            description: '리듬과 움직임의 순수한 기쁨', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Matissedance.jpg/1280px-Matissedance.jpg',
            matchPercent: 91,
            curatorNote: '신체적 표현과 즉흥성이 SRIE의 에너지와 공명'
          },
          { 
            title: '칸칸 춤', 
            artist: '오귀스트 르누아르', 
            year: '1876', 
            description: '파리의 활기찬 일상', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg/1280px-Auguste_Renoir_-_Dance_at_Le_Moulin_de_la_Galette_-_Mus%C3%A9e_d%27Orsay_RF_2739_%28derivative_work_-_AutoContrast_edit_in_LCH_space%29.jpg',
            matchPercent: 89,
            curatorNote: '사교와 즐거움을 추구하는 SRIE의 라이프스타일'
          },
          { 
            title: '키스', 
            artist: '구스타프 클림트', 
            year: '1908', 
            description: '황금빛 사랑의 표현', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg/800px-The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg',
            matchPercent: 92,
            curatorNote: '감각적 아름다움과 정열이 SRIE의 감성과 일치'
          },
          { 
            title: '봄', 
            artist: '산드로 보티첼리', 
            year: '1482', 
            description: '생명과 재생의 축제', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Botticelli-primavera.jpg/1280px-Botticelli-primavera.jpg',
            matchPercent: 88,
            curatorNote: '자연의 아름다움과 축제 분위기가 SRIE와 조화'
          }
        ],
        'LAIE': [
          { 
            title: '상대성', 
            artist: 'M.C. 에셔', 
            year: '1953', 
            description: '논리와 환상의 교차점', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/a/a3/Escher%27s_Relativity.jpg',
            matchPercent: 96,
            curatorNote: 'LAIE의 독창적 사고와 다차원적 관점의 완벽한 시각화'
          },
          { 
            title: '메타모르포시스', 
            artist: 'M.C. 에셔', 
            year: '1937', 
            description: '형태의 무한한 변형', 
            category: ['paintings', 'modern'],
            image: 'https://www.mcescher.com/wp-content/uploads/2013/10/LW210-MC-Escher-Metamorphosis-I-19371.jpg',
            matchPercent: 94,
            curatorNote: '패턴과 변화를 탐구하는 LAIE의 분석적 창의성'
          },
          { 
            title: '광학적 환영', 
            artist: '빅토르 바사렐리', 
            year: '1964', 
            description: '옵아트의 시각적 실험', 
            category: ['paintings', 'contemporary'],
            image: 'https://www.victor-vasarely.com/wp-content/uploads/2019/01/vega-200-1968.jpg',
            matchPercent: 91,
            curatorNote: '지각과 인지의 경계를 탐구하는 LAIE의 실험정신'
          },
          { 
            title: '무제 (거울 큐브)', 
            artist: '로버트 모리스', 
            year: '1965', 
            description: '미니멀리즘의 개념적 탐구', 
            category: ['sculpture', 'contemporary'],
            image: 'https://www.tate.org.uk/art/images/work/T/T01/T01532_10.jpg',
            matchPercent: 89,
            curatorNote: '공간과 지각의 관계를 재정의하는 LAIE의 개념미술'
          },
          { 
            title: '구성 VII', 
            artist: '바실리 칸딘스키', 
            year: '1913', 
            description: '음악과 색채의 추상적 교향곡', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Vassily_Kandinsky%2C_1913_-_Composition_7.jpg/1280px-Vassily_Kandinsky%2C_1913_-_Composition_7.jpg',
            matchPercent: 90,
            curatorNote: '복잡한 구조와 조화를 추구하는 LAIE의 체계적 사고'
          }
        ],
        'MRIE': [
          { 
            title: '워싱턴 대통령 초상', 
            artist: '길버트 스튜어트', 
            year: '1796', 
            description: '권위와 품격의 상징', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg/800px-Gilbert_Stuart_Williamstown_Portrait_of_George_Washington.jpg',
            matchPercent: 92,
            curatorNote: 'MRIE가 추구하는 리더십과 권위의 시각적 구현'
          },
          { 
            title: '나폴레옹의 대관식', 
            artist: '자크루이 다비드', 
            year: '1807', 
            description: '권력과 영광의 정점', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg/1280px-Jacques-Louis_David_-_The_Coronation_of_Napoleon_%281805-1807%29.jpg',
            matchPercent: 95,
            curatorNote: '역사적 순간과 권력의 극적 표현이 MRIE와 공명'
          },
          { 
            title: '링컨 기념관', 
            artist: '다니엘 체스터 프렌치', 
            year: '1920', 
            description: '리더십과 희생의 기념비', 
            category: ['sculpture'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Lincoln_Memorial_%28Lincoln_contrasty%29.jpg/800px-Lincoln_Memorial_%28Lincoln_contrasty%29.jpg',
            matchPercent: 93,
            curatorNote: '국가적 이상과 리더십을 구현한 MRIE의 가치관'
          },
          { 
            title: '자유의 여신상', 
            artist: '프레데리크 오귀스트 바르톨디', 
            year: '1886', 
            description: '자유와 독립의 상징', 
            category: ['sculpture'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/800px-Statue_of_Liberty_7.jpg',
            matchPercent: 94,
            curatorNote: '원칙과 이상을 수호하는 MRIE의 정신적 지향'
          },
          { 
            title: '정의의 여신', 
            artist: '작자 미상', 
            year: '고대 로마', 
            description: '법과 정의의 화신', 
            category: ['sculpture'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Lady_Justice.jpg/800px-Lady_Justice.jpg',
            matchPercent: 91,
            curatorNote: '공정성과 질서를 중시하는 MRIE의 핵심 가치'
          }
        ],
        'HAIE': [
          { 
            title: '폭발하는 별', 
            artist: '로이 리히텐슈타인', 
            year: '1963', 
            description: '팝아트의 폭발적 에너지', 
            category: ['paintings', 'contemporary'],
            image: 'https://www.moma.org/media/W1siZiIsIjE1MTQ3NSJdLFsicCIsImNvbnZlcnQiLCItcXVhbGl0eSA5MCAtcmVzaXplIDIwMDB4MjAwMFx1MDAzZSJdXQ.jpg?sha=33c151dd6eea92a0',
            matchPercent: 92,
            curatorNote: 'HAIE의 즉각적이고 강렬한 표현 욕구와 일치'
          },
          { 
            title: '원초적 외침', 
            artist: '프란시스 베이컨', 
            year: '1944', 
            description: '인간 존재의 극한적 표현', 
            category: ['paintings', 'modern'],
            image: 'https://www.francis-bacon.com/system/files/images/three-studies-for-figures-at-the-base-of-a-crucifixion.jpg',
            matchPercent: 94,
            curatorNote: '극단적 감정과 실존적 불안이 HAIE의 내면과 공명'
          },
          { 
            title: '붉은 큰 폭발', 
            artist: '이브 클라인', 
            year: '1960', 
            description: '단색의 극한적 탐구', 
            category: ['paintings', 'contemporary'],
            image: 'https://www.yvesklein.com/uploads/images/_1200xAUTO_crop_center-center_none/IKB-191_RP_CMJN.jpg',
            matchPercent: 90,
            curatorNote: '단순함 속의 강렬함이 HAIE의 직접적 표현과 연결'
          },
          { 
            title: '파괴된 방', 
            artist: '고든 마타클락', 
            year: '1974', 
            description: '건축적 파괴의 미학', 
            category: ['photography', 'contemporary'],
            image: 'https://www.macba.cat/en/art-artists/artists/matta-clark-gordon/splitting',
            matchPercent: 88,
            curatorNote: '기존 질서의 파괴와 재창조가 HAIE의 혁명성 반영'
          },
          { 
            title: '불타는 의자', 
            artist: '요셉 보이스', 
            year: '1969', 
            description: '사회 조각의 급진적 실험', 
            category: ['sculpture', 'contemporary'],
            image: 'https://www.tate.org.uk/art/images/work/AR/AR00001_10.jpg',
            matchPercent: 91,
            curatorNote: '행동과 예술의 결합이 HAIE의 실천적 성향과 일치'
          }
        ],
        'SREF-A': [
          { 
            title: '별이 빛나는 밤', 
            artist: '빈센트 반 고흐', 
            year: '1889', 
            description: '내면의 감정을 우주적 시각으로 표현', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
            matchPercent: 96,
            curatorNote: 'SREF-A의 깊은 성찰과 우주적 연결감의 완벽한 표현'
          }
        ],
        'LAEF-P': [
          { 
            title: '기억의 지속', 
            artist: '살바도르 달리', 
            year: '1931', 
            description: '시간의 상대성을 탐구하는 초현실주의', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
            matchPercent: 97,
            curatorNote: 'LAEF-P의 창의적 지각과 현실 재해석의 극치'
          }
        ],
        'MREF-J': [
          { 
            title: '아테네 학파', 
            artist: '라파엘로', 
            year: '1511', 
            description: '지혜와 학문의 이상적 공간', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg/1280px-%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg',
            matchPercent: 95,
            curatorNote: 'MREF-J의 체계적 사고와 전통적 가치의 조화'
          }
        ],
        'HAEF-T': [
          { 
            title: '게르니카', 
            artist: '파블로 피카소', 
            year: '1937', 
            description: '전쟁의 참상을 고발하는 역작', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg',
            matchPercent: 98,
            curatorNote: 'HAEF-T의 강렬한 메시지와 변혁적 힘의 표현'
          }
        ],
        'SRIF-I': [
          { 
            title: '인상, 해돋이', 
            artist: '클로드 모네', 
            year: '1872', 
            description: '순간의 빛을 포착한 인상주의의 시작', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg',
            matchPercent: 93,
            curatorNote: 'SRIF-I의 감각적 직관과 순간의 아름다움 포착'
          }
        ],
        'LAIF-N': [
          { 
            title: '샘', 
            artist: '마르셀 뒤샹', 
            year: '1917', 
            description: '예술 개념을 전복시킨 레디메이드', 
            category: ['sculpture', 'contemporary'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg/800px-Marcel_Duchamp%2C_1917%2C_Fountain%2C_photograph_by_Alfred_Stieglitz.jpg',
            matchPercent: 96,
            curatorNote: 'LAIF-N의 혁명적 사고와 기존 관념의 파괴'
          }
        ],
        'MRIF-S': [
          { 
            title: '최후의 만찬', 
            artist: '레오나르도 다 빈치', 
            year: '1498', 
            description: '종교적 서사의 극적 순간', 
            category: ['paintings'],
            image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg/1280px-The_Last_Supper_-_Leonardo_Da_Vinci_-_High_Resolution_32x16.jpg',
            matchPercent: 97,
            curatorNote: 'MRIF-S의 영적 가치와 인간적 드라마의 결합'
          }
        ],
        'HAIF-F': [
          { 
            title: '아비뇽의 처녀들', 
            artist: '파블로 피카소', 
            year: '1907', 
            description: '큐비즘 혁명의 선언', 
            category: ['paintings', 'modern'],
            image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Les_Demoiselles_d%27Avignon.jpg',
            matchPercent: 95,
            curatorNote: 'HAIF-F의 대담한 실험과 형식 파괴의 정점'
          }
        ]
      };
      
      const userType = userProfile?.typeCode || userProfile?.personalityType || 'SREF';
      let typeRecommendations = aptRecommendations[userType] || aptRecommendations['SREF'];
      
      // 카테고리에 따른 필터링
      if (selectedCategory && selectedCategory !== 'all') {
        typeRecommendations = typeRecommendations.filter(rec => 
          rec.category && rec.category.includes(selectedCategory)
        );
      }
      
      // 만약 필터링 후 결과가 없다면 모든 추천 보여주기
      if (typeRecommendations.length === 0) {
        typeRecommendations = aptRecommendations[userType] || aptRecommendations['SREF'];
      }
      
      typeRecommendations.slice(0, 5).forEach((rec, i) => {
        recommendations.push({
          id: `rec-${i}`,
          title: rec.title,
          artist: rec.artist,
          year: rec.year,
          description: rec.description,
          href: '#',
          image: rec.image || `https://picsum.photos/600/400?random=rec${i}`
        });
      });
      
      setRecommendedArtworks(recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const fetchArtworks = async (category: string) => {
    setLoadingArtworks(true);
    // Don't clear previous artworks to prevent flashing
    
    try {
      console.log('Fetching artworks for category:', category);
      
      // Temporarily use mock data to avoid CORS issues
      const useMockData = true;
      
      if (useMockData) {
        // Generate mock artworks
        const mockArtworks: GalleryArtwork[] = [];
        const artists = ['Claude Monet', 'Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Rembrandt'];
        const styles = ['Impressionism', 'Post-Impressionism', 'Cubism', 'Renaissance', 'Baroque'];
        
        for (let i = 0; i < 12; i++) {
          mockArtworks.push({
            id: `mock-${category}-${i}`,
            title: `${category === 'all' ? 'Masterpiece' : category} ${i + 1}`,
            artist: artists[i % artists.length],
            year: `${1850 + Math.floor(Math.random() * 150)}`,
            imageUrl: `https://picsum.photos/400/500?random=${category}${i}`,
            museum: 'The Metropolitan Museum of Art',
            medium: 'Oil on canvas',
            department: category,
            isPublicDomain: true,
            license: 'CC0'
          });
        }
        
        setGalleryArtworks(mockArtworks);
        setLoadingArtworks(false);
        return;
      }
      // Get personalized recommendations from backend (only for authenticated users)
      let searchQuery = 'masterpiece';
      let departmentId = category === 'all' ? null : ART_CATEGORIES.find(cat => cat.id === category)?.metDepartment || 11;
      
      if (!isGuestMode && user) {
        try {
          // Skip backend recommendations for now
          const skipBackendRecommendations = true;
          if (skipBackendRecommendations) {
            // Use local recommendations
          } else {
            const token = localStorage.getItem('token');
            const recResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/artworks/recommendations?category=${category}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (recResponse.ok) {
              const recommendations = await recResponse.json();
              searchQuery = recommendations.searchTerms[0] || 'masterpiece';
              departmentId = recommendations.metApiConfig.departmentIds[0] || departmentId;
            }
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          // Fall back to category-based search
          const categorySearchTerms: Record<string, string[]> = {
            all: ['masterpiece', 'art', 'painting'],
            paintings: ['painting', 'oil painting', 'portrait'],
            sculpture: ['sculpture', 'statue', 'bronze'],
            photography: ['photography', 'photograph', 'photo'],
            'asian-art': ['asian art', 'china', 'japan', 'korea'],
            modern: ['modern art', 'impressionism', 'abstract'],
            contemporary: ['contemporary art', 'modern', 'abstract']
          };
          
          const searchTerms = categorySearchTerms[category] || ['masterpiece'];
          searchQuery = searchTerms[Math.floor(Math.random() * searchTerms.length)];
        }
      } else {
        // For guest mode, use category-based search terms
        const guestSearchTerms = getGuestSearchTerms(category);
        searchQuery = guestSearchTerms[Math.floor(Math.random() * guestSearchTerms.length)];
      }

      // Use cached artworks if available
      const cacheKey = `gallery_${category}_${searchQuery}_${departmentId}`;
      const cachedArtworks = localStorage.getItem(cacheKey);
      
      if (cachedArtworks) {
        const { artworks: cached, timestamp } = JSON.parse(cachedArtworks);
        // Use cache if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          setGalleryArtworks(cached);
          return;
        }
      }
      
      // COMPLIANCE: Search with isPublicDomain filter to get only CC0 artworks
      const searchUrl = departmentId 
        ? `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&q=${searchQuery}&hasImages=true&isPublicDomain=true`
        : `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchQuery}&hasImages=true&isPublicDomain=true`;
      
      const searchResponse = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!searchResponse.ok) {
        console.error('Search failed:', searchResponse.status, searchResponse.statusText);
        throw new Error(`Failed to fetch artworks: ${searchResponse.status}`);
      }
      
      const searchData = await searchResponse.json();
      const objectIDs = searchData.objectIDs?.slice(0, 20) || [];
      
      // Batch fetch with better error handling
      const validArtworks: Artwork[] = [];
      const batchSize = 5;
      
      for (let i = 0; i < objectIDs.length && validArtworks.length < 15; i += batchSize) {
        const batch = objectIDs.slice(i, i + batchSize);
        const batchPromises = batch.map(async (id: number) => {
          try {
            const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              mode: 'cors'
            });
            const artwork = await response.json();
            
            // Debug: Log the first artwork to check image URLs
            if (i === 0 && id === batch[0]) {
              console.log('🖼️ Sample artwork data:', {
                title: artwork.title,
                primaryImage: artwork.primaryImage,
                primaryImageSmall: artwork.primaryImageSmall,
                isPublicDomain: artwork.isPublicDomain
              });
            }
            
            // COMPLIANCE: Only include public domain artworks (CC0 license)
            if (artwork.primaryImage && 
                artwork.title && 
                artwork.artistDisplayName && 
                artwork.isPublicDomain === true) {
              return {
                id: artwork.objectID.toString(),
                title: artwork.title,
                artist: artwork.artistDisplayName || 'Unknown Artist',
                year: artwork.objectDate || 'Unknown Date',
                imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
                museum: 'Metropolitan Museum of Art',
                medium: artwork.medium || 'Unknown Medium',
                department: artwork.department || 'Art',
                culture: artwork.culture,
                period: artwork.period,
                dimensions: artwork.dimensions,
                museumUrl: artwork.objectURL,
                isPublicDomain: artwork.isPublicDomain,
                license: 'CC0 - Public Domain'
              };
            }
            return null;
          } catch (error) {
            console.error('Error fetching artwork:', error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validBatch = batchResults.filter((artwork): artwork is Artwork => artwork !== null);
        validArtworks.push(...validBatch);
        
        // Small delay between batches
        if (i + batchSize < objectIDs.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`📊 Gallery loaded: ${validArtworks.length} artworks`);
      if (validArtworks.length > 0) {
        console.log('🎨 First artwork:', validArtworks[0]);
      }
      
      setGalleryArtworks(validArtworks as any);
      
      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify({
        artworks: validArtworks,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks. Please try again.');
    } finally {
      setLoadingArtworks(false);
    }
  };

  const getSearchTermsForProfile = (profile: UserProfile | null): string[] => {
    if (!profile) return ['art', 'painting', 'masterpiece'];
    
    // Map emotional tags and type codes to search terms
    const searchMapping: Record<string, string[]> = {
      'contemplative': ['meditation', 'peaceful', 'serene'],
      'energetic': ['dynamic', 'vibrant', 'movement'],
      'introspective': ['portrait', 'solitude', 'reflection'],
      'curious': ['landscape', 'exploration', 'discovery'],
      'emotional': ['expressionism', 'abstract', 'color'],
      'analytical': ['geometric', 'structure', 'composition'],
      'traditional': ['classical', 'renaissance', 'baroque'],
      'modern': ['contemporary', 'modern', 'avant-garde']
    };
    
    const terms: string[] = [];
    
    // Add terms based on emotional tags
    profile.emotionalTags?.forEach(tag => {
      if (searchMapping[tag.toLowerCase()]) {
        terms.push(...searchMapping[tag.toLowerCase()]);
      }
    });
    
    // Add terms based on type code
    const typeCode = profile.typeCode || '';
    if (typeCode.includes('A')) terms.push('abstract', 'modern');
    if (typeCode.includes('R')) terms.push('realistic', 'portrait');
    if (typeCode.includes('E')) terms.push('expressive', 'emotional');
    if (typeCode.includes('M')) terms.push('classical', 'detailed');
    
    return terms.length > 0 ? [...new Set(terms)] : ['art', 'painting'];
  };

  const getGuestSearchTerms = (category: string): string[] => {
    const categoryTerms: Record<string, string[]> = {
      'paintings': ['painting', 'masterpiece', 'portrait', 'landscape', 'still life'],
      'sculpture': ['sculpture', 'bronze', 'marble', 'statue', 'carving'],
      'photography': ['photograph', 'portrait', 'street', 'documentary', 'art'],
      'asian-art': ['asian', 'chinese', 'japanese', 'calligraphy', 'ceramics'],
      'modern': ['modern', 'contemporary', 'abstract', 'expressionism', 'cubism'],
      'contemporary': ['contemporary', 'installation', 'conceptual', 'new media', 'digital']
    };
    
    return categoryTerms[category] || ['art', 'masterpiece', 'beautiful'];
  };

  const trackInteraction = async (artworkId: string, action: string, metadata = {}) => {
    // Only track interactions if user is authenticated (not in guest mode)
    if (isGuestMode || !user) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artworkId, action, metadata })
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleLike = async (artworkId: string) => {
    if (isGuestMode) {
      toast.success('Sign up to save favorites!');
      return;
    }

    const newLiked = new Set(likedArtworks);
    const isLiking = !newLiked.has(artworkId);
    
    if (isLiking) {
      newLiked.add(artworkId);
      toast.success('Added to favorites');
      await trackInteraction(artworkId, 'like');
      // if (user) trackArtworkLiked(); // Track for achievements - TODO: implement
    } else {
      newLiked.delete(artworkId);
      toast.success('Removed from favorites');
      await trackInteraction(artworkId, 'unlike');
    }
    
    setLikedArtworks(newLiked);
    saveUserPreferences();
  };

  const handleView = async (artworkId: string) => {
    const newViewed = new Set(viewedArtworks);
    if (!newViewed.has(artworkId)) {
      newViewed.add(artworkId);
      setViewedArtworks(newViewed);
      saveUserPreferences();
      await trackInteraction(artworkId, 'view');
      // if (user) trackArtworkViewed(); // Track for achievements - TODO: implement
    }
  };

  const shuffleArtworks = () => {
    const shuffled = [...galleryArtworks].sort(() => Math.random() - 0.5);
    setGalleryArtworks(shuffled);
    toast.success('Gallery shuffled!');
  };

  if (loading && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
          <p className="text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Art Gallery</h2>
          <p className="text-muted-foreground mb-6">Please log in to explore personalized artworks</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // 사용자 APT 타입 가져오기 (SAYU 4축 코드)
  const userAptType = userProfile?.typeCode || (user as any)?.personality_type || 'SREF';

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url('/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg')`
      }}
    >
      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b backdrop-blur-md sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80"
        style={{ 
          borderColor: '#e5e7eb'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  내 컬렉션
                  {isGuestMode && (
                    <Badge variant="secondary" className="ml-2 rounded-full">
                      Guest Mode
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
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
                  <Button variant="outline" size="sm" onClick={() => router.push('/quiz')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Get Personalized
                  </Button>
                  <Button size="sm" onClick={() => router.push('/register')}>
                    Sign Up Free
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    onClick={shuffleArtworks}
                    className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50 border-0"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                  <GalleryStats 
                    totalArtworks={galleryArtworks.length}
                    likedCount={likedArtworks.size}
                    viewedCount={viewedArtworks.size}
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Category Filter - Feature 108 스타일 */}
          <div className="mt-4">
            <CategoryFilter 
              categories={ART_CATEGORIES}
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg mt-4">
        {/* 추천 섹션 - 간단한 그리드로 변경 */}
        {!isGuestMode && recommendedArtworks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                  {userAptType} 유형을 위한 추천 작품
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI Curator가 당신의 APT 분석을 기반으로 큐레이션한 작품들입니다
                </p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                더보기 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {/* 추천 작품 horizontal scroll - 트렌디한 스크롤바 */}
            <div className="relative overflow-x-auto pb-4 custom-scrollbar">
              <div className="flex gap-4 min-w-max">
                {recommendedArtworks.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group w-64 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border border-gray-200 dark:border-gray-700"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* 추천 작품 액션 버튼 */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-10">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full backdrop-blur-md bg-white/80 hover:bg-white/90 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('좋아요가 추가되었습니다');
                          }}
                        >
                          <Heart className="w-4 h-4 text-purple-600" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full backdrop-blur-md bg-white/80 hover:bg-white/90 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('보관함에 추가되었습니다');
                          }}
                        >
                          <Bookmark className="w-4 h-4 text-purple-600" />
                        </motion.button>
                      </div>
                      
                      <Sparkles className="absolute bottom-4 left-4 w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12" />
                      
                      {/* 실제 이미지 표시 */}
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-1 text-gray-800 dark:text-gray-200">{item.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{item.artist} · {item.year}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{item.curatorNote || item.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          {userAptType} 매치 {item.matchPercent || 95}%
                        </Badge>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 벤토 그리드 이미지 섹션 - 내 아카이빙 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                내 아트 아카이빙
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                지금까지 수집한 작품들을 한눈에 볼 수 있습니다
              </p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
              모두 보기 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Gallery Grid - SAYU Gallery Grid 사용 */}
        {loading_artworks && galleryArtworks.length === 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <SayuGalleryGrid
            artworks={galleryArtworks
              .filter(artwork => {
                // Client-side filtering based on category
                if (selectedCategory === 'all') return true;
                
                // Map artwork department to our categories
                const categoryMap: Record<string, string[]> = {
                  'paintings': ['European Paintings', 'American Paintings and Sculpture', 'Asian Art', 'Modern and Contemporary Art'],
                  'sculpture': ['Greek and Roman Art', 'European Sculpture and Decorative Arts', 'American Decorative Arts'],
                  'photography': ['Photographs', 'Modern and Contemporary Art'],
                  'asian-art': ['Asian Art', 'Chinese Art', 'Japanese Art', 'Korean Art'],
                  'modern': ['Modern and Contemporary Art', 'Modern Art'],
                  'contemporary': ['Modern and Contemporary Art', 'Contemporary Art']
                };
                
                const validDepartments = categoryMap[selectedCategory] || [];
                return validDepartments.some(dept => 
                  artwork.department?.toLowerCase().includes(dept.toLowerCase())
                );
              })
              .map(artwork => ({
              ...artwork,
              isLiked: likedArtworks.has(artwork.id),
              viewCount: viewedArtworks.has(artwork.id) ? 1 : 0,
              perceptionCount: Math.floor(Math.random() * 20), // 임시 데이터
              tags: ['인상주의', '풍경화', '19세기'].slice(0, Math.floor(Math.random() * 3) + 1)
            }))}
            onLike={handleLike}
            onArchive={(id) => toast.success('보관함에 추가되었습니다')}
            onView={handleView}
            onPerceptionClick={(artwork) => {
              router.push(`/perception-exchange?artwork=${artwork.id}`);
            }}
            layout={layout}
            showPerceptionPreview={true}
            enableGlareEffect={true}
            hideActions={true} // 이미 아카이빙된 작품이므로 액션 버튼 숨김
          />
        )}

        {/* Empty state */}
        {!loading_artworks && galleryArtworks.length === 0 && (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
            <p className="text-muted-foreground mb-4">Try selecting a different category</p>
            <Button onClick={() => fetchArtworks(selectedCategory)}>
              Retry
            </Button>
          </div>
        )}

        {/* Guest Mode CTA Banner */}
        {isGuestMode && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">
                🎨 Unlock Your Personal Art Journey
              </h3>
              <p className="text-purple-700 dark:text-purple-300 mb-4">
                Take our personality quiz to get curated recommendations, save favorites, and discover art that truly resonates with you.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push('/quiz')} className="bg-purple-600 hover:bg-purple-700">
                  Take Personality Quiz
                </Button>
                <Button onClick={() => router.push('/register')} variant="outline" className="border-purple-300 text-purple-700">
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Met Museum Attribution & License Notice */}
        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg text-sm border border-gray-200 dark:border-gray-700">
          <p className="flex items-center gap-2 mb-2 text-gray-700 dark:text-gray-300">
            <ExternalLink className="w-4 h-4" />
            <strong>Artwork Collection</strong>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            This gallery features artworks from The Metropolitan Museum of Art&apos;s Open Access collection, 
            available under the Creative Commons Zero (CC0) license. All displayed artworks are in the 
            public domain and free to use.
          </p>
          <p className="mt-2">
            <a 
              href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 dark:text-purple-400 hover:underline"
            >
              Learn more about The Met&apos;s Open Access initiative →
            </a>
          </p>
        </div>
        
        {/* 모바일 하단 여백 추가 */}
        <div className="h-20 md:hidden" />
      </div>
      
      {/* Floating Dock - 데스크톱 */}
      <FloatingDock
        onShuffle={shuffleArtworks}
        onFilter={() => toast('고급 필터 기능 준비 중입니다')}
        onLayoutChange={setLayout}
        currentLayout={layout}
      />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onShuffle={shuffleArtworks}
        onFilter={() => toast('고급 필터 기능 준비 중입니다')}
        currentLayout={layout}
        onLayoutChange={setLayout}
      />
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}