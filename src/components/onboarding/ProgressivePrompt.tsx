'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Heart, Palette, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GuestStorage } from '@/lib/guest-storage'

interface PromptConfig {
  milestone: string
  title: string
  description: string
  icon: React.ReactNode
  actionText: string
  dismissText: string
  delay: number
}

const prompts: Record<string, PromptConfig> = {
  first_save: {
    milestone: 'first_save',
    title: '첫 작품을 저장하셨네요!',
    description: '나만의 갤러리를 만들어 더 많은 작품을 모아보세요',
    icon: <Heart className="w-5 h-5" />,
    actionText: '내 갤러리 만들기',
    dismissText: '나중에',
    delay: 2000
  },
  collection_started: {
    milestone: 'collection_started',
    title: '멋진 컬렉션이 시작되었어요',
    description: '계정을 만들면 언제 어디서나 컬렉션을 확인할 수 있어요',
    icon: <Palette className="w-5 h-5" />,
    actionText: '계정 만들기',
    dismissText: '계속 둘러보기',
    delay: 1500
  },
  quiz_completed: {
    milestone: 'quiz_completed',
    title: '당신만의 예술 성향을 발견했어요',
    description: '결과를 저장하고 맞춤 추천을 받아보세요',
    icon: <Sparkles className="w-5 h-5" />,
    actionText: '결과 저장하기',
    dismissText: '그냥 둘러보기',
    delay: 0
  }
}

export const ProgressivePrompt: React.FC = () => {
  const [currentPrompt, setCurrentPrompt] = useState<PromptConfig | null>(null)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleMilestone = (event: CustomEvent) => {
      const { milestone } = event.detail
      
      // Check if already dismissed this session
      if (dismissed.has(milestone)) return
      
      const prompt = prompts[milestone]
      if (prompt) {
        setTimeout(() => {
          setCurrentPrompt(prompt)
        }, prompt.delay)
      }
    }

    window.addEventListener('guest-milestone' as any, handleMilestone)
    return () => window.removeEventListener('guest-milestone' as any, handleMilestone)
  }, [dismissed])

  const handleAction = () => {
    // Navigate to sign up with context
    const data = GuestStorage.getData()
    const params = new URLSearchParams({
      from: currentPrompt?.milestone || '',
      apt: data.quizResults?.personalityType || ''
    })
    
    window.location.href = `/signup?${params.toString()}`
  }

  const handleDismiss = () => {
    if (currentPrompt) {
      setDismissed(prev => new Set([...prev, currentPrompt.milestone]))
      setCurrentPrompt(null)
    }
  }

  return (
    <AnimatePresence>
      {currentPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="bg-white rounded-lg shadow-emphasis p-6 max-w-sm">
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {currentPrompt.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-black mb-1">
                  {currentPrompt.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {currentPrompt.description}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleAction}
                    className={cn(
                      "px-4 py-2 bg-primary text-white rounded-md text-sm font-medium",
                      "hover:bg-primary-dark transition-colors"
                    )}
                  >
                    {currentPrompt.actionText}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
                  >
                    {currentPrompt.dismissText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}