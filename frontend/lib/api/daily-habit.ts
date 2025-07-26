import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Daily Habit API client
export const dailyHabitApi = {
  // 습관 설정
  async getSettings() {
    const response = await axios.get(`${API_URL}/api/daily-habit/settings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async updateSettings(settings: HabitSettings) {
    const response = await axios.put(`${API_URL}/api/daily-habit/settings`, settings, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // 일일 기록
  async getTodayEntry() {
    const response = await axios.get(`${API_URL}/api/daily-habit/today`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async getDateEntry(date: string) {
    const response = await axios.get(`${API_URL}/api/daily-habit/entry/${date}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // 시간대별 활동
  async recordMorning(data: MorningActivity) {
    const response = await axios.post(`${API_URL}/api/daily-habit/morning`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async recordLunch(data: LunchActivity) {
    const response = await axios.post(`${API_URL}/api/daily-habit/lunch`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async recordNight(data: NightActivity) {
    const response = await axios.post(`${API_URL}/api/daily-habit/night`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // 추천 작품
  async getRecommendation(timeSlot: 'morning' | 'lunch' | 'night') {
    const response = await axios.get(`${API_URL}/api/daily-habit/recommendation/${timeSlot}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // 감정 체크인
  async checkInEmotion(data: EmotionCheckIn) {
    const response = await axios.post(`${API_URL}/api/daily-habit/emotion/checkin`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // 푸시 알림
  async subscribePush(subscription: PushSubscription) {
    const response = await axios.post(`${API_URL}/api/daily-habit/push/subscribe`, subscription, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async testPush() {
    const response = await axios.post(`${API_URL}/api/daily-habit/push/test`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // 통계
  async getStreak() {
    const response = await axios.get(`${API_URL}/api/daily-habit/streak`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async getActivityPatterns() {
    const response = await axios.get(`${API_URL}/api/daily-habit/patterns`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  async getMonthlyStats(year: number, month: number) {
    const response = await axios.get(`${API_URL}/api/daily-habit/stats/${year}/${month}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
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