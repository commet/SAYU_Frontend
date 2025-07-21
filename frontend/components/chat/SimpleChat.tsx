'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleChatProps {
  recipientId: string;
  recipientName: string;
  currentUserId: string;
}

export function SimpleChat({ recipientId, recipientName, currentUserId }: SimpleChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  // 대화 ID 생성 (일관성을 위해 정렬)
  const conversationId = [currentUserId, recipientId].sort().join('-');

  useEffect(() => {
    fetchMessages();
    
    // 실시간 구독
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      // 먼저 대화 생성/확인
      const { data: conversation } = await supabase
        .from('chat_conversations')
        .select()
        .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
        .or(`participant1_id.eq.${recipientId},participant2_id.eq.${recipientId}`)
        .single();

      if (!conversation) {
        // 대화 생성
        await supabase
          .from('chat_conversations')
          .insert({
            participant1_id: currentUserId < recipientId ? currentUserId : recipientId,
            participant2_id: currentUserId < recipientId ? recipientId : currentUserId
          });
      }

      // 메시지 가져오기
      const { data: messages } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversation?.id || conversationId)
        .order('created_at', { ascending: true });

      setMessages(messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          message: newMessage.trim()
        });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Card className="h-[500px] flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        <h3 className="font-semibold">{recipientName}님과의 대화</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground">메시지 불러오는 중...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground">
            첫 메시지를 보내보세요!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.sender_id === currentUserId ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[70%] rounded-lg px-4 py-2",
                  msg.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
                )}
              >
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}