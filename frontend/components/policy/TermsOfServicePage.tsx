'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, FileText, Users, AlertTriangle, Mail, Clock } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

const termsOfService = {
  version: "1.0",
  lastUpdated: new Date('2024-01-01'),
  effective: new Date('2024-01-01'),
  acceptance: {
    en: "By accessing and using SAYU, you accept and agree to be bound by the terms and provision of this agreement.",
    ko: "SAYU에 접근하고 이용함으로써 귀하는 이 약관의 조건과 규정에 동의하고 이를 준수할 것에 동의합니다."
  },
  services: {
    en: [
      "Art personality assessments and recommendations",
      "Exhibition discovery and planning tools",
      "Artwork recommendations based on your preferences",
      "Community features for art enthusiasts",
      "AI-powered art profile generation",
      "Cultural event notifications and updates",
      "Integration with museum APIs and third-party art databases",
      "AI-enhanced content curation and personalization"
    ],
    ko: [
      "예술 성격 평가 및 추천",
      "전시회 발견 및 계획 도구",
      "선호도 기반 작품 추천",
      "예술 애호가를 위한 커뮤니티 기능",
      "AI 기반 아트 프로필 생성",
      "문화 행사 알림 및 업데이트",
      "박물관 API 및 제3자 예술 데이터베이스 통합",
      "AI 기반 콘텐츠 큐레이션 및 개인화"
    ]
  },
  userResponsibilities: {
    en: [
      "Provide accurate information during registration and assessments",
      "Respect intellectual property rights of artists and institutions",
      "Use the platform in accordance with applicable laws",
      "Maintain confidentiality of your account credentials",
      "Report inappropriate content or behavior",
      "Respect other users' privacy and opinions",
      "Acknowledge that AI-generated content may not always be accurate",
      "Understand that recommendations are based on algorithmic analysis"
    ],
    ko: [
      "회원가입 및 평가 시 정확한 정보 제공",
      "예술가와 기관의 지적 재산권 존중",
      "관련 법률에 따른 플랫폼 사용",
      "계정 자격 증명의 기밀성 유지",
      "부적절한 콘텐츠나 행동 신고",
      "다른 사용자의 개인정보와 의견 존중",
      "AI 생성 콘텐츠가 항상 정확하지 않을 수 있음을 인지",
      "추천이 알고리즘 분석에 기반함을 이해"
    ]
  },
  prohibitedActivities: {
    en: [
      "Uploading copyrighted material without permission",
      "Harassment or discrimination against other users",
      "Spam, phishing, or malicious activities",
      "Attempting to hack or compromise the platform",
      "Creating fake accounts or impersonating others",
      "Commercial use without explicit permission"
    ],
    ko: [
      "허가 없는 저작권 보호 자료 업로드",
      "다른 사용자에 대한 괴롭힘이나 차별",
      "스팸, 피싱 또는 악성 활동",
      "플랫폼 해킹 또는 침해 시도",
      "가짜 계정 생성 또는 타인 사칭",
      "명시적 허가 없는 상업적 사용"
    ]
  },
  limitation: {
    en: "SAYU is provided 'as is' without warranties. We are not liable for any damages arising from the use of our platform.",
    ko: "SAYU는 보증 없이 '있는 그대로' 제공됩니다. 당사는 플랫폼 사용으로 인해 발생하는 손해에 대해 책임지지 않습니다."
  },
  termination: {
    en: "We may terminate or suspend your account at our sole discretion for violations of these terms.",
    ko: "당사는 이 약관 위반 시 단독 재량으로 귀하의 계정을 종료하거나 정지할 수 있습니다."
  },
  thirdPartyServices: {
    en: "Our platform integrates with third-party services including OpenAI, Google AI, Replicate, Met Museum, Cleveland Museum, Rijksmuseum, and Cloudinary. Use of these services is subject to their respective terms and privacy policies.",
    ko: "저희 플랫폼은 OpenAI, Google AI, Replicate, Met Museum, Cleveland Museum, Rijksmuseum, Cloudinary 등의 제3자 서비스와 통합됩니다. 이러한 서비스 사용은 각각의 이용약관 및 개인정보 처리방침의 적용을 받습니다."
  },
  contact: "legal@sayu.app"
};

export default function TermsOfServicePage() {
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
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6"
            >
              <FileText className="w-8 h-8" />
            </motion.div>
            <motion.h1
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              {language === 'ko' ? '이용약관' : 'Terms of Service'}
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300"
            >
              {language === 'ko' 
                ? 'SAYU 서비스 이용을 위한 약관과 조건'
                : 'Terms and conditions for using SAYU services'
              }
            </motion.p>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              {language === 'ko' 
                ? `버전 ${termsOfService.version} • 최종 업데이트: ${termsOfService.lastUpdated.toLocaleDateString('ko-KR')}`
                : `Version ${termsOfService.version} • Last updated: ${termsOfService.lastUpdated.toLocaleDateString('en-US')}`
              }
            </motion.p>
          </div>

          {/* Acceptance */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-blue-400" />
              {language === 'ko' ? '약관 동의' : 'Acceptance of Terms'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {termsOfService.acceptance[language]}
              </p>
            </div>
          </motion.section>

          {/* Services */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '제공 서비스' : 'Our Services'}
            </h2>
            <div className="grid gap-4">
              {termsOfService.services[language].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-start"
                >
                  <span className="text-blue-400 mr-3 mt-1">•</span>
                  <p className="text-gray-200">{service}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* User Responsibilities */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.7 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-green-400" />
              {language === 'ko' ? '사용자 책임' : 'User Responsibilities'}
            </h2>
            <div className="grid gap-4">
              {termsOfService.userResponsibilities[language].map((responsibility, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-green-900/20 p-4 rounded-lg border border-green-700 flex items-start"
                >
                  <span className="text-green-400 mr-3 mt-1">✓</span>
                  <p className="text-gray-200">{responsibility}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Prohibited Activities */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.9 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-red-400" />
              {language === 'ko' ? '금지 활동' : 'Prohibited Activities'}
            </h2>
            <div className="grid gap-4">
              {termsOfService.prohibitedActivities[language].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                  className="bg-red-900/20 p-4 rounded-lg border border-red-700 flex items-start"
                >
                  <span className="text-red-400 mr-3 mt-1">✕</span>
                  <p className="text-gray-200">{activity}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Limitation of Liability */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '책임의 제한' : 'Limitation of Liability'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {termsOfService.limitation[language]}
              </p>
            </div>
          </motion.section>

          {/* Termination */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '서비스 종료' : 'Termination'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {termsOfService.termination[language]}
              </p>
            </div>
          </motion.section>

          {/* Third Party Services */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '제3자 서비스' : 'Third-Party Services'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 leading-relaxed">
                {termsOfService.thirdPartyServices[language]}
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Mail className="w-6 h-6 mr-3 text-purple-400" />
              {language === 'ko' ? '문의' : 'Contact'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <p className="text-gray-200 mb-4">
                {language === 'ko' 
                  ? '이용약관에 관한 문의사항이 있으시면 아래 이메일로 연락해 주세요:'
                  : 'For questions about these terms, please contact us at:'
                }
              </p>
              <div className="flex items-center text-purple-400">
                <Mail className="w-5 h-5 mr-2" />
                <a 
                  href={`mailto:${termsOfService.contact}`}
                  className="hover:text-purple-300 transition-colors"
                >
                  {termsOfService.contact}
                </a>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 1.4 }}
            className="text-center text-gray-400 text-sm"
          >
            <p>
              {language === 'ko' 
                ? '이 약관은 예고 없이 변경될 수 있습니다. 최신 버전을 확인해 주세요.'
                : 'These terms may be updated without notice. Please check for the latest version.'
              }
            </p>
          </motion.div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}