import React from 'react';
import { motion } from 'framer-motion';

const EvolutionTracker = ({ currentPoints, stage, maxPoints = 100 }) => {
  const progress = (currentPoints / maxPoints) * 100;
  const isEvolutionReady = currentPoints >= maxPoints;

  return (
    <div className="evolution-tracker">
      <style jsx>{`
        .evolution-tracker {
          margin: 20px 0;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .points-display {
          font-size: 18px;
          font-weight: bold;
        }

        .evolution-status {
          font-size: 14px;
          padding: 5px 10px;
          border-radius: 12px;
          font-weight: 500;
        }

        .status-brewing {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
        }

        .status-ready {
          background: rgba(40, 167, 69, 0.2);
          color: #28a745;
          animation: pulse 2s infinite;
        }

        .status-growing {
          background: rgba(108, 117, 125, 0.2);
          color: #6c757d;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .progress-container {
          position: relative;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 15px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
          position: relative;
        }

        .progress-bar.ready {
          background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: translateX(-100%);
          animation: slide 2s infinite;
        }

        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .milestones {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .milestone {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
        }

        .milestone-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 5px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .milestone.reached .milestone-icon {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          transform: scale(1.1);
        }

        .milestone.current .milestone-icon {
          background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%);
          color: white;
          animation: pulse 2s infinite;
        }

        .milestone.future .milestone-icon {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }

        .evolution-hint {
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-top: 10px;
        }

        .evolution-hint.ready {
          color: #28a745;
          font-weight: bold;
        }
      `}</style>

      <div className="tracker-header">
        <div className="points-display">
          {currentPoints}/{maxPoints} Evolution Points
        </div>
        <div className={`evolution-status ${
          isEvolutionReady ? 'status-ready' : 
          currentPoints >= 80 ? 'status-brewing' : 'status-growing'
        }`}>
          {isEvolutionReady ? 'Ready to Evolve!' : 
           currentPoints >= 80 ? 'Evolution Brewing' : 'Growing'}
        </div>
      </div>

      <div className="progress-container">
        <motion.div 
          className={`progress-bar ${isEvolutionReady ? 'ready' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      <div className="milestones">
        {[1, 2, 3, 4, 5].map((milestoneStage) => {
          const isReached = stage > milestoneStage;
          const isCurrent = stage === milestoneStage;
          const isFuture = stage < milestoneStage;
          
          return (
            <div 
              key={milestoneStage}
              className={`milestone ${
                isReached ? 'reached' : 
                isCurrent ? 'current' : 'future'
              }`}
            >
              <div className="milestone-icon">
                {isReached ? '✓' : milestoneStage}
              </div>
              <div>Stage {milestoneStage}</div>
            </div>
          );
        })}
      </div>

      <div className={`evolution-hint ${isEvolutionReady ? 'ready' : ''}`}>
        {isEvolutionReady ? 
          'Take the quiz again to discover your evolved identity!' :
          `${maxPoints - currentPoints} more points to next evolution`
        }
      </div>
    </div>
  );
};

export default EvolutionTracker;