import { api } from './client';

export interface PioneerStats {
  total_pioneers: number;
  latest_pioneer_number: number;
  new_today: number;
  new_this_week: number;
}

export interface PioneerProfile {
  id: string;
  pioneer_number: number;
  nickname: string;
  joined_date: string;
  apt_result?: any;
}

// Pioneer 통계 조회
export async function getPioneerStats(): Promise<PioneerStats> {
  try {
    const response = await api.get('/pioneer/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pioneer stats:', error);
    // 기본값 반환
    return {
      total_pioneers: 0,
      latest_pioneer_number: 0,
      new_today: 0,
      new_this_week: 0
    };
  }
}

// 특정 사용자의 Pioneer 정보 조회
export async function getPioneerProfile(userId: string): Promise<PioneerProfile | null> {
  try {
    const response = await api.get(`/pioneer/profile/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch pioneer profile:', error);
    return null;
  }
}