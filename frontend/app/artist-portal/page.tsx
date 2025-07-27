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
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            SAYU에서 누락된 작가를 발견하셨나요? 작가님이시라면 직접 등록해보세요.
            <br />
            간단한 정보만으로도 제출 가능하며, 관리자 검토 후 플랫폼에 추가됩니다.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              작가 정보 제출하기
              <ArrowRight className="inline-block w-5 h-5 ml-2" />
            </motion.button>
            
            <motion.button
              onClick={() => setShowImageDemo(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              이미지 업로드 데모
            </motion.button>
            
            <motion.button
              onClick={() => setShowArtworkForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              작품 제출 데모
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center"
          >
            <div className="bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">누락된 작가 제보</h3>
            <p className="text-gray-300">
              SAYU에서 찾을 수 없는 작가가 있다면 알려주세요. 
              작가명만으로도 제출 가능합니다.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center"
          >
            <div className="bg-purple-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Palette className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">작가 본인 등록</h3>
            <p className="text-gray-300">
              작가님이시라면 직접 정보를 등록하세요. 
              이메일이 없어도 소셜미디어로 연락 가능합니다.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center"
          >
            <div className="bg-green-500/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">간단한 제출</h3>
            <p className="text-gray-300">
              복잡한 절차 없이 필수 정보만으로 제출. 
              나머지는 모두 선택사항입니다.
            </p>
          </motion.div>
        </div>

        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">제출 과정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">기본 정보</h3>
              <p className="text-gray-300 text-sm">작가명과 기본 정보 입력</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">연락처</h3>
              <p className="text-gray-300 text-sm">선택적 연락처 및 소셜미디어</p>
            </div>
            
            <div className="text-center">
              <div className="bg-pink-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">예술 정보</h3>
              <p className="text-gray-300 text-sm">전문 분야와 대표작품</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                4
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">제출 완료</h3>
              <p className="text-gray-300 text-sm">관리자 검토 후 승인</p>
            </div>
          </div>
        </motion.div>

        {/* Submission Scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-white text-center mb-12">제출 시나리오</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-2xl border border-blue-500/30 p-6">
              <h3 className="text-lg font-semibold text-blue-300 mb-3">최소 정보 제출</h3>
              <p className="text-gray-300 text-sm mb-4">
                "김무명" 작가를 발견했는데 SAYU에 없어서 이름만이라도 등록하고 싶어요.
              </p>
              <div className="bg-blue-500/20 rounded-lg p-3">
                <p className="text-blue-200 text-xs">필수: 작가명만</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-2xl border border-purple-500/30 p-6">
              <h3 className="text-lg font-semibold text-purple-300 mb-3">유명 작가 제보</h3>
              <p className="text-gray-300 text-sm mb-4">
                이중섭 같은 유명 작가가 누락되어 있어서 상세 정보와 함께 제보하고 싶어요.
              </p>
              <div className="bg-purple-500/20 rounded-lg p-3">
                <p className="text-purple-200 text-xs">추가: 생애, 대표작, 출처</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-2xl border border-green-500/30 p-6">
              <h3 className="text-lg font-semibold text-green-300 mb-3">작가 본인 등록</h3>
              <p className="text-gray-300 text-sm mb-4">
                신진 작가인데 이메일은 없고 인스타그램으로만 연락 가능해요.
              </p>
              <div className="bg-green-500/20 rounded-lg p-3">
                <p className="text-green-200 text-xs">SNS 연락처로도 가능</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Status Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">제출 후 과정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">관리자 검토</h3>
              <p className="text-gray-300 text-sm">
                제출된 정보의 정확성과 중복 여부를 확인합니다.
                보통 1-3일 소요됩니다.
              </p>
            </div>
            
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">승인 및 등록</h3>
              <p className="text-gray-300 text-sm">
                승인되면 마스터 작가 데이터베이스에 추가되어
                SAYU에서 검색 가능해집니다.
              </p>
            </div>
            
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">피드백</h3>
              <p className="text-gray-300 text-sm">
                이메일을 제공하신 경우 승인 결과와
                추가 정보 요청을 알려드립니다.
              </p>
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