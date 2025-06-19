import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EvolutionTracker from './EvolutionTracker';
import JourneyTimeline from './JourneyTimeline';

const IdentityCard = ({ 
  identity, 
  evolutionStage = 1, 
  evolutionPoints = 0,
  journeyMarkers = [],
  customizations = {},
  onUpdate 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [motto, setMotto] = useState(customizations.motto || '');

  // Identity type configurations
  const identityConfig = {
    L: { 
      name: 'Lone Wanderer',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      symbol: '🌙',
      village: 'Dreamweaver Haven'
    },
    S: { 
      name: 'Social Butterfly',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      symbol: '🦋',
      village: 'Community Plaza'
    },
    A: { 
      name: 'Aesthetic Dreamer',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      symbol: '🎨',
      village: 'Artist Quarter'
    },
    R: { 
      name: 'Rational Scholar',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      symbol: '🔍',
      village: 'Scholar Symposium'
    }
  };

  const getIdentityInfo = (type) => {
    if (type.length === 4) {
      const primary = identityConfig[type[0]] || identityConfig.L;
      return {
        ...primary,
        name: `${type} Explorer`,
        village: getVillageName(type)
      };
    }
    return identityConfig[type] || identityConfig.L;
  };

  const getVillageName = (type) => {
    const personalityToCluster = {
      // 🏛️ Contemplative Sanctuary
      'LAEF': 'Contemplative Sanctuary',
      'LAMF': 'Contemplative Sanctuary', 
      'LREF': 'Contemplative Sanctuary',
      'LRMF': 'Contemplative Sanctuary',
      
      // 📚 Academic Forum
      'LRMC': 'Academic Forum',
      'LREC': 'Academic Forum',
      'SRMC': 'Academic Forum', 
      'SREC': 'Academic Forum',
      
      // 🎭 Social Gallery
      'SAEF': 'Social Gallery',
      'SAEC': 'Social Gallery',
      'SREF': 'Social Gallery',
      'SREC': 'Social Gallery',
      
      // ✨ Creative Studio
      'LAMC': 'Creative Studio',
      'LAMF': 'Creative Studio',
      'SAMC': 'Creative Studio',
      'SAMF': 'Creative Studio'
    };
    return personalityToCluster[type] || 'Contemplative Sanctuary';
  };

  const handleMottoSave = () => {
    setIsEditing(false);
    onUpdate?.({ motto });
  };

  const identityInfo = getIdentityInfo(identity.type);

  return (
    <div className="identity-card-container">
      <style jsx>{`
        .identity-card-container {
          perspective: 1000px;
          width: 400px;
          height: 600px;
          margin: 20px auto;
        }

        .card {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.6s;
          cursor: pointer;
        }

        .card.flipped {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          padding: 30px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
        }

        .card-front {
          background: ${identityInfo.gradient};
          color: white;
        }

        .card-back {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          transform: rotateY(180deg);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .identity-code {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 2px;
        }

        .evolution-stage {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 14px;
        }

        .stage-number {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .visual-identity {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin: 30px 0;
        }

        .identity-symbol {
          font-size: 80px;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .identity-name {
          font-size: 24px;
          font-weight: 300;
          text-align: center;
          margin-bottom: 10px;
        }

        .village-name {
          font-size: 16px;
          opacity: 0.8;
          font-style: italic;
          text-align: center;
        }

        .customization-zone {
          margin: 20px 0;
        }

        .motto-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .motto-display {
          font-size: 16px;
          font-style: italic;
          padding: 10px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          min-height: 20px;
          cursor: pointer;
          transition: background 0.3s;
        }

        .motto-display:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .motto-input {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.9);
          color: #333;
          font-size: 16px;
          font-style: italic;
          text-align: center;
        }

        .badges {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .flip-hint {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 12px;
          opacity: 0.7;
          text-align: center;
        }

        .back-content {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .back-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .back-title {
          font-size: 24px;
          margin-bottom: 10px;
        }

        .progress-section {
          flex: 1;
        }

        @media (max-width: 480px) {
          .identity-card-container {
            width: 350px;
            height: 550px;
          }

          .card-front, .card-back {
            padding: 20px;
          }

          .identity-code {
            font-size: 28px;
          }

          .identity-symbol {
            font-size: 60px;
          }
        }
      `}</style>

      <motion.div 
        className={`card ${isFlipped ? 'flipped' : ''}`}
        onClick={() => setIsFlipped(!isFlipped)}
        whileHover={{ scale: 1.02 }}
      >
        {/* Front of Card */}
        <div className="card-front">
          {/* Header */}
          <div className="card-header">
            <div className="identity-code">
              {identity.type}
            </div>
            <div className="evolution-stage">
              <div className="stage-number">{evolutionStage}</div>
              <div>STAGE</div>
            </div>
          </div>

          {/* Visual Identity */}
          <div className="visual-identity">
            <motion.div 
              className="identity-symbol"
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity 
              }}
            >
              {identityInfo.symbol}
            </motion.div>
            <div className="identity-name">
              {identityInfo.name}
            </div>
            <div className="village-name">
              {identityInfo.village}
            </div>
          </div>

          {/* Customization Zone */}
          <div className="customization-zone">
            <div className="motto-section">
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    className="motto-input"
                    value={motto}
                    onChange={(e) => setMotto(e.target.value)}
                    onBlur={handleMottoSave}
                    onKeyPress={(e) => e.key === 'Enter' && handleMottoSave()}
                    placeholder="Your art motto..."
                    maxLength={50}
                    autoFocus
                  />
                </div>
              ) : (
                <div 
                  className="motto-display"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  {motto || '“Click to add your motto”'}
                </div>
              )}
            </div>

            <div className="badges">
              {customizations.badges?.map((badge, index) => (
                <span key={index} className="badge">
                  {badge}
                </span>
              )) || (
                <span className="badge">Beginner</span>
              )}
            </div>
          </div>

          <div className="flip-hint">
            Click to see your journey →
          </div>
        </div>

        {/* Back of Card */}
        <div className="card-back">
          <div className="back-content">
            <div className="back-header">
              <h3 className="back-title">My Art Journey</h3>
            </div>
            
            <div className="progress-section">
              <EvolutionTracker 
                currentPoints={evolutionPoints}
                stage={evolutionStage}
                maxPoints={100}
              />
              
              <JourneyTimeline 
                markers={journeyMarkers}
                compact={true}
              />
            </div>

            <div className="flip-hint">
              ← Click to return to card
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IdentityCard;