'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { DailyChallengeCard } from '@/components/daily-challenge/DailyChallengeCard';
import { MatchResults } from '@/components/daily-challenge/MatchResults';

export default function DailyChallengePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          데일리 아트 챌린지
        </h1>
        <p className="text-muted-foreground">
          매일 새로운 작품을 만나고, 비슷한 감성을 가진 사람들을 발견하세요
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* 오늘의 챌린지 */}
        <div className="lg:col-span-2">
          <DailyChallengeCard />
        </div>

        {/* 매칭 결과 */}
        <div className="lg:col-span-1">
          <MatchResults />
        </div>
      </div>
    </div>
  );
}