'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Loader2, 
  Palette, 
  Heart,
  Sparkles,
  X
} from 'lucide-react';
import { museumAPIs } from '@/lib/museumAPIs';

interface AddArtworkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (artwork: any, emotionTags: string[], personalNote: string) => void;
}

export function AddArtworkModal({ open, onOpenChange, onSubmit }: AddArtworkModalProps) {
  const [step, setStep] = useState<'search' | 'select' | 'customize'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [emotionTags, setEmotionTags] = useState<string[]>([]);
  const [personalNote, setPersonalNote] = useState('');
  const [loading, setLoading] = useState(false);

  const predefinedEmotions = [
    '평온함', '활기참', '그리움', '신비로움', '강렬함',
    '우아함', '자유로움', '따뜻함', '차갑함', '밝음',
    '어둠', '희망적', '슬픔', '기쁨', '경이로움'
  ];

  const searchArtworks = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      // Met Museum API로 검색
      const results = await museumAPIs.searchArtworks(searchQuery, 'met');
      setSearchResults(results.slice(0, 12)); // 최대 12개
      setStep('select');
    } catch (error) {
      console.error('Failed to search artworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectArtwork = (artwork: any) => {
    setSelectedArtwork(artwork);
    setStep('customize');
  };

  const toggleEmotionTag = (emotion: string) => {
    if (emotionTags.includes(emotion)) {
      setEmotionTags(emotionTags.filter(tag => tag !== emotion));
    } else if (emotionTags.length < 3) {
      setEmotionTags([...emotionTags, emotion]);
    }
  };

  const handleSubmit = () => {
    if (!selectedArtwork) return;
    
    onSubmit(selectedArtwork, emotionTags, personalNote);
    resetModal();
  };

  const resetModal = () => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedArtwork(null);
    setEmotionTags([]);
    setPersonalNote('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetModal();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            컬렉션에 작품 추가
          </DialogTitle>
        </DialogHeader>

        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" disabled={step !== 'search'}>작품 검색</TabsTrigger>
            <TabsTrigger value="select" disabled={step !== 'select'}>작품 선택</TabsTrigger>
            <TabsTrigger value="customize" disabled={step !== 'customize'}>감정 태그</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
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

            <div className="text-center py-8">
              <Palette className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">작품을 검색해보세요</h3>
              <p className="text-muted-foreground">
                Metropolitan Museum of Art의 컬렉션에서 검색합니다
              </p>
            </div>
          </TabsContent>

          <TabsContent value="select" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">검색 결과 ({searchResults.length}개)</h3>
              <Button variant="outline" onClick={() => setStep('search')}>
                다시 검색
              </Button>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((artwork) => (
                  <Card 
                    key={artwork.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => selectArtwork(artwork)}
                  >
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
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            {selectedArtwork && (
              <div className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {selectedArtwork.image_url ? (
                    <img 
                      src={selectedArtwork.image_url} 
                      alt={selectedArtwork.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Palette className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{selectedArtwork.title}</h3>
                  <p className="text-muted-foreground text-sm">{selectedArtwork.artist}</p>
                  <p className="text-muted-foreground text-xs">{selectedArtwork.date}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>감정 태그 (최대 3개)</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedEmotions.map((emotion) => (
                  <Badge
                    key={emotion}
                    variant={emotionTags.includes(emotion) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-colors ${
                      emotionTags.includes(emotion) 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'hover:bg-purple-100'
                    }`}
                    onClick={() => toggleEmotionTag(emotion)}
                  >
                    {emotion}
                    {emotionTags.includes(emotion) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                선택됨: {emotionTags.length}/3
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">개인 메모 (선택사항)</Label>
              <Textarea
                id="note"
                placeholder="이 작품에 대한 개인적인 생각이나 느낌을 적어보세요..."
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('select')}>
                다른 작품 선택
              </Button>
              <Button onClick={handleSubmit}>
                <Heart className="mr-2 h-4 w-4" />
                컬렉션에 추가
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}