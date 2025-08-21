'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Heart, Eye, ArrowLeft, UserPlus, Lock, Sparkles, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useResponsive } from '@/lib/responsive';
import { GuestStorage } from '@/lib/guest-storage';
import { useGuestTracking } from '@/hooks/useGuestTracking';
import { ProgressiveSignupPrompt } from '@/components/onboarding/ProgressiveSignupPrompt';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface CollectionArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium: string;
  matchPercent?: number;
  curatorNote?: string;
}

function CollectionContent() {
  const { user, loading } = useAuth();
  const { isMobile } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = !user;
  
  const [savedArtworks, setSavedArtworks] = useState<CollectionArtwork[]>([]);
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [showPrompt, setShowPrompt] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Guest tracking for progressive prompts
  const { trackInteraction, getInteractionData } = useGuestTracking();
  
  useEffect(() => {
    loadUserCollection();
  }, [user]);

  useEffect(() => {
    // Set up guest milestone listener
    const handleGuestMilestone = (event: CustomEvent) => {
      const { milestone } = event.detail;
      if (milestone === 'first_save' || milestone === 'collection_started') {
        setShowPrompt(true);
      }
    };

    window.addEventListener('guest-milestone', handleGuestMilestone as any);
    return () => window.removeEventListener('guest-milestone', handleGuestMilestone as any);
  }, []);

  const loadUserCollection = async () => {
    try {
      if (isGuest) {
        // Load from guest storage
        const guestData = GuestStorage.getData();
        const mockArtworks = generateMockArtworks(guestData.savedArtworks);
        setSavedArtworks(mockArtworks);
        
        // Check if we should show signup prompt based on engagement
        const interactionData = getInteractionData();
        if (interactionData.totalInteractions > 5 || guestData.savedArtworks.length >= 3) {
          setTimeout(() => setShowPrompt(true), 2000);
        }
      } else {
        // Load from database for authenticated users
        const response = await fetch(`/api/gallery/collection?userId=${user.id}`);
        const result = await response.json();
        
        if (result.success && result.items) {
          setSavedArtworks(result.items);
        }
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      toast.error('컬렉션을 불러오는데 실패했습니다');
    }
  };

  // Generate mock artworks for guest users based on saved IDs
  const generateMockArtworks = (savedIds: string[]): CollectionArtwork[] => {
    // This would ideally fetch real artwork data, but for now return mock data
    return savedIds.map((id, index) => ({
      id,
      title: `Beautiful Artwork ${index + 1}`,
      artist: `Artist ${index + 1}`,
      year: `${2020 + index}`,
      imageUrl: `/images/artworks/placeholder-${(index % 5) + 1}.jpg`,
      museum: 'SAYU Curated Collection',
      medium: 'Oil on canvas',
      matchPercent: 95 - (index * 3),
      curatorNote: `SREF 유형에 특별히 선별된 작품입니다.`
    }));
  };

  const handleArtworkClick = (artwork: CollectionArtwork) => {
    if (isGuest) {
      trackInteraction('artwork_click', { artworkId: artwork.id });
      setInteractionCount(prev => prev + 1);
      
      // Show limited preview for guests
      if (interactionCount >= 2) {
        setShowPrompt(true);
        toast('로그인하면 작품을 자세히 볼 수 있습니다', {
          icon: '🔒',
          duration: 4000
        });
        return;
      }
    }
    
    // Show full artwork detail
    console.log('Show artwork detail:', artwork);
  };

  const handleSignupClick = () => {
    // Migrate guest data to the signup process
    router.push('/register?source=collection');
  };

  const handleLoginClick = () => {
    router.push('/login?source=collection');
  };

  // Guest limited view - show only first 3-5 items
  const displayArtworks = isGuest 
    ? savedArtworks.slice(0, Math.min(5, savedArtworks.length))
    : savedArtworks;

  const hiddenCount = isGuest && savedArtworks.length > 5 
    ? savedArtworks.length - 5 
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Bookmark className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-slate-300">컬렉션을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 sticky top-0 z-20 bg-slate-900/95 backdrop-blur-sm">
        <div className={cn("mx-auto", isMobile ? "px-4 py-3" : "max-w-7xl px-6 py-4")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-xl text-white flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-purple-400" />
                  내 컬렉션
                  {isGuest && (
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      Guest Preview
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-slate-400">
                  {isGuest 
                    ? `${savedArtworks.length}개 작품 미리보기 (일부만 표시)`
                    : `총 ${savedArtworks.length}개의 저장된 작품`
                  }
                </p>
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              {!isGuest && (
                <div className="flex bg-slate-800 rounded-lg p-1">
                  <Button
                    variant={viewStyle === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewStyle('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewStyle === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewStyle('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {savedArtworks.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <Bookmark className="w-16 h-16 mx-auto mb-6 text-slate-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              아직 저장된 작품이 없습니다
            </h3>
            <p className="text-slate-400 mb-6">
              {isGuest 
                ? '갤러리에서 마음에 드는 작품을 저장해보세요!'
                : '갤러리에서 작품을 탐색하고 컬렉션을 만들어보세요.'
              }
            </p>
            <Button onClick={() => router.push('/gallery')} className="bg-purple-600 hover:bg-purple-700">
              갤러리 둘러보기
            </Button>
          </div>
        ) : (
          <>
            {/* Guest limitation banner */}
            {isGuest && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h3 className="font-semibold text-white">
                        게스트 미리보기 모드
                      </h3>
                      <p className="text-sm text-slate-300">
                        {hiddenCount > 0 
                          ? `${hiddenCount}개의 추가 작품이 있습니다. 로그인하여 전체 컬렉션을 확인하세요.`
                          : '로그인하여 무제한 컬렉션과 개인화된 추천을 받아보세요.'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleLoginClick} variant="outline" className="border-slate-600">
                      로그인
                    </Button>
                    <Button size="sm" onClick={handleSignupClick} className="bg-purple-600 hover:bg-purple-700">
                      무료 가입
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Collection Grid */}
            <div className={cn(
              "grid gap-4",
              viewStyle === 'grid' 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
                : "grid-cols-1 lg:grid-cols-2"
            )}>
              {displayArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "group cursor-pointer",
                    isGuest && index >= 3 && "opacity-60" // Fade later items for guests
                  )}
                  onClick={() => handleArtworkClick(artwork)}
                >
                  <div className="relative overflow-hidden rounded-xl bg-slate-800 hover:bg-slate-750 transition-all duration-300 border border-slate-700 hover:border-purple-500">
                    {viewStyle === 'grid' ? (
                      // Grid View
                      <>
                        <div className="aspect-square bg-slate-700 relative overflow-hidden">
                          <img 
                            src={artwork.imageUrl} 
                            alt={artwork.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-artwork.jpg';
                            }}
                          />
                          
                          {/* Guest overlay for limited items */}
                          {isGuest && index >= 3 && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                              <div className="text-center">
                                <Lock className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                                <p className="text-xs text-white font-medium">로그인 필요</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1">
                            {artwork.title}
                          </h3>
                          <p className="text-slate-400 text-xs">{artwork.artist}</p>
                          <p className="text-slate-500 text-xs">{artwork.year}</p>
                          
                          {artwork.matchPercent && (
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300">
                                {artwork.matchPercent}% 매치
                              </Badge>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // List View
                      <div className="flex gap-4 p-4">
                        <div className="w-20 h-20 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={artwork.imageUrl} 
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white line-clamp-1 mb-1">
                            {artwork.title}
                          </h3>
                          <p className="text-slate-400 text-sm">{artwork.artist} · {artwork.year}</p>
                          <p className="text-slate-500 text-xs mt-1">{artwork.museum}</p>
                          {artwork.curatorNote && (
                            <p className="text-slate-400 text-xs mt-2 line-clamp-2 italic">
                              "{artwork.curatorNote}"
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          {artwork.matchPercent && (
                            <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300">
                              {artwork.matchPercent}%
                            </Badge>
                          )}
                          <div className="flex gap-1 mt-2">
                            <Heart className="w-4 h-4 text-slate-600" />
                            <Eye className="w-4 h-4 text-slate-600" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* Show placeholder locked items for guests */}
              {isGuest && hiddenCount > 0 && (
                <div className="col-span-full">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-40">
                    {Array.from({ length: Math.min(hiddenCount, 8) }).map((_, index) => (
                      <div key={`locked-${index}`} className="bg-slate-800 rounded-xl border border-slate-700">
                        <div className="aspect-square bg-slate-700 rounded-t-xl flex items-center justify-center">
                          <Lock className="w-8 h-8 text-slate-600" />
                        </div>
                        <div className="p-4">
                          <div className="h-4 bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-center mt-6 p-6 bg-slate-800/50 rounded-xl">
                    <UserPlus className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {hiddenCount}개의 추가 작품이 기다리고 있습니다
                    </h3>
                    <p className="text-slate-400 mb-4">
                      무료 계정을 만들어 전체 컬렉션을 확인하고 개인화된 추천을 받아보세요.
                    </p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={handleSignupClick} className="bg-purple-600 hover:bg-purple-700">
                        <UserPlus className="w-4 h-4 mr-2" />
                        무료 가입하기
                      </Button>
                      <Button onClick={handleLoginClick} variant="outline" className="border-slate-600">
                        로그인
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Progressive Signup Prompt */}
      <AnimatePresence>
        {showPrompt && isGuest && (
          <ProgressiveSignupPrompt
            trigger="collection_engagement"
            onSignup={handleSignupClick}
            onDismiss={() => setShowPrompt(false)}
            customMessage={
              savedArtworks.length >= 3
                ? "3개 이상의 작품을 저장하셨네요! 이제 무료 계정을 만들어 컬렉션을 안전하게 보관하세요."
                : "작품에 관심이 많으시네요! 계정을 만들면 개인화된 추천을 받을 수 있습니다."
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Bookmark className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-400" />
          <p className="text-slate-300">컬렉션 로딩 중...</p>
        </div>
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
}