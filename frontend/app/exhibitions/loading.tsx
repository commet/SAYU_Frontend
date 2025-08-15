'use client';

export default function ExhibitionsLoading() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
      style={{ backgroundImage: "url('/images/backgrounds/family-viewing-corner-gallery-intimate.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      
      <div className="relative z-10 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-purple-200 border-t-purple-600 mx-auto mb-6"></div>
        <h2 className="text-white text-xl font-medium mb-2">전시 데이터를 준비하는 중...</h2>
        <p className="text-gray-300 text-sm">서버에서 최신 전시 정보를 가져오고 있습니다</p>
        
        {/* Progress animation */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}