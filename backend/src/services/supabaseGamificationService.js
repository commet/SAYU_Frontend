const { createClient } = require('@supabase/supabase-js');
const { log } = require('../config/logger');

class SupabaseGamificationService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }

  // 사용자 게임 프로필 조회 또는 생성
  async getUserGameProfile(userId) {
    try {
      // 먼저 프로필 조회
      const { data: profile, error: fetchError } = await this.supabase
        .from('user_game_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // 프로필이 없으면 생성
        const { data: newProfile, error: createError } = await this.supabase
          .from('user_game_profiles')
          .insert({
            user_id: userId,
            level: 1,
            current_exp: 0,
            total_points: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        
        // 회원가입 포인트 지급
        await this.addPoints(userId, 'signup');
        
        return newProfile;
      }

      if (fetchError) throw fetchError;
      
      return profile;
    } catch (error) {
      log.error('Failed to get user game profile:', error);
      throw error;
    }
  }

  // 포인트 추가 (메인 함수)
  async addPoints(userId, actionType, metadata = {}) {
    try {
      // RPC 함수 호출 (SQL 함수 사용)
      const { data, error } = await this.supabase.rpc('add_points', {
        p_user_id: userId,
        p_action_type: actionType,
        p_metadata: metadata
      });

      if (error) throw error;

      const result = data[0];
      
      if (!result.success) {
        return {
          success: false,
          message: result.message
        };
      }

      // 레벨업 체크
      const leveledUp = result.new_level > (await this.getUserGameProfile(userId)).level;

      return {
        success: true,
        pointsAdded: result.points_added,
        newTotalPoints: result.new_total_points,
        newLevel: result.new_level,
        leveledUp,
        message: result.message
      };
    } catch (error) {
      log.error('Failed to add points:', error);
      throw error;
    }
  }

  // 사용자 통계 조회
  async getUserStats(userId) {
    try {
      // 게임 프로필 조회
      const profile = await this.getUserGameProfile(userId);
      
      // RPC 함수로 상세 통계 조회
      const { data: stats, error } = await this.supabase.rpc('get_user_game_stats', {
        p_user_id: userId
      });

      if (error) throw error;

      const userStats = stats[0] || {};

      // 오늘의 활동 조회
      const today = new Date().toISOString().split('T')[0];
      const { data: todayActivities } = await this.supabase
        .from('daily_activity_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today);

      // 최근 포인트 획득 내역
      const { data: recentTransactions } = await this.supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      // 팔로우 통계
      const { data: followStats } = await this.supabase.rpc('get_follow_stats', {
        p_user_id: userId
      });

      return {
        ...profile,
        ...userStats,
        todayActivities: todayActivities || [],
        recentTransactions: recentTransactions || [],
        followerCount: followStats?.[0]?.follower_count || 0,
        followingCount: followStats?.[0]?.following_count || 0,
        // 계산된 값들
        nextLevelExp: userStats.level * 1000,
        levelProgress: Math.round((profile.current_exp / (userStats.level * 1000)) * 100)
      };
    } catch (error) {
      log.error('Failed to get user stats:', error);
      throw error;
    }
  }

  // 일일 활동 체크
  async checkDailyLimit(userId, activityType) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await this.supabase
        .from('daily_activity_limits')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .eq('activity_date', today)
        .single();

      const { data: rule } = await this.supabase
        .from('point_rules')
        .select('daily_limit')
        .eq('action_type', activityType)
        .single();

      if (!rule || !rule.daily_limit) {
        return { canEarn: true, remaining: null };
      }

      const currentCount = data?.count || 0;
      const canEarn = currentCount < rule.daily_limit;
      const remaining = rule.daily_limit - currentCount;

      return { canEarn, remaining, currentCount };
    } catch (error) {
      log.error('Failed to check daily limit:', error);
      return { canEarn: true, remaining: null };
    }
  }

  // 리더보드 조회
  async getLeaderboard(type = 'weekly', limit = 50) {
    try {
      let query = this.supabase
        .from('user_game_profiles')
        .select(`
          *,
          auth.users!inner(
            email,
            raw_user_meta_data
          )
        `)
        .order('total_points', { ascending: false })
        .limit(limit);

      // 주간/월간 리더보드는 point_transactions 테이블에서 계산
      if (type === 'weekly' || type === 'monthly') {
        const startDate = new Date();
        if (type === 'weekly') {
          startDate.setDate(startDate.getDate() - 7);
        } else {
          startDate.setMonth(startDate.getMonth() - 1);
        }

        const { data: transactions } = await this.supabase
          .from('point_transactions')
          .select('user_id, points')
          .gte('created_at', startDate.toISOString());

        // 사용자별 포인트 합계 계산
        const userPoints = {};
        transactions?.forEach(t => {
          userPoints[t.user_id] = (userPoints[t.user_id] || 0) + t.points;
        });

        // 정렬하여 상위 사용자 추출
        const sortedUsers = Object.entries(userPoints)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit);

        // 사용자 정보 조회
        const userIds = sortedUsers.map(([id]) => id);
        const { data: profiles } = await this.supabase
          .from('user_game_profiles')
          .select(`
            *,
            auth.users!inner(
              email,
              raw_user_meta_data
            )
          `)
          .in('user_id', userIds);

        // 순위 매기기
        return sortedUsers.map(([userId, points], index) => {
          const profile = profiles?.find(p => p.user_id === userId);
          return {
            rank: index + 1,
            ...profile,
            periodPoints: points
          };
        });
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map((user, index) => ({
        rank: index + 1,
        ...user
      }));
    } catch (error) {
      log.error('Failed to get leaderboard:', error);
      throw error;
    }
  }

  // 포인트 트랜잭션 기록 조회
  async getPointHistory(userId, limit = 20) {
    try {
      const { data, error } = await this.supabase
        .from('point_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      log.error('Failed to get point history:', error);
      throw error;
    }
  }

  // 활동별 포인트 지급 헬퍼 함수들
  async handleLogin(userId) {
    return await this.addPoints(userId, 'daily_login');
  }

  async handleAptTestComplete(userId) {
    return await this.addPoints(userId, 'apt_test_complete');
  }

  async handleAiProfileCreate(userId) {
    return await this.addPoints(userId, 'ai_profile_create');
  }

  async handleProfileComplete(userId) {
    return await this.addPoints(userId, 'profile_complete');
  }

  async handleLikeArtwork(userId, artworkId) {
    return await this.addPoints(userId, 'like_artwork', { artwork_id: artworkId });
  }

  async handleSaveArtwork(userId, artworkId) {
    return await this.addPoints(userId, 'save_artwork', { artwork_id: artworkId });
  }

  async handlePostComment(userId, commentId) {
    return await this.addPoints(userId, 'post_comment', { comment_id: commentId });
  }

  async handleCreateExhibitionRecord(userId, exhibitionId) {
    return await this.addPoints(userId, 'create_exhibition_record', { exhibition_id: exhibitionId });
  }

  async handleWriteDetailedReview(userId, reviewId, reviewLength) {
    if (reviewLength >= 100) {
      return await this.addPoints(userId, 'write_detailed_review', { 
        review_id: reviewId,
        review_length: reviewLength 
      });
    }
    return { success: false, message: 'Review too short for bonus points' };
  }

  async handleUploadExhibitionPhoto(userId, photoId) {
    return await this.addPoints(userId, 'upload_exhibition_photo', { photo_id: photoId });
  }

  async handleRateExhibition(userId, exhibitionId, rating) {
    return await this.addPoints(userId, 'rate_exhibition', { 
      exhibition_id: exhibitionId,
      rating 
    });
  }

  async handleFollowUser(userId, followedUserId) {
    const result = await this.addPoints(userId, 'follow_user', { followed_user_id: followedUserId });
    
    // 팔로워 획득 포인트도 지급
    await this.addPoints(followedUserId, 'gain_follower', { follower_id: userId });
    
    return result;
  }

  async handleShareProfile(userId) {
    return await this.addPoints(userId, 'share_profile');
  }

  async handleInviteFriendSuccess(userId, invitedUserId) {
    return await this.addPoints(userId, 'invite_friend_success', { invited_user_id: invitedUserId });
  }

  // 레벨 정보 조회
  async getLevelInfo(level) {
    try {
      const { data, error } = await this.supabase
        .from('level_definitions')
        .select('*')
        .eq('level', level)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      log.error('Failed to get level info:', error);
      return null;
    }
  }

  // 모든 레벨 정의 조회
  async getAllLevels() {
    try {
      const { data, error } = await this.supabase
        .from('level_definitions')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      log.error('Failed to get all levels:', error);
      return [];
    }
  }

  // 포인트 규칙 조회
  async getPointRules() {
    try {
      const { data, error } = await this.supabase
        .from('point_rules')
        .select('*')
        .order('base_points', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      log.error('Failed to get point rules:', error);
      return [];
    }
  }

  // 주간 진행도
  async getWeeklyProgress(userId) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await this.supabase
        .from('point_transactions')
        .select('created_at, points')
        .eq('user_id', userId)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // 일별 포인트 합계 계산
      const dailyPoints = {};
      data.forEach(transaction => {
        const date = transaction.created_at.split('T')[0];
        dailyPoints[date] = (dailyPoints[date] || 0) + transaction.points;
      });

      // 7일간 데이터 생성 (빈 날짜는 0으로)
      const weekData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        weekData.push({
          date: dateStr,
          points: dailyPoints[dateStr] || 0,
          dayName: date.toLocaleDateString('ko-KR', { weekday: 'short' })
        });
      }

      const totalPoints = Object.values(dailyPoints).reduce((sum, points) => sum + points, 0);
      const activeDays = Object.keys(dailyPoints).length;

      return {
        daily: weekData,
        totalPoints,
        activeDays,
        weeklyGoal: 500,
        goalProgress: Math.min(100, (totalPoints / 500) * 100)
      };
    } catch (error) {
      log.error('Failed to get weekly progress:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
let instance;

function getSupabaseGamificationService() {
  if (!instance) {
    instance = new SupabaseGamificationService();
  }
  return instance;
}

module.exports = {
  SupabaseGamificationService,
  getSupabaseGamificationService
};