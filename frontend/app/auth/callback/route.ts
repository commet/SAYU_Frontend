import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const error_description = requestUrl.searchParams.get('error_description')
  
  console.log('Auth callback route - Processing callback:', {
    code: code ? 'present' : 'missing',
    error,
    error_description,
    url: request.url
  })

  // Handle errors
  if (error) {
    console.error('OAuth error:', error, error_description)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
    )
  }

  if (code) {
    try {
      // createClient is async, need to await it
      const supabase = await createClient()
      
      // Exchange code for session
      console.log('Exchanging code for session...')
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', {
          message: exchangeError.message,
          status: exchangeError.status,
          name: exchangeError.name,
          details: exchangeError
        })
        return NextResponse.redirect(
          new URL(`/login?error=${encodeURIComponent(exchangeError.message || 'exchange_failed')}`, requestUrl.origin)
        )
      }
      
      if (data?.session) {
        console.log('Session created successfully, redirecting to profile')
        console.log('User:', data.session.user.email)
        // Successful login - redirect to profile
        return NextResponse.redirect(new URL('/profile', requestUrl.origin))
      } else {
        console.log('No session in response, but no error either')
        return NextResponse.redirect(new URL('/login?error=no_session', requestUrl.origin))
      }
    } catch (err: any) {
      console.error('Unexpected error during code exchange:', {
        message: err?.message,
        stack: err?.stack,
        error: err
      })
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(err?.message || 'exchange_failed')}`, requestUrl.origin)
      )
    }
  }

  // No code or error - redirect to login
  console.log('No code or error in callback, redirecting to login')
  return NextResponse.redirect(new URL('/login', requestUrl.origin))
}