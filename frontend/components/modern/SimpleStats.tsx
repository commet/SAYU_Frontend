'use client';

import { motion } from 'framer-motion';
import { Users, Brush, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SimpleStats() {
  const { language } = useLanguage();
  
  const stats = [
    {
      icon: Users,
      value: '50K+',
      label: language === 'ko' ? '활성 사용자' : 'Active Users',
    },
    {
      icon: Brush,
      value: '1M+',
      label: language === 'ko' ? '큐레이션된 작품' : 'Curated Artworks',
    },
    {
      icon: TrendingUp,
      value: '98%',
      label: language === 'ko' ? '만족도' : 'Satisfaction Rate',
    },
  ];
  
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-950">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-purple-600 dark:text-purple-400" />
                <h3 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}