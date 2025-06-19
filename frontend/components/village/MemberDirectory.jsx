import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MemberDirectory = ({ villageCode, members = [], villageTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  // Sample members data with village-specific characteristics
  const sampleMembers = {
    LAEF: [
      {
        id: 1,
        name: 'Luna Dreamer',
        identity: 'LAEF',
        avatar: '🌙',
        status: 'online',
        joinDate: '2024-01-15',
        level: 'Stage 3',
        evolutionPoints: 245,
        motto: 'Art speaks in whispers',
        badges: ['Quiet Observer', 'Solo Explorer', 'Meditation Master'],
        favoriteArtwork: 'Starry Night',
        lastActive: '2 minutes ago',
        artPreferences: ['Abstract', 'Minimalist', 'Contemporary']
      },
      {
        id: 2,
        name: 'Silent Wanderer',
        identity: 'LAEF',
        avatar: '🦋',
        status: 'away',
        joinDate: '2024-01-20',
        level: 'Stage 2',
        evolutionPoints: 156,
        motto: 'In solitude, I find beauty',
        badges: ['Deep Thinker', 'Night Owl'],
        favoriteArtwork: 'The Great Wave',
        lastActive: '1 hour ago',
        artPreferences: ['Classical', 'Impressionist', 'Oriental']
      },
      {
        id: 3,
        name: 'Moonlight Muse',
        identity: 'LAEF',
        avatar: '✨',
        status: 'offline',
        joinDate: '2024-02-01',
        level: 'Stage 1',
        evolutionPoints: 89,
        motto: 'Every artwork has a secret',
        badges: ['Newcomer', 'Art Lover'],
        favoriteArtwork: 'Water Lilies',
        lastActive: '3 hours ago',
        artPreferences: ['Surreal', 'Romantic', 'Nature']
      }
    ],
    SRMC: [
      {
        id: 1,
        name: 'Prof. ArtHistorian',
        identity: 'SRMC',
        avatar: '📚',
        status: 'online',
        joinDate: '2024-01-10',
        level: 'Stage 4',
        evolutionPoints: 387,
        motto: 'Knowledge illuminates beauty',
        badges: ['Scholar', 'Debate Master', 'Research Expert'],
        favoriteArtwork: 'School of Athens',
        lastActive: 'Just now',
        artPreferences: ['Renaissance', 'Baroque', 'Classical']
      },
      {
        id: 2,
        name: 'CriticalEye',
        identity: 'SRMC',
        avatar: '🔍',
        status: 'online',
        joinDate: '2024-01-18',
        level: 'Stage 3',
        evolutionPoints: 298,
        motto: 'Analysis reveals truth',
        badges: ['Art Critic', 'Analytical Mind'],
        favoriteArtwork: 'Las Meninas',
        lastActive: '5 minutes ago',
        artPreferences: ['Conceptual', 'Modern', 'Installation']
      }
    ],
    SAEF: [
      {
        id: 1,
        name: 'SocialButterfly',
        identity: 'SAEF',
        avatar: '🦋',
        status: 'online',
        joinDate: '2024-01-12',
        level: 'Stage 3',
        evolutionPoints: 267,
        motto: 'Art is better when shared!',
        badges: ['Community Builder', 'Event Organizer', 'Social Star'],
        favoriteArtwork: 'The Luncheon',
        lastActive: 'Just now',
        artPreferences: ['Pop Art', 'Street Art', 'Photography']
      },
      {
        id: 2,
        name: 'GroupGalleryGuide',
        identity: 'SAEF',
        avatar: '🌈',
        status: 'online',
        joinDate: '2024-01-25',
        level: 'Stage 2',
        evolutionPoints: 189,
        motto: 'Every exhibition is an adventure',
        badges: ['Tour Guide', 'Friendship Maker'],
        favoriteArtwork: 'American Gothic',
        lastActive: '10 minutes ago',
        artPreferences: ['Contemporary', 'Interactive', 'Multimedia']
      }
    ],
    LRMC: [
      {
        id: 1,
        name: 'DataArtist',
        identity: 'LRMC',
        avatar: '📊',
        status: 'online',
        joinDate: '2024-01-08',
        level: 'Stage 4',
        evolutionPoints: 423,
        motto: 'Patterns reveal the soul of art',
        badges: ['Data Wizard', 'Pattern Master', 'System Builder'],
        favoriteArtwork: 'Composition VIII',
        lastActive: 'Just now',
        artPreferences: ['Geometric', 'Abstract', 'Digital']
      },
      {
        id: 2,
        name: 'SystemicThinker',
        identity: 'LRMC',
        avatar: '🔬',
        status: 'away',
        joinDate: '2024-01-22',
        level: 'Stage 2',
        evolutionPoints: 178,
        motto: 'Order within chaos',
        badges: ['Methodical Mind', 'Structure Lover'],
        favoriteArtwork: 'Mondrian Grid',
        lastActive: '30 minutes ago',
        artPreferences: ['Minimalist', 'Constructivist', 'Bauhaus']
      }
    ]
  };

  const villageMembers = sampleMembers[villageCode] || sampleMembers.LAEF;
  
  const filteredMembers = villageMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'level':
        return parseInt(b.level.split(' ')[1]) - parseInt(a.level.split(' ')[1]);
      case 'points':
        return b.evolutionPoints - a.evolutionPoints;
      case 'joinDate':
        return new Date(b.joinDate) - new Date(a.joinDate);
      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      online: '#28a745',
      away: '#ffc107',
      offline: '#6c757d'
    };
    return colors[status] || colors.offline;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="member-directory">
      <style jsx>{`
        .member-directory {
          max-width: 1200px;
          margin: 0 auto;
        }

        .directory-header {
          margin-bottom: 30px;
        }

        .directory-title {
          font-size: 28px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }

        .directory-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-bottom: 20px;
        }

        .search-box {
          flex: 1;
          min-width: 200px;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 10px 15px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 25px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 14px;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .control-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .sort-select, .view-toggle {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          cursor: pointer;
        }

        .view-toggle {
          display: flex;
          gap: 5px;
        }

        .view-button {
          background: none;
          border: none;
          color: white;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .view-button.active {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .members-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .member-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          padding: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
        }

        .member-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.15);
        }

        .member-card.list-view {
          display: flex;
          align-items: center;
          padding: 15px 20px;
        }

        .member-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .member-header.list-view {
          margin-bottom: 0;
          flex: 1;
        }

        .member-avatar {
          position: relative;
          font-size: 32px;
          background: rgba(255, 255, 255, 0.2);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-indicator {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .member-info h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
          font-weight: bold;
        }

        .member-identity {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 3px;
        }

        .member-level {
          font-size: 11px;
          color: #ffc107;
          font-weight: bold;
        }

        .member-details {
          margin-bottom: 15px;
        }

        .member-motto {
          font-size: 13px;
          font-style: italic;
          opacity: 0.9;
          margin-bottom: 10px;
          line-height: 1.4;
        }

        .member-stats {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          opacity: 0.8;
          margin-bottom: 10px;
        }

        .member-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .badge {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 10px;
          font-weight: 500;
        }

        .member-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .action-button {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 6px 12px;
          border-radius: 15px;
          cursor: pointer;
          font-size: 11px;
          transition: all 0.3s ease;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .list-view .member-actions {
          margin-left: auto;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          opacity: 0.6;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .directory-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .control-group {
            justify-content: space-between;
          }

          .members-grid {
            grid-template-columns: 1fr;
          }

          .member-card.list-view {
            flex-direction: column;
            align-items: flex-start;
          }

          .list-view .member-actions {
            margin-left: 0;
            margin-top: 10px;
          }
        }
      `}</style>

      <div className="directory-header">
        <motion.h2 
          className="directory-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Village Members
        </motion.h2>

        <div className="directory-controls">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="control-group">
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="level">Sort by Level</option>
              <option value="points">Sort by Points</option>
              <option value="joinDate">Sort by Join Date</option>
            </select>
            
            <div className="view-toggle">
              <button
                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                🔢
              </button>
              <button
                className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📜
              </button>
            </div>
          </div>
        </div>
      </div>

      {sortedMembers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div>No members found matching your search.</div>
        </div>
      ) : (
        <motion.div 
          className={viewMode === 'grid' ? 'members-grid' : 'members-list'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {sortedMembers.map((member, index) => (
            <motion.div
              key={member.id}
              className={`member-card ${viewMode === 'list' ? 'list-view' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`member-header ${viewMode === 'list' ? 'list-view' : ''}`}>
                <div className="member-avatar">
                  {member.avatar}
                  <div 
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(member.status) }}
                  />
                </div>
                
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <div className="member-identity">{member.identity}</div>
                  <div className="member-level">{member.level}</div>
                </div>
              </div>

              {viewMode === 'grid' && (
                <>
                  <div className="member-details">
                    <div className="member-motto">
                      "{member.motto}"
                    </div>
                    
                    <div className="member-stats">
                      <span>{member.evolutionPoints} pts</span>
                      <span>Joined {formatDate(member.joinDate)}</span>
                    </div>
                    
                    <div className="member-badges">
                      {member.badges.slice(0, 3).map((badge, badgeIndex) => (
                        <span key={badgeIndex} className="badge">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="member-actions">
                    <button className="action-button">
                      💬 Message
                    </button>
                    <button className="action-button">
                      🎨 Exchange Cards
                    </button>
                  </div>
                </>
              )}

              {viewMode === 'list' && (
                <div className="member-actions">
                  <button className="action-button">
                    💬
                  </button>
                  <button className="action-button">
                    🎨
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MemberDirectory;