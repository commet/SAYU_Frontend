'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { GalleryLayout } from '@/components/gallery/GalleryLayout';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  BookmarkSimple, 
  ShareNetwork, 
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  X,
  ArrowsOut,
  Info,
  Download
} from 'phosphor-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ArtworkDetail {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  highResImageUrl?: string;
  museum: string;
  medium: string;
  department: string;
  culture?: string;
  period?: string;
  dimensions?: string;
  creditLine?: string;
  accessionNumber?: string;
  classification?: string;
  museumUrl?: string;
  artistBio?: string;
  artistNationality?: string;
  objectHistory?: string;
  isPublicDomain: boolean;
}

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const artworkId = params.id as string;
  
  const [artwork, setArtwork] = useState<ArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  
  const imageRef = useRef<HTMLDivElement>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fetchArtworkDetail = useCallback(async () => {
    try {
      const response = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${artworkId}`
      );
      
      if (!response.ok) throw new Error('Artwork not found');
      
      const data = await response.json();
      
      setArtwork({
        id: data.objectID.toString(),
        title: data.title,
        artist: data.artistDisplayName || 'Unknown Artist',
        year: data.objectDate || 'Unknown Date',
        imageUrl: data.primaryImage,
        highResImageUrl: data.primaryImage,
        museum: 'The Metropolitan Museum of Art',
        medium: data.medium || 'Unknown Medium',
        department: data.department,
        culture: data.culture,
        period: data.period,
        dimensions: data.dimensions,
        creditLine: data.creditLine,
        accessionNumber: data.accessionNumber,
        classification: data.classification,
        museumUrl: data.objectURL,
        artistBio: data.artistDisplayBio,
        artistNationality: data.artistNationality,
        objectHistory: data.objectHistory,
        isPublicDomain: data.isPublicDomain
      });
    } catch (error) {
      console.error('Error fetching artwork:', error);
      toast.error('Failed to load artwork details');
      router.push('/gallery');
    } finally {
      setLoading(false);
    }
  }, [artworkId, router]);

  const loadUserPreferences = useCallback(() => {
    const liked = localStorage.getItem('likedArtworks');
    const saved = localStorage.getItem('savedArtworks');
    
    if (liked) {
      const likedSet = new Set(JSON.parse(liked));
      setIsLiked(likedSet.has(artworkId));
    }
    
    if (saved) {
      const savedSet = new Set(JSON.parse(saved));
      setIsSaved(savedSet.has(artworkId));
    }
  }, [artworkId]);

  useEffect(() => {
    fetchArtworkDetail();
    loadUserPreferences();
  }, [artworkId, fetchArtworkDetail, loadUserPreferences]);

  const handleLike = () => {
    const liked = localStorage.getItem('likedArtworks');
    const likedSet = new Set(liked ? JSON.parse(liked) : []);
    
    if (likedSet.has(artworkId)) {
      likedSet.delete(artworkId);
      setIsLiked(false);
      toast('Removed from favorites');
    } else {
      likedSet.add(artworkId);
      setIsLiked(true);
      toast('Added to favorites', { icon: '❤️' });
    }
    
    localStorage.setItem('likedArtworks', JSON.stringify([...likedSet]));
  };

  const handleSave = () => {
    const saved = localStorage.getItem('savedArtworks');
    const savedSet = new Set(saved ? JSON.parse(saved) : []);
    
    if (savedSet.has(artworkId)) {
      savedSet.delete(artworkId);
      setIsSaved(false);
      toast('Removed from collection');
    } else {
      savedSet.add(artworkId);
      setIsSaved(true);
      toast('Added to collection', { icon: '📌' });
    }
    
    localStorage.setItem('savedArtworks', JSON.stringify([...savedSet]));
  };

  const handleShare = () => {
    if (navigator.share && artwork) {
      navigator.share({
        title: artwork.title,
        text: `${artwork.title} by ${artwork.artist}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard', { icon: '🔗' });
    }
  };

  const handleDownload = async () => {
    if (!artwork?.highResImageUrl) return;
    
    try {
      const response = await fetch(artwork.highResImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${artwork.title.replace(/[^a-z0-9]/gi, '_')}_${artwork.artist.replace(/[^a-z0-9]/gi, '_')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Download started', { icon: '⬇️' });
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <GalleryLayout title="Loading...">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-[4/5] skeleton rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 skeleton rounded w-3/4" />
              <div className="h-6 skeleton rounded w-1/2" />
              <div className="h-20 skeleton rounded" />
            </div>
          </div>
        </div>
      </GalleryLayout>
    );
  }

  if (!artwork) return null;

  const rightHeaderContent = (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLike}
        className={cn(isLiked && "text-red-500")}
      >
        <Heart size={20} weight={isLiked ? "fill" : "regular"} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleSave}
        className={cn(isSaved && "text-primary")}
      >
        <BookmarkSimple size={20} weight={isSaved ? "fill" : "regular"} />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleShare}>
        <ShareNetwork size={20} />
      </Button>
    </div>
  );

  return (
    <GalleryLayout title={artwork.title} rightContent={rightHeaderContent}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="relative">
            <div 
              ref={imageRef}
              className="artwork-frame cursor-zoom-in relative overflow-hidden"
              onClick={() => setShowZoom(true)}
            >
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-auto"
              />
              
              {/* Zoom Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg flex items-center gap-2"
              >
                <MagnifyingGlassPlus size={16} />
                <span className="text-sm">Click to zoom</span>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowInfo(!showInfo)}>
                  <Info size={16} className="mr-2" />
                  Details
                </Button>
                {artwork.museumUrl && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(artwork.museumUrl, '_blank')}
                  >
                    View on Museum Site
                  </Button>
                )}
              </div>
              {artwork.isPublicDomain && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Museum Label */}
            <div className="museum-label">
              <h1 className="text-3xl font-display mb-2">{artwork.title}</h1>
              <p className="text-lg font-medium text-muted-foreground mb-1">
                {artwork.artist}
                {artwork.artistNationality && ` (${artwork.artistNationality})`}
              </p>
              <p className="text-muted-foreground">{artwork.year}</p>
              {artwork.artistBio && (
                <p className="text-sm text-muted-foreground mt-2">{artwork.artistBio}</p>
              )}
            </div>

            {/* Artwork Information */}
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">About this artwork</h3>
                <div className="space-y-2 text-sm">
                  {artwork.medium && (
                    <div className="flex">
                      <span className="font-medium w-32">Medium</span>
                      <span className="text-muted-foreground">{artwork.medium}</span>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div className="flex">
                      <span className="font-medium w-32">Dimensions</span>
                      <span className="text-muted-foreground">{artwork.dimensions}</span>
                    </div>
                  )}
                  {artwork.culture && (
                    <div className="flex">
                      <span className="font-medium w-32">Culture</span>
                      <span className="text-muted-foreground">{artwork.culture}</span>
                    </div>
                  )}
                  {artwork.period && (
                    <div className="flex">
                      <span className="font-medium w-32">Period</span>
                      <span className="text-muted-foreground">{artwork.period}</span>
                    </div>
                  )}
                  {artwork.classification && (
                    <div className="flex">
                      <span className="font-medium w-32">Classification</span>
                      <span className="text-muted-foreground">{artwork.classification}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Details (collapsible) */}
              <AnimatePresence>
                {showInfo && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t pt-4 space-y-2 text-sm">
                      {artwork.creditLine && (
                        <div>
                          <span className="font-medium">Credit Line</span>
                          <p className="text-muted-foreground">{artwork.creditLine}</p>
                        </div>
                      )}
                      {artwork.accessionNumber && (
                        <div>
                          <span className="font-medium">Accession Number</span>
                          <p className="text-muted-foreground">{artwork.accessionNumber}</p>
                        </div>
                      )}
                      {artwork.objectHistory && (
                        <div>
                          <span className="font-medium">History</span>
                          <p className="text-muted-foreground">{artwork.objectHistory}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Related Actions */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-4">Explore More</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/gallery?artist=${encodeURIComponent(artwork.artist)}`)}
                >
                  More by {artwork.artist.split(' ').slice(-1)[0]}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push(`/gallery?period=${encodeURIComponent(artwork.period || '')}`)}
                >
                  {artwork.period || 'Similar Period'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {showZoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setShowZoom(false)}
          >
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomIn();
                }}
              >
                <MagnifyingGlassPlus size={20} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleZoomOut();
                }}
              >
                <MagnifyingGlassMinus size={20} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel(1);
                  setImagePosition({ x: 0, y: 0 });
                }}
              >
                <ArrowsOut size={20} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setShowZoom(false)}
              >
                <X size={20} />
              </Button>
            </div>

            {/* Zoomed Image */}
            <div
              className="relative max-w-[90vw] max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
            >
              <img
                src={artwork.highResImageUrl || artwork.imageUrl}
                alt={artwork.title}
                className="max-w-full max-h-[90vh] object-contain"
                style={{
                  transform: `scale(${zoomLevel}) translate(${imagePosition.x / zoomLevel}px, ${imagePosition.y / zoomLevel}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
              />
            </div>

            {/* Zoom Level Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(zoomLevel * 100)}%
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GalleryLayout>
  );
}