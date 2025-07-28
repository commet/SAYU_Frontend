// This file configures the initialization of Sentry for edge runtime of Next.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring (lower sample rate for edge)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
  
  // Release tracking
  release: process.env.npm_package_version || '1.0.0',
  
  // Edge runtime specific configuration
  beforeSend(event) {
    // Filter edge-specific errors
    if (event.exception?.values?.[0]?.value?.includes('Dynamic Code Evaluation')) {
      return null;
    }
    
    return event;
  },
  
  // Custom tags for edge runtime
  initialScope: {
    tags: {
      component: 'sayu-frontend-edge',
      runtime: 'edge'
    }
  }
});