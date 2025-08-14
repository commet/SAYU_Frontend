# Google OAuth Setup Guide for SAYU

## Supabase Dashboard Setup

1. **Go to your Supabase project dashboard**
   - URL: https://supabase.com/dashboard/project/hgltvdshuyfffskvjmst
   
2. **Navigate to Authentication > Providers**
   - Find "Google" in the list of providers
   - Click to expand Google settings

3. **Enable Google Provider**
   - Toggle the "Enable Sign in with Google" switch to ON

4. **Copy the Redirect URL**
   - Copy this URL: `https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback`
   - You'll need this for Google Cloud Console

## Google Cloud Console Setup

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Create a new project or use an existing one

3. **Enable Google+ API**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click and Enable it

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "SAYU Auth"

5. **Configure Authorized Redirect URIs**
   Add ALL of these URIs:
   ```
   https://hgltvdshuyfffskvjmst.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   http://localhost:3000
   ```

6. **Copy Client ID and Client Secret**
   - After creating, copy the Client ID and Client Secret

## Back to Supabase Dashboard

1. **Enter Google Credentials**
   - Paste the Client ID in "Google Client ID"
   - Paste the Client Secret in "Google Client Secret"
   
2. **Save the configuration**
   - Click "Save" button

## Test the Setup

1. Clear browser cache and cookies for localhost:3000
2. Open browser console (F12) to see debug logs
3. Try logging in with Google
4. Check console for any error messages

## Common Issues

### "Provider not enabled" error
- Make sure Google provider is enabled in Supabase dashboard

### Redirect URI mismatch error
- Ensure ALL redirect URIs are added in Google Cloud Console
- URIs must match exactly (including http/https and trailing slashes)

### PKCE verification failed
- Clear browser cookies and try again
- This usually happens when auth flow is interrupted

### No error but redirects back to login
- Check browser console for detailed logs
- Verify session cookies are being set properly
- Check if third-party cookies are blocked in browser

## Debug Information

When clicking Google login, check browser console for:
- 🔐 Auth Provider: google
- 📍 App URL: http://localhost:3000
- 🔄 Redirect URL: http://localhost:3000/auth/callback
- 🔗 Redirecting to: (Google OAuth URL)

If you see all these logs but still get redirected back, the issue is likely with the callback handling or session creation.