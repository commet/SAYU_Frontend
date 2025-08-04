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