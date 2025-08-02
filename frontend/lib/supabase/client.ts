import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (typeof window !== 'undefined' && supabaseInstance) {
    return supabaseInstance;
  }
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: {
        getItem: (key) => {
          if (typeof window !== 'undefined') {
            return window.localStorage.getItem(key);
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, value);
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(key);
          }
        },
      },
    }
  });
  
  return supabaseInstance;
}