const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const { getSupabaseAdmin } = require('../config/supabase');
const { logger } = require('../config/logger');
const socketService = require('../services/socketService');

router.use(authMiddleware);

// Get chat messages for a room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Check if user has access to this room
    const hasAccess = await checkRoomAccess(supabase, userId, roomId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles!user_id (
          username,
          profile_image,
          sayu_type
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: messages.length === limit
      }
    });
  } catch (error) {
    logger.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create or join a chat room
router.post('/rooms', async (req, res) => {
  try {
    const { roomType, roomName, participants = [] } = req.body;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('chat_rooms')
      .insert({
        room_type: roomType,
        room_name: roomName,
        created_by: userId,
        created_at: new Date()
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Add creator and participants
    const allParticipants = [userId, ...participants];
    const participantInserts = allParticipants.map(participantId => ({
      room_id: room.id,
      user_id: participantId,
      joined_at: new Date()
    }));

    const { error: participantError } = await supabase
      .from('chat_participants')
      .insert(participantInserts);

    if (participantError) throw participantError;

    res.status(201).json(room);
  } catch (error) {
    logger.error('Error creating chat room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get user's chat rooms
router.get('/rooms', async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    const { data: rooms, error } = await supabase
      .from('chat_participants')
      .select(`
        chat_rooms (
          id,
          room_type,
          room_name,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    // Get last message for each room
    const roomsWithLastMessage = await Promise.all(
      rooms.map(async (item) => {
        const room = item.chat_rooms;
        const { data: lastMessage } = await supabase
          .from('chat_messages')
          .select(`
            message,
            message_type,
            created_at,
            profiles!user_id (username)
          `)
          .eq('room_id', room.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...room,
          lastMessage: lastMessage?.[0] || null,
          onlineUsers: socketService.getUsersInRoom(room.id).size
        };
      })
    );

    res.json({ rooms: roomsWithLastMessage });
  } catch (error) {
    logger.error('Error fetching chat rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get online users in a room
router.get('/rooms/:roomId/users', async (req, res) => {
  try {
    const { roomId } = req.params;
    const userId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Check room access
    const hasAccess = await checkRoomAccess(supabase, userId, roomId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied to this room' });
    }

    // Get all participants
    const { data: participants, error } = await supabase
      .from('chat_participants')
      .select(`
        profiles!user_id (
          id,
          username,
          profile_image,
          sayu_type
        )
      `)
      .eq('room_id', roomId);

    if (error) throw error;

    // Add online status
    const usersWithStatus = participants.map(p => ({
      ...p.profiles,
      isOnline: socketService.isUserOnline(p.profiles.id)
    }));

    res.json({ users: usersWithStatus });
  } catch (error) {
    logger.error('Error fetching room users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get exhibition room info
router.get('/exhibitions/:exhibitionId/room', async (req, res) => {
  try {
    const { exhibitionId } = req.params;
    const roomId = `exhibition:${exhibitionId}`;
    
    const onlineUsers = socketService.getUsersInRoom(roomId);
    const connectedUsers = socketService.getConnectedUsers();
    
    res.json({
      roomId,
      onlineCount: onlineUsers.size,
      totalOnline: connectedUsers.length
    });
  } catch (error) {
    logger.error('Error fetching exhibition room info:', error);
    res.status(500).json({ error: 'Failed to fetch room info' });
  }
});

// Send a real-time notification
router.post('/notifications', async (req, res) => {
  try {
    const { recipientId, type, title, message, data = {} } = req.body;
    const senderId = req.user?.id || req.userId;
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return res.status(503).json({ error: 'Database service unavailable' });
    }

    // Save notification to database
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        sender_id: senderId,
        type,
        title,
        message,
        data,
        created_at: new Date()
      })
      .select(`
        *,
        sender:profiles!sender_id (
          username,
          profile_image
        )
      `)
      .single();

    if (error) throw error;

    // Send real-time notification
    socketService.sendNotification(recipientId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      sender: notification.sender,
      timestamp: notification.created_at,
      isRead: false
    });

    res.status(201).json(notification);
  } catch (error) {
    logger.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Helper function to check room access
async function checkRoomAccess(supabase, userId, roomId) {
  if (roomId.startsWith('exhibition:')) {
    return true; // Exhibition rooms are public
  }

  const { data, error } = await supabase
    .from('chat_participants')
    .select('user_id')
    .eq('room_id', roomId)
    .eq('user_id', userId)
    .single();

  return !error && data;
}

module.exports = router;