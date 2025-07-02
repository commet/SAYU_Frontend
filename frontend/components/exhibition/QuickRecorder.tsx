'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  Type, 
  Heart, 
  X, 
  Check,
  MapPin,
  Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Exhibition } from '@/lib/exhibitions/exhibition-detector';
import { QuickNote } from '@/lib/exhibitions/ai-completion';
import toast from 'react-hot-toast';

interface QuickRecorderProps {
  exhibition: Exhibition;
  onNoteSaved: (note: QuickNote) => void;
}

export default function QuickRecorder({ exhibition, onNoteSaved }: QuickRecorderProps) {
  const { language } = useLanguage();
  const [activeMode, setActiveMode] = useState<'text' | 'voice' | 'photo' | 'emotion' | null>(null);
  const [textNote, setTextNote] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const emotions = [
    { id: 'moved', emoji: '🥺', label: { ko: '감동적', en: 'Moved' } },
    { id: 'inspired', emoji: '✨', label: { ko: '영감받은', en: 'Inspired' } },
    { id: 'peaceful', emoji: '😌', label: { ko: '평화로운', en: 'Peaceful' } },
    { id: 'curious', emoji: '🤔', label: { ko: '궁금한', en: 'Curious' } },
    { id: 'overwhelmed', emoji: '😮', label: { ko: '압도된', en: 'Overwhelmed' } },
    { id: 'joyful', emoji: '😊', label: { ko: '즐거운', en: 'Joyful' } },
    { id: 'contemplative', emoji: '🧘', label: { ko: '사색적', en: 'Contemplative' } },
    { id: 'confused', emoji: '😕', label: { ko: '혼란스러운', en: 'Confused' } }
  ];
  
  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);
  
  const handleTextSave = () => {
    if (!textNote.trim()) return;
    
    const note: QuickNote = {
      id: Date.now().toString(),
      type: 'text',
      content: textNote,
      metadata: {
        timestamp: new Date()
      }
    };
    
    onNoteSaved(note);
    setTextNote('');
    setActiveMode(null);
    toast.success(language === 'ko' ? '메모 저장됨' : 'Note saved');
  };
  
  const handleEmotionSelect = (emotionId: string) => {
    const emotion = emotions.find(e => e.id === emotionId);
    if (!emotion) return;
    
    const note: QuickNote = {
      id: Date.now().toString(),
      type: 'emotion',
      content: emotion.label[language],
      metadata: {
        timestamp: new Date(),
        emotion: emotionId
      }
    };
    
    onNoteSaved(note);
    setSelectedEmotion(null);
    setActiveMode(null);
    toast.success(language === 'ko' ? '감정 기록됨' : 'Emotion recorded');
  };
  
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        saveVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error(language === 'ko' ? '녹음 시작 실패' : 'Failed to start recording');
    }
  };
  
  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const saveVoiceNote = async (audioBlob: Blob) => {
    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const note: QuickNote = {
        id: Date.now().toString(),
        type: 'voice',
        content: reader.result as string,
        metadata: {
          timestamp: new Date()
        }
      };
      
      onNoteSaved(note);
      setActiveMode(null);
      toast.success(language === 'ko' ? '음성 메모 저장됨' : 'Voice note saved');
    };
    reader.readAsDataURL(audioBlob);
  };
  
  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const note: QuickNote = {
        id: Date.now().toString(),
        type: 'photo',
        content: reader.result as string,
        metadata: {
          timestamp: new Date()
        }
      };
      
      onNoteSaved(note);
      setActiveMode(null);
      toast.success(language === 'ko' ? '사진 저장됨' : 'Photo saved');
    };
    reader.readAsDataURL(file);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="quick-recorder">
      <Card className="p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium">
              {exhibition.gallery.name}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {language === 'ko' ? '빠른 기록' : 'Quick Record'}
          </span>
        </div>
        
        {/* Recording buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <Button
            variant={activeMode === 'text' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMode(activeMode === 'text' ? null : 'text')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Type className="w-5 h-5" />
            <span className="text-xs">
              {language === 'ko' ? '메모' : 'Note'}
            </span>
          </Button>
          
          <Button
            variant={activeMode === 'voice' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMode(activeMode === 'voice' ? null : 'voice')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Mic className="w-5 h-5" />
            <span className="text-xs">
              {language === 'ko' ? '음성' : 'Voice'}
            </span>
          </Button>
          
          <Button
            variant={activeMode === 'photo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMode(activeMode === 'photo' ? null : 'photo')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">
              {language === 'ko' ? '사진' : 'Photo'}
            </span>
          </Button>
          
          <Button
            variant={activeMode === 'emotion' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveMode(activeMode === 'emotion' ? null : 'emotion')}
            className="flex flex-col items-center gap-1 h-auto py-3"
          >
            <Heart className="w-5 h-5" />
            <span className="text-xs">
              {language === 'ko' ? '감정' : 'Mood'}
            </span>
          </Button>
        </div>
        
        {/* Active mode interface */}
        <AnimatePresence mode="wait">
          {activeMode === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <textarea
                value={textNote}
                onChange={(e) => setTextNote(e.target.value)}
                placeholder={language === 'ko' ? '짧은 메모를 남겨주세요...' : 'Leave a quick note...'}
                className="w-full p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                maxLength={200}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {textNote.length}/200
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setActiveMode(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={handleTextSave} disabled={!textNote.trim()}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeMode === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-center space-y-4"
            >
              {!isRecording ? (
                <Button
                  size="lg"
                  onClick={startVoiceRecording}
                  className="w-full"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {language === 'ko' ? '녹음 시작' : 'Start Recording'}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-mono">{formatTime(recordingTime)}</div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm">
                      {language === 'ko' ? '녹음 중...' : 'Recording...'}
                    </span>
                  </div>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={stopVoiceRecording}
                    className="w-full"
                  >
                    {language === 'ko' ? '녹음 종료' : 'Stop Recording'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}
          
          {activeMode === 'photo' && (
            <motion.div
              key="photo"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                {language === 'ko' ? '사진 촬영/선택' : 'Take/Select Photo'}
              </Button>
            </motion.div>
          )}
          
          {activeMode === 'emotion' && (
            <motion.div
              key="emotion"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-4 gap-2"
            >
              {emotions.map((emotion) => (
                <Button
                  key={emotion.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleEmotionSelect(emotion.id)}
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <span className="text-2xl">{emotion.emoji}</span>
                  <span className="text-xs">
                    {emotion.label[language]}
                  </span>
                </Button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}