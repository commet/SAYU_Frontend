import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  console.log('Auth callback triggered');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') ?? '/dashboard';
  
  console.log('Auth callback params:', { 
    code: code ? 'present' : 'missing', 
    error, 
    errorDescription: errorDescription ? decodeURIComponent(errorDescription) : null,
    next 
  });

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    
    // Special handling for Instagram email error
    if (errorDescription?.includes('Error getting user email from external provider')) {
      console.log('Instagram email error - this is expected for Instagram Basic Display API');
      // For Instagram, we can proceed without email
      // The user will need to provide email separately later
      return NextResponse.redirect(new URL('/login?info=instagram_no_email', requestUrl.origin));
    }
    
    return NextResponse.redirect(new URL(`/login?error=${error}&description=${encodeURIComponent(errorDescription || '')}`, requestUrl.origin));
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Auth callback exchange error:', exchangeError);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
    
    console.log('Auth successful, redirecting to:', next);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}