'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryLayout } from '@/components/gallery/GalleryLayout';
import { SwipeCard } from '@/components/gallery/SwipeCard';
import { Button } from '@/components/ui/button';
import { 
  ArrowClockwise, 
  Heart, 
  X, 
  Sparkle,
  Eye,
  ChartLine
} from 'phosphor-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium?: string;
  department?: string;
}

export default function DiscoverPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    liked: new Set<string>(),
    passed: new Set<string>(),
    sessionLikes: 0,
    sessionPasses: 0
  });

  useEffect(() => {
    loadArtworks();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = () => {
    const liked = localStorage.getItem('likedArtworks');
    const passed = localStorage.getItem('passedArtworks');
    
    if (liked) {
      setPreferences(prev => ({
        ...prev,
        liked: new Set(JSON.parse(liked))
      }));
    }
    
    if (passed) {
      setPreferences(prev => ({
        ...prev,
        passed: new Set(JSON.parse(passed))
      }));
    }
  };

  const loadArtworks = async () => {
    setLoading(true);
    try {
      // Enhanced search terms for discovery
      const searchTerms = [
        'portrait', 'landscape', 'abstract', 'modern', 'impressionism',
        'sculpture', 'painting', 'drawing', 'photography', 'contemporary'
      ];
      
      const searchQuery = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchQuery}&hasImages=true&isPublicDomain=true`
      );
      
      if (!response.ok) throw new Error('Failed to fetch artworks');
      
      const data = await response.json();
      const objectIDs = data.objectIDs?.slice(0, 50) || [];
      
      // Shuffle the array for variety
      const shuffledIDs = objectIDs.sort(() => Math.random() - 0.5);
      
      const artworkPromises = shuffledIDs.slice(0, 20).map(async (id: number) => {
        try {
          const artworkResponse = await fetch(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          );
          const artwork = await artworkResponse.json();
          
          if (artwork.primaryImage && artwork.title && artwork.artistDisplayName) {
            return {
              id: artwork.objectID.toString(),
              title: artwork.title,
              artist: artwork.artistDisplayName,
              year: artwork.objectDate || 'Unknown Date',
              imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
              museum: 'The Metropolitan Museum of Art',
              medium: artwork.medium,
              department: artwork.department
            };
          }
          return null;
        } catch (error) {
          console.error('Error fetching artwork:', error);
          return null;
        }
      });
      
      const results = await Promise.all(artworkPromises);
      const validArtworks = results.filter((artwork): artwork is Artwork => artwork !== null);
      
      setArtworks(validArtworks);
    } catch (error) {
      console.error('Error loading artworks:', error);
      toast.error('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeRight = () => {
    const currentArtwork = artworks[currentIndex];
    if (!currentArtwork) return;

    // Save to liked artworks
    const newLiked = new Set(preferences.liked);
    newLiked.add(currentArtwork.id);
    
    setPreferences(prev => ({
      ...prev,
      liked: newLiked,
      sessionLikes: prev.sessionLikes + 1
    }));
    
    // Save to localStorage
    localStorage.setItem('likedArtworks', JSON.stringify([...newLiked]));
    
    toast('Added to favorites! 💖', {
      style: {
        background: '#10B981',
        color: 'white',
      },
    });
    
    nextArtwork();
  };

  const handleSwipeLeft = () => {
    const currentArtwork = artworks[currentIndex];
    if (!currentArtwork) return;

    // Save to passed artworks
    const newPassed = new Set(preferences.passed);
    newPassed.add(currentArtwork.id);
    
    setPreferences(prev => ({
      ...prev,
      passed: newPassed,
      sessionPasses: prev.sessionPasses + 1
    }));
    
    // Save to localStorage
    localStorage.setItem('passedArtworks', JSON.stringify([...newPassed]));
    
    nextArtwork();
  };

  const nextArtwork = () => {
    if (currentIndex < artworks.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Load more artworks or show completion
      if (artworks.length > 0) {
        loadArtworks();
        setCurrentIndex(0);
      }
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setPreferences(prev => ({
      ...prev,
      sessionLikes: 0,
      sessionPasses: 0
    }));
    loadArtworks();
    toast('Session reset! 🔄');
  };

  const rightHeaderContent = (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Heart size={16} className="text-red-500" />
          <span>{preferences.sessionLikes}</span>
        </div>
        <div className="flex items-center gap-1">
          <X size={16} className="text-gray-500" />
          <span>{preferences.sessionPasses}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={resetSession}>
        <ArrowClockwise size={20} />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <GalleryLayout title="Discover Art" subtitle="Loading artworks for you...">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkle size={32} className="text-primary" />
            </div>
            <p className="text-muted-foreground">Curating artworks...</p>
          </div>
        </div>
      </GalleryLayout>
    );
  }

  if (artworks.length === 0) {
    return (
      <GalleryLayout title="Discover Art">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Eye size={32} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-display mb-2">No artworks available</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't load artworks at the moment. Please try again.
            </p>
            <Button onClick={loadArtworks}>Try Again</Button>
          </div>
        </div>
      </GalleryLayout>
    );
  }

  if (currentIndex >= artworks.length) {
    return (
      <GalleryLayout title="Session Complete" rightContent={rightHeaderContent}>
        <div className="flex items-center justify-center min-h-[600px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ChartLine size={32} className="text-primary" />
            </div>
            <h3 className="text-2xl font-display mb-2">Great Session! 🎨</h3>
            <p className="text-muted-foreground mb-4">
              You've discovered {preferences.sessionLikes + preferences.sessionPasses} artworks
            </p>
            <div className="flex justify-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-2 rounded-full">
                <Heart size={16} className="text-green-600" />
                <span>{preferences.sessionLikes} liked</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/20 px-3 py-2 rounded-full">
                <X size={16} className="text-gray-600" />
                <span>{preferences.sessionPasses} passed</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={resetSession} className="w-full">
                Discover More Art
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/archive')}
                className="w-full"
              >
                View Your Collection
              </Button>
            </div>
          </motion.div>
        </div>
      </GalleryLayout>
    );
  }

  return (
    <GalleryLayout
      title="Discover Art"
      subtitle={`${currentIndex + 1} of ${artworks.length}`}
      rightContent={rightHeaderContent}
    >
      <div className="flex flex-col items-center">
        {/* Swipe Instructions */}
        <div className="text-center mb-8 max-w-md">
          <p className="text-muted-foreground">
            Swipe right to like, left to pass. Discover art that speaks to you!
          </p>
        </div>

        {/* Card Stack */}
        <div className="relative w-full max-w-sm h-[600px] mb-20">
          <AnimatePresence>
            {artworks.slice(currentIndex, currentIndex + 3).map((artwork, index) => (
              <SwipeCard
                key={artwork.id}
                artwork={artwork}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isTop={index === 0}
                zIndex={3 - index}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSwipeLeft}
            className="w-14 h-14 rounded-full p-0"
          >
            <X size={24} />
          </Button>
          <Button
            size="lg"
            onClick={handleSwipeRight}
            className="w-16 h-16 rounded-full p-0 bg-red-500 hover:bg-red-600"
          >
            <Heart size={28} weight="fill" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 w-full max-w-sm">
          <div className="bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / artworks.length) * 100}%`
              }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {currentIndex + 1} of {artworks.length} artworks
          </p>
        </div>
      </div>
    </GalleryLayout>
  );
}