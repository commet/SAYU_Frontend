'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, MapPin, Calendar, Palette, User } from 'lucide-react';
import Image from 'next/image';

interface Artwork {
  id: string;
  title: string;
  artist_display_name: string;
  creation_date: string;
  medium: string;
  culture: string;
  department: string;
  primary_image_url: string;
  museum_name: string;
  museum_short_name: string;
  is_highlight: boolean;
  is_public_domain: boolean;
}

interface SearchFilters {
  query: string;
  artist: string;
  medium: string;
  culture: string;
  department: string;
  period: string;
  hasImage: boolean;
  isPublicDomain?: boolean;
}

export function MuseumSearch() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    artist: '',
    medium: '',
    culture: '',
    department: '',
    period: '',
    hasImage: true,
    isPublicDomain: undefined
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const searchArtworks = useCallback(async (reset = false) => {
    setLoading(true);
    
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
          if (key === 'query') {
            searchParams.append('q', value as string);
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
      
      searchParams.append('limit', '20');
      searchParams.append('offset', reset ? '0' : offset.toString());

      const response = await fetch(`/api/museums/search?${searchParams}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setArtworks(data.artworks);
          setOffset(20);
        } else {
          setArtworks(prev => [...prev, ...data.artworks]);
          setOffset(prev => prev + 20);
        }
        
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, offset]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchArtworks(true);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [filters]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setOffset(0);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      artist: '',
      medium: '',
      culture: '',
      department: '',
      period: '',
      hasImage: true,
      isPublicDomain: undefined
    });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchArtworks(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Main Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
              placeholder="Search artworks, artists, or museums..."
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                showFilters
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="flex bg-gray-800 rounded-lg border border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-r-lg transition-colors ${
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

        {/* Advanced Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-gray-700"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
              <input
                type="text"
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
                placeholder="Artist name..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Medium</label>
              <input
                type="text"
                value={filters.medium}
                onChange={(e) => handleFilterChange('medium', e.target.value)}
                placeholder="Oil on canvas..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Culture</label>
              <input
                type="text"
                value={filters.culture}
                onChange={(e) => handleFilterChange('culture', e.target.value)}
                placeholder="American, European..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <input
                type="text"
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                placeholder="Paintings, Sculptures..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Period</label>
              <input
                type="text"
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                placeholder="Renaissance, Modern..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Public Domain</label>
              <select
                value={filters.isPublicDomain?.toString() || ''}
                onChange={(e) => handleFilterChange('isPublicDomain', 
                  e.target.value === '' ? undefined : e.target.value === 'true'
                )}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">Any</option>
                <option value="true">Public Domain</option>
                <option value="false">Rights Reserved</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.hasImage}
                  onChange={(e) => handleFilterChange('hasImage', e.target.checked)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                Has Image
              </label>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {artworks.length} artworks found
          </h2>
          {loading && (
            <div className="text-sm text-gray-400">Searching...</div>
          )}
        </div>

        {/* Artworks Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 overflow-hidden hover:border-purple-500/30 transition-all duration-300 group cursor-pointer"
              >
                {/* Image */}
                <div className="aspect-square relative overflow-hidden">
                  {artwork.primary_image_url ? (
                    <Image
                      src={artwork.primary_image_url}
                      alt={artwork.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Palette className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {artwork.is_highlight && (
                      <span className="px-2 py-1 bg-yellow-500/80 text-yellow-900 text-xs font-medium rounded-full">
                        Highlight
                      </span>
                    )}
                    {artwork.is_public_domain && (
                      <span className="px-2 py-1 bg-green-500/80 text-green-900 text-xs font-medium rounded-full">
                        Public Domain
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-purple-400 transition-colors">
                    {artwork.title}
                  </h3>
                  
                  {artwork.artist_display_name && (
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {artwork.artist_display_name}
                    </p>
                  )}
                  
                  <div className="space-y-1 text-xs text-gray-500">
                    {artwork.creation_date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {artwork.creation_date}
                      </div>
                    )}
                    
                    {artwork.museum_short_name && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {artwork.museum_short_name}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 p-6 hover:border-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="w-24 h-24 relative flex-shrink-0 rounded-lg overflow-hidden">
                    {artwork.primary_image_url ? (
                      <Image
                        src={artwork.primary_image_url}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Palette className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white text-lg line-clamp-1 hover:text-purple-400 transition-colors">
                        {artwork.title}
                      </h3>
                      
                      <div className="flex gap-1 ml-4">
                        {artwork.is_highlight && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                            Highlight
                          </span>
                        )}
                        {artwork.is_public_domain && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                            Public Domain
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        {artwork.artist_display_name && (
                          <p className="text-gray-300 mb-1">
                            <span className="text-gray-500">Artist:</span> {artwork.artist_display_name}
                          </p>
                        )}
                        {artwork.creation_date && (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Date:</span> {artwork.creation_date}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        {artwork.medium && (
                          <p className="text-gray-300 mb-1">
                            <span className="text-gray-500">Medium:</span> {artwork.medium.length > 40 ? `${artwork.medium.slice(0, 40)}...` : artwork.medium}
                          </p>
                        )}
                        {artwork.culture && (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Culture:</span> {artwork.culture}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        {artwork.museum_name && (
                          <p className="text-gray-300 mb-1">
                            <span className="text-gray-500">Museum:</span> {artwork.museum_name}
                          </p>
                        )}
                        {artwork.department && (
                          <p className="text-gray-400">
                            <span className="text-gray-500">Department:</span> {artwork.department}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loading && artworks.length > 0 && (
          <div className="text-center pt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Load More Artworks
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && artworks.length === 0 && (
          <div className="text-center py-12">
            <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No artworks found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}