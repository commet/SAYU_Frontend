-- Add real-time chat and notification features

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_type VARCHAR(50) NOT NULL, -- 'exhibition', 'direct', 'group', 'public'
  room_name VARCHAR(255),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'audio', 'system'
  reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- 'follow', 'like', 'comment', 'message', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Online users table (for tracking active sessions)
CREATE TABLE IF NOT EXISTS online_users (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  socket_id VARCHAR(255) NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'online' -- 'online', 'away', 'busy', 'offline'
);

-- User presence in exhibitions
CREATE TABLE IF NOT EXISTS exhibition_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exhibition_id VARCHAR(255) NOT NULL,
  museum_name VARCHAR(255),
  exhibition_name VARCHAR(255),
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, exhibition_id, entered_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_room_id ON chat_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen ON online_users(last_seen);
CREATE INDEX IF NOT EXISTS idx_exhibition_presence_user_id ON exhibition_presence(user_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_presence_exhibition_id ON exhibition_presence(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_presence_is_active ON exhibition_presence(is_active);

-- Add RLS policies
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE online_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_presence ENABLE ROW LEVEL SECURITY;

-- Chat rooms policies
CREATE POLICY "Users can view rooms they participate in" ON chat_rooms
  FOR SELECT USING (
    id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create rooms" ON chat_rooms
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Chat participants policies
CREATE POLICY "Users can view room participants" ON chat_participants
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join rooms" ON chat_participants
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages in their rooms" ON chat_messages
  FOR SELECT USING (
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their rooms" ON chat_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND 
    room_id IN (
      SELECT room_id FROM chat_participants 
      WHERE user_id = auth.uid()
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
  FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can send notifications" ON notifications
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON notifications
  FOR UPDATE USING (recipient_id = auth.uid());

-- Online users policies
CREATE POLICY "Users can view online status" ON online_users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own status" ON online_users
  FOR ALL USING (user_id = auth.uid());

-- Exhibition presence policies
CREATE POLICY "Users can view exhibition presence" ON exhibition_presence
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own presence" ON exhibition_presence
  FOR ALL USING (user_id = auth.uid());

-- Create functions for automatic updates
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms 
  SET updated_at = NOW() 
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_room_on_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_timestamp();

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE, read_at = NOW() 
  WHERE id = notification_id AND recipient_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications 
    WHERE recipient_id = auth.uid() AND is_read = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old online users
CREATE OR REPLACE FUNCTION cleanup_offline_users()
RETURNS VOID AS $$
BEGIN
  DELETE FROM online_users 
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$ LANGUAGE plpgsql;