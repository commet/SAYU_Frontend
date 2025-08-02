'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  FolderOpen, 
  MessageSquare, 
  Users,
  Calendar,
  Heart,
  Activity,
  User
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard component mounted!');
    handleAuth();
  }, []);

  const handleAuth = async () => {
    try {
      console.log('Starting auth check...');
      const supabase = createClient();
      
      // Check if we have auth params in URL (OAuth redirect)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      
      console.log('URL hash params:', window.location.hash);
      console.log('Access token found:', !!accessToken);
      
      if (accessToken) {
        console.log('Setting session from URL params...');
        // Set the session from URL params
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (error) {
          console.error('Error setting session:', error);
        } else if (data.session) {
          console.log('Session set successfully:', data.session.user);
          setUser(data.session.user);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setLoading(false);
          return;
        }
      }
      
      // Check existing session
      console.log('Checking existing session...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      console.log('Existing session:', session);
      
      if (session?.user) {
        console.log('User found in session:', session.user);
        setUser(session.user);
      } else {
        console.log('No user found in session');
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      console.log('Auth check complete, setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">로그인이 필요합니다</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            대시보드를 이용하시려면 로그인해주세요.
          </p>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/login">로그인하기</Link>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              새로고침
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                환영합니다, {user.user_metadata?.full_name || user.email?.split('@')[0] || '사용자'}님!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                SAYU에서 당신만의 예술 여정을 시작해보세요.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 컬렉션</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">공개: 0</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">수집한 작품</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">이번 주: 0</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활동 일수</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0일</div>
                <p className="text-xs text-muted-foreground">연속: 0일</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                빠른 시작
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/quiz" className="flex flex-col items-center gap-2">
                    <Activity className="h-6 w-6" />
                    <span className="font-medium">성격 퀴즈 시작</span>
                    <span className="text-xs text-muted-foreground text-center">
                      당신의 예술 성향을 발견해보세요
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/gallery" className="flex flex-col items-center gap-2">
                    <FolderOpen className="h-6 w-6" />
                    <span className="font-medium">갤러리 탐색</span>
                    <span className="text-xs text-muted-foreground text-center">
                      다양한 예술 작품을 둘러보세요
                    </span>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="h-auto p-4">
                  <Link href="/community" className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="font-medium">커뮤니티 참여</span>
                    <span className="text-xs text-muted-foreground text-center">
                      다른 사용자들과 소통해보세요
                    </span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">아직 활동이 없습니다.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  퀴즈를 시작하거나 작품을 탐색해보세요!
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}