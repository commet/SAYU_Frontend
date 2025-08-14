'use client'

import { useState } from 'react'

export default function TestSimpleAuth() {
  const [status, setStatus] = useState('')

  const handleGoogleLogin = () => {
    // Use direct Supabase URL for OAuth
    const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co'
    const redirectTo = encodeURIComponent('http://localhost:3000/auth/callback')
    
    // Direct OAuth URL
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectTo}`
    
    console.log('Redirecting to:', authUrl)
    setStatus('Redirecting to Google...')
    
    // Redirect to Google OAuth
    window.location.href = authUrl
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Simple Auth Test</h1>
          <p className="text-gray-600 mb-8">Direct Supabase OAuth Test</p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Login with Google (Direct)
          </button>
          
          {status && (
            <p className="mt-4 text-sm text-gray-600">{status}</p>
          )}
          
          <div className="mt-8 p-4 bg-gray-50 rounded text-left">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <pre className="text-xs overflow-auto">
{`Supabase URL: https://hgltvdshuyfffskvjmst.supabase.co
Redirect URL: http://localhost:3000/auth/callback
Current Origin: ${typeof window !== 'undefined' ? window.location.origin : 'SSR'}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}