'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Copy,
  Download,
  RefreshCw,
  Wand2,
  Eye,
  EyeOff,
  Database,
  Zap
} from 'lucide-react';

import { 
  parseExhibitionText, 
  parseMultipleExhibitions,
  validateParsedExhibition,
  generateExhibitionSQL,
  ParsedExhibition 
} from '@/lib/exhibition-parser';

import { 
  parsingExamples, 
  batchParsingSample, 
  challengingCases,
  categories,
  getRandomSample,
  getSamplesByCategory 
} from '@/lib/exhibition-parser-samples';

import {
  saveBatchExhibitionsToDB,
  checkExhibitionDuplicates,
  enhanceExhibitionData,
  exhibitionParserAPI
} from '@/lib/exhibition-parser-api';

interface ParsedResult {
  original: string;
  parsed: ParsedExhibition;
  validation: {
    isValid: boolean;
    errors: string[];
  };
  sql: string;
}

export function ExhibitionParser() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState<ParsedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [batchMode, setBatchMode] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveResults, setSaveResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 단일 텍스트 파싱
   */
  const handleSingleParse = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);
    
    // 파싱 지연으로 시각적 피드백
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const parsed = parseExhibitionText(inputText);
      const validation = validateParsedExhibition(parsed);
      const sql = generateExhibitionSQL(parsed);

      const result: ParsedResult = {
        original: inputText,
        parsed,
        validation,
        sql
      };

      setResults([result]);
    } catch (error) {
      console.error('Parsing error:', error);
      // 에러 처리
      const errorResult: ParsedResult = {
        original: inputText,
        parsed: {
          title: '',
          venue_name: '',
          venue_city: '',
          start_date: '',
          end_date: '',
          status: 'draft',
          confidence: 0,
          raw_text: inputText,
          parsing_errors: [error.message || '알 수 없는 오류']
        } as ParsedExhibition,
        validation: { isValid: false, errors: ['파싱 중 오류 발생'] },
        sql: ''
      };
      setResults([errorResult]);
    }

    setIsProcessing(false);
  }, [inputText]);

  /**
   * 배치 파싱 (여러 전시 정보)
   */
  const handleBatchParse = useCallback(async () => {
    if (!inputText.trim()) return;

    setIsProcessing(true);

    // 텍스트를 전시별로 분할 (빈 줄 또는 패턴으로)
    const exhibitionTexts = inputText
      .split(/\n\s*\n/) // 빈 줄로 분할
      .filter(text => text.trim().length > 10); // 너무 짧은 텍스트 제외

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const parsedExhibitions = parseMultipleExhibitions(exhibitionTexts);
      
      const batchResults: ParsedResult[] = parsedExhibitions.map((parsed, index) => {
        const validation = validateParsedExhibition(parsed);
        const sql = generateExhibitionSQL(parsed);

        return {
          original: exhibitionTexts[index],
          parsed,
          validation,
          sql
        };
      });

      setResults(batchResults);
    } catch (error) {
      console.error('Batch parsing error:', error);
    }

    setIsProcessing(false);
  }, [inputText]);

  /**
   * 파일 업로드 처리
   */
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
      setBatchMode(true);
    };

    if (file.type.includes('text')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      // PDF, DOC 등 다른 형식 지원 (향후 구현)
      alert('현재 텍스트 파일만 지원됩니다.');
    }
  }, []);

  /**
   * 샘플 텍스트 로드
   */
  const loadSample = useCallback((sampleText: string) => {
    setInputText(sampleText);
    setShowSamples(false);
  }, []);

  /**
   * 랜덤 샘플 로드
   */
  const loadRandomSample = useCallback(() => {
    const sample = getRandomSample();
    setInputText(sample.text);
    setBatchMode(false);
  }, []);

  /**
   * 배치 샘플 로드
   */
  const loadBatchSample = useCallback(() => {
    setInputText(batchParsingSample);
    setBatchMode(true);
  }, []);

  /**
   * 데이터베이스에 저장
   */
  const saveToDatabase = useCallback(async () => {
    if (results.length === 0) return;

    setIsSaving(true);
    setSaveResults(null);

    try {
      // 유효한 결과만 필터링
      const validExhibitions = results
        .filter(r => r.validation.isValid && r.parsed.confidence >= 60)
        .map(r => r.parsed);

      if (validExhibitions.length === 0) {
        alert('저장할 유효한 전시 정보가 없습니다. (신뢰도 60% 이상 필요)');
        return;
      }

      // 중복 검사
      const duplicateCheck = await checkExhibitionDuplicates(validExhibitions);
      if (duplicateCheck.success && duplicateCheck.data?.duplicates.length > 0) {
        const proceed = confirm(
          `${duplicateCheck.data.duplicates.length}개의 중복 가능성이 있는 전시가 발견되었습니다. 계속 진행하시겠습니까?`
        );
        if (!proceed) return;
      }

      // 데이터 개선 (이미지, 태그 등 자동 추가)
      const enhancedExhibitions = await Promise.all(
        validExhibitions.map(ex => enhanceExhibitionData(ex))
      );

      // 배치 저장
      const saveResult = await saveBatchExhibitionsToDB(enhancedExhibitions, {
        overwrite: false,
        minConfidence: 60
      });

      if (saveResult.success) {
        setSaveResults({
          success: true,
          saved: saveResult.data?.length || 0,
          total: results.length,
          details: saveResult.data
        });
        alert(`${saveResult.data?.length || 0}개의 전시가 성공적으로 저장되었습니다!`);
      } else {
        setSaveResults({
          success: false,
          error: saveResult.error || '저장 중 오류가 발생했습니다.'
        });
        alert(`저장 실패: ${saveResult.error}`);
      }
    } catch (error) {
      setSaveResults({
        success: false,
        error: error.message || '저장 중 예상치 못한 오류가 발생했습니다.'
      });
      alert(`저장 중 오류: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [results]);

  /**
   * 결과를 클리보드에 복사
   */
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: 토스트 알림
  }, []);

  /**
   * 모든 SQL 다운로드
   */
  const downloadAllSQL = useCallback(() => {
    const validResults = results.filter(r => r.validation.isValid);
    const allSQL = validResults.map(r => r.sql).join('\n\n');
    
    const blob = new Blob([allSQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exhibitions_${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results]);

  /**
   * 신뢰도에 따른 색상
   */
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400 bg-green-500/20';
    if (confidence >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">전시 정보 파서</h2>
            <p className="text-gray-400">자연어 텍스트를 구조화된 전시 데이터로 변환하세요</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={batchMode}
                onChange={(e) => setBatchMode(e.target.checked)}
                className="rounded"
              />
              배치 모드
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              파일 업로드
            </button>
            <button
              onClick={() => setShowSamples(!showSamples)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              샘플 보기
            </button>
          </div>
        </div>

        {/* Samples Panel */}
        <AnimatePresence>
          {showSamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/10 rounded-lg p-4 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">샘플 데이터</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={loadRandomSample}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    랜덤 샘플
                  </button>
                  <button
                    onClick={loadBatchSample}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    배치 샘플
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {getSamplesByCategory(selectedCategory).map((sample, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 rounded p-3 border border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                    onClick={() => loadSample(sample.text)}
                  >
                    <div className="text-white font-medium mb-1">{sample.name}</div>
                    <div className="text-gray-400 text-sm mb-2">{sample.category}</div>
                    <div className="text-gray-300 text-xs line-clamp-2">
                      {sample.text.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        <div className="space-y-4">
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              {batchMode ? '전시 정보 (빈 줄로 구분)' : '전시 정보 텍스트'}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={batchMode 
                ? "여러 전시 정보를 입력하세요. 각 전시는 빈 줄로 구분해주세요.\n\n예:\n전시명: 현대미술의 흐름\n기간: 2024.03.01 - 2024.05.31\n장소: 국립현대미술관\n\n전시명: 인상주의 특별전\n기간: 2024.04.15 - 2024.07.30\n장소: 서울시립미술관"
                : "전시 정보를 자유롭게 입력하세요.\n\n예:\n《현대미술의 흐름》 2024.03.01 - 2024.05.31 국립현대미술관\n또는\n전시명: 인상주의 특별전\n기간: 2024년 4월 15일 - 7월 30일\n장소: 서울시립미술관 본관"
              }
              rows={batchMode ? 12 : 8}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-vertical"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={batchMode ? handleBatchParse : handleSingleParse}
              disabled={isProcessing || !inputText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white rounded-lg transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  파싱 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  {batchMode ? '배치 파싱' : '파싱 시작'}
                </>
              )}
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {showPreview ? '미리보기 숨김' : '미리보기 표시'}
            </button>

            {results.length > 0 && (
              <>
                <button
                  onClick={saveToDatabase}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Database className="w-5 h-5" />
                      DB에 저장
                    </>
                  )}
                </button>
                <button
                  onClick={downloadAllSQL}
                  className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  SQL 다운로드
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Save Results */}
      <AnimatePresence>
        {saveResults && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white/5 backdrop-blur-sm rounded-xl p-6 border ${
              saveResults.success ? 'border-green-500/30' : 'border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {saveResults.success ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <XCircle className="w-6 h-6 text-red-400" />
              )}
              <h3 className={`text-lg font-semibold ${
                saveResults.success ? 'text-green-400' : 'text-red-400'
              }`}>
                {saveResults.success ? '저장 완료' : '저장 실패'}
              </h3>
            </div>

            {saveResults.success ? (
              <div className="text-white">
                <p className="mb-2">
                  총 {saveResults.total}개 중 {saveResults.saved}개의 전시가 성공적으로 저장되었습니다.
                </p>
                {saveResults.details && saveResults.details.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">저장된 전시 목록:</h4>
                    <div className="max-h-32 overflow-y-auto">
                      {saveResults.details.map((detail: any, index: number) => (
                        <div key={index} className="text-sm text-gray-300 py-1">
                          • ID: {detail.id} {detail.created ? '(신규)' : '(업데이트)'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white">
                <p className="text-red-300">
                  {saveResults.error || '알 수 없는 오류가 발생했습니다.'}
                </p>
              </div>
            )}

            <button
              onClick={() => setSaveResults(null)}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
            >
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">파싱 결과 요약</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">{results.length}</div>
                  <div className="text-sm text-gray-300">총 파싱 건수</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4 border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">
                    {results.filter(r => r.validation.isValid).length}
                  </div>
                  <div className="text-sm text-gray-300">성공</div>
                </div>
                <div className="bg-red-500/20 rounded-lg p-4 border border-red-500/30">
                  <div className="text-2xl font-bold text-red-400">
                    {results.filter(r => !r.validation.isValid).length}
                  </div>
                  <div className="text-sm text-gray-300">실패</div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-4 border border-yellow-500/30">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round(results.reduce((sum, r) => sum + r.parsed.confidence, 0) / results.length)}%
                  </div>
                  <div className="text-sm text-gray-300">평균 신뢰도</div>
                </div>
              </div>
            </div>

            {/* Individual Results */}
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {result.validation.isValid ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span className="text-lg font-semibold text-white">
                        전시 #{index + 1}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(result.parsed.confidence)}`}>
                      <Zap className="w-4 h-4 mr-1" />
                      신뢰도 {result.parsed.confidence}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(result.sql)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      SQL
                    </button>
                  </div>
                </div>

                {/* Parsed Data Preview */}
                {showPreview && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-white mb-3">파싱된 데이터</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">전시명</label>
                          <p className="text-white font-medium">
                            {result.parsed.title || '추출 실패'}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">장소</label>
                          <p className="text-white">
                            {result.parsed.venue_name || '추출 실패'}, {result.parsed.venue_city || ''}
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">기간</label>
                          <p className="text-white">
                            {result.parsed.start_date && result.parsed.end_date 
                              ? `${result.parsed.start_date} ~ ${result.parsed.end_date}`
                              : '추출 실패'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-sm">입장료</label>
                          <p className="text-white">
                            {result.parsed.admission_fee !== undefined
                              ? result.parsed.admission_fee === 0
                                ? '무료'
                                : `${result.parsed.admission_fee.toLocaleString()}원`
                              : '정보 없음'
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">상태</label>
                          <p className="text-white capitalize">{result.parsed.status}</p>
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm">태그</label>
                          <div className="flex flex-wrap gap-1">
                            {result.parsed.tags?.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300">
                                {tag}
                              </span>
                            )) || <span className="text-gray-400 text-sm">없음</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {!result.validation.isValid && result.validation.errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-red-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      검증 오류
                    </h4>
                    <ul className="space-y-1">
                      {result.validation.errors.map((error, errorIndex) => (
                        <li key={errorIndex} className="text-red-300 text-sm">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Parsing Errors */}
                {result.parsed.parsing_errors.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-yellow-400 mb-2">파싱 경고</h4>
                    <ul className="space-y-1">
                      {result.parsed.parsing_errors.map((error, errorIndex) => (
                        <li key={errorIndex} className="text-yellow-300 text-sm">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Original Text */}
                <details className="mt-4">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">
                    원본 텍스트 보기
                  </summary>
                  <div className="mt-2 p-4 bg-black/20 rounded-lg">
                    <pre className="text-gray-300 text-sm whitespace-pre-wrap">
                      {result.original}
                    </pre>
                  </div>
                </details>

                {/* Generated SQL */}
                <details className="mt-4">
                  <summary className="text-gray-400 cursor-pointer hover:text-white">
                    생성된 SQL 보기
                  </summary>
                  <div className="mt-2 p-4 bg-black/20 rounded-lg relative">
                    <pre className="text-green-300 text-sm whitespace-pre-wrap overflow-x-auto">
                      {result.sql}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(result.sql)}
                      className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}