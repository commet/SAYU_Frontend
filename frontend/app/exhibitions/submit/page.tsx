'use client';

import ExhibitionSubmissionForm from '@/components/exhibition/ExhibitionSubmissionForm';

export default function ExhibitionSubmitPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            전시 정보 제보 📝
          </h1>
          <p className="text-xl text-white/80">
            새로운 전시 정보를 알려주세요
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <ExhibitionSubmissionForm />
        </div>
      </div>
    </div>
  );
}