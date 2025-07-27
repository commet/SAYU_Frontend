'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FolderOpen, 
  Sparkles, 
  MessageSquare, 
  Users, 
  User,
  Lock,
  Menu,
  X,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { userActivityApi } from '@/lib/api/collections';
import { cn } from '@/lib/utils';

const navigation = [
  { 
    name: '홈', 
    href: '/', 
    icon: Home,
    public: true 
  },
  { 
    name: '컬렉션', 
    href: '/collections', 
    icon: FolderOpen,
    public: false,
    description: '작품을 모아 나만의 미술관을 만들어보세요'
  },
  { 
    name: '데일리 챌린지', 
    href: '/daily-challenge', 
    icon: Sparkles,
    public: false,
    description: '매일 새로운 작품으로 감정을 기록하고 매칭을 받아보세요'
  },
  { 
    name: '감상 교환', 
    href: '/exchanges', 
    icon: MessageSquare,
    public: false,
    requiresCommunity: true,
    description: '작품에 대한 감상을 나누며 천천히 알아가세요'
  },
  { 
    name: '전시 동행', 
    href: '/exhibitions', 
    icon: Users,
    public: false,
    requiresCommunity: true,
    description: '함께 전시를 관람할 동행을 찾아보세요'
  },
  { 
    name: 'Artist Portal', 
    href: '/artist-portal', 
    icon: Palette,
    public: true,
    description: '누락된 작가 정보를 제출하거나 작가님이 직접 등록하세요'
  },
  { 
    name: '프로필', 
    href: '/profile', 
    icon: User,
    public: false 
  }
];

export function MainNav() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [communityUnlocked, setCommunityUnlocked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    checkAuthAndCommunity();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuthAndCommunity();
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndCommunity = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);

    if (user) {
      try {
        const status = await userActivityApi.checkCommunityUnlock();
        setCommunityUnlocked(status.isUnlocked);
      } catch (error) {
        console.error('Failed to check community status:', error);
      }
    }
  };

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        const isAccessible = item.public || isAuthenticated;
        const isLocked = item.requiresCommunity && !communityUnlocked;

        if (!isAccessible) return null;

        return (
          <Link
            key={item.name}
            href={isLocked ? '#' : item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              isLocked && 'opacity-50 cursor-not-allowed'
            )}
            onClick={(e) => {
              if (isLocked) {
                e.preventDefault();
              } else {
                setIsOpen(false);
              }
            }}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1">{item.name}</span>
            {isLocked && <Lock className="h-4 w-4" />}
            {item.href === '/daily-challenge' && !isActive && (
              <Badge variant="secondary" className="ml-auto">
                NEW
              </Badge>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex flex-col gap-2 w-64 h-full p-4 border-r bg-background">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary">SAYU</h1>
          <p className="text-sm text-muted-foreground">Art Life Platform</p>
        </div>

        <div className="flex flex-col gap-1">
          <NavLinks />
        </div>

        {!communityUnlocked && isAuthenticated && (
          <div className="mt-auto p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">커뮤니티 잠금 해제까지</p>
            <p className="text-xs text-muted-foreground">
              더 많은 활동을 통해 다른 사용자들과 교류할 수 있는 기능을 열어보세요
            </p>
          </div>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">SAYU</h1>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <div className="flex flex-col gap-4">
                <div>
                  <h2 className="text-lg font-bold">SAYU</h2>
                  <p className="text-sm text-muted-foreground">Art Life Platform</p>
                </div>
                
                <div className="flex flex-col gap-1">
                  <NavLinks />
                </div>

                {!communityUnlocked && isAuthenticated && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">커뮤니티 잠금</p>
                    <p className="text-xs text-muted-foreground">
                      더 많은 활동이 필요합니다
                    </p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}