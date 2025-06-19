import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TokenSystem = ({ userId, onTokenUpdate }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [quizEligibility, setQuizEligibility] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('balance');

  useEffect(() => {
    loadTokenData();
  }, [userId]);

  const loadTokenData = async () => {
    try {
      setLoading(true);
      
      // Load balance and quiz eligibility
      const balanceResponse = await fetch('/api/tokens/balance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const balanceData = await balanceResponse.json();
      
      if (balanceData.success) {
        setBalance(balanceData.balance);
        setQuizEligibility(balanceData.quizEligibility);
      }

      // Load earning opportunities
      const oppsResponse = await fetch('/api/tokens/earning-opportunities', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const oppsData = await oppsResponse.json();
      
      if (oppsData.success) {
        setOpportunities(oppsData.opportunities);
      }

      // Load recent transactions
      const txResponse = await fetch('/api/tokens/transactions?limit=10', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const txData = await txResponse.json();
      
      if (txData.success) {
        setTransactions(txData.transactions);
      }
    } catch (error) {
      console.error('Error loading token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyLogin = async () => {
    try {
      const response = await fetch('/api/tokens/daily-login', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.alreadyClaimed) {
          alert('Daily login already claimed today!');
        } else {
          setBalance(data.newBalance);
          onTokenUpdate?.(data.newBalance);
          alert(`Daily login bonus: +${data.tokensAwarded} tokens!`);
          loadTokenData(); // Refresh data
        }
      }
    } catch (error) {
      console.error('Error claiming daily login:', error);
    }
  };

  const formatBalance = (balance) => {
    return balance.toFixed(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type, reason) => {
    if (type === 'EARNED') {
      const icons = {
        DAILY_LOGIN: '🌅',
        GALLERY_VISIT: '🏢',
        COMMUNITY_POST: '📝',
        ARTWORK_INTERACTION: '🎨',
        CARD_EXCHANGE: '🃏',
        EVENT_PARTICIPATION: '🎉'
      };
      return icons[reason] || '✨';
    }
    return '🎫'; // Spent
  };

  if (loading) {
    return (
      <div className="token-system loading">
        <div className="loading-spinner">🔄</div>
        <div>Loading token data...</div>
      </div>
    );
  }

  return (
    <div className="token-system">
      <style jsx>{`
        .token-system {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          color: white;
        }

        .token-system.loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          font-size: 48px;
          animation: spin 2s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .token-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .balance-display {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .balance-label {
          font-size: 18px;
          opacity: 0.9;
        }

        .quiz-status {
          margin: 20px 0;
          padding: 15px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          text-align: center;
        }

        .quiz-status.can-take {
          background: rgba(40, 167, 69, 0.2);
          border: 1px solid rgba(40, 167, 69, 0.3);
        }

        .quiz-status.cannot-take {
          background: rgba(220, 53, 69, 0.2);
          border: 1px solid rgba(220, 53, 69, 0.3);
        }

        .daily-login-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .daily-login-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 25px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .daily-login-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .tabs {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
          padding: 5px;
        }

        .tab-button {
          background: none;
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          opacity: 0.7;
        }

        .tab-button.active {
          background: rgba(255, 255, 255, 0.2);
          opacity: 1;
        }

        .tab-content {
          min-height: 300px;
        }

        .opportunities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .opportunity-card {
          background: rgba(255, 255, 255, 0.1);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .opportunity-card.limited {
          opacity: 0.5;
        }

        .opportunity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .token-reward {
          background: rgba(255, 193, 7, 0.2);
          color: #ffc107;
          padding: 4px 8px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .opportunity-description {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 10px;
        }

        .daily-limit {
          font-size: 12px;
          opacity: 0.7;
        }

        .transactions-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .transaction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .transaction-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .transaction-icon {
          font-size: 20px;
          width: 30px;
          text-align: center;
        }

        .transaction-details h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
        }

        .transaction-details .date {
          font-size: 12px;
          opacity: 0.7;
        }

        .transaction-amount {
          font-weight: bold;
          font-size: 16px;
        }

        .transaction-amount.positive {
          color: #28a745;
        }

        .transaction-amount.negative {
          color: #dc3545;
        }

        @media (max-width: 768px) {
          .balance-display {
            font-size: 36px;
          }

          .opportunities-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-direction: column;
          }

          .tab-button {
            text-align: center;
          }
        }
      `}</style>

      <div className="token-header">
        <motion.div 
          className="balance-display"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {formatBalance(balance)}
        </motion.div>
        <div className="balance-label">Quiz Tokens</div>
        
        <div className={`quiz-status ${quizEligibility.canTake ? 'can-take' : 'cannot-take'}`}>
          {quizEligibility.canTake ? (
            <div>
              ✅ Ready to take quiz! 
              {quizEligibility.cost > 0 && `(Cost: ${quizEligibility.cost} tokens)`}
            </div>
          ) : (
            <div>
              ❌ {quizEligibility.reason}
              {quizEligibility.deficit && ` (Need ${quizEligibility.deficit} more tokens)`}
            </div>
          )}
        </div>
      </div>

      <div className="daily-login-section">
        <button className="daily-login-btn" onClick={claimDailyLogin}>
          🌅 Claim Daily Login (+0.1 tokens)
        </button>
      </div>

      <div className="tabs">
        {['balance', 'earn', 'history'].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'balance' && '💰 Balance'}
            {tab === 'earn' && '✨ Earn Tokens'}
            {tab === 'history' && '📈 History'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="tab-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'balance' && (
            <div className="balance-tab">
              <h3>Token Balance Overview</h3>
              <p>Use tokens to retake personality quizzes and discover new facets of your artistic identity.</p>
              
              <div className="balance-info">
                <div>• Current Balance: {formatBalance(balance)} tokens</div>
                <div>• Quiz Cost: 1.0 token</div>
                <div>• First Quiz: Free!</div>
                <div>• Daily Earning Opportunities Available</div>
              </div>
            </div>
          )}

          {activeTab === 'earn' && (
            <div className="earn-tab">
              <h3>Earning Opportunities</h3>
              <div className="opportunities-grid">
                {opportunities.map((opp, index) => (
                  <div 
                    key={index} 
                    className={`opportunity-card ${opp.limitReached ? 'limited' : ''}`}
                  >
                    <div className="opportunity-header">
                      <strong>{opp.activityType.replace('_', ' ')}</strong>
                      <span className="token-reward">+{opp.tokenReward}</span>
                    </div>
                    <div className="opportunity-description">
                      {opp.description}
                    </div>
                    <div className="daily-limit">
                      {opp.limitReached ? 'Daily limit reached' : 
                       `Daily limit: ${opp.dailyLimit}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              <h3>Recent Transactions</h3>
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', opacity: 0.7 }}>
                    No transactions yet. Start earning tokens!
                  </div>
                ) : (
                  transactions.map((tx, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-info">
                        <div className="transaction-icon">
                          {getTransactionIcon(tx.transaction_type, tx.reason)}
                        </div>
                        <div className="transaction-details">
                          <h4>{tx.reason.replace('_', ' ')}</h4>
                          <div className="date">{formatDate(tx.created_at)}</div>
                        </div>
                      </div>
                      <div className={`transaction-amount ${
                        tx.transaction_type === 'EARNED' ? 'positive' : 'negative'
                      }`}>
                        {tx.transaction_type === 'EARNED' ? '+' : ''}{tx.amount}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TokenSystem;