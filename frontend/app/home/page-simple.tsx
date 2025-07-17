'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SimpleHomePage() {
  const router = useRouter();
  const { language } = useLanguage();

  const features = [
    {
      name: language === 'ko' ? '성향 테스트' : 'Personality Test',
      description: language === 'ko' ? '3분 테스트로 예술 유형 발견' : 'Discover your art type in 3 minutes',
      path: '/quiz',
      icon: '🎭'
    },
    {
      name: language === 'ko' ? '갤러리' : 'Gallery',
      description: language === 'ko' ? '세계 명작 탐험' : 'Explore world masterpieces',
      path: '/gallery',
      icon: '🖼️'
    },
    {
      name: language === 'ko' ? '작가 발견' : 'Discover Artists',
      description: language === 'ko' ? '다양한 작가들 만나기' : 'Meet various artists',
      path: '/artists',
      icon: '👨‍🎨'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            SAYU
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {language === 'ko' ? '당신만의 예술 여정이 시작됩니다' : 'Your Personal Art Journey Begins'}
          </p>
          
          <div className="flex gap-4 justify-center mb-8">
            <Link href="/">
              <Button variant="outline">
                {language === 'ko' ? '처음으로' : 'Back to Start'}
              </Button>
            </Link>
            <Link href="/quiz">
              <Button>
                {language === 'ko' ? '테스트 시작' : 'Start Test'}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card 
              key={feature.path} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(feature.path)}
            >
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.name}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm">
                  {language === 'ko' ? '시작하기' : 'Start'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-purple-600">16</div>
              <div className="text-sm text-gray-600">{language === 'ko' ? '성격 유형' : 'Personality Types'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">1000+</div>
              <div className="text-sm text-gray-600">{language === 'ko' ? '예술 작품' : 'Artworks'}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-gray-600">{language === 'ko' ? '작가들' : 'Artists'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}