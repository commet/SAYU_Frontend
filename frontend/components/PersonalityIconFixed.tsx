'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface PersonalityIconProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
}

// Import all animal images statically
import foxLaef from '/public/images/personality-animals/main/fox-laef.png';
import catLaec from '/public/images/personality-animals/main/cat-laec.png';
import owlLamf from '/public/images/personality-animals/main/owl-lamf.png';
import turtleLamc from '/public/images/personality-animals/main/turtle-lamc.png';
import chameleonLref from '/public/images/personality-animals/main/chameleon-lref.png';
import hedgehogLrec from '/public/images/personality-animals/main/hedgehog-lrec.png';
import octopusLrmf from '/public/images/personality-animals/main/octopus-lrmf.png';
import beaverLrmc from '/public/images/personality-animals/main/beaver-lrmc.png';
import butterflySaef from '/public/images/personality-animals/main/butterfly-saef.png';
import penguinSaec from '/public/images/personality-animals/main/penguin-saec.png';
import parrotSamf from '/public/images/personality-animals/main/parrot-samf.png';
import deerSamc from '/public/images/personality-animals/main/deer-samc.png';
import dogSref from '/public/images/personality-animals/main/dog-sref.png';
import duckSrec from '/public/images/personality-animals/main/duck-srec.png';
import elephantSrmf from '/public/images/personality-animals/main/elephant-srmf.png';
import eagleSrmc from '/public/images/personality-animals/main/eagle-srmc.png';

// Map personality types to imported images
const animalImages: Record<string, any> = {
  LAEF: foxLaef,
  LAEC: catLaec,
  LAMF: owlLamf,
  LAMC: turtleLamc,
  LREF: chameleonLref,
  LREC: hedgehogLrec,
  LRMF: octopusLrmf,
  LRMC: beaverLrmc,
  SAEF: butterflySaef,
  SAEC: penguinSaec,
  SAMF: parrotSamf,
  SAMC: deerSamc,
  SREF: dogSref,
  SREC: duckSrec,
  SRMF: elephantSrmf,
  SRMC: eagleSrmc
};

const animalMappings: Record<string, { animal: string; emoji: string }> = {
  LAEF: { animal: 'fox', emoji: '🦊' },
  LAEC: { animal: 'cat', emoji: '🐱' },
  LAMF: { animal: 'owl', emoji: '🦉' },
  LAMC: { animal: 'turtle', emoji: '🐢' },
  LREF: { animal: 'chameleon', emoji: '🦎' },
  LREC: { animal: 'hedgehog', emoji: '🦔' },
  LRMF: { animal: 'octopus', emoji: '🐙' },
  LRMC: { animal: 'beaver', emoji: '🦫' },
  SAEF: { animal: 'butterfly', emoji: '🦋' },
  SAEC: { animal: 'penguin', emoji: '🐧' },
  SAMF: { animal: 'parrot', emoji: '🦜' },
  SAMC: { animal: 'deer', emoji: '🦌' },
  SREF: { animal: 'dog', emoji: '🐕' },
  SREC: { animal: 'duck', emoji: '🦆' },
  SRMF: { animal: 'elephant', emoji: '🐘' },
  SRMC: { animal: 'eagle', emoji: '🦅' }
};

const iconMappings: Record<string, { colors: string[]; symbol: string }> = {
  LAEF: { colors: ['#667eea', '#764ba2', '#f093fb'], symbol: '🌙' },
  LAEC: { colors: ['#4facfe', '#00f2fe', '#43e97b'], symbol: '🔍' },
  LAMF: { colors: ['#fa709a', '#fee140', '#ffb199'], symbol: '💭' },
  LAMC: { colors: ['#a8edea', '#fed6e3', '#fccb90'], symbol: '📚' },
  LREF: { colors: ['#ff9a9e', '#fecfef', '#fad0c4'], symbol: '💎' },
  LREC: { colors: ['#84fab0', '#8fd3f4', '#43e97b'], symbol: '⚗️' },
  LRMF: { colors: ['#fbc2eb', '#a6c1ee', '#f5f7fa'], symbol: '🔮' },
  LRMC: { colors: ['#e0e0e0', '#bdbdbd', '#9e9e9e'], symbol: '🔬' },
  SAEF: { colors: ['#f77062', '#fe5196', '#ff6b9d'], symbol: '✨' },
  SAEC: { colors: ['#96e6a1', '#d4fc79', '#43e97b'], symbol: '🎭' },
  SAMF: { colors: ['#ffeaa7', '#dfe6e9', '#74b9ff'], symbol: '🌟' },
  SAMC: { colors: ['#50cc7f', '#f5d100', '#0080ff'], symbol: '🎓' },
  SREF: { colors: ['#ff6e7f', '#bfe9ff', '#c7ecee'], symbol: '🤝' },
  SREC: { colors: ['#e8b4b8', '#a67c90', '#6c5ce7'], symbol: '⚙️' },
  SRMF: { colors: ['#ff758c', '#ff7eb3', '#ff6b9d'], symbol: '📖' },
  SRMC: { colors: ['#7028e4', '#e5b2ca', '#f9ca24'], symbol: '📊' }
};

export default function PersonalityIconFixed({ type, size = 'medium', animated = true }: PersonalityIconProps) {
  const [imageError, setImageError] = useState(false);
  const animalData = animalMappings[type];
  const animalImage = animalImages[type];
  
  const sizeMap = {
    small: 70,
    medium: 120,
    large: 160
  };
  
  const imageSize = sizeMap[size];

  // Use actual animal image if available - SIMPLE VERSION
  if (animalImage && animalData && !imageError) {
    return (
      <motion.div
        initial={animated ? { scale: 0.8, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        className="flex flex-col items-center justify-center"
      >
        {/* Simple centered image */}
        <img
          src={animalImage.src || animalImage}
          alt={`${animalData.animal} - ${type}`}
          width={imageSize}
          height={imageSize}
          className="object-contain"
          style={{
            maxWidth: `${imageSize}px`,
            maxHeight: `${imageSize}px`
          }}
          onError={() => {
            console.error('PersonalityIconFixed - Image failed to load for:', type);
            setImageError(true);
          }}
        />
      </motion.div>
    );
  }

  // Fallback to emoji version - SIMPLE VERSION
  const fontSize = {
    small: 'text-5xl',
    medium: 'text-7xl',
    large: 'text-8xl'
  };

  return (
    <motion.div
      initial={animated ? { scale: 0.8, opacity: 0 } : {}}
      animate={animated ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
      className="flex flex-col items-center justify-center"
    >
      <span className={fontSize[size]}>
        {animalData?.emoji || '🎨'}
      </span>
    </motion.div>
  );
}