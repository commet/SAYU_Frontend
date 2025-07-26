const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getSupabaseAdmin } = require('../config/supabase');
const { logger } = require('../config/logger');
const artPulseService = require('./artPulseService');

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
    
    // Art Pulse events
    socket.on('art_pulse_join', (data) => this.handleArtPulseJoin(socket, data));
    socket.on('art_pulse_leave', (data) => this.handleArtPulseLeave(socket, data));
    socket.on('art_pulse_emotion', (data) => this.handleArtPulseEmotion(socket, data));
    socket.on('art_pulse_reflection', (data) => this.handleArtPulseReflection(socket, data));
    socket.on('art_pulse_like', (data) => this.handleArtPulseLike(socket, data));
    socket.on('art_pulse_typing', (data) => this.handleArtPulseTyping(socket, data));
    
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

  // Art Pulse event handlers
  async handleArtPulseJoin(socket, data) {
    const userId = socket.userId;
    const { sessionId } = data;
    
    try {
      const result = await artPulseService.joinSession(userId, sessionId);
      const roomId = `art-pulse:${result.session.id}`;
      
      // Join Art Pulse room
      socket.join(roomId);
      socket.artPulseRoom = roomId;
      
      // Send session data to user
      socket.emit('art_pulse_joined', {
        session: result.session,
        userProfile: result.userProfile,
        participantCount: result.participantCount
      });

      // Broadcast new participant to room
      socket.to(roomId).emit('art_pulse_participant_joined', {
        userId,
        username: socket.user.username,
        sayuType: socket.user.sayu_type,
        participantCount: result.participantCount
      });

      // Send current state
      const emotions = artPulseService.getEmotionDistribution(result.session.id);
      const reflections = artPulseService.getReflections(result.session.id);
      
      socket.emit('art_pulse_state_update', {
        emotions,
        reflections,
        participantCount: result.participantCount
      });

      logger.info(`User ${userId} joined Art Pulse session ${result.session.id}`);
    } catch (error) {
      logger.error('Error joining Art Pulse:', error);
      socket.emit('art_pulse_error', { message: error.message });
    }
  }

  handleArtPulseLeave(socket, data) {
    const userId = socket.userId;
    const roomId = socket.artPulseRoom;
    
    if (roomId) {
      socket.leave(roomId);
      socket.to(roomId).emit('art_pulse_participant_left', {
        userId,
        username: socket.user.username
      });
      socket.artPulseRoom = null;
      logger.info(`User ${userId} left Art Pulse session`);
    }
  }

  async handleArtPulseEmotion(socket, data) {
    const userId = socket.userId;
    const { sessionId, emotion, intensity } = data;
    
    try {
      const distribution = await artPulseService.submitEmotion(userId, sessionId, emotion, intensity);
      const roomId = `art-pulse:${sessionId}`;
      
      // Broadcast emotion update to all participants
      this.io.to(roomId).emit('art_pulse_emotion_update', {
        userId,
        username: socket.user.username,
        emotion,
        intensity,
        distribution,
        timestamp: new Date()
      });

      logger.info(`User ${userId} submitted emotion ${emotion} for session ${sessionId}`);
    } catch (error) {
      logger.error('Error submitting Art Pulse emotion:', error);
      socket.emit('art_pulse_error', { message: error.message });
    }
  }

  async handleArtPulseReflection(socket, data) {
    const userId = socket.userId;
    const { sessionId, reflection, isAnonymous } = data;
    
    try {
      const reflectionData = await artPulseService.submitReflection(userId, sessionId, reflection, isAnonymous);
      const roomId = `art-pulse:${sessionId}`;
      
      // Broadcast new reflection to all participants
      this.io.to(roomId).emit('art_pulse_new_reflection', reflectionData);

      logger.info(`User ${userId} submitted reflection for session ${sessionId}`);
    } catch (error) {
      logger.error('Error submitting Art Pulse reflection:', error);
      socket.emit('art_pulse_error', { message: error.message });
    }
  }

  async handleArtPulseLike(socket, data) {
    const userId = socket.userId;
    const { sessionId, reflectionId } = data;
    
    try {
      const reflection = await artPulseService.likeReflection(userId, sessionId, reflectionId);
      const roomId = `art-pulse:${sessionId}`;
      
      // Broadcast like update to all participants
      this.io.to(roomId).emit('art_pulse_reflection_liked', {
        reflectionId,
        likes: reflection.likes,
        likedBy: reflection.likedBy,
        userId
      });

      logger.info(`User ${userId} liked reflection ${reflectionId}`);
    } catch (error) {
      logger.error('Error liking Art Pulse reflection:', error);
      socket.emit('art_pulse_error', { message: error.message });
    }
  }

  handleArtPulseTyping(socket, data) {
    const userId = socket.userId;
    const { sessionId, isTyping } = data;
    const roomId = `art-pulse:${sessionId}`;
    
    socket.to(roomId).emit('art_pulse_user_typing', {
      userId,
      username: socket.user.username,
      isTyping,
      timestamp: new Date()
    });
  }

  // Broadcast Art Pulse events
  broadcastArtPulsePhaseChange(sessionId, phase) {
    const roomId = `art-pulse:${sessionId}`;
    this.io.to(roomId).emit('art_pulse_phase_change', {
      sessionId,
      phase,
      timestamp: new Date()
    });
  }

  broadcastArtPulseSessionEnd(sessionId, results) {
    const roomId = `art-pulse:${sessionId}`;
    this.io.to(roomId).emit('art_pulse_session_ended', {
      sessionId,
      results,
      timestamp: new Date()
    });
  }

  // Notify all users of new Art Pulse session
  broadcastNewArtPulseSession(session) {
    this.io.emit('art_pulse_session_started', {
      session,
      timestamp: new Date()
    });
  }
}

module.exports = new SocketService();