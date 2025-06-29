'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmotionalCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  onClick?: () => void;
  personality?: string;
}

export const EmotionalCard: React.FC<EmotionalCardProps> = ({
  children,
  className,
  delay = 0,
  hoverScale = 1.02,
  onClick,
  personality
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.390, 0.575, 0.565, 1.000]
      }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.3 }
      }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-br from-[hsl(var(--personality-primary))] to-[hsl(var(--personality-secondary))]",
        "shadow-gentle hover:shadow-embrace",
        "transition-all duration-700",
        "cursor-pointer",
        className
      )}
      data-personality={personality}
    >
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle breathing glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        animate={{
          background: [
            'radial-gradient(circle at 30% 30%, hsl(var(--personality-accent) / 0.1) 0%, transparent 70%)',
            'radial-gradient(circle at 70% 70%, hsl(var(--personality-accent) / 0.1) 0%, transparent 70%)',
            'radial-gradient(circle at 30% 30%, hsl(var(--personality-accent) / 0.1) 0%, transparent 70%)',
          ]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};

interface ArtworkCardProps {
  image: string;
  title: string;
  artist?: string;
  year?: string;
  description?: string;
  emotionalTag?: string;
  personality?: string;
  delay?: number;
}

export const ArtworkCard: React.FC<ArtworkCardProps> = ({
  image,
  title,
  artist,
  year,
  description,
  emotionalTag,
  personality,
  delay = 0
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.390, 0.575, 0.565, 1.000]
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative overflow-hidden rounded-2xl shadow-gentle hover:shadow-dream transition-all duration-700"
      data-personality={personality}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/5]">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          animate={{
            scale: isHovered ? 1.05 : 1,
            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)'
          }}
          transition={{ duration: 0.7, ease: [0.445, 0.050, 0.550, 0.950] }}
        />
        
        {/* Emotional overlay on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-sm mb-2 text-white/80"
            >
              {emotionalTag || "This speaks to your contemplative nature..."}
            </motion.p>
            {description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-xs text-white/60 line-clamp-2"
              >
                {description}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
      
      {/* Info Section */}
      <div className="p-4 bg-[hsl(var(--gallery-white))]">
        <h3 className="font-semibold text-lg mb-1 text-[hsl(var(--foreground))]">
          {title}
        </h3>
        {artist && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {artist}
            {year && <span className="text-xs"> · {year}</span>}
          </p>
        )}
      </div>
    </motion.div>
  );
};

interface EmotionalButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  personality?: string;
}

export const EmotionalButton: React.FC<EmotionalButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  personality
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variantClasses = {
    primary: 'bg-[hsl(var(--personality-accent))] text-white hover:brightness-110',
    secondary: 'bg-[hsl(var(--personality-secondary))] text-[hsl(var(--foreground))] hover:brightness-95',
    ghost: 'bg-transparent border-2 border-[hsl(var(--personality-accent))] text-[hsl(var(--personality-accent))] hover:bg-[hsl(var(--personality-accent)/0.1)]'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-full font-medium transition-all duration-300",
        "shadow-gentle hover:shadow-embrace",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      data-personality={personality}
    >
      <motion.span
        className="inline-flex items-center gap-2"
        initial={{ opacity: 0.8 }}
        whileHover={{ opacity: 1 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
};

interface GalleryTransitionProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
}

export const GalleryTransition: React.FC<GalleryTransitionProps> = ({
  children,
  isVisible,
  direction = 'up'
}) => {
  const directionVariants = {
    left: { hidden: { x: -100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 100, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    up: { hidden: { y: 50, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    down: { hidden: { y: -50, opacity: 0 }, visible: { y: 0, opacity: 1 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={directionVariants[direction]}
      transition={{
        duration: 0.8,
        ease: [0.390, 0.575, 0.565, 1.000]
      }}
    >
      {children}
    </motion.div>
  );
};

interface EmotionalToastProps {
  message: string;
  emoji?: string;
  isVisible: boolean;
  personality?: string;
}

export const EmotionalToast: React.FC<EmotionalToastProps> = ({
  message,
  emoji = "✨",
  isVisible,
  personality
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ 
        opacity: isVisible ? 1 : 0, 
        y: isVisible ? 0 : 50,
        scale: isVisible ? 1 : 0.9
      }}
      transition={{
        duration: 0.5,
        ease: [0.390, 0.575, 0.565, 1.000]
      }}
      className={cn(
        "fixed bottom-8 left-1/2 -translate-x-1/2",
        "px-6 py-3 rounded-full",
        "bg-[hsl(var(--personality-accent))] text-white",
        "shadow-embrace backdrop-blur-sm",
        "flex items-center gap-3"
      )}
      data-personality={personality}
    >
      <motion.span
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl"
      >
        {emoji}
      </motion.span>
      <span className="font-medium">{message}</span>
    </motion.div>
  );
};