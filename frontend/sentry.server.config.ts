// This file configures the initialization of Sentry for edge runtime of Next.js
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Release tracking
  release: process.env.npm_package_version || '1.0.0',
  
  // Server-side error filtering
  beforeSend(event) {
    // Filter out common Next.js noise
    if (event.exception?.values?.[0]?.value?.includes('ENOENT')) {
      return null;
    }
    
    if (event.exception?.values?.[0]?.value?.includes('fetch failed')) {
      // Only report if it's not a transient network error
      if (!event.exception?.values?.[0]?.value?.includes('getaddrinfo ENOTFOUND')) {
        return event;
      }
      return null;
    }
    
    // Remove sensitive server data
    if (event.contexts?.os) {
      delete event.contexts.os.build;
      delete event.contexts.os.kernel_version;
    }
    
    return event;
  },
  
  // Custom tags for server
  initialScope: {
    tags: {
      component: 'sayu-frontend-server',
      runtime: 'edge'
    }
  }
});