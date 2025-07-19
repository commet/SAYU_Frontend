"use client"

import React from 'react'
import { Button } from './button-enhanced'
import { Heart, Share2, Download, Check, ArrowRight } from 'lucide-react'

export function ButtonDemo() {
  const [loading, setLoading] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const handleClick = (id: string) => {
    setLoading(id)
    setSuccess(null)
    
    setTimeout(() => {
      setLoading(null)
      setSuccess(id)
      
      setTimeout(() => {
        setSuccess(null)
      }, 2000)
    }, 1500)
  }

  return (
    <div className="space-y-12 p-8 max-w-4xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display">SAYU Button Components</h1>
        <p className="text-muted-foreground">미니멀하면서도 우아한 인터랙션</p>
      </div>

      {/* Primary Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Primary Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => handleClick('save')}
            loading={loading === 'save'}
            disabled={success === 'save'}
          >
            {success === 'save' ? (
              <>
                <Check className="h-4 w-4" />
                저장됨
              </>
            ) : '작품 저장하기'}
          </Button>
          
          <Button 
            variant="primary" 
            size="lg"
            onClick={() => handleClick('start')}
            loading={loading === 'start'}
          >
            퀴즈 시작하기
            <ArrowRight className="h-5 w-5" />
          </Button>
          
          <Button variant="primary" size="sm">
            <Heart className="h-3 w-3" />
            좋아요
          </Button>
        </div>
      </section>

      {/* Secondary & Glass Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Secondary Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="secondary">
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
          
          <Button variant="glass">
            <Download className="h-4 w-4" />
            다운로드
          </Button>
          
          <Button variant="glass" size="lg">
            프로필 편집
          </Button>
        </div>
      </section>

      {/* Ghost & Outline Buttons */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Subtle Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="ghost">더보기</Button>
          <Button variant="outline">필터</Button>
          <Button variant="link">모든 작품 보기</Button>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Loading States</h2>
        <div className="flex flex-wrap gap-4">
          <Button loading loadingText="처리중...">
            로딩 상태
          </Button>
          
          <Button variant="secondary" loading>
            업로드 중
          </Button>
          
          <Button variant="glass" size="icon" loading>
            <Heart />
          </Button>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4 p-6 bg-off-white rounded-2xl">
        <h2 className="text-xl font-semibold">실제 사용 예시</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <h3 className="font-medium">AI 아트 프로필 생성</h3>
              <p className="text-sm text-muted-foreground">당신만의 예술적 정체성 발견</p>
            </div>
            <Button 
              onClick={() => handleClick('ai')}
              loading={loading === 'ai'}
              loadingText="생성 중..."
            >
              프로필 생성
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-white rounded-xl">
            <div>
              <h3 className="font-medium">큐레이션 구독</h3>
              <p className="text-sm text-muted-foreground">매주 맞춤 작품 추천</p>
            </div>
            <Button 
              variant="secondary"
              onClick={() => handleClick('subscribe')}
              loading={loading === 'subscribe'}
            >
              구독하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}