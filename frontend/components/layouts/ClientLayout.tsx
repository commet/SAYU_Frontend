'use client';

import { usePathname } from 'next/navigation';
import FloatingNav from '@/components/navigation/FloatingNav';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Pages where we don't want to show the navigation
  const hideNavPaths = ['/quiz/scenario', '/quiz/narrative'];
  const shouldHideNav = hideNavPaths.some(path => pathname.startsWith(path));

  return (
    <>
      {!shouldHideNav && <FloatingNav />}
      <main className={!shouldHideNav ? 'pt-20 pb-24' : ''}>
        {children}
      </main>
    </>
  );
}