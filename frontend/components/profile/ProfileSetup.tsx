'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Palette, 
  Check, 
  ChevronRight, 
  Loader2,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userProfileApi, ProfileSetupData, UserProfile } from '@/lib/api/user-profile';
import { useUser } from '@supabase/auth-helpers-react';
import { cn } from '@/lib/utils';

interface ProfileSetupProps {
  onComplete?: (profile: UserProfile) => void;
  initialData?: {
    apt_type: string;
    apt_dimensions: {
      G_vs_S: number;
      A_vs_R: number;
      M_vs_E: number;
      F_vs_S: number;
    };
  };
}

export function ProfileSetup({ onComplete, initialData }: ProfileSetupProps) {
  const user = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileSetupData>({
    username: '',
    full_name: user?.user_metadata?.full_name || '',
    apt_type: initialData?.apt_type || 'LAEF',
    apt_dimensions: initialData?.apt_dimensions || {
      G_vs_S: 75,
      A_vs_R: 70,
      M_vs_E: 65,
      F_vs_S: 80
    }
  });
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const aptInfo = userProfileApi.getAPTDescription(formData.apt_type);

  // 사용자명 제안 생성
  useEffect(() => {
    if (formData.apt_type) {
      const suggestions = userProfileApi.generateUsername(formData.apt_type, formData.full_name);
      setSuggestedUsernames(suggestions);
    }
  }, [formData.apt_type, formData.full_name]);

  // 사용자명 중복 확인
  useEffect(() => {
    if (formData.username.length >= 3) {
      const checkUsername = async () => {
        try {
          const available = await userProfileApi.checkUsernameAvailability(formData.username);
          setUsernameAvailable(available);
        } catch (error) {
          console.error('Failed to check username:', error);
          setUsernameAvailable(null);
        }
      };

      const timeoutId = setTimeout(checkUsername, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setUsernameAvailable(null);
    }
  }, [formData.username]);

  const handleSubmit = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const profile = await userProfileApi.setupProfile(formData);
      
      if (onComplete) {
        onComplete(profile);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Profile setup failed:', error);
      alert('프로필 설정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = formData.username.length >= 3 && usernameAvailable === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-8">
      <div className="container mx-auto max-w-2xl px-4">
        {/* 진행률 표시 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold">프로필 설정</h1>
            <p className="text-muted-foreground">SAYU에서 사용할 프로필을 설정해주세요</p>
          </div>
          <Progress value={100} className="h-2" />
        </motion.div>

        {/* APT 정보 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                  🎨
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{aptInfo.name}</h3>
                    <Badge variant="outline">{formData.apt_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {aptInfo.description}
                  </p>
                  <Badge className="text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    {aptInfo.artMovement}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 프로필 설정 폼 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                기본 정보
              </CardTitle>
              <CardDescription>
                다른 사용자들에게 보여질 정보를 설정해주세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 전체 이름 */}
              <div className="space-y-2">
                <Label htmlFor="fullName">이름 (선택사항)</Label>
                <Input
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="실제 이름을 입력해주세요"
                />
                <p className="text-xs text-muted-foreground">
                  이름은 프로필에서만 표시되며, 다른 사용자에게는 사용자명이 보입니다.
                </p>
              </div>

              {/* 사용자명 */}
              <div className="space-y-2">
                <Label htmlFor="username">
                  사용자명 *
                  {usernameAvailable === true && (
                    <Check className="w-4 h-4 text-green-500 inline ml-2" />
                  )}
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  placeholder="사용자명을 입력해주세요"
                  className={cn(
                    "transition-colors",
                    usernameAvailable === true && "border-green-500",
                    usernameAvailable === false && "border-red-500"
                  )}
                />
                {formData.username && (
                  <div className="text-sm">
                    {usernameAvailable === true && (
                      <p className="text-green-600 flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        사용 가능한 사용자명입니다
                      </p>
                    )}
                    {usernameAvailable === false && (
                      <p className="text-red-600">
                        이미 사용 중인 사용자명입니다
                      </p>
                    )}
                  </div>
                )}

                {/* 사용자명 제안 */}
                {suggestedUsernames.length > 0 && !formData.username && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">추천 사용자명:</p>
                    <div className="flex gap-2 flex-wrap">
                      {suggestedUsernames.slice(0, 3).map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setFormData({ ...formData, username: suggestion })}
                          className="text-xs"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* APT 차원 점수 표시 */}
              <div className="space-y-4">
                <Label>예술 성향 점수</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>세계적 ← → 구체적</span>
                      <span>{formData.apt_dimensions.G_vs_S}%</span>
                    </div>
                    <Progress value={formData.apt_dimensions.G_vs_S} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>추상적 ← → 구상적</span>
                      <span>{formData.apt_dimensions.A_vs_R}%</span>
                    </div>
                    <Progress value={formData.apt_dimensions.A_vs_R} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>현대적 ← → 고전적</span>
                      <span>{formData.apt_dimensions.M_vs_E}%</span>
                    </div>
                    <Progress value={formData.apt_dimensions.M_vs_E} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>감정적 ← → 구조적</span>
                      <span>{formData.apt_dimensions.F_vs_S}%</span>
                    </div>
                    <Progress value={formData.apt_dimensions.F_vs_S} className="h-2" />
                  </div>
                </div>
              </div>

              {/* 제출 버튼 */}
              <div className="pt-4">
                <Button 
                  onClick={handleSubmit}
                  disabled={!canProceed || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      프로필 설정 중...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      프로필 설정 완료
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {!canProceed && formData.username.length >= 3 && usernameAvailable !== true && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    사용 가능한 사용자명을 선택해주세요
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 개인정보 안내 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <p>
            <Sparkles className="w-4 h-4 inline mr-1" />
            설정된 정보는 언제든지 프로필에서 수정할 수 있습니다
          </p>
        </motion.div>
      </div>
    </div>
  );
}