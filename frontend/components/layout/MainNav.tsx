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
  const [userInfo, setUserInfo] = useState<any>(null);
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
    setUserInfo(user);

    if (user) {
      try {
        const status = await userActivityApi.checkCommunityUnlock();
        setCommunityUnlocked(status.isUnlocked);
      } catch (error) {
        console.error('Failed to check community status:', error);
      }
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'facebook':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
          </svg>
        );
      case 'google':
        return (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'kakao':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 5.655 2 10.144c0 2.908 1.876 5.456 4.7 6.897-.208.797-.755 2.891-.863 3.334-.132.545.199.538.418.391.173-.115 2.751-1.871 3.877-2.64C10.735 18.208 11.362 18.252 12 18.252c5.523 0 10-3.655 10-8.144S17.523 2 12 2zm-4.94 11.52c-.672 0-1.215-.543-1.215-1.214V9.102c0-.21.17-.38.38-.38h.46c.21 0 .38.17.38.38v2.824h1.995c.21 0 .38.17.38.38v.46c0 .21-.17.38-.38.38H7.06zm5.164 0c-.21 0-.38-.17-.38-.38v-.46c0-.21.17-.38.38-.38h.836V9.482h-.836c-.21 0-.38-.17-.38-.38v-.46c0-.21.17-.38.38-.38h2.912c.21 0 .38.17.38.38v.46c0 .21-.17.38-.38.38h-.836v2.824h.836c.21 0 .38.17.38.38v.46c0 .21-.17.38-.38.38h-2.912zm3.904-2.076l-1.292-2.104a.378.378 0 01.323-.573h.515c.134 0 .258.071.325.187l.86 1.487.86-1.487a.378.378 0 01.325-.187h.515a.378.378 0 01.323.573l-1.292 2.104v1.462c0 .21-.17.38-.38.38h-.46c-.21 0-.38-.17-.38-.38v-1.462z"/>
          </svg>
        );
      case 'discord':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
        );
      default:
        return null;
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
              isLocked && 'opacity-70 hover:opacity-100'
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

        {/* User Info Section */}
        {isAuthenticated && userInfo && (
          <div className="p-3 mb-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {userInfo.user_metadata?.avatar_url ? (
                  <img
                    src={userInfo.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userInfo.user_metadata?.full_name || userInfo.email?.split('@')[0] || '사용자'}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {getProviderIcon(userInfo.app_metadata?.provider || '')}
                  <span className="capitalize">
                    {userInfo.app_metadata?.provider === 'facebook' ? 'Instagram' : userInfo.app_metadata?.provider || 'Email'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
                
                {/* User Info Section for Mobile */}
                {isAuthenticated && userInfo && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {userInfo.user_metadata?.avatar_url ? (
                          <img
                            src={userInfo.user_metadata.avatar_url}
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {userInfo.user_metadata?.full_name || userInfo.email?.split('@')[0] || '사용자'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {getProviderIcon(userInfo.app_metadata?.provider || '')}
                          <span className="capitalize">
                            {userInfo.app_metadata?.provider === 'facebook' ? 'Instagram' : userInfo.app_metadata?.provider || 'Email'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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