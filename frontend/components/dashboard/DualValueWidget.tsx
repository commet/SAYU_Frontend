'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Brain,
  Sparkles,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DualValueWidgetProps {
  className?: string;
}

export function DualValueWidget({ className }: DualValueWidgetProps) {
  // Mock data - replace with actual API calls
  const culturalValue = 750;
  const emotionalValue = 620;
  const totalValue = culturalValue + emotionalValue;
  const monthlyGrowth = 12.5;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            듀얼 가치 시스템
          </CardTitle>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            +{monthlyGrowth}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Value Display */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">총 축적 가치</p>
          <motion.p 
            className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {totalValue.toLocaleString()}
          </motion.p>
          <p className="text-xs text-muted-foreground mt-1">Cultural + Emotional Points</p>
        </div>

        {/* Dual Values */}
        <div className="grid grid-cols-2 gap-4">
          {/* Cultural Value */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <Brain className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm font-medium">문화적 가치</span>
              </div>
              <span className="text-sm font-bold">{culturalValue}</span>
            </div>
            <Progress value={75} className="h-2" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">획득 방법:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">전시 관람</Badge>
                <Badge variant="secondary" className="text-xs">작품 분석</Badge>
              </div>
            </div>
          </motion.div>

          {/* Emotional Value */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/20">
                  <Heart className="h-4 w-4 text-pink-600" />
                </div>
                <span className="text-sm font-medium">감정적 가치</span>
              </div>
              <span className="text-sm font-bold">{emotionalValue}</span>
            </div>
            <Progress value={62} className="h-2 [&>div]:bg-pink-500" />
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">획득 방법:</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">감상 공유</Badge>
                <Badge variant="secondary" className="text-xs">Art Pulse</Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Benefits */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">다음 보상까지</p>
              <Progress value={85} className="h-1.5 bg-amber-200" />
              <p className="text-xs text-muted-foreground">
                1,500 포인트 달성 시 특별 배지 획득
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
            <Zap className="h-4 w-4 mx-auto mb-1 text-orange-500" />
            <p className="text-xs font-medium">일일 획득</p>
            <p className="text-xs text-muted-foreground">+45</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-500" />
            <p className="text-xs font-medium">주간 성장</p>
            <p className="text-xs text-muted-foreground">+8.2%</p>
          </div>
          <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
            <Award className="h-4 w-4 mx-auto mb-1 text-purple-500" />
            <p className="text-xs font-medium">순위</p>
            <p className="text-xs text-muted-foreground">상위 15%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}