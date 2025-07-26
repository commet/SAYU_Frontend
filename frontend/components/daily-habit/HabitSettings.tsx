'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Bell, 
  BellOff, 
  Clock, 
  Smartphone, 
  Mail,
  Calendar,
  Save
} from 'lucide-react';
import { dailyHabitApi, HabitSettings as IHabitSettings } from '@/lib/api/daily-habit';
import { pushService, isPushNotificationSupported } from '@/lib/push-notifications';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-hot-toast';

interface HabitSettingsProps {
  onClose: () => void;
}

const timezones = [
  { value: 'Asia/Seoul', label: '한국 시간 (KST)' },
  { value: 'America/New_York', label: '동부 시간 (EST)' },
  { value: 'America/Los_Angeles', label: '서부 시간 (PST)' },
  { value: 'Europe/London', label: '영국 시간 (GMT)' },
  { value: 'Asia/Tokyo', label: '일본 시간 (JST)' }
];

const weekdays = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' }
];

export default function HabitSettings({ onClose }: HabitSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<IHabitSettings>({
    morningTime: '08:00',
    lunchTime: '12:30',
    nightTime: '22:00',
    morningEnabled: true,
    lunchEnabled: true,
    nightEnabled: true,
    pushEnabled: false,
    emailReminder: false,
    timezone: 'Asia/Seoul',
    activeDays: [1, 2, 3, 4, 5]
  });
  const [pushSupported, setPushSupported] = useState(false);
  const [pushSubscribed, setPushSubscribed] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPushSupport();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await dailyHabitApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('설정을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const checkPushSupport = async () => {
    const supported = isPushNotificationSupported();
    setPushSupported(supported);
    
    if (supported) {
      await pushService.registerServiceWorker();
      const subscribed = await pushService.isSubscribed();
      setPushSubscribed(subscribed);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    if (!pushSupported) {
      toast.error('이 브라우저는 푸시 알림을 지원하지 않습니다');
      return;
    }

    if (enabled) {
      const permission = await pushService.requestPermission();
      if (!permission) {
        toast.error('알림 권한이 필요합니다');
        return;
      }

      const subscribed = await pushService.subscribeToPush();
      if (subscribed) {
        setPushSubscribed(true);
        setSettings(prev => ({ ...prev, pushEnabled: true }));
        toast.success('푸시 알림이 활성화되었습니다');
      } else {
        toast.error('푸시 알림 설정에 실패했습니다');
      }
    } else {
      const unsubscribed = await pushService.unsubscribeFromPush();
      if (unsubscribed) {
        setPushSubscribed(false);
        setSettings(prev => ({ ...prev, pushEnabled: false }));
        toast.success('푸시 알림이 비활성화되었습니다');
      }
    }
  };

  const handleActiveDaysChange = (day: number, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      activeDays: checked
        ? [...(prev.activeDays || []), day].sort()
        : (prev.activeDays || []).filter(d => d !== day)
    }));
  };

  const handleTestNotification = async () => {
    try {
      await pushService.sendTestNotification();
      toast.success('테스트 알림을 전송했습니다');
    } catch (error) {
      toast.error('테스트 알림 전송에 실패했습니다');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await dailyHabitApi.updateSettings(settings);
      toast.success('설정이 저장되었습니다');
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('설정 저장에 실패했습니다');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">알림 설정</h2>
                <p className="text-gray-600">Daily Art Habit 알림을 맞춤 설정하세요</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Push Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-blue-500" />
                <div>
                  <h3 className="font-semibold">푸시 알림</h3>
                  <p className="text-sm text-gray-600">모바일 및 브라우저 알림</p>
                </div>
              </div>
              <Switch
                checked={settings.pushEnabled && pushSubscribed}
                onCheckedChange={handlePushToggle}
                disabled={!pushSupported}
              />
            </div>

            {!pushSupported && (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                이 브라우저는 푸시 알림을 지원하지 않습니다
              </p>
            )}

            {pushSupported && settings.pushEnabled && (
              <Button
                variant="outline"
                onClick={handleTestNotification}
                className="w-full gap-2"
              >
                <Bell className="w-4 h-4" />
                테스트 알림 보내기
              </Button>
            )}
          </Card>

          {/* Time Settings */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              알림 시간 설정
            </h3>

            <div className="space-y-4">
              {/* Morning */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.morningEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, morningEnabled: checked }))
                    }
                  />
                  <Label>출근길 3분 (오전)</Label>
                </div>
                <Input
                  type="time"
                  value={settings.morningTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, morningTime: e.target.value }))}
                  className="w-32"
                  disabled={!settings.morningEnabled}
                />
              </div>

              {/* Lunch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.lunchEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, lunchEnabled: checked }))
                    }
                  />
                  <Label>점심시간 5분 (오후)</Label>
                </div>
                <Input
                  type="time"
                  value={settings.lunchTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, lunchTime: e.target.value }))}
                  className="w-32"
                  disabled={!settings.lunchEnabled}
                />
              </div>

              {/* Night */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={settings.nightEnabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, nightEnabled: checked }))
                    }
                  />
                  <Label>잠들기 전 10분 (밤)</Label>
                </div>
                <Input
                  type="time"
                  value={settings.nightTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, nightTime: e.target.value }))}
                  className="w-32"
                  disabled={!settings.nightEnabled}
                />
              </div>
            </div>
          </Card>

          {/* Active Days */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              활성 요일
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {weekdays.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={(settings.activeDays || []).includes(day.value)}
                    onCheckedChange={(checked) => 
                      handleActiveDaysChange(day.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Additional Settings */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">기타 설정</h3>
            
            <div className="space-y-4">
              {/* Email Reminder */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <Label>이메일 리마인더</Label>
                    <p className="text-sm text-gray-600">주간 리포트 및 특별 알림</p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailReminder}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailReminder: checked }))
                  }
                />
              </div>

              {/* Timezone */}
              <div>
                <Label className="text-sm font-medium">시간대</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => 
                    setSettings(prev => ({ ...prev, timezone: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2"
            size="lg"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}