'use client';

import { usePathname } from 'next/navigation';
import FloatingNav from '@/components/navigation/FloatingNav';
import MobileNav from '@/components/navigation/MobileNav';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  
  // Pages where we don't want to show the navigation
  // These are immersive experiences that need full screen
  const hideNavPaths = ['/quiz/scenario', '/quiz/narrative'];
  const shouldHideNav = hideNavPaths.some(path => pathname?.startsWith(path));

  return (
    <>
      {!shouldHideNav && (
        <>
          <div className="hidden lg:block">
            <FloatingNav />
          </div>
          <div className="lg:hidden">
            <MobileNav />
          </div>
        </>
      )}
      <main className={!shouldHideNav ? 'pt-20 pb-24' : ''}>
        {children}
      </main>
    </>
  );
}