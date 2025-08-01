'use client';

import { motion } from 'framer-motion';
import { Trash2, Mail, Shield, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Data Deletion Request / 데이터 삭제 요청
            </h1>
            <p className="text-gray-600">
              Your privacy is our priority / 귀하의 개인정보는 우리의 최우선 사항입니다
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <section className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                How to Delete Your Data / 데이터 삭제 방법
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Option 1: In-App Deletion / 앱 내 삭제</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Go to Settings → Account → Delete Account<br/>
                      설정 → 계정 → 계정 삭제
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Option 2: Email Request / 이메일 요청</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Send email to: privacy@sayu.art<br/>
                      Subject: Data Deletion Request<br/>
                      Include your registered email address
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                What will be deleted? / 삭제되는 항목
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Profile information (name, email, photo) / 프로필 정보
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Art preferences and personality data / 예술 취향 및 성격 데이터
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Saved artworks and collections / 저장된 작품 및 컬렉션
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  Activity history / 활동 기록
                </li>
              </ul>
            </section>

            <section className="border-t pt-6">
              <p className="text-sm text-gray-600 text-center">
                Processing time: Within 30 days / 처리 기간: 30일 이내<br/>
                For immediate assistance: support@sayu.art
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-8 text-center">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to SAYU
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}