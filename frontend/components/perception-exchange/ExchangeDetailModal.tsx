'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Palette, 
  Send, 
  Clock, 
  Heart,
  Star,
  MessageSquare,
  CheckCircle
} from 'lucide-react';
import { exchangeApi } from '@/lib/api/simple-exchange';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ExchangeDetailModalProps {
  session: any;
  onClose: () => void;
  onUpdate: () => void;
}

export function ExchangeDetailModal({ session, onClose, onUpdate }: ExchangeDetailModalProps) {
  const [sessionDetail, setSessionDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      loadSessionDetail();
    }
  }, [session]);

  const loadSessionDetail = async () => {
    try {
      const detail = await exchangeApi.getSessionDetail(session.id);
      setSessionDetail(detail);
    } catch (error) {
      console.error('Failed to load session detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!response.trim() || !sessionDetail) return;

    setSubmitting(true);
    try {
      await exchangeApi.submitResponse(sessionDetail.id, sessionDetail.current_phase, {
        content: response.trim(),
        submitted_at: new Date().toISOString()
      });
      
      setResponse('');
      await loadSessionDetail();
      onUpdate();
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-center py-16">
            <div className="animate-pulse">교환 정보를 불러오는 중...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!sessionDetail) {
    return null;
  }

  const artwork = sessionDetail.artwork_data;
  const partner = sessionDetail.participant_id === sessionDetail.initiator_id 
    ? sessionDetail.participant 
    : sessionDetail.initiator;

  const phaseNames = ['첫인상 나누기', '개인적 경험 연결', '성향과 취향 공유', '깊은 연결'];
  const phaseDescriptions = [
    '작품을 보고 느낀 첫 번째 감정과 생각을 공유해주세요',
    '이 작품이 당신의 경험이나 기억과 어떻게 연결되는지 이야기해주세요',
    '당신의 예술 취향과 성격이 이 작품을 어떻게 바라보게 하는지 공유해주세요',
    '서로에게 더 관심이 있다면 연락처를 교환하고 만남을 계획해보세요'
  ];

  const currentPhase = sessionDetail.current_phase;
  const isCompleted = sessionDetail.status === 'completed';

  // 내 응답과 상대방 응답 분리
  const myResponses = sessionDetail.responses?.filter((r: any) => r.user_id === sessionDetail.current_user_id) || [];
  const partnerResponses = sessionDetail.responses?.filter((r: any) => r.user_id !== sessionDetail.current_user_id) || [];

  const hasMyCurrentResponse = myResponses.some((r: any) => r.phase === currentPhase);
  const hasPartnerCurrentResponse = partnerResponses.some((r: any) => r.phase === currentPhase);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            감상 교환
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 작품 정보 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
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
                <div className="flex-1">
                  <h3 className="font-semibold">{artwork?.title || '작품 제목'}</h3>
                  <p className="text-muted-foreground text-sm">{artwork?.artist || '작가 미상'}</p>
                  <p className="text-muted-foreground text-xs">{artwork?.date}</p>
                </div>
                <div className="text-right">
                  <Badge variant={isCompleted ? "outline" : "default"}>
                    {isCompleted ? '완료됨' : `${currentPhase}/4 단계`}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상대방 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                교환 상대
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={partner?.profile_image_url} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {currentPhase >= 2 ? (partner?.username || '익명 사용자') : '익명 사용자'}
                  </p>
                  {currentPhase >= 3 && partner?.apt_type && (
                    <p className="text-sm text-muted-foreground">
                      {partner.apt_type} 성격 유형
                    </p>
                  )}
                  {currentPhase < 2 && (
                    <p className="text-xs text-muted-foreground">
                      2단계부터 닉네임이 공개됩니다
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 현재 단계 */}
          {!isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {phaseNames[currentPhase - 1]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {phaseDescriptions[currentPhase - 1]}
                </p>

                {/* 응답 상태 */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    {hasMyCurrentResponse ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className="text-sm">내 응답 {hasMyCurrentResponse ? '완료' : '대기중'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasPartnerCurrentResponse ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className="text-sm">상대방 응답 {hasPartnerCurrentResponse ? '완료' : '대기중'}</span>
                  </div>
                </div>

                {/* 응답 입력 */}
                {!hasMyCurrentResponse && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder={`${phaseNames[currentPhase - 1]}에 대한 당신의 생각을 자유롭게 적어보세요...`}
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={submitResponse} 
                        disabled={submitting || !response.trim()}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {submitting ? '전송 중...' : '응답 보내기'}
                      </Button>
                    </div>
                  </div>
                )}

                {hasMyCurrentResponse && !hasPartnerCurrentResponse && (
                  <div className="text-center py-4 text-muted-foreground">
                    응답을 보냈습니다. 상대방의 응답을 기다리고 있어요 ⏰
                  </div>
                )}

                {hasMyCurrentResponse && hasPartnerCurrentResponse && (
                  <div className="text-center py-4 text-green-600">
                    양쪽 모두 응답을 완료했습니다! 곧 다음 단계로 진행됩니다 ✨
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 이전 단계들의 대화 */}
          {sessionDetail.responses && sessionDetail.responses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  대화 기록
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[1, 2, 3, 4].map(phase => {
                  const phaseResponses = sessionDetail.responses.filter((r: any) => r.phase === phase);
                  if (phaseResponses.length === 0) return null;

                  return (
                    <div key={phase} className="border-l-2 border-purple-200 pl-4">
                      <h4 className="font-medium mb-3">{phase}단계: {phaseNames[phase - 1]}</h4>
                      <div className="space-y-3">
                        {phaseResponses.map((response: any) => (
                          <div 
                            key={response.id}
                            className={`p-3 rounded-lg ${
                              response.user_id === sessionDetail.current_user_id
                                ? 'bg-purple-50 dark:bg-purple-950/20 ml-4'
                                : 'bg-gray-50 dark:bg-gray-800 mr-4'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                {response.user_id === sessionDetail.current_user_id ? (
                                  <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                    나
                                  </div>
                                ) : (
                                  <Avatar className="w-6 h-6">
                                    <AvatarFallback className="text-xs">
                                      상
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm">{response.response_data?.content}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {format(new Date(response.submitted_at), 'M월 d일 HH:mm', { locale: ko })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* 완료된 교환 평가 */}
          {isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  교환 평가
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  이 교환이 어떠셨나요? 평가를 남겨주시면 더 좋은 매칭을 도와드릴게요.
                </p>
                {/* 평가 폼은 추후 구현 */}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}