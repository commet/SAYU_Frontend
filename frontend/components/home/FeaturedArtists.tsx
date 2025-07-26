'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/api-client';
import { ChevronRight, Users, Heart } from 'lucide-react';
import { PublicDomainArtist, LicensedArtist, ContemporaryArtist, VerifiedArtist } from '@/types/artist';
import { BackendArtist, adaptArtistsFromBackend } from '@/lib/artist-adapter';

type Artist = PublicDomainArtist | LicensedArtist | ContemporaryArtist | VerifiedArtist;

interface FeaturedArtistsProps {
  limit?: number;
}

export function FeaturedArtists({ limit = 4 }: FeaturedArtistsProps) {
  const { language } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedArtists();
  }, []);

  const fetchFeaturedArtists = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ artists: BackendArtist[] }>('/api/artists/featured', {
        params: { limit }
      });
      const adaptedArtists = adaptArtistsFromBackend(response.artists);
      setArtists(adaptedArtists);
    } catch (err) {
      console.error('Failed to fetch featured artists:', err);
      setError('Failed to load artists');
      // Fallback to static data if API fails
      setArtists(getFallbackArtists());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackArtists = (): Artist[] => {
    return [
      {
        id: '1',
        name: { en: 'Vincent van Gogh', ko: '빈센트 반 고흐' },
        nationality: 'Dutch',
        birthYear: 1853,
        deathYear: 1890,
        bio: { 
          en: 'Post-Impressionist painter known for his expressive use of color',
          ko: '표현주의적 색채 사용으로 유명한 후기 인상파 화가'
        },
        copyrightStatus: 'public_domain',
        images: {
          profile: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&q=80'
        },
        workCount: 864,
        followCount: 1250
      },
      {
        id: '2',
        name: { en: 'Georgia O\'Keeffe', ko: '조지아 오키프' },
        nationality: 'American',
        birthYear: 1887,
        deathYear: 1986,
        bio: {
          en: 'American modernist artist known for paintings of enlarged flowers',
          ko: '확대된 꽃 그림으로 유명한 미국의 모더니즘 예술가'
        },
        copyrightStatus: 'licensed',
        images: {
          profile: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=400&fit=crop&q=80'
        },
        workCount: 342,
        followCount: 890,
        licenseInfo: {
          holder: "Georgia O'Keeffe Museum",
          contact: "rights@okeeffemuseum.org"
        }
      }
    ] as Artist[];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64" />
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {language === 'ko' ? '추천 작가' : 'Featured Artists'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {language === 'ko' 
              ? '당신의 취향에 맞는 작가들을 만나보세요'
              : 'Discover artists that match your taste'}
          </p>
        </div>
        <Link
          href="/artists"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          {language === 'ko' ? '모든 작가 보기' : 'View all artists'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {artists.map((artist, index) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/artists/${artist.id}`}>
              <div className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg mb-4 h-64">
                  <Image
                    src={artist.images.profile || artist.images.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name.en)}&size=400&background=random`}
                    alt={artist.name[language] || artist.name.en}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* 저작권 상태 배지 */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      artist.copyrightStatus === 'public_domain' 
                        ? 'bg-green-500/90 text-white'
                        : artist.copyrightStatus === 'verified_artist'
                        ? 'bg-blue-500/90 text-white'
                        : 'bg-gray-500/90 text-white'
                    }`}>
                      {artist.copyrightStatus === 'public_domain' && 'Public Domain'}
                      {artist.copyrightStatus === 'licensed' && 'Licensed'}
                      {artist.copyrightStatus === 'contemporary' && 'Contemporary'}
                      {artist.copyrightStatus === 'verified_artist' && 'Verified'}
                    </span>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                  {artist.name[language] || artist.name.en}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {artist.bio?.[language] || artist.bio?.en || `${artist.nationality} (${artist.birthYear}-${artist.deathYear || 'present'})`}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {artist.followCount || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {artist.workCount || 0} works
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {error && artists.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {language === 'ko' ? '작가를 불러올 수 없습니다' : 'Failed to load artists'}
        </div>
      )}
    </section>
  );
}