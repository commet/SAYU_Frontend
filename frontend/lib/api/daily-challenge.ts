import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { 
  DailyChallenge, 
  ChallengeResponse, 
  UserTasteProfile,
  ChallengeMatch,
  DailyChallengeStats,
  ChallengeProgressState
} from '@/types/daily-challenge';

const supabase = createClientComponentClient();

export const dailyChallengeApi = {
  // 오늘의 챌린지 가져오기
  async getTodayChallenge(): Promise<DailyChallenge | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('daily_challenge_artworks')
      .select('*')
      .eq('date', today)
      .single();

    if (error) {
      console.error('Error fetching today challenge:', error);
      return null;
    }

    return data;
  },

  // 특정 날짜의 챌린지 가져오기
  async getChallengeByDate(date: string): Promise<DailyChallenge | null> {
    const { data, error } = await supabase
      .from('daily_challenge_artworks')
      .select('*')
      .eq('date', date)
      .single();

    if (error) return null;
    return data;
  },

  // 내 응답 제출
  async submitResponse(
    challengeDate: string,
    emotionTags: string[],
    selectionTime: number,
    hasChanged: boolean,
    personalNote?: string
  ): Promise<ChallengeResponse | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // 사용자 APT 타입 가져오기
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('personality_type')
      .eq('user_id', user.id)
      .single();

    if (!profile?.personality_type) {
      throw new Error('User APT type not found');
    }

    const { data, error } = await supabase
      .from('daily_challenge_responses')
      .insert({
        challenge_date: challengeDate,
        user_id: user.id,
        user_apt_type: profile.personality_type,
        emotion_tags: emotionTags,
        emotion_selection_time: Math.round(selectionTime),
        emotion_changed: hasChanged,
        personal_note: personalNote
      })
      .select()
      .single();

    if (error) throw error;

    // 매칭 계산 트리거 (백그라운드에서 실행)
    supabase.rpc('calculate_daily_matches', { p_date: challengeDate });

    return data;
  },

  // 내 응답 가져오기
  async getMyResponse(challengeDate: string): Promise<ChallengeResponse | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('daily_challenge_responses')
      .select('*')
      .eq('challenge_date', challengeDate)
      .eq('user_id', user.id)
      .single();

    if (error) return null;
    return data;
  },

  // 내 취향 프로필 가져오기
  async getMyTasteProfile(): Promise<UserTasteProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('user_taste_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) return null;
    return data;
  },

  // 오늘의 매칭 결과 가져오기
  async getTodayMatches(): Promise<ChallengeMatch[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_challenge_matches')
      .select(`
        *,
        user1_profile:user_profiles!daily_challenge_matches_user1_id_fkey(
          username,
          profile_image_url,
          apt_type
        ),
        user2_profile:user_profiles!daily_challenge_matches_user2_id_fkey(
          username,
          profile_image_url,
          apt_type
        )
      `)
      .eq('challenge_date', today)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('match_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching matches:', error);
      return [];
    }

    // 매칭된 사용자 정보 정리
    return data.map(match => {
      const isUser1 = match.user1_id === user.id;
      const matchedUserProfile = isUser1 ? match.user2_profile : match.user1_profile;
      const matchedUserId = isUser1 ? match.user2_id : match.user1_id;
      
      return {
        ...match,
        matched_user: {
          id: matchedUserId,
          username: matchedUserProfile?.username || '익명 사용자',
          profile_image_url: matchedUserProfile?.profile_image_url,
          apt_type: matchedUserProfile?.apt_type
        }
      };
    });
  },

  // 챌린지 통계 가져오기
  async getChallengeStats(challengeDate: string): Promise<DailyChallengeStats> {
    // 전체 응답 수
    const { count: totalResponses } = await supabase
      .from('daily_challenge_responses')
      .select('*', { count: 'exact', head: true })
      .eq('challenge_date', challengeDate);

    // 감정 분포
    const { data: responses } = await supabase
      .from('daily_challenge_responses')
      .select('emotion_tags, user_apt_type')
      .eq('challenge_date', challengeDate);

    const emotionCounts: Record<string, number> = {};
    const aptCounts: Record<string, number> = {};
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    responses?.forEach(response => {
      // 감정 카운트
      response.emotion_tags.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });

      // APT 타입 카운트
      aptCounts[response.user_apt_type] = (aptCounts[response.user_apt_type] || 0) + 1;
    });

    // 상위 감정 정리
    const topEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: totalResponses ? (count / (totalResponses * 3)) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total_responses: totalResponses || 0,
      emotion_distribution: emotionCounts,
      apt_distribution: aptCounts,
      avg_response_time: responseTimeCount ? totalResponseTime / responseTimeCount : 0,
      top_emotions: topEmotions
    };
  },

  // 챌린지 진행 상태 가져오기
  async getChallengeProgress(): Promise<ChallengeProgressState> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        hasResponded: false,
        currentStreak: 0,
        longestStreak: 0,
        totalParticipations: 0
      };
    }

    // 오늘 응답했는지 확인
    const today = new Date().toISOString().split('T')[0];
    const todayResponse = await this.getMyResponse(today);

    // 연속 참여 기록 가져오기
    const { data: streak } = await supabase
      .from('user_challenge_streaks')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // 다음 리워드 계산
    let nextReward;
    if (streak) {
      if (streak.current_streak < 7) {
        nextReward = {
          type: '7day_streak' as const,
          daysRemaining: 7 - streak.current_streak
        };
      } else if (streak.current_streak < 30) {
        nextReward = {
          type: '30day_streak' as const,
          daysRemaining: 30 - streak.current_streak
        };
      }
    }

    return {
      hasResponded: !!todayResponse,
      currentStreak: streak?.current_streak || 0,
      longestStreak: streak?.longest_streak || 0,
      totalParticipations: streak?.total_participations || 0,
      nextReward
    };
  },

  // 지난 챌린지 히스토리
  async getChallengeHistory(limit = 30): Promise<ChallengeResponse[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('daily_challenge_responses')
      .select(`
        *,
        challenge:daily_challenge_artworks!challenge_date(*)
      `)
      .eq('user_id', user.id)
      .order('challenge_date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  }
};