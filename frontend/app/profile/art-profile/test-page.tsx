'use client';

export default function TestArtProfilePage() {
  console.log('Test ArtProfile page loaded successfully!');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900 flex items-center justify-center">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
          🎨 Art Profile Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          This is a simple test page to verify navigation is working.
        </p>
        <div className="text-green-600 dark:text-green-400 font-semibold">
          ✅ Navigation Successful!
        </div>
        <div className="mt-4">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}