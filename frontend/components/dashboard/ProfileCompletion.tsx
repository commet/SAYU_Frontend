'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  User, MapPin, Eye, Heart, Sparkles, Clock, 
  Users, X, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfileCompletionProps {
  onComplete: () => void;
  onSkip: () => void;
}

const REGIONS = [
  { value: 'seoul', label: '서울특별시' },
  { value: 'busan', label: '부산광역시' },
  { value: 'daegu', label: '대구광역시' },
  { value: 'incheon', label: '인천광역시' },
  { value: 'gwangju', label: '광주광역시' },
  { value: 'daejeon', label: '대전광역시' },
  { value: 'ulsan', label: '울산광역시' },
  { value: 'sejong', label: '세종특별자치시' },
  { value: 'gyeonggi', label: '경기도' },
  { value: 'gangwon', label: '강원특별자치도' },
  { value: 'chungbuk', label: '충청북도' },
  { value: 'chungnam', label: '충청남도' },
  { value: 'jeonbuk', label: '전북특별자치도' },
  { value: 'jeonnam', label: '전라남도' },
  { value: 'gyeongbuk', label: '경상북도' },
  { value: 'gyeongnam', label: '경상남도' },
  { value: 'jeju', label: '제주특별자치도' },
  { value: 'other', label: '기타/해외' }
];

const VIEWING_STYLES = [
  { id: 'detailed', label: '세심한 관찰자', description: '작품의 디테일을 꼼꼼히 살펴보는 스타일' },
  { id: 'intuitive', label: '직관적 감상자', description: '첫인상과 감정을 중시하는 스타일' },
  { id: 'analytical', label: '분석적 비평가', description: '작품의 의미와 배경을 깊이 탐구하는 스타일' },
  { id: 'social', label: '소셜 큐레이터', description: '다른 사람들과 감상을 나누는 것을 좋아하는 스타일' },
  { id: 'collector', label: '컬렉션 애호가', description: '작품을 수집하고 정리하는 것을 선호하는 스타일' },
  { id: 'explorer', label: '탐험적 발견자', description: '새로운 작가와 스타일을 발견하는 것을 즐기는 스타일' }
];

export default function ProfileCompletion({ onComplete, onSkip }: ProfileCompletionProps) {
  const { updateProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    gender: '',
    ageGroup: '',
    region: '',
    viewingStyles: [] as string[]
  });

  console.log('=== ProfileCompletion Component Rendered ===');
  console.log('User in ProfileCompletion:', user);
  console.log('FormData:', formData);
  
  // Add visual indicator for debugging
  useEffect(() => {
    console.log('🎨 ProfileCompletion MOUNTED - Component is visible!');
    return () => {
      console.log('🎨 ProfileCompletion UNMOUNTED');
    };
  }, []);

  const handleViewingStyleChange = (styleId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      viewingStyles: checked 
        ? [...prev.viewingStyles, styleId]
        : prev.viewingStyles.filter(id => id !== styleId)
    }));
  };

  const handleSubmit = async () => {
    console.log('=== Profile Completion Submit ===');
    console.log('FormData at submit:', formData);
    
    setLoading(true);
    try {
      const completionData = {
        gender: formData.gender || null,
        age_group: formData.ageGroup || null,
        region: formData.region || null,
        viewing_styles: formData.viewingStyles.length > 0 ? formData.viewingStyles : null,
        profile_completed_at: new Date().toISOString(),
        profile_completion_version: 1
      };
      
      console.log('CompletionData to save:', completionData);
      
      // Try to use new columns first, fallback to bio field
      try {
        console.log('🔄 Attempting to save with new columns...');
        const profileUpdate = {
          gender: completionData.gender,
          age_group: completionData.age_group,
          region: completionData.region,
          viewing_styles: completionData.viewing_styles,
          profile_completed_at: completionData.profile_completed_at,
          profile_completion_version: completionData.profile_completion_version
        };
        console.log('Profile update data:', profileUpdate);
        
        await updateProfile(profileUpdate);
        console.log('✅ Successfully saved with new columns');
      } catch (dbError: any) {
        console.log('❌ Error with new columns:', dbError.message);
        // If new columns don't exist, store in bio field temporarily
        if (dbError.message?.includes('column') || dbError.message?.includes('does not exist')) {
          console.log('🔄 Falling back to bio field storage...');
          const bioUpdate = {
            bio: JSON.stringify(completionData),
            updated_at: new Date().toISOString()
          };
          console.log('Bio update data:', bioUpdate);
          
          await updateProfile(bioUpdate);
          console.log('✅ Successfully saved to bio field');
        } else {
          console.error('❌ Unexpected error:', dbError);
          throw dbError;
        }
      }
      
      onComplete();
    } catch (error) {
      console.error('Profile completion error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get personality type for personalized messaging
  const personalityType = user?.profile?.personality_type;
  const animalType = user?.profile?.animal_type;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Debug indicator - remove in production */}
      <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-50 animate-pulse">
        ProfileCompletion Active
      </div>
      
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">
                  {personalityType ? `${animalType} 성향` : '당신'}에게 맞는 프로필 완성하기
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  30초만 투자하면 더 나은 추천을 받을 수 있어요
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6">
          {/* Benefits Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
              <span>지역 맞춤 전시 추천</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4 text-pink-500 flex-shrink-0" />
              <span>취향 맞는 사용자 매칭</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm col-span-1 sm:col-span-2 md:col-span-1">
              <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
              <span>AI 개인화 추천 강화</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Required: Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-1 text-white">
                성별 <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger className="text-black">
                  <SelectValue placeholder="성별을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                  <SelectItem value="prefer_not_to_say">선택하지 않음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional: Age Group */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">연령대 (선택)</Label>
              <Select value={formData.ageGroup} onValueChange={(value) => setFormData(prev => ({ ...prev, ageGroup: value }))}>
                <SelectTrigger className="text-black">
                  <SelectValue placeholder="연령대를 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teens">10대</SelectItem>
                  <SelectItem value="20s">20대</SelectItem>
                  <SelectItem value="30s">30대</SelectItem>
                  <SelectItem value="40s">40대</SelectItem>
                  <SelectItem value="50s">50대</SelectItem>
                  <SelectItem value="60_plus">60대 이상</SelectItem>
                  <SelectItem value="prefer_not_to_say">선택하지 않음</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional: Region */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm font-medium text-white">지역 (선택)</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                <SelectTrigger className="text-black">
                  <SelectValue placeholder="거주 지역을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Optional: Viewing Styles */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-white">나의 감상 스타일 (선택)</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {VIEWING_STYLES.map(style => (
                <div key={style.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={style.id}
                    checked={formData.viewingStyles.includes(style.id)}
                    onCheckedChange={(checked) => handleViewingStyleChange(style.id, checked as boolean)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor={style.id} className="text-sm font-medium cursor-pointer text-white">
                      {style.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4 sm:gap-0">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>약 30초 소요</span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={onSkip}
                disabled={loading}
                className="flex-1 sm:flex-none text-white border-gray-600 hover:border-gray-500 hover:text-white"
              >
                나중에 하기
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!formData.gender || loading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex-1 sm:flex-none text-white"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                  />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                프로필 완성
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}