const { pool } = require('../config/database');
const logger = require('../utils/logger');

class QuizTokenService {
  constructor() {
    this.initialTokens = 3.0;
    this.quizCost = 1.0;
    this.maxTokens = 50.0;
    
    this.earningRates = {
      DAILY_LOGIN: 0.1,
      GALLERY_VISIT: 0.2,
      COMMUNITY_POST: 0.3,
      COMMUNITY_COMMENT: 0.1,
      EVENT_PARTICIPATION: 0.5,
      FRIEND_INVITE: 1.0,
      ARTWORK_INTERACTION: 0.1,
      CARD_EXCHANGE: 0.5,
      ACHIEVEMENT_UNLOCK: 0.3
    };

    this.dailyLimits = {
      DAILY_LOGIN: 1,
      GALLERY_VISIT: 3,
      COMMUNITY_POST: 5,
      COMMUNITY_COMMENT: 10,
      ARTWORK_INTERACTION: 20
    };
  }

  // Initialize user tokens (called on registration)
  async initializeUserTokens(userId) {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Set initial token balance
        await client.query(`
          UPDATE users 
          SET quiz_tokens = $1
          WHERE id = $2
        `, [this.initialTokens, userId]);

        // Record initial token grant
        await client.query(`
          INSERT INTO token_transactions (user_id, amount, transaction_type, reason, balance_after)
          VALUES ($1, $2, 'INITIAL_GRANT', 'Welcome bonus', $3)
        `, [userId, this.initialTokens, this.initialTokens]);

        await client.query('COMMIT');
        
        logger.info(`Initialized ${this.initialTokens} tokens for user ${userId}`);
        return this.initialTokens;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error initializing user tokens:', error);
      throw error;
    }
  }

  // Award tokens for activities
  async awardTokens(userId, activityType, activityData = {}) {
    try {
      const tokenAmount = this.earningRates[activityType];
      if (!tokenAmount) {
        logger.warn(`Unknown activity type for tokens: ${activityType}`);
        return null;
      }

      // Check daily limits
      if (await this.isDailyLimitReached(userId, activityType)) {
        logger.info(`Daily limit reached for ${activityType} by user ${userId}`);
        return { limitReached: true, amount: 0 };
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get current balance
        const userResult = await client.query(`
          SELECT quiz_tokens FROM users WHERE id = $1
        `, [userId]);
        
        const currentBalance = parseFloat(userResult.rows[0]?.quiz_tokens || 0);
        const newBalance = Math.min(currentBalance + tokenAmount, this.maxTokens);
        const actualAwarded = newBalance - currentBalance;

        if (actualAwarded > 0) {
          // Update user balance
          await client.query(`
            UPDATE users 
            SET quiz_tokens = $1
            WHERE id = $2
          `, [newBalance, userId]);

          // Record transaction
          await client.query(`
            INSERT INTO token_transactions (user_id, amount, transaction_type, reason, balance_after, metadata)
            VALUES ($1, $2, 'EARNED', $3, $4, $5)
          `, [userId, actualAwarded, activityType, newBalance, JSON.stringify(activityData)]);
        }

        await client.query('COMMIT');
        
        logger.info(`Awarded ${actualAwarded} tokens to user ${userId} for ${activityType}`);
        
        return {
          awarded: actualAwarded,
          newBalance,
          limitReached: actualAwarded < tokenAmount,
          maxReached: newBalance >= this.maxTokens
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error awarding tokens:', error);
      throw error;
    }
  }

  // Spend tokens (for quiz retakes)
  async spendTokens(userId, amount, reason = 'QUIZ_RETAKE') {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Get current balance
        const userResult = await client.query(`
          SELECT quiz_tokens FROM users WHERE id = $1
        `, [userId]);
        
        const currentBalance = parseFloat(userResult.rows[0]?.quiz_tokens || 0);
        
        if (currentBalance < amount) {
          await client.query('ROLLBACK');
          return {
            success: false,
            error: 'INSUFFICIENT_TOKENS',
            currentBalance,
            required: amount
          };
        }

        const newBalance = currentBalance - amount;

        // Update user balance
        await client.query(`
          UPDATE users 
          SET quiz_tokens = $1
          WHERE id = $2
        `, [newBalance, userId]);

        // Record transaction
        await client.query(`
          INSERT INTO token_transactions (user_id, amount, transaction_type, reason, balance_after)
          VALUES ($1, $2, 'SPENT', $3, $4)
        `, [userId, -amount, reason, newBalance]);

        await client.query('COMMIT');
        
        logger.info(`User ${userId} spent ${amount} tokens for ${reason}`);
        
        return {
          success: true,
          spent: amount,
          newBalance
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error spending tokens:', error);
      throw error;
    }
  }

  // Check if user can take quiz
  async canTakeQuiz(userId) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT quiz_tokens, last_quiz_date FROM users WHERE id = $1
        `, [userId]);
        
        const user = result.rows[0];
        if (!user) {
          return { canTake: false, reason: 'User not found' };
        }

        const balance = parseFloat(user.quiz_tokens || 0);
        const lastQuizDate = user.last_quiz_date;
        
        // Check if this is first quiz (free)
        if (!lastQuizDate) {
          return { 
            canTake: true, 
            reason: 'First quiz is free',
            cost: 0,
            balance 
          };
        }

        // Check cooldown (optional: prevent spam)
        const timeSinceLastQuiz = lastQuizDate ? 
          (Date.now() - new Date(lastQuizDate).getTime()) / (1000 * 60 * 60) : Infinity;
        
        if (timeSinceLastQuiz < 1) { // 1 hour cooldown
          return {
            canTake: false,
            reason: 'Quiz cooldown active',
            timeRemaining: Math.ceil(60 - (timeSinceLastQuiz * 60)) // minutes
          };
        }

        // Check token balance
        if (balance < this.quizCost) {
          return {
            canTake: false,
            reason: 'Insufficient tokens',
            required: this.quizCost,
            balance,
            deficit: this.quizCost - balance
          };
        }

        return {
          canTake: true,
          cost: this.quizCost,
          balance
        };
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error checking quiz eligibility:', error);
      throw error;
    }
  }

  // Process quiz payment
  async processQuizPayment(userId) {
    try {
      const eligibility = await this.canTakeQuiz(userId);
      
      if (!eligibility.canTake) {
        return eligibility;
      }

      // If it's free (first quiz), just update last quiz date
      if (eligibility.cost === 0) {
        await pool.query(`
          UPDATE users 
          SET last_quiz_date = NOW()
          WHERE id = $1
        `, [userId]);
        
        return {
          success: true,
          cost: 0,
          message: 'First quiz completed'
        };
      }

      // Process payment
      const paymentResult = await this.spendTokens(userId, this.quizCost, 'QUIZ_RETAKE');
      
      if (paymentResult.success) {
        // Update last quiz date
        await pool.query(`
          UPDATE users 
          SET last_quiz_date = NOW()
          WHERE id = $1
        `, [userId]);
      }

      return paymentResult;
    } catch (error) {
      logger.error('Error processing quiz payment:', error);
      throw error;
    }
  }

  // Check daily earning limits
  async isDailyLimitReached(userId, activityType) {
    const limit = this.dailyLimits[activityType];
    if (!limit) return false;

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT COUNT(*) as count
          FROM token_transactions
          WHERE user_id = $1 
            AND reason = $2 
            AND transaction_type = 'EARNED'
            AND created_at > CURRENT_DATE
        `, [userId, activityType]);

        return parseInt(result.rows[0].count) >= limit;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error checking daily limit:', error);
      return false;
    }
  }

  // Get user token balance
  async getBalance(userId) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT quiz_tokens FROM users WHERE id = $1
        `, [userId]);
        
        return parseFloat(result.rows[0]?.quiz_tokens || 0);
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting token balance:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(userId, limit = 20) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
          SELECT 
            amount,
            transaction_type,
            reason,
            balance_after,
            metadata,
            created_at
          FROM token_transactions
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT $2
        `, [userId, limit]);
        
        return result.rows.map(row => ({
          ...row,
          amount: parseFloat(row.amount),
          balance_after: parseFloat(row.balance_after)
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error getting transaction history:', error);
      throw error;
    }
  }

  // Get earning opportunities
  async getEarningOpportunities(userId) {
    try {
      const opportunities = [];
      
      for (const [activityType, rate] of Object.entries(this.earningRates)) {
        const limitReached = await this.isDailyLimitReached(userId, activityType);
        const dailyLimit = this.dailyLimits[activityType];
        
        opportunities.push({
          activityType,
          tokenReward: rate,
          dailyLimit: dailyLimit || 'Unlimited',
          limitReached,
          description: this.getActivityDescription(activityType)
        });
      }
      
      return opportunities.sort((a, b) => b.tokenReward - a.tokenReward);
    } catch (error) {
      logger.error('Error getting earning opportunities:', error);
      throw error;
    }
  }

  getActivityDescription(activityType) {
    const descriptions = {
      DAILY_LOGIN: 'Log in daily to the platform',
      GALLERY_VISIT: 'Visit a gallery or museum',
      COMMUNITY_POST: 'Create a post in the community',
      COMMUNITY_COMMENT: 'Comment on community posts',
      EVENT_PARTICIPATION: 'Participate in village events',
      FRIEND_INVITE: 'Invite a friend who joins',
      ARTWORK_INTERACTION: 'View or interact with artworks',
      CARD_EXCHANGE: 'Exchange identity cards with others',
      ACHIEVEMENT_UNLOCK: 'Unlock achievements'
    };
    
    return descriptions[activityType] || activityType;
  }

  // Token purchase simulation (for future implementation)
  async simulatePurchase(userId, packageType) {
    const packages = {
      single: { tokens: 1, price: 2.99 },
      bundle: { tokens: 5, price: 9.99 },
      unlimited_month: { tokens: 999, price: 19.99 } // Special value for unlimited
    };
    
    const package = packages[packageType];
    if (!package) {
      throw new Error('Invalid package type');
    }
    
    return {
      packageType,
      tokens: package.tokens,
      price: package.price,
      description: this.getPackageDescription(packageType)
    };
  }

  getPackageDescription(packageType) {
    const descriptions = {
      single: 'Single quiz retake token',
      bundle: '5 quiz retake tokens (Best value!)',
      unlimited_month: 'Unlimited quiz retakes for 30 days'
    };
    
    return descriptions[packageType];
  }
}

module.exports = new QuizTokenService();