import React, { useState } from 'react';
import { motion } from 'framer-motion';

const QuizVisuals = ({ choice, isSelected, onSelect, disabled }) => {
  const [isHovered, setIsHovered] = useState(false);

  const gradientColors = choice.visual.gradient || ['#667eea', '#764ba2'];
  const gradient = `linear-gradient(135deg, ${gradientColors.join(', ')})`;

  const iconMap = {
    users: '👥',
    moon: '🌙',
    sun: '☀️',
    heart: '❤️',
    brain: '🧠',
    palette: '🎨',
    book: '📚',
    compass: '🧭',
    star: '⭐',
    wave: '🌊'
  };

  const animationMap = {
    pulse_warm: {
      scale: [1, 1.05, 1],
      filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)'],
      transition: { duration: 2, repeat: Infinity }
    },
    shimmer_cool: {
      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      transition: { duration: 3, repeat: Infinity }
    },
    float: {
      y: [0, -10, 0],
      transition: { duration: 2.5, repeat: Infinity }
    },
    rotate: {
      rotate: [0, 5, -5, 0],
      transition: { duration: 4, repeat: Infinity }
    }
  };

  return (
    <motion.div
      className="visual-choice-card"
      style={{ background: gradient }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !disabled && onSelect()}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={{
        ...(!disabled && choice.visual.animation ? animationMap[choice.visual.animation] : {}),
        opacity: disabled && !isSelected ? 0.5 : 1,
        scale: isSelected ? 1.1 : 1
      }}
    >
      <style jsx>{`
        .visual-choice-card {
          width: 280px;
          height: 350px;
          border-radius: 20px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: ${disabled ? 'default' : 'pointer'};
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          transition: all 0.3s ease;
        }

        .visual-choice-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }

        .visual-choice-card:hover::before {
          transform: translateX(100%);
        }

        .choice-icon {
          font-size: 80px;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .choice-label {
          font-size: 18px;
          color: white;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.9;
        }

        .hover-text {
          position: absolute;
          bottom: 30px;
          font-size: 16px;
          color: white;
          opacity: 0;
          transition: opacity 0.3s ease;
          font-style: italic;
        }

        .visual-choice-card:hover .hover-text {
          opacity: 1;
        }

        .selection-indicator {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .selected .selection-indicator {
          opacity: 1;
        }

        @media (max-width: 768px) {
          .visual-choice-card {
            width: 240px;
            height: 300px;
            padding: 30px;
          }

          .choice-icon {
            font-size: 60px;
          }
        }
      `}</style>

      {/* Icon */}
      <div className="choice-icon">
        {iconMap[choice.visual.icon] || '🎨'}
      </div>

      {/* Label */}
      <div className="choice-label">
        {choice.id}
      </div>

      {/* Hover Text */}
      <div className="hover-text">
        {choice.hover_text}
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="selection-indicator">
          ✓
        </div>
      )}
    </motion.div>
  );
};

export default QuizVisuals;