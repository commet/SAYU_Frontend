'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Palette, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
// import { apiClient } from '@/lib/api-client';

interface ArtistSubmissionData {
  artist_name: string;
  bio?: string;
  birth_year?: number;
  death_year?: number;
  nationality?: string;
  contact_email?: string;
  website_url?: string;
  phone?: string;
  specialties?: string[];
  art_movements?: string[];
  famous_works?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    website?: string;
  };
  submitted_by_name?: string;
  submitted_by_email?: string;
  submission_reason: 'missing_artist' | 'self_registration' | 'update_info';
  additional_info?: string;
  source_references?: string[];
}

interface SubmissionResult {
  success: boolean;
  message: string;
  profile_id?: string;
  artist_name?: string;
  status?: string;
  existing_artist_id?: string;
}

export function ArtistSubmissionForm() {
  const [formData, setFormData] = useState<ArtistSubmissionData>({
    artist_name: '',
    submission_reason: 'missing_artist',
    specialties: [],
    art_movements: [],
    famous_works: [],
    social_links: {},
    source_references: []
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newMovement, setNewMovement] = useState('');
  const [newWork, setNewWork] = useState('');
  const [newReference, setNewReference] = useState('');

  const totalSteps = 4;

  const handleInputChange = (field: keyof ArtistSubmissionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }));
  };

  const addToArray = (field: 'specialties' | 'art_movements' | 'famous_works' | 'source_references', value: string) => {
    if (value.trim()) {
      const currentArray = formData[field] || [];
      if (!currentArray.includes(value.trim())) {
        handleInputChange(field, [...currentArray, value.trim()]);
      }
    }
  };

  const removeFromArray = (field: 'specialties' | 'art_movements' | 'famous_works' | 'source_references', index: number) => {
    const currentArray = formData[field] || [];
    handleInputChange(field, currentArray.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.artist_name.trim()) {
      alert('작가명은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert form data to submission format
      const submissionData = {
        ...formData,
        birth_year: formData.birth_year || null,
        death_year: formData.death_year || null,
        specialties: formData.specialties || [],
        art_movements: formData.art_movements || [],
        famous_works: formData.famous_works || [],
        source_references: formData.source_references || []
      };

      // Direct fetch to backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/artist-portal/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      setSubmissionResult(result);
      
    } catch (error) {
      console.error('Submission failed:', error);
      setSubmissionResult({
        success: false,
        message: error instanceof Error ? error.message : '제출 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      artist_name: '',
      submission_reason: 'missing_artist',
      specialties: [],
      art_movements: [],
      famous_works: [],
      social_links: {},
      source_references: []
    });
    setCurrentStep(1);
    setSubmissionResult(null);
  };

  if (submissionResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto p-8"
      >
        <div className={`bg-white/5 backdrop-blur-lg rounded-3xl border p-8 text-center ${
          submissionResult.success 
            ? 'border-green-500/30 bg-green-500/5' 
            : 'border-red-500/30 bg-red-500/5'
        }`}>
          {submissionResult.success ? (
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          ) : (
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          )}
          
          <h2 className={`text-2xl font-bold mb-4 ${
            submissionResult.success ? 'text-green-400' : 'text-red-400'
          }`}>
            {submissionResult.success ? '제출 완료!' : '제출 실패'}
          </h2>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            {submissionResult.message}
          </p>
          
          {submissionResult.success && (
            <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-semibold text-white mb-2">제출 정보</h3>
              <p className="text-sm text-gray-300">
                작가명: <span className="text-white">{submissionResult.artist_name}</span>
              </p>
              {submissionResult.profile_id && (
                <p className="text-sm text-gray-300">
                  프로필 ID: <span className="text-white font-mono">{submissionResult.profile_id}</span>
                </p>
              )}
              <p className="text-sm text-gray-300 mt-2">
                상태: <span className="text-yellow-400">관리자 승인 대기 중</span>
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              다른 작가 제출하기
            </button>
            
            <button
              onClick={() => window.location.href = '/artists'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              등록된 작가 목록 보기
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">작가 정보 제출</h1>
        <p className="text-gray-400">누락된 작가를 발견하셨거나 작가님이시라면 정보를 제출해주세요</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">진행률</span>
          <span className="text-sm text-gray-400">{currentStep}/{totalSteps}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Form Steps */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
      >
        {/* Step 1: 기본 정보 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              기본 정보
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  작가명 <span className="text-red-400">*</span>
                  <span className="text-xs text-gray-500 ml-2">(유일한 필수 항목)</span>
                </label>
                <input
                  type="text"
                  value={formData.artist_name}
                  onChange={(e) => handleInputChange('artist_name', e.target.value)}
                  placeholder="예: 김환기, 박수근, 이중섭"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  제출 사유
                </label>
                <select
                  value={formData.submission_reason}
                  onChange={(e) => handleInputChange('submission_reason', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="missing_artist">누락된 작가 발견</option>
                  <option value="self_registration">작가 본인 등록</option>
                  <option value="update_info">기존 정보 업데이트</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  출생년도
                </label>
                <input
                  type="number"
                  value={formData.birth_year || ''}
                  onChange={(e) => handleInputChange('birth_year', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="예: 1913"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  국적
                </label>
                <input
                  type="text"
                  value={formData.nationality || ''}
                  onChange={(e) => handleInputChange('nationality', e.target.value)}
                  placeholder="예: 한국, 미국, 프랑스"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                작가 소개
              </label>
              <textarea
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                placeholder="작가의 예술 세계와 생애에 대해 간단히 설명해주세요..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: 연락처 정보 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5" />
              연락처 정보 (선택사항)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.contact_email || ''}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="artist@email.com"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  웹사이트
                </label>
                <input
                  type="url"
                  value={formData.website_url || ''}
                  onChange={(e) => handleInputChange('website_url', e.target.value)}
                  placeholder="https://artist-website.com"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">소셜 미디어</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Instagram</label>
                  <input
                    type="text"
                    value={formData.social_links?.instagram || ''}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    placeholder="@username 또는 전체 URL"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Twitter/X</label>
                  <input
                    type="text"
                    value={formData.social_links?.twitter || ''}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder="@username 또는 전체 URL"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submitter Info */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">제출자 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">제출자 이름</label>
                  <input
                    type="text"
                    value={formData.submitted_by_name || ''}
                    onChange={(e) => handleInputChange('submitted_by_name', e.target.value)}
                    placeholder="익명으로 제출하시려면 비워두세요"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">제출자 이메일</label>
                  <input
                    type="email"
                    value={formData.submitted_by_email || ''}
                    onChange={(e) => handleInputChange('submitted_by_email', e.target.value)}
                    placeholder="선택사항 (계정 연결용)"
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 예술 정보 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Palette className="w-5 h-5" />
              예술 정보 (선택사항)
            </h2>
            
            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                전문 분야
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('specialties', newSpecialty);
                      setNewSpecialty('');
                    }
                  }}
                  placeholder="예: 회화, 조각, 설치미술"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    addToArray('specialties', newSpecialty);
                    setNewSpecialty('');
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties?.map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeFromArray('specialties', index)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Art Movements */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                예술 사조/운동
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMovement}
                  onChange={(e) => setNewMovement(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('art_movements', newMovement);
                      setNewMovement('');
                    }
                  }}
                  placeholder="예: 인상주의, 추상표현주의, 미니멀리즘"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    addToArray('art_movements', newMovement);
                    setNewMovement('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.art_movements?.map((movement, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                  >
                    {movement}
                    <button
                      type="button"
                      onClick={() => removeFromArray('art_movements', index)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Famous Works */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                대표작
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newWork}
                  onChange={(e) => setNewWork(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('famous_works', newWork);
                      setNewWork('');
                    }
                  }}
                  placeholder="작품명"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    addToArray('famous_works', newWork);
                    setNewWork('');
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.famous_works?.map((work, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                  >
                    {work}
                    <button
                      type="button"
                      onClick={() => removeFromArray('famous_works', index)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: 추가 정보 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              추가 정보
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                추가 설명
              </label>
              <textarea
                value={formData.additional_info || ''}
                onChange={(e) => handleInputChange('additional_info', e.target.value)}
                rows={4}
                placeholder="특이사항이나 추가로 알려주고 싶은 정보가 있다면 작성해주세요..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Source References */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                참고 자료 (URL)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newReference}
                  onChange={(e) => setNewReference(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addToArray('source_references', newReference);
                      setNewReference('');
                    }
                  }}
                  placeholder="Wikipedia, 미술관 사이트, 개인 홈페이지 등"
                  className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    addToArray('source_references', newReference);
                    setNewReference('');
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  추가
                </button>
              </div>
              <div className="space-y-2">
                {formData.source_references?.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-orange-500/20 text-orange-300 rounded-lg p-3"
                  >
                    <span className="truncate mr-2">{ref}</span>
                    <button
                      type="button"
                      onClick={() => removeFromArray('source_references', index)}
                      className="hover:text-white flex-shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gray-800/30 rounded-xl p-4">
              <h3 className="text-white font-medium mb-3">제출 요약</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-400">작가명:</span> <span className="text-white">{formData.artist_name || '미입력'}</span></p>
                <p><span className="text-gray-400">제출 사유:</span> <span className="text-white">
                  {formData.submission_reason === 'missing_artist' && '누락된 작가 발견'}
                  {formData.submission_reason === 'self_registration' && '작가 본인 등록'}
                  {formData.submission_reason === 'update_info' && '기존 정보 업데이트'}
                </span></p>
                <p><span className="text-gray-400">제출자:</span> <span className="text-white">{formData.submitted_by_name || '익명'}</span></p>
                {formData.specialties && formData.specialties.length > 0 && (
                  <p><span className="text-gray-400">전문 분야:</span> <span className="text-white">{formData.specialties.join(', ')}</span></p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 border-t border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            이전
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
              disabled={currentStep === 1 && !formData.artist_name.trim()}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.artist_name.trim()}
              className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  제출 중...
                </>
              ) : (
                '제출하기'
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}