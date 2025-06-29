'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePersonalizedTheme } from '@/hooks/usePersonalizedTheme';
import { useAchievements } from '@/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import { ThemeShowcase, ThemeIndicator } from '@/components/ui/theme-showcase';
import { ThemePreviewDemo, CurrentThemeInfo } from '@/components/ui/theme-preview';
import { AchievementStats } from '@/components/achievements/AchievementStats';
import { AchievementProgress } from '@/components/achievements/AchievementProgress';
import { AchievementBadge } from '@/components/achievements/AchievementBadge';
import { OAuthAccountManager } from '@/components/ui/oauth-account-manager';
import { ProfileCelebration } from '@/components/onboarding/ProfileCelebration';
import { Sparkles, Palette, Heart, Brain, Eye, Zap, ArrowLeft, Trophy, Award, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

// Dimensional comparison component
function DimensionalBars({ exhibitionScores }: { exhibitionScores: Record<string, number> }) {
  const dimensions = [
    {
      name: 'Experience Style',
      leftLabel: 'G',
      rightLabel: 'S', 
      leftFull: 'Grounded (Personal)',
      rightFull: 'Shared (Social)',
      leftScore: exhibitionScores.G || 0,
      rightScore: exhibitionScores.S || 0,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Art Preference',
      leftLabel: 'A',
      rightLabel: 'R',
      leftFull: 'Abstract (Conceptual)',
      rightFull: 'Realistic (Representational)',
      leftScore: exhibitionScores.A || 0,
      rightScore: exhibitionScores.R || 0,
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Engagement Approach',
      leftLabel: 'M',
      rightLabel: 'E',
      leftFull: 'Meaning (Analytical)',
      rightFull: 'Emotion (Intuitive)',
      leftScore: exhibitionScores.M || 0,
      rightScore: exhibitionScores.E || 0,
      color: 'from-emerald-500 to-teal-500'
    },
    {
      name: 'Space Navigation',
      leftLabel: 'F',
      rightLabel: 'C',
      leftFull: 'Flow (Open Wandering)',
      rightFull: 'Constructive (Structured)',
      leftScore: exhibitionScores.F || 0,
      rightScore: exhibitionScores.C || 0,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      {dimensions.map((dimension, index) => {
        const total = dimension.leftScore + dimension.rightScore;
        const leftPercentage = total > 0 ? (dimension.leftScore / total) * 100 : 50;
        const rightPercentage = total > 0 ? (dimension.rightScore / total) * 100 : 50;
        
        return (
          <motion.div
            key={dimension.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-white">{dimension.name}</h4>
              <div className="text-sm text-gray-400">
                {Math.round(leftPercentage)}% / {Math.round(rightPercentage)}%
              </div>
            </div>
            
            <div className="relative">
              {/* Progress bar container */}
              <div className="h-8 bg-gray-800 rounded-full overflow-hidden relative">
                {/* Left side (first dimension) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${leftPercentage}%` }}
                  transition={{ delay: 0.2 + (0.1 * index), duration: 0.8, ease: "easeOut" }}
                  className={`absolute left-0 top-0 h-full bg-gradient-to-r ${dimension.color} opacity-80`}
                />
                
                {/* Right side (second dimension) */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rightPercentage}%` }}
                  transition={{ delay: 0.2 + (0.1 * index), duration: 0.8, ease: "easeOut" }}
                  className={`absolute right-0 top-0 h-full bg-gradient-to-l ${dimension.color} opacity-60`}
                />
                
                {/* Center divider */}
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-600 transform -translate-x-0.5" />
              </div>
              
              {/* Labels */}
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{dimension.leftLabel}</span>
                  <span className="text-sm text-gray-400">{dimension.leftFull}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{dimension.rightFull}</span>
                  <span className="text-lg font-bold text-white">{dimension.rightLabel}</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface ProfileData {
  id: string;
  type_code: string;
  archetype_name: string;
  archetype_description: string;
  emotional_tags: string[];
  exhibition_scores: Record<string, number>;
  artwork_scores: Record<string, number>;
  ui_customization: {
    mode: string;
    pace: string;
    depth: string;
  };
  generated_image_url?: string;
  personality_confidence: number;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { achievements, stats, userProgress, loading: achievementsLoading } = useAchievements();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements'>('profile');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setProfile(data.profile);
    } catch (error) {
      toast.error('Failed to load profile');
      // If no profile exists, redirect to quiz
      router.push('/quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Profile Found</h2>
          <Button onClick={() => router.push('/quiz')} className="bg-purple-600 hover:bg-purple-700">
            Take the Quiz
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Your Aesthetic Profile</h1>
          <Button
            variant="ghost"
            onClick={() => router.push('/journey')}
            className="text-white hover:text-purple-400"
          >
            Back to Journey
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <ThemeIndicator />
            <h2 className="text-5xl md:text-7xl font-bold ml-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profile.archetype_name}
              </span>
            </h2>
          </div>
          <p className="text-xl text-gray-300 mb-6">{profile.archetype_description}</p>
          <div className="text-3xl font-mono text-purple-400 mb-8">{profile.type_code}</div>
        </motion.div>

        {/* Personalized Theme Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ThemeShowcase />
            </div>
            <div className="space-y-4">
              <CurrentThemeInfo />
              <ThemePreviewDemo />
            </div>
          </div>
        </motion.div>

        {/* Profile Image */}
        {profile.generated_image_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12 max-w-4xl mx-auto"
          >
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={profile.generated_image_url}
                alt="Your aesthetic profile visualization"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Emotional Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Your Emotional Spectrum</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {profile.emotional_tags.map((tag, index) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="px-4 py-2 bg-purple-900/50 backdrop-blur-sm rounded-full text-purple-200 border border-purple-700"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-1 border border-gray-700">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'profile'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab('achievements')}
                className={`px-6 py-3 rounded-lg transition-all ${
                  activeTab === 'achievements'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Trophy className="w-4 h-4 inline mr-2" />
                Achievements
                {stats && stats.total_achievements > 0 && (
                  <span className="ml-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                    {stats.total_achievements}
                  </span>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <>
        {/* Dimensional Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Personality Dimensions</h3>
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-800 max-w-4xl mx-auto">
            <DimensionalBars exhibitionScores={profile.exhibition_scores} />
          </div>
        </motion.div>

        {/* Detailed Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Exhibition Scores */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-purple-400" />
              Exhibition Preferences
            </h3>
            <div className="space-y-3">
              {Object.entries(profile.exhibition_scores).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Artwork Scores */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-400" />
              Artwork Preferences
            </h3>
            <div className="space-y-3">
              {Object.entries(profile.artwork_scores).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-400">{key}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Personalization Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-800 mb-12"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Your Personalization
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400 mb-1">UI Mode</div>
              <div className="text-lg font-semibold text-white capitalize">
                {profile.ui_customization.mode}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Pace</div>
              <div className="text-lg font-semibold text-white capitalize">
                {profile.ui_customization.pace}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Depth</div>
              <div className="text-lg font-semibold text-white capitalize">
                {profile.ui_customization.depth}
              </div>
            </div>
          </div>
        </motion.div>
          </>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-8">
            {/* Achievement Stats */}
            {stats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AchievementStats stats={stats} />
              </motion.div>
            )}

            {/* Recent Achievements */}
            {stats && stats.recent_achievements && stats.recent_achievements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Recent Achievements
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {stats.recent_achievements.map((achievement) => (
                    <div key={achievement.id} className="flex-shrink-0">
                      <AchievementBadge achievement={{...achievement, unlocked: true}} size="lg" showDetails />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Achievement Progress */}
            {!achievementsLoading && Object.keys(achievements).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <AchievementProgress achievements={achievements} userProgress={userProgress || undefined} />
              </motion.div>
            )}

            {achievementsLoading && (
              <div className="text-center py-12">
                <div className="text-white">Loading achievements...</div>
              </div>
            )}
          </div>
        )}

        {/* Account Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-800 mt-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Account Security
          </h3>
          <OAuthAccountManager />
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mt-12"
        >
          <Button
            onClick={() => router.push('/gallery')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Palette className="mr-2 w-4 h-4" />
            Explore Curated Art
          </Button>
          <Button
            onClick={() => router.push('/agent')}
            className="bg-pink-600 hover:bg-pink-700"
          >
            <Heart className="mr-2 w-4 h-4" />
            Chat with AI Curator
          </Button>
          <Button
            onClick={() => router.push('/quiz')}
            variant="outline"
            className="border-purple-600 text-purple-400 hover:bg-purple-600/20"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Retake Quiz
          </Button>
        </motion.div>
      </main>

      {profile && <ProfileCelebration profile={profile} />}
    </div>
  );
}