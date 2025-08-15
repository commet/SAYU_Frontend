import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Handle URL fragment (hash) parameters that might contain errors
  const fullUrl = requestUrl.href
  const hashIndex = fullUrl.indexOf('#')
  let hashParams = new URLSearchParams()
  
  if (hashIndex !== -1) {
    const hashString = fullUrl.substring(hashIndex + 1)
    hashParams = new URLSearchParams(hashString)
  }
  
  // Get parameters from both URL search params and hash
  const code = requestUrl.searchParams.get('code') || hashParams.get('code')
  const error = requestUrl.searchParams.get('error') || hashParams.get('error')
  const errorCode = requestUrl.searchParams.get('error_code') || hashParams.get('error_code')
  const errorDescription = requestUrl.searchParams.get('error_description') || hashParams.get('error_description')
  const origin = requestUrl.origin

  console.log('OAuth Callback URL:', requestUrl.href)
  console.log('OAuth Callback params:', {
    code: code ? 'present' : 'missing',
    error,
    errorCode,
    errorDescription,
    hasHash: hashIndex !== -1
  })

  // Handle OAuth errors
  if (error) {
    console.error('OAuth Error:', { error, errorCode, errorDescription })
    
    let redirectError = 'auth_failed'
    if (error === 'server_error' && errorCode === 'unexpected_failure') {
      if (errorDescription?.includes('exchange external code')) {
        redirectError = 'exchange_failed'
      } else {
        redirectError = 'server_error'
      }
    } else if (error === 'access_denied') {
      redirectError = 'access_denied'
    }
    
    return NextResponse.redirect(`${origin}/login?error=${redirectError}`)
  }

  if (code) {
    try {
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Code exchange error:', exchangeError)
        return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
      }
      
      if (!data.session) {
        console.error('No session after code exchange')
        return NextResponse.redirect(`${origin}/login?error=no_session`)
      }
      
      console.log('OAuth login successful')
      return NextResponse.redirect(`${origin}/profile`)
      
    } catch (error) {
      console.error('Unexpected error during code exchange:', error)
      return NextResponse.redirect(`${origin}/login?error=unexpected_error`)
    }
  }

  // No code and no error - invalid callback
  console.error('Invalid OAuth callback - no code or error')
  return NextResponse.redirect(`${origin}/login?error=invalid_callback`)
}