// Animal Evolution Demo - 실제 작동 원리 시연
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export function AnimalEvolutionDemo() {
  const [stage, setStage] = useState(1);
  const [showLayers, setShowLayers] = useState(false);

  return (
    <div className="p-8 bg-gray-100 rounded-lg">
      <h2 className="text-2xl font-bold mb-6">동물 진화 시스템 작동 원리</h2>
      
      {/* 컨트롤 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setStage(Math.max(1, stage - 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          이전 단계
        </button>
        <span className="px-4 py-2 bg-gray-200 rounded">
          현재: {stage}단계
        </span>
        <button
          onClick={() => setStage(Math.min(5, stage + 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          다음 단계
        </button>
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="px-4 py-2 bg-purple-500 text-white rounded ml-auto"
        >
          {showLayers ? '레이어 숨기기' : '레이어 보기'}
        </button>
      </div>

      {/* 비교 뷰 */}
      <div className="grid grid-cols-2 gap-8">
        {/* 원본 이미지 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">원본 이미지 (1개)</h3>
          <div className="relative w-48 h-48 mx-auto">
            <Image
              src="/images/personality-animals/main/1. LAEF (Fox).png"
              alt="Original Fox"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-sm text-gray-600 mt-4">
            단 하나의 정적 이미지 파일
          </p>
        </div>

        {/* 진화된 모습 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            진화된 모습 ({stage}단계)
          </h3>
          <div className="relative w-48 h-48 mx-auto">
            {/* Layer 1: 기본 이미지 + CSS 필터 */}
            <div
              className="relative w-full h-full"
              style={{
                filter: getStageFilter(stage),
                transform: `scale(${0.7 + stage * 0.075})`
              }}
            >
              <Image
                src="/images/personality-animals/main/1. LAEF (Fox).png"
                alt="Evolved Fox"
                fill
                className="object-contain"
              />
            </div>

            {/* Layer 2: 그라데이션 오버레이 */}
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ background: getStageGradient(stage) }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Layer 3: SVG 액세서리 */}
            <svg className="absolute inset-0 w-full h-full">
              {stage >= 2 && (
                <path
                  d="M30,70 Q50,75 70,70"
                  stroke="#E74C3C"
                  strokeWidth="3"
                  fill="none"
                />
              )}
              {stage >= 4 && (
                <path
                  d="M35,15 L40,10 L45,15 L50,10 L55,15 L60,10 L65,15 L65,20 L35,20 Z"
                  fill="#F1C40F"
                />
              )}
            </svg>

            {/* Layer 4: 오라 효과 */}
            {stage >= 3 && (
              <motion.div
                className="absolute inset-[-20%] rounded-full bg-purple-400/20 blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            )}

            {/* Layer 5: 뱃지 */}
            {stage >= 2 && (
              <motion.span
                className="absolute bottom-2 right-2 text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                🌟
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {/* 레이어 분해도 */}
      {showLayers && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">레이어 분해도</h3>
          <div className="space-y-4">
            <LayerExplanation
              layer={1}
              title="CSS 필터"
              code={`filter: ${getStageFilter(stage)}`}
              description="밝기, 대비, 채도, 색조를 조정하여 진화 표현"
            />
            <LayerExplanation
              layer={2}
              title="그라데이션 오버레이"
              code={`background: ${getStageGradient(stage).split(' ').slice(0, 3).join(' ')}...`}
              description="단계별 특별한 분위기 연출"
            />
            <LayerExplanation
              layer={3}
              title="SVG 액세서리"
              code={`<path d="..." /> // 동적으로 생성된 장식`}
              description="코드로 그려진 왕관, 스카프 등"
            />
            <LayerExplanation
              layer={4}
              title="애니메이션"
              code={`animate={{ scale: [1, 1.2, 1] }}`}
              description="살아있는 느낌을 주는 모션"
            />
          </div>
        </div>
      )}

      {/* 실제 효과 설명 */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">🎨 이렇게 구현했어요!</h3>
        <ul className="space-y-2 text-sm">
          <li>• <strong>1개 이미지</strong> + <strong>CSS 필터</strong> = 5가지 다른 느낌</li>
          <li>• <strong>SVG 오버레이</strong>로 액세서리 추가 (이미지 파일 불필요)</li>
          <li>• <strong>CSS 애니메이션</strong>으로 생동감 부여</li>
          <li>• <strong>그라데이션</strong>으로 단계별 특별함 표현</li>
          <li>• 총 필요한 이미지: 16개 (APT 타입별 1개씩)</li>
          <li>• 표현 가능한 상태: 16 × 5 × ∞ (애니메이션) = 무한대!</li>
        </ul>
      </div>
    </div>
  );
}

function LayerExplanation({ 
  layer, 
  title, 
  code, 
  description 
}: { 
  layer: number; 
  title: string; 
  code: string; 
  description: string; 
}) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded">
      <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
        {layer}
      </div>
      <div className="flex-grow">
        <h4 className="font-semibold">{title}</h4>
        <code className="text-xs bg-gray-200 px-2 py-1 rounded inline-block my-1">
          {code}
        </code>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function getStageFilter(stage: number): string {
  const filters = {
    1: 'brightness(1.2) contrast(0.8) saturate(0.7) blur(0.5px)',
    2: 'brightness(1.1) contrast(0.9) saturate(0.9)',
    3: 'none',
    4: 'contrast(1.1) saturate(1.1)',
    5: 'contrast(1.2) saturate(1.2) hue-rotate(10deg)'
  };
  return filters[stage as keyof typeof filters] || 'none';
}

function getStageGradient(stage: number): string {
  const gradients = {
    1: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
    2: 'radial-gradient(circle, rgba(255,220,100,0.2) 0%, transparent 70%)',
    3: 'radial-gradient(circle, rgba(100,200,255,0.15) 0%, transparent 70%)',
    4: 'radial-gradient(circle, rgba(200,100,255,0.2) 0%, transparent 60%)',
    5: 'conic-gradient(from 0deg, rgba(255,100,200,0.3), rgba(100,200,255,0.3), rgba(255,200,100,0.3))'
  };
  return gradients[stage as keyof typeof gradients] || '';
}