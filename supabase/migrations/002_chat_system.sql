-- 간단한 채팅 시스템
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id uuid NOT NULL REFERENCES auth.users(id),
  participant2_id uuid NOT NULL REFERENCES auth.users(id),
  last_message_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- RLS 정책
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 대화 참여자만 볼 수 있음
CREATE POLICY "Users can view their conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = participant1_id OR auth.uid() = participant2_id);

CREATE POLICY "Users can view messages in their conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
    )
  );

-- 메시지 전송
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (auth.uid() = participant1_id OR auth.uid() = participant2_id)
    )
  );

-- 인덱스
CREATE INDEX idx_chat_conversations_participants ON chat_conversations(participant1_id, participant2_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);