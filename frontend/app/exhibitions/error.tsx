'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Exhibition page error:', error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
      style={{ backgroundImage: "url('/images/backgrounds/family-viewing-corner-gallery-intimate.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        <div className="bg-red-900/20 backdrop-blur-sm rounded-2xl p-8 border border-red-500/30">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            전시 정보를 불러올 수 없습니다
          </h2>
          <p className="text-gray-300 mb-6 leading-relaxed">
            네트워크 연결 상태를 확인하거나 <br />
            잠시 후 다시 시도해주세요.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              다시 시도
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              홈으로 돌아가기
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-black/20 rounded-lg">
            <p className="text-xs text-gray-400 mb-2">기술적 정보:</p>
            <p className="text-xs text-red-300 font-mono">
              {error.message || '알 수 없는 오류가 발생했습니다'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}