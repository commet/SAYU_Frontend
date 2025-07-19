"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardImage } from './card-enhanced'
import { Button } from './button-enhanced'
import { Heart, Share2, Eye, Clock } from 'lucide-react'

export function CardDemo() {
  return (
    <div className="space-y-12 p-8 max-w-6xl mx-auto">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-display">SAYU Card Components</h1>
        <p className="text-muted-foreground">미술관의 작품처럼 우아한 카드 디자인</p>
      </div>

      {/* Default Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Default Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>성격 유형 분석</CardTitle>
              <CardDescription>16가지 동물로 표현되는 당신의 예술적 정체성</CardDescription>
            </CardHeader>
            <CardContent>
              <p>APT 기반의 독특한 성격 분석으로 당신만의 예술 취향을 발견하세요.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="ghost">자세히 보기</Button>
            </CardFooter>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>AI 큐레이션</CardTitle>
              <CardDescription>맞춤형 작품 추천 서비스</CardDescription>
            </CardHeader>
            <CardContent>
              <p>당신의 성격과 취향을 분석하여 완벽한 예술 작품을 추천합니다.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="secondary">시작하기</Button>
            </CardFooter>
          </Card>

          <Card variant="artistic">
            <CardHeader>
              <CardTitle>아트 프로필</CardTitle>
              <CardDescription>AI가 생성한 나만의 예술 정체성</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Stable Diffusion으로 만들어지는 독특한 아트 프로필을 경험하세요.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">생성하기</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Gallery Cards with Images */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Gallery Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="gallery" className="cursor-pointer">
            <CardImage 
              src="https://images.unsplash.com/photo-1549887534-1541e9326642?w=400&h=300&fit=crop" 
              alt="Abstract Art"
              className="h-48"
            />
            <CardHeader>
              <CardTitle>추상의 미학</CardTitle>
              <CardDescription>현대 추상화의 세계</CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  1.2k
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  342
                </span>
              </div>
              <Button size="sm" variant="ghost">
                <Share2 className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          <Card variant="gallery" enable3D className="cursor-pointer">
            <CardImage 
              src="https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=300&fit=crop" 
              alt="Classical Art"
              className="h-48"
            />
            <CardHeader>
              <CardTitle>고전의 향수</CardTitle>
              <CardDescription>시간을 초월한 명작</CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  892
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  256
                </span>
              </div>
              <Button size="sm" variant="ghost">
                <Share2 className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>

          <Card variant="gallery" shimmer className="cursor-pointer">
            <CardImage 
              src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop" 
              alt="Modern Installation"
              className="h-48"
            />
            <CardHeader>
              <CardTitle>설치 미술</CardTitle>
              <CardDescription>공간과 예술의 만남</CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  2.1k
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  567
                </span>
              </div>
              <Button size="sm" variant="ghost">
                <Share2 className="h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Minimal Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Minimal Cards</h2>
        <div className="space-y-4">
          <Card variant="minimal" className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">다음 전시 일정</h3>
                <p className="text-sm text-muted-foreground">12월 15일 - 모네의 정원</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">예약하기</Button>
          </Card>

          <Card variant="minimal" className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <Heart className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-medium">추천 큐레이션</h3>
                <p className="text-sm text-muted-foreground">당신을 위한 5개의 작품</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">보러가기</Button>
          </Card>
        </div>
      </section>

      {/* Interactive Examples */}
      <section className="space-y-4 p-6 bg-off-white rounded-2xl">
        <h2 className="text-xl font-semibold">인터랙티브 예시</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="artistic" enable3D className="h-full">
            <CardHeader>
              <CardTitle>3D 인터랙션</CardTitle>
              <CardDescription>마우스를 올려 3D 효과를 경험하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <p>카드가 마우스 움직임을 따라 자연스럽게 기울어집니다. 실제 작품을 감상하는 듯한 깊이감을 느껴보세요.</p>
            </CardContent>
          </Card>

          <Card variant="glass" shimmer className="h-full">
            <CardHeader>
              <CardTitle>프리미엄 효과</CardTitle>
              <CardDescription>은은한 빛의 흐름을 감상하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <p>고급스러운 shimmer 효과가 카드에 생동감을 더합니다. SAYU의 프리미엄 경험을 상징합니다.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}