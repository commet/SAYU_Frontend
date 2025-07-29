'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EmotionDistribution, EmotionType, EMOTION_CONFIGS, EmotionBubble } from '@sayu/shared';

interface EmotionBubbleCanvasProps {
  emotions: EmotionDistribution[];
  container: HTMLElement | null;
  className?: string;
}

export function EmotionBubbleCanvas({ emotions, container, className }: EmotionBubbleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const bubblesRef = useRef<EmotionBubble[]>([]);
  const lastUpdateRef = useRef<number>(0);

  // Canvas dimensions
  const getCanvasDimensions = useCallback(() => {
    if (!container) return { width: 400, height: 250 };
    const rect = container.getBoundingClientRect();
    return {
      width: rect.width || 400,
      height: rect.height || 250
    };
  }, [container]);

  // Initialize bubbles from emotion distribution
  const createBubblesFromEmotions = useCallback(() => {
    const bubbles: EmotionBubble[] = [];
    const { width, height } = getCanvasDimensions();
    
    emotions.forEach((emotionDist) => {
      const emotionType = emotionDist.emotion;
      const config = EMOTION_CONFIGS[emotionType];
      const count = Math.min(emotionDist.count, 20); // Limit bubbles for performance
      const intensity = emotionDist.percentage / 100; // Convert percentage to 0-1 range
      
      for (let i = 0; i < count; i++) {
        const radius = 8 + (intensity * 12) + Math.random() * 8;
        const bubble: EmotionBubble = {
          id: `${emotionType}-${i}-${Date.now()}`,
          emotion: emotionType,
          intensity: intensity,
          x: Math.random() * width,
          y: Math.random() * height,
          size: radius * 2,  // Required property
          velocity: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 },  // Required property
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: radius,
          opacity: 0.6 + (intensity * 0.4),
          userId: `user-${i}`,
          timestamp: Date.now()
        };
        bubbles.push(bubble);
      }
    });
    
    return bubbles;
  }, [emotions, getCanvasDimensions]);

  // Update bubbles physics
  const updateBubbles = useCallback((deltaTime: number) => {
    const { width, height } = getCanvasDimensions();
    
    bubblesRef.current.forEach(bubble => {
      // Update position
      bubble.x += bubble.vx * deltaTime * 0.05;
      bubble.y += bubble.vy * deltaTime * 0.05;
      
      // Bounce off walls
      if (bubble.x <= bubble.radius || bubble.x >= width - bubble.radius) {
        bubble.vx *= -0.8;
        bubble.x = Math.max(bubble.radius, Math.min(width - bubble.radius, bubble.x));
      }
      
      if (bubble.y <= bubble.radius || bubble.y >= height - bubble.radius) {
        bubble.vy *= -0.8;
        bubble.y = Math.max(bubble.radius, Math.min(height - bubble.radius, bubble.y));
      }
      
      // Apply gentle drift towards center
      const centerX = width / 2;
      const centerY = height / 2;
      const driftStrength = 0.001;
      
      bubble.vx += (centerX - bubble.x) * driftStrength;
      bubble.vy += (centerY - bubble.y) * driftStrength;
      
      // Apply friction
      bubble.vx *= 0.995;
      bubble.vy *= 0.995;
      
      // Gentle floating motion
      bubble.vy += Math.sin(Date.now() * 0.001 + bubble.x * 0.01) * 0.02;
      bubble.vx += Math.cos(Date.now() * 0.001 + bubble.y * 0.01) * 0.02;
    });
    
    // Handle bubble collisions for clustering effect
    for (let i = 0; i < bubblesRef.current.length; i++) {
      for (let j = i + 1; j < bubblesRef.current.length; j++) {
        const bubbleA = bubblesRef.current[i];
        const bubbleB = bubblesRef.current[j];
        
        const dx = bubbleB.x - bubbleA.x;
        const dy = bubbleB.y - bubbleA.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bubbleA.radius + bubbleB.radius;
        
        if (distance < minDistance && distance > 0) {
          // Separate bubbles
          const overlap = minDistance - distance;
          const separateX = (dx / distance) * overlap * 0.5;
          const separateY = (dy / distance) * overlap * 0.5;
          
          bubbleA.x -= separateX;
          bubbleA.y -= separateY;
          bubbleB.x += separateX;
          bubbleB.y += separateY;
          
          // Similar emotions attract slightly
          if (bubbleA.emotion === bubbleB.emotion) {
            const attractionStrength = 0.1;
            bubbleA.vx += dx * attractionStrength * 0.01;
            bubbleA.vy += dy * attractionStrength * 0.01;
            bubbleB.vx -= dx * attractionStrength * 0.01;
            bubbleB.vy -= dy * attractionStrength * 0.01;
          }
        }
      }
    }
  }, [getCanvasDimensions]);

  // Draw bubbles on canvas
  const drawBubbles = useCallback((ctx: CanvasRenderingContext2D) => {
    const { width, height } = getCanvasDimensions();
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw connection lines between similar emotions
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    
    bubblesRef.current.forEach((bubbleA, i) => {
      bubblesRef.current.slice(i + 1).forEach(bubbleB => {
        if (bubbleA.emotion === bubbleB.emotion) {
          const dx = bubbleB.x - bubbleA.x;
          const dy = bubbleB.y - bubbleA.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = (100 - distance) / 100 * 0.2;
            ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(bubbleA.x, bubbleA.y);
            ctx.lineTo(bubbleB.x, bubbleB.y);
            ctx.stroke();
          }
        }
      });
    });
    
    // Draw bubbles
    bubblesRef.current.forEach(bubble => {
      const config = EMOTION_CONFIGS[bubble.emotion];
      
      // Outer glow
      const gradient = ctx.createRadialGradient(
        bubble.x, bubble.y, 0,
        bubble.x, bubble.y, bubble.radius * 1.5
      );
      gradient.addColorStop(0, config.color + '40');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      
      // Main bubble
      const bubbleGradient = ctx.createRadialGradient(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        0,
        bubble.x,
        bubble.y,
        bubble.radius
      );
      
      bubbleGradient.addColorStop(0, config.color + 'CC');
      bubbleGradient.addColorStop(0.7, config.color + '99');
      bubbleGradient.addColorStop(1, config.color + '66');
      
      ctx.fillStyle = bubbleGradient;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        bubble.radius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Emotion icon
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = `${bubble.radius * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.icon, bubble.x, bubble.y);
    });
  }, [getCanvasDimensions]);

  // Animation loop
  const animate = useCallback((currentTime: number) => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    const deltaTime = currentTime - lastUpdateRef.current;
    lastUpdateRef.current = currentTime;
    
    // Update physics
    updateBubbles(deltaTime);
    
    // Draw frame
    drawBubbles(ctx);
    
    // Continue animation
    animationRef.current = requestAnimationFrame(animate);
  }, [updateBubbles, drawBubbles]);

  // Start animation
  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  }, [animate]);

  // Update canvas size
  const updateCanvasSize = useCallback(() => {
    if (!canvasRef.current || !container) return;
    
    const { width, height } = getCanvasDimensions();
    canvasRef.current.width = width;
    canvasRef.current.height = height;
    
    // Update canvas style for crisp rendering
    const pixelRatio = window.devicePixelRatio || 1;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;
    canvasRef.current.width = width * pixelRatio;
    canvasRef.current.height = height * pixelRatio;
    
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.scale(pixelRatio, pixelRatio);
    }
  }, [container, getCanvasDimensions]);

  // Update bubbles when emotions change
  useEffect(() => {
    bubblesRef.current = createBubblesFromEmotions();
  }, [createBubblesFromEmotions]);

  // Setup canvas and start animation
  useEffect(() => {
    updateCanvasSize();
    startAnimation();
    
    // Handle resize
    const handleResize = () => {
      updateCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasSize, startAnimation]);

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: 'auto' }}
      />
      
      {/* Emotion legend */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="flex flex-wrap gap-1 justify-center">
          {Object.entries(emotions).map(([emotion, data]) => {
            const config = EMOTION_CONFIGS[emotion as EmotionType];
            return (
              <motion.div
                key={emotion}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs"
                style={{ borderColor: config.color, borderWidth: 1 }}
              >
                <span>{config.icon}</span>
                <span className="font-medium">{data.count}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      
      {/* Empty state */}
      {Object.keys(emotions).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-gray-500"
          >
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm">감정을 표현해 주세요</p>
          </motion.div>
        </div>
      )}
    </div>
  );
}