'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Upload, Download, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react'

interface BulkUpdateResult {
  success: boolean
  processed: number
  inserted: number
  updated: number
  errors: string[]
  details: {
    exhibitions: any[]
    newVenues: string[]
  }
}

export default function ExhibitionBulkUpdatePage() {
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<BulkUpdateResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV 템플릿 예제
  const csvTemplate = `title_ko,title_en,venue_name,start_date,end_date,description_ko,description_en,curator,genre,exhibition_type,ticket_price_adult,ticket_price_student,poster_url,website_url
김현식 개인전,Kim Hyun-sik Solo Exhibition,갤러리현대,2024-03-01,2024-03-30,현대미술가 김현식의 개인전,Solo exhibition by contemporary artist Kim Hyun-sik,박미진,contemporary,solo,15000,10000,https://example.com/poster.jpg,https://example.com
혼합전시,Mixed Exhibition,국립현대미술관,2024-04-01,2024-05-31,다양한 작가들의 혼합전시,Mixed exhibition featuring various artists,이수정,contemporary,group,20000,15000,,
조각 특별전,Special Sculpture Exhibition,서울시립미술관,2024-06-01,2024-07-15,현대 조각 작품들의 특별전시,Special exhibition of contemporary sculptures,김동현,sculpture,special,12000,8000,,https://example.com`

  // JSON 템플릿 예제
  const jsonTemplate = [
    {
      title_ko: "김현식 개인전",
      title_en: "Kim Hyun-sik Solo Exhibition",
      venue_name: "갤러리현대",
      start_date: "2024-03-01",
      end_date: "2024-03-30",
      description_ko: "현대미술가 김현식의 개인전",
      description_en: "Solo exhibition by contemporary artist Kim Hyun-sik",
      curator: "박미진",
      genre: "contemporary",
      exhibition_type: "solo",
      ticket_price_adult: 15000,
      ticket_price_student: 10000,
      poster_url: "https://example.com/poster.jpg",
      website_url: "https://example.com"
    }
  ]

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setTextInput(content)
    }
    reader.readAsText(file, 'UTF-8')
  }

  // 템플릿 다운로드
  const downloadTemplate = (format: 'csv' | 'json') => {
    const content = format === 'csv' ? csvTemplate : JSON.stringify(jsonTemplate, null, 2)
    const blob = new Blob([content], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `exhibition_template.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 일괄 업데이트 실행
  const executeBulkUpdate = async (format: 'csv' | 'json') => {
    if (!textInput.trim()) {
      alert('데이터를 입력해주세요')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/exhibitions/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: textInput,
          format
        })
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '업데이트 실패')
      }

      const result: BulkUpdateResult = await response.json()
      setResult(result)

    } catch (error) {
      console.error('Bulk update failed:', error)
      setResult({
        success: false,
        processed: 0,
        inserted: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'],
        details: {
          exhibitions: [],
          newVenues: []
        }
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">전시 일괄 업데이트</h1>
          <p className="text-muted-foreground mt-2">
            CSV나 JSON 형식으로 여러 전시 정보를 한번에 업데이트할 수 있습니다
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          관리자 전용
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 업로드 영역 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                데이터 입력
              </CardTitle>
              <CardDescription>
                CSV 또는 JSON 형식의 전시 데이터를 붙여넣기하거나 파일로 업로드하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  파일 업로드
                </Button>
                <span className="text-sm text-muted-foreground">
                  CSV, JSON, TXT 파일 지원
                </span>
              </div>

              <Textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="여기에 CSV 또는 JSON 데이터를 붙여넣기하세요..."
                className="min-h-[300px] font-mono text-sm"
              />

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-sm">처리 중...</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Tabs defaultValue="csv" className="w-full">
                <TabsList>
                  <TabsTrigger value="csv">CSV로 처리</TabsTrigger>
                  <TabsTrigger value="json">JSON으로 처리</TabsTrigger>
                </TabsList>
                <TabsContent value="csv">
                  <Button
                    onClick={() => executeBulkUpdate('csv')}
                    disabled={isProcessing || !textInput.trim()}
                    className="w-full"
                  >
                    CSV 데이터 일괄 업데이트
                  </Button>
                </TabsContent>
                <TabsContent value="json">
                  <Button
                    onClick={() => executeBulkUpdate('json')}
                    disabled={isProcessing || !textInput.trim()}
                    className="w-full"
                  >
                    JSON 데이터 일괄 업데이트
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* 결과 표시 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  처리 결과
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{result.processed}</div>
                    <div className="text-sm text-muted-foreground">처리됨</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
                    <div className="text-sm text-green-600">새로 추가</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
                    <div className="text-sm text-blue-600">업데이트</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                    <div className="text-sm text-red-600">오류</div>
                  </div>
                </div>

                {result.details.newVenues.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>새로 추가된 미술관/갤러리</AlertTitle>
                    <AlertDescription>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.details.newVenues.map((venue, index) => (
                          <Badge key={index} variant="secondary">
                            {venue}
                          </Badge>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {result.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>오류 목록</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 사이드바 - 템플릿 및 도움말 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                템플릿 다운로드
              </CardTitle>
              <CardDescription>
                올바른 형식의 템플릿을 다운로드하여 사용하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => downloadTemplate('csv')}
              >
                CSV 템플릿 다운로드
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => downloadTemplate('json')}
              >
                JSON 템플릿 다운로드
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>필수 필드</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><Badge variant="secondary">title_ko</Badge> 전시 제목 (한국어)</li>
                <li><Badge variant="secondary">venue_name</Badge> 미술관/갤러리명</li>
                <li><Badge variant="secondary">start_date</Badge> 시작일 (YYYY-MM-DD)</li>
                <li><Badge variant="secondary">end_date</Badge> 종료일 (YYYY-MM-DD)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>선택 필드</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><Badge variant="outline">title_en</Badge> 영문 제목</li>
                <li><Badge variant="outline">description_ko</Badge> 한국어 설명</li>
                <li><Badge variant="outline">curator</Badge> 큐레이터</li>
                <li><Badge variant="outline">genre</Badge> 장르</li>
                <li><Badge variant="outline">exhibition_type</Badge> 전시 유형</li>
                <li><Badge variant="outline">ticket_price_adult</Badge> 성인 요금</li>
                <li><Badge variant="outline">poster_url</Badge> 포스터 이미지</li>
                <li><Badge variant="outline">website_url</Badge> 웹사이트</li>
              </ul>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>주의사항</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li>기존 전시는 자동으로 업데이트됩니다</li>
                <li>새로운 미술관은 자동으로 생성됩니다</li>
                <li>날짜 형식은 YYYY-MM-DD를 사용하세요</li>
                <li>대량 데이터는 처리에 시간이 걸릴 수 있습니다</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}