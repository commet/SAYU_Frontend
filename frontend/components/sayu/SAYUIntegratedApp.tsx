// SAYU Integrated Application - Complete Quiz System
// Frontend: /frontend/components/sayu/SAYUIntegratedApp.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Home, Users, Trophy, User, ArrowLeft } from 'lucide-react';

// Import enhanced quiz component
import { EnhancedQuizComponent } from '../quiz/EnhancedQuizComponent';

// ==================== TYPES ====================

interface SAYUAppState {
  currentView: 'home' | 'quiz' | 'results' | 'community' | 'profile';
  isLoading: boolean;
  user: {
    id?: string;
    personalityType?: string;
    profile?: any;
  } | null;
}

interface QuizResult {
  personalityType: {
    code: string;
    name: string;
    description: string;
    characteristics: any;
    scene: any;
  };
  dimensions: any;
  confidence: any;
  recommendations: any;
}

// ==================== MAIN APPLICATION ====================

export const SAYUIntegratedApp: React.FC = () => {
  // Application state
  const [appState, setAppState] = useState<SAYUAppState>({
    currentView: 'home',
    isLoading: true,
    user: null
  });

  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Initialize app
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      // Check for saved user data
      const savedUser = localStorage.getItem('sayu_user');
      const savedResult = localStorage.getItem('sayu_quiz_result');

      if (savedUser) {
        setAppState(prev => ({ 
          ...prev, 
          user: JSON.parse(savedUser) 
        }));
      }

      if (savedResult) {
        setQuizResult(JSON.parse(savedResult));
      }

      setAppState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setAppState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Navigation
  const navigateTo = useCallback((view: SAYUAppState['currentView']) => {
    setAppState(prev => ({ ...prev, currentView: view }));
  }, []);

  // Quiz completion handler
  const handleQuizComplete = useCallback((result: any) => {
    const formattedResult: QuizResult = {
      personalityType: result.typeData || result.personalityType,
      dimensions: result.dimensions,
      confidence: result.confidence,
      recommendations: result.recommendations
    };

    setQuizResult(formattedResult);
    
    // Save to localStorage
    localStorage.setItem('sayu_quiz_result', JSON.stringify(formattedResult));
    
    // Update user profile
    const updatedUser = {
      ...appState.user,
      personalityType: formattedResult.personalityType.code,
      profile: formattedResult
    };
    
    setAppState(prev => ({ ...prev, user: updatedUser }));
    localStorage.setItem('sayu_user', JSON.stringify(updatedUser));
    
    // Navigate to results
    navigateTo('results');
  }, [appState.user, navigateTo]);

  // Render loading screen
  if (appState.isLoading) {
    return <LoadingScreen />;
  }

  // Render current view
  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'home':
        return (
          <HomeView 
            user={appState.user}
            hasCompletedQuiz={!!quizResult}
            onStartQuiz={() => navigateTo('quiz')}
            onViewResults={() => navigateTo('results')}
            onViewCommunity={() => navigateTo('community')}
            onViewProfile={() => navigateTo('profile')}
          />
        );

      case 'quiz':
        return (
          <QuizView 
            onComplete={handleQuizComplete}
            onBack={() => navigateTo('home')}
          />
        );

      case 'results':
        return (
          <ResultsView 
            result={quizResult}
            onBack={() => navigateTo('home')}
            onRetakeQuiz={() => navigateTo('quiz')}
            onViewCommunity={() => navigateTo('community')}
          />
        );

      case 'community':
        return (
          <CommunityView 
            userType={quizResult?.personalityType}
            onBack={() => navigateTo('home')}
          />
        );

      case 'profile':
        return (
          <ProfileView 
            user={appState.user}
            result={quizResult}
            onBack={() => navigateTo('home')}
            onRetakeQuiz={() => navigateTo('quiz')}
          />
        );

      default:
        return <HomeView user={appState.user} hasCompletedQuiz={false} onStartQuiz={() => navigateTo('quiz')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <AnimatePresence mode="wait">
        {renderCurrentView()}
      </AnimatePresence>
      
      {/* Mobile Navigation */}
      <MobileBottomNavigation 
        currentView={appState.currentView}
        onNavigate={navigateTo}
        hasCompletedQuiz={!!quizResult}
      />
    </div>
  );
};

// ==================== VIEW COMPONENTS ====================

const HomeView: React.FC<{
  user: any;
  hasCompletedQuiz: boolean;
  onStartQuiz: () => void;
  onViewResults?: () => void;
  onViewCommunity?: () => void;
  onViewProfile?: () => void;
}> = ({ user, hasCompletedQuiz, onStartQuiz, onViewResults, onViewCommunity, onViewProfile }) => {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="text-center max-w-4xl w-full">
        {/* Hero Section */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SAYU
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Personalized Art Exploration Infrastructure
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Discover your unique art viewing personality through an immersive journey. 
            Connect with like-minded art lovers and explore curated recommendations.
          </p>
        </motion.div>

        {/* User Status */}
        {user?.personalityType && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8 p-6 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20"
          >
            <h3 className="text-2xl font-semibold text-white mb-2">
              Welcome back, {user.personalityType}!
            </h3>
            <p className="text-gray-300">
              You're a {user.profile?.personalityType?.name}
            </p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {!hasCompletedQuiz ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartQuiz}
              className="w-full max-w-md mx-auto block px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-3">
                <Sparkles className="w-6 h-6" />
                Discover Your Art Personality
              </span>
            </motion.button>
          ) : (
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewResults}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                View Your Results
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onStartQuiz}
                className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                Retake Quiz
              </motion.button>
            </div>
          )}

          {/* Secondary Actions */}
          {hasCompletedQuiz && (
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewCommunity}
                className="px-6 py-3 bg-white/5 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 border border-white/10"
              >
                Join Community
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onViewProfile}
                className="px-6 py-3 bg-white/5 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300 border border-white/10"
              >
                View Profile
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <FeatureCard
            title="16 Personality Types"
            description="Discover your unique art viewing style"
            icon="🎨"
          />
          <FeatureCard
            title="Smart Recommendations"
            description="Get personalized exhibition suggestions"
            icon="🧠"
          />
          <FeatureCard
            title="Art Community"
            description="Connect with like-minded art lovers"
            icon="👥"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

const QuizView: React.FC<{
  onComplete: (result: any) => void;
  onBack: () => void;
}> = ({ onComplete, onBack }) => {
  return (
    <motion.div
      key="quiz"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="relative"
    >
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onBack}
        className="fixed top-4 left-4 z-50 p-3 bg-black/50 backdrop-blur-lg rounded-full text-white hover:bg-black/70 transition-colors border border-white/20"
      >
        <ArrowLeft className="w-5 h-5" />
      </motion.button>

      {/* Enhanced Quiz Component */}
      <EnhancedQuizComponent onComplete={onComplete} />
    </motion.div>
  );
};

const ResultsView: React.FC<{
  result: QuizResult | null;
  onBack: () => void;
  onRetakeQuiz: () => void;
  onViewCommunity: () => void;
}> = ({ result, onBack, onRetakeQuiz, onViewCommunity }) => {
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-white">No results found. Please take the quiz first.</p>
      </div>
    );
  }

  const handleShare = () => {
    const shareData = {
      title: `I'm a ${result.personalityType.name}!`,
      text: `Discover your art personality with SAYU`,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-screen flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            You're a {result.personalityType.name}!
          </h1>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
            <span className="text-2xl font-bold text-white">{result.personalityType.code}</span>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 mb-8"
        >
          <p className="text-xl text-gray-300 text-center leading-relaxed">
            {result.personalityType.description}
          </p>
        </motion.div>

        {/* Characteristics */}
        {result.personalityType.characteristics?.primary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-semibold text-white mb-4 text-center">Your Characteristics</h3>
            <div className="flex flex-wrap gap-3 justify-center">
              {result.personalityType.characteristics.primary.map((trait: string) => (
                <span 
                  key={trait} 
                  className="px-4 py-2 bg-indigo-500/20 rounded-full text-indigo-300 font-medium"
                >
                  {trait}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col md:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={handleShare}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            Share Your Result
          </button>
          
          <button
            onClick={onViewCommunity}
            className="px-8 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Join Community
          </button>
          
          <button
            onClick={onRetakeQuiz}
            className="px-8 py-3 bg-white/5 text-white rounded-full font-medium hover:bg-white/10 transition-all duration-300"
          >
            Retake Quiz
          </button>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const CommunityView: React.FC<{
  userType: any;
  onBack: () => void;
}> = ({ userType, onBack }) => {
  return (
    <motion.div
      key="community"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-4 pb-20"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Art Community</h1>
          <p className="text-gray-300">Connect with fellow art enthusiasts who share your viewing style</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Your Type Community */}
          {userType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30"
            >
              <h3 className="text-xl font-semibold text-white mb-3">Your Community</h3>
              <div className="mb-4">
                <p className="text-2xl font-bold text-white">{userType.name}</p>
                <p className="text-gray-300">{userType.code}</p>
              </div>
              <p className="text-gray-300 mb-4">
                Connect with fellow {userType.name}s and share your art discoveries
              </p>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors">
                Join Discussion
              </button>
            </motion.div>
          )}

          {/* Recent Discoveries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Recent Discoveries</h3>
            <div className="space-y-4">
              {[
                { user: 'LAEF', discovery: 'Infinite Mirrors Exhibition', time: '2 hours ago' },
                { user: 'SRMC', discovery: 'Renaissance Masters Collection', time: '4 hours ago' },
                { user: 'SAEF', discovery: 'Interactive Digital Art Space', time: '6 hours ago' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{item.user}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-semibold">{item.user}</span> discovered "{item.discovery}"
                    </p>
                    <p className="text-sm text-gray-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* All Communities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 rounded-2xl p-6 border border-white/10"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Explore All Types</h3>
            <div className="space-y-2">
              {['LAEF', 'SRMC', 'SAEF', 'LRMF'].map((type) => (
                <button
                  key={type}
                  className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-white font-medium">{type}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );
};

const ProfileView: React.FC<{
  user: any;
  result: QuizResult | null;
  onBack: () => void;
  onRetakeQuiz: () => void;
}> = ({ user, result, onBack, onRetakeQuiz }) => {
  return (
    <motion.div
      key="profile"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-4 pb-20"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Your Profile</h1>
        </motion.div>

        {result ? (
          <div className="space-y-6">
            {/* Personality Type Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl p-6 border border-indigo-500/30"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                {result.personalityType.name}
              </h2>
              <p className="text-xl text-gray-300 mb-4">{result.personalityType.code}</p>
              <p className="text-gray-300">
                {result.personalityType.description}
              </p>
            </motion.div>

            {/* Quiz Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 rounded-2xl p-6 border border-white/10"
            >
              <h3 className="text-xl font-semibold text-white mb-4">Quiz Statistics</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Confidence Level</p>
                  <p className="text-2xl font-bold text-white">
                    {result.confidence?.overall?.toFixed(1) || 'N/A'}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Completed</p>
                  <p className="text-2xl font-bold text-white">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4"
            >
              <button
                onClick={onRetakeQuiz}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Retake Quiz
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center"
          >
            <p className="text-gray-400 mb-4">No quiz results found</p>
            <button
              onClick={onRetakeQuiz}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
            >
              Take Quiz
            </button>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onBack}
          className="mt-8 inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );
};

// ==================== UTILITY COMPONENTS ====================

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
    <motion.div
      animate={{ 
        rotate: 360,
        scale: [1, 1.2, 1]
      }}
      transition={{ 
        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
        scale: { duration: 1, repeat: Infinity }
      }}
    >
      <Sparkles className="w-12 h-12 text-purple-400" />
    </motion.div>
  </div>
);

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: string;
}> = ({ title, description, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </motion.div>
);

const MobileBottomNavigation: React.FC<{
  currentView: string;
  onNavigate: (view: any) => void;
  hasCompletedQuiz: boolean;
}> = ({ currentView, onNavigate, hasCompletedQuiz }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quiz', label: 'Quiz', icon: Sparkles },
    { id: 'community', label: 'Community', icon: Users, disabled: !hasCompletedQuiz },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 z-40 md:hidden"
    >
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentView === tab.id;
          const isDisabled = tab.disabled;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.9 }}
              onClick={() => !isDisabled && onNavigate(tab.id)}
              disabled={isDisabled}
              className={`flex flex-col items-center gap-1 p-3 relative ${
                isDisabled ? 'opacity-40' : ''
              }`}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#8B5CF6' : '#9CA3AF'
                }}
              >
                <Icon className="w-5 h-5" />
              </motion.div>
              
              <span className={`text-xs ${isActive ? 'text-purple-500' : 'text-gray-400'}`}>
                {tab.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -inset-x-2 -inset-y-1 bg-purple-500/10 rounded-xl -z-10"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SAYUIntegratedApp;