'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import type { LeaderboardEntry, LeaderboardType } from '@/types/gamification';

interface LeaderboardProps {
  className?: string;
}

export function Leaderboard({ className }: LeaderboardProps) {
  const [selectedType, setSelectedType] = React.useState<LeaderboardType>('weekly');
  const [leaderboardData, setLeaderboardData] = React.useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  // 실제로는 useLeaderboard 훅을 사용
  React.useEffect(() => {
    // 데모 데이터
    setLeaderboardData([
      { rank: 1, user_id: 1, username: 'ArtLover', avatar_url: '', level: 5, weekly_xp: 1250 },
      { rank: 2, user_id: 2, username: 'MuseumExplorer', avatar_url: '', level: 4, weekly_xp: 1100 },
      { rank: 3, user_id: 3, username: 'CreativeSOul', avatar_url: '', level: 4, weekly_xp: 950 },
    ]);
    setLoading(false);
  }, [selectedType]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-orange-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 dark:from-yellow-900/20 dark:to-yellow-800/10';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800/20 dark:to-gray-700/10';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-800/10';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          리더보드
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as LeaderboardType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly">주간</TabsTrigger>
            <TabsTrigger value="monthly">월간</TabsTrigger>
            <TabsTrigger value="all-time">전체</TabsTrigger>
          </TabsList>
          
          <TabsContent value={selectedType} className="mt-4 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                로딩중...
              </div>
            ) : (
              <>
                {leaderboardData.map((entry, index) => (
                  <motion.div
                    key={entry.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-lg',
                      getRankColor(entry.rank),
                      entry.isCurrentUser && 'ring-2 ring-primary'
                    )}
                  >
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar_url} alt={entry.username} />
                      <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.username}</span>
                        <Badge variant="secondary" className="text-xs">
                          Lv.{entry.level}
                        </Badge>
                        {entry.isCurrentUser && (
                          <Badge variant="default" className="text-xs">
                            나
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {selectedType === 'weekly' && `${entry.weekly_xp?.toLocaleString()} XP`}
                        {selectedType === 'monthly' && `${entry.weekly_xp?.toLocaleString()} XP`}
                        {selectedType === 'all-time' && `${entry.total_xp?.toLocaleString()} XP`}
                      </div>
                    </div>
                    
                    {entry.rank <= 3 && (
                      <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </motion.div>
                ))}
                
                {leaderboardData.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    아직 순위가 없습니다.
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}