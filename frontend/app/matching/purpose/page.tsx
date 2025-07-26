'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { getCompatibleUsers, getUsersByPurpose, MatchedUser } from '@/lib/api/matching';
import { Heart, Users, Camera, Coffee, Briefcase, MapPin, Calendar } from 'lucide-react';

const purposeIcons = {
  exploring: <Camera className="w-5 h-5" />,
  dating: <Heart className="w-5 h-5" />,
  social: <Users className="w-5 h-5" />,
  family: <Coffee className="w-5 h-5" />,
  professional: <Briefcase className="w-5 h-5" />
};

const purposeLabels = {
  exploring: '예술 탐험',
  dating: '의미있는 만남',
  social: '친구 만들기', 
  family: '가족과 함께',
  professional: '전문적 네트워킹'
};

export default function PurposeMatchingPage() {
  const { user } = useAuth();
  const [matchedUsers, setMatchedUsers] = useState<MatchedUser[]>([]);
  const [selectedPurpose, setSelectedPurpose] = useState<string>('exploring');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatchedUsers = async (purpose?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getCompatibleUsers(purpose);
      setMatchedUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMatchedUsers(selectedPurpose);
    }
  }, [user, selectedPurpose]);

  const handlePurposeChange = (purpose: string) => {
    setSelectedPurpose(purpose);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            목적별 매칭 시스템
          </h1>
          <p className="text-gray-600">
            당신의 목적에 맞는 사람들과 연결되어 보세요
          </p>
        </motion.div>

        {/* Purpose Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            {Object.entries(purposeLabels).map(([purpose, label]) => (
              <button
                key={purpose}
                onClick={() => handlePurposeChange(purpose)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  selectedPurpose === purpose
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {purposeIcons[purpose as keyof typeof purposeIcons]}
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">매칭 중...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => fetchMatchedUsers(selectedPurpose)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Matched Users Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {matchedUsers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  {purposeLabels[selectedPurpose as keyof typeof purposeLabels]} 목적의 사용자가 없습니다
                </p>
                <p className="text-gray-400">
                  다른 목적을 선택해보시거나 나중에 다시 확인해주세요
                </p>
              </div>
            ) : (
              matchedUsers.map((matchedUser, index) => (
                <motion.div
                  key={matchedUser.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                >
                  {/* User Image */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-200">
                      {matchedUser.generated_image_url ? (
                        <img
                          src={matchedUser.generated_image_url}
                          alt={matchedUser.nickname}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Users className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      {purposeIcons[matchedUser.user_purpose as keyof typeof purposeIcons]}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {matchedUser.nickname}
                    </h3>
                    
                    {matchedUser.age && (
                      <p className="text-sm text-gray-500 mb-2">
                        {matchedUser.age}세
                      </p>
                    )}

                    {matchedUser.archetype_name && (
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium mb-3">
                        {matchedUser.archetype_name}
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                      <span>{purposeLabels[matchedUser.user_purpose as keyof typeof purposeLabels]}</span>
                    </div>
                  </div>

                  {/* Interaction Button */}
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                      연결하기
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Stats */}
        {!loading && !error && matchedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 text-gray-500"
          >
            <p>
              {purposeLabels[selectedPurpose as keyof typeof purposeLabels]} 목적으로 총 {matchedUsers.length}명을 찾았습니다
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}