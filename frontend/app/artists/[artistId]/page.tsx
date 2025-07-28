'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Heart, Grid3X3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { followAPI } from '@/lib/follow-api';
import { galleryApi } from '@/lib/gallery-api';
import { ArtworkCard } from '@/components/gallery/ArtworkCard';
import toast from 'react-hot-toast';

interface Artist {
  id: string;
  name: string;
  bio?: string;
  nationality?: string;
  birthYear?: string;
  deathYear?: string;
  movements?: string[];
  website?: string;
  imageUrl?: string;
  followerCount: number;
  artworkCount: number;
}

interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  year: string;
  imageUrl: string;
  medium?: string;
  museum?: string;
  isLiked: boolean;
  isArchived: boolean;
}

export default function ArtistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useLanguage();
  const { user } = useAuth();
  const artistId = params?.artistId as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    mostPopularWork: null as Artwork | null
  });

  useEffect(() => {
    if (artistId) {
      loadArtistData();
    }
  }, [artistId]);

  const loadArtistData = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual API calls
      const mockArtist: Artist = {
        id: artistId,
        name: 'Claude Monet',
        bio: '프랑스 인상주의 화가로, 빛과 색채의 변화를 포착하는 혁신적인 기법으로 유명합니다.',
        nationality: 'French',
        birthYear: '1840',
        deathYear: '1926',
        movements: ['Impressionism'],
        followerCount: 1234,
        artworkCount: 42
      };

      const mockArtworks: Artwork[] = [
        {
          id: '1',
          title: 'Water Lilies',
          artist: 'Claude Monet',
          artistId: artistId,
          year: '1916',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Claude_Monet_-_Water_Lilies_-_Google_Art_Project.jpg/1280px-Claude_Monet_-_Water_Lilies_-_Google_Art_Project.jpg',
          medium: 'Oil on canvas',
          museum: 'National Museum of Western Art',
          isLiked: false,
          isArchived: false
        },
        {
          id: '2',
          title: 'Impression, Sunrise',
          artist: 'Claude Monet',
          artistId: artistId,
          year: '1872',
          imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Monet_-_Impression%2C_Sunrise.jpg/1280px-Monet_-_Impression%2C_Sunrise.jpg',
          medium: 'Oil on canvas',
          museum: 'Musée Marmottan Monet',
          isLiked: true,
          isArchived: false
        }
      ];

      setArtist(mockArtist);
      setArtworks(mockArtworks);

      // Check if following
      if (user) {
        try {
          const followingList = await followAPI.getFollowing(user.auth.id);
          setIsFollowing(followingList.users.some((f: any) => f.id === artistId));
        } catch (error) {
          console.error('Failed to check following status:', error);
        }
      }

      // Calculate stats
      const totalLikes = mockArtworks.filter(a => a.isLiked).length;
      const mostPopular = mockArtworks.reduce((prev, current) => 
        (current.isLiked ? current : prev), mockArtworks[0]
      );

      setStats({
        totalViews: mockArtworks.length * 10, // Mock calculation
        totalLikes,
        mostPopularWork: mostPopular
      });

    } catch (error) {
      console.error('Failed to load artist data:', error);
      toast.error(language === 'ko' ? '아티스트 정보를 불러올 수 없습니다' : 'Failed to load artist data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isFollowing) {
        await followAPI.unfollowUser(artistId);
        setIsFollowing(false);
        toast.success(language === 'ko' ? '팔로우를 취소했습니다' : 'Unfollowed successfully');
      } else {
        await followAPI.followUser(artistId);
        setIsFollowing(true);
        toast.success(language === 'ko' ? '팔로우했습니다' : 'Followed successfully');
      }
    } catch (error) {
      toast.error(language === 'ko' ? '작업을 완료할 수 없습니다' : 'Failed to complete action');
    }
  };

  const handleArtworkLike = async (artworkId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const artwork = artworks.find(a => a.id === artworkId);
      if (!artwork) return;

      if (artwork.isLiked) {
        await galleryApi.unlikeArtwork(artworkId);
      } else {
        await galleryApi.likeArtwork(artworkId);
      }

      setArtworks(prev => prev.map(a => 
        a.id === artworkId ? { ...a, isLiked: !a.isLiked } : a
      ));
    } catch (error) {
      toast.error(language === 'ko' ? '작업을 완료할 수 없습니다' : 'Failed to complete action');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {language === 'ko' ? '아티스트를 찾을 수 없습니다' : 'Artist not found'}
          </h2>
          <Button onClick={() => router.back()}>
            {language === 'ko' ? '돌아가기' : 'Go Back'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            {language === 'ko' ? '뒤로' : 'Back'}
          </button>
        </div>
      </header>

      {/* Artist Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {artist.nationality && (
                  <span>{artist.nationality}</span>
                )}
                {artist.birthYear && (
                  <span>
                    {artist.birthYear}
                    {artist.deathYear && ` - ${artist.deathYear}`}
                  </span>
                )}
              </div>
              {artist.movements && artist.movements.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {artist.movements.map(movement => (
                    <span
                      key={movement}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {movement}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleFollowToggle}
              variant={isFollowing ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isFollowing 
                ? (language === 'ko' ? '팔로잉' : 'Following')
                : (language === 'ko' ? '팔로우' : 'Follow')}
            </Button>
          </div>

          {artist.bio && (
            <p className="text-gray-600 mb-6">{artist.bio}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Grid3X3 className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{artist.artworkCount}</div>
              <div className="text-sm text-gray-600">
                {language === 'ko' ? '작품' : 'Artworks'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <UserPlus className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{artist.followerCount}</div>
              <div className="text-sm text-gray-600">
                {language === 'ko' ? '팔로워' : 'Followers'}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Heart className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
              <div className="text-sm text-gray-600">
                {language === 'ko' ? '좋아요' : 'Likes'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Artworks */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            {language === 'ko' ? '작품' : 'Artworks'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artworks.map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ArtworkCard
                  {...artwork}
                  showFollowButton={false}
                  onLike={handleArtworkLike}
                  onView={(id) => console.log('View artwork:', id)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}