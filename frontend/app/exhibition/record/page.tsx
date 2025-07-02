'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Search, QrCode, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { 
  Exhibition, 
  ExhibitionDetector 
} from '@/lib/exhibitions/exhibition-detector';
import {
  ReflectionTemplateService,
  ReflectionTemplate,
  FilledTemplate
} from '@/lib/exhibitions/reflection-templates';
import {
  AICompletionService,
  QuickNote,
  CompletionContext
} from '@/lib/exhibitions/ai-completion';
import QuickRecorder from '@/components/exhibition/QuickRecorder';
import ReflectionCard from '@/components/exhibition/ReflectionCard';
import toast from 'react-hot-toast';

type RecordingStep = 'select-exhibition' | 'quick-record' | 'write-reflection' | 'design-share';

export default function ExhibitionRecordPage() {
  const { language } = useLanguage();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<RecordingStep>('select-exhibition');
  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [nearbyExhibitions, setNearbyExhibitions] = useState<Exhibition[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Exhibition[]>([]);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReflectionTemplate | null>(null);
  const [filledTemplate, setFilledTemplate] = useState<FilledTemplate | null>(null);
  const [userResponses, setUserResponses] = useState<Record<string, string>>({});
  
  const detector = new ExhibitionDetector();
  const templateService = new ReflectionTemplateService();
  const aiService = new AICompletionService();
  
  // Detect nearby exhibitions on mount
  useEffect(() => {
    detectNearbyExhibitions();
  }, []);
  
  const detectNearbyExhibitions = async () => {
    setIsDetectingLocation(true);
    try {
      const exhibitions = await detector.detectByLocation();
      setNearbyExhibitions(exhibitions);
      if (exhibitions.length > 0) {
        toast.success(
          language === 'ko' 
            ? `${exhibitions.length}개의 전시 발견` 
            : `Found ${exhibitions.length} exhibitions nearby`
        );
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      toast.error(
        language === 'ko'
          ? '위치 감지 실패. 직접 검색해주세요.'
          : 'Location detection failed. Please search manually.'
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const results = await detector.searchExhibitions(searchQuery);
      setSearchResults(results);
      if (results.length === 0) {
        toast(
          language === 'ko'
            ? '검색 결과가 없습니다'
            : 'No results found',
          { icon: '🔍' }
        );
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error(
        language === 'ko'
          ? '검색 실패'
          : 'Search failed'
      );
    }
  };
  
  const selectExhibition = (exhibition: Exhibition) => {
    setSelectedExhibition(exhibition);
    setCurrentStep('quick-record');
  };
  
  const handleQuickNoteSaved = (note: QuickNote) => {
    setQuickNotes([...quickNotes, note]);
  };
  
  const startWritingReflection = () => {
    if (!selectedExhibition) return;
    
    const templates = templateService.getTemplates();
    setSelectedTemplate(templates[0]); // Default to overall template
    setCurrentStep('write-reflection');
  };
  
  const handleTemplateSelect = (template: ReflectionTemplate) => {
    if (!selectedExhibition) return;
    
    setSelectedTemplate(template);
    const filled = templateService.fillTemplate(
      template,
      selectedExhibition
    );
    setFilledTemplate(filled as FilledTemplate);
    setUserResponses(filled.responses);
  };
  
  const handleResponseChange = (promptId: string, value: string) => {
    setUserResponses({
      ...userResponses,
      [promptId]: value
    });
  };
  
  const getAISuggestions = async (promptId: string) => {
    if (!selectedTemplate || !filledTemplate || !selectedExhibition) return;
    
    const prompt = selectedTemplate.prompts.find(p => p.id === promptId);
    if (!prompt) return;
    
    const context: CompletionContext = {
      exhibition: selectedExhibition,
      template: {
        ...filledTemplate,
        responses: userResponses
      },
      quickNotes,
      language
    };
    
    try {
      const suggestions = await aiService.getSuggestions(
        prompt,
        userResponses[promptId] || '',
        context
      );
      
      // Show suggestions to user (implement UI for this)
      console.log('AI Suggestions:', suggestions);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  };
  
  const completeReflection = () => {
    if (!filledTemplate || !selectedExhibition || !selectedTemplate) return;
    
    const completed: FilledTemplate = {
      ...filledTemplate,
      responses: userResponses,
      metadata: {
        ...filledTemplate.metadata,
        photos: quickNotes.filter(n => n.type === 'photo').map(n => n.content),
        voiceNotes: quickNotes.filter(n => n.type === 'voice').map(n => n.content),
        emotionTags: quickNotes.filter(n => n.type === 'emotion').map(n => n.metadata?.emotion || '')
      }
    };
    
    setFilledTemplate(completed);
    setCurrentStep('design-share');
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 'select-exhibition':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-2xl font-bold text-center">
              {language === 'ko' ? '전시 선택' : 'Select Exhibition'}
            </h1>
            
            {/* Location-based exhibitions */}
            {isDetectingLocation ? (
              <Card className="p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse text-purple-600" />
                <p>{language === 'ko' ? '주변 전시 찾는 중...' : 'Finding nearby exhibitions...'}</p>
              </Card>
            ) : nearbyExhibitions.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  {language === 'ko' ? '주변 전시' : 'Nearby Exhibitions'}
                </h2>
                {nearbyExhibitions.map((exhibition) => (
                  <Card
                    key={exhibition.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => selectExhibition(exhibition)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">
                          {language === 'ko' && exhibition.titleKo 
                            ? exhibition.titleKo 
                            : exhibition.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {language === 'ko' && exhibition.gallery.nameKo
                            ? exhibition.gallery.nameKo
                            : exhibition.gallery.name}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : null}
            
            {/* Search */}
            <div className="space-y-3">
              <h2 className="text-lg font-medium flex items-center gap-2">
                <Search className="w-5 h-5 text-purple-600" />
                {language === 'ko' ? '전시 검색' : 'Search Exhibition'}
              </h2>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={
                    language === 'ko' 
                      ? '전시명, 갤러리명, 작가명...' 
                      : 'Exhibition, gallery, artist...'
                  }
                />
                <Button onClick={handleSearch}>
                  {language === 'ko' ? '검색' : 'Search'}
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  {searchResults.map((exhibition) => (
                    <Card
                      key={exhibition.id}
                      className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => selectExhibition(exhibition)}
                    >
                      <h4 className="font-medium text-sm">{exhibition.title}</h4>
                      <p className="text-xs text-gray-600">{exhibition.gallery.name}</p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
        
      case 'quick-record':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('select-exhibition')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {language === 'ko' ? '뒤로' : 'Back'}
              </Button>
              <h2 className="text-lg font-semibold">
                {language === 'ko' ? '전시 관람 중' : 'During Exhibition'}
              </h2>
              <Button
                size="sm"
                onClick={startWritingReflection}
              >
                {language === 'ko' ? '감상 작성' : 'Write Reflection'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {selectedExhibition && (
              <QuickRecorder
                exhibition={selectedExhibition}
                onNoteSaved={handleQuickNoteSaved}
              />
            )}
            
            {/* Quick notes list */}
            {quickNotes.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-600">
                  {language === 'ko' 
                    ? `기록된 메모 (${quickNotes.length}개)` 
                    : `Recorded notes (${quickNotes.length})`}
                </h3>
                <div className="space-y-1">
                  {quickNotes.map((note) => (
                    <div
                      key={note.id}
                      className="text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      {note.type === 'text' && note.content}
                      {note.type === 'emotion' && `${note.metadata?.emotion} - ${note.content}`}
                      {note.type === 'voice' && '🎙️ Voice note'}
                      {note.type === 'photo' && '📷 Photo'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        );
        
      case 'write-reflection':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('quick-record')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {language === 'ko' ? '뒤로' : 'Back'}
              </Button>
              <h2 className="text-lg font-semibold">
                {language === 'ko' ? '감상 작성' : 'Write Reflection'}
              </h2>
              <Button
                size="sm"
                onClick={completeReflection}
                disabled={!selectedTemplate}
              >
                {language === 'ko' ? '완료' : 'Complete'}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {/* Template selection */}
            <div className="grid grid-cols-2 gap-2">
              {templateService.getTemplates().map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate?.id === template.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTemplateSelect(template)}
                  className="flex items-center gap-2"
                >
                  <span className="text-lg">{template.icon}</span>
                  <span className="text-xs">{template.titleKo}</span>
                </Button>
              ))}
            </div>
            
            {/* Template prompts */}
            {selectedTemplate && (
              <div className="space-y-4">
                {selectedTemplate.prompts.map((prompt) => (
                  <div key={prompt.id} className="space-y-2">
                    <label className="text-sm font-medium">
                      {language === 'ko' 
                        ? `${prompt.prefixKo || ''} ${prompt.placeholderKo} ${prompt.suffixKo || ''}`
                        : `${prompt.prefix || ''} ${prompt.placeholder} ${prompt.suffix || ''}`}
                    </label>
                    {prompt.inputType === 'textarea' ? (
                      <textarea
                        value={userResponses[prompt.id] || ''}
                        onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
                        onBlur={() => getAISuggestions(prompt.id)}
                        placeholder={language === 'ko' ? prompt.placeholderKo : prompt.placeholder}
                        className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                        maxLength={prompt.maxLength}
                      />
                    ) : (
                      <input
                        type="text"
                        value={userResponses[prompt.id] || ''}
                        onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
                        placeholder={language === 'ko' ? prompt.placeholderKo : prompt.placeholder}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    )}
                    {prompt.maxLength && (
                      <p className="text-xs text-gray-500 text-right">
                        {userResponses[prompt.id]?.length || 0}/{prompt.maxLength}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
        
      case 'design-share':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep('write-reflection')}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {language === 'ko' ? '뒤로' : 'Back'}
              </Button>
              <h2 className="text-lg font-semibold">
                {language === 'ko' ? '디자인 & 공유' : 'Design & Share'}
              </h2>
              <Button
                size="sm"
                onClick={() => router.push('/profile')}
              >
                {language === 'ko' ? '완료' : 'Done'}
              </Button>
            </div>
            
            {filledTemplate && (
              <ReflectionCard reflection={filledTemplate} />
            )}
          </motion.div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            {['select-exhibition', 'quick-record', 'write-reflection', 'design-share'].map((step, index) => (
              <div
                key={step}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index <= ['select-exhibition', 'quick-record', 'write-reflection', 'design-share'].indexOf(currentStep)
                    ? 'bg-purple-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
        
        {/* Current step content */}
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
}