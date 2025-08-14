'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Palette, CheckCircle, Clock, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { ArtistSubmissionForm } from '@/components/artist-portal/ArtistSubmissionForm';
import { ImageUploadDemo } from '@/components/artist-portal/ImageUploadDemo';
import { ArtworkSubmissionForm } from '@/components/artist-portal/ArtworkSubmissionForm';

export default function ArtistPortalPage() {
  const [showForm, setShowForm] = useState(false);
  const [showImageDemo, setShowImageDemo] = useState(false);
  const [showArtworkForm, setShowArtworkForm] = useState(false);

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            onClick={() => setShowForm(false)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            ← 돌아가기
          </motion.button>
          <ArtistSubmissionForm />
        </div>
      </div>
    );
  }

  if (showImageDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            onClick={() => setShowImageDemo(false)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            ← 돌아가기
          </motion.button>
          <h1 className="text-3xl font-bold text-white mb-8">Image Upload Demo</h1>
          <ImageUploadDemo 
            category="artist_artworks"
            onUploadSuccess={(url) => console.log('Uploaded:', url)}
          />
        </div>
      </div>
    );
  }

  if (showArtworkForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <motion.button
            onClick={() => setShowArtworkForm(false)}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            whileHover={{ x: -5 }}
          >
            ← 돌아가기
          </motion.button>
          <ArtworkSubmissionForm 
            profileId="demo-profile-id"
            profileType="artist"
            onSuccess={() => console.log('Artwork submitted!')}
            onCancel={() => setShowArtworkForm(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Artist Portal
            <Sparkles className="inline-block w-10 h-10 text-yellow-400 ml-3" />
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            SAYU에서 누락된 작가를 발견하셨나요? 간단한 정보만으로도 제출 가능합니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto">
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 backdrop-blur-sm text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Users className="w-4 h-4" />
              작가 정보 제출하기
            </motion.button>
            
            <motion.button
              onClick={() => setShowImageDemo(true)}
              className="bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Palette className="w-4 h-4" />
              이미지 업로드 데모
            </motion.button>
            
            <motion.button
              onClick={() => setShowArtworkForm(true)}
              className="bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <CheckCircle className="w-4 h-4" />
              작품 제출 데모
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Cards - Compressed */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-2">누락된 작가 제보</h3>
            <p className="text-gray-300 text-sm">작가명만으로도 제출 가능</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-2">작가 본인 등록</h3>
            <p className="text-gray-300 text-sm">소셜미디어 연락처로도 가능</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-2">간단한 제출</h3>
            <p className="text-gray-300 text-sm">필수 정보만으로 제출 완료</p>
          </motion.div>
        </div>

        {/* Process Steps - Horizontal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-6 mb-10"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-6">제출 과정</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
              <div>
                <h3 className="text-sm font-semibold text-white">기본 정보</h3>
                <p className="text-xs text-gray-400">작가명 입력</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 hidden md:block" />
            
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
              <div>
                <h3 className="text-sm font-semibold text-white">연락처</h3>
                <p className="text-xs text-gray-400">소셜미디어 등</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 hidden md:block" />
            
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="bg-pink-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
              <div>
                <h3 className="text-sm font-semibold text-white">예술 정보</h3>
                <p className="text-xs text-gray-400">대표작품 등</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-500 hidden md:block" />
            
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="bg-green-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
              <div>
                <h3 className="text-sm font-semibold text-white">제출 완료</h3>
                <p className="text-xs text-gray-400">검토 후 승인</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Submission Scenarios - Compressed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-xl font-bold text-white text-center mb-6">제출 시나리오</h2>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="border-l-2 border-blue-400 pl-3">
                <h3 className="font-semibold text-blue-300 mb-1">최소 정보</h3>
                <p className="text-gray-400 text-xs">작가명만 알고 있어도 제출 가능</p>
              </div>
              
              <div className="border-l-2 border-purple-400 pl-3">
                <h3 className="font-semibold text-purple-300 mb-1">상세 제보</h3>
                <p className="text-gray-400 text-xs">생애, 대표작 등 추가 정보</p>
              </div>
              
              <div className="border-l-2 border-green-400 pl-3">
                <h3 className="font-semibold text-green-300 mb-1">본인 등록</h3>
                <p className="text-gray-400 text-xs">SNS 연락처로도 등록 가능</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Information - Compressed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-5"
        >
          <h2 className="text-xl font-bold text-white text-center mb-4">제출 후 과정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">검토 (1-3일)</h3>
                <p className="text-gray-400 text-xs">정보 확인 및 중복 검사</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">승인 및 등록</h3>
                <p className="text-gray-400 text-xs">SAYU 데이터베이스 추가</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">결과 알림</h3>
                <p className="text-gray-400 text-xs">이메일 또는 추가 요청</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-16"
        >
          <h2 className="text-3xl font-bold text-white mb-6">지금 시작해보세요</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            여러분의 제보가 SAYU를 더욱 풍성하게 만듭니다. 
            작가명만으로도 시작할 수 있어요!
          </p>
          
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            작가 정보 제출하기
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}