// Base fetch with auth
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { createClient } = await import('../supabase/client');
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token || null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

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
    const response = await fetchWithAuth('/api/journey/status');
    return response;
  } catch (error) {
    console.error('Failed to fetch journey status:', error);
    return null;
  }
}

// 오늘의 안내 메시지 조회
export async function getTodaysNudge(): Promise<TodaysNudge | null> {
  try {
    const response = await fetchWithAuth('/api/journey/todays-nudge');
    return response.nudge;
  } catch (error) {
    console.error('Failed to fetch todays nudge:', error);
    return null;
  }
}

// nudge 확인 처리
export async function markNudgeAsViewed(dayNumber: number): Promise<boolean> {
  try {
    await fetchWithAuth(`/api/journey/nudge/${dayNumber}/view`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Failed to mark nudge as viewed:', error);
    return false;
  }
}

// nudge 클릭 처리
export async function markNudgeAsClicked(dayNumber: number): Promise<boolean> {
  try {
    await fetchWithAuth(`/api/journey/nudge/${dayNumber}/click`, {
      method: 'POST'
    });
    return true;
  } catch (error) {
    console.error('Failed to mark nudge as clicked:', error);
    return false;
  }
}