'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Artist } from '@/types/artist';
import { ArtistsGrid } from '@/components/artists/ArtistsGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArtistFollow } from '@/hooks/useArtistFollow';
import { Palette, Shield, Heart, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/ui/Footer';

// Mock data for demonstration - would come from API in real implementation
const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Vincent van Gogh',
    nameKo: '빈센트 반 고흐',
    birthYear: 1853,
    deathYear: 1890,
    nationality: 'Dutch',
    nationalityKo: '네덜란드',
    bio: 'Post-impressionist painter known for his expressive use of color and emotional honesty.',
    bioKo: '색채의 표현적 사용과 감정적 진솔함으로 유명한 후기 인상주의 화가.',
    copyrightStatus: 'public_domain',
    followCount: 15420,
    isFollowing: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    images: {
      portrait: '/images/artists/van-gogh-portrait.jpg',
      works: []
    },
    sources: {
      wikidata: 'Q5582',
      wikimedia: 'Category:Vincent van Gogh'
    }
  } as any,
  {
    id: '2',
    name: 'Georgia O\'Keeffe',
    nameKo: '조지아 오키프',
    birthYear: 1887,
    deathYear: 1986,
    nationality: 'American',
    nationalityKo: '미국',
    bio: 'American modernist artist known for her paintings of enlarged flowers and New Mexican landscapes.',
    bioKo: '확대된 꽃과 뉴멕시코 풍경 그림으로 유명한 미국의 모더니스트 화가.',
    copyrightStatus: 'licensed',
    followCount: 8930,
    isFollowing: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    licenseInfo: {
      licenseType: 'Estate License',
      licenseHolder: 'Georgia O\'Keeffe Museum',
      usageRights: ['Educational Use', 'Museum Display']
    },
    images: {
      portrait: '/images/artists/okeefe-portrait.jpg',
      thumbnails: []
    },
    purchaseLinks: {
      website: 'https://www.okeeffemuseum.org/'
    }
  } as any,
  {
    id: '3',
    name: 'Yayoi Kusama',
    nameKo: '쿠사마 야요이',
    birthYear: 1929,
    nationality: 'Japanese',
    nationalityKo: '일본',
    bio: 'Contemporary artist known for her polka dot infinity rooms and pumpkin sculptures.',
    bioKo: '물방울무늬 인피니티 룸과 호박 조각으로 유명한 현대 작가.',
    copyrightStatus: 'contemporary',
    followCount: 24680,
    isFollowing: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    officialLinks: {
      instagram: 'https://www.instagram.com/yayoikusama_official/',
      website: 'https://yayoikusama.jp/'
    },
    representation: {
      gallery: 'David Zwirner Gallery',
      gallerySite: 'https://www.davidzwirner.com/artists/yayoi-kusama'
    },
    recentExhibitions: [
      {
        title: 'Cosmic Nature',
        venue: 'New York Botanical Garden',
        year: 2024,
        city: 'New York'
      }
    ],
    mediaLinks: {
      interviews: [],
      articles: [],
      reviews: []
    }
  } as any,
  {
    id: '4',
    name: 'Kaws',
    nameKo: '카우스',
    birthYear: 1974,
    nationality: 'American',
    nationalityKo: '미국',
    bio: 'Contemporary artist and designer known for his cartoon-inspired characters and sculptures.',
    bioKo: '만화에서 영감을 받은 캐릭터와 조각으로 유명한 현대 작가이자 디자이너.',
    copyrightStatus: 'verified_artist',
    followCount: 19250,
    isFollowing: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    isVerified: true,
    verificationDate: new Date(),
    verificationMethod: 'email',
    artistManaged: {
      profileImage: '/images/artists/kaws-profile.jpg',
      allowedWorks: [],
      socialLinks: {
        instagram: '@kaws',
        twitter: '@kaws'
      }
    },
    permissions: {
      canShareImages: true,
      allowCommercialUse: false,
      allowDerivativeWorks: false
    }
  } as any
];

export default function ArtistsPage() {
  const { language } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>(mockArtists);
  const { followArtist, unfollowArtist, isFollowing, isLoading: followLoading } = useArtistFollow();

  // Update artists with current follow status
  useEffect(() => {
    setArtists(prev => prev.map(artist => ({
      ...artist,
      isFollowing: isFollowing(artist.id)
    })));
  }, [isFollowing]);

  const handleFollow = async (artistId: string) => {
    try {
      await followArtist(artistId);
      // Update local state optimistically
      setArtists(prev => prev.map(artist => 
        artist.id === artistId 
          ? { ...artist, isFollowing: true, followCount: artist.followCount + 1 }
          : artist
      ));
    } catch (error) {
      console.error('Failed to follow artist:', error);
    }
  };

  const handleUnfollow = async (artistId: string) => {
    try {
      await unfollowArtist(artistId);
      // Update local state optimistically
      setArtists(prev => prev.map(artist => 
        artist.id === artistId 
          ? { ...artist, isFollowing: false, followCount: Math.max(0, artist.followCount - 1) }
          : artist
      ));
    } catch (error) {
      console.error('Failed to unfollow artist:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6">
            <Palette className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {language === 'ko' ? '작가 발견하기' : 'Discover Artists'}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {language === 'ko' 
              ? '다양한 시대와 장르의 작가들을 만나보세요. 저작권을 존중하며 예술을 공유합니다.'
              : 'Explore artists from different eras and genres. We share art while respecting copyright.'
            }
          </p>
        </motion.div>

        {/* Copyright Policy Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-purple-900/20 border border-purple-700 rounded-lg p-4 mb-8"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">
                {language === 'ko' ? '저작권 보호 정책' : 'Copyright Protection Policy'}
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                {language === 'ko' 
                  ? 'SAYU는 모든 작가의 저작권을 존중합니다. 퍼블릭 도메인 작품은 자유롭게, 라이선스 작품은 제한적으로, 현대 작가 작품은 링크와 정보만 제공합니다.'
                  : 'SAYU respects all artists\' copyrights. Public domain works are freely available, licensed works are limited, and contemporary artists are shown with links and information only.'
                }
              </p>
              <Link 
                href="/copyright-policy" 
                className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                {language === 'ko' ? '자세한 정책 보기' : 'View Full Policy'}
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: language === 'ko' ? '퍼블릭 도메인' : 'Public Domain',
              value: artists.filter(a => a.copyrightStatus === 'public_domain').length,
              icon: Palette,
              color: 'text-green-400'
            },
            {
              label: language === 'ko' ? '라이선스' : 'Licensed',
              value: artists.filter(a => a.copyrightStatus === 'licensed').length,
              icon: Shield,
              color: 'text-yellow-400'
            },
            {
              label: language === 'ko' ? '현대 작가' : 'Contemporary',
              value: artists.filter(a => a.copyrightStatus === 'contemporary').length,
              icon: LinkIcon,
              color: 'text-blue-400'
            },
            {
              label: language === 'ko' ? '인증 작가' : 'Verified',
              value: artists.filter(a => a.copyrightStatus === 'verified_artist').length,
              icon: Heart,
              color: 'text-purple-400'
            }
          ].map((stat, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Artists Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ArtistsGrid
            artists={artists}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            isLoading={followLoading}
            title={language === 'ko' ? '모든 작가' : 'All Artists'}
            showFilters={true}
          />
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}