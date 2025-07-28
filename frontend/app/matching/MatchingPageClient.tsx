'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressiveRevealProfile } from '@/components/privacy/ProgressiveRevealProfile';
import { ArtworkInteractionPrompts } from '@/components/matching/ArtworkInteractionPrompts';
import { ExhibitionCompanionMatch } from '@/components/matching/ExhibitionCompanionMatch';
import { APTCompatibilityVisualization } from '@/components/matching/APTCompatibilityVisualization';
import { SharedCollectionCreator } from '@/components/collection/SharedCollectionCreator';
import { SharedCollectionViewer } from '@/components/collection/SharedCollectionViewer';
import { ExhibitionCheckIn } from '@/components/safety/ExhibitionCheckIn';
import { useUser } from '@supabase/auth-helpers-react';
import { useExhibitionMatches, useArtworkInteractions, useSharedCollections, usePrivacyLevel } from '@/hooks/useMatchingSystem';
import { 
  Heart,
  Users,
  Calendar,
  Palette,
  Images,
  Shield,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 실제 미술관 API에서 가져온 작품 데이터 (예시)
const artworks = [
  {
    id: 'met-436535',
    title: 'Wheat Field with Cypresses',
    artist: 'Vincent van Gogh',
    image: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/436535/1671316/main-image',
    year: '1889',
    tags: ['Post-Impressionism', 'Landscape']
  },
  {
    id: 'met-438821',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    image: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/45434/134438/main-image',
    year: '1831',
    tags: ['Japanese', 'Ukiyo-e']
  },
  {
    id: 'met-437329',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    image: 'https://collectionapi.metmuseum.org/api/collection/v1/iiif/437329/796067/main-image',
    year: '1665',
    tags: ['Dutch Golden Age', 'Portrait']
  }
];

export default function MatchingPageClient() {
  const user = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedArtwork, setSelectedArtwork] = useState(artworks[0]);
  
  // Custom hooks for data fetching
  const { matches, createMatch, applyToMatch } = useExhibitionMatches();
  const { interactions, sendInteraction } = useArtworkInteractions(selectedArtwork.id);
  const { collections, createCollection } = useSharedCollections();
  const { updatePrivacyLevel } = usePrivacyLevel();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-xl font-semibold mb-2">로그인이 필요합니다</h2>
          <p className="text-muted-foreground mb-4">매칭 시스템을 이용하려면 먼저 로그인해주세요.</p>
          <Button onClick={() => window.location.href = '/auth/login'}>
            로그인하기
          </Button>
        </Card>
      </div>
    );
  }

  // 사용자 프로필 정보 (실제로는 user_profiles 테이블에서 가져옴)
  const userProfile = {
    id: user.id,
    name: user.user_metadata?.name || '아트 러버',
    aptType: user.user_metadata?.personality_type || 'LAEF',
    photo: user.user_metadata?.avatar_url
  };

  // 실제 전시 정보 (exhibitions 테이블에서 가져옴)
  const currentExhibition = {
    id: 'ex-2025-01',
    title: '모네와 인상주의: 빛의 순간들',
    venue: '국립현대미술관 서울',
    address: '서울특별시 종로구 삼청로 30',
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-03-30'),
    image: '/images/exhibitions/monet-2025.jpg',
    tags: ['인상주의', '모네', '르누아르', '드가']
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto py-8 px-4">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 flex items-center justify-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            예술로 만나는 인연
          </h1>
          <p className="text-muted-foreground">
            당신의 {userProfile.aptType} 성향과 어울리는 특별한 만남을 찾아보세요
          </p>
        </motion.div>

        {/* 탭 네비게이션 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-5 gap-2 h-auto">
            <TabsTrigger value="profile" className="gap-2">
              <Shield className="w-4 h-4" />
              프로필
            </TabsTrigger>
            <TabsTrigger value="artwork" className="gap-2">
              <Palette className="w-4 h-4" />
              작품 대화
            </TabsTrigger>
            <TabsTrigger value="exhibition" className="gap-2">
              <Calendar className="w-4 h-4" />
              전시 동행
            </TabsTrigger>
            <TabsTrigger value="collection" className="gap-2">
              <Images className="w-4 h-4" />
              컬렉션
            </TabsTrigger>
            <TabsTrigger value="compatibility" className="gap-2">
              <Sparkles className="w-4 h-4" />
              호환성
            </TabsTrigger>
          </TabsList>

          {/* 프로필 탭 */}
          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto">
              <ProgressiveRevealProfile
                userId={userProfile.id}
                aptType={userProfile.aptType as any}
                userName={userProfile.name}
                userPhoto={userProfile.photo}
                onPrivacyLevelChange={(level) => {
                  updatePrivacyLevel(level, []);
                }}
              />
            </div>
          </TabsContent>

          {/* 작품 대화 탭 */}
          <TabsContent value="artwork">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* 작품 선택 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">작품 선택</h3>
                <div className="grid grid-cols-2 gap-4">
                  {artworks.map((artwork) => (
                    <Card
                      key={artwork.id}
                      className={`cursor-pointer transition-all ${
                        selectedArtwork.id === artwork.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedArtwork(artwork)}
                    >
                      <img
                        src={artwork.image}
                        alt={artwork.title}
                        className="w-full h-40 object-cover rounded-t-lg"
                      />
                      <div className="p-3">
                        <p className="font-medium text-sm">{artwork.title}</p>
                        <p className="text-xs text-muted-foreground">{artwork.artist}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* 상호작용 프롬프트 */}
              <div>
                <ArtworkInteractionPrompts
                  artwork={selectedArtwork}
                  userProfile={userProfile}
                  onSendInteraction={sendInteraction}
                />
                
                {/* 최근 상호작용 표시 */}
                {interactions.length > 0 && (
                  <Card className="mt-4 p-4">
                    <h4 className="font-medium mb-3">최근 대화</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {interactions.slice(-3).map((interaction) => (
                        <div key={interaction.id} className="p-2 bg-secondary/20 rounded">
                          <p className="text-sm font-medium">{interaction.prompt}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {interaction.response}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* 전시 동행 탭 */}
          <TabsContent value="exhibition">
            <div className="max-w-3xl mx-auto space-y-6">
              <ExhibitionCompanionMatch
                userAptType={userProfile.aptType as any}
                userId={userProfile.id}
                exhibition={currentExhibition}
                onCreateMatch={createMatch}
                existingMatches={matches}
              />
              
              {/* 활성 매칭이 있을 경우 체크인 표시 */}
              {matches.find(m => m.status === 'matched' && m.host_user_id === userProfile.id) && (
                <ExhibitionCheckIn
                  exhibitionMatchId={matches[0].id}
                  userId={userProfile.id}
                  venue={{
                    id: 'venue1',
                    name: currentExhibition.venue,
                    address: currentExhibition.address,
                    safetyRating: 5,
                    nearbyLandmarks: ['삼청동 카페거리', '경복궁역 3번 출구']
                  }}
                  scheduledTime={new Date(matches[0].preferred_date)}
                  matchedUser={matches[0].matched_user_id ? {
                    id: matches[0].matched_user_id,
                    name: matches[0].matched?.raw_user_meta_data?.name || '매칭 상대'
                  } : undefined}
                  onCheckIn={(data) => console.log('Check-in:', data)}
                />
              )}
            </div>
          </TabsContent>

          {/* 컬렉션 탭 */}
          <TabsContent value="collection">
            <div className="space-y-6">
              {/* 새 컬렉션 만들기 */}
              <SharedCollectionCreator
                userId={userProfile.id}
                userAptType={userProfile.aptType as any}
                suggestedArtworks={artworks}
                onCreateCollection={createCollection}
              />
              
              {/* 내 컬렉션 목록 */}
              {collections.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">내 컬렉션</h3>
                  <div className="grid gap-4">
                    {collections.map((collection) => (
                      <SharedCollectionViewer
                        key={collection.id}
                        collection={{
                          ...collection,
                          creator: {
                            id: collection.creator_id,
                            name: collection.creator?.raw_user_meta_data?.name || '익명',
                            aptType: collection.creator?.raw_user_meta_data?.personality_type || 'LAEF'
                          },
                          artworks: collection.artworks || []
                        }}
                        currentUserId={userProfile.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* 호환성 탭 */}
          <TabsContent value="compatibility">
            <div className="max-w-3xl mx-auto">
              {matches.length > 0 && matches[0].matched_user_id ? (
                <APTCompatibilityVisualization
                  user1={{
                    aptType: userProfile.aptType as any,
                    name: userProfile.name
                  }}
                  user2={{
                    aptType: matches[0].matched?.raw_user_meta_data?.personality_type || 'SRMC',
                    name: matches[0].matched?.raw_user_meta_data?.name || '매칭 상대'
                  }}
                />
              ) : (
                <Card className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    매칭된 사용자가 있으면 호환성을 확인할 수 있습니다.
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}