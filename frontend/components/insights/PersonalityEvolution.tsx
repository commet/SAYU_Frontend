'use client';

import { motion } from 'framer-motion';
import { ArrowRight, User, Zap } from 'lucide-react';

interface PersonalityEvolutionProps {
  evolution: string[];
}

export default function PersonalityEvolution({ evolution }: PersonalityEvolutionProps) {
  if (!evolution || evolution.length <= 1) {
    return null;
  }

  const getPersonalityDescription = (type: string) => {
    const descriptions = {
      'VISIONARY': 'Big picture thinker who sees art as transformative',
      'EXPLORER': 'Adventurous spirit seeking new artistic frontiers',
      'CURATOR': 'Thoughtful collector with refined aesthetic sense',
      'SOCIAL': 'Community-minded art enthusiast who loves sharing'
    };

    return descriptions[type] || 'Unique aesthetic personality';
  };

  const getPersonalityColor = (type: string) => {
    const colors = {
      'VISIONARY': 'from-purple-500 to-indigo-600',
      'EXPLORER': 'from-orange-500 to-red-600', 
      'CURATOR': 'from-green-500 to-teal-600',
      'SOCIAL': 'from-pink-500 to-rose-600'
    };

    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="bg-card border rounded-2xl p-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-purple-600" />
          Personality Evolution
        </h2>
        <p className="text-muted-foreground">
          How your aesthetic personality has grown and changed
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {evolution.map((type, index) => (
          <div key={index} className="flex items-center">
            {/* Personality Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.2 }}
              className={`relative px-6 py-4 rounded-xl bg-gradient-to-r ${getPersonalityColor(type)} 
                         text-white shadow-lg`}
            >
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4" />
                <span className="font-bold text-lg">{type}</span>
              </div>
              <p className="text-xs opacity-90">
                {getPersonalityDescription(type)}
              </p>

              {/* Badge number */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-800 
                            rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
            </motion.div>

            {/* Arrow */}
            {index < evolution.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 + 0.1 }}
                className="mx-2"
              >
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Evolution Insights */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: evolution.length * 0.2 + 0.3 }}
        className="mt-8 p-4 bg-secondary/30 rounded-xl"
      >
        <h3 className="font-semibold mb-2">Your Growth Story</h3>
        <p className="text-sm text-muted-foreground">
          {evolution.length === 2 ? (
            `You've evolved from a ${evolution[0]} to a ${evolution[1]}, showing how your relationship with art has deepened and changed.`
          ) : evolution.length === 3 ? (
            `Your journey from ${evolution[0]} → ${evolution[1]} → ${evolution[2]} shows a rich evolution in how you experience and appreciate art.`
          ) : (
            `Your personality has gone through ${evolution.length} distinct phases, each revealing new aspects of your aesthetic identity.`
          )}
        </p>

        {/* Growth Direction */}
        <div className="mt-3 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Growth Direction:</span>
          <span className="font-medium">
            {getGrowthDirection(evolution[0], evolution[evolution.length - 1])}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

function getGrowthDirection(start: string, end: string) {
  const directions = {
    'VISIONARY_EXPLORER': 'From vision to action',
    'VISIONARY_CURATOR': 'From dreams to discernment', 
    'VISIONARY_SOCIAL': 'From individual insight to community leadership',
    'EXPLORER_CURATOR': 'From discovery to refinement',
    'EXPLORER_SOCIAL': 'From solo adventures to shared journeys',
    'CURATOR_SOCIAL': 'From private appreciation to public sharing',
    'EXPLORER_VISIONARY': 'From exploration to enlightenment',
    'CURATOR_VISIONARY': 'From collection to creation',
    'SOCIAL_VISIONARY': 'From community to leadership',
    'CURATOR_EXPLORER': 'From refinement to adventure',
    'SOCIAL_EXPLORER': 'From sharing to discovering',
    'SOCIAL_CURATOR': 'From social to sophisticated'
  };

  const key = `${start}_${end}`;
  return directions[key] || 'Evolving aesthetic identity';
}