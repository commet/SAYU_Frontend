import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // For build time, use dummy values if env vars are not set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return a mock client for build time when env vars are not set
    console.warn('Supabase environment variables not set. Using mock client.')
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}