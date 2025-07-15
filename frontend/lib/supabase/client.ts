import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Check if Supabase environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client for build time when env vars are not set
    console.warn('Supabase environment variables not set. Using mock client.')
    return null as any
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}