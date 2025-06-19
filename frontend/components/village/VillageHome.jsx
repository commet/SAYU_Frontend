import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import VillageEvents from './VillageEvents';
import MemberDirectory from './MemberDirectory';

const VillageHome = ({ villageCode, userIdentity }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [villageData, setVillageData] = useState(null);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);

  // Village configurations - 4 Art Style Clusters
  const villageConfigs = {
    CONTEMPLATIVE: {
      name: 'Contemplative Sanctuary',
      koreanName: '명상적 성역',
      description: 'A quiet haven for solitary art contemplation and deep reflection',
      personalities: ['LAEF', 'LAMF', 'LREF', 'LRMF'],
      theme: {
        colors: ['#667eea', '#764ba2'],
        atmosphere: 'peaceful_meditation',
        architecture: 'serene_temple',
        soundtrack: 'ambient_whispers'
      },
      features: [
        'Silent Meditation Gardens',
        'Individual Reflection Pods',
        'Contemplative Art Alcoves',
        'Personal Journal Libraries',
        'Mindful Walking Paths'
      ],
      perks: [
        'Access to quiet viewing hours',
        'Personal art interpretation guides',
        'Noise-free exhibition spaces',
        'Meditation session access',
        'Priority booking for solo experiences'
      ],
      dailyEvent: {
        name: 'Silent Morning Reflection',
        time: '06:00',
        description: 'Begin your day with peaceful art meditation',
        icon: '🧘'
      },
      weeklyEvent: {
        name: 'Solitary Soul Sessions',
        day: 'Sunday',
        description: 'Deep personal art exploration',
        icon: '🌸'
      }
    },
    ACADEMIC: {
      name: 'Academic Forum',
      koreanName: '학술 포럼',
      description: 'A scholarly space for analytical discussion and systematic art study',
      personalities: ['LRMC', 'LREC', 'SRMC', 'SREC'],
      theme: {
        colors: ['#f093fb', '#f5576c'],
        atmosphere: 'bright_scholarly',
        architecture: 'classical_library',
        soundtrack: 'intellectual_discourse'
      },
      features: [
        'Research Libraries & Archives',
        'Debate Halls & Lecture Rooms',
        'Analysis Workshops',
        'Peer Review Circles',
        'Academic Conference Spaces'
      ],
      perks: [
        'Early access to educational content',
        'Expert curator networks',
        'Research database access',
        'Academic partnership programs',
        'Scholarly publication opportunities'
      ],
      dailyEvent: {
        name: 'Scholarly Analysis Hour',
        time: '19:00',
        description: 'Systematic art study and discussion',
        icon: '📚'
      },
      weeklyEvent: {
        name: 'Curator Symposium',
        day: 'Wednesday',
        description: 'Expert-led academic discussions',
        icon: '🎓'
      }
    },
    SOCIAL: {
      name: 'Social Gallery',
      koreanName: '사교적 갤러리',
      description: 'A vibrant community space for shared art experiences and social connection',
      personalities: ['SAEF', 'SAEC', 'SREF', 'SREC'],
      theme: {
        colors: ['#4facfe', '#00f2fe'],
        atmosphere: 'warm_communal',
        architecture: 'open_flowing',
        soundtrack: 'lively_conversations'
      },
      features: [
        'Community Lounges & Cafés',
        'Group Tour Coordination',
        'Social Event Spaces',
        'Collaboration Studios',
        'Networking Hubs'
      ],
      perks: [
        'Group exhibition discounts',
        'Social event invitations',
        'Community project access',
        'Networking event priority',
        'Group tour leadership opportunities'
      ],
      dailyEvent: {
        name: 'Community Art Café',
        time: '18:00',
        description: 'Social art discussions and connections',
        icon: '☕'
      },
      weeklyEvent: {
        name: 'Group Discovery Tours',
        day: 'Saturday',
        description: 'Explore exhibitions as a community',
        icon: '👥'
      }
    },
    CREATIVE: {
      name: 'Creative Studio',
      koreanName: '창작 스튜디오',
      description: 'An inspiring workshop space for artistic experimentation and emotional expression',
      personalities: ['LAMC', 'LAMF', 'SAMC', 'SAMF'],
      theme: {
        colors: ['#43e97b', '#38f9d7'],
        atmosphere: 'inspiring_creative',
        architecture: 'organic_flowing',
        soundtrack: 'experimental_ambient'
      },
      features: [
        'Art Creation Workshops',
        'Experimental Studios',
        'Inspiration Galleries',
        'Creative Collaboration Spaces',
        'Artistic Expression Labs'
      ],
      perks: [
        'Studio space access',
        'Art supply discounts',
        'Creative workshop priority',
        'Artist mentorship programs',
        'Exhibition submission opportunities'
      ],
      dailyEvent: {
        name: 'Creative Expression Hour',
        time: '15:00',
        description: 'Free-form artistic exploration and creation',
        icon: '🎨'
      },
      weeklyEvent: {
        name: 'Inspiration Workshops',
        day: 'Friday',
        description: 'Hands-on creative experimentation',
        icon: '✨'
      }
    }
  };

  // Function to map personality types to village clusters
  const getVillageCluster = (personalityType) => {
    const personalityMapping = {
      // 🏛️ Contemplative Sanctuary (혼자서 깊이 사색)
      'LAEF': 'CONTEMPLATIVE',
      'LAMF': 'CONTEMPLATIVE', 
      'LREF': 'CONTEMPLATIVE',
      'LRMF': 'CONTEMPLATIVE',
      
      // 📚 Academic Forum (논리와 체계로 탐구)
      'LRMC': 'ACADEMIC',
      'LREC': 'ACADEMIC',
      'SRMC': 'ACADEMIC', 
      'SREC': 'ACADEMIC',
      
      // 🎭 Social Gallery (함께 감상하고 나눔)
      'SAEF': 'SOCIAL',
      'SAEC': 'SOCIAL',
      'SREF': 'SOCIAL',
      'SREC': 'SOCIAL',
      
      // ✨ Creative Studio (감성과 영감이 흘러넘침)
      'LAMC': 'CREATIVE',
      'LAMF': 'CREATIVE',
      'SAMC': 'CREATIVE',
      'SAMF': 'CREATIVE'
    };
    
    return personalityMapping[personalityType] || 'CONTEMPLATIVE';
  };

  useEffect(() => {
    // Get cluster for the personality type
    const cluster = getVillageCluster(villageCode);
    setVillageData(villageConfigs[cluster] || villageConfigs.CONTEMPLATIVE);
    loadVillageData();
  }, [villageCode]);

  const loadVillageData = async () => {
    // Simulate API calls
    setMembers([
      { id: 1, name: 'ArtLover123', identity: villageCode, avatar: '🎨', status: 'online' },
      { id: 2, name: 'GalleryWalker', identity: villageCode, avatar: '🖼️', status: 'offline' },
      { id: 3, name: 'MuseumFriend', identity: villageCode, avatar: '🏛️', status: 'online' }
    ]);

    setEvents([
      {
        id: 1,
        name: villageData?.dailyEvent?.name || 'Daily Activity',
        type: 'daily',
        time: villageData?.dailyEvent?.time || '09:00',
        participants: 12,
        icon: villageData?.dailyEvent?.icon || '✨'
      },
      {
        id: 2,
        name: villageData?.weeklyEvent?.name || 'Weekly Gathering',
        type: 'weekly',
        time: 'This ' + (villageData?.weeklyEvent?.day || 'Sunday'),
        participants: 25,
        icon: villageData?.weeklyEvent?.icon || '🎭'
      }
    ]);
  };

  if (!villageData) {
    return <div>Loading village...</div>;
  }

  const gradient = `linear-gradient(135deg, ${villageData.theme.colors.join(', ')})`;

  return (
    <div className="village-home">
      <style jsx>{`
        .village-home {
          min-height: 100vh;
          background: ${gradient};
          color: white;
        }

        .village-header {
          padding: 40px 20px;
          text-align: center;
          background: rgba(0, 0, 0, 0.1);
        }

        .village-name {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .village-korean-name {
          font-size: 18px;
          opacity: 0.9;
          margin-bottom: 15px;
        }

        .village-description {
          font-size: 16px;
          opacity: 0.8;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .village-stats {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 24px;
          font-weight: bold;
        }

        .stat-label {
          font-size: 12px;
          opacity: 0.7;
          text-transform: uppercase;
        }

        .village-tabs {
          display: flex;
          justify-content: center;
          background: rgba(0, 0, 0, 0.1);
          padding: 0;
        }

        .tab-button {
          background: none;
          border: none;
          color: white;
          padding: 15px 30px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s ease;
          border-bottom: 3px solid transparent;
        }

        .tab-button.active {
          border-bottom-color: white;
          background: rgba(255, 255, 255, 0.1);
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .village-content {
          padding: 40px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 30px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .feature-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
        }

        .feature-list li:last-child {
          border-bottom: none;
        }

        .feature-list li::before {
          content: '✨';
          margin-right: 10px;
        }

        .events-section {
          margin-top: 40px;
        }

        .section-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: center;
        }

        .quick-events {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }

        .quick-event {
          background: rgba(255, 255, 255, 0.15);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
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

        .event-details h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        .event-time {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 5px;
        }

        .event-participants {
          font-size: 12px;
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .village-name {
            font-size: 28px;
          }

          .village-stats {
            gap: 20px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .tab-button {
            padding: 12px 20px;
            font-size: 14px;
          }
        }
      `}</style>

      {/* Village Header */}
      <div className="village-header">
        <motion.h1 
          className="village-name"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {villageData.name}
        </motion.h1>
        <motion.p 
          className="village-korean-name"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {villageData.koreanName}
        </motion.p>
        <motion.p 
          className="village-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {villageData.description}
        </motion.p>

        <motion.div 
          className="village-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div className="stat-item">
            <div className="stat-number">{members.length}</div>
            <div className="stat-label">Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{events.length}</div>
            <div className="stat-label">Events</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24</div>
            <div className="stat-label">Online</div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Tabs */}
      <div className="village-tabs">
        {['home', 'events', 'members'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="village-content">
        {activeTab === 'home' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="features-grid">
              <div className="feature-card">
                <h3 className="feature-title">Community Features</h3>
                <ul className="feature-list">
                  {villageData.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="feature-card">
                <h3 className="feature-title">Village Perks</h3>
                <ul className="feature-list">
                  {villageData.perks.map((perk, index) => (
                    <li key={index}>{perk}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="events-section">
              <h2 className="section-title">Today's Highlights</h2>
              <div className="quick-events">
                <div className="quick-event">
                  <div className="event-icon">{villageData.dailyEvent.icon}</div>
                  <div className="event-details">
                    <h4>{villageData.dailyEvent.name}</h4>
                    <div className="event-time">{villageData.dailyEvent.time}</div>
                    <div className="event-participants">12 participants</div>
                  </div>
                </div>
                
                <div className="quick-event">
                  <div className="event-icon">{villageData.weeklyEvent.icon}</div>
                  <div className="event-details">
                    <h4>{villageData.weeklyEvent.name}</h4>
                    <div className="event-time">{villageData.weeklyEvent.day}</div>
                    <div className="event-participants">25 participants</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <VillageEvents 
            villageCode={villageCode}
            events={events}
            villageTheme={villageData.theme}
          />
        )}

        {activeTab === 'members' && (
          <MemberDirectory 
            villageCode={villageCode}
            members={members}
            villageTheme={villageData.theme}
          />
        )}
      </div>
    </div>
  );
};

export default VillageHome;