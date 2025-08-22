// Framer Motion Global Configuration for SAYU
// Prevents flickering and improves animation consistency

export const motionConfig = {
  // Reduce layout animations on initial load
  reducedMotion: false,
  
  // Default transition for all animations
  defaultTransition: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1], // Material Design easing
  },
};

// Default animation variants for consistency
export const defaultVariants = {
  // Page transitions
  page: {
    initial: { 
      opacity: 0.98,
      y: 2,
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: { 
      opacity: 0.98,
      y: -2,
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  },
  
  // Component fade in
  fadeIn: {
    initial: { 
      opacity: 0.85,
    },
    animate: { 
      opacity: 1,
      transition: {
        duration: 0.15,
      },
    },
  },
  
  // Subtle slide
  slideIn: {
    initial: { 
      opacity: 0.9,
      x: 10,
    },
    animate: { 
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  },
  
  // Quiz options
  quizOption: {
    initial: { 
      opacity: 0.8,
      y: 5,
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.15,
      },
    },
    tap: {
      scale: 0.98,
    },
  },
  
  // Card animations
  card: {
    initial: { 
      opacity: 0.9,
      scale: 0.98,
    },
    animate: { 
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -2,
      transition: {
        duration: 0.2,
      },
    },
  },
  
  // Stagger children
  stagger: {
    animate: {
      transition: {
        staggerChildren: 0.03, // Reduced from 0.1
      },
    },
  },
  
  // Container for lists
  container: {
    initial: { opacity: 0.9 },
    animate: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.02,
        duration: 0.1,
      },
    },
  },
  
  // List items
  item: {
    initial: { 
      opacity: 0.8,
      y: 3,
    },
    animate: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15,
      },
    },
  },
};

// Animation settings based on user preferences
export const getAnimationSettings = () => {
  if (typeof window === 'undefined') {
    return {
      initial: false,
      animate: true,
      exit: false,
      transition: { duration: 0 },
    };
  }
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: false,
      exit: false,
      transition: { duration: 0 },
    };
  }
  
  return {
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
    variants: defaultVariants.page,
  };
};

// Layout animation config
export const layoutConfig = {
  // Disable layout animations initially
  initial: false,
  // Enable after hydration
  transition: {
    layout: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

// Optimized AnimatePresence settings
export const animatePresenceConfig = {
  mode: 'wait' as const,
  initial: false,
  onExitComplete: () => {
    // Clean up after exit animation
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  },
};

// Gesture settings for better mobile experience
export const gestureConfig = {
  drag: false, // Disable drag by default
  dragElastic: 0.2,
  dragConstraints: { left: 0, right: 0, top: 0, bottom: 0 },
  whileTap: { scale: 0.98 },
  whileHover: { scale: 1.02 },
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
  },
};

// Viewport settings for scroll animations
export const viewportConfig = {
  once: true, // Only animate once
  margin: '0px 0px -100px 0px', // Start animation before element is fully in view
  amount: 0.3, // Trigger when 30% visible
};

// Export a hook for components to use
export const useMotionConfig = () => {
  return {
    variants: defaultVariants,
    settings: getAnimationSettings(),
    layout: layoutConfig,
    presence: animatePresenceConfig,
    gesture: gestureConfig,
    viewport: viewportConfig,
  };
};