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
        "overflow-hidden bg-sayu-bg-card border border-sayu-powder-blue/20 shadow-md hover:shadow-lg transition-all duration-300",
        variant === 'default' && "artwork-frame rounded-xl",
        variant === 'minimal' && "rounded-lg"
      )}>
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-sayu-powder-blue/10">
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
                  "p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm",
                  isLiked 
                    ? "bg-sayu-double-bounce text-white" 
                    : "bg-sayu-bg-card/90 text-sayu-text-primary hover:bg-sayu-bg-card"
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
                  "p-2.5 rounded-full backdrop-blur-sm transition-colors shadow-sm",
                  isSaved 
                    ? "bg-sayu-tangerine-zest text-white" 
                    : "bg-sayu-bg-card/90 text-sayu-text-primary hover:bg-sayu-bg-card"
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
                className="p-2.5 rounded-full bg-sayu-bg-card/90 text-sayu-text-primary hover:bg-sayu-bg-card backdrop-blur-sm transition-colors shadow-sm"
                aria-label="Share artwork"
              >
                <ShareNetwork size={18} />
              </motion.button>
            )}
          </motion.div>

          {/* Viewed Indicator */}
          {isViewed && (
            <div className="absolute top-3 left-3">
              <div className="p-1.5 rounded-full bg-sayu-fern-green text-white shadow-sm">
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
                className="text-sm text-sayu-text-secondary font-medium hover:text-sayu-tangerine-zest cursor-pointer transition-colors"
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
                      ? "bg-sayu-tangerine-zest/10 text-sayu-tangerine-zest hover:bg-sayu-tangerine-zest/20"
                      : "bg-sayu-powder-blue/20 text-sayu-text-primary hover:bg-sayu-powder-blue/30"
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
          
          <p className="text-xs text-sayu-text-muted">
            {year}
            {medium && ` • ${medium}`}
          </p>
          
          {museum && variant !== 'minimal' && (
            <div className="mt-3 pt-3 border-t border-sayu-powder-blue/30">
              <p className="text-xs text-sayu-text-muted">
                {museum}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}