'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Artist } from '@sayu/shared';
import { ArtistsGrid } from '@/components/artists/ArtistsGrid';
import { useLanguage } from '@/contexts/LanguageContext';
import { useArtistFollow } from '@/hooks/useArtistFollow';
import { Palette, Shield, Heart, Link as LinkIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/ui/Footer';
import { artistsApi } from '@/lib/artists-api';

export default function ArtistsPage() {
  const { language } = useLanguage();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalArtists: number;
    byStatus: Record<string, number>;
    byNationality: Record<string, number>;
    byEra: Record<string, number>;
  } | null>(null);
  const { followArtist, unfollowArtist, isFollowing, isLoading: followLoading } = useArtistFollow();

  // Load artists and stats data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load artists and stats in parallel
        const [artistsResponse, statsResponse] = await Promise.all([
          artistsApi.getArtists({ limit: 50, sortBy: 'follow_count', sortOrder: 'desc' }),
          artistsApi.getArtistStats()
        ]);
        
        setArtists(artistsResponse.artists);
        setStats(statsResponse);
      } catch (err) {
        console.error('Failed to load artists:', err);
        setError(err instanceof Error ? err.message : 'Failed to load artists');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Update artists with current follow status
  useEffect(() => {
    setArtists(prev => prev.map(artist => ({
      ...artist,
      isFollowing: isFollowing(artist.id)
    })));
  }, [isFollowing]);

  const handleFollow = async (artistId: string) => {
    try {
      await artistsApi.followArtist(artistId);
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
      await artistsApi.unfollowArtist(artistId);
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-500" />
          <p className="text-xl">{language === 'ko' ? '작가 정보를 불러오는 중...' : 'Loading artists...'}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {language === 'ko' ? '오류가 발생했습니다' : 'Error occurred'}
          </h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
          >
            {language === 'ko' ? '다시 시도' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

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
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                label: language === 'ko' ? '퍼블릭 도메인' : 'Public Domain',
                value: stats.byStatus.public_domain || 0,
                icon: Palette,
                color: 'text-green-400'
              },
              {
                label: language === 'ko' ? '라이선스' : 'Licensed',
                value: stats.byStatus.licensed || 0,
                icon: Shield,
                color: 'text-yellow-400'
              },
              {
                label: language === 'ko' ? '현대 작가' : 'Contemporary',
                value: stats.byStatus.contemporary || 0,
                icon: LinkIcon,
                color: 'text-blue-400'
              },
              {
                label: language === 'ko' ? '인증 작가' : 'Verified',
                value: stats.byStatus.verified_artist || 0,
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
        )}

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