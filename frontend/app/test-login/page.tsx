'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function TestLoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Mock login without Supabase
  const handleMockLogin = () => {
    setLoading(true);
    
    // Set mock user data in localStorage
    const mockUser = {
      id: 'test-user-123',
      email: 'test@sayu.com',
      created_at: new Date().toISOString(),
    };
    
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
    
    // Redirect to home
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  };

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">테스트 로그인</h1>
        
        <Button
          onClick={handleMockLogin}
          disabled={loading}
          className="w-full"
        >
          {loading ? '로그인 중...' : '테스트 계정으로 로그인'}
        </Button>
        
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
          이메일 확인 없이 바로 로그인됩니다
        </p>
      </div>
    </div>
  );
}