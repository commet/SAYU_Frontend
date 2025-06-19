import React, { useState } from 'react';
import { motion } from 'framer-motion';

const VillageEvents = ({ villageCode, events = [], villageTheme }) => {
  const [filter, setFilter] = useState('all');
  const [joinedEvents, setJoinedEvents] = useState(new Set());

  // Sample events data with village-specific themes
  const sampleEvents = {
    LAEF: [
      {
        id: 1,
        name: 'Silent Gallery Meditation',
        type: 'daily',
        time: '06:00 - 07:00',
        date: 'Today',
        description: 'Begin your day with peaceful contemplation among artworks',
        participants: 8,
        maxParticipants: 12,
        icon: '🧘',
        difficulty: 'All levels',
        rewards: '+15 evolution points'
      },
      {
        id: 2,
        name: 'Moonlight Art Meditation',
        type: 'weekly',
        time: '20:00 - 21:30',
        date: 'Sunday',
        description: 'Monthly gathering under the moonlight for deep artistic reflection',
        participants: 15,
        maxParticipants: 20,
        icon: '🌙',
        difficulty: 'Intermediate',
        rewards: '+25 evolution points'
      },
      {
        id: 3,
        name: 'Solo Exhibition Sharing',
        type: 'monthly',
        time: '19:00 - 20:30',
        date: 'Last Sunday',
        description: 'Share your personal art discoveries in an intimate setting',
        participants: 12,
        maxParticipants: 15,
        icon: '🖼️',
        difficulty: 'All levels',
        rewards: '+30 evolution points'
      }
    ],
    SRMC: [
      {
        id: 1,
        name: 'Art History Debate',
        type: 'daily',
        time: '19:00 - 20:00',
        date: 'Today',
        description: 'Engage in scholarly discussions about art movements',
        participants: 18,
        maxParticipants: 25,
        icon: '📚',
        difficulty: 'Advanced',
        rewards: '+20 evolution points'
      },
      {
        id: 2,
        name: 'Curator Lecture Series',
        type: 'weekly',
        time: '18:00 - 19:30',
        date: 'Wednesday',
        description: 'Learn from museum professionals and art experts',
        participants: 22,
        maxParticipants: 30,
        icon: '🎓',
        difficulty: 'Intermediate',
        rewards: '+25 evolution points'
      },
      {
        id: 3,
        name: 'Academic Art Conference',
        type: 'monthly',
        time: '14:00 - 17:00',
        date: 'Next Saturday',
        description: 'Present and discuss research in art history and criticism',
        participants: 35,
        maxParticipants: 50,
        icon: '🏛️',
        difficulty: 'Advanced',
        rewards: '+40 evolution points'
      }
    ],
    SAEF: [
      {
        id: 1,
        name: 'Art Café Social Hour',
        type: 'daily',
        time: '18:00 - 19:00',
        date: 'Today',
        description: 'Casual conversations about art over coffee and pastries',
        participants: 25,
        maxParticipants: 30,
        icon: '☕',
        difficulty: 'All levels',
        rewards: '+10 evolution points'
      },
      {
        id: 2,
        name: 'Group Gallery Adventure',
        type: 'weekly',
        time: '15:00 - 17:00',
        date: 'Saturday',
        description: 'Explore exhibitions together and share experiences',
        participants: 20,
        maxParticipants: 25,
        icon: '👥',
        difficulty: 'All levels',
        rewards: '+25 evolution points'
      },
      {
        id: 3,
        name: 'Collaborative Art Project',
        type: 'monthly',
        time: '10:00 - 16:00',
        date: 'Next Sunday',
        description: 'Work together on a community art installation',
        participants: 18,
        maxParticipants: 20,
        icon: '🎨',
        difficulty: 'All levels',
        rewards: '+35 evolution points'
      }
    ],
    LRMC: [
      {
        id: 1,
        name: 'Pattern Analysis Workshop',
        type: 'daily',
        time: '14:00 - 15:00',
        date: 'Today',
        description: 'Systematic study of artistic patterns and structures',
        participants: 12,
        maxParticipants: 15,
        icon: '📊',
        difficulty: 'Intermediate',
        rewards: '+20 evolution points'
      },
      {
        id: 2,
        name: 'Systematic Art Tour',
        type: 'weekly',
        time: '16:00 - 18:00',
        date: 'Thursday',
        description: 'Methodical exploration of exhibitions with data collection',
        participants: 15,
        maxParticipants: 20,
        icon: '🔬',
        difficulty: 'Advanced',
        rewards: '+30 evolution points'
      },
      {
        id: 3,
        name: 'Art Data Visualization Lab',
        type: 'monthly',
        time: '13:00 - 16:00',
        date: 'Next Friday',
        description: 'Create visual representations of art collection data',
        participants: 10,
        maxParticipants: 12,
        icon: '💻',
        difficulty: 'Advanced',
        rewards: '+40 evolution points'
      }
    ]
  };

  const villageEvents = sampleEvents[villageCode] || sampleEvents.LAEF;
  
  const filteredEvents = filter === 'all' 
    ? villageEvents 
    : villageEvents.filter(event => event.type === filter);

  const handleJoinEvent = (eventId) => {
    setJoinedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const getEventTypeColor = (type) => {
    const colors = {
      daily: '#4facfe',
      weekly: '#f093fb',
      monthly: '#43e97b',
      special: '#ffc107'
    };
    return colors[type] || '#6c757d';
  };

  return (
    <div className="village-events">
      <style jsx>{`
        .village-events {
          max-width: 1000px;
          margin: 0 auto;
        }

        .events-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .events-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .events-subtitle {
          font-size: 16px;
          opacity: 0.8;
        }

        .events-filters {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .filter-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }

        .filter-button.active {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.4);
        }

        .filter-button:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }

        .event-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 25px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .event-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.15);
        }

        .event-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .event-icon {
          font-size: 32px;
          background: rgba(255, 255, 255, 0.2);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .event-title-section h3 {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: bold;
        }

        .event-type {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: bold;
        }

        .event-details {
          margin-bottom: 15px;
        }

        .event-time {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .event-description {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.9;
          margin-bottom: 15px;
        }

        .event-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .event-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .join-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .join-button.joined {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .join-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .participants-info {
          font-size: 12px;
          opacity: 0.8;
        }

        .full-indicator {
          color: #ffc107;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .events-grid {
            grid-template-columns: 1fr;
          }

          .event-card {
            padding: 20px;
          }

          .events-filters {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

      <div className="events-header">
        <motion.h2 
          className="events-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Village Events
        </motion.h2>
        <motion.p 
          className="events-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Join activities that match your artistic journey
        </motion.p>
      </div>

      <div className="events-filters">
        {['all', 'daily', 'weekly', 'monthly'].map((filterType) => (
          <button
            key={filterType}
            className={`filter-button ${filter === filterType ? 'active' : ''}`}
            onClick={() => setFilter(filterType)}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <motion.div 
        className="events-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            className="event-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="event-header">
              <div className="event-icon">{event.icon}</div>
              <div className="event-title-section">
                <h3>{event.name}</h3>
                <span 
                  className="event-type"
                  style={{ backgroundColor: getEventTypeColor(event.type) }}
                >
                  {event.type}
                </span>
              </div>
            </div>

            <div className="event-details">
              <div className="event-time">
                🕒 {event.time} • {event.date}
              </div>
              <div className="event-description">
                {event.description}
              </div>
            </div>

            <div className="event-meta">
              <div className="meta-item">
                🎯 {event.difficulty}
              </div>
              <div className="meta-item">
                ✨ {event.rewards}
              </div>
            </div>

            <div className="event-actions">
              <button
                className={`join-button ${joinedEvents.has(event.id) ? 'joined' : ''}`}
                onClick={() => handleJoinEvent(event.id)}
                disabled={event.participants >= event.maxParticipants && !joinedEvents.has(event.id)}
              >
                {joinedEvents.has(event.id) ? 'Joined ✓' : 
                 event.participants >= event.maxParticipants ? 'Full' : 'Join Event'}
              </button>
              
              <div className="participants-info">
                {event.participants >= event.maxParticipants ? (
                  <span className="full-indicator">
                    Full ({event.participants}/{event.maxParticipants})
                  </span>
                ) : (
                  <span>
                    {event.participants}/{event.maxParticipants} joined
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default VillageEvents;