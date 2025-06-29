'use client';

import { useScroll, useTransform } from 'framer-motion';
import { motion } from 'framer-motion';
import HeroSection from '@/components/landing/HeroSection';
import Link from 'next/link';

export default function NewHomePage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -30]);

  const features = [
    {
      icon: '🎨',
      title: '개인화된 미술 성향 분석',
      description: 'AI가 당신의 취향을 분석하여 16가지 미술 성향 중 하나를 찾아드립니다',
      link: '/quiz'
    },
    {
      icon: '📚',
      title: '전시 아카이브',
      description: '관람한 전시에서 느낀 감정과 인사이트를 기록하고 통계를 확인하세요',
      link: '/exhibition-archive'
    },
    {
      icon: '🎭',
      title: '맞춤형 전시 추천',
      description: '당신의 성향에 맞는 전시를 추천받고 예약까지 한번에',
      link: '/exhibitions'
    },
    {
      icon: '🤝',
      title: '아트 커뮤니티',
      description: '같은 성향을 가진 사람들과 미술 경험을 공유하세요',
      link: '/community'
    }
  ];

  const testimonials = [
    {
      name: '김민지',
      type: 'LAEF',
      comment: '내가 왜 특정 작품에 끌리는지 이해하게 되었어요. SAYU 덕분에 미술관이 더 재미있어졌습니다!',
      rating: 5
    },
    {
      name: '이준호',
      type: 'SMEC',
      comment: '전시 아카이브 기능이 정말 유용해요. 나중에 다시 보니 내 취향의 변화가 보여서 신기합니다.',
      rating: 5
    },
    {
      name: '박서연',
      type: 'LREF',
      comment: '비슷한 성향의 사람들이 추천하는 전시는 정말 제 취향이더라고요. 놓칠 뻔한 좋은 전시를 많이 봤어요.',
      rating: 5
    }
  ];

  return (
    <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            SAYU와 함께하는 예술 여정
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all cursor-pointer"
              >
                <Link href={feature.link}>
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-96 h-96 bg-pink-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </motion.div>

        <div className="container mx-auto relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            어떻게 작동하나요?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            {[
              { step: '1', title: '퀴즈 참여', desc: '시나리오 기반 퀴즈로 당신의 미술 취향을 탐색합니다' },
              { step: '2', title: '성향 분석', desc: 'AI가 당신만의 고유한 미술 성향을 분석합니다' },
              { step: '3', title: '맞춤 경험', desc: '개인화된 전시 추천과 아트 커뮤니티를 즐기세요' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          >
            사용자들의 이야기
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-white/60 text-sm">{testimonial.type}</p>
                  </div>
                </div>
                <p className="text-white/90 mb-4">"{testimonial.comment}"</p>
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto max-w-4xl text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            당신의 미술 여정을 시작하세요
          </h2>
          <p className="text-xl text-white/80 mb-12">
            5분의 퀴즈로 평생의 미술 동반자를 만나보세요
          </p>
          
          <Link href="/quiz">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transition-all"
            >
              지금 시작하기 →
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-12 px-4">
        <div className="container mx-auto text-center text-white/60">
          <p className="mb-4">© 2024 SAYU. All rights reserved.</p>
          <div className="flex gap-6 justify-center">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}