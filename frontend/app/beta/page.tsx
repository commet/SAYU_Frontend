import { Metadata } from 'next';
import { WaitlistForm } from '@/components/waitlist/WaitlistForm';
import { WaitlistHero } from '@/components/waitlist/WaitlistHero';

export const metadata: Metadata = {
  title: 'SAYU Beta - 예술로 사유하는 새로운 방법',
  description: '50만 명이 기다리는 SAYU 베타에 지금 참여하세요. 당신의 감정과 예술이 만나는 순간.',
  openGraph: {
    title: 'SAYU Beta - 예술로 사유하는 새로운 방법',
    description: '50만 명이 기다리는 SAYU 베타에 지금 참여하세요.',
    images: ['/images/beta-og.png']
  }
};

export default function BetaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <WaitlistHero />
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <WaitlistForm />
        </div>
      </section>

      {/* 소셜 증명 섹션 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">24시간</div>
              <div className="text-gray-600">만에 1만 명 돌파</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">87%</div>
              <div className="text-gray-600">APT 테스트 완료율</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">3.2명</div>
              <div className="text-gray-600">평균 친구 초대 수</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}