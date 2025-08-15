'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function TestExhibitionsPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExhibitions = async () => {
      try {
        console.log('🚀 Testing direct Supabase connection...');
        const supabase = createClient();
        
        const { data, error: supabaseError } = await supabase
          .from('exhibitions')
          .select('*')
          .limit(5);

        console.log('📊 Supabase response:', { data, error: supabaseError });

        if (supabaseError) {
          setError(supabaseError.message);
        } else {
          setExhibitions(data || []);
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading...</div>;
  if (error) return <div className="p-8 text-red-400">Error: {error}</div>;

  return (
    <div className="p-8 min-h-screen bg-black text-white">
      <h1 className="text-2xl mb-4">Test Exhibitions ({exhibitions.length})</h1>
      <div className="space-y-4">
        {exhibitions.map((ex, i) => (
          <div key={i} className="border p-4 rounded">
            <h3 className="font-bold">{ex.venue_name || 'No venue'}</h3>
            <p className="text-gray-300">{ex.description?.slice(0, 100)}...</p>
            <p className="text-sm text-gray-400">
              {ex.start_date} - {ex.end_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}