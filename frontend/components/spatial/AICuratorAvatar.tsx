'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { 
  Sphere, 
  Box, 
  Float, 
  Html, 
  Text3D, 
  Center,
  Billboard,
  MeshDistortMaterial,
  Sparkles
} from '@react-three/drei';
import * as THREE from 'three';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getAnimalByType } from '@/data/personality-animals';
import { chatbotAPI, ChatMessage } from '@/lib/chatbot-api';

interface AICuratorAvatarProps {
  position?: [number, number, number];
  onInteraction?: () => void;
}

export function AICuratorAvatar({ 
  position = [0, 2, 0], 
  onInteraction 
}: AICuratorAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);
  const { personalityType } = useUserProfile();
  
  // Get animal data based on personality
  const animalData = getAnimalByType(personalityType);
  const animalColor = animalData?.color || '#7209b7';
  
  // Breathing animation
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Breathing effect
      const breathingScale = 1 + Math.sin(time * 2) * 0.05;
      meshRef.current.scale.setScalar(breathingScale);
      
      // Gentle rotation
      meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  });
  
  // Welcome message on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentMessage(getWelcomeMessage());
      setShowMessage(true);
      
      // Hide message after 5 seconds
      setTimeout(() => setShowMessage(false), 5000);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [personalityType]);
  
  const getWelcomeMessage = () => {
    if (!personalityType) {
      return "안녕하세요! 저는 SAYU AI 큐레이터입니다. 퀴즈를 통해 당신의 예술 성향을 알아보세요!";
    }
    
    const messages: Record<string, string> = {
      'LAEF': "신비로운 여우님, 오늘은 어떤 예술적 영감을 찾고 계신가요?",
      'LAEC': "우아한 고양이님, 당신만의 특별한 작품을 추천해드릴게요.",
      'LAMF': "지혜로운 부엉이님, 깊이 있는 작품들을 준비했어요.",
      'LAMC': "차분한 거북이님, 시간을 들여 감상할 만한 작품들이 있어요.",
      'LREF': "다재다능한 카멜레온님, 다양한 스타일의 작품을 보여드릴게요.",
      'LREC': "조심스러운 고슴도치님, 편안하게 즐길 수 있는 작품들이에요.",
      'LRMF': "창의적인 문어님, 독특한 관점의 작품들을 발견해보세요.",
      'LRMC': "성실한 비버님, 정성스럽게 만들어진 작품들을 감상해보세요.",
      'SAEF': "자유로운 나비님, 화려하고 아름다운 작품들이 기다려요.",
      'SAEC': "사교적인 펭귄님, 함께 즐길 수 있는 작품들을 준비했어요.",
      'SAMF': "활발한 앵무새님, 생동감 넘치는 작품들을 만나보세요.",
      'SAMC': "온화한 사슴님, 평화로운 감상 시간을 가져보세요.",
      'SREF': "충실한 강아지님, 마음을 따뜻하게 해줄 작품들이에요.",
      'SREC': "명랑한 오리님, 즐겁고 유쾌한 작품들을 보여드릴게요.",
      'SRMF': "든든한 코끼리님, 웅장하고 감동적인 작품들이 있어요.",
      'SRMC': "용감한 독수리님, 시야를 넓혀줄 작품들을 추천해드려요."
    };
    
    return messages[personalityType] || "반갑습니다! 당신만의 예술 여정을 함께해요.";
  };
  
  const handleClick = async () => {
    setIsThinking(true);
    
    // Simulate thinking
    setTimeout(() => {
      setCurrentMessage("어떤 예술 작품을 찾고 계신가요? 취향에 맞는 작품을 추천해드릴게요!");
      setShowMessage(true);
      setIsThinking(false);
      
      if (onInteraction) {
        onInteraction();
      }
    }, 1000);
  };
  
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        {/* AI Core - Morphing sphere */}
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          scale={isHovered ? 1.2 : 1}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color={animalColor}
            emissive={animalColor}
            emissiveIntensity={isHovered ? 0.5 : 0.3}
            distort={0.3}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
        
        {/* Particle aura */}
        <Sparkles
          count={50}
          scale={3}
          size={2}
          speed={0.5}
          color={animalColor}
          opacity={0.5}
        />
        
        {/* Thinking indicator */}
        {isThinking && (
          <group>
            {[0, 1, 2].map((i) => (
              <mesh
                key={i}
                position={[0, 2 + i * 0.5, 0]}
              >
                <sphereGeometry args={[0.1, 16, 16]} />
                <meshBasicMaterial color={animalColor} transparent />
              </mesh>
            ))}
          </group>
        )}
        
        {/* Animal indicator */}
        {animalData && (
          <Billboard position={[0, -1.5, 0]}>
            <Text3D
              font="/fonts/Playfair_Display_Bold.json"
              size={0.2}
              height={0.05}
              curveSegments={12}
            >
              {animalData.emoji} {animalData.nameKo}
              <meshStandardMaterial color={animalColor} />
            </Text3D>
          </Billboard>
        )}
        
        {/* Message bubble */}
        {showMessage && (
          <Html position={[0, 2, 0]} center>
            <div
              className="bg-white/90 backdrop-blur-xl text-gray-800 p-4 rounded-2xl shadow-2xl max-w-xs"
              style={{
                borderLeft: `4px solid ${animalColor}`,
              }}
            >
              <p className="text-sm font-medium">{currentMessage}</p>
              {isHovered && (
                <p className="text-xs text-gray-500 mt-2">클릭하여 대화하기</p>
              )}
            </div>
          </Html>
        )}
        
        {/* Interactive glow on hover */}
        {isHovered && (
          <mesh scale={1.5}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial
              color={animalColor}
              transparent
              opacity={0.2}
              side={THREE.BackSide}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
}

// AI Curator in full 3D chat mode
export function AICurator3DChat({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { personalityType } = useUserProfile();
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const response = await chatbotAPI.sendMessage(
        inputValue,
        messages,
        {
          personalityType,
          pageContext: { type: '3d-gallery', path: '/gallery-3d' }
        }
      );
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.content
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  return (
    <group position={[0, 0, -5]}>
      {/* 3D Chat Interface */}
      <Box args={[8, 10, 0.5]} position={[0, 5, 0]}>
        <meshPhysicalMaterial
          color="#1a1a1a"
          metalness={0.9}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </Box>
      
      {/* Messages display */}
      <Html position={[0, 5, 0.3]} transform>
        <div className="w-[400px] h-[500px] bg-black/80 backdrop-blur-xl rounded-xl p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-700 text-white p-3 rounded-lg">
                  <span className="typing-indicator">...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="메시지를 입력하세요..."
              className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2 transition-colors"
            >
              전송
            </button>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </Html>
      
      {/* AI Avatar */}
      <AICuratorAvatar position={[0, 0, 2]} />
    </group>
  );
}