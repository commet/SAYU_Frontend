'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizedTheme, useThemeAwareAnimations, useThemeAwareLayout } from '@/hooks/usePersonalizedTheme';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Shuffle, ExternalLink, Eye, UserPlus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

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

interface UserProfile {
  typeCode: string;
  archetypeName: string;
  emotionalTags: string[];
  artworkScores: Record<string, number>;
}

const ART_CATEGORIES = [
  { id: 'paintings', name: 'Paintings', metDepartment: 11 },
  { id: 'sculpture', name: 'Sculpture', metDepartment: 12 },
  { id: 'photography', name: 'Photography', metDepartment: 12 },
  { id: 'asian-art', name: 'Asian Art', metDepartment: 6 },
  { id: 'modern', name: 'Modern Art', metDepartment: 21 },
  { id: 'contemporary', name: 'Contemporary', metDepartment: 21 }
];

function GalleryContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams.get('guest') === 'true';
  const { theme } = usePersonalizedTheme();
  const animations = useThemeAwareAnimations();
  const layout = useThemeAwareLayout();
  const { trackArtworkViewed, trackArtworkLiked } = useAchievements();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading_artworks, setLoadingArtworks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('paintings');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [viewedArtworks, setViewedArtworks] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load user profile and preferences
  useEffect(() => {
    if (user && !isGuestMode) {
      fetchUserProfile();
      loadUserPreferences();
    } else if (isGuestMode) {
      // For guest mode, just load local preferences
      loadUserPreferences();
    }
  }, [user, isGuestMode]);

  // Load artworks when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchArtworks(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const loadUserPreferences = () => {
    const liked = localStorage.getItem('likedArtworks');
    const viewed = localStorage.getItem('viewedArtworks');
    if (liked) setLikedArtworks(new Set(JSON.parse(liked)));
    if (viewed) setViewedArtworks(new Set(JSON.parse(viewed)));
  };

  const saveUserPreferences = () => {
    localStorage.setItem('likedArtworks', JSON.stringify([...likedArtworks]));
    localStorage.setItem('viewedArtworks', JSON.stringify([...viewedArtworks]));
  };

  const fetchArtworks = async (category: string) => {
    setLoadingArtworks(true);
    try {
      // Get personalized recommendations from backend (only for authenticated users)
      let searchQuery = 'masterpiece';
      let departmentId = ART_CATEGORIES.find(cat => cat.id === category)?.metDepartment || 11;
      
      if (!isGuestMode && user) {
        try {
          const token = localStorage.getItem('token');
          const recResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/artworks/recommendations?category=${category}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          if (recResponse.ok) {
            const recommendations = await recResponse.json();
            searchQuery = recommendations.searchTerms[0] || 'masterpiece';
            departmentId = recommendations.metApiConfig.departmentIds[0] || departmentId;
          }
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          // Fall back to local profile analysis
          const searchTerms = getSearchTermsForProfile(userProfile);
          searchQuery = searchTerms.length > 0 ? searchTerms[0] : 'masterpiece';
        }
      } else {
        // For guest mode, use category-based search terms
        const guestSearchTerms = getGuestSearchTerms(category);
        searchQuery = guestSearchTerms[Math.floor(Math.random() * guestSearchTerms.length)];
      }

      // Use cached artworks if available
      const cacheKey = `gallery_${category}_${searchQuery}_${departmentId}`;
      const cachedArtworks = localStorage.getItem(cacheKey);
      
      if (cachedArtworks) {
        const { artworks: cached, timestamp } = JSON.parse(cachedArtworks);
        // Use cache if less than 1 hour old
        if (Date.now() - timestamp < 3600000) {
          setArtworks(cached);
          return;
        }
      }
      
      // COMPLIANCE: Search with isPublicDomain filter to get only CC0 artworks
      const searchResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&q=${searchQuery}&hasImages=true&isPublicDomain=true`
      );
      
      if (!searchResponse.ok) {
        throw new Error('Failed to fetch artworks');
      }
      
      const searchData = await searchResponse.json();
      const objectIDs = searchData.objectIDs?.slice(0, 20) || [];
      
      // Batch fetch with better error handling
      const validArtworks: Artwork[] = [];
      const batchSize = 5;
      
      for (let i = 0; i < objectIDs.length && validArtworks.length < 15; i += batchSize) {
        const batch = objectIDs.slice(i, i + batchSize);
        const batchPromises = batch.map(async (id: number) => {
          try {
            const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);
            const artwork = await response.json();
            
            // Debug: Log the first artwork to check image URLs
            if (i === 0 && id === batch[0]) {
              console.log('🖼️ Sample artwork data:', {
                title: artwork.title,
                primaryImage: artwork.primaryImage,
                primaryImageSmall: artwork.primaryImageSmall,
                isPublicDomain: artwork.isPublicDomain
              });
            }
            
            // COMPLIANCE: Only include public domain artworks (CC0 license)
            if (artwork.primaryImage && 
                artwork.title && 
                artwork.artistDisplayName && 
                artwork.isPublicDomain === true) {
              return {
                id: artwork.objectID.toString(),
                title: artwork.title,
                artist: artwork.artistDisplayName || 'Unknown Artist',
                year: artwork.objectDate || 'Unknown Date',
                imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
                museum: 'Metropolitan Museum of Art',
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
        
        // Small delay between batches
        if (i + batchSize < objectIDs.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`📊 Gallery loaded: ${validArtworks.length} artworks`);
      if (validArtworks.length > 0) {
        console.log('🎨 First artwork:', validArtworks[0]);
      }
      
      setArtworks(validArtworks);
      
      // Cache the results
      localStorage.setItem(cacheKey, JSON.stringify({
        artworks: validArtworks,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching artworks:', error);
      toast.error('Failed to load artworks. Please try again.');
    } finally {
      setLoadingArtworks(false);
    }
  };

  const getSearchTermsForProfile = (profile: UserProfile | null): string[] => {
    if (!profile) return ['art', 'painting', 'masterpiece'];
    
    // Map emotional tags and type codes to search terms
    const searchMapping: Record<string, string[]> = {
      'contemplative': ['meditation', 'peaceful', 'serene'],
      'energetic': ['dynamic', 'vibrant', 'movement'],
      'introspective': ['portrait', 'solitude', 'reflection'],
      'curious': ['landscape', 'exploration', 'discovery'],
      'emotional': ['expressionism', 'abstract', 'color'],
      'analytical': ['geometric', 'structure', 'composition'],
      'traditional': ['classical', 'renaissance', 'baroque'],
      'modern': ['contemporary', 'modern', 'avant-garde']
    };
    
    const terms: string[] = [];
    
    // Add terms based on emotional tags
    profile.emotionalTags?.forEach(tag => {
      if (searchMapping[tag.toLowerCase()]) {
        terms.push(...searchMapping[tag.toLowerCase()]);
      }
    });
    
    // Add terms based on type code
    const typeCode = profile.typeCode || '';
    if (typeCode.includes('A')) terms.push('abstract', 'modern');
    if (typeCode.includes('R')) terms.push('realistic', 'portrait');
    if (typeCode.includes('E')) terms.push('expressive', 'emotional');
    if (typeCode.includes('M')) terms.push('classical', 'detailed');
    
    return terms.length > 0 ? [...new Set(terms)] : ['art', 'painting'];
  };

  const getGuestSearchTerms = (category: string): string[] => {
    const categoryTerms: Record<string, string[]> = {
      'paintings': ['painting', 'masterpiece', 'portrait', 'landscape', 'still life'],
      'sculpture': ['sculpture', 'bronze', 'marble', 'statue', 'carving'],
      'photography': ['photograph', 'portrait', 'street', 'documentary', 'art'],
      'asian-art': ['asian', 'chinese', 'japanese', 'calligraphy', 'ceramics'],
      'modern': ['modern', 'contemporary', 'abstract', 'expressionism', 'cubism'],
      'contemporary': ['contemporary', 'installation', 'conceptual', 'new media', 'digital']
    };
    
    return categoryTerms[category] || ['art', 'masterpiece', 'beautiful'];
  };

  const trackInteraction = async (artworkId: string, action: string, metadata = {}) => {
    // Only track interactions if user is authenticated (not in guest mode)
    if (isGuestMode || !user) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ artworkId, action, metadata })
      });
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const handleLike = async (artworkId: string) => {
    if (isGuestMode) {
      toast.success('Sign up to save favorites!', {
        action: {
          label: 'Sign Up',
          onClick: () => router.push('/register')
        }
      });
      return;
    }

    const newLiked = new Set(likedArtworks);
    const isLiking = !newLiked.has(artworkId);
    
    if (isLiking) {
      newLiked.add(artworkId);
      toast.success('Added to favorites');
      await trackInteraction(artworkId, 'like');
      if (user) trackArtworkLiked(); // Track for achievements
    } else {
      newLiked.delete(artworkId);
      toast.success('Removed from favorites');
      await trackInteraction(artworkId, 'unlike');
    }
    
    setLikedArtworks(newLiked);
    saveUserPreferences();
  };

  const handleView = async (artworkId: string) => {
    const newViewed = new Set(viewedArtworks);
    if (!newViewed.has(artworkId)) {
      newViewed.add(artworkId);
      setViewedArtworks(newViewed);
      saveUserPreferences();
      await trackInteraction(artworkId, 'view');
      if (user) trackArtworkViewed(); // Track for achievements
    }
  };

  const shuffleArtworks = () => {
    const shuffled = [...artworks].sort(() => Math.random() - 0.5);
    setArtworks(shuffled);
    toast.success('Gallery shuffled!');
  };

  if (loading && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
          <p className="text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-semibold mb-2">Art Gallery</h2>
          <p className="text-muted-foreground mb-6">Please log in to explore personalized artworks</p>
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen theme-animated-element personalized-container"
      style={{ background: theme?.colors.background || 'var(--color-background)' }}
    >
      {/* Header */}
      <div 
        className="border-b backdrop-blur-sm sticky top-0 z-10"
        style={{ 
          backgroundColor: `${theme?.colors.surface || 'var(--color-surface)'}cc`,
          borderColor: theme?.colors.border || 'var(--color-border)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  Art Gallery
                  {isGuestMode && (
                    <span className="ml-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                      Guest Mode
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isGuestMode 
                    ? `Discover amazing artworks • ${artworks.length} artworks`
                    : `Curated for ${userProfile?.archetypeName || 'your aesthetic'} • ${artworks.length} artworks`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isGuestMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => router.push('/quiz')}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Get Personalized
                  </Button>
                  <Button size="sm" onClick={() => router.push('/register')}>
                    Sign Up Free
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={shuffleArtworks}>
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    ♥ {likedArtworks.size} • 👁 {viewedArtworks.size}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Category Filter */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {ART_CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto p-4">
        {loading_artworks ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {artworks.map((artwork) => (
                <motion.div
                  key={artwork.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative personalized-card cursor-pointer"
                  style={{
                    transition: `all ${animations.duration} ${animations.easing}`,
                    borderRadius: layout.borderRadius
                  }}
                  whileHover={{ scale: parseFloat(animations.hoverScale) }}
                  onClick={() => handleView(artwork.id)}
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden">
                    <Image
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      onLoad={() => console.log('✅ Image loaded:', artwork.title)}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', artwork.imageUrl);
                        e.currentTarget.src = '/images/placeholder-artwork.svg';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="w-8 h-8 backdrop-blur-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(artwork.id);
                        }}
                      >
                        <Heart className={`w-4 h-4 ${likedArtworks.has(artwork.id) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                    </div>

                    {/* Viewed indicator */}
                    {viewedArtworks.has(artwork.id) && (
                      <div className="absolute top-2 left-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Eye className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-1">{artwork.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{artwork.artist}</p>
                    <p className="text-xs text-muted-foreground">{artwork.year}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                        {artwork.museum.split(' ')[0]}
                      </span>
                      {artwork.museumUrl && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(artwork.museumUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading_artworks && artworks.length === 0 && (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No artworks found</h3>
            <p className="text-muted-foreground mb-4">Try selecting a different category</p>
            <Button onClick={() => fetchArtworks(selectedCategory)}>
              Retry
            </Button>
          </div>
        )}

        {/* Guest Mode CTA Banner */}
        {isGuestMode && (
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-center">
              <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2">
                🎨 Unlock Your Personal Art Journey
              </h3>
              <p className="text-purple-700 dark:text-purple-300 mb-4">
                Take our personality quiz to get curated recommendations, save favorites, and discover art that truly resonates with you.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => router.push('/quiz')} className="bg-purple-600 hover:bg-purple-700">
                  Take Personality Quiz
                </Button>
                <Button onClick={() => router.push('/register')} variant="outline" className="border-purple-300 text-purple-700">
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Met Museum Attribution & License Notice */}
        <div className="mt-8 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4" />
            <strong>Artwork Collection</strong>
          </p>
          <p>
            This gallery features artworks from The Metropolitan Museum of Art&apos;s Open Access collection, 
            available under the Creative Commons Zero (CC0) license. All displayed artworks are in the 
            public domain and free to use.
          </p>
          <p className="mt-2">
            <a 
              href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Learn more about The Met&apos;s Open Access initiative →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Eye className="w-12 h-12 mx-auto mb-4 animate-pulse text-purple-500" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}

export default GalleryPage;