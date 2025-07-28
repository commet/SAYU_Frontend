'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Artist, CopyrightStatus } from '../../../shared';
import { ArtistCard } from './ArtistCard';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface ArtistsGridProps {
  artists: Artist[];
  onFollow?: (artistId: string) => void;
  onUnfollow?: (artistId: string) => void;
  isLoading?: boolean;
  title?: string;
  showFilters?: boolean;
}

export function ArtistsGrid({ 
  artists, 
  onFollow, 
  onUnfollow, 
  isLoading = false,
  title,
  showFilters = true
}: ArtistsGridProps) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<CopyrightStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const statusLabels = {
    all: language === 'ko' ? '전체' : 'All',
    public_domain: language === 'ko' ? '퍼블릭 도메인' : 'Public Domain',
    licensed: language === 'ko' ? '라이선스' : 'Licensed',
    contemporary: language === 'ko' ? '현대 작가' : 'Contemporary',
    verified_artist: language === 'ko' ? '인증 작가' : 'Verified Artist'
  };

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = searchTerm === '' || 
      artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.nameKo && artist.nameKo.includes(searchTerm)) ||
      artist.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (artist.nationalityKo && artist.nationalityKo.includes(searchTerm));
    
    const matchesStatus = selectedStatus === 'all' || artist.copyrightStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {title && (
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400">
            {language === 'ko' 
              ? `${filteredArtists.length}명의 작가`
              : `${filteredArtists.length} artist${filteredArtists.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
      )}

      {/* Search and Filters */}
      {showFilters && (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'ko' ? '작가 이름 또는 국가로 검색...' : 'Search by artist name or nationality...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CopyrightStatus | 'all')}
                className="bg-gray-700 border border-gray-600 rounded-lg text-white px-3 py-2 focus:outline-none focus:border-purple-500 transition-colors"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Artists Grid/List */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">
              {language === 'ko' ? '검색 결과가 없습니다' : 'No artists found'}
            </p>
            <p className="text-sm">
              {language === 'ko' ? '다른 검색어나 필터를 시도해보세요' : 'Try different search terms or filters'}
            </p>
          </div>
          {(searchTerm || selectedStatus !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
              }}
            >
              {language === 'ko' ? '필터 초기화' : 'Clear Filters'}
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredArtists.map((artist) => (
            <motion.div key={artist.id} variants={itemVariants}>
              <ArtistCard
                artist={artist}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
                isLoading={isLoading}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Load More (if needed) */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center text-gray-400">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mr-3"></div>
            {language === 'ko' ? '로딩 중...' : 'Loading...'}
          </div>
        </div>
      )}
    </div>
  );
}