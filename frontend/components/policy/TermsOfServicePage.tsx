'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, FileText, Users, AlertTriangle, Mail, Clock } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

const termsOfService = {
  version: "1.0",
  lastUpdated: new Date('2025-08-31'),
  effective: new Date('2025-08-31'),
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
    en: "Our platform integrates with third-party services for enhanced functionality. Use of these services is subject to their respective terms.",
    ko: "플랫폼 기능 향상을 위해 제3자 서비스와 통합됩니다. 이러한 서비스 사용은 각각의 이용약관의 적용을 받습니다."
  },
  intellectualProperty: {
    en: "All content on SAYU, including text, graphics, logos, and software, is our property or licensed to us. You grant us a license to use content you upload for service operation.",
    ko: "텍스트, 그래픽, 로고, 소프트웨어를 포함한 SAYU의 모든 콘텐츠는 당사 소유이거나 라이선스를 받았습니다. 귀하가 업로드한 콘텐츠에 대해 서비스 운영을 위한 라이선스를 부여합니다."
  },
  disclaimers: {
    en: "SAYU provides entertainment and educational content only. We are not responsible for decisions made based on our recommendations. AI-generated content may contain errors.",
    ko: "SAYU는 오락 및 교육 목적의 콘텐츠만 제공합니다. 추천에 기반한 결정에 대해 책임지지 않습니다. AI 생성 콘텐츠는 오류를 포함할 수 있습니다."
  },
  indemnification: {
    en: "You agree to defend and hold SAYU harmless from any claims arising from your use of the service or violation of these terms.",
    ko: "서비스 사용 또는 약관 위반으로 인한 모든 청구로부터 SAYU를 방어하고 면책하는 데 동의합니다."
  },
  governingLaw: {
    en: "These terms are governed by the laws of the Republic of Korea. Any disputes shall be resolved in the courts of Seoul, Korea.",
    ko: "이 약관은 대한민국 법률의 적용을 받습니다. 모든 분쟁은 서울 법원에서 해결됩니다."
  },
  modifications: {
    en: "We may update these terms at any time. Continued use after changes constitutes acceptance of the new terms.",
    ko: "약관은 언제든지 업데이트될 수 있습니다. 변경 후 계속 사용하면 새 약관에 동의하는 것으로 간주됩니다."
  },
  severability: {
    en: "If any provision of these terms is found invalid, the remaining provisions will continue in full force.",
    ko: "약관의 일부 조항이 무효인 경우에도 나머지 조항은 완전한 효력을 유지합니다."
  },
  contact: "sayucurator@gmail.com"
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
              {language === 'ko' ? '이용약관' : 'Terms of Service'}
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-sm text-gray-400"
            >
              {language === 'ko' 
                ? `최종 업데이트: ${termsOfService.lastUpdated.toLocaleDateString('ko-KR')}`
                : `Last updated: ${termsOfService.lastUpdated.toLocaleDateString('en-US')}`
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
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm">
                <span className="font-semibold text-blue-400">📋 {language === 'ko' ? '간단 요약' : 'Quick Summary'}:</span> {language === 'ko' ? 'SAYU는 AI 기반 예술 추천 서비스입니다. 13세 이상 이용 가능하며, 개인정보는 안전하게 보호됩니다. 부적절한 행위는 계정 정지 사유가 됩니다.' : 'SAYU is an AI-powered art recommendation service. Must be 13+ to use. Your data is protected. Inappropriate behavior may result in account suspension.'}
              </p>
            </div>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '1. 서비스 이용' : '1. Using Our Service'}:</span> {termsOfService.acceptance[language]} {language === 'ko' ? 'SAYU는 예술 성격 평가, 전시회 발견, 작품 추천, 커뮤니티 기능을 제공합니다.' : 'SAYU provides art personality assessments, exhibition discovery, artwork recommendations, and community features.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '2. 사용자 책임' : '2. Your Responsibilities'}:</span> {language === 'ko' ? '정확한 정보 제공, 타인의 권리 존중, 계정 보안 유지가 필요합니다. AI 추천은 참고용이며 완벽하지 않을 수 있습니다.' : 'Provide accurate info, respect others\' rights, keep your account secure. AI recommendations are for reference and may not be perfect.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '3. 금지사항' : '3. Don\'t Do This'}:</span> {language === 'ko' ? '저작권 침해, 괴롭힘, 스팸, 해킹, 가짜 계정 생성, 무단 상업적 이용은 금지됩니다.' : 'No copyright infringement, harassment, spam, hacking, fake accounts, or unauthorized commercial use.'}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '4. 책임 제한' : '4. Limitations'}:</span> {termsOfService.limitation[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '5. 계정 정지' : '5. Account Termination'}:</span> {termsOfService.termination[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '6. 외부 서비스' : '6. Third-Party Services'}:</span> {termsOfService.thirdPartyServices[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '7. 지적재산권' : '7. Intellectual Property'}:</span> {termsOfService.intellectualProperty[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '8. 면책조항' : '8. Disclaimers'}:</span> {termsOfService.disclaimers[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '9. 배상' : '9. Indemnification'}:</span> {termsOfService.indemnification[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '10. 준거법' : '10. Governing Law'}:</span> {termsOfService.governingLaw[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '11. 약관 변경' : '11. Changes to Terms'}:</span> {termsOfService.modifications[language]}
            </p>

            <p>
              <span className="font-semibold text-white">{language === 'ko' ? '12. 가분성' : '12. Severability'}:</span> {termsOfService.severability[language]}
            </p>
          </motion.div>

          {/* Contact Box */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gray-800/30 rounded-lg p-4 border border-gray-700"
          >
            <p className="text-sm text-gray-300">
              <span className="font-semibold text-purple-400">✉️ {language === 'ko' ? '문의' : 'Contact'}:</span> {language === 'ko' ? '질문이 있으시면' : 'Questions?'} <a href={`mailto:${termsOfService.contact}`} className="text-purple-400 hover:text-purple-300 underline">{termsOfService.contact}</a>
            </p>
          </motion.div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
}