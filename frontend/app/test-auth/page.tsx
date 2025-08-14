'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuth() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('Current session:', session)
        setUser(session?.user || null)
      } catch (error) {
        console.error('Error checking session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('Starting Google OAuth with redirect:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      })
      
      if (error) {
        console.error('OAuth error:', error)
        alert('OAuth error: ' + error.message)
      } else {
        console.log('OAuth initiated:', data)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      alert('Unexpected error: ' + err)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Current Status:</h2>
        {user ? (
          <div>
            <p className="text-green-600">✅ Logged in</p>
            <p>Email: {user.email}</p>
            <p>ID: {user.id}</p>
            <p>Provider: {user.app_metadata?.provider}</p>
            <button 
              onClick={handleLogout}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <div>
            <p className="text-red-600">❌ Not logged in</p>
            <button 
              onClick={handleGoogleLogin}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Login with Google
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
            currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'SSR',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'
          }, null, 2)}
        </pre>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold">Instructions:</h3>
        <ol className="list-decimal list-inside mt-2 space-y-1">
          <li>Open browser DevTools (F12) and go to Console tab</li>
          <li>Click "Login with Google" button</li>
          <li>Watch for console logs</li>
          <li>Complete Google login</li>
          <li>Check if you're redirected back and logged in</li>
        </ol>
      </div>
    </div>
  )
}