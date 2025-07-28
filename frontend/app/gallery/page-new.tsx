'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { GalleryLayout } from '@/components/gallery/GalleryLayout';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import { MasonryGrid, MasonryItem } from '@/components/gallery/MasonryGrid';
import { Button } from '@/components/ui/button';
import { 
  Shuffle, 
  SlidersHorizontal, 
  GridFour, 
  Rows, 
  MagnifyingGlass,
  FunnelSimple,
  X
} from 'phosphor-react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium: string;
  department: string;
  culture?: string;
  period?: string;
  dimensions?: string;
  museumUrl?: string;
  isPublicDomain?: boolean;
  license?: string;
}

const CATEGORIES = [
  { id: 'all', name: 'All Works', icon: GridFour },
  { id: 'paintings', name: 'Paintings', metDepartment: 11 },
  { id: 'sculpture', name: 'Sculpture', metDepartment: 12 },
  { id: 'photography', name: 'Photography', metDepartment: 19 },
  { id: 'asian-art', name: 'Asian Art', metDepartment: 6 },
  { id: 'modern', name: 'Modern', metDepartment: 21 },
];

function GalleryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams?.get('guest') === 'true';
  const { trackArtworkViewed, trackArtworkLiked } = useAchievements();
  
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'masonry' | 'grid'>('masonry');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [viewedArtworks, setViewedArtworks] = useState<Set<string>>(new Set());
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadUserPreferences();
    fetchArtworks();
  }, [selectedCategory]);

  const loadUserPreferences = () => {
    const liked = localStorage.getItem('likedArtworks');
    const viewed = localStorage.getItem('viewedArtworks');
    const saved = localStorage.getItem('savedArtworks');
    if (liked) setLikedArtworks(new Set(JSON.parse(liked)));
    if (viewed) setViewedArtworks(new Set(JSON.parse(viewed)));
    if (saved) setSavedArtworks(new Set(JSON.parse(saved)));
  };

  const saveUserPreferences = () => {
    localStorage.setItem('likedArtworks', JSON.stringify([...likedArtworks]));
    localStorage.setItem('viewedArtworks', JSON.stringify([...viewedArtworks]));
    localStorage.setItem('savedArtworks', JSON.stringify([...savedArtworks]));
  };

  const fetchArtworks = async () => {
    setLoading(true);
    try {
      // Sophisticated search terms for gallery aesthetic
      const searchTerms = [
        'masterpiece', 'portrait', 'landscape', 'still life',
        'impressionism', 'modern art', 'abstract', 'sculpture'
      ];
      const searchQuery = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      const departmentId = selectedCategory === 'all' 
        ? '' 
        : `&departmentId=${CATEGORIES.find(cat => cat.id === selectedCategory)?.metDepartment || ''}`;
      
      const searchResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchQuery}${departmentId}&hasImages=true&isPublicDomain=true`
      );
      
      if (!searchResponse.ok) throw new Error('Failed to fetch artworks');
      
      const searchData = await searchResponse.json();
      const objectIDs = searchData.objectIDs?.slice(0, 30) || [];
      
      const validArtworks: Artwork[] = [];
      const batchSize = 5;
      
      for (let i = 0; i < objectIDs.length && validArtworks.length < 20; i += batchSize) {
        const batch = objectIDs.slice(i, i + batchSize);
        const batchPromises = batch.map(async (id: number) => {
          try {
            const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            const artwork = await response.json();
            
            if (artwork.primaryImage && artwork.title && artwork.artistDisplayName && artwork.isPublicDomain) {
              return {
                id: artwork.objectID.toString(),
                title: artwork.title,
                artist: artwork.artistDisplayName || 'Unknown Artist',
                year: artwork.objectDate || 'Unknown Date',
                imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
                museum: 'The Metropolitan Museum of Art',
                medium: artwork.medium || 'Unknown Medium',
                department: artwork.department || 'Art',
                culture: artwork.culture,
                period: artwork.period,
                dimensions: artwork.dimensions,
                museumUrl: artwork.objectURL,
                isPublicDomain: artwork.isPublicDomain,
                license: 'CC0 - Public Domain'
              };
            }
            return null;
          } catch (error) {
            console.error('Error fetching artwork:', error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        const validBatch = batchResults.filter((artwork): artwork is Artwork => artwork !== null);
        validArtworks.push(...validBatch);
        
        if (i + batchSize < objectIDs.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setArtworks(validArtworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (artworkId: string) => {
    if (isGuestMode) {
      toast('Sign in to save favorites', {
        icon: '🎨'
      });
      return;
    }

    const newLiked = new Set(likedArtworks);
    if (newLiked.has(artworkId)) {
      newLiked.delete(artworkId);
    } else {
      newLiked.add(artworkId);
      if (user) trackArtworkLiked();
    }
    setLikedArtworks(newLiked);
    saveUserPreferences();
  };

  const handleView = (artworkId: string) => {
    const newViewed = new Set(viewedArtworks);
    if (!newViewed.has(artworkId)) {
      newViewed.add(artworkId);
      setViewedArtworks(newViewed);
      saveUserPreferences();
      if (user) trackArtworkViewed();
    }
    // Navigate to artwork detail view
    router.push(`/artwork/${artworkId}`);
  };

  const handleSave = (artworkId: string) => {
    const newSaved = new Set(savedArtworks);
    if (newSaved.has(artworkId)) {
      newSaved.delete(artworkId);
      toast('Removed from collection');
    } else {
      newSaved.add(artworkId);
      toast('Added to collection');
    }
    setSavedArtworks(newSaved);
    saveUserPreferences();
  };

  const handleShare = (artwork: Artwork) => {
    if (navigator.share) {
      navigator.share({
        title: artwork.title,
        text: `${artwork.title} by ${artwork.artist}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard');
    }
  };

  const shuffleArtworks = () => {
    const shuffled = [...artworks].sort(() => Math.random() - 0.5);
    setArtworks(shuffled);
    toast('Gallery refreshed', { icon: '🎲' });
  };

  const rightHeaderContent = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowFilters(!showFilters)}
        className="md:hidden"
      >
        <FunnelSimple size={20} />
      </Button>
      
      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setViewMode(viewMode === 'masonry' ? 'grid' : 'masonry')}
          title={`Switch to ${viewMode === 'masonry' ? 'grid' : 'masonry'} view`}
        >
          {viewMode === 'masonry' ? <GridFour size={20} /> : <Rows size={20} />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={shuffleArtworks}
          title="Shuffle gallery"
        >
          <Shuffle size={20} />
        </Button>
      </div>
    </div>
  );

  return (
    <GalleryLayout
      title="Art Gallery"
      subtitle={isGuestMode ? "Exploring as guest" : `${artworks.length} masterpieces`}
      rightContent={rightHeaderContent}
    >
      {/* Category Filter Bar */}
      <div className={cn(
        "mb-8 -mx-6 px-6 pb-4 border-b transition-all duration-300",
        showFilters ? "block" : "hidden md:block"
      )}>
        <div className="flex items-center justify-between mb-4 md:hidden">
          <h3 className="font-medium">Filters</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(false)}
          >
            <X size={20} />
          </Button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                "whitespace-nowrap",
                selectedCategory === category.id && "bg-primary"
              )}
            >
              {category.icon && <category.icon size={16} className="mr-2" />}
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Gallery Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[4/5] skeleton rounded-lg" />
          ))}
        </div>
      ) : viewMode === 'masonry' ? (
        <MasonryGrid columns={{ default: 1, sm: 2, md: 3, lg: 4 }}>
          {artworks.map((artwork, index) => (
            <MasonryItem key={artwork.id} index={index}>
              <ArtworkCard
                {...artwork}
                isLiked={likedArtworks.has(artwork.id)}
                isViewed={viewedArtworks.has(artwork.id)}
                isSaved={savedArtworks.has(artwork.id)}
                onLike={handleLike}
                onView={handleView}
                onSave={handleSave}
                onShare={() => handleShare(artwork)}
                variant="masonry"
              />
            </MasonryItem>
          ))}
        </MasonryGrid>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
              >
                <ArtworkCard
                  {...artwork}
                  isLiked={likedArtworks.has(artwork.id)}
                  isViewed={viewedArtworks.has(artwork.id)}
                  isSaved={savedArtworks.has(artwork.id)}
                  onLike={handleLike}
                  onView={handleView}
                  onSave={handleSave}
                  onShare={() => handleShare(artwork)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && artworks.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <MagnifyingGlass size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-display mb-2">No artworks found</h3>
          <p className="text-muted-foreground mb-6">Try selecting a different category</p>
          <Button onClick={fetchArtworks}>Refresh Gallery</Button>
        </div>
      )}

      {/* Guest Mode CTA */}
      {isGuestMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center"
        >
          <div className="gallery-card p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-display mb-3">Unlock Your Personal Gallery</h3>
            <p className="text-muted-foreground mb-6">
              Create a free account to save favorites, get AI-curated recommendations, 
              and discover art that speaks to your unique aesthetic.
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                onClick={() => router.push('/quiz')} 
                className="gallery-button-primary"
              >
                Take the Quiz
              </Button>
              <Button 
                onClick={() => router.push('/register')} 
                variant="outline"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </GalleryLayout>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <GridFour className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}