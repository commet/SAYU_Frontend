'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Building2, 
  Upload, 
  FileImage, 
  Calendar, 
  Users, 
  Star,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface PortalStats {
  active_artists: number;
  active_galleries: number;
  pending_artworks: number;
  pending_exhibitions: number;
  approved_artworks: number;
  approved_exhibitions: number;
}

export default function ArtistPortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PortalStats | null>(null);
  const [userType, setUserType] = useState<'artist' | 'gallery' | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchStats();
      checkUserProfiles();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/artist-portal/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch portal stats:', error);
    }
  };

  const checkUserProfiles = async () => {
    try {
      // Check for artist profile
      const artistResponse = await fetch('/api/artist-portal/artist/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (artistResponse.ok) {
        setUserType('artist');
        return;
      }

      // Check for gallery profile
      const galleryResponse = await fetch('/api/artist-portal/gallery/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (galleryResponse.ok) {
        setUserType('gallery');
        return;
      }

      // No existing profile
      setUserType(null);
    } catch (error) {
      console.error('Failed to check user profiles:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Artist & Gallery Portal
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Share your creative work with the SAYU community. Submit artworks, create exhibitions, 
            and connect with art lovers who appreciate your unique aesthetic vision.
          </p>
        </motion.div>

        {/* Portal Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
          >
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Artists</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.active_artists}</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Galleries</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.active_galleries}</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <FileImage className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Artworks</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.approved_artworks}</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Exhibitions</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.approved_exhibitions}</div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-gray-400">Pending</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.pending_artworks + stats.pending_exhibitions}
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Approved</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {stats.approved_artworks + stats.approved_exhibitions}
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Get Started / Profile Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {!userType ? (
              // Profile Selection
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-8 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-6">Get Started</h2>
                <p className="text-gray-400 mb-8">
                  Choose your profile type to begin sharing your creative work with the SAYU community.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Artist Card */}
                  <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                        <Palette className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Artist Profile</h3>
                    </div>
                    
                    <p className="text-gray-400 mb-6">
                      Share your artwork directly with art enthusiasts. Upload your pieces, 
                      build your portfolio, and connect with collectors and admirers.
                    </p>
                    
                    <ul className="space-y-2 text-sm text-gray-300 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Upload and showcase your artwork
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Build your artistic profile
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Connect with art lovers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Track engagement analytics
                      </li>
                    </ul>
                    
                    <button 
                      onClick={() => router.push('/artist-portal/setup/artist')}
                      className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Create Artist Profile
                    </button>
                  </div>

                  {/* Gallery Card */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                        <Building2 className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-white">Gallery Profile</h3>
                    </div>
                    
                    <p className="text-gray-400 mb-6">
                      Showcase your space and curated exhibitions. Upload artworks from your collection 
                      and promote upcoming shows to attract visitors.
                    </p>
                    
                    <ul className="space-y-2 text-sm text-gray-300 mb-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Create and manage exhibitions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Showcase gallery collection
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Promote events and shows
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        Reach broader audiences
                      </li>
                    </ul>
                    
                    <button 
                      onClick={() => router.push('/artist-portal/setup/gallery')}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Create Gallery Profile
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Dashboard for existing users
              <div className="space-y-6">
                <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {userType === 'artist' ? 'Artist Dashboard' : 'Gallery Dashboard'}
                    </h2>
                    <button 
                      onClick={() => router.push(`/artist-portal/${userType}`)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      View Profile
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-5 h-5 text-purple-400" />
                        <span className="text-sm text-gray-400">Quick Actions</span>
                      </div>
                      <button 
                        onClick={() => router.push('/artist-portal/submit/artwork')}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Submit Artwork
                      </button>
                    </div>

                    {userType === 'gallery' && (
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-5 h-5 text-blue-400" />
                          <span className="text-sm text-gray-400">Exhibitions</span>
                        </div>
                        <button 
                          onClick={() => router.push('/artist-portal/submit/exhibition')}
                          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Create Exhibition
                        </button>
                      </div>
                    )}

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileImage className="w-5 h-5 text-green-400" />
                        <span className="text-sm text-gray-400">My Submissions</span>
                      </div>
                      <button 
                        onClick={() => router.push('/artist-portal/submissions')}
                        className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Guidelines */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Submission Guidelines</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>High-quality images (min 1200px width)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Accurate artwork information and descriptions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Original work or proper attribution</span>
                </div>
                <div className="flex items-start gap-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>Professional presentation and conduct</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-white mb-4">Need Help?</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  📖 Submission Guide
                </button>
                <button className="w-full text-left px-3 py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  💡 Best Practices
                </button>
                <button className="w-full text-left px-3 py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  📧 Contact Support
                </button>
                <button className="w-full text-left px-3 py-2 text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  ❓ FAQ
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}