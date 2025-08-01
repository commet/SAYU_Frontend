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

// Daily Habit API client
export const dailyHabitApi = {
  // 습관 설정
  async getSettings() {
    return fetchWithAuth('/api/daily-habit/settings');
  },

  async updateSettings(settings: HabitSettings) {
    return fetchWithAuth('/api/daily-habit/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  },

  // 일일 기록
  async getTodayEntry() {
    return fetchWithAuth('/api/daily-habit/today');
  },

  async getDateEntry(date: string) {
    return fetchWithAuth(`/api/daily-habit/entry/${date}`);
  },

  // 시간대별 활동
  async recordMorning(data: MorningActivity) {
    return fetchWithAuth('/api/daily-habit/morning', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async recordLunch(data: LunchActivity) {
    return fetchWithAuth('/api/daily-habit/lunch', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async recordNight(data: NightActivity) {
    return fetchWithAuth('/api/daily-habit/night', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 추천 작품
  async getRecommendation(timeSlot: 'morning' | 'lunch' | 'night') {
    return fetchWithAuth(`/api/daily-habit/recommendation/${timeSlot}`);
  },

  // 감정 체크인
  async checkInEmotion(data: EmotionCheckIn) {
    return fetchWithAuth('/api/daily-habit/emotion/checkin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // 푸시 알림
  async subscribePush(subscription: PushSubscription) {
    return fetchWithAuth('/api/daily-habit/push/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription)
    });
  },

  async testPush() {
    return fetchWithAuth('/api/daily-habit/push/test', {
      method: 'POST',
      body: JSON.stringify({})
    });
  },

  // 통계
  async getStreak() {
    return fetchWithAuth('/api/daily-habit/streak');
  },

  async getActivityPatterns() {
    return fetchWithAuth('/api/daily-habit/patterns');
  },

  async getMonthlyStats(year: number, month: number) {
    return fetchWithAuth(`/api/daily-habit/stats/${year}/${month}`);
  }
};

// Types
export interface HabitSettings {
  morningTime?: string;
  lunchTime?: string;
  nightTime?: string;
  morningEnabled?: boolean;
  lunchEnabled?: boolean;
  nightEnabled?: boolean;
  pushEnabled?: boolean;
  emailReminder?: boolean;
  timezone?: string;
  activeDays?: number[];
}

export interface MorningActivity {
  date?: string;
  artworkId: string;
  question: string;
  response: string;
  color: string;
}

export interface LunchActivity {
  date?: string;
  emotion: string;
  artworkId: string;
  reason: string;
}

export interface NightActivity {
  date?: string;
  artworkId: string;
  reflection: string;
  moodTags: string[];
}

export interface EmotionCheckIn {
  timeOfDay: 'morning' | 'lunch' | 'night';
  emotion: string;
  artworkId?: string;
  secondaryEmotions?: string[];
  energyLevel?: number;
  stressLevel?: number;
  notes?: string;
}

export interface DailyEntry {
  id: string;
  entry_date: string;
  morning_artwork_id?: string;
  morning_question?: string;
  morning_response?: string;
  morning_color?: string;
  morning_completed_at?: string;
  lunch_emotion?: string;
  lunch_artwork_id?: string;
  lunch_reason?: string;
  lunch_completed_at?: string;
  night_artwork_id?: string;
  night_reflection?: string;
  night_mood_tags?: string[];
  night_completed_at?: string;
  daily_completion_rate: number;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
  total_days: number;
  last_activity_date: string;
  achieved_7_days: boolean;
  achieved_30_days: boolean;
  achieved_100_days: boolean;
}