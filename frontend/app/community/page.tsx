'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ForumList } from '@/components/community/ForumList';
import { motion } from 'framer-motion';
import { Users, MessageSquare, TrendingUp, Star } from 'lucide-react';

export default function CommunityPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
            Community Hub
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connect with fellow aesthetic explorers, share discoveries, and engage in meaningful discussions about art and culture.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-gray-400">Active Members</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5,892</div>
                <div className="text-sm text-gray-400">Discussions</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">23,456</div>
                <div className="text-sm text-gray-400">Posts</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">156</div>
                <div className="text-sm text-gray-400">Featured</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            Welcome to the SAYU Community, {user.nickname || 'Explorer'}!
          </h2>
          <p className="text-gray-400">
            Share your aesthetic journey, discover new perspectives, and connect with like-minded explorers. 
            Join discussions about your favorite artworks, exhibitions, and cultural experiences.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Forums List */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Discussion Forums</h2>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Create Topic
                </button>
              </div>
              
              <ForumList />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Recent Activity */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-500/30 rounded-full flex items-center justify-center text-xs text-white">
                      A
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        <span className="text-white">Alex</span> posted in <span className="text-purple-400">Modern Art Discussion</span>
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500/30 rounded-full flex items-center justify-center text-xs text-white">
                      M
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        <span className="text-white">Maya</span> liked a post in <span className="text-purple-400">Exhibition Reviews</span>
                      </p>
                      <p className="text-xs text-gray-500">4 hours ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500/30 rounded-full flex items-center justify-center text-xs text-white">
                      J
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        <span className="text-white">Jordan</span> started a new topic
                      </p>
                      <p className="text-xs text-gray-500">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Trending Topics</h3>
                <div className="space-y-3">
                  <div className="text-sm">
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                      The Future of Digital Art
                    </a>
                    <div className="text-xs text-gray-500 mt-1">42 replies</div>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Museum Accessibility Discussion
                    </a>
                    <div className="text-xs text-gray-500 mt-1">28 replies</div>
                  </div>
                  
                  <div className="text-sm">
                    <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors">
                      Your Aesthetic Evolution Journey
                    </a>
                    <div className="text-xs text-gray-500 mt-1">67 replies</div>
                  </div>
                </div>
              </div>

              {/* Community Guidelines */}
              <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Community Guidelines</h3>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• Be respectful and inclusive</li>
                  <li>• Stay on topic</li>
                  <li>• No spam or self-promotion</li>
                  <li>• Respect intellectual property</li>
                  <li>• Report inappropriate content</li>
                </ul>
                <a href="#" className="text-purple-400 hover:text-purple-300 text-sm mt-3 inline-block">
                  Read full guidelines →
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}