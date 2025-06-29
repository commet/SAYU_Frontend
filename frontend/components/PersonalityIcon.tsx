'use client';

import { motion } from 'framer-motion';

interface PersonalityIconProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

const iconMappings: Record<string, { colors: string[]; shapes: string[]; symbol: string }> = {
  // L-A-E-F: The Dreaming Wanderer
  LAEF: {
    colors: ['#667eea', '#764ba2', '#f093fb'],
    shapes: ['circle', 'wave', 'star'],
    symbol: '🌙'
  },
  // L-A-E-C: The Intuitive Analyst
  LAEC: {
    colors: ['#4facfe', '#00f2fe', '#43e97b'],
    shapes: ['hexagon', 'grid', 'circle'],
    symbol: '🔍'
  },
  // L-A-M-F: The Philosophical Drifter
  LAMF: {
    colors: ['#fa709a', '#fee140', '#ffb199'],
    shapes: ['spiral', 'circle', 'triangle'],
    symbol: '💭'
  },
  // L-A-M-C: The Contemplative Scholar
  LAMC: {
    colors: ['#a8edea', '#fed6e3', '#fccb90'],
    shapes: ['square', 'book', 'circle'],
    symbol: '📚'
  },
  // L-R-E-F: The Emotional Purist
  LREF: {
    colors: ['#ff9a9e', '#fecfef', '#fad0c4'],
    shapes: ['heart', 'circle', 'drop'],
    symbol: '💎'
  },
  // L-R-E-C: The Methodical Emotionalist
  LREC: {
    colors: ['#84fab0', '#8fd3f4', '#43e97b'],
    shapes: ['diamond', 'grid', 'heart'],
    symbol: '⚗️'
  },
  // L-R-M-F: The Solitary Interpreter
  LRMF: {
    colors: ['#fbc2eb', '#a6c1ee', '#f5f7fa'],
    shapes: ['lens', 'frame', 'circle'],
    symbol: '🔮'
  },
  // L-R-M-C: The Detailed Researcher
  LRMC: {
    colors: ['#e0e0e0', '#bdbdbd', '#9e9e9e'],
    shapes: ['magnifier', 'grid', 'square'],
    symbol: '🔬'
  },
  // S-A-E-F: The Social Dreamer
  SAEF: {
    colors: ['#f77062', '#fe5196', '#ff6b9d'],
    shapes: ['people', 'heart', 'star'],
    symbol: '✨'
  },
  // S-A-E-C: The Collaborative Curator
  SAEC: {
    colors: ['#96e6a1', '#d4fc79', '#43e97b'],
    shapes: ['network', 'circle', 'hexagon'],
    symbol: '🎭'
  },
  // S-A-M-F: The Inspirational Guide
  SAMF: {
    colors: ['#ffeaa7', '#dfe6e9', '#74b9ff'],
    shapes: ['lighthouse', 'star', 'arrow'],
    symbol: '🌟'
  },
  // S-A-M-C: The Systematic Teacher
  SAMC: {
    colors: ['#50cc7f', '#f5d100', '#0080ff'],
    shapes: ['board', 'network', 'book'],
    symbol: '🎓'
  },
  // S-R-E-F: The Authentic Connector
  SREF: {
    colors: ['#ff6e7f', '#bfe9ff', '#c7ecee'],
    shapes: ['bridge', 'heart', 'hands'],
    symbol: '🤝'
  },
  // S-R-E-C: The Technical Discussant
  SREC: {
    colors: ['#e8b4b8', '#a67c90', '#6c5ce7'],
    shapes: ['gears', 'speech', 'network'],
    symbol: '⚙️'
  },
  // S-R-M-F: The Community Storyteller
  SRMF: {
    colors: ['#ff758c', '#ff7eb3', '#ff6b9d'],
    shapes: ['book', 'people', 'speech'],
    symbol: '📖'
  },
  // S-R-M-C: The Systematic Lecturer
  SRMC: {
    colors: ['#7028e4', '#e5b2ca', '#f9ca24'],
    shapes: ['podium', 'chart', 'network'],
    symbol: '📊'
  }
};

export default function PersonalityIcon({ type, size = 'medium', animated = true }: PersonalityIconProps) {
  const iconData = iconMappings[type] || iconMappings.LAEF;
  
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };
  
  const fontSize = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  return (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : {}}
      animate={animated ? { scale: 1, rotate: 0 } : {}}
      transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      className={`${sizeClasses[size]} relative`}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${iconData.colors.join(', ')})`,
          filter: 'blur(8px)',
          opacity: 0.6
        }}
      />
      
      {/* Main icon container */}
      <div
        className="relative w-full h-full rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${iconData.colors[0]}, ${iconData.colors[1]})`
        }}
      >
        {/* Decorative shapes */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          style={{ opacity: 0.2 }}
        >
          {iconData.shapes[0] === 'circle' && (
            <circle cx="30" cy="30" r="10" fill="white" />
          )}
          {iconData.shapes[0] === 'hexagon' && (
            <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="white" />
          )}
          {iconData.shapes[0] === 'square' && (
            <rect x="20" y="20" width="60" height="60" fill="white" />
          )}
          {iconData.shapes[0] === 'heart' && (
            <path d="M50,25 C50,15 40,5 30,15 C20,5 10,15 10,25 C10,35 30,55 50,75 C70,55 90,35 90,25 C90,15 80,5 70,15 C60,5 50,15 50,25 Z" fill="white" />
          )}
        </svg>
        
        {/* Symbol */}
        <motion.span
          className={`${fontSize[size]} z-10`}
          animate={animated ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        >
          {iconData.symbol}
        </motion.span>
      </div>
      
      {/* Type label */}
      <motion.div
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.5 }}
        className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
      >
        {type}
      </motion.div>
    </motion.div>
  );
}