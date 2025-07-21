import { Suspense } from 'react';
import MatchingPageClient from './MatchingPageClient';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function MatchingPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <MatchingPageClient />
    </Suspense>
  );
}