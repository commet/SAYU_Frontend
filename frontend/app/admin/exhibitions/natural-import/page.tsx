'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ParsedExhibition {
  exhibition_title: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  ticket_price: string;
  description?: string;
  artists?: string[];
  genre?: string;
  exhibition_type?: string;
  operating_hours?: string;
  website_url?: string;
  phone_number?: string;
  confidence_score: number;
  raw_text: string;
  selected?: boolean;
}

interface SaveResult {
  success: boolean;
  exhibition_title: string;
  error?: string;
}

export default function NaturalImportPage() {
  const [inputText, setInputText] = useState('');
  const [parsedExhibitions, setParsedExhibitions] = useState<ParsedExhibition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveResults, setSaveResults] = useState<SaveResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleParse = async () => {
    if (!inputText.trim()) {
      alert('텍스트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/exhibitions/parse-natural', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const result = await response.json();
      
      if (result.success) {
        const exhibitionsWithSelection = result.data.map((ex: ParsedExhibition) => ({
          ...ex,
          selected: ex.confidence_score >= 70 // 신뢰도 70% 이상 자동 선택
        }));
        setParsedExhibitions(exhibitionsWithSelection);
      } else {
        alert(`파싱 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Parse error:', error);
      alert('파싱 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    const selectedExhibitions = parsedExhibitions.filter(ex => ex.selected);
    if (selectedExhibitions.length === 0) {
      alert('저장할 전시를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    setSaveResults([]);
    setShowResults(true);

    try {
      const response = await fetch('/api/exhibitions/confirm-save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ exhibitions: selectedExhibitions }),
      });

      const result = await response.json();
      
      if (result.success) {
        setSaveResults(result.results);
      } else {
        alert(`저장 실패: ${result.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelection = (index: number) => {
    setParsedExhibitions(prev => prev.map((ex, i) => 
      i === index ? { ...ex, selected: !ex.selected } : ex
    ));
  };

  const getConfidenceBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const selectedCount = parsedExhibitions.filter(ex => ex.selected).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">전시 정보 자연어 임포트</h1>
        <Badge variant="outline">{parsedExhibitions.length}개 파싱됨</Badge>
      </div>

      {/* 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>전시 정보 텍스트 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="전시 홈페이지에서 복사한 텍스트를 여기에 붙여넣으세요.

예시:
조각가 김영원 개인전
2025.8.14-11.16
국립현대미술관 서울관
현대 조각의 새로운 시각을 제시하는 전시
관람료: 성인 4,000원 / 청소년 2,000원
운영시간: 화-일 10:00-18:00 (월요일 휴관)
02-3701-9500
https://www.mmca.go.kr

---

팀랩 보더리스 서울전
2025.9.1-2026.2.28
롯데월드타워 SKY31
미디어아트의 새로운 경험
관람료: 성인 35,000원
운영시간: 매일 10:00-21:00
02-1234-5678
https://borderless.teamlab.art"
            rows={12}
            className="min-h-[300px]"
          />
          <Button 
            onClick={handleParse} 
            disabled={isLoading || !inputText.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                파싱 중...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                전시 정보 파싱하기
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 파싱 결과 */}
      {parsedExhibitions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>파싱 결과 ({parsedExhibitions.length}개)</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setParsedExhibitions(prev => prev.map(ex => ({ ...ex, selected: true })))}
              >
                전체 선택
              </Button>
              <Button
                variant="outline"
                onClick={() => setParsedExhibitions(prev => prev.map(ex => ({ ...ex, selected: false })))}
              >
                전체 해제
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving || selectedCount === 0}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  `${selectedCount}개 저장`
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parsedExhibitions.map((exhibition, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    exhibition.selected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleSelection(index)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exhibition.exhibition_title}</h3>
                      <p className="text-gray-600">{exhibition.venue_name}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Badge className={`${getConfidenceBadgeColor(exhibition.confidence_score)} text-white`}>
                        신뢰도 {exhibition.confidence_score}%
                      </Badge>
                      {exhibition.selected && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">기간:</span>
                      <p>{exhibition.start_date} ~ {exhibition.end_date}</p>
                    </div>
                    <div>
                      <span className="font-medium">가격:</span>
                      <p>{exhibition.ticket_price}</p>
                    </div>
                    <div>
                      <span className="font-medium">장르:</span>
                      <p>{exhibition.genre || '-'}</p>
                    </div>
                    <div>
                      <span className="font-medium">유형:</span>
                      <p>{exhibition.exhibition_type || '-'}</p>
                    </div>
                  </div>
                  
                  {exhibition.artists && exhibition.artists.length > 0 && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">작가:</span>
                      <p className="text-sm">{exhibition.artists.join(', ')}</p>
                    </div>
                  )}
                  
                  {exhibition.description && (
                    <div className="mt-2">
                      <span className="font-medium text-sm">설명:</span>
                      <p className="text-sm text-gray-600">{exhibition.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 저장 결과 */}
      {showResults && saveResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              저장 결과
              <Badge variant="outline">
                {saveResults.filter(r => r.success).length}/{saveResults.length} 성공
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {saveResults.map((result, index) => (
                <Alert key={index} className={result.success ? 'border-green-200' : 'border-red-200'}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <AlertDescription>
                      <span className="font-medium">{result.exhibition_title}</span>
                      {result.success ? (
                        <span className="text-green-600 ml-2">저장 완료</span>
                      ) : (
                        <span className="text-red-600 ml-2">실패: {result.error}</span>
                      )}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>

            {isSaving && (
              <div className="mt-4">
                <Progress value={(saveResults.length / selectedCount) * 100} />
                <p className="text-sm text-gray-600 mt-1">
                  {saveResults.length}/{selectedCount} 처리 완료
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 사용법 안내 */}
      {parsedExhibitions.length === 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              사용법 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">1. 텍스트 준비</h4>
                <p className="text-gray-600">
                  미술관이나 갤러리 홈페이지에서 전시 정보를 복사해 위 입력창에 붙여넣으세요.
                  여러 전시를 한번에 처리할 수 있습니다.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">2. 자동 파싱</h4>
                <p className="text-gray-600">
                  AI가 텍스트에서 전시명, 미술관, 날짜, 가격 등을 자동으로 추출합니다.
                  신뢰도가 높을수록 정확도가 높습니다.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. 검토 및 저장</h4>
                <p className="text-gray-600">
                  파싱 결과를 검토하고 저장할 전시를 선택한 후 저장 버튼을 클릭하세요.
                  중복된 전시는 자동으로 걸러집니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}