export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-100 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-400 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  );
}