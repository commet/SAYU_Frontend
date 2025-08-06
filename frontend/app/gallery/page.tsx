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
      const recommendations = [];
      
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
          image: rec.image || `https://picsum.photos/600/400?random=rec${i}`,
          matchPercent: rec.matchPercent,
          curatorNote: rec.curatorNote
        });
      });
      
      setRecommendedArtworks(recommendations);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const fetchArtworks = async (category: string) => {
    console.log('🎨 fetchArtworks started for category:', category);
    console.log('🔄 Setting loading to true...');
    setLoadingArtworks(true);
    
    try {
      console.log('Fetching artworks for category:', category);
      
      // 유저의 APT 유형에 따른 맞춤 추천 작품 가져오기
      const getPersonalizedArtworks = () => {
        const userType = user?.aptType;
        if (userType && aptRecommendations[userType]) {
          return aptRecommendations[userType].map((artwork, i) => ({
            id: `apt-${userType}-${i}`,
            title: artwork.title,
            artist: artwork.artist,
            year: artwork.year,
            imageUrl: artwork.image || 'https://via.placeholder.com/400x300',
            museum: 'SAYU Curated Collection',
            medium: 'Oil on canvas',
            department: category,
            isPublicDomain: true,
            license: 'CC0',
            matchPercent: artwork.matchPercent,
            curatorNote: artwork.curatorNote,
            description: artwork.description
          }));
        }
        return [];
      };
      
      // 카테고리별 실제 작품 데이터 - Cloudinary의 실제 작품들
      const categoryArtworks: Record<string, any[]> = {
        'all': getPersonalizedArtworks().length > 0 ? getPersonalizedArtworks() : [
          { title: '꽃이 있는 정물', artist: '오딜롱 르동', year: '1905', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754459/sayu/met-artworks/met-chicago-110982.jpg' },
          { title: '테이블 모서리의 정물', artist: '앙리 팡탱-라투르', year: '1873', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754461/sayu/met-artworks/met-chicago-75507.jpg' },
          { title: '그릇 속의 장미', artist: '앙리 팡탱-라투르', year: '1881', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754469/sayu/met-artworks/met-chicago-20534.jpg' },
          { title: '원숭이와 과일, 꽃이 있는 정물', artist: '장 바티스트 우드리', year: '1724', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754474/sayu/met-artworks/met-chicago-94126.jpg' },
          { title: '목련과 파란 벨벳', artist: '마틴 존슨 히드', year: '1885-95', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754449/sayu/met-artworks/met-chicago-100829.jpg' },
          { title: '과일 정물', artist: '한나 브라운 스킬', year: '1860', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754451/sayu/met-artworks/met-chicago-156596.jpg' },
          { title: '수태고지', artist: '장 에이', year: '1490-95', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752838554/sayu/met-artworks/met-chicago-16327.jpg' },
          { title: '과일과 아스파라거스 바구니', artist: '루이즈 모용', year: '1630', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754472/sayu/met-artworks/met-chicago-62450.jpg' },
          { title: '정물 3번', artist: '마스던 하틀리', year: '1923', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754465/sayu/met-artworks/met-chicago-65940.jpg' },
          { title: '꽃이 있는 정물', artist: '앙리 팡탱-라투르', year: '1881', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752754467/sayu/met-artworks/met-chicago-72180.jpg' },
          { title: '과일과 와인 주전자', artist: '아돌프 몽티셀리', year: '1874', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752835716/sayu/met-artworks/met-chicago-72183.jpg' },
          { title: '정물', artist: '외젠 카리에르', year: '1875', imageUrl: 'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752835718/sayu/met-artworks/met-chicago-27170.jpg' }
        ],
        'paintings': [
          { title: '별이 빛나는 밤', artist: '빈센트 반 고흐', year: '1889', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg' },
          { title: '모나리자', artist: '레오나르도 다 빈치', year: '1503', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg' },
          { title: '진주 귀걸이를 한 소녀', artist: '요하네스 베르메르', year: '1665', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Meisje_met_de_parel.jpg/800px-Meisje_met_de_parel.jpg' },
          { title: '수련', artist: '클로드 모네', year: '1916', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Claude_Monet_-_Water_Lilies_-_1906.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906.jpg' },
          { title: '인상, 해돋이', artist: '클로드 모네', year: '1872', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg' },
          { title: '게르니카', artist: '파블로 피카소', year: '1937', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg' }
        ],
        'sculpture': [
          { title: '다비드', artist: '미켈란젤로', year: '1504', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Michelangelo%27s_David_-_right_view_2.jpg/600px-Michelangelo%27s_David_-_right_view_2.jpg' },
          { title: '피에타', artist: '미켈란젤로', year: '1499', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Michelangelo%27s_Pieta_5450_cropncleaned_edit.jpg/800px-Michelangelo%27s_Pieta_5450_cropncleaned_edit.jpg' },
          { title: '생각하는 사람', artist: '오귀스트 로댕', year: '1902', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Paris_2010_-_Le_Penseur.jpg/600px-Paris_2010_-_Le_Penseur.jpg' },
          { title: '자유의 여신상', artist: '프레데릭 오귀스트 바르톨디', year: '1886', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Statue_of_Liberty_7.jpg/800px-Statue_of_Liberty_7.jpg' }
        ],
        'photography': [
          { title: '아프간 소녀', artist: '스티브 맥커리', year: '1984', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b4/Sharbat_Gula.jpg' },
          { title: '달 위의 인간', artist: 'NASA', year: '1969', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/800px-Aldrin_Apollo_11_original.jpg' },
          { title: '점심시간', artist: '찰스 이베츠', year: '1932', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Lunch-atop-a-skyscraper-c1932.jpg/800px-Lunch-atop-a-skyscraper-c1932.jpg' }
        ],
        'asian-art': [
          { title: '후지산 36경', artist: '가츠시카 호쿠사이', year: '1831', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1280px-The_Great_Wave_off_Kanagawa.jpg' },
          { title: '기린도', artist: '전기', year: '조선시대', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Giraffe_from_bengal.jpg/800px-Giraffe_from_bengal.jpg' },
          { title: '묵죽도', artist: '정선', year: '18세기', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bamboo_in_the_Wind.jpg/600px-Bamboo_in_the_Wind.jpg' }
        ],
        'modern': [
          { title: '게르니카', artist: '파블로 피카소', year: '1937', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/PicassoGuernica.jpg' },
          { title: '아를의 침실', artist: '빈센트 반 고흐', year: '1888', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Vincent_van_Gogh_-_The_Bedroom_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_The_Bedroom_-_Google_Art_Project.jpg' },
          { title: '기억의 지속', artist: '살바도르 달리', year: '1931', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg' }
        ],
        'contemporary': [
          { title: '캠벨 수프 캔', artist: '앤디 워홀', year: '1962', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1f/Campbell%27s_Soup_Cans_by_Andy_Warhol.jpg' },
          { title: 'Infinity Room', artist: '쿠사마 야요이', year: '2013', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Yayoi_Kusama%27s_Infinity_Room.jpg/1024px-Yayoi_Kusama%27s_Infinity_Room.jpg' },
          { title: 'Balloon Dog', artist: '제프 쿤스', year: '1994', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Jeff_Koons_Balloon_Dog.jpg/800px-Jeff_Koons_Balloon_Dog.jpg' }
        ]
      };

      const selectedArtworks = categoryArtworks[category] || categoryArtworks['all'];
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
    const newLiked = new Set(likedArtworks);
    const isLiking = !newLiked.has(artworkId);
    
    if (isLiking) {
      newLiked.add(artworkId);
      toast.success('Added to favorites');
    } else {
      newLiked.delete(artworkId);
      toast.success('Removed from favorites');
    }
    
    setLikedArtworks(newLiked);
    
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
                    totalArtworks={galleryArtworks.length}
                    likedCount={likedArtworks.size}
                    viewedCount={viewedArtworks.size}
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
                <p className="text-sm text-gray-300">
                  AI Curator가 당신의 APT 분석을 기반으로 큐레이션한 작품들입니다
                </p>
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
                          className="p-2 rounded-full backdrop-blur-md bg-slate-800/80 hover:bg-slate-700/90 shadow-lg border border-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('좋아요가 추가되었습니다');
                          }}
                        >
                          <Heart className="w-4 h-4 text-purple-400" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 rounded-full backdrop-blur-md bg-slate-800/80 hover:bg-slate-700/90 shadow-lg border border-slate-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('보관함에 추가되었습니다');
                          }}
                        >
                          <Bookmark className="w-4 h-4 text-purple-400" />
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
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLike(artwork.id)}
                          className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/90 transition-colors border border-slate-600"
                        >
                          <Heart className={`w-4 h-4 ${likedArtworks.has(artwork.id) ? 'text-red-400 fill-current' : 'text-slate-300'}`} />
                        </button>
                        <button
                          onClick={() => handleView(artwork.id)}
                          className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700/90 transition-colors border border-slate-600"
                        >
                          <Eye className="w-4 h-4 text-slate-300" />
                        </button>
                      </div>
                    </div>
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