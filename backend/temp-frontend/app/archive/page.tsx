'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GalleryLayout } from '@/components/gallery/GalleryLayout';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { MasonryGrid, MasonryItem } from '@/components/gallery/MasonryGrid';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  BookmarkSimple, 
  Archive
} from 'phosphor-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ArchivedArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium?: string;
  savedAt?: string;
  likedAt?: string;
  viewedAt?: string;
}

export default function ArchivePage() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<ArchivedArtwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArchivedArtworks();
  }, []);

  const loadArchivedArtworks = async () => {
    setLoading(true);
    try {
      const liked = localStorage.getItem('likedArtworks');
      const saved = localStorage.getItem('savedArtworks');
      const viewed = localStorage.getItem('viewedArtworks');
      
      const likedIds = liked ? JSON.parse(liked) : [];
      const savedIds = saved ? JSON.parse(saved) : [];
      const viewedIds = viewed ? JSON.parse(viewed) : [];
      
      const allIds = [...new Set([...likedIds, ...savedIds, ...viewedIds])];
      
      if (allIds.length === 0) {
        setLoading(false);
        return;
      }
      
      const artworkPromises = allIds.slice(0, 20).map(async (id: string) => {
        try {
          const response = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          );
          const artwork = await response.json();
          
          if (artwork.primaryImage && artwork.title) {
            return {
              id: artwork.objectID.toString(),
              title: artwork.title,
              artist: artwork.artistDisplayName || 'Unknown Artist',
              year: artwork.objectDate || 'Unknown Date',
              imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
              museum: 'The Metropolitan Museum of Art',
              medium: artwork.medium,
              savedAt: savedIds.includes(id) ? new Date().toISOString() : undefined,
              likedAt: likedIds.includes(id) ? new Date().toISOString() : undefined,
              viewedAt: viewedIds.includes(id) ? new Date().toISOString() : undefined,
            };
          }
          return null;
        } catch (error) {
          console.error(`Error fetching artwork ${id}:`, error);
          return null;
        }
      });
      
      const results = await Promise.all(artworkPromises);
      const validArtworks = results.filter((artwork): artwork is ArchivedArtwork => artwork !== null);
      
      setArtworks(validArtworks);
    } catch (error) {
      console.error('Error loading archived artworks:', error);
      toast.error('Failed to load your collection');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <GalleryLayout title="Your Collection" subtitle="Loading your artworks...">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[4/5] skeleton rounded-lg" />
          ))}
        </div>
      </GalleryLayout>
    );
  }

  return (
    <GalleryLayout
      title="Your Collection"
      subtitle={`${artworks.length} artwork${artworks.length !== 1 ? 's' : ''}`}
    >
      {artworks.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Archive size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display mb-2">No artworks in your collection</h3>
          <p className="text-muted-foreground mb-6">
            Start discovering and saving artworks you love
          </p>
          <div className="space-x-3">
            <Button onClick={() => router.push('/discover')}>
              Discover Art
            </Button>
            <Button variant="outline" onClick={() => router.push('/gallery')}>
              Browse Gallery
            </Button>
          </div>
        </div>
      ) : (
        <MasonryGrid columns={{ default: 1, sm: 2, md: 3, lg: 4 }}>
          {artworks.map((artwork, index) => (
            <MasonryItem key={artwork.id} index={index}>
              <motion.div
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <ArtworkCard
                  {...artwork}
                  isLiked={!!artwork.likedAt}
                  isSaved={!!artwork.savedAt}
                  isViewed={!!artwork.viewedAt}
                  onView={(id) => router.push(`/artwork/${id}`)}
                  variant="masonry"
                />
                
                <div className="absolute bottom-20 right-3 flex gap-1">
                  {artwork.likedAt && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                      <Heart size={12} weight="fill" className="text-white" />
                    </div>
                  )}
                  {artwork.savedAt && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md">
                      <BookmarkSimple size={12} weight="fill" className="text-primary-foreground" />
                    </div>
                  )}
                </div>
              </motion.div>
            </MasonryItem>
          ))}
        </MasonryGrid>
      )}
    </GalleryLayout>
  );
}