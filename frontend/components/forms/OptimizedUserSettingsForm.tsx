'use client';

import { useActionState, useOptimistic, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Save, X } from 'lucide-react';
import { useState } from 'react';

interface UserSettings {
  nickname: string;
  email: string;
  language: 'en' | 'ko';
  notifications: {
    exhibition: boolean;
    artRecommendations: boolean;
    communityUpdates: boolean;
    weeklyInsights: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showLikedArtworks: boolean;
    allowArtisticAnalysis: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    timezone: string;
    artworkDisplayMode: 'grid' | 'masonry' | 'list';
  };
}

type ActionResult = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

// React 19 Actions를 활용한 서버 액션
async function updateUserSettings(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  try {
    // FormData에서 설정 추출
    const settings: Partial<UserSettings> = {
      nickname: formData.get('nickname') as string,
      language: formData.get('language') as 'en' | 'ko',
      notifications: {
        exhibition: formData.get('notifications.exhibition') === 'on',
        artRecommendations: formData.get('notifications.artRecommendations') === 'on',
        communityUpdates: formData.get('notifications.communityUpdates') === 'on',
        weeklyInsights: formData.get('notifications.weeklyInsights') === 'on',
      },
      privacy: {
        profileVisibility: formData.get('privacy.profileVisibility') as 'public' | 'private' | 'friends',
        showLikedArtworks: formData.get('privacy.showLikedArtworks') === 'on',
        allowArtisticAnalysis: formData.get('privacy.allowArtisticAnalysis') === 'on',
      },
      preferences: {
        theme: formData.get('preferences.theme') as 'light' | 'dark' | 'auto',
        timezone: formData.get('preferences.timezone') as string,
        artworkDisplayMode: formData.get('preferences.artworkDisplayMode') as 'grid' | 'masonry' | 'list',
      }
    };

    // API 호출
    const token = localStorage.getItem('token');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settings)
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        message: error.message || 'Failed to update settings',
        errors: error.errors
      };
    }

    return {
      success: true,
      message: '설정이 성공적으로 업데이트되었습니다.'
    };
  } catch (error) {
    return {
      success: false,
      message: '네트워크 오류가 발생했습니다.'
    };
  }
}

export function OptimizedUserSettingsForm({ 
  initialSettings 
}: { 
  initialSettings: UserSettings 
}) {
  // React 19 useActionState로 폼 상태 관리
  const [actionState, submitAction, isPending] = useActionState(updateUserSettings, null);
  
  // React 19 useOptimistic으로 낙관적 업데이트
  const [optimisticSettings, addOptimisticUpdate] = useOptimistic(
    initialSettings,
    (currentSettings, newSettings: Partial<UserSettings>) => ({
      ...currentSettings,
      ...newSettings
    })
  );

  // React 19 useTransition으로 실시간 설정 변경
  const [isPendingPreview, startPreviewTransition] = useTransition();

  const handleInputChange = (
    field: keyof UserSettings,
    value: any,
    subField?: string
  ) => {
    startPreviewTransition(() => {
      const newSettings = subField 
        ? { [field]: { ...optimisticSettings[field], [subField]: value } }
        : { [field]: value };
      
      addOptimisticUpdate(newSettings);
    });
  };

  const handleSubmit = (formData: FormData) => {
    // 낙관적 업데이트
    const optimisticData = Object.fromEntries(formData.entries());
    addOptimisticUpdate(optimisticData as any);
    
    // 실제 업데이트 실행
    submitAction(formData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your SAYU experience
        </p>
      </div>

      {/* 상태 피드백 */}
      {actionState && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            actionState.success 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          {actionState.success ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>{actionState.message}</span>
        </motion.div>
      )}

      <form action={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <section className="bg-card rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nickname
              </label>
              <input
                type="text"
                name="nickname"
                defaultValue={optimisticSettings.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isPending}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Language
              </label>
              <select
                name="language"
                defaultValue={optimisticSettings.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isPending}
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="bg-card rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            {Object.entries(optimisticSettings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </label>
                <input
                  type="checkbox"
                  name={`notifications.${key}`}
                  defaultChecked={value}
                  onChange={(e) => handleInputChange('notifications', e.target.checked, key)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  disabled={isPending}
                />
              </div>
            ))}
          </div>
        </section>

        {/* 개인정보 설정 */}
        <section className="bg-card rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Privacy</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Profile Visibility
              </label>
              <select
                name="privacy.profileVisibility"
                defaultValue={optimisticSettings.privacy.profileVisibility}
                onChange={(e) => handleInputChange('privacy', e.target.value, 'profileVisibility')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isPending}
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Show Liked Artworks
                </label>
                <input
                  type="checkbox"
                  name="privacy.showLikedArtworks"
                  defaultChecked={optimisticSettings.privacy.showLikedArtworks}
                  onChange={(e) => handleInputChange('privacy', e.target.checked, 'showLikedArtworks')}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  disabled={isPending}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Allow Artistic Analysis
                </label>
                <input
                  type="checkbox"
                  name="privacy.allowArtisticAnalysis"
                  defaultChecked={optimisticSettings.privacy.allowArtisticAnalysis}
                  onChange={(e) => handleInputChange('privacy', e.target.checked, 'allowArtisticAnalysis')}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary focus:ring-2"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 환경 설정 */}
        <section className="bg-card rounded-xl p-6 border">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Theme
              </label>
              <select
                name="preferences.theme"
                defaultValue={optimisticSettings.preferences.theme}
                onChange={(e) => handleInputChange('preferences', e.target.value, 'theme')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isPending}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Artwork Display
              </label>
              <select
                name="preferences.artworkDisplayMode"
                defaultValue={optimisticSettings.preferences.artworkDisplayMode}
                onChange={(e) => handleInputChange('preferences', e.target.value, 'artworkDisplayMode')}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isPending}
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="list">List</option>
              </select>
            </div>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* 실시간 미리보기 */}
      {isPendingPreview && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating preview...
          </div>
        </motion.div>
      )}
    </div>
  );
}