'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          문제가 발생했습니다
        </h2>
        <p className="text-gray-400 mb-8">
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <button
          onClick={() => reset()}
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}