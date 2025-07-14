'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Users, Circle } from 'lucide-react';
import { useSocket } from '@/lib/socket';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

interface Message {
  id: string;
  userId: string;
  username: string;
  profileImage?: string;
  sayuType?: string;
  message: string;
  messageType: string;
  timestamp: string;
  roomId: string;
}

interface User {
  id: string;
  username: string;
  profileImage?: string;
  sayuType?: string;
  isOnline: boolean;
}

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  currentUserId: string;
  onClose?: () => void;
}

export function ChatRoom({ roomId, roomName, currentUserId, onClose }: ChatRoomProps) {
  const { language } = useLanguage();
  const {
    joinRoom,
    leaveRoom,
    sendMessage,
    startTyping,
    stopTyping,
    on,
    off,
    isConnected
  } = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isConnected() && roomId) {
      joinRoom(roomId);
      loadMessages();
      loadUsers();
    }

    return () => {
      if (roomId) {
        leaveRoom(roomId);
      }
    };
  }, [roomId, isConnected]);

  useEffect(() => {
    // Socket event listeners
    on('new_message', handleNewMessage);
    on('user_joined', handleUserJoined);
    on('user_left', handleUserLeft);
    on('user_typing', handleUserTyping);

    return () => {
      off('new_message', handleNewMessage);
      off('user_joined', handleUserJoined);
      off('user_left', handleUserLeft);
      off('user_typing', handleUserTyping);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/rooms/${roomId}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleNewMessage = (message: Message) => {
    if (message.roomId === roomId) {
      setMessages(prev => [...prev, message]);
      // Remove typing indicator for this user
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.userId);
        return newSet;
      });
    }
  };

  const handleUserJoined = (data: any) => {
    if (data.roomId === roomId) {
      loadUsers(); // Reload users list
    }
  };

  const handleUserLeft = (data: any) => {
    if (data.roomId === roomId) {
      loadUsers(); // Reload users list
    }
  };

  const handleUserTyping = (data: any) => {
    if (data.roomId === roomId && data.userId !== currentUserId) {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.username);
        } else {
          newSet.delete(data.username);
        }
        return newSet;
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && isConnected()) {
      sendMessage(roomId, newMessage.trim());
      setNewMessage('');
      stopTyping(roomId);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (value.trim()) {
      startTyping(roomId);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(roomId);
      }, 1000);
    } else {
      stopTyping(roomId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return format(date, 'HH:mm', { locale: language === 'ko' ? ko : enUS });
  };

  const getSayuTypeColor = (sayuType?: string) => {
    if (!sayuType) return 'bg-gray-100';
    
    const colors: Record<string, string> = {
      'LAEF': 'bg-purple-100 text-purple-800',
      'LAEC': 'bg-pink-100 text-pink-800',
      'LAMF': 'bg-blue-100 text-blue-800',
      'LAMC': 'bg-green-100 text-green-800',
      'LREF': 'bg-orange-100 text-orange-800',
      'LREC': 'bg-red-100 text-red-800',
      'LRMF': 'bg-teal-100 text-teal-800',
      'LRMC': 'bg-indigo-100 text-indigo-800',
      'SAEF': 'bg-yellow-100 text-yellow-800',
      'SAEC': 'bg-cyan-100 text-cyan-800',
      'SAMF': 'bg-lime-100 text-lime-800',
      'SAMC': 'bg-emerald-100 text-emerald-800',
      'SREF': 'bg-rose-100 text-rose-800',
      'SREC': 'bg-violet-100 text-violet-800',
      'SRMF': 'bg-amber-100 text-amber-800',
      'SRMC': 'bg-slate-100 text-slate-800'
    };
    
    return colors[sayuType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">{roomName}</h3>
          <Badge variant="secondary" className="gap-1">
            <Users className="w-3 h-3" />
            {users.filter(u => u.isOnline).length}
          </Badge>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 mb-4 ${
                  message.userId === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.userId !== currentUserId && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.profileImage} />
                    <AvatarFallback>{message.username[0]}</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-xs ${
                  message.userId === currentUserId ? 'text-right' : 'text-left'
                }`}>
                  {message.userId !== currentUserId && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{message.username}</span>
                      {message.sayuType && (
                        <Badge className={`text-xs ${getSayuTypeColor(message.sayuType)}`}>
                          {message.sayuType}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className={`rounded-lg p-3 ${
                    message.userId === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatMessageTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex gap-1">
                  <Circle className="w-2 h-2 animate-bounce" />
                  <Circle className="w-2 h-2 animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <Circle className="w-2 h-2 animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                {Array.from(typingUsers).join(', ')} {
                  language === 'ko' ? '입력 중...' : 'typing...'
                }
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={language === 'ko' ? '메시지를 입력하세요...' : 'Type a message...'}
            disabled={!isConnected()}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isConnected()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}