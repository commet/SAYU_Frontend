import React from 'react';
import { motion } from 'framer-motion';

const JourneyTimeline = ({ markers = [], compact = false }) => {
  const timelineMarkers = markers.length > 0 ? markers : [
    {
      date: '2024-01',
      event: 'First Quiz Taken',
      type: 'quiz',
      impact: 'Identity Discovery'
    },
    {
      date: '2024-01',
      event: 'Joined Village',
      type: 'community',
      impact: 'Found Home'
    }
  ];

  const getEventIcon = (type) => {
    const icons = {
      quiz: '📝',
      gallery: '🏢',
      community: '👥',
      evolution: '🎆',
      achievement: '🏆',
      artwork: '🎨'
    };
    return icons[type] || '✨';
  };

  const getEventColor = (type) => {
    const colors = {
      quiz: '#667eea',
      gallery: '#4facfe',
      community: '#f093fb',
      evolution: '#43e97b',
      achievement: '#ffc107',
      artwork: '#ff6b6b'
    };
    return colors[type] || '#6c757d';
  };

  return (
    <div className="journey-timeline">
      <style jsx>{`
        .journey-timeline {
          margin: 20px 0;
        }

        .timeline-header {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }

        .timeline-container {
          position: relative;
          max-height: ${compact ? '200px' : '300px'};
          overflow-y: auto;
          padding-right: 10px;
        }

        .timeline-container::-webkit-scrollbar {
          width: 4px;
        }

        .timeline-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }

        .timeline-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
        }

        .timeline-line {
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(to bottom, #667eea, #764ba2);
        }

        .timeline-item {
          position: relative;
          padding-left: 50px;
          margin-bottom: ${compact ? '15px' : '20px'};
        }

        .timeline-item:last-child {
          margin-bottom: 0;
        }

        .timeline-marker {
          position: absolute;
          left: -29px;
          top: 2px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: white;
          z-index: 1;
        }

        .timeline-content {
          background: rgba(255, 255, 255, 0.05);
          padding: ${compact ? '10px' : '15px'};
          border-radius: 8px;
          border-left: 3px solid transparent;
        }

        .timeline-date {
          font-size: ${compact ? '11px' : '12px'};
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 5px;
        }

        .timeline-event {
          font-size: ${compact ? '13px' : '14px'};
          font-weight: 500;
          margin-bottom: 3px;
        }

        .timeline-impact {
          font-size: ${compact ? '11px' : '12px'};
          color: rgba(255, 255, 255, 0.7);
          font-style: italic;
        }

        .empty-timeline {
          text-align: center;
          padding: 40px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .empty-icon {
          font-size: 40px;
          margin-bottom: 10px;
        }

        .empty-text {
          font-size: 14px;
        }
      `}</style>

      {!compact && (
        <div className="timeline-header">
          Journey Milestones
        </div>
      )}

      {timelineMarkers.length > 0 ? (
        <div className="timeline-container">
          <div className="timeline-line" />
          
          {timelineMarkers.map((marker, index) => (
            <motion.div
              key={index}
              className="timeline-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className="timeline-marker"
                style={{ backgroundColor: getEventColor(marker.type) }}
              >
                {getEventIcon(marker.type)}
              </div>
              
              <div 
                className="timeline-content"
                style={{ borderLeftColor: getEventColor(marker.type) }}
              >
                <div className="timeline-date">
                  {new Date(marker.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                  })}
                </div>
                <div className="timeline-event">
                  {marker.event}
                </div>
                {marker.impact && (
                  <div className="timeline-impact">
                    {marker.impact}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="empty-timeline">
          <div className="empty-icon">🌟</div>
          <div className="empty-text">
            Your art journey is just beginning...
          </div>
        </div>
      )}
    </div>
  );
};

export default JourneyTimeline;