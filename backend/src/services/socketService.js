const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getSupabaseAdmin } = require('../config/supabase');
const { logger } = require('../config/logger');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket
    this.userRooms = new Map(); // userId -> Set of rooms
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.use(this.authenticateSocket.bind(this));
    this.io.on('connection', this.handleConnection.bind(this));
    
    logger.info('Socket.IO server initialized');
  }

  async authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const supabase = getSupabaseAdmin();
      
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        return next(new Error('User not found'));
      }

      socket.userId = decoded.userId;
      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  }

  handleConnection(socket) {
    const userId = socket.userId;
    logger.info(`User ${userId} connected`);

    // Store user connection
    this.connectedUsers.set(userId, socket);
    this.userRooms.set(userId, new Set());

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle events
    socket.on('join_room', (roomId) => this.handleJoinRoom(socket, roomId));
    socket.on('leave_room', (roomId) => this.handleLeaveRoom(socket, roomId));
    socket.on('send_message', (data) => this.handleSendMessage(socket, data));
    socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
    socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
    socket.on('exhibition_view', (data) => this.handleExhibitionView(socket, data));
    socket.on('reflection_created', (data) => this.handleReflectionCreated(socket, data));
    
    socket.on('disconnect', () => this.handleDisconnect(socket));

    // Send welcome message
    socket.emit('connected', {
      userId,
      message: 'Successfully connected to SAYU real-time service'
    });
  }

  handleJoinRoom(socket, roomId) {
    const userId = socket.userId;
    
    socket.join(roomId);
    this.userRooms.get(userId).add(roomId);
    
    logger.info(`User ${userId} joined room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_joined', {
      userId,
      username: socket.user.username,
      roomId
    });
  }

  handleLeaveRoom(socket, roomId) {
    const userId = socket.userId;
    
    socket.leave(roomId);
    this.userRooms.get(userId).delete(roomId);
    
    logger.info(`User ${userId} left room ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user_left', {
      userId,
      username: socket.user.username,
      roomId
    });
  }

  async handleSendMessage(socket, data) {
    const { roomId, message, messageType = 'text' } = data;
    const userId = socket.userId;
    
    try {
      // Save message to database
      const supabase = getSupabaseAdmin();
      const { data: savedMessage, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          room_id: roomId,
          message,
          message_type: messageType,
          created_at: new Date()
        })
        .select(`
          *,
          profiles!user_id (
            username,
            profile_image,
            sayu_type
          )
        `)
        .single();

      if (error) throw error;

      // Emit to room
      this.io.to(roomId).emit('new_message', {
        id: savedMessage.id,
        userId: savedMessage.user_id,
        username: savedMessage.profiles.username,
        profileImage: savedMessage.profiles.profile_image,
        sayuType: savedMessage.profiles.sayu_type,
        message: savedMessage.message,
        messageType: savedMessage.message_type,
        timestamp: savedMessage.created_at,
        roomId
      });

      logger.info(`Message sent in room ${roomId} by user ${userId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTypingStart(socket, data) {
    const { roomId } = data;
    const userId = socket.userId;
    
    socket.to(roomId).emit('user_typing', {
      userId,
      username: socket.user.username,
      roomId,
      isTyping: true
    });
  }

  handleTypingStop(socket, data) {
    const { roomId } = data;
    const userId = socket.userId;
    
    socket.to(roomId).emit('user_typing', {
      userId,
      username: socket.user.username,
      roomId,
      isTyping: false
    });
  }

  handleExhibitionView(socket, data) {
    const { exhibitionId, museumName, exhibitionName } = data;
    const userId = socket.userId;
    
    // Join exhibition room
    const roomId = `exhibition:${exhibitionId}`;
    socket.join(roomId);
    
    // Notify others viewing the same exhibition
    socket.to(roomId).emit('exhibition_viewer', {
      userId,
      username: socket.user.username,
      exhibitionId,
      museumName,
      exhibitionName,
      timestamp: new Date()
    });
  }

  handleReflectionCreated(socket, data) {
    const { reflection } = data;
    const userId = socket.userId;
    
    // If reflection is public, broadcast to followers
    if (reflection.is_public) {
      this.broadcastToFollowers(userId, 'new_reflection', {
        userId,
        username: socket.user.username,
        reflection
      });
    }
  }

  async broadcastToFollowers(userId, event, data) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: followers, error } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId);

      if (error) throw error;

      followers.forEach(follow => {
        const followerSocket = this.connectedUsers.get(follow.follower_id);
        if (followerSocket) {
          followerSocket.emit(event, data);
        }
      });
    } catch (error) {
      logger.error('Error broadcasting to followers:', error);
    }
  }

  handleDisconnect(socket) {
    const userId = socket.userId;
    
    // Clean up user data
    this.connectedUsers.delete(userId);
    this.userRooms.delete(userId);
    
    logger.info(`User ${userId} disconnected`);
  }

  // Public methods for external use
  sendNotification(userId, notification) {
    const socket = this.connectedUsers.get(userId);
    if (socket) {
      socket.emit('notification', notification);
    }
  }

  broadcastToRoom(roomId, event, data) {
    if (this.io) {
      this.io.to(roomId).emit(event, data);
    }
  }

  getUsersInRoom(roomId) {
    if (this.io) {
      return this.io.sockets.adapter.rooms.get(roomId) || new Set();
    }
    return new Set();
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();