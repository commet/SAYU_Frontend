'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle,
  ArrowRight,
  Palette
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ExchangeSessionCardProps {
  session: any;
  onClick: () => void;
  onUpdate: () => void;
}

export function ExchangeSessionCard({ session, onClick, onUpdate }: ExchangeSessionCardProps) {
  const isCompleted = session.status === 'completed';
  const artwork = session.artwork_data;
  const partner = session.participant_id === session.initiator_id ? session.participant : session.initiator;
  
  // 현재 단계 정보
  const phaseNames = ['첫인상', '개인적 경험', '성향 공유', '깊은 연결'];
  const currentPhaseName = phaseNames[session.current_phase - 1] || '완료됨';

  // 내가 응답했는지 확인
  const myResponses = session.responses?.filter((r: any) => r.user_id === session.current_user_id) || [];
  const hasMyResponse = myResponses.some((r: any) => r.phase === session.current_phase);

  // 상대방이 응답했는지 확인
  const partnerResponses = session.responses?.filter((r: any) => r.user_id !== session.current_user_id) || [];
  const hasPartnerResponse = partnerResponses.some((r: any) => r.phase === session.current_phase);

  const getStatusBadge = () => {
    if (isCompleted) {
      return <Badge variant="outline" className="text-green-600">완료됨</Badge>;
    }
    
    if (hasMyResponse && hasPartnerResponse) {
      return <Badge className="bg-purple-100 text-purple-700">다음 단계 준비 중</Badge>;
    } else if (hasMyResponse) {
      return <Badge variant="outline" className="text-orange-600">상대방 응답 대기</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-700">내 응답 필요</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              {artwork?.image_url ? (
                <img 
                  src={artwork.image_url} 
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Palette className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-lg">
                {artwork?.title || '작품 제목'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {artwork?.artist || '작가 미상'}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 상대방 정보 */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Avatar className="h-8 w-8">
            <AvatarImage src={partner?.profile_image_url} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm">
              {partner?.username || '익명 사용자'}
            </p>
            {partner?.apt_type && (
              <p className="text-xs text-muted-foreground">
                {partner.apt_type} 유형
              </p>
            )}
          </div>
        </div>

        {/* 진행 상황 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">진행 상황</span>
            <span className="text-sm text-muted-foreground">
              {session.current_phase}/4 단계
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(session.current_phase / 4) * 100}%` }}
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            현재: {currentPhaseName}
          </p>
        </div>

        {/* 액션 영역 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(session.created_at), 'M월 d일', { locale: ko })}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{session.responses?.length || 0}개 응답</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}