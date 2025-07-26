'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { Sparkles, Users, Trophy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

const waitlistSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력해주세요')
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

interface WaitlistStats {
  total: number;
  aptCompleted: number;
  accessGranted: number;
  conversionRate: string;
}

export function WaitlistForm() {
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');
  
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const [userReferralCode, setUserReferralCode] = useState<string>('');
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema)
  });

  // 실시간 통계 가져오기
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // 5초마다 업데이트
    
    // Socket.io 연결 (있다면)
    if (typeof window !== 'undefined' && (window as any).io) {
      const socket = (window as any).io(process.env.NEXT_PUBLIC_API_URL);
      socket.on('waitlist:update', (data: { total: number }) => {
        setStats(prev => prev ? { ...prev, total: data.total } : null);
      });
      
      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    }
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlist/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    }
  };

  const onSubmit = async (data: WaitlistFormData) => {
    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlist/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          referralCode: referralCode || undefined,
          source: referralCode ? 'referral' : 'direct'
        })
      });

      const result = await response.json();

      if (result.success) {
        setJoined(true);
        setPosition(result.data.position);
        setUserReferralCode(result.data.referralCode);
        
        // 축하 애니메이션
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        toast.success('대기 목록에 등록되었습니다!');
      } else {
        toast.error(result.message || '등록에 실패했습니다');
      }
    } catch (error) {
      toast.error('네트워크 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/beta?ref=${userReferralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('링크가 복사되었습니다!');
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* 실시간 통계 */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Users className="w-5 h-5 text-purple-500" />
            <span className="text-2xl font-bold text-gray-900">
              {stats.total.toLocaleString()}명
            </span>
          </div>
          <p className="text-sm text-gray-600">이 SAYU를 기다리고 있어요</p>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {!joined ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="email">이메일 주소</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {referralCode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-purple-50 rounded-lg"
              >
                <p className="text-sm text-purple-700">
                  <Sparkles className="inline w-4 h-4 mr-1" />
                  친구의 초대로 가입하시는군요! 우선권이 부여됩니다.
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? '등록 중...' : '대기 목록 등록하기'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>APT 테스트를 완료하면 바로 시작할 수 있어요!</p>
              <ul className="mt-2 space-y-1">
                <li>✨ APT 테스트 후 즉시 기본 기능 이용</li>
                <li>🎁 친구 초대 코드 3개 제공</li>
                <li>🏆 얼리 어답터 뱃지 & 향후 혜택</li>
              </ul>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                등록 완료!
              </h3>
              <p className="text-lg text-gray-700 mb-2">
                이제 APT 테스트를 완료하면
              </p>
              <p className="text-2xl font-bold text-purple-600">
                바로 시작할 수 있어요!
              </p>
            </div>

            {/* APT 테스트 안내 */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold mb-3 text-purple-900">
                🎯 다음 단계: APT 성격 테스트
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                10분 만에 당신의 예술 성향을 발견하고
                <br />
                SAYU의 기본 기능을 바로 사용해보세요!
              </p>
              <div className="space-y-2 text-left text-sm text-purple-600">
                <div>✅ 즉시 기본 기능 이용 가능</div>
                <div>🎁 친구 초대 코드 3개 획득</div>
                <div>🏆 얼리 어답터 특별 혜택</div>
              </div>
            </div>

            {/* CTA 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={() => window.location.href = '/apt-test'}
                className="w-full"
                size="lg"
              >
                APT 테스트 시작하기 →
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}