'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Users, MessageSquare, Sprout, Building2, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  RELATIONSHIP_TYPES, 
  ROMANCE_OPENNESS_OPTIONS, 
  GENDER_PREFERENCE_OPTIONS,
  PRIVACY_OPTIONS
} from '@/types/relationship';
import type { RelationshipPreferences, RelationshipBoundaries } from '@/types/relationship';

const RELATIONSHIP_TYPE_INFO = [
  {
    code: RELATIONSHIP_TYPES.ART_FRIEND,
    icon: <Users className="h-5 w-5" />,
    name: '취향 친구',
    description: '예술 취향을 공유하며 함께 성장하는 친구'
  },
  {
    code: RELATIONSHIP_TYPES.CONVERSATION,
    icon: <MessageSquare className="h-5 w-5" />,
    name: '대화 상대',
    description: '작품에 대해 깊이 있는 대화를 나누는 상대'
  },
  {
    code: RELATIONSHIP_TYPES.ROMANCE_OPEN,
    icon: <Heart className="h-5 w-5" />,
    name: '로맨스 가능',
    description: '친구로 시작하되 로맨스로 발전 가능한 관계'
  },
  {
    code: RELATIONSHIP_TYPES.MENTOR,
    icon: <Sprout className="h-5 w-5" />,
    name: '멘토/멘티',
    description: '예술적 성장을 돕고 배우는 관계'
  },
  {
    code: RELATIONSHIP_TYPES.COMPANION,
    icon: <Building2 className="h-5 w-5" />,
    name: '전시 동행',
    description: '함께 전시를 관람하는 편안한 동반자'
  }
];

export function RelationshipPreferences() {
  const [preferences, setPreferences] = useState<RelationshipPreferences>({
    seeking_types: [],
    romance_openness: 0,
    gender_preference: 'any',
    age_preference: [25, 45],
    location_range: 10
  });
  
  const [boundaries, setBoundaries] = useState<Partial<RelationshipBoundaries>>({
    show_real_name_after: 'mutual_agreement',
    share_contact_after: 'first_meeting',
    auto_decline_if_no_photo: false,
    auto_decline_incomplete_profiles: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 관계 선호도 가져오기
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('relationship_preferences')
        .eq('user_id', user.id)
        .single();

      if (profile?.relationship_preferences) {
        setPreferences(profile.relationship_preferences);
      }

      // 경계 설정 가져오기
      const { data: boundaryData } = await supabase
        .from('relationship_boundaries')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (boundaryData) {
        setBoundaries(boundaryData);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.rpc('update_relationship_preferences', {
        p_seeking_types: preferences.seeking_types,
        p_romance_openness: preferences.romance_openness,
        p_age_preference: preferences.age_preference,
        p_gender_preference: preferences.gender_preference,
        p_location_range: preferences.location_range
      });

      if (error) throw error;

      // 경계 설정 업데이트
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('relationship_boundaries')
          .upsert({
            user_id: user.id,
            ...boundaries,
            updated_at: new Date().toISOString()
          });
      }

      toast({
        title: '설정이 저장되었습니다',
        description: '관계 선호도가 업데이트되었습니다'
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast({
        title: '저장에 실패했습니다',
        description: '다시 시도해주세요',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSeekingType = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      seeking_types: prev.seeking_types.includes(type)
        ? prev.seeking_types.filter(t => t !== type)
        : [...prev.seeking_types, type]
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 찾는 관계 유형 */}
      <Card>
        <CardHeader>
          <CardTitle>어떤 관계를 찾고 계신가요?</CardTitle>
          <CardDescription>
            원하는 관계 유형을 모두 선택해주세요 (복수 선택 가능)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {RELATIONSHIP_TYPE_INFO.map((type) => (
            <div
              key={type.code}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
              onClick={() => toggleSeekingType(type.code)}
            >
              <Checkbox
                checked={preferences.seeking_types.includes(type.code)}
                onCheckedChange={() => toggleSeekingType(type.code)}
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {type.icon}
                  <Label className="font-medium cursor-pointer">
                    {type.name}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {type.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 로맨스 개방성 */}
      {preferences.seeking_types.includes(RELATIONSHIP_TYPES.ROMANCE_OPEN) && (
        <Card>
          <CardHeader>
            <CardTitle>로맨스에 대한 마음</CardTitle>
            <CardDescription>
              로맨틱한 관계로의 발전에 대해 어떻게 생각하시나요?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider
                value={[preferences.romance_openness || 0]}
                onValueChange={([value]) => 
                  setPreferences(prev => ({ ...prev, romance_openness: value }))
                }
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                {ROMANCE_OPENNESS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => 
                      setPreferences(prev => ({ ...prev, romance_openness: option.value }))
                    }
                    className={`text-center px-2 py-1 rounded ${
                      Math.abs((preferences.romance_openness || 0) - option.value) < 0.05
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {ROMANCE_OPENNESS_OPTIONS.find(
                  o => Math.abs((preferences.romance_openness || 0) - o.value) < 0.15
                )?.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 매칭 선호도 */}
      <Card>
        <CardHeader>
          <CardTitle>매칭 선호도</CardTitle>
          <CardDescription>
            더 나은 매칭을 위한 선호 사항을 설정해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 성별 선호 */}
          <div className="space-y-2">
            <Label>선호하는 상대 성별</Label>
            <RadioGroup
              value={preferences.gender_preference}
              onValueChange={(value) => 
                setPreferences(prev => ({ ...prev, gender_preference: value as any }))
              }
            >
              {GENDER_PREFERENCE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 연령대 선호 */}
          <div className="space-y-2">
            <Label>선호하는 연령대</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm w-12">{preferences.age_preference?.[0]}세</span>
              <Slider
                value={preferences.age_preference}
                onValueChange={(value) => 
                  setPreferences(prev => ({ ...prev, age_preference: value as [number, number] }))
                }
                min={20}
                max={60}
                step={1}
                className="flex-1"
              />
              <span className="text-sm w-12">{preferences.age_preference?.[1]}세</span>
            </div>
          </div>

          {/* 거리 범위 */}
          <div className="space-y-2">
            <Label>활동 거리 범위</Label>
            <div className="flex items-center gap-4">
              <Slider
                value={[preferences.location_range || 10]}
                onValueChange={([value]) => 
                  setPreferences(prev => ({ ...prev, location_range: value }))
                }
                min={5}
                max={50}
                step={5}
                className="flex-1"
              />
              <span className="text-sm w-16">{preferences.location_range}km</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프라이버시 & 경계 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            프라이버시 설정
          </CardTitle>
          <CardDescription>
            개인정보 공개 범위를 설정해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 실명 공개 */}
          <div className="space-y-2">
            <Label>실명 공개 시점</Label>
            <RadioGroup
              value={boundaries.show_real_name_after}
              onValueChange={(value) => 
                setBoundaries(prev => ({ ...prev, show_real_name_after: value as any }))
              }
            >
              {PRIVACY_OPTIONS.showRealName.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`name-${option.value}`} />
                  <Label htmlFor={`name-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* 연락처 공개 */}
          <div className="space-y-2">
            <Label>연락처 공개 시점</Label>
            <RadioGroup
              value={boundaries.share_contact_after}
              onValueChange={(value) => 
                setBoundaries(prev => ({ ...prev, share_contact_after: value as any }))
              }
            >
              {PRIVACY_OPTIONS.shareContact.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`contact-${option.value}`} />
                  <Label htmlFor={`contact-${option.value}`} className="font-normal cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* 자동 거절 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="no-photo">프로필 사진 없는 사용자 자동 거절</Label>
                <p className="text-sm text-muted-foreground">
                  프로필 사진이 없는 사용자의 요청을 자동으로 거절합니다
                </p>
              </div>
              <Switch
                id="no-photo"
                checked={boundaries.auto_decline_if_no_photo}
                onCheckedChange={(checked) => 
                  setBoundaries(prev => ({ ...prev, auto_decline_if_no_photo: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="incomplete">미완성 프로필 자동 거절</Label>
                <p className="text-sm text-muted-foreground">
                  프로필이 50% 미만인 사용자의 요청을 자동으로 거절합니다
                </p>
              </div>
              <Switch
                id="incomplete"
                checked={boundaries.auto_decline_incomplete_profiles}
                onCheckedChange={(checked) => 
                  setBoundaries(prev => ({ ...prev, auto_decline_incomplete_profiles: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || preferences.seeking_types.length === 0}
          size="lg"
        >
          {isSaving ? '저장 중...' : '설정 저장'}
        </Button>
      </div>
    </div>
  );
}