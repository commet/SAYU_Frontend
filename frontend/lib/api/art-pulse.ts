import { supabase } from '@/lib/supabase';
import type { 
  ArtPulseSession, 
  ArtPulseParticipation,
  ArtPulseAnalytics,
  TouchData,
  ResonanceData 
} from '@/types/art-pulse';

export class ArtPulseAPI {
  // 오늘의 Art Pulse 세션 가져오기
  async getTodaySession(): Promise<ArtPulseSession | null> {
    const today = new Date();
    today.setHours(19, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('art_pulse_sessions')
      .select('*')
      .gte('startTime', today.toISOString())
      .lt('startTime', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (error) {
      console.error('Error fetching today session:', error);
      return null;
    }

    return data;
  }

  // Art Pulse 세션 생성 (매일 자동으로 생성되어야 함)
  async createSession(dailyChallengeId: string): Promise<ArtPulseSession | null> {
    const now = new Date();
    const startTime = new Date(now);
    startTime.setHours(19, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(25);

    const { data, error } = await supabase
      .from('art_pulse_sessions')
      .insert({
        daily_challenge_id: dailyChallengeId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'scheduled'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return null;
    }

    return this.transformSession(data);
  }

  // 세션 참여
  async joinSession(sessionId: string, userId: string, aptType: string): Promise<ArtPulseParticipation | null> {
    const { data, error } = await supabase
      .from('art_pulse_participations')
      .insert({
        session_id: sessionId,
        user_id: userId,
        apt_type: aptType,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error joining session:', error);
      return null;
    }

    return this.transformParticipation(data);
  }

  // 터치 데이터 저장
  async saveTouchData(
    participationId: string, 
    touches: TouchData[]
  ): Promise<boolean> {
    const { error } = await supabase
      .from('art_pulse_participations')
      .update({
        touch_data: touches
      })
      .eq('id', participationId);

    if (error) {
      console.error('Error saving touch data:', error);
      return false;
    }

    return true;
  }

  // 공명 데이터 저장
  async saveResonanceData(
    participationId: string,
    resonance: ResonanceData
  ): Promise<boolean> {
    const { error } = await supabase
      .from('art_pulse_participations')
      .update({
        resonance_data: resonance
      })
      .eq('id', participationId);

    if (error) {
      console.error('Error saving resonance data:', error);
      return false;
    }

    return true;
  }

  // 세션 종료 시 참여 데이터 완료 처리
  async completeParticipation(
    participationId: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('art_pulse_participations')
      .update({
        left_at: new Date().toISOString()
      })
      .eq('id', participationId);

    if (error) {
      console.error('Error completing participation:', error);
      return false;
    }

    return true;
  }

  // 세션 분석 데이터 가져오기
  async getSessionAnalytics(sessionId: string): Promise<ArtPulseAnalytics | null> {
    // 참여 데이터 집계
    const { data: participations, error } = await supabase
      .from('art_pulse_participations')
      .select('*')
      .eq('session_id', sessionId);

    if (error || !participations) {
      console.error('Error fetching analytics:', error);
      return null;
    }

    // 히트맵 데이터 생성
    const allTouches = participations.flatMap(p => p.touch_data || []);
    const heatmapData = this.generateHeatmap(allTouches);

    // 공명 분포 계산
    const resonanceDistribution = this.calculateResonanceDistribution(participations);

    // APT 타입 분포
    const aptTypeDistribution = participations.reduce((acc, p) => {
      acc[p.apt_type] = (acc[p.apt_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 평균 체류 시간
    const averageDwellTime = this.calculateAverageDwellTime(participations);

    return {
      sessionId,
      heatmapData,
      resonanceDistribution,
      aptTypeDistribution,
      averageDwellTime,
      peakConcurrentUsers: participations.length,
      engagementScore: this.calculateEngagementScore(participations)
    };
  }

  // 내 Art Pulse 히스토리
  async getMyHistory(userId: string, limit = 10): Promise<ArtPulseParticipation[]> {
    const { data, error } = await supabase
      .from('art_pulse_participations')
      .select(`
        *,
        session:art_pulse_sessions(*)
      `)
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching history:', error);
      return [];
    }

    return data.map(d => this.transformParticipation(d));
  }

  // Helper functions
  private transformSession(data: any): ArtPulseSession {
    return {
      id: data.id,
      dailyChallengeId: data.daily_challenge_id,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      status: data.status,
      participantCount: data.participant_count || 0,
      createdAt: new Date(data.created_at)
    };
  }

  private transformParticipation(data: any): ArtPulseParticipation {
    return {
      id: data.id,
      sessionId: data.session_id,
      userId: data.user_id,
      aptType: data.apt_type,
      joinedAt: new Date(data.joined_at),
      leftAt: data.left_at ? new Date(data.left_at) : undefined,
      touchData: data.touch_data || [],
      resonanceData: data.resonance_data || {
        type: null,
        intensity: 5,
        focusAreas: [],
        dwellTime: 0
      }
    };
  }

  private generateHeatmap(touches: TouchData[]) {
    const gridSize = 50;
    const heatmap: Record<string, number> = {};

    touches.forEach(touch => {
      const gridX = Math.floor(touch.x * gridSize);
      const gridY = Math.floor(touch.y * gridSize);
      const key = `${gridX},${gridY}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return Object.entries(heatmap).map(([key, value]) => {
      const [x, y] = key.split(',').map(Number);
      return {
        x: x / gridSize,
        y: y / gridSize,
        value
      };
    });
  }

  private calculateResonanceDistribution(participations: any[]) {
    const counts = { sensory: 0, emotional: 0, cognitive: 0 };
    
    participations.forEach(p => {
      if (p.resonance_data?.type) {
        counts[p.resonance_data.type]++;
      }
    });

    return counts;
  }

  private calculateAverageDwellTime(participations: any[]) {
    const dwellTimes = participations
      .filter(p => p.joined_at && p.left_at)
      .map(p => new Date(p.left_at).getTime() - new Date(p.joined_at).getTime());

    if (dwellTimes.length === 0) return 0;
    
    return dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length;
  }

  private calculateEngagementScore(participations: any[]) {
    let score = 0;
    
    participations.forEach(p => {
      // 터치 데이터 점수
      score += (p.touch_data?.length || 0) * 0.1;
      
      // 공명 선택 점수
      if (p.resonance_data?.type) score += 10;
      
      // 체류 시간 점수
      if (p.joined_at && p.left_at) {
        const duration = new Date(p.left_at).getTime() - new Date(p.joined_at).getTime();
        score += Math.min(duration / 60000, 20); // 최대 20점
      }
    });

    return Math.min(score / participations.length, 100);
  }
}

export const artPulseAPI = new ArtPulseAPI();