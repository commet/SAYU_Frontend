'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  MessageSquare,
  MousePointer2,
  Eye,
  Mic,
  Send,
  Minimize2,
  Maximize2,
  UserPlus,
  UserMinus,
  Volume2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PersonalityType } from '@/shared/SAYUTypeDefinitions';
import { APT_TO_ART_MOVEMENT } from '@/types/art-persona-matching';
import { ART_MOVEMENT_PROFILES } from '@/lib/art-movement-profiles';
import { io, Socket } from 'socket.io-client';

interface Participant {
  userId: string;
  userName: string;
  aptType: PersonalityType;
  cursorPosition: { x: number; y: number };
  currentArtwork: string | null;
}

interface GalleryNote {
  noteId: string;
  userId: string;
  artworkId: string;
  note: string;
  timestamp: Date;
}

interface Artwork {
  id: string;
  title: string;
  artist: string;
  image: string;
  year?: string;
}

interface RealtimeGalleryExplorerProps {
  galleryId: string;
  userId: string;
  userName: string;
  userAptType: PersonalityType;
  artworks: Artwork[];
}

export function RealtimeGalleryExplorer({
  galleryId,
  userId,
  userName,
  userAptType,
  artworks
}: RealtimeGalleryExplorerProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [notes, setNotes] = useState<GalleryNote[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [showParticipants, setShowParticipants] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const galleryRef = useRef<HTMLDivElement>(null);
  const cursorTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Socket 연결 초기화
  useEffect(() => {
    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      withCredentials: true
    });

    socketInstance.on('connect', () => {
      console.log('Connected to gallery session');
      // 갤러리 참여
      socketInstance.emit('join-gallery', {
        userId,
        galleryId,
        aptType: userAptType,
        userName
      });
    });

    // 세션 상태 수신
    socketInstance.on('session-state', (data) => {
      setSessionId(data.sessionId);
      const newParticipants = new Map<string, Participant>();
      data.participants.forEach((p: Participant) => {
        if (p.userId !== userId) {
          newParticipants.set(p.userId, p);
        }
      });
      setParticipants(newParticipants);
    });

    // 참가자 참여
    socketInstance.on('participant-joined', (data) => {
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.set(data.userId, {
          ...data,
          cursorPosition: { x: 0, y: 0 },
          currentArtwork: null
        });
        return updated;
      });
    });

    // 참가자 나감
    socketInstance.on('participant-left', (data) => {
      setParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    });

    // 커서 업데이트
    socketInstance.on('cursor-update', (data) => {
      setParticipants(prev => {
        const updated = new Map(prev);
        const participant = updated.get(data.userId);
        if (participant) {
          participant.cursorPosition = data.position;
        }
        return updated;
      });
    });

    // 작품 포커스
    socketInstance.on('participant-focus', (data) => {
      setParticipants(prev => {
        const updated = new Map(prev);
        const participant = updated.get(data.userId);
        if (participant) {
          participant.currentArtwork = data.artworkId;
        }
        return updated;
      });
    });

    // 새 노트
    socketInstance.on('new-note', (data) => {
      setNotes(prev => [...prev, {
        ...data,
        timestamp: new Date(data.timestamp)
      }]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave-gallery');
      socketInstance.disconnect();
    };
  }, [galleryId, userId, userName, userAptType]);

  // 마우스 움직임 추적
  useEffect(() => {
    if (!socket || !galleryRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = galleryRef.current!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      socket.emit('cursor-move', { x, y });
    };

    galleryRef.current.addEventListener('mousemove', handleMouseMove);

    return () => {
      galleryRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [socket]);

  // 작품 선택
  const handleArtworkSelect = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    if (socket) {
      socket.emit('artwork-focus', {
        artworkId: artwork.id,
        artworkData: artwork
      });
    }
  };

  // 노트 전송
  const sendNote = () => {
    if (!currentNote.trim() || !selectedArtwork || !socket) return;

    socket.emit('share-note', {
      artworkId: selectedArtwork.id,
      note: currentNote
    });

    setCurrentNote('');
  };

  // 참가자별 커서 렌더링
  const renderCursors = () => {
    return Array.from(participants.entries()).map(([participantId, participant]) => {
      const movement = APT_TO_ART_MOVEMENT[participant.aptType];
      const profile = ART_MOVEMENT_PROFILES[movement];
      
      return (
        <motion.div
          key={participantId}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${participant.cursorPosition.x}%`,
            top: `${participant.cursorPosition.y}%`
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          <div className="relative">
            <MousePointer2 
              className="w-5 h-5 -rotate-12"
              style={{ color: profile.colorPalette[0] }}
            />
            <div 
              className="absolute -bottom-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: profile.colorPalette[0] }}
            >
              {participant.userName}
            </div>
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto">
      {/* 메인 갤러리 영역 */}
      <div 
        ref={galleryRef}
        className="relative bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {/* 작품 그리드 */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6">
          {artworks.map((artwork) => {
            const focusedBy = Array.from(participants.entries())
              .filter(([_, p]) => p.currentArtwork === artwork.id)
              .map(([_, p]) => p);
            
            return (
              <motion.div
                key={artwork.id}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "relative cursor-pointer rounded-lg overflow-hidden",
                  selectedArtwork?.id === artwork.id && "ring-2 ring-primary"
                )}
                onClick={() => handleArtworkSelect(artwork)}
              >
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-32 object-cover"
                />
                
                {/* 다른 참가자가 보고 있는 작품 표시 */}
                {focusedBy.length > 0 && (
                  <div className="absolute top-2 right-2 flex -space-x-2">
                    {focusedBy.slice(0, 3).map((p, i) => {
                      const movement = APT_TO_ART_MOVEMENT[p.aptType];
                      const profile = ART_MOVEMENT_PROFILES[movement];
                      return (
                        <div
                          key={p.userId}
                          className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs"
                          style={{ backgroundColor: profile.colorPalette[0] }}
                        >
                          <Eye className="w-3 h-3 text-white" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {/* 커서 오버레이 */}
        <AnimatePresence>
          {renderCursors()}
        </AnimatePresence>
      </div>

      {/* 참가자 패널 */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed right-4 top-24 w-72"
          >
            <Card className="p-4 glass-panel">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  함께 보는 중 ({participants.size + 1})
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowParticipants(false)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {/* 본인 */}
                <div className="flex items-center gap-2 p-2 bg-primary/10 rounded">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ 
                      backgroundColor: ART_MOVEMENT_PROFILES[APT_TO_ART_MOVEMENT[userAptType]].colorPalette[0] 
                    }}
                  >
                    나
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">
                      {ART_MOVEMENT_PROFILES[APT_TO_ART_MOVEMENT[userAptType]].koreanName}
                    </p>
                  </div>
                </div>
                
                {/* 다른 참가자들 */}
                {Array.from(participants.values()).map((participant) => {
                  const movement = APT_TO_ART_MOVEMENT[participant.aptType];
                  const profile = ART_MOVEMENT_PROFILES[movement];
                  
                  return (
                    <div key={participant.userId} className="flex items-center gap-2 p-2">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: profile.colorPalette[0] }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.userName}</p>
                        <p className="text-xs text-muted-foreground">{profile.koreanName}</p>
                      </div>
                      {participant.currentArtwork && (
                        <Eye className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 노트 패널 */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96"
          >
            <Card className="p-4 glass-panel">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  공유 노트
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(false)}
                >
                  <Minimize2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* 노트 목록 */}
              <div className="max-h-48 overflow-y-auto mb-3 space-y-2">
                {notes.map((note) => {
                  const participant = participants.get(note.userId);
                  const artwork = artworks.find(a => a.id === note.artworkId);
                  
                  return (
                    <div key={note.noteId} className="p-2 bg-secondary/20 rounded">
                      <div className="flex items-start gap-2 mb-1">
                        <p className="text-sm font-medium">
                          {note.userId === userId ? '나' : participant?.userName || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {artwork?.title}
                        </p>
                      </div>
                      <p className="text-sm">{note.note}</p>
                    </div>
                  );
                })}
              </div>
              
              {/* 노트 입력 */}
              {selectedArtwork && (
                <div className="space-y-2 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {selectedArtwork.title}에 대한 노트
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendNote()}
                      placeholder="생각을 공유하세요..."
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsRecording(!isRecording)}
                      className={cn(isRecording && "text-red-500")}
                    >
                      <Mic className="w-4 h-4" />
                    </Button>
                    <Button onClick={sendNote} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 최소화된 버튼들 */}
      {!showParticipants && (
        <Button
          className="fixed right-4 top-24"
          size="sm"
          onClick={() => setShowParticipants(true)}
        >
          <Users className="w-4 h-4 mr-1" />
          {participants.size + 1}
        </Button>
      )}
      
      {!showNotes && (
        <Button
          className="fixed bottom-4 right-4"
          size="sm"
          onClick={() => setShowNotes(true)}
        >
          <MessageSquare className="w-4 h-4 mr-1" />
          노트
        </Button>
      )}
    </div>
  );
}