'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useArtworkViewing } from '@/contexts/ArtworkViewingContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { chatbotAPI, ChatMessage } from '@/lib/chatbot-api';
import { getAnimalByType } from '@/data/personality-animals';
import { AnimalCompanion, getCompanionMessage } from '@/components/animations/AnimalCompanion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Send, X, ThumbsUp, ThumbsDown, RefreshCw, MessageSquare, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { detectPageType, getContextualMessage, UNIDENTIFIED_USER_MESSAGES } from '@/lib/chatbot-context';
import { useEasterEgg } from '@/contexts/EasterEggContext';
// Toast functionality removed for demo

interface ArtCuratorChatbotProps {
  position?: 'bottom-left' | 'bottom-right';
  defaultOpen?: boolean;
  onClose?: () => void;
}

export const ArtCuratorChatbot = ({ 
  position = 'bottom-right',
  defaultOpen = false,
  onClose 
}: ArtCuratorChatbotProps) => {
  const { currentArtwork } = useArtworkViewing();
  const { personalityType } = useUserProfile();
  const { language } = useLanguage();
  const { checkCommand } = useEasterEgg();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [companionMood, setCompanionMood] = useState<'idle' | 'happy' | 'thinking' | 'excited'>('idle');
  const [showFeedback, setShowFeedback] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // personalityType is already available from useUserProfile
  const animalData = getAnimalByType(personalityType);
  
  // 페이지 컨텍스트 감지
  const pageContext = detectPageType(pathname);
  
  // Initialize with greeting based on page context
  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting }]);
      loadSuggestions();
    }
  }, [isOpen, pathname, currentArtwork, personalityType]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get greeting message based on page context
  const getGreeting = () => {
    // 페이지 메타데이터 추가
    const context = { ...pageContext };
    if (currentArtwork) {
      context.metadata = {
        artworkTitle: currentArtwork.title,
        artistName: currentArtwork.artist,
      };
    }
    if (personalityType) {
      context.metadata = { ...context.metadata, personalityType };
    }
    
    // 미판정 유저인 경우
    if (!personalityType) {
      return UNIDENTIFIED_USER_MESSAGES.initial[0];
    }
    
    // 페이지별 컨텍스촄 메시지
    const contextualGreeting = getContextualMessage(context, 'initial', 0);
    if (context.type !== 'artwork' || !currentArtwork) {
      return contextualGreeting;
    }
    
    // 작품 페이지에서는 성격별 메시지
    const greetings = {
      'LAEF': `안녕하세요, ${currentArtwork.title}의 신비로운 분위기가 느껴지시나요?`,
      'LAEC': `${currentArtwork.title}... 당신의 취향에 맞을 것 같네요.`,
      'LAMF': `${currentArtwork.title}에 숨겨진 의미가 궁금하시죠?`,
      'LAMC': `안녕하세요. ${currentArtwork.artist}의 ${currentArtwork.title}, ${currentArtwork.year}년 작품입니다.`,
      'LREF': `${currentArtwork.title}의 세밀한 부분들을 함께 관찰해볼까요?`,
      'LREC': `${currentArtwork.title}의 기법과 감정, 모두 살펴보시죠.`,
      'LRMF': `${currentArtwork.title}을 다양한 관점에서 탐구해봐요!`,
      'LRMC': `${currentArtwork.title}에 대한 깊이 있는 연구를 시작해볼까요?`,
      'SAEF': `반가워요! ${currentArtwork.title} 정말 아름답죠? 어떤 부분이 가장 마음에 드세요?`,
      'SAEC': `안녕하세요! ${currentArtwork.title}을 함께 감상하게 되어 기뻐요.`,
      'SAMF': `${currentArtwork.title}이 전하는 메시지를 함께 나눠봐요!`,
      'SAMC': `${currentArtwork.title}으로 시작하는 우아한 예술 여행, 함께해요.`,
      'SREF': `와! ${currentArtwork.title} 정말 멋지지 않아요? 같이 봐요!`,
      'SREC': `${currentArtwork.title}을 편안하게 감상하실 수 있도록 도와드릴게요.`,
      'SRMF': `${currentArtwork.title}에 대한 흥미로운 이야기가 많아요. 들어보실래요?`,
      'SRMC': `${currentArtwork.title}을 체계적으로 분석해드리겠습니다.`
    };
    
    return greetings[personalityType] || greetings['LAEF'];
  };
  
  // Load suggestions for current artwork
  const loadSuggestions = async () => {
    if (!currentArtwork) return;
    
    try {
      const result = await chatbotAPI.getSuggestions(currentArtwork.id, {
        title: currentArtwork.title,
        artist: currentArtwork.artist,
        year: currentArtwork.year
      });
      
      if (result.success) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };
  
  // Send message
  const sendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim();
    if (!message || !currentArtwork) return;
    
    // Check for easter egg commands
    if (message.startsWith('/')) {
      checkCommand(message);
    }
    
    // Clear input
    setInputValue('');
    
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    
    // Set companion mood
    setCompanionMood('thinking');
    setIsTyping(true);
    
    try {
      const response = await chatbotAPI.sendMessage(message, currentArtwork.id, {
        id: currentArtwork.id,
        title: currentArtwork.title,
        artist: currentArtwork.artist,
        year: currentArtwork.year,
        imageUrl: currentArtwork.imageUrl,
        medium: currentArtwork.medium,
        description: currentArtwork.description
      });
      
      if (response.success) {
        const assistantMessage: ChatMessage = { 
          role: 'assistant', 
          content: response.message 
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        if (response.suggestions) {
          setSuggestions(response.suggestions);
        }
        
        if (response.sessionId) {
          setSessionId(response.sessionId);
        }
        
        setCompanionMood('happy');
        
        // Show feedback option for the latest message
        setShowFeedback(messages.length + 1);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '앗, 잠시 연결이 끊겼어요. 다시 시도해주세요!'
      };
      setMessages(prev => [...prev, errorMessage]);
      setCompanionMood('idle');
    } finally {
      setIsTyping(false);
    }
  };
  
  // Handle feedback
  const handleFeedback = async (messageIndex: number, rating: number) => {
    if (!sessionId) return;
    
    try {
      await chatbotAPI.submitFeedback(sessionId, rating);
      // Simple alert instead of toast for demo
      alert(rating > 3 ? "감사합니다!" : "피드백 감사합니다");
      setShowFeedback(null);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };
  
  // Clear chat
  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setSessionId(null);
    setShowFeedback(null);
    
    if (currentArtwork) {
      const greeting = getGreeting();
      setMessages([{ role: 'assistant', content: greeting }]);
      loadSuggestions();
    }
  }, [currentArtwork, personalityType]);
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  // Toggle chat
  const toggleChat = () => {
    console.log('toggleChat called, current isOpen:', isOpen);
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };
  
  console.log('ArtCuratorChatbot render - isOpen:', isOpen);
  
  return (
    <>
      {/* Animal Companion that opens chat when clicked */}
      <AnimalCompanion
        mood={companionMood}
        onMoodChange={setCompanionMood}
        message={isOpen ? undefined : getCompanionMessage(personalityType, 'idle')}
        position={position}
        onClick={toggleChat}
      />
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatContainerRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed ${
              position === 'bottom-left' ? 'left-4' : 'right-4'
            } bottom-24 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {personalityType ? (
                  <img 
                    src={animalData?.avatar || animalData?.image}
                    alt={animalData?.animal || 'Curator'}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-700 dark:to-blue-700 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {personalityType ? `${animalData?.animal || '여우'} 큐레이터` : 'AI 큐레이터'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {currentArtwork?.title || '작품을 선택해주세요'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearChat}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="대화 초기화"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    toggleChat();
                    onClose?.();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentArtwork ? (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`group relative max-w-[85%]`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                        </div>
                        
                        {/* Feedback buttons */}
                        {message.role === 'assistant' && showFeedback === index && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -bottom-8 left-0 flex gap-2 bg-white rounded-lg shadow-md p-1"
                          >
                            <button
                              onClick={() => handleFeedback(index, 5)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="도움이 되었어요"
                            >
                              <ThumbsUp className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleFeedback(index, 1)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="아쉬워요"
                            >
                              <ThumbsDown className="w-4 h-4 text-gray-600" />
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                        <div className="flex space-x-1">
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.4, repeat: Infinity }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-gray-400 rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <img 
                      src={animalData?.image}
                      alt={animalData?.animal || 'Curator'}
                      className="w-32 h-32 mx-auto mb-4 opacity-50"
                    />
                    <p className="text-gray-500">
                      먼저 감상할 작품을 선택해주세요
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggestions */}
            {currentArtwork && suggestions.length > 0 && !isTyping && (
              <div className="px-4 py-2 border-t bg-gray-50">
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(suggestion)}
                      className="flex-shrink-0 px-3 py-1.5 text-xs bg-white hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input */}
            <div className="p-4 border-t bg-white">
              {currentArtwork ? (
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={personalityType ? `${animalData?.animal || '큐레이터'}에게 물어보세요...` : '궁금한 점을 물어보세요...'}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    maxLength={500}
                    disabled={isTyping}
                  />
                  <motion.button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              ) : (
                <p className="text-center text-gray-500 text-sm py-2">
                  작품을 선택하면 대화를 시작할 수 있어요
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};