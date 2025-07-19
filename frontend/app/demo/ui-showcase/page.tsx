"use client"

import { ButtonDemo } from '@/components/ui/button-demo'
import { CardDemo } from '@/components/ui/card-demo'
import { TextAnimationDemo } from '@/components/ui/text-animation-demo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaggerText, FadeInText } from '@/components/ui/text-animation'

export default function UIShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-off-white">
      {/* Hero Section */}
      <div className="text-center py-16 px-8">
        <h1 className="text-5xl font-display mb-4">
          <StaggerText stagger={50}>SAYU UI Components</StaggerText>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          <FadeInText delay={800}>
            예술과 기술이 만나 탄생한 우아하고 몰입감 있는 UI/UX 시스템
          </FadeInText>
        </p>
      </div>

      {/* Component Demos */}
      <div className="pb-16">
        <Tabs defaultValue="buttons" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buttons">
            <ButtonDemo />
          </TabsContent>
          
          <TabsContent value="cards">
            <CardDemo />
          </TabsContent>
          
          <TabsContent value="text">
            <TextAnimationDemo />
          </TabsContent>
        </Tabs>
      </div>

      {/* Implementation Guide */}
      <div className="bg-black text-white py-16 px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl font-display text-center mb-8">
            <FadeInText>구현 가이드</FadeInText>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Button 사용법</h3>
              <pre className="bg-white/10 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Button } from '@/components/ui/button-enhanced'

<Button 
  variant="primary"
  loading={isLoading}
  onClick={handleClick}
>
  시작하기
</Button>`}</code>
              </pre>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Card 사용법</h3>
              <pre className="bg-white/10 p-4 rounded-lg overflow-x-auto">
                <code>{`import { Card } from '@/components/ui/card-enhanced'

<Card 
  variant="gallery"
  enable3D
  shimmer
>
  <CardHeader>
    <CardTitle>제목</CardTitle>
  </CardHeader>
</Card>`}</code>
              </pre>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Text Animation 사용법</h3>
              <pre className="bg-white/10 p-4 rounded-lg overflow-x-auto">
                <code>{`import { StaggerText } from '@/components/ui/text-animation'

<h1>
  <StaggerText stagger={50}>
    애니메이션 텍스트
  </StaggerText>
</h1>`}</code>
              </pre>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">디자인 원칙</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• 95% 그레이스케일 + 5% 액센트 컬러</li>
                <li>• 미술관의 고요함을 담은 여백</li>
                <li>• 서브틀하지만 의미있는 마이크로 인터랙션</li>
                <li>• 성능을 고려한 가벼운 애니메이션</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}