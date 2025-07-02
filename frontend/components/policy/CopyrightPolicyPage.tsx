'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Shield, Image, Users, AlertTriangle, Mail } from 'lucide-react';
import { Footer } from '@/components/ui/Footer';

const copyrightPolicy = {
  version: "1.0",
  lastUpdated: new Date('2024-01-01'),
  principles: [
    "SAYU respects all intellectual property rights and copyright laws",
    "We only display public domain artworks without watermarks or restrictions",
    "Licensed content is shown with appropriate watermarks and attribution",
    "Contemporary artist content is limited to links and metadata only",
    "All user-uploaded content must comply with fair use and personal ownership",
    "We respond promptly to copyright infringement reports"
  ],
  principlesKo: [
    "SAYU는 모든 지적 재산권과 저작권법을 존중합니다",
    "퍼블릭 도메인 작품만 워터마크나 제한 없이 표시합니다",
    "라이선스 콘텐츠는 적절한 워터마크와 출처 표시와 함께 제공됩니다",
    "현대 작가 콘텐츠는 링크와 메타데이터만으로 제한됩니다",
    "모든 사용자 업로드 콘텐츠는 공정 사용과 개인 소유권을 준수해야 합니다",
    "저작권 침해 신고에 신속하게 대응합니다"
  ],
  imagePolicy: {
    publicDomain: "Full resolution images available for download and sharing",
    licensed: "Watermarked thumbnails only, with purchase links when available",
    contemporary: "No images displayed - external links and metadata only"
  },
  userUploads: {
    personalUse: "Users may upload images they own or have permission to use",
    publicSharing: "Shared content must respect copyright and fair use principles",
    restrictions: [
      "No copyrighted artwork without permission",
      "No unauthorized reproductions",
      "Attribution required for licensed content"
    ]
  },
  reporting: {
    process: "Submit copyright concerns via email with detailed information",
    responseTime: "We respond within 24-48 hours",
    contact: "copyright@sayu.art"
  }
};

export default function CopyrightPolicyPage() {
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
              className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-6"
            >
              <Shield className="w-8 h-8" />
            </motion.div>
            <motion.h1
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-4xl font-bold mb-4"
            >
              {language === 'ko' ? '저작권 정책' : 'Copyright Policy'}
            </motion.h1>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300"
            >
              {language === 'ko' 
                ? 'SAYU의 예술 저작권 보호 원칙과 정책'
                : 'SAYU\'s principles and policies for protecting artistic copyright'
              }
            </motion.p>
            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-400 mt-2"
            >
              {language === 'ko' 
                ? `버전 ${copyrightPolicy.version} • 최종 업데이트: ${copyrightPolicy.lastUpdated.toLocaleDateString('ko-KR')}`
                : `Version ${copyrightPolicy.version} • Last updated: ${copyrightPolicy.lastUpdated.toLocaleDateString('en-US')}`
              }
            </motion.p>
          </div>

          {/* Core Principles */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Users className="w-6 h-6 mr-3 text-purple-400" />
              {language === 'ko' ? '핵심 원칙' : 'Core Principles'}
            </h2>
            <div className="grid gap-4">
              {(language === 'ko' ? copyrightPolicy.principlesKo : copyrightPolicy.principles).map((principle, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-gray-800/50 p-4 rounded-lg border border-gray-700"
                >
                  <p className="text-gray-200">{principle}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Image Policy */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <Image className="w-6 h-6 mr-3 text-purple-400" />
              {language === 'ko' ? '이미지 정책' : 'Image Policy'}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-green-900/20 p-6 rounded-lg border border-green-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">
                  {language === 'ko' ? '퍼블릭 도메인' : 'Public Domain'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'ko' 
                    ? '다운로드 및 공유 가능한 전체 해상도 이미지 제공'
                    : copyrightPolicy.imagePolicy.publicDomain
                  }
                </p>
              </div>
              <div className="bg-yellow-900/20 p-6 rounded-lg border border-yellow-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                  {language === 'ko' ? '라이선스 콘텐츠' : 'Licensed Content'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'ko' 
                    ? '워터마크가 있는 썸네일만 제공, 가능한 경우 구매 링크 포함'
                    : copyrightPolicy.imagePolicy.licensed
                  }
                </p>
              </div>
              <div className="bg-red-900/20 p-6 rounded-lg border border-red-700">
                <h3 className="text-lg font-semibold text-red-400 mb-3">
                  {language === 'ko' ? '현대 작가' : 'Contemporary Artists'}
                </h3>
                <p className="text-gray-300 text-sm">
                  {language === 'ko' 
                    ? '이미지 표시 없음 - 외부 링크와 메타데이터만 제공'
                    : copyrightPolicy.imagePolicy.contemporary
                  }
                </p>
              </div>
            </div>
          </motion.section>

          {/* User Guidelines */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 0.8 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6">
              {language === 'ko' ? '사용자 가이드라인' : 'User Guidelines'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                  {language === 'ko' ? '개인 사용' : 'Personal Use'}
                </h3>
                <p className="text-gray-300">
                  {language === 'ko' 
                    ? '사용자는 소유하거나 사용 권한이 있는 이미지를 업로드할 수 있습니다'
                    : copyrightPolicy.userUploads.personalUse
                  }
                </p>
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">
                  {language === 'ko' ? '공개 공유' : 'Public Sharing'}
                </h3>
                <p className="text-gray-300">
                  {language === 'ko' 
                    ? '공유되는 콘텐츠는 저작권과 공정 사용 원칙을 존중해야 합니다'
                    : copyrightPolicy.userUploads.publicSharing
                  }
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-400 mb-2">
                  {language === 'ko' ? '제한 사항' : 'Restrictions'}
                </h3>
                <ul className="text-gray-300 space-y-1">
                  {(language === 'ko' ? [
                    '허가 없는 저작권 보호 작품 금지',
                    '무단 복제 금지',
                    '라이선스 콘텐츠 출처 표시 필수'
                  ] : copyrightPolicy.userUploads.restrictions).map((restriction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-400 mr-2">•</span>
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.section>

          {/* Reporting */}
          <motion.section
            {...fadeInUp}
            transition={{ delay: 1.0 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-3 text-purple-400" />
              {language === 'ko' ? '저작권 침해 신고' : 'Copyright Infringement Reporting'}
            </h2>
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    {language === 'ko' ? '신고 절차' : 'Reporting Process'}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {language === 'ko' 
                      ? '상세한 정보와 함께 이메일로 저작권 문제를 신고해 주세요'
                      : copyrightPolicy.reporting.process
                    }
                  </p>
                  <div className="flex items-center text-purple-400">
                    <Mail className="w-5 h-5 mr-2" />
                    <a 
                      href={`mailto:${copyrightPolicy.reporting.contact}`}
                      className="hover:text-purple-300 transition-colors"
                    >
                      {copyrightPolicy.reporting.contact}
                    </a>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-3">
                    {language === 'ko' ? '응답 시간' : 'Response Time'}
                  </h3>
                  <p className="text-gray-300">
                    {language === 'ko' 
                      ? '24-48시간 내에 응답드립니다'
                      : copyrightPolicy.reporting.responseTime
                    }
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.div
            {...fadeInUp}
            transition={{ delay: 1.2 }}
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