import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // In browser, check for actual env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey || 
        supabaseUrl === 'https://dummy.supabase.co' || 
        supabaseAnonKey === 'dummy-anon-key' ||
        supabaseAnonKey === 'dummy-key') {
      console.error('Supabase environment variables not properly configured')
      // Return a mock client that won't cause errors
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          signIn: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
          signOut: async () => ({ error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
          delete: () => ({ data: null, error: { message: 'Supabase not configured' } })
        })
      } as any
    }
    
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  }
  
  // During SSR/build time, return a properly configured client or mock
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}