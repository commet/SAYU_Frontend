// This file configures the initialization of Sentry on the browser/client side
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Release tracking
  release: process.env.npm_package_version || '1.0.0',
  
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content, only record clicks, nav, reload
      maskAllText: process.env.NODE_ENV === 'production',
      blockAllMedia: process.env.NODE_ENV === 'production',
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Performance monitoring
  beforeSend(event) {
    // Filter out development noise
    if (process.env.NODE_ENV === 'development') {
      // Skip hydration mismatches in development
      if (event.exception?.values?.[0]?.value?.includes('Hydration')) {
        return null;
      }
      
      // Skip Next.js hot reload errors
      if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError')) {
        return null;
      }
    }
    
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    
    return event;
  },
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'sayu-frontend',
      version: process.env.npm_package_version || '1.0.0'
    }
  }
});