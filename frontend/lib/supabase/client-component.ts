import { createClientComponentClient as createSupabaseClient } from '@supabase/auth-helpers-nextjs';

// Wrapper for createClientComponentClient that handles missing env vars during build
export function createClientComponentClient() {
  // During build time, Next.js may not have access to runtime env vars
  // We need to handle this gracefully to prevent build failures
  
  if (typeof window === 'undefined') {
    // Server-side or build time
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not set during build. Using placeholder values.');
      // Return a mock client that won't throw errors during build
      return {
        auth: {
          signInWithPassword: async () => ({ error: new Error('Auth not configured') }),
          signInWithOAuth: async () => ({ error: new Error('Auth not configured') }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => ({
          select: () => ({ data: null, error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        })
      } as any;
    }
  }
  
  return createSupabaseClient();
}