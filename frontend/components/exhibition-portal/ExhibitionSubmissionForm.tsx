'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Link, Users, DollarSign, Clock, Upload, Award, Globe, Phone, Mail, Instagram, Sparkles } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ExhibitionFormData {
  title: string;
  title_en?: string;
  artist_name?: string;
  venue_name: string;
  venue_city: string;
  venue_address?: string;
  start_date: string;
  end_date: string;
  opening_hours?: string;
  admission_fee?: string;
  description?: string;
  website_url?: string;
  contact_phone?: string;
  contact_email?: string;
  instagram_handle?: string;
  category?: string;
  submission_type: 'organizer' | 'visitor' | 'artist';
  image_url?: string;
}

export function ExhibitionSubmissionForm() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<ExhibitionFormData>({
    title: '',
    title_en: '',
    artist_name: '',
    venue_name: '',
    venue_city: '서울',
    venue_address: '',
    start_date: '',
    end_date: '',
    opening_hours: '',
    admission_fee: '',
    description: '',
    website_url: '',
    contact_phone: '',
    contact_email: '',
    instagram_handle: '',
    category: '',
    submission_type: 'visitor',
    image_url: ''
  });

  const categories = [
    '회화', '조각', '사진', '미디어아트', '설치미술', 
    '현대미술', '전통미술', '공예', '디자인', '건축', '기타'
  ];

  const cities = [
    '서울', '부산', '대구', '인천', '광주', '대전', '울산', 
    '세종', '경기', '강원', '충북', '충남', '전북', '전남', 
    '경북', '경남', '제주', '해외'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title || !formData.venue_name || !formData.start_date || !formData.end_date) {
      toast.error('필수 정보를 모두 입력해주세요');
      return false;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error('종료일은 시작일 이후여야 합니다');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert directly into exhibitions table (only with existing columns)
      const { error: exhibitionError } = await supabase
        .from('exhibitions')
        .insert({
          title: formData.title || formData.title_en || 'Untitled Exhibition',
          venue_name: formData.venue_name,
          venue_city: formData.venue_city,
          start_date: formData.start_date,
          end_date: formData.end_date,
          description: formData.description || null
        });

      if (exhibitionError) throw exhibitionError;

      // Award points for submission
      const pointsToAward = formData.submission_type === 'organizer' ? 500 : 
                           formData.submission_type === 'artist' ? 300 : 100;
      
      // Track points in user profile or points table
      try {
        // Update user profile with points
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', user.id)
          .single();

        const currentPoints = profile?.points || 0;
        
        await supabase
          .from('profiles')
          .update({ 
            points: currentPoints + pointsToAward,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

      } catch (pointsError) {
        console.error('Failed to award points:', pointsError);
        // Continue even if points fail
      }

      toast.success(`전시가 성공적으로 등록되었습니다! ${pointsToAward} 포인트를 획득했습니다 🎉`);
      
      // Reset form
      setFormData({
        title: '',
        title_en: '',
        artist_name: '',
        venue_name: '',
        venue_city: '서울',
        venue_address: '',
        start_date: '',
        end_date: '',
        opening_hours: '',
        admission_fee: '',
        description: '',
        website_url: '',
        contact_phone: '',
        contact_email: '',
        instagram_handle: '',
        category: '',
        submission_type: 'visitor',
        image_url: ''
      });
      setCurrentStep(1);

      // Redirect to exhibitions page after 2 seconds
      setTimeout(() => {
        router.push('/exhibitions');
      }, 2000);

    } catch (error) {
      console.error('Exhibition submission error:', error);
      toast.error('전시 등록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">기본 정보</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                제출자 유형 *
              </label>
              <select
                name="submission_type"
                value={formData.submission_type}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 [&>option]:text-black [&>option]:bg-white"
              >
                <option value="visitor">방문자</option>
                <option value="artist">참여 작가</option>
                <option value="organizer">주최자</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                전시 제목 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="예: 서울의 봄"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                전시 제목 (영문)
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en}
                onChange={handleInputChange}
                placeholder="예: Spring of Seoul"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                작가명
              </label>
              <input
                type="text"
                name="artist_name"
                value={formData.artist_name}
                onChange={handleInputChange}
                placeholder="단체전의 경우 '단체전' 입력"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                카테고리
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 [&>option]:text-black [&>option]:bg-white"
              >
                <option value="">선택하세요</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">장소 및 일정</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                전시 장소 *
              </label>
              <input
                type="text"
                name="venue_name"
                value={formData.venue_name}
                onChange={handleInputChange}
                placeholder="예: 국립현대미술관"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                도시 *
              </label>
              <select
                name="venue_city"
                value={formData.venue_city}
                onChange={handleInputChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 [&>option]:text-black [&>option]:bg-white"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                상세 주소
              </label>
              <input
                type="text"
                name="venue_address"
                value={formData.venue_address}
                onChange={handleInputChange}
                placeholder="예: 서울시 종로구 삼청로 30"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  시작일 *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  종료일 *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                관람 시간
              </label>
              <input
                type="text"
                name="opening_hours"
                value={formData.opening_hours}
                onChange={handleInputChange}
                placeholder="예: 10:00 - 18:00 (월요일 휴관)"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                입장료
              </label>
              <input
                type="text"
                name="admission_fee"
                value={formData.admission_fee}
                onChange={handleInputChange}
                placeholder="예: 무료 또는 5,000원"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">상세 정보 및 연락처</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                전시 소개
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="전시에 대한 간단한 소개를 작성해주세요"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                웹사이트
              </label>
              <input
                type="url"
                name="website_url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                연락처
              </label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleInputChange}
                placeholder="02-1234-5678"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                이메일
              </label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleInputChange}
                placeholder="info@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                인스타그램
              </label>
              <input
                type="text"
                name="instagram_handle"
                value={formData.instagram_handle}
                onChange={handleInputChange}
                placeholder="@exhibition_handle"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                전시 이미지 URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-purple-400" />
            전시 등록
          </h2>
          <div className="flex items-center gap-2 text-xs text-gray-400 ml-11">
            <Award className="w-3 h-3" />
            <span>등록 시 포인트 지급</span>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-gray-400'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`w-24 h-1 mx-2 transition-colors ${
                    currentStep > step ? 'bg-purple-500' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 1 && (
            <motion.button
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              이전
            </motion.button>
          )}
          
          {currentStep < 3 ? (
            <motion.button
              onClick={() => setCurrentStep(prev => prev + 1)}
              className="ml-auto px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              다음
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="ml-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  제출 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  전시 등록하기
                </span>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}