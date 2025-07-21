'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Eye, Database, Lock, Cookie, Mail, Calendar } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

const privacyPolicy = {
  version: "1.0",
  lastUpdated: new Date('2024-01-01'),
  effective: new Date('2024-01-01'),
  introduction: {
    en: "SAYU respects your privacy and is committed to protecting your personal information. This privacy policy explains how we collect, use, and safeguard your data.",
    ko: "SAYU는 귀하의 개인정보를 존중하고 보호하기 위해 노력합니다. 이 개인정보 처리방침은 당사가 귀하의 데이터를 수집, 사용, 보호하는 방법을 설명합니다."
  },
  dataCollection: {
    en: [
      "Personal information (name, email address, profile picture)",
      "Art preferences and personality assessment results",
      "Usage patterns and interaction data",
      "Device information and IP addresses",
      "Cookies and similar tracking technologies",
      "Exhibition attendance and feedback data",
      "AI interaction data and generated content preferences",
      "Search queries and recommendation history"
    ],
    ko: [
      "개인정보 (이름, 이메일 주소, 프로필 사진)",
      "예술 선호도 및 성격 평가 결과",
      "사용 패턴 및 상호작용 데이터",
      "기기 정보 및 IP 주소",
      "쿠키 및 유사한 추적 기술",
      "전시회 관람 및 피드백 데이터",
      "AI 상호작용 데이터 및 생성된 콘텐츠 선호도",
      "검색 쿼리 및 추천 이력"
    ]
  },
  dataUse: {
    en: [
      "Provide personalized art recommendations",
      "Improve our services and user experience",
      "Send relevant notifications and updates",
      "Conduct research and analytics",
      "Ensure platform security and prevent fraud",
      "Comply with legal obligations"
    ],
    ko: [
      "개인화된 예술 추천 제공",
      "서비스 및 사용자 경험 개선",
      "관련 알림 및 업데이트 전송",
      "연구 및 분석 수행",
      "플랫폼 보안 확보 및 사기 방지",
      "법적 의무 준수"
    ]
  },
  dataSharing: {
    en: [
      "We do not sell your personal information to third parties",
      "Data may be shared with trusted service providers including:",
      "• OpenAI and Google AI for personalized recommendations",
      "• Replicate for AI art profile generation",
      "• Museum APIs (Met, Cleveland, Rijksmuseum) for artwork data",
      "• Cloudinary for image hosting and optimization",
      "Anonymous, aggregated data may be used for research",
      "Legal disclosure may be required by law enforcement",
      "Data transfer occurs only with your explicit consent"
    ],
    ko: [
      "제3자에게 개인정보를 판매하지 않습니다",
      "신뢰할 수 있는 서비스 제공업체와 데이터를 공유할 수 있습니다:",
      "• 개인화된 추천을 위한 OpenAI 및 Google AI",
      "• AI 아트 프로필 생성을 위한 Replicate",
      "• 작품 데이터를 위한 박물관 API (Met, Cleveland, Rijksmuseum)",
      "• 이미지 호스팅 및 최적화를 위한 Cloudinary",
      "익명화된 집계 데이터는 연구에 사용될 수 있습니다",
      "법 집행 기관에 의해 법적 공개가 요구될 수 있습니다",
      "데이터 전송은 귀하의 명시적 동의 하에만 이루어집니다"
    ]
  },
  dataRetention: {
    en: "We retain your data only as long as necessary to provide our services or as required by law. You may request deletion of your data at any time.",
    ko: "당사는 서비스 제공에 필요한 기간 또는 법률에서 요구하는 기간 동안만 귀하의 데이터를 보관합니다. 언제든지 데이터 삭제를 요청할 수 있습니다."
  },
  userRights: {
    en: [
      "Access your personal information",
      "Correct inaccurate data",
      "Delete your account and data",
      "Opt out of marketing communications",
      "Data portability upon request",
      "Withdraw consent at any time"
    ],
    ko: [
      "개인정보 접근",
      "부정확한 데이터 수정",
      "계정 및 데이터 삭제",
      "마케팅 커뮤니케이션 거부",
      "요청 시 데이터 이동성",
      "언제든지 동의 철회"
    ]
  },
  security: {
    en: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your data. Third-party AI services process data according to their own security standards.",
    ko: "당사는 귀하의 데이터를 보호하기 위해 암호화, 보안 서버, 정기적인 보안 감사를 포함한 업계 표준 보안 조치를 시행합니다. 제3자 AI 서비스는 자체 보안 기준에 따라 데이터를 처리합니다."
  },
  cookies: {
    en: "We use cookies to enhance your experience, analyze usage patterns, and provide personalized content. You can manage cookie preferences in your browser settings. Some features may not work properly without cookies.",
    ko: "당사는 사용자 경험을 향상시키고, 사용 패턴을 분석하며, 개인화된 콘텐츠를 제공하기 위해 쿠키를 사용합니다. 브라우저 설정에서 쿠키 기본 설정을 관리할 수 있습니다. 쿠키 없이는 일부 기능이 제대로 작동하지 않을 수 있습니다."
  },
  contact: "privacy@sayu.app"
};

export default function PrivacyPolicyPage() {
  const { language } = useLanguage();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              {...fadeInUp}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6"
            >
              <Shield className="w-8 h-8" />
            </motion.div>
            <motion.h1
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              {language === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300"
            >
              {language === 'ko' 
                ? '개인정보 수집, 이용, 보호에 관한 정책'
                : 'Our policy on collecting, using, and protecting your personal information'
              }
            </motion.p>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {language === 'ko' 
                ? `버전 ${privacyPolicy.version} • 최종 업데이트: ${privacyPolicy.lastUpdated.toLocaleDateString('ko-KR')}`
                : `Version ${privacyPolicy.version} • Last updated: ${privacyPolicy.lastUpdated.toLocaleDateString('en-US')}`
              }
            </motion.p>
          </div>

          {/* Introduction */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-green-400" />
              {language === 'ko' ? '개요' : 'Introduction'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {privacyPolicy.introduction[language]}
              </p>
            </div>
          </motion.section>

          {/* Data Collection */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Database className="w-6 h-6 mr-3 text-blue-400" />
              {language === 'ko' ? '수집하는 정보' : 'Information We Collect'}
            </h2>
            <div className="grid gap-4">
              {privacyPolicy.dataCollection[language].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-start"
                >
                  <span className="text-blue-400 mr-3 mt-1">•</span>
                  <p className="text-gray-200">{item}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Data Use */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '정보 이용 목적' : 'How We Use Your Information'}
            </h2>
            <div className="grid gap-4">
              {privacyPolicy.dataUse[language].map((use, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-purple-900/20 p-4 rounded-lg border border-purple-700 flex items-start"
                >
                  <span className="text-purple-400 mr-3 mt-1">→</span>
                  <p className="text-gray-200">{use}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Data Sharing */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.9 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '정보 공유' : 'Information Sharing'}
            </h2>
            <div className="grid gap-4">
              {privacyPolicy.dataSharing[language].map((sharing, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700 flex items-start"
                >
                  <span className="text-yellow-400 mr-3 mt-1">!</span>
                  <p className="text-gray-200">{sharing}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Data Retention */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '정보 보관' : 'Data Retention'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {privacyPolicy.dataRetention[language]}
              </p>
            </div>
          </motion.section>

          {/* User Rights */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '사용자 권리' : 'Your Rights'}
            </h2>
            <div className="grid gap-4">
              {privacyPolicy.userRights[language].map((right, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  className="bg-green-900/20 p-4 rounded-lg border border-green-700 flex items-start"
                >
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <p className="text-gray-200">{right}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Security */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-red-400" />
              {language === 'ko' ? '보안' : 'Security'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {privacyPolicy.security[language]}
              </p>
            </div>
          </motion.section>

          {/* Cookies */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Cookie className="w-6 h-6 mr-3 text-orange-400" />
              {language === 'ko' ? '쿠키' : 'Cookies'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {privacyPolicy.cookies[language]}
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-purple-400" />
              {language === 'ko' ? '문의' : 'Contact'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 mb-4">
                {language === 'ko' 
                  ? '개인정보 처리방침에 관한 문의사항이 있으시면 아래 이메일로 연락해 주세요:'
                  : 'For questions about this privacy policy, please contact us at:'
                }
              </p>
              <div className="flex items-center text-purple-400">
                <Mail className="w-5 h-5 mr-2" />
                <a 
                  href={`mailto:${privacyPolicy.contact}`}
                  className="hover:text-purple-300 transition-colors"
                >
                  {privacyPolicy.contact}
                </a>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 1.7 }}
            className="text-center text-gray-400 text-sm"
          >
            <p>
              {language === 'ko' 
                ? '이 정책은 예고 없이 변경될 수 있습니다. 최신 버전을 확인해 주세요.'
                : 'This policy may be updated without notice. Please check for the latest version.'
              }
            </p>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}