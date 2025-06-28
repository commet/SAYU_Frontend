'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, Sparkles, Heart, Eye, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface DailyRecommendation {
  date: string;
  profile: {
    typeCode: string;
    archetypeName: string;
  };
  recommendation: {
    searchTerm: string;
    departmentId: number;
    category: string;
    theme: string;
    message: string;
  };
  suggestions: string[];
}

interface DailyArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum: string;
  medium: string;
  museumUrl?: string;
}

export function DailyRecommendationCard() {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<DailyRecommendation | null>(null);
  const [featuredArtwork, setFeaturedArtwork] = useState<DailyArtwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingArtwork, setLoadingArtwork] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDailyRecommendation();
    }
  }, [user]);

  useEffect(() => {
    if (recommendation) {
      fetchFeaturedArtwork();
    }
  }, [recommendation]);

  const fetchDailyRecommendation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/daily`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendation(data);
      }
    } catch (error) {
      console.error('Error fetching daily recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedArtwork = async () => {
    if (!recommendation) return;
    
    setLoadingArtwork(true);
    try {
      const { searchTerm, departmentId } = recommendation.recommendation;
      
      // COMPLIANCE: Fetch only public domain artworks from Met Museum API
      const searchResponse = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&q=${searchTerm}&hasImages=true&isPublicDomain=true`
      );
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const objectIDs = searchData.objectIDs?.slice(0, 5) || [];
        
        // Try to get a valid artwork
        for (const id of objectIDs) {
          try {
            const artworkResponse = await fetch(
              `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
            );
            const artwork = await artworkResponse.json();
            
            // COMPLIANCE: Only show public domain artworks
            if (artwork.primaryImage && 
                artwork.title && 
                artwork.artistDisplayName && 
                artwork.isPublicDomain === true) {
              setFeaturedArtwork({
                id: artwork.objectID.toString(),
                title: artwork.title,
                artist: artwork.artistDisplayName || 'Unknown Artist',
                year: artwork.objectDate || 'Unknown Date',
                imageUrl: artwork.primaryImageSmall || artwork.primaryImage,
                museum: 'Metropolitan Museum of Art',
                medium: artwork.medium || 'Unknown Medium',
                museumUrl: artwork.objectURL
              });
              break;
            }
          } catch (error) {
            console.error('Error fetching artwork details:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching featured artwork:', error);
    } finally {
      setLoadingArtwork(false);
    }
  };

  const handleViewInGallery = () => {
    if (recommendation) {
      window.location.href = `/gallery?category=${recommendation.recommendation.category}`;
    }
  };

  const handleLike = async () => {
    if (!featuredArtwork) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artworkId: featuredArtwork.id,
          action: 'like',
          metadata: { source: 'daily_recommendation' }
        })
      });
      
      toast.success('Added to favorites!');
    } catch (error) {
      console.error('Error liking artwork:', error);
    }
  };

  const handleView = async () => {
    if (!featuredArtwork) return;
    
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artworks/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          artworkId: featuredArtwork.id,
          action: 'view',
          metadata: { source: 'daily_recommendation' }
        })
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  if (!user || loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border shadow-sm text-center">
        <Calendar className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground mb-4">Your daily art recommendation will appear here</p>
        <Button onClick={fetchDailyRecommendation} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-2xl p-6 border shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Daily Art Discovery</h3>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {recommendation.recommendation.theme}
        </div>
      </div>

      {/* Featured Artwork */}
      {loadingArtwork ? (
        <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse" />
      ) : featuredArtwork ? (
        <div className="relative group mb-4">
          <div className="aspect-video rounded-lg overflow-hidden relative">
            <Image
              src={featuredArtwork.imageUrl}
              alt={featuredArtwork.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
              onClick={handleView}
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-artwork.svg';
              }}
            />
          </div>
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg">
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleLike}
                className="backdrop-blur-sm"
              >
                <Heart className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleView}
                className="backdrop-blur-sm"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Artwork info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
            <h4 className="text-white font-medium text-sm line-clamp-1">{featuredArtwork.title}</h4>
            <p className="text-white/80 text-xs">{featuredArtwork.artist} • {featuredArtwork.year}</p>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading your daily artwork...</p>
          </div>
        </div>
      )}

      {/* Message */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {recommendation.recommendation.message}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handleViewInGallery}
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        >
          Explore More
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
        <Button
          onClick={fetchDailyRecommendation}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions */}
      <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
        <div className="flex flex-wrap gap-1">
          {recommendation.suggestions.slice(0, 2).map((suggestion, index) => (
            <span
              key={index}
              className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full"
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}