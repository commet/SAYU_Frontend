'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Calendar, Users, Check, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export function ProfileCompleteModal({ isOpen, onClose, onComplete }: ProfileCompleteModalProps) {
  const { user, refreshUser } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [gender, setGender] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [companionType, setCompanionType] = useState<string>('');

  const genderOptions = [
    { value: 'male', label: { ko: '남성', en: 'Male' } },
    { value: 'female', label: { ko: '여성', en: 'Female' } },
    { value: 'other', label: { ko: '기타', en: 'Other' } },
    { value: 'prefer_not_to_say', label: { ko: '밝히지 않음', en: 'Prefer not to say' } }
  ];

  const ageRangeOptions = [
    { value: '10s', label: { ko: '10대', en: 'Teens' } },
    { value: '20s', label: { ko: '20대', en: '20s' } },
    { value: '30s', label: { ko: '30대', en: '30s' } },
    { value: '40s', label: { ko: '40대', en: '40s' } },
    { value: '50s', label: { ko: '50대', en: '50s' } },
    { value: '60plus', label: { ko: '60대 이상', en: '60+' } }
  ];

  const regionOptions = [
    { value: 'seoul', label: { ko: '서울', en: 'Seoul' } },
    { value: 'busan', label: { ko: '부산', en: 'Busan' } },
    { value: 'daegu', label: { ko: '대구', en: 'Daegu' } },
    { value: 'incheon', label: { ko: '인천', en: 'Incheon' } },
    { value: 'gwangju', label: { ko: '광주', en: 'Gwangju' } },
    { value: 'daejeon', label: { ko: '대전', en: 'Daejeon' } },
    { value: 'ulsan', label: { ko: '울산', en: 'Ulsan' } },
    { value: 'gangwon', label: { ko: '강원', en: 'Gangwon' } },
    { value: 'gyeonggi', label: { ko: '경기', en: 'Gyeonggi' } },
    { value: 'chungbuk', label: { ko: '충북', en: 'Chungbuk' } },
    { value: 'chungnam', label: { ko: '충남', en: 'Chungnam' } },
    { value: 'jeonbuk', label: { ko: '전북', en: 'Jeonbuk' } },
    { value: 'jeonnam', label: { ko: '전남', en: 'Jeonnam' } },
    { value: 'gyeongbuk', label: { ko: '경북', en: 'Gyeongbuk' } },
    { value: 'gyeongnam', label: { ko: '경남', en: 'Gyeongnam' } },
    { value: 'jeju', label: { ko: '제주', en: 'Jeju' } },
    { value: 'overseas', label: { ko: '해외', en: 'Overseas' } },
    { value: 'other', label: { ko: '기타', en: 'Others' } }
  ];

  const companionOptions = [
    { value: 'alone', label: { ko: '혼자', en: 'Alone' }, icon: '🚶', desc: { ko: '나만의 속도로 감상', en: 'At my own pace' } },
    { value: 'partner', label: { ko: '연인/배우자', en: 'Partner/Spouse' }, icon: '💑', desc: { ko: '둘만의 데이트', en: 'Date for two' } },
    { value: 'friends', label: { ko: '친구들', en: 'Friends' }, icon: '👥', desc: { ko: '함께 나누는 경험', en: 'Shared experience' } },
    { value: 'family', label: { ko: '가족', en: 'Family' }, icon: '👨‍👩‍👧‍👦', desc: { ko: '온 가족이 함께', en: 'All family together' } },
    { value: 'kids', label: { ko: '아이들과', en: 'With kids' }, icon: '👶', desc: { ko: '아이 친화적 전시', en: 'Kid-friendly exhibitions' } },
    { value: 'group', label: { ko: '단체/모임', en: 'Group' }, icon: '🚌', desc: { ko: '단체 관람', en: 'Group visit' } }
  ];

  const handleSubmit = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          gender,
          age_range: ageRange,
          region,
          companion_type: companionType,
          profile_completed: true,
          profile_completed_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(
        language === 'ko' 
          ? '프로필이 완성되었습니다! 🎉' 
          : 'Profile completed! 🎉'
      );
      
      await refreshUser();
      onComplete?.();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(
        language === 'ko' 
          ? '프로필 업데이트에 실패했습니다' 
          : 'Failed to update profile'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = gender !== '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-gray-900/95 backdrop-blur-lg rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {language === 'ko' ? '프로필 완성하기' : 'Complete Your Profile'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {language === 'ko' 
                        ? '더 나은 추천을 위해 몇 가지만 알려주세요' 
                        : 'Tell us a bit more for better recommendations'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* 콘텐츠 */}
            <div className="p-6 space-y-6">
              {/* 성별 (필수) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <User className="w-4 h-4" />
                  {language === 'ko' ? '성별' : 'Gender'}
                  <span className="text-purple-400">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGender(option.value)}
                      className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                        gender === option.value
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {option.label[language]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 연령대 (선택) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <Calendar className="w-4 h-4" />
                  {language === 'ko' ? '연령대' : 'Age Range'}
                  <span className="text-gray-500 text-xs">
                    ({language === 'ko' ? '선택' : 'Optional'})
                  </span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {ageRangeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAgeRange(option.value)}
                      className={`px-4 py-2 rounded-lg border transition-all text-sm ${
                        ageRange === option.value
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {option.label[language]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 지역 (선택) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <MapPin className="w-4 h-4" />
                  {language === 'ko' ? '지역' : 'Region'}
                  <span className="text-gray-500 text-xs">
                    ({language === 'ko' ? '선택' : 'Optional'})
                  </span>
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {regionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRegion(option.value)}
                      className={`px-3 py-2 rounded-lg border transition-all text-xs ${
                        region === option.value
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                      }`}
                    >
                      {option.label[language]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 전시 동반자 유형 (선택) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <Users className="w-4 h-4" />
                  {language === 'ko' ? '주로 전시를 함께 가는 사람' : 'Who do you usually visit exhibitions with?'}
                  <span className="text-gray-500 text-xs">
                    ({language === 'ko' ? '선택' : 'Optional'})
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {companionOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setCompanionType(option.value)}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        companionType === option.value
                          ? 'bg-purple-500/20 border-purple-500'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{option.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-white text-sm">
                            {option.label[language]}
                          </div>
                          <div className="text-xs text-gray-400">
                            {option.desc[language]}
                          </div>
                        </div>
                        {companionType === option.value && (
                          <Check className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 혜택 안내 */}
              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-4 border border-purple-700/30">
                <h3 className="font-medium text-white mb-2">
                  {language === 'ko' ? '🎁 프로필 완성 시 혜택' : '🎁 Benefits of completing your profile'}
                </h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-400" />
                    {language === 'ko' ? '지역 맞춤 전시 추천' : 'Local exhibition recommendations'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-400" />
                    {language === 'ko' ? '연령대별 인기 작품 소개' : 'Popular works by age group'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-green-400" />
                    {language === 'ko' ? '동반자 유형별 전시 추천' : 'Exhibition recommendations by companion type'}
                  </li>
                </ul>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="p-6 border-t border-gray-800">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-gray-400 border border-gray-700 rounded-xl hover:bg-gray-800/50 transition-colors"
                >
                  {language === 'ko' ? '나중에 하기' : 'Skip for now'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || loading}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                    isFormValid && !loading
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      {language === 'ko' ? '저장 중...' : 'Saving...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {language === 'ko' ? '완료' : 'Complete'}
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                {language === 'ko' 
                  ? '언제든지 프로필 설정에서 수정할 수 있어요' 
                  : 'You can always update this in your profile settings'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}