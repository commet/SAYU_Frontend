'use client';

import { motion } from 'framer-motion';
import { Heart, Eye, ShareNetwork, BookmarkSimple, UserPlus } from 'phosphor-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ArtworkCardProps {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  year: string;
  imageUrl: string;
  museum?: string;
  medium?: string;
  isLiked?: boolean;
  isViewed?: boolean;
  isSaved?: boolean;
  isFollowingArtist?: boolean;
  onLike?: (id: string) => void;
  onView?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onFollowArtist?: (artistId: string, isFollowing: boolean) => void;
  variant?: 'default' | 'masonry' | 'minimal';
  showFollowButton?: boolean;
}

export function ArtworkCard({
  id,
  title,
  artist,
  artistId,
  year,
  imageUrl,
  museum,
  medium,
  isLiked = false,
  isViewed = false,
  isSaved = false,
  isFollowingArtist = false,
  onLike,
  onView,
  onSave,
  onShare,
  onFollowArtist,
  variant = 'default',
  showFollowButton = true
}: ArtworkCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const { language } = useLanguage();

  const handleClick = () => {
    if (onView) onView(id);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.article
      className={cn(
        "group relative cursor-pointer",
        variant === 'masonry' && "masonry-item"
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className={cn(
        "overflow-hidden bg-card",
        variant === 'default' && "artwork-frame",
        variant === 'minimal' && "rounded-lg"
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton" />
          )}
          
          <motion.img
            src={imageUrl}
            alt={`${title} by ${artist}`}
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Gradient Overlay on Hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Action Buttons */}
          <motion.div
            className="absolute top-3 right-3 flex gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -10 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {onLike && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleAction(e, () => onLike(id))}
                className={cn(
                  "p-2.5 rounded-full backdrop-blur-sm transition-colors",
                  isLiked 
                    ? "bg-red-500 text-white" 
                    : "bg-white/90 text-gray-700 hover:bg-white"
                )}
                aria-label={isLiked ? "Unlike artwork" : "Like artwork"}
              >
                <Heart size={18} weight={isLiked ? "fill" : "regular"} />
              </motion.button>
            )}
            
            {onSave && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleAction(e, () => onSave(id))}
                className={cn(
                  "p-2.5 rounded-full backdrop-blur-sm transition-colors",
                  isSaved 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-white/90 text-gray-700 hover:bg-white"
                )}
                aria-label={isSaved ? "Remove from collection" : "Save to collection"}
              >
                <BookmarkSimple size={18} weight={isSaved ? "fill" : "regular"} />
              </motion.button>
            )}
            
            {onShare && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => handleAction(e, () => onShare(id))}
                className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-white backdrop-blur-sm transition-colors"
                aria-label="Share artwork"
              >
                <ShareNetwork size={18} />
              </motion.button>
            )}
          </motion.div>

          {/* Viewed Indicator */}
          {isViewed && (
            <div className="absolute top-3 left-3">
              <div className="p-1.5 rounded-full bg-green-500 text-white">
                <Eye size={14} weight="fill" />
              </div>
            </div>
          )}
        </div>

        {/* Museum Label */}
        <div className={cn(
          "p-4",
          variant === 'minimal' && "p-3"
        )}>
          <h3 className={cn(
            "font-display line-clamp-2 mb-1",
            variant === 'minimal' ? "text-base" : "text-lg"
          )}>
            {title}
          </h3>
          
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2">
              <p 
                className="text-sm text-muted-foreground font-medium hover:text-primary cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (artistId) router.push(`/artists/${artistId}`);
                }}
              >
                {artist}
              </p>
              {showFollowButton && artistId && onFollowArtist && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFollowArtist(artistId, isFollowingArtist);
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors",
                    isFollowingArtist
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <UserPlus size={12} weight={isFollowingArtist ? "fill" : "regular"} />
                  {isFollowingArtist 
                    ? (language === 'ko' ? '팔로잉' : 'Following')
                    : (language === 'ko' ? '팔로우' : 'Follow')}
                </motion.button>
              )}
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            {year}
            {medium && ` • ${medium}`}
          </p>
          
          {museum && variant !== 'minimal' && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {museum}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}