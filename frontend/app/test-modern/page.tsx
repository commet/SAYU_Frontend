'use client';

export default function TestModernPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
        Test Modern Page
      </h1>
      <p className="mt-4 text-xl text-gray-700">
        If you can see this, the page is loading correctly!
      </p>
      <div className="mt-8 glass-enhanced p-8 rounded-2xl max-w-md">
        <h2 className="text-2xl font-bold mb-4">Glass Card Test</h2>
        <p className="text-gray-600">This is a glass morphism card with enhanced effects.</p>
      </div>
    </div>
  );
}