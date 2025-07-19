'use client';

import { MainNav } from '@/components/layout/MainNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <MainNav />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 md:py-8 px-4 md:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}