'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, BookmarkCheck, Share2, ExternalLink, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ArtworkActionsProps {
  artwork: {
    artveeId: string;
    title: string;
    artist: string;
    url: string;
  };
  className?: string;
}

export default function ArtworkActions({ artwork, className }: ArtworkActionsProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const { toast } = useToast();

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      description: isLiked ? '좋아요를 취소했습니다' : '작품을 좋아요 했습니다',
    });
  };

  const handleArchive = () => {
    setIsArchived(!isArchived);
    toast({
      description: isArchived ? '컬렉션에서 제거했습니다' : '내 컬렉션에 추가했습니다',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artwork.title,
          text: `${artwork.artist}의 "${artwork.title}"을 확인해보세요`,
          url: artwork.url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(artwork.url);
      toast({
        description: '링크가 클립보드에 복사되었습니다',
      });
    }
  };

  const handleFollowArtist = () => {
    toast({
      description: `${artwork.artist}를 팔로우했습니다`,
    });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          className={`p-2 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleArchive}
          className={`p-2 ${isArchived ? 'text-blue-500' : 'text-gray-500'}`}
        >
          {isArchived ? (
            <BookmarkCheck className="w-4 h-4 fill-current" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFollowArtist}
          className="p-2 text-gray-500"
        >
          <User className="w-4 h-4" />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          className="p-2 text-gray-500"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(artwork.url, '_blank')}
          className="p-2 text-gray-500"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}