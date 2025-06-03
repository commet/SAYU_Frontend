'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Palette, Heart, TrendingUp } from 'lucide-react';

export default function JourneyPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Your Aesthetic Journey</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">Welcome, {user.nickname}</span>
            <Button
              variant="ghost"
              onClick={() => router.push('/profile')}
              className="text-white hover:text-purple-400"
            >
              View Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold text-white">
                {user.typeCode || 'N/A'}
              </span>
            </div>
            <h3 className="text-gray-400">Type Code</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Palette className="w-8 h-8 text-pink-400" />
              <span className="text-2xl font-bold text-white capitalize">
                {user.agencyLevel}
              </span>
            </div>
            <h3 className="text-gray-400">Agency Level</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold text-white capitalize">
                {user.journeyStage}
              </span>
            </div>
            <h3 className="text-gray-400">Journey Stage</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">
                {user.hasProfile ? 'Complete' : 'In Progress'}
              </span>
            </div>
            <h3 className="text-gray-400">Profile Status</h3>
          </motion.div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!user.hasProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl p-8 border border-purple-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Complete Your Profile
              </h2>
              <p className="text-gray-300 mb-6">
                Discover your unique aesthetic personality through our guided quiz experience.
              </p>
              <Button
                onClick={() => router.push('/quiz')}
                className="bg-white text-black hover:bg-gray-200"
              >
                Start Quiz
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-3xl p-8 border border-blue-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Explore Gallery
            </h2>
            <p className="text-gray-300 mb-6">
              Browse curated artworks matched to your aesthetic preferences.
            </p>
            <Button
              onClick={() => router.push('/gallery')}
              className="bg-white text-black hover:bg-gray-200"
            >
              View Gallery
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-amber-900/50 to-red-900/50 rounded-3xl p-8 border border-amber-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              AI Curator Chat
            </h2>
            <p className="text-gray-300 mb-6">
              Have a conversation with your personal AI art curator.
            </p>
            <Button
              onClick={() => router.push('/agent')}
              className="bg-white text-black hover:bg-gray-200"
            >
              Start Chat
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-3xl p-8 border border-green-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Community
            </h2>
            <p className="text-gray-300 mb-6">
              Connect with others who share your aesthetic sensibilities.
            </p>
            <Button
              onClick={() => router.push('/community')}
              className="bg-white text-black hover:bg-gray-200"
            >
              Join Community
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}