import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import IdentityCard from '../identity/IdentityCard';

const CardExchange = ({ currentUser, onExchangeComplete }) => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [exchangeStep, setExchangeStep] = useState('discover'); // discover, preview, exchange, complete
  const [exchangeCode, setExchangeCode] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [exchangeHistory, setExchangeHistory] = useState([]);

  useEffect(() => {
    loadNearbyUsers();
    loadExchangeHistory();
  }, []);

  const loadNearbyUsers = async () => {
    // Simulate nearby users based on village/location
    const mockUsers = [
      {
        id: 1,
        name: 'ArtLover123',
        identity: {
          type: 'LAEF',
          evolutionStage: 2,
          evolutionPoints: 156,
          motto: 'Art speaks in whispers'
        },
        avatar: '🌙',
        distance: '0.2km away',
        status: 'online',
        village: 'Dreamweaver Haven',
        lastSeen: 'Just now',
        badges: ['Quiet Observer', 'Gallery Walker']
      },
      {
        id: 2,
        name: 'MuseumExplorer',
        identity: {
          type: 'SRMC',
          evolutionStage: 3,
          evolutionPoints: 287,
          motto: 'Knowledge illuminates beauty'
        },
        avatar: '📚',
        distance: '0.5km away',
        status: 'online',
        village: "Scholar's Symposium",
        lastSeen: '5 minutes ago',
        badges: ['Art Historian', 'Debate Master']
      },
      {
        id: 3,
        name: 'SocialCanvas',
        identity: {
          type: 'SAEF',
          evolutionStage: 2,
          evolutionPoints: 198,
          motto: 'Art is better when shared!'
        },
        avatar: '🌈',
        distance: '1.2km away',
        status: 'away',
        village: 'Social Dreamscape',
        lastSeen: '30 minutes ago',
        badges: ['Community Builder', 'Event Organizer']
      }
    ];
    
    setNearbyUsers(mockUsers);
  };

  const loadExchangeHistory = async () => {
    // Mock exchange history
    const mockHistory = [
      {
        id: 1,
        partnerName: 'PastExchanger',
        partnerIdentity: 'LRMC',
        exchangeDate: '2024-01-15T10:30:00Z',
        location: 'Metropolitan Museum',
        mutual: true
      }
    ];
    
    setExchangeHistory(mockHistory);
  };

  const generateExchangeCode = async () => {
    setIsGeneratingCode(true);
    
    // Simulate API call
    setTimeout(() => {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setUserCode(code);
      setIsGeneratingCode(false);
    }, 1000);
  };

  const initiateExchange = (user) => {
    setSelectedUser(user);
    setExchangeStep('preview');
  };

  const confirmExchange = async () => {
    setExchangeStep('exchange');
    
    // Simulate exchange process
    setTimeout(() => {
      setExchangeStep('complete');
      
      // Award tokens and evolution points
      setTimeout(() => {
        onExchangeComplete?.({
          partner: selectedUser,
          tokensAwarded: 0.5,
          evolutionPointsAwarded: 20
        });
        resetExchange();
      }, 2000);
    }, 3000);
  };

  const resetExchange = () => {
    setSelectedUser(null);
    setExchangeStep('discover');
    setExchangeCode('');
    setUserCode('');
  };

  const exchangeByCode = async () => {
    if (exchangeCode.length !== 6) {
      alert('Please enter a valid 6-character exchange code');
      return;
    }
    
    // Simulate finding user by code
    const foundUser = nearbyUsers.find(u => u.name.includes('Code')); // Mock
    if (foundUser) {
      setSelectedUser(foundUser);
      setExchangeStep('preview');
    } else {
      alert('User not found or code expired');
    }
  };

  const getIdentityGradient = (type) => {
    const gradients = {
      'LAEF': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'SRMC': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'SAEF': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'LRMC': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    };
    return gradients[type] || gradients['LAEF'];
  };

  return (
    <div className="card-exchange">
      <style jsx>{`
        .card-exchange {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .exchange-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .exchange-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
          color: white;
        }

        .exchange-subtitle {
          font-size: 16px;
          opacity: 0.8;
          color: white;
        }

        .exchange-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .method-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 25px;
          border-radius: 15px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
        }

        .method-title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .code-section {
          margin-bottom: 20px;
        }

        .code-display {
          background: rgba(0, 0, 0, 0.3);
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 3px;
          margin-bottom: 10px;
        }

        .code-input {
          width: 100%;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-size: 16px;
          text-align: center;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .code-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .action-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          width: 100%;
        }

        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .nearby-users {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
          color: white;
        }

        .users-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
        }

        .user-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          color: white;
        }

        .user-card:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.15);
        }

        .user-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 15px;
        }

        .user-avatar {
          font-size: 32px;
          background: rgba(255, 255, 255, 0.2);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .status-dot {
          position: absolute;
          bottom: 2px;
          right: 2px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .status-dot.online { background: #28a745; }
        .status-dot.away { background: #ffc107; }
        .status-dot.offline { background: #6c757d; }

        .user-info h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        .user-identity {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 3px;
        }

        .user-distance {
          font-size: 11px;
          opacity: 0.6;
        }

        .user-details {
          margin-bottom: 15px;
        }

        .user-motto {
          font-size: 13px;
          font-style: italic;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .user-badges {
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
        }

        .exchange-button {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          width: 100%;
          transition: all 0.3s ease;
        }

        .exchange-button:hover {
          transform: translateY(-2px);
        }

        .exchange-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
          color: white;
          text-align: center;
        }

        .exchange-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          margin: 30px 0;
        }

        .card-preview {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 15px;
          width: 200px;
        }

        .exchange-arrow {
          font-size: 32px;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateX(0); }
          40% { transform: translateX(-10px); }
          60% { transform: translateX(10px); }
        }

        .loading-exchange {
          text-align: center;
          padding: 40px;
        }

        .loading-spinner {
          font-size: 48px;
          animation: spin 2s linear infinite;
          margin-bottom: 20px;
        }

        .exchange-complete {
          text-align: center;
          padding: 40px;
        }

        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .rewards {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
        }

        .modal-actions {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin-top: 20px;
        }

        .cancel-button {
          background: rgba(220, 53, 69, 0.8);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .exchange-methods {
            grid-template-columns: 1fr;
          }

          .exchange-preview {
            flex-direction: column;
            gap: 20px;
          }

          .modal-content {
            margin: 10px;
            padding: 20px;
          }
        }
      `}</style>

      <div className="exchange-header">
        <motion.h1 
          className="exchange-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Card Exchange
        </motion.h1>
        <p className="exchange-subtitle">
          Share your artistic identity and discover others
        </p>
      </div>

      <div className="exchange-methods">
        <div className="method-card">
          <h3 className="method-title">
            📏 Share Your Code
          </h3>
          <p>Generate a code for others to find you</p>
          
          <div className="code-section">
            {userCode ? (
              <div className="code-display">{userCode}</div>
            ) : (
              <div className="code-display">------</div>
            )}
            
            <button 
              className="action-button"
              onClick={generateExchangeCode}
              disabled={isGeneratingCode}
            >
              {isGeneratingCode ? 'Generating...' : 'Generate Code'}
            </button>
          </div>
        </div>

        <div className="method-card">
          <h3 className="method-title">
            🔍 Find by Code
          </h3>
          <p>Enter someone's exchange code</p>
          
          <div className="code-section">
            <input
              type="text"
              className="code-input"
              placeholder="ABCD12"
              value={exchangeCode}
              onChange={(e) => setExchangeCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            
            <button 
              className="action-button"
              onClick={exchangeByCode}
              disabled={exchangeCode.length !== 6}
            >
              Find User
            </button>
          </div>
        </div>
      </div>

      <div className="nearby-users">
        <h2 className="section-title">Nearby Art Enthusiasts</h2>
        <div className="users-grid">
          {nearbyUsers.map((user) => (
            <motion.div
              key={user.id}
              className="user-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: user.id * 0.1 }}
            >
              <div className="user-header">
                <div className="user-avatar">
                  {user.avatar}
                  <div className={`status-dot ${user.status}`} />
                </div>
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <div className="user-identity">{user.identity.type} - {user.village}</div>
                  <div className="user-distance">{user.distance} • {user.lastSeen}</div>
                </div>
              </div>
              
              <div className="user-details">
                <div className="user-motto">
                  "{user.identity.motto}"
                </div>
                <div className="user-badges">
                  {user.badges.map((badge, index) => (
                    <span key={index} className="badge">{badge}</span>
                  ))}
                </div>
              </div>
              
              <button 
                className="exchange-button"
                onClick={() => initiateExchange(user)}
              >
                🃏 Exchange Cards
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="exchange-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {exchangeStep === 'preview' && (
                <>
                  <h2>Card Exchange Preview</h2>
                  <p>Exchange identity cards with {selectedUser.name}</p>
                  
                  <div className="exchange-preview">
                    <div className="card-preview">
                      <h4>Your Card</h4>
                      <div style={{ background: getIdentityGradient(currentUser?.identity?.type), padding: '15px', borderRadius: '10px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                          {currentUser?.identity?.type || 'LAEF'}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          Stage {currentUser?.identity?.evolutionStage || 1}
                        </div>
                      </div>
                    </div>
                    
                    <div className="exchange-arrow">↔️</div>
                    
                    <div className="card-preview">
                      <h4>{selectedUser.name}'s Card</h4>
                      <div style={{ background: getIdentityGradient(selectedUser.identity.type), padding: '15px', borderRadius: '10px' }}>
                        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                          {selectedUser.identity.type}
                        </div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>
                          Stage {selectedUser.identity.evolutionStage}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rewards">
                    <h4>Exchange Rewards</h4>
                    <div>✨ +20 Evolution Points</div>
                    <div>🎫 +0.5 Quiz Tokens</div>
                    <div>🏆 Card Exchange Badge</div>
                  </div>
                  
                  <div className="modal-actions">
                    <button className="cancel-button" onClick={resetExchange}>
                      Cancel
                    </button>
                    <button className="action-button" onClick={confirmExchange}>
                      Confirm Exchange
                    </button>
                  </div>
                </>
              )}
              
              {exchangeStep === 'exchange' && (
                <div className="loading-exchange">
                  <div className="loading-spinner">🔄</div>
                  <h3>Exchanging Cards...</h3>
                  <p>Creating a lasting connection through art</p>
                </div>
              )}
              
              {exchangeStep === 'complete' && (
                <div className="exchange-complete">
                  <div className="success-icon">✨</div>
                  <h3>Exchange Complete!</h3>
                  <p>You've successfully exchanged cards with {selectedUser.name}</p>
                  
                  <div className="rewards">
                    <div>✅ +20 Evolution Points Awarded</div>
                    <div>✅ +0.5 Quiz Tokens Awarded</div>
                    <div>✅ Card Exchange Badge Unlocked</div>
                  </div>
                  
                  <p>This exchange has been added to both of your journey timelines.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardExchange;