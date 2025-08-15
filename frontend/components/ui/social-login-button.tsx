'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { signInWithProvider, signInWithInstagram } from '@/lib/supabase';

interface SocialLoginButtonProps {
  provider: 'google' | 'github' | 'apple' | 'discord' | 'instagram' | 'kakao';
  mode?: 'login' | 'link';
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    className: 'bg-white hover:bg-gray-50 text-gray-900 hover:text-gray-900 border border-gray-300'
  },
  github: {
    name: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    className: 'bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 text-white hover:text-white border border-gray-900 dark:border-gray-300'
  },
  apple: {
    name: 'Apple',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
    className: 'bg-black dark:bg-gray-800 hover:bg-gray-900 dark:hover:bg-gray-700 text-white hover:text-white border border-gray-900 dark:border-gray-300'
  },
  discord: {
    name: 'Discord',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
      </svg>
    ),
    className: 'bg-[#5865F2] hover:bg-[#4752C4] text-white hover:text-white border border-gray-900 dark:border-gray-300'
  },
  instagram: {
    name: 'Instagram',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
      </svg>
    ),
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white hover:text-white border border-gray-900 dark:border-gray-300'
  },
  kakao: {
    name: 'Kakao',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 5.655 2 10.144c0 2.908 1.876 5.456 4.7 6.897-.208.797-.755 2.891-.863 3.334-.132.545.199.538.418.391.173-.115 2.751-1.871 3.877-2.64C10.735 18.208 11.362 18.252 12 18.252c5.523 0 10-3.655 10-8.144S17.523 2 12 2zm-4.94 11.52c-.672 0-1.215-.543-1.215-1.214V9.102c0-.21.17-.38.38-.38h.46c.21 0 .38.17.38.38v2.824h1.995c.21 0 .38.17.38.38v.46c0 .21-.17.38-.38.38H7.06zm5.164 0c-.21 0-.38-.17-.38-.38v-.46c0-.21.17-.38.38-.38h.836V9.482h-.836c-.21 0-.38-.17-.38-.38v-.46c0-.21.17-.38.38-.38h2.912c.21 0 .38.17.38.38v.46c0 .21-.17.38-.38.38h-.836v2.824h.836c.21 0 .38.17.38.38v.46c0 .21-.17.38-.38.38h-2.912zm3.904-2.076l-1.292-2.104a.378.378 0 01.323-.573h.515c.134 0 .258.071.325.187l.86 1.487.86-1.487a.378.378 0 01.325-.187h.515a.378.378 0 01.323.573l-1.292 2.104v1.462c0 .21-.17.38-.38.38h-.46c-.21 0-.38-.17-.38-.38v-1.462z"/>
      </svg>
    ),
    className: 'bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] hover:text-[#191919] border border-gray-900 dark:border-gray-300'
  }
};

export function SocialLoginButton({ provider, mode = 'login' }: SocialLoginButtonProps) {
  const config = providerConfig[provider];
  
  const handleClick = async () => {
    try {
      toast.loading(`Redirecting to ${config.name}...`);
      
      if (provider === 'instagram') {
        // Instagram uses Facebook OAuth
        await signInWithInstagram();
      } else if (provider === 'google' || provider === 'discord') {
        // Supported providers
        await signInWithProvider(provider);
      } else if (provider === 'kakao') {
        // Use Supabase OAuth for Kakao
        await signInWithProvider('kakao');
      } else {
        // Unsupported providers
        toast.error(`${config.name} login is not available yet`);
        return;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        status: error.status,
        provider: provider,
        fullError: error
      });
      
      // Better error messages
      if (error.message?.includes('not enabled')) {
        toast.error(`${config.name} login is not enabled. Please contact support.`);
      } else if (error.message?.includes('OAuth')) {
        toast.error(`OAuth configuration error for ${config.name}. Please check Supabase settings.`);
      } else if (error.message?.includes('redirect')) {
        toast.error(`Redirect URL error for ${config.name}. Please check configuration.`);
      } else {
        toast.error(`Failed to connect with ${config.name}: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full ${config.className}`}
      onClick={handleClick}
    >
      {config.icon}
      <span className="ml-2">
        {mode === 'login' ? `Continue with ${config.name}` : `Link ${config.name} account`}
      </span>
    </Button>
  );
}