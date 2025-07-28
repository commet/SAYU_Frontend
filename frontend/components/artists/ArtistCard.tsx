'use client';

import { useState, memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Calendar, MapPin, Palette } from 'lucide-react';
import { Artist, ArtistColorPalette } from '../../../shared';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface ArtistCardProps {
  artist: Artist;
  colorPalette?: ArtistColorPalette;
  onFollow?: (artistId: string) => void;
  onUnfollow?: (artistId: string) => void;
  isLoading?: boolean;
}

export const ArtistCard = memo(function ArtistCard({ 
  artist, 
  colorPalette, 
  onFollow, 
  onUnfollow, 
  isLoading = false 
}: ArtistCardProps) {
  const { language } = useLanguage();
  const [isFollowing, setIsFollowing] = useState(artist.isFollowing || false);

  const handleFollowClick = useCallback(async () => {
    if (isFollowing) {
      onUnfollow?.(artist.id);
      setIsFollowing(false);
    } else {
      onFollow?.(artist.id);
      setIsFollowing(true);
    }
  }, [isFollowing, onFollow, onUnfollow, artist.id]);

  const displayName = language === 'ko' && artist.nameKo ? artist.nameKo : artist.name;
  const displayBio = language === 'ko' && artist.bioKo ? artist.bioKo : artist.bio;
  const displayNationality = language === 'ko' && artist.nationalityKo ? artist.nationalityKo : artist.nationality;

  const getLifespan = () => {
    if (artist.birthYear) {
      const death = artist.deathYear ? ` - ${artist.deathYear}` : '';
      return `${artist.birthYear}${death}`;
    }
    return null;
  };

  const getCopyrightBadge = () => {
    const badges = {
      public_domain: {
        text: language === 'ko' ? '퍼블릭 도메인' : 'Public Domain',
        className: 'bg-green-500/20 text-green-400 border-green-500'
      },
      licensed: {
        text: language === 'ko' ? '라이선스' : 'Licensed',
        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500'
      },
      contemporary: {
        text: language === 'ko' ? '현대 작가' : 'Contemporary',
        className: 'bg-blue-500/20 text-blue-400 border-blue-500'
      },
      verified_artist: {
        text: language === 'ko' ? '인증 작가' : 'Verified Artist',
        className: 'bg-purple-500/20 text-purple-400 border-purple-500'
      }
    };

    const badge = badges[artist.copyrightStatus];
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  const renderArtistImage = () => {
    switch (artist.copyrightStatus) {
      case 'public_domain':
        return artist.images?.portrait ? (
          <div className="relative w-full h-48">
            <OptimizedImage
              src={artist.images.portrait}
              alt={displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false} placeholder="blur" quality={90}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <Palette className="w-12 h-12 text-gray-400" />
          </div>
        );
      
      case 'licensed':
        return artist.images?.portrait ? (
          <div className="relative w-full h-48">
            <OptimizedImage
              src={artist.images.portrait}
              alt={displayName}
              fill
              className="object-cover opacity-75"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false} placeholder="blur" quality={90}
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="text-white/80 text-sm font-medium bg-black/50 px-2 py-1 rounded">
                {language === 'ko' ? '라이선스 이미지' : 'Licensed Image'}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 flex items-center justify-center">
            <Palette className="w-12 h-12 text-yellow-400/60" />
          </div>
        );
      
      case 'verified_artist':
        return artist.artistManaged?.profileImage ? (
          <div className="relative w-full h-48">
            <OptimizedImage
              src={artist.artistManaged.profileImage}
              alt={displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false} placeholder="blur" quality={90}
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-purple-900/30 to-purple-800/30 flex items-center justify-center">
            <Palette className="w-12 h-12 text-purple-400/60" />
          </div>
        );
      
      default: // contemporary
        return (
          <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex flex-col items-center justify-center">
            <Palette className="w-12 h-12 text-gray-400 mb-2" />
            <span className="text-gray-400 text-sm">
              {language === 'ko' ? '이미지 없음' : 'No Image Available'}
            </span>
          </div>
        );
    }
  };

  const renderActionButtons = () => {
    switch (artist.copyrightStatus) {
      case 'contemporary':
        const contemporary = artist as any; // Type assertion for contemporary artist
        return (
          <div className="flex gap-2">
            {contemporary.officialLinks?.website && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(contemporary.officialLinks.website, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {language === 'ko' ? '웹사이트' : 'Website'}
              </Button>
            )}
            {contemporary.officialLinks?.instagram && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(contemporary.officialLinks.instagram, '_blank')}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Instagram
              </Button>
            )}
          </div>
        );
      
      case 'licensed':
        const licensed = artist as any; // Type assertion for licensed artist
        return licensed.purchaseLinks?.website ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(licensed.purchaseLinks.website, '_blank')}
            className="w-full"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            {language === 'ko' ? '작품 보기' : 'View Works'}
          </Button>
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
    >
      {/* Color Palette Preview */}
      {colorPalette && (
        <div className="h-2 flex">
          {colorPalette.palette.slice(0, 5).map((color, index) => (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}

      {/* Artist Image */}
      <div className="relative">
        {renderArtistImage()}
        <div className="absolute top-3 left-3">
          {getCopyrightBadge()}
        </div>
        <div className="absolute top-3 right-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFollowClick}
            disabled={isLoading}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFollowing 
                ? 'bg-red-500/80 text-white' 
                : 'bg-black/50 text-gray-300 hover:text-red-400'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Artist Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white truncate">
            {displayName}
          </h3>
          <div className="text-sm text-gray-400 ml-2">
            {artist.followCount.toLocaleString()}
          </div>
        </div>

        {/* Lifespan and Nationality */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          {getLifespan() && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {getLifespan()}
            </div>
          )}
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {displayNationality}
          </div>
        </div>

        {/* Bio */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {displayBio}
        </p>

        {/* Action Buttons */}
        {renderActionButtons()}
      </div>
    </motion.div>
  );
});