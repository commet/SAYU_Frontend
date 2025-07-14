import { api } from './api';

export interface EmailPreferences {
  id: string;
  user_id: string;
  welcome_series: boolean;
  weekly_insights: boolean;
  achievement_notifications: boolean;
  re_engagement: boolean;
  profile_reminders: boolean;
  curators_pick: boolean;
  marketing: boolean;
  frequency_preference: 'minimal' | 'normal' | 'frequent';
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailAnalytics {
  email_type: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
}

export interface EmailApiResponse<T = any> {
  success?: boolean;
  message?: string;
  error?: string;
  data?: T;
}

/**
 * Get user's email preferences
 */
export async function getEmailPreferences(): Promise<EmailPreferences> {
  const response = await api.get('/api/email/preferences');
  return response.data.preferences;
}

/**
 * Update user's email preferences
 */
export async function updateEmailPreferences(
  preferences: Partial<Omit<EmailPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<EmailPreferences> {
  const response = await api.put('/api/email/preferences', preferences);
  return response.data.preferences;
}

/**
 * Unsubscribe from all emails
 */
export async function unsubscribeFromEmails(email: string): Promise<void> {
  await api.post('/api/email/unsubscribe', { email });
}

/**
 * Verify email address
 */
export async function verifyEmail(token: string): Promise<void> {
  await api.post('/api/email/verify', { token });
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(): Promise<void> {
  await api.post('/api/email/send-verification');
}

/**
 * Get email analytics (admin only)
 */
export async function getEmailAnalytics(): Promise<EmailAnalytics[]> {
  const response = await api.get('/api/email/analytics');
  return response.data.analytics;
}

/**
 * Trigger email campaign manually (admin only)
 */
export async function triggerEmailCampaign(campaign: 'weekly-insights' | 're-engagement'): Promise<void> {
  await api.post(`/api/email/trigger/${campaign}`);
}

/**
 * Send test email (development only)
 */
export async function sendTestEmail(templateName: string, email?: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test emails are not available in production');
  }
  
  await api.post('/api/email/test', { 
    templateName, 
    email 
  });
}

/**
 * Email template names available for testing
 */
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email-verification',
  PASSWORD_RESET: 'password-reset',
  WEEKLY_INSIGHTS: 'weekly-insights',
  ACHIEVEMENT: 'achievement',
  NUDGE: 'nudge',
  COMEBACK: 'comeback',
  PROFILE_REMINDER: 'profile-reminder',
  CURATORS_PICK: 'curators-pick'
} as const;

export type EmailTemplate = typeof EMAIL_TEMPLATES[keyof typeof EMAIL_TEMPLATES];