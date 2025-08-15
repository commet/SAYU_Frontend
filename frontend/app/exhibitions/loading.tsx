export default function Loading() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
      style={{ backgroundImage: "url('/images/backgrounds/family-viewing-corner-gallery-intimate.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 text-center">
        {/* Skeleton Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300/20 rounded-lg w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300/20 rounded w-96 mx-auto mb-8"></div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
                  <div className="h-6 bg-gray-300/20 rounded w-8 mb-2"></div>
                  <div className="h-3 bg-gray-300/20 rounded w-16"></div>
                </div>
              ))}
            </div>
            
            {/* Exhibition Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
                  <div className="h-24 bg-gray-300/20"></div>
                  <div className="p-5">
                    <div className="h-4 bg-gray-300/20 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-300/20 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300/20 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
          <p className="text-white text-lg font-medium mb-2">전시 정보를 불러오는 중...</p>
          <p className="text-gray-300 text-sm">Supabase 데이터베이스에서 최신 전시 정보를 가져오고 있습니다</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}