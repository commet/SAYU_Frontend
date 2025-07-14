import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number; // in seconds, default 180 (3 minutes)
  className?: string;
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  maxDuration = 180,
  className 
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const playAudio = () => {
    if (audioRef.current && audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center gap-4">
        {!isRecording && !audioUrl && (
          <Button
            onClick={startRecording}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            녹음 시작
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={stopRecording}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <Square className="h-4 w-4" />
              녹음 중지
            </Button>
            {!isPaused ? (
              <Button
                onClick={pauseRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                일시정지
              </Button>
            ) : (
              <Button
                onClick={resumeRecording}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                재개
              </Button>
            )}
          </>
        )}

        {audioUrl && !isRecording && (
          <>
            <Button
              onClick={playAudio}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? '일시정지' : '재생'}
            </Button>
            <Button
              onClick={resetRecording}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              다시 녹음
            </Button>
          </>
        )}

        <span className="text-sm text-muted-foreground">
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </span>
      </div>

      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-muted-foreground">녹음 중...</span>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}