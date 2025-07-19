"use client"

import React from 'react'
import {
  FadeInText,
  StaggerText,
  TypewriterText,
  GradientText,
  FloatingText,
  BlurInText,
  UnderlineDrawText,
  RotateText
} from './text-animation'

export function TextAnimationDemo() {
  return (
    <div className="space-y-16 p-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-display">
          <StaggerText>SAYU Text Animations</StaggerText>
        </h1>
        <p className="text-lg text-muted-foreground">
          <FadeInText delay={500}>예술과 기술이 만나는 순간의 아름다움</FadeInText>
        </p>
      </div>

      {/* Fade In Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Fade In Animation</h2>
        <div className="space-y-4 p-6 bg-off-white rounded-xl">
          <h3 className="text-xl">
            <FadeInText>당신의 예술적 정체성을 발견하세요</FadeInText>
          </h3>
          <p className="text-muted-foreground">
            <FadeInText delay={200}>
              SAYU는 16가지 동물 캐릭터로 표현되는 성격 유형을 통해
            </FadeInText>
            <br />
            <FadeInText delay={400}>
              당신만의 독특한 예술 취향을 찾아드립니다.
            </FadeInText>
          </p>
        </div>
      </section>

      {/* Stagger Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Stagger Animation</h2>
        <div className="space-y-4 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl">
          <h3 className="text-3xl font-display">
            <StaggerText stagger={50}>예술은 영혼의 언어</StaggerText>
          </h3>
          <p className="text-lg">
            <StaggerText delay={300} stagger={20}>
              Art speaks where words are unable to explain
            </StaggerText>
          </p>
        </div>
      </section>

      {/* Typewriter Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Typewriter Animation</h2>
        <div className="space-y-4 p-6 bg-black text-white rounded-xl">
          <p className="text-lg font-mono">
            <TypewriterText duration={100}>
              const personality = analyzeYourArt();
            </TypewriterText>
          </p>
          <p className="text-lg font-mono">
            <TypewriterText delay={2000} duration={80}>
              return findYourArtisticIdentity();
            </TypewriterText>
          </p>
        </div>
      </section>

      {/* Gradient Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Gradient Animation</h2>
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-display">
            <GradientText gradient="from-primary via-secondary to-accent">
              당신의 색깔을 찾아보세요
            </GradientText>
          </h3>
          <p className="text-xl">
            <GradientText gradient="from-purple-400 to-pink-600">
              Find Your True Colors
            </GradientText>
          </p>
        </div>
      </section>

      {/* Floating Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Floating Animation</h2>
        <div className="flex justify-center items-center h-32 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
          <div className="text-4xl">
            <FloatingText>✨</FloatingText>
            <span className="mx-4 text-2xl font-display">
              <FloatingText>Dream</FloatingText>
            </span>
            <FloatingText>🎨</FloatingText>
          </div>
        </div>
      </section>

      {/* Blur In Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Blur In Animation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold">
              <BlurInText>발견</BlurInText>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              <BlurInText delay={200}>당신의 성격 유형</BlurInText>
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold">
              <BlurInText delay={400}>연결</BlurInText>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              <BlurInText delay={600}>예술과의 만남</BlurInText>
            </p>
          </div>
          <div className="text-center p-4">
            <h3 className="text-lg font-semibold">
              <BlurInText delay={800}>성장</BlurInText>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              <BlurInText delay={1000}>예술적 정체성</BlurInText>
            </p>
          </div>
        </div>
      </section>

      {/* Underline Draw Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Interactive Underline</h2>
        <div className="flex flex-wrap gap-6 text-lg">
          <UnderlineDrawText>갤러리 둘러보기</UnderlineDrawText>
          <UnderlineDrawText>성격 테스트</UnderlineDrawText>
          <UnderlineDrawText>AI 큐레이션</UnderlineDrawText>
          <UnderlineDrawText>아트 프로필</UnderlineDrawText>
        </div>
      </section>

      {/* Rotate Text Animation */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Rotating Text</h2>
        <div className="text-center p-8 bg-gradient-to-br from-off-white to-light-gray rounded-xl">
          <h3 className="text-2xl font-display">
            당신은{' '}
            <RotateText 
              texts={[
                '예술가',
                '감상자',
                '수집가',
                '큐레이터',
                '창작자'
              ]}
              className="text-primary font-bold"
            />
            입니다
          </h3>
        </div>
      </section>

      {/* Combined Example */}
      <section className="space-y-6 p-8 bg-black text-white rounded-2xl">
        <h2 className="text-2xl font-semibold mb-8">
          <FadeInText>복합 애니메이션 예시</FadeInText>
        </h2>
        <div className="space-y-6">
          <h3 className="text-3xl font-display">
            <StaggerText stagger={60}>
              <GradientText gradient="from-yellow-400 via-orange-500 to-red-500">
                SAYU: Art Life Platform
              </GradientText>
            </StaggerText>
          </h3>
          <p className="text-lg">
            <BlurInText delay={1000}>
              성격과 예술이 만나는 특별한 여정
            </BlurInText>
          </p>
          <div className="pt-4">
            <TypewriterText delay={2000} duration={50}>
              시작할 준비가 되셨나요?
            </TypewriterText>
          </div>
        </div>
      </section>
    </div>
  )
}