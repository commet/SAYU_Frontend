import { api } from './client';

export interface JourneyDay {
  day_number: number;
  nudge_type: string;
  title: string;
  message: string;
  cta_text?: string;
  cta_link?: string;
  sent_at?: string;
  viewed_at?: string;
  clicked_at?: string;
  status: 'pending' | 'unread' | 'read' | 'completed';
}

export interface JourneyStatus {
  journey_days: JourneyDay[];
  total_days: number;
  completed_days: number;
}

export interface TodaysNudge {
  day_number: number;
  nudge_type: string;
  title: string;
  message: string;
  cta_text?: string;
  cta_link?: string;
  sent_at: string;
}

// 사용자 여정 상태 조회
export async function getJourneyStatus(): Promise<JourneyStatus | null> {
  try {
    const response = await api.get('/journey/status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch journey status:', error);
    return null;
  }
}

// 오늘의 안내 메시지 조회
export async function getTodaysNudge(): Promise<TodaysNudge | null> {
  try {
    const response = await api.get('/journey/todays-nudge');
    return response.data.nudge;
  } catch (error) {
    console.error('Failed to fetch todays nudge:', error);
    return null;
  }
}

// nudge 확인 처리
export async function markNudgeAsViewed(dayNumber: number): Promise<boolean> {
  try {
    await api.post(`/journey/nudge/${dayNumber}/view`);
    return true;
  } catch (error) {
    console.error('Failed to mark nudge as viewed:', error);
    return false;
  }
}

// nudge 클릭 처리
export async function markNudgeAsClicked(dayNumber: number): Promise<boolean> {
  try {
    await api.post(`/journey/nudge/${dayNumber}/click`);
    return true;
  } catch (error) {
    console.error('Failed to mark nudge as clicked:', error);
    return false;
  }
}