'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Eye, Database, Lock, Cookie, Mail, Calendar } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

const privacyPolicy = {
  version: "1.0",
  lastUpdated: new Date('2025-08-31'),
  effective: new Date('2025-08-31'),
  introduction: {
    en: "SAYU helps you discover art that speaks to you. We only collect what's needed to make your experience better, and we keep your information safe.",
    ko: "SAYU는 당신에게 맞는 예술을 찾는 데 도움을 줍니다. 서비스 개선을 위해 필요한 정보만 수집하며, 안전하게 보호합니다."
  },
  dataCollection: {
    en: [
      "Basic info: name, email, and profile picture",
      "Your art preferences and personality quiz results",
      "Which artworks you like and view"
    ],
    ko: [
      "기본 정보: 이름, 이메일, 프로필 사진",
      "예술 선호도 및 성격 퀴즈 결과",
      "좋아하고 관람한 작품 정보"
    ]
  },
  dataUse: {
    en: [
      "Show you art recommendations that match your taste",
      "Make the app work better for everyone",
      "Keep your account secure"
    ],
    ko: [
      "취향에 맞는 예술 작품 추천",
      "모든 사용자를 위한 서비스 개선",
      "계정 보안 유지"
    ]
  },
  dataSharing: {
    en: [
      "We never sell your information",
      "We work with trusted services to show you art from museums",
      "We may share anonymous, general statistics for research"
    ],
    ko: [
      "개인정보를 절대 판매하지 않습니다",
      "박물관 작품을 보여주기 위해 신뢰할 수 있는 서비스와 협력합니다",
      "연구를 위해 익명화된 일반 통계를 공유할 수 있습니다"
    ]
  },
  dataRetention: {
    en: "We keep your information only as long as you use SAYU. You can delete your account and all your data anytime.",
    ko: "SAYU를 사용하는 동안만 정보를 보관합니다. 언제든지 계정과 모든 데이터를 삭제할 수 있습니다."
  },
  userRights: {
    en: [
      "See what information we have about you",
      "Fix any wrong information",
      "Delete your account completely",
      "Download your data"
    ],
    ko: [
      "보유한 개인정보 확인",
      "잘못된 정보 수정",
      "계정 완전 삭제",
      "데이터 다운로드"
    ]
  },
  security: {
    en: "We use strong security measures to protect your information, including encryption and secure servers.",
    ko: "암호화 및 보안 서버를 포함한 강력한 보안 조치로 정보를 보호합니다."
  },
  cookies: {
    en: "We use cookies to remember your preferences and make the site work better. You can turn them off in your browser if you want.",
    ko: "선호도를 기억하고 사이트를 개선하기 위해 쿠키를 사용합니다. 원하시면 브라우저에서 끌 수 있습니다."
  },
  minorProtection: {
    en: "SAYU is for users 13 and older. We don't knowingly collect information from children under 13.",
    ko: "SAYU는 13세 이상 사용자를 위한 서비스입니다. 13세 미만 아동의 정보를 의도적으로 수집하지 않습니다."
  },
  legalBasis: {
    en: "We process your data based on your consent and to provide the services you requested.",
    ko: "귀하의 동의와 요청하신 서비스 제공을 위해 데이터를 처리합니다."
  },
  dataTransfer: {
    en: "Your data may be processed in South Korea and the United States where our servers are located.",
    ko: "데이터는 서버가 위치한 대한민국과 미국에서 처리될 수 있습니다."
  },
  policyChanges: {
    en: "If we change this policy, we'll notify you by email and in the app.",
    ko: "정책 변경 시 이메일과 앱을 통해 알려드립니다."
  },
  thirdPartyLinks: {
    en: "We're not responsible for the privacy practices of external websites we link to.",
    ko: "링크된 외부 웹사이트의 개인정보 처리방침에 대해서는 책임지지 않습니다."
  },
  contact: "sayucurator@gmail.com"
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
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Compact Header */}
          <div className="text-center mb-8">
            <motion.h1
              {...fadeInUp}
              className="text-3xl font-bold mb-2"
            >
              {language === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-400"
            >
              {language === 'ko' 
                ? `최종 업데이트: ${privacyPolicy.lastUpdated.toLocaleDateString('ko-KR')}`
                : `Last updated: ${privacyPolicy.lastUpdated.toLocaleDateString('en-US')}`
              }
            </motion.p>
          </div>

          {/* Main Content - Flowing Text */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="space-y-6 text-gray-200 leading-relaxed"
          >
            {/* Quick Summary Box */}
            <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm">
                <span className="font-semibold text-green-400">🔒 {language === 'ko' ? '간단 요약' : 'Quick Summary'}:</span> {privacyPolicy.introduction[language]}
              </p>
            </div>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '1. 수집 정보' : '1. What We Collect'}:</span> {language === 'ko' ? '기본 정보(이름, 이메일, 프로필 사진), 예술 선호도 및 성격 퀴즈 결과, 좋아하고 관람한 작품 정보를 수집합니다.' : 'Basic info (name, email, profile picture), art preferences and personality quiz results, liked and viewed artworks.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '2. 이용 목적' : '2. How We Use It'}:</span> {language === 'ko' ? '취향에 맞는 예술 작품 추천, 서비스 개선, 계정 보안 유지에 사용합니다.' : 'To show you art recommendations that match your taste, improve the service, and keep your account secure.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '3. 정보 공유' : '3. Information Sharing'}:</span> {language === 'ko' ? '개인정보를 절대 판매하지 않습니다. 박물관 작품을 보여주기 위해 신뢰할 수 있는 서비스와 협력하며, 연구를 위해 익명화된 통계만 공유할 수 있습니다.' : 'We never sell your information. We work with trusted services to show museum art and may share anonymous statistics for research.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '4. 정보 보관' : '4. Data Retention'}:</span> {privacyPolicy.dataRetention[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '5. 사용자 권리' : '5. Your Rights'}:</span> {language === 'ko' ? '보유한 개인정보 확인, 잘못된 정보 수정, 계정 완전 삭제, 데이터 다운로드가 가능합니다.' : 'See your information, fix any errors, delete your account completely, download your data.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '6. 보안' : '6. Security'}:</span> {privacyPolicy.security[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '7. 쿠키' : '7. Cookies'}:</span> {privacyPolicy.cookies[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '8. 추가 정보' : '8. Additional Info'}:</span> {language === 'ko' ? '13세 이상 사용 가능. 동의 기반 정보 처리. 한국과 미국에서 데이터 처리. 정책 변경 시 이메일과 앱으로 알림. 외부 사이트의 개인정보 처리는 책임지지 않음.' : 'Must be 13+. We process data with your consent. Data processed in Korea and US. Policy changes notified via email and app. Not responsible for external sites\' privacy practices.'}
            </p>
          </motion.div>

          {/* Contact Box */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gray-800/30 rounded-lg p-4 border border-gray-700"
          >
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-purple-400">✉️ {language === 'ko' ? '문의' : 'Contact'}:</span> {language === 'ko' ? '질문이 있으시면' : 'Questions?'} <a href={`mailto:${privacyPolicy.contact}`} className="text-purple-400 hover:text-purple-300 underline">{privacyPolicy.contact}</a>
            </p>
          </motion.div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}