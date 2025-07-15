'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Sparkles, 
  Users, 
  User, 
  Palette, 
  BookOpen,
  TrendingUp,
  Calendar,
  ArrowRight,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface FeatureCard {
  id: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  icon: React.ReactNode;
  path: string;
  requireAuth?: boolean;
  gradient: string;
  delay: number;
}

export default function ModernHomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [timeStats, setTimeStats] = useState({
    activeUsers: 1234,
    artworksViewed: 89234,
    personalitiesDiscovered: 567
  });

  // Feature cards with modern design
  const features: FeatureCard[] = [
    {
      id: 'quiz',
      title: { ko: '나의 예술 성향 발견', en: 'Discover Your Art Type' },
      description: { ko: '16가지 예술 성격 유형 중 나는 어떤 유형일까요?', en: 'Which of 16 art personality types are you?' },
      icon: <Sparkles className="w-6 h-6" />,
      path: '/quiz',
      gradient: 'from-sayu-lavender to-sayu-powder-blue',
      delay: 0.1
    },
    {
      id: 'gallery',
      title: { ko: '맞춤 갤러리', en: 'Personal Gallery' },
      description: { ko: 'AI가 추천하는 나만의 예술 작품들', en: 'AI-curated artworks just for you' },
      icon: <Palette className="w-6 h-6" />,
      path: '/gallery',
      requireAuth: true,
      gradient: 'from-sayu-sage to-sayu-lavender',
      delay: 0.2
    },
    {
      id: 'community',
      title: { ko: '아트 커뮤니티', en: 'Art Community' },
      description: { ko: '같은 취향을 가진 사람들과 소통하기', en: 'Connect with like-minded art lovers' },
      icon: <Users className="w-6 h-6" />,
      path: '/community',
      requireAuth: true,
      gradient: 'from-sayu-blush to-sayu-lavender',
      delay: 0.3
    },
    {
      id: 'profile',
      title: { ko: '나의 아트 프로필', en: 'My Art Profile' },
      description: { ko: '예술 여정을 기록하고 성장하기', en: 'Track your artistic journey' },
      icon: <User className="w-6 h-6" />,
      path: '/profile',
      requireAuth: true,
      gradient: 'from-sayu-powder-blue to-sayu-sage',
      delay: 0.4
    }
  ];

  // Recent activities with modern card design
  const recentActivities = [
    {
      user: 'Sarah K.',
      action: { ko: '인상주의 애호가로 판정', en: 'Identified as Impressionist Lover' },
      time: { ko: '5분 전', en: '5 mins ago' },
      avatar: '🎨'
    },
    {
      user: 'James L.',
      action: { ko: '모네 작품 20점 저장', en: 'Saved 20 Monet artworks' },
      time: { ko: '12분 전', en: '12 mins ago' },
      avatar: '🖼️'
    },
    {
      user: 'Mina P.',
      action: { ko: '추상화 커뮤니티 가입', en: 'Joined Abstract Art community' },
      time: { ko: '1시간 전', en: '1 hour ago' },
      avatar: '🎭'
    }
  ];

  const handleFeatureClick = (feature: FeatureCard) => {
    if (feature.requireAuth && !user) {
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-xl p-6 max-w-sm"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-sayu-lavender rounded-full">
              <Lock className="w-5 h-5 text-sayu-mocha" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sayu-text-primary mb-1">
                {language === 'ko' ? '로그인이 필요합니다' : 'Login Required'}
              </h3>
              <p className="text-sm text-sayu-text-secondary">
                {language === 'ko' 
                  ? '이 기능을 사용하려면 먼저 로그인해주세요.' 
                  : 'Please login to access this feature.'}
              </p>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push('/login');
                }}
                className="mt-3 text-sm font-medium text-sayu-mocha hover:underline"
              >
                {language === 'ko' ? '로그인하기' : 'Go to Login'}
              </button>
            </div>
          </div>
        </motion.div>
      ));
      return;
    }
    router.push(feature.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sayu-bg-primary to-sayu-bg-secondary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="sayu-container py-20 md:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-sayu-lavender rounded-full opacity-20 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sayu-sage rounded-full opacity-20 blur-3xl" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="sayu-display text-5xl md:text-7xl font-bold text-sayu-text-primary mb-6">
                {language === 'ko' 
                  ? <>예술로 발견하는<br />나의 진짜 모습</>
                  : <>Discover Your True Self<br />Through Art</>
                }
              </h1>
              <p className="text-xl md:text-2xl text-sayu-text-secondary mb-12 max-w-2xl mx-auto">
                {language === 'ko'
                  ? 'AI가 분석하는 당신의 예술 성향, 16가지 유형 중 당신은 어떤 예술가일까요?'
                  : 'AI analyzes your artistic preferences to reveal which of 16 personality types you are'}
              </p>

              {/* CTA Button */}
              <motion.button
                onClick={() => router.push('/quiz')}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-sayu-mocha text-sayu-cream rounded-full text-lg font-medium overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">
                  {language === 'ko' ? '테스트 시작하기' : 'Start Your Journey'}
                </span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-sayu-lavender to-sayu-sage"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>

            {/* Live Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { label: language === 'ko' ? '활성 사용자' : 'Active Users', value: timeStats.activeUsers.toLocaleString(), icon: <Users className="w-5 h-5" /> },
                { label: language === 'ko' ? '감상한 작품' : 'Artworks Viewed', value: timeStats.artworksViewed.toLocaleString(), icon: <Palette className="w-5 h-5" /> },
                { label: language === 'ko' ? '발견된 성향' : 'Types Discovered', value: timeStats.personalitiesDiscovered.toLocaleString(), icon: <Sparkles className="w-5 h-5" /> }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-2 text-sayu-mocha">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-sayu-text-primary">{stat.value}</div>
                  <div className="text-sm text-sayu-text-muted">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="sayu-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="sayu-display text-3xl md:text-4xl font-bold text-sayu-text-primary mb-4">
              {language === 'ko' ? '당신만의 예술 여정' : 'Your Art Journey'}
            </h2>
            <p className="text-lg text-sayu-text-secondary">
              {language === 'ko' 
                ? 'SAYU와 함께 예술적 자아를 발견하세요'
                : 'Discover your artistic self with SAYU'}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: feature.delay }}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleFeatureClick(feature)}
                className="relative group cursor-pointer"
              >
                <div className={`
                  relative p-8 rounded-2xl bg-white 
                  border border-sayu-warm-gray/20
                  shadow-sm hover:shadow-xl
                  transition-all duration-300
                  overflow-hidden
                  ${feature.requireAuth && !user ? 'opacity-90' : ''}
                `}>
                  {/* Gradient background */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br ${feature.gradient}
                    opacity-0 group-hover:opacity-10
                    transition-opacity duration-500
                  `} />

                  {/* Lock indicator */}
                  {feature.requireAuth && !user && (
                    <div className="absolute top-4 right-4">
                      <Lock className="w-4 h-4 text-sayu-text-muted" />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`
                        p-3 rounded-xl bg-gradient-to-br ${feature.gradient}
                        text-sayu-charcoal
                      `}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-sayu-text-primary mb-2">
                          {feature.title[language]}
                        </h3>
                        <p className="text-sayu-text-secondary">
                          {feature.description[language]}
                        </p>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <motion.div
                      className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100"
                      initial={false}
                      animate={{ x: hoveredCard === feature.id ? 5 : 0 }}
                    >
                      <ArrowRight className="w-5 h-5 text-sayu-mocha" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-20 bg-sayu-bg-tertiary">
        <div className="sayu-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="sayu-display text-2xl md:text-3xl font-bold text-sayu-text-primary mb-8 text-center">
              {language === 'ko' ? '실시간 아트 커뮤니티' : 'Live Art Community'}
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-2xl">{activity.avatar}</div>
                  <div className="flex-1">
                    <p className="text-sayu-text-primary">
                      <span className="font-semibold">{activity.user}</span>
                      {' '}
                      <span className="text-sayu-text-secondary">{activity.action[language]}</span>
                    </p>
                  </div>
                  <div className="text-sm text-sayu-text-muted">
                    {activity.time[language]}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/community')}
                className="text-sayu-mocha font-medium hover:underline"
              >
                {language === 'ko' ? '더 보기 →' : 'View More →'}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Art Quote Section */}
      <section className="py-20">
        <div className="sayu-container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <blockquote className="sayu-display text-2xl md:text-3xl text-sayu-text-primary mb-6">
              {language === 'ko' 
                ? "\"예술은 영혼을 일상의 먼지로부터 씻어준다\""
                : "\"Art washes away from the soul the dust of everyday life\""}
            </blockquote>
            <cite className="text-sayu-text-secondary">— Pablo Picasso</cite>
          </motion.div>
        </div>
      </section>
    </div>
  );
}