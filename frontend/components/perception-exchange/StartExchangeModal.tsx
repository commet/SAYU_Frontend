'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Palette, 
  Loader2,
  Heart,
  Eye,
  Clock
} from 'lucide-react';
import { museumAPIs } from '@/lib/museumAPIs';

interface StartExchangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (artworkData: any) => void;
}

export function StartExchangeModal({ open, onOpenChange, onStart }: StartExchangeModalProps) {
  const [step, setStep] = useState<'search' | 'select' | 'ready'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [initialMessage, setInitialMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const searchArtworks = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Met Museum API 검색
      const results = await museumAPIs.searchArtworks(searchQuery, 'met');
      setSearchResults(results.slice(0, 6)); // 최대 6개만 표시
    } catch (error) {
      console.error('Failed to search artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectArtwork = (artwork: any) => {
    setSelectedArtwork(artwork);
    setStep('ready');
  };

  const startExchange = async () => {
    if (!selectedArtwork) return;
    
    setLoading(true);
    try {
      await onStart({
        ...selectedArtwork,
        initialMessage
      });
      onOpenChange(false);
      resetModal();
    } catch (error) {
      console.error('Failed to start exchange:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetModal = () => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedArtwork(null);
    setInitialMessage('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            새로운 감상 교환 시작
          </DialogTitle>
          <DialogDescription>
            마음에 드는 작품을 선택하고 다른 사용자와 감상을 나눠보세요
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: 작품 검색 */}
        {step === 'search' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="search">작품 검색</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="작품명, 작가명, 또는 키워드를 입력하세요"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchArtworks()}
                />
                <Button onClick={searchArtworks} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* 검색 결과 */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">검색 결과</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((artwork) => (
                    <Card key={artwork.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div onClick={() => selectArtwork(artwork)}>
                        <div className="aspect-square overflow-hidden rounded-t-lg">
                          {artwork.image_url ? (
                            <img 
                              src={artwork.image_url} 
                              alt={artwork.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <Palette className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2">{artwork.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{artwork.artist}</p>
                          <p className="text-xs text-muted-foreground">{artwork.date}</p>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* 추천 작품 (검색 결과가 없을 때) */}
            {searchResults.length === 0 && !loading && (
              <div className="space-y-4">
                <h3 className="font-medium">추천 작품</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 하드코딩된 추천 작품들 */}
                  {[
                    {
                      id: 'sample-1',
                      title: '별이 빛나는 밤',
                      artist: '빈센트 반 고흐',
                      date: '1889',
                      image_url: '/placeholder-artwork.jpg',
                      source: 'sample'
                    },
                    {
                      id: 'sample-2',
                      title: '진주 귀걸이를 한 소녀',
                      artist: '요하네스 베르메르',
                      date: '1665',
                      image_url: '/placeholder-artwork.jpg',
                      source: 'sample'
                    },
                    {
                      id: 'sample-3',
                      title: '모나리자',
                      artist: '레오나르도 다 빈치',
                      date: '1503-1519',
                      image_url: '/placeholder-artwork.jpg',
                      source: 'sample'
                    }
                  ].map((artwork) => (
                    <Card key={artwork.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                      <div onClick={() => selectArtwork(artwork)}>
                        <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100 flex items-center justify-center">
                          <Palette className="h-12 w-12 text-gray-400" />
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium text-sm line-clamp-2">{artwork.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{artwork.artist}</p>
                          <p className="text-xs text-muted-foreground">{artwork.date}</p>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  💡 위의 검색창에서 원하는 작품을 찾아보세요
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: 교환 준비 */}
        {step === 'ready' && selectedArtwork && (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {selectedArtwork.image_url ? (
                  <img 
                    src={selectedArtwork.image_url} 
                    alt={selectedArtwork.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Palette className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{selectedArtwork.title}</h3>
                <p className="text-muted-foreground">{selectedArtwork.artist}</p>
                <p className="text-sm text-muted-foreground">{selectedArtwork.date}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    감정 공유
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    관점 교환
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    점진적 공개
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">첫 메시지 (선택사항)</Label>
              <Textarea
                id="message"
                placeholder="이 작품을 선택한 이유나 첫인상을 간단히 적어보세요..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                이 메시지는 상대방이 교환을 시작할 때 함께 공유됩니다
              </p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">
                🎨 감상 교환 과정
              </h4>
              <div className="text-sm text-purple-700 dark:text-purple-400 space-y-1">
                <p><strong>1단계:</strong> 작품에 대한 첫인상과 즉각적인 감정 공유</p>
                <p><strong>2단계:</strong> 개인적 경험과 기억과의 연결</p>
                <p><strong>3단계:</strong> 자신의 성향과 예술 취향 공개</p>
                <p><strong>4단계:</strong> 더 깊은 연결과 연락처 교환 (선택적)</p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('search')}>
                다른 작품 선택
              </Button>
              <Button onClick={startExchange} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    매칭 중...
                  </>
                ) : (
                  '교환 시작하기'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}