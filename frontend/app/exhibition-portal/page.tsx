'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Eye, Trophy, ArrowRight, Sparkles, Upload, Globe, Users, TrendingUp, Gift } from 'lucide-react';
import { ExhibitionSubmissionForm } from '@/components/exhibition-portal/ExhibitionSubmissionForm';
import { useRouter } from 'next/navigation';

export default function ExhibitionPortalPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          <ExhibitionSubmissionForm />
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
          className="text-center mb-8 md:mb-16"
        >
          <h1 className={`${isMobile ? 'text-3xl' : 'text-5xl'} font-bold text-white mb-4 md:mb-6`}>
            Exhibition Portal
            <Sparkles className={`inline-block ${isMobile ? 'w-6 h-6' : 'w-10 h-10'} text-yellow-400 ml-2 md:ml-3`} />
          </h1>
          <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-4`}>
            직접 전시를 등록하고 더 많은 사람들과 예술을 공유하세요.
            전시를 등록하면 포인트를 받을 수 있습니다!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-3xl mx-auto">
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-4 h-4" />
              전시 등록하기
            </motion.button>
            
            <motion.button
              onClick={() => router.push('/exhibitions')}
              className="bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-4 h-4" />
              전시 둘러보기
            </motion.button>
            
            <motion.button
              onClick={() => router.push('/dashboard')}
              className="bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm text-gray-300 hover:text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trophy className="w-4 h-4" />
              내 포인트 확인
            </motion.button>
          </div>
        </motion.div>

        {/* Points System Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-lg rounded-2xl border border-purple-500/20 ${isMobile ? 'p-4 mb-6' : 'p-8 mb-12'}`}
        >
          <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white ${isMobile ? 'mb-3' : 'mb-6'} flex items-center gap-3`}>
            <Gift className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-yellow-400`} />
            포인트 리워드 시스템
          </h2>
          
          <div className={`grid grid-cols-1 md:grid-cols-3 ${isMobile ? 'gap-2' : 'gap-6'}`}>
            <div className={`bg-white/5 rounded-lg ${isMobile ? 'p-3' : 'p-4'} border border-white/10`}>
              <div className={`flex items-center gap-3 ${isMobile ? 'mb-1' : 'mb-3'}`}>
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-green-500/20 rounded-full flex items-center justify-center`}>
                  <Users className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-green-400`} />
                </div>
                <div>
                  <h3 className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>방문자 제보</h3>
                  <p className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : ''}`}>100 포인트</p>
                </div>
              </div>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>전시를 방문하고 정보를 공유해주세요</p>
            </div>

            <div className={`bg-white/5 rounded-lg ${isMobile ? 'p-3' : 'p-4'} border border-white/10`}>
              <div className={`flex items-center gap-3 ${isMobile ? 'mb-1' : 'mb-3'}`}>
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-purple-500/20 rounded-full flex items-center justify-center`}>
                  <Sparkles className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-purple-400`} />
                </div>
                <div>
                  <h3 className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>참여 작가</h3>
                  <p className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : ''}`}>300 포인트</p>
                </div>
              </div>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>본인의 전시를 직접 등록하세요</p>
            </div>

            <div className={`bg-white/5 rounded-lg ${isMobile ? 'p-3' : 'p-4'} border border-white/10`}>
              <div className={`flex items-center gap-3 ${isMobile ? 'mb-1' : 'mb-3'}`}>
                <div className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'} bg-pink-500/20 rounded-full flex items-center justify-center`}>
                  <Trophy className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-pink-400`} />
                </div>
                <div>
                  <h3 className={`text-white font-semibold ${isMobile ? 'text-sm' : ''}`}>주최자</h3>
                  <p className={`text-yellow-400 font-bold ${isMobile ? 'text-sm' : ''}`}>500 포인트</p>
                </div>
              </div>
              <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>갤러리나 미술관의 공식 전시 등록</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards - Hide on Mobile */}
        {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <Calendar className="w-10 h-10 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">전시 일정 관리</h3>
              <p className="text-gray-300 text-sm">시작일과 종료일을 설정하여 전시 기간을 명확히 표시</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <MapPin className="w-10 h-10 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">장소 정보</h3>
              <p className="text-gray-300 text-sm">갤러리, 미술관 등 전시 장소와 주소 정보 제공</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6"
            >
              <Globe className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">글로벌 공유</h3>
              <p className="text-gray-300 text-sm">전 세계 SAYU 사용자들과 전시 정보 공유</p>
            </motion.div>
          </div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-8 mb-12"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-8">등록 과정</h2>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">1</div>
              <div>
                <h3 className="text-lg font-semibold text-white">기본 정보 입력</h3>
                <p className="text-sm text-gray-400">전시명, 작가, 카테고리</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 hidden md:block" />
            
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">2</div>
              <div>
                <h3 className="text-lg font-semibold text-white">장소 및 일정</h3>
                <p className="text-sm text-gray-400">장소, 기간, 관람시간</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 hidden md:block" />
            
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-pink-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">3</div>
              <div>
                <h3 className="text-lg font-semibold text-white">상세 정보</h3>
                <p className="text-sm text-gray-400">소개, 연락처, 이미지</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 hidden md:block" />
            
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">4</div>
              <div>
                <h3 className="text-lg font-semibold text-white">포인트 획득</h3>
                <p className="text-sm text-gray-400">등록 완료 즉시 지급</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">7</p>
            <p className="text-xs text-gray-400">등록된 전시</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-xs text-gray-400">참여 사용자</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4 text-center">
            <Gift className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">500</p>
            <p className="text-xs text-gray-400">지급된 포인트</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/10 p-4 text-center">
            <Globe className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">2</p>
            <p className="text-xs text-gray-400">참여 도시</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-6">지금 시작하세요!</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            여러분이 발견한 멋진 전시를 SAYU 커뮤니티와 공유하고,
            포인트도 받아가세요. 간단한 정보만으로도 등록 가능합니다.
          </p>
          
          <motion.button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-12 rounded-2xl text-lg transition-all transform hover:scale-105 shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            전시 등록하기
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}