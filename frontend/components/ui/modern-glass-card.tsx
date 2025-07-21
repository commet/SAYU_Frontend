'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModernGlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: 'purple' | 'blue' | 'pink' | 'green' | 'rainbow';
  intensity?: 'light' | 'medium' | 'heavy';
  interactive?: boolean;
  glow?: boolean;
}

const gradients = {
  purple: 'from-purple-500/20 to-pink-500/20',
  blue: 'from-blue-500/20 to-cyan-500/20',
  pink: 'from-pink-500/20 to-rose-500/20',
  green: 'from-green-500/20 to-emerald-500/20',
  rainbow: 'from-purple-500/20 via-pink-500/20 to-blue-500/20',
};

const intensities = {
  light: {
    bg: 'bg-white/5',
    border: 'border-white/10',
    blur: 'backdrop-blur-md',
    shadow: 'shadow-lg',
  },
  medium: {
    bg: 'bg-white/10',
    border: 'border-white/20',
    blur: 'backdrop-blur-lg',
    shadow: 'shadow-xl',
  },
  heavy: {
    bg: 'bg-white/20',
    border: 'border-white/30',
    blur: 'backdrop-blur-xl',
    shadow: 'shadow-2xl',
  },
};

export default function ModernGlassCard({
  children,
  className,
  gradient = 'purple',
  intensity = 'medium',
  interactive = true,
  glow = false,
}: ModernGlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring animation for smooth movement
  const springConfig = { damping: 20, stiffness: 300 };
  const xSpring = useSpring(mouseX, springConfig);
  const ySpring = useSpring(mouseY, springConfig);
  
  // 3D rotation based on mouse position
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-10, 10]);
  
  // Glow effect position
  const glowX = useTransform(xSpring, [-0.5, 0.5], [0, 100]);
  const glowY = useTransform(ySpring, [-0.5, 0.5], [0, 100]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current || !interactive) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = (e.clientX - centerX) / rect.width;
      const y = (e.clientY - centerY) / rect.height;
      
      mouseX.set(x);
      mouseY.set(y);
    };
    
    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };
    
    if (interactive && cardRef.current) {
      cardRef.current.addEventListener('mousemove', handleMouseMove);
      cardRef.current.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        if (cardRef.current) {
          cardRef.current.removeEventListener('mousemove', handleMouseMove);
          cardRef.current.removeEventListener('mouseleave', handleMouseLeave);
        }
      };
    }
  }, [interactive, mouseX, mouseY]);
  
  const { bg, border, blur, shadow } = intensities[intensity];
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-2xl transition-all duration-500',
        interactive && 'cursor-pointer',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        rotateX: interactive ? rotateX : 0,
        rotateY: interactive ? rotateY : 0,
      }}
      whileHover={interactive ? { scale: 1.02 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Background gradient */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50',
          gradients[gradient],
          isHovered && 'opacity-70'
        )}
      />
      
      {/* Glass effect */}
      <div
        className={cn(
          'relative rounded-2xl border',
          bg,
          border,
          blur,
          shadow,
          'transition-all duration-500'
        )}
      >
        {/* Animated border gradient */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-[-2px] rounded-2xl opacity-0"
            animate={{
              opacity: isHovered ? 1 : 0,
              rotate: isHovered ? 360 : 0,
            }}
            transition={{ duration: 2, ease: 'linear' }}
            style={{
              background: 'conic-gradient(from 0deg, transparent, #8b5cf6, #ec4899, transparent)',
            }}
          />
        </div>
        
        {/* Glow effect */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
            style={{
              opacity: isHovered ? 1 : 0,
            }}
          >
            <motion.div
              className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2"
              style={{
                left: glowX,
                top: glowY,
                x: '-50%',
                y: '-50%',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4), transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
          </motion.div>
        )}
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <motion.div
            className="absolute inset-0 -translate-x-full"
            animate={{
              x: isHovered ? '100%' : '-100%',
            }}
            transition={{
              duration: 0.7,
              ease: 'easeInOut',
            }}
          >
            <div
              className="h-full w-1/2 skew-x-12"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
              }}
            />
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 p-6">
          {children}
        </div>
        
        {/* Reflection (for heavy intensity) */}
        {intensity === 'heavy' && (
          <div
            className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </div>
      
      {/* 3D shadow */}
      <motion.div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          background: 'black',
          opacity: 0.2,
          filter: 'blur(20px)',
          transform: 'translateZ(-20px) translateY(10px)',
          scale: isHovered ? 0.95 : 0.9,
        }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}