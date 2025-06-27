'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ImmersiveQuiz from '../../components/quiz/ImmersiveQuiz';
import IdentityCard from '../../components/identity/IdentityCard';
import VillageHome from '../../components/village/VillageHome';
import TokenSystem from '../../components/economy/TokenSystem';
import CardExchange from '../../components/village/CardExchange';

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState('quiz');
  const [userIdentity, setUserIdentity] = useState({
    type: 'LAEF',
    evolutionStage: 2,
    evolutionPoints: 156
  });

  const demos = [
    { id: 'quiz', name: '🎯 Immersive Quiz', description: 'Visual A/B choice quiz' },
    { id: 'card', name: '🎴 Identity Card', description: 'Evolving identity card' },
    { id: 'village', name: '🏘️ Village System', description: '4 art style clusters' },
    { id: 'tokens', name: '🪙 Token Economy', description: 'Quiz retake tokens' },
    { id: 'exchange', name: '🔄 Card Exchange', description: 'Social interactions' }
  ];

  const handleQuizComplete = (result: any) => {
    console.log('Quiz completed:', result);
    setUserIdentity({
      type: result.type,
      evolutionStage: 1,
      evolutionPoints: 0
    });
    setActiveDemo('card');
  };

  const handleTokenUpdate = (newBalance: number) => {
    console.log('Token balance updated:', newBalance);
  };

  const handleExchangeComplete = (result: any) => {
    console.log('Card exchange completed:', result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎨 SAYU Living Identity Demo
          </h1>
          <p className="text-xl text-purple-200">
            Experience the evolving art personality system
          </p>
        </div>

        {/* Demo Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {demos.map((demo) => (
            <motion.button
              key={demo.id}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeDemo === demo.id
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-purple-800/50 text-white hover:bg-purple-700/50'
              }`}
              onClick={() => setActiveDemo(demo.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg mb-1">{demo.name}</div>
              <div className="text-sm opacity-80">{demo.description}</div>
            </motion.button>
          ))}
        </div>

        {/* Current Identity Display */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/10 rounded-lg px-6 py-3 backdrop-blur-sm">
            <span className="text-white/80">Current Identity: </span>
            <span className="text-xl font-bold text-white">{userIdentity.type}</span>
            <span className="text-white/80 ml-4">Stage: {userIdentity.evolutionStage}</span>
            <span className="text-white/80 ml-4">Points: {userIdentity.evolutionPoints}</span>
          </div>
        </div>

        {/* Demo Content */}
        <motion.div
          key={activeDemo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {activeDemo === 'quiz' && (
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Immersive Art Personality Quiz
              </h2>
              <ImmersiveQuiz onComplete={handleQuizComplete} />
            </div>
          )}

          {activeDemo === 'card' && (
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Living Identity Card
              </h2>
              <div className="flex justify-center">
                <IdentityCard
                  identity={userIdentity}
                  evolutionStage={userIdentity.evolutionStage}
                  evolutionPoints={userIdentity.evolutionPoints}
                  journeyMarkers={[
                    {
                      date: '2024-01-15',
                      event: 'First Quiz Taken',
                      type: 'quiz',
                      impact: 'Identity Discovery'
                    },
                    {
                      date: '2024-01-16',
                      event: 'Joined Village',
                      type: 'community',
                      impact: 'Found Home'
                    }
                  ]}
                  customizations={{
                    motto: 'Art speaks in whispers',
                    badges: ['Quiz Master', 'Village Explorer']
                  }}
                />
              </div>
            </div>
          )}

          {activeDemo === 'village' && (
            <div className="bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white p-8 text-center">
                Village Community System
              </h2>
              <VillageHome 
                villageCode={userIdentity.type}
                userIdentity={userIdentity}
              />
            </div>
          )}

          {activeDemo === 'tokens' && (
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Quiz Token Economy
              </h2>
              <TokenSystem 
                userId="demo-user"
                onTokenUpdate={handleTokenUpdate}
              />
            </div>
          )}

          {activeDemo === 'exchange' && (
            <div className="bg-white/5 rounded-2xl p-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">
                Card Exchange System
              </h2>
              <CardExchange
                currentUser={{
                  identity: userIdentity
                }}
                onExchangeComplete={handleExchangeComplete}
              />
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-3">💡 Demo Instructions</h3>
            <div className="text-purple-200 space-y-2">
              <p>• Start with the <strong>Quiz</strong> to set your identity</p>
              <p>• View your <strong>Identity Card</strong> and customize it</p>
              <p>• Explore your <strong>Village</strong> community</p>
              <p>• Manage <strong>Tokens</strong> for quiz retakes</p>
              <p>• Try <strong>Card Exchange</strong> with other users</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}