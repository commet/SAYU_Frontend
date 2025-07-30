'use client';

import { useEffect, useRef, useState } from 'react';
// Dynamically import anime.js to avoid SSR issues
let anime: any = null;

// Dynamically load anime.js on client side
if (typeof window !== 'undefined') {
  import('animejs/lib/anime.es.js').then(module => {
    anime = module.default;
  });
}

interface AnimeJSTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

export function AnimeJSTextReveal({ text, className = '', delay = 0, duration = 2000 }: AnimeJSTextRevealProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const [animeLoaded, setAnimeLoaded] = useState(false);

  useEffect(() => {
    // Check if anime is loaded
    if (anime) {
      setAnimeLoaded(true);
    } else {
      // Wait for anime to load
      const checkInterval = setInterval(() => {
        if (anime) {
          setAnimeLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  useEffect(() => {
    if (!textRef.current || !animeLoaded || !anime) return;

    // Split text into individual characters
    const chars = text.split('').map((char, i) => 
      `<span key="${i}" class="char" style="opacity: 0; transform: translateY(30px);">${char === ' ' ? '&nbsp;' : char}</span>`
    ).join('');
    
    textRef.current.innerHTML = chars;

    // Animate characters with stagger
    anime({
      targets: textRef.current.querySelectorAll('.char'),
      opacity: [0, 1],
      translateY: [30, 0],
      duration: duration / text.length,
      delay: anime.stagger(80, { start: delay }),
      easing: 'easeOutCubic'
    });
  }, [text, delay, duration, animeLoaded]);

  return <div ref={textRef} className={className}>{!animeLoaded ? text : ''}</div>;
}

interface AnimeJSGalleryProps {
  items: any[];
  className?: string;
}

export function AnimeJSGalleryReveal({ items, className = '' }: AnimeJSGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!galleryRef.current || !items.length || !anime) return;

    const galleryItems = galleryRef.current.querySelectorAll('.gallery-item');
    
    // Set initial state
    anime.set(galleryItems, {
      opacity: 0,
      scale: 0.8,
      rotateZ: -5
    });

    // Animate with stagger
    anime({
      targets: galleryItems,
      opacity: [0, 1],
      scale: [0.8, 1],
      rotateZ: [-5, 0],
      duration: 800,
      delay: anime.stagger(150, { grid: [3, 3], from: 'center' }),
      easing: 'easeOutElastic(1, .5)'
    });
  }, [items]);

  return (
    <div ref={galleryRef} className={className}>
      {items.map((item, index) => (
        <div key={index} className="gallery-item">
          {item}
        </div>
      ))}
    </div>
  );
}

interface AnimeJSFloatingElementsProps {
  count?: number;
  colors: string[];
  className?: string;
}

export function AnimeJSFloatingElements({ count = 20, colors, className = '' }: AnimeJSFloatingElementsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !anime) return;

    // Create floating elements
    const elements = Array.from({ length: count }, (_, i) => {
      const element = document.createElement('div');
      element.className = 'floating-element';
      element.style.cssText = `
        position: absolute;
        width: ${Math.random() * 20 + 10}px;
        height: ${Math.random() * 20 + 10}px;
        background: ${colors[i % colors.length]};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.7 + 0.3};
      `;
      containerRef.current?.appendChild(element);
      return element;
    });

    // Animate floating elements
    elements.forEach((element, i) => {
      anime({
        targets: element,
        translateX: () => anime.random(-200, 200),
        translateY: () => anime.random(-200, 200),
        scale: [0.5, 1.5],
        rotate: () => anime.random(-180, 180),
        duration: () => anime.random(4000, 8000),
        delay: i * 100,
        direction: 'alternate',
        loop: true,
        easing: 'easeInOutSine'
      });
    });

    return () => {
      elements.forEach(el => el.remove());
    };
  }, [count, colors]);

  return <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} />;
}

interface AnimeJSScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
}

export function AnimeJSScrollReveal({ 
  children, 
  direction = 'up', 
  distance = 50, 
  duration = 800, 
  delay = 0,
  className = '' 
}: AnimeJSScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || !anime) return;

    const element = elementRef.current;
    
    // Set initial state based on direction
    const initialTransform = {
      up: { translateY: distance },
      down: { translateY: -distance },
      left: { translateX: distance },
      right: { translateX: -distance }
    };

    anime.set(element, {
      opacity: 0,
      ...initialTransform[direction]
    });

    // Intersection Observer for scroll trigger
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            anime({
              targets: element,
              opacity: [0, 1],
              translateX: 0,
              translateY: 0,
              duration,
              delay,
              easing: 'easeOutCubic'
            });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [direction, distance, duration, delay]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}

interface AnimeJSMorphingBackgroundProps {
  colors: string[];
  className?: string;
}

export function AnimeJSMorphingBackground({ colors, className = '' }: AnimeJSMorphingBackgroundProps) {
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!backgroundRef.current || !anime) return;

    const element = backgroundRef.current;
    
    // Create morphing animation timeline
    const tl = anime.timeline({
      loop: true,
      direction: 'alternate'
    });

    colors.forEach((color, i) => {
      tl.add({
        targets: element,
        background: color,
        duration: 3000,
        easing: 'easeInOutQuad'
      }, i * 2000);
    });

  }, [colors]);

  return <div ref={backgroundRef} className={`absolute inset-0 ${className}`} />;
}

// Hook for custom anime.js animations
export function useAnimeJS() {
  const [animeLoaded, setAnimeLoaded] = useState(false);

  useEffect(() => {
    if (anime) {
      setAnimeLoaded(true);
    } else {
      const checkInterval = setInterval(() => {
        if (anime) {
          setAnimeLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  if (!animeLoaded || !anime) {
    return null; // Return null when anime is not loaded
  }

  return {
    // Stagger animation utility
    stagger: (targets: string | Element | Element[], options: any = {}) => {
      return anime({
        targets,
        delay: anime.stagger(options.delay || 100, options.staggerOptions || {}),
        ...options
      });
    },
    
    // Timeline utility
    timeline: (options: any = {}) => {
      return anime.timeline(options);
    },
    
    // Random utility
    random: (min: number, max: number) => anime.random(min, max),
    
    // Animate utility
    animate: (options: any) => anime(options)
  };
}