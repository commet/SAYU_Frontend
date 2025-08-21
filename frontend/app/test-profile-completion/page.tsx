'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function TestProfileCompletion() {
  const router = useRouter();
  const [status, setStatus] = useState<string[]>([]);

  useEffect(() => {
    const currentStatus = [];
    
    // Check current localStorage state
    currentStatus.push(`profile_completed: ${localStorage.getItem('profile_completed')}`);
    currentStatus.push(`profile_skipped: ${localStorage.getItem('profile_skipped')}`);
    currentStatus.push(`onboarding_notification_shown: ${localStorage.getItem('onboarding_notification_shown')}`);
    
    setStatus(currentStatus);
  }, []);

  const clearProfileCompletion = () => {
    localStorage.removeItem('profile_completed');
    localStorage.removeItem('profile_skipped');
    localStorage.removeItem('onboarding_notification_shown');
    
    setStatus([
      'Cleared all profile completion flags',
      'profile_completed: null',
      'profile_skipped: null',
      'onboarding_notification_shown: null'
    ]);
  };

  const goToProfile = () => {
    router.push('/profile');
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Profile Completion Test Page</h1>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current localStorage Status:</h2>
          <pre className="text-sm text-gray-300">
            {status.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </pre>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={clearProfileCompletion}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Clear Profile Completion Flags
          </Button>
          
          <Button 
            onClick={goToProfile}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Go to Profile Page
          </Button>
        </div>

        <div className="bg-yellow-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Testing Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Click "Clear Profile Completion Flags" to reset localStorage</li>
            <li>Click "Go to Profile Page" to see ProfileCompletion modal</li>
            <li>ProfileCompletion should appear as a popup modal (Both Mobile & Desktop)</li>
            <li>Modal can be closed with ESC key, clicking outside, or X button</li>
            <li>Check console for any errors</li>
            <li>Try completing or skipping the form</li>
            <li>✨ Now displays as a modal popup instead of inline!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}