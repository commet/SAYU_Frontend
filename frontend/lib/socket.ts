import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '@/config/api';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<Function>> = new Map();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(API_CONFIG.baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from Socket.IO server:', reason);
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('connection_error', { error: 'Max reconnection attempts reached' });
      }
    });

    // Forward all socket events to listeners
    this.socket.onAny((event, ...args) => {
      this.emit(event, ...args);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      this.listeners.get(event)!.delete(callback);
    } else {
      this.listeners.get(event)!.clear();
    }
  }

  private emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }

  // Chat functionality
  joinRoom(roomId: string) {
    this.socket?.emit('join_room', roomId);
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave_room', roomId);
  }

  sendMessage(roomId: string, message: string, messageType: string = 'text') {
    this.socket?.emit('send_message', {
      roomId,
      message,
      messageType
    });
  }

  startTyping(roomId: string) {
    this.socket?.emit('typing_start', { roomId });
  }

  stopTyping(roomId: string) {
    this.socket?.emit('typing_stop', { roomId });
  }

  // Exhibition presence
  joinExhibition(exhibitionId: string, museumName: string, exhibitionName: string) {
    this.socket?.emit('exhibition_view', {
      exhibitionId,
      museumName,
      exhibitionName
    });
  }

  // Reflection sharing
  shareReflection(reflection: any) {
    this.socket?.emit('reflection_created', { reflection });
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketManager = new SocketManager();

// React hook for using socket
export function useSocket() {
  const connect = (token: string) => socketManager.connect(token);
  const disconnect = () => socketManager.disconnect();
  const isConnected = () => socketManager.isConnected();
  
  return {
    connect,
    disconnect,
    isConnected,
    joinRoom: (roomId: string) => socketManager.joinRoom(roomId),
    leaveRoom: (roomId: string) => socketManager.leaveRoom(roomId),
    sendMessage: (roomId: string, message: string, type?: string) => 
      socketManager.sendMessage(roomId, message, type),
    startTyping: (roomId: string) => socketManager.startTyping(roomId),
    stopTyping: (roomId: string) => socketManager.stopTyping(roomId),
    joinExhibition: (exhibitionId: string, museumName: string, exhibitionName: string) =>
      socketManager.joinExhibition(exhibitionId, museumName, exhibitionName),
    shareReflection: (reflection: any) => socketManager.shareReflection(reflection),
    on: (event: string, callback: Function) => socketManager.on(event, callback),
    off: (event: string, callback?: Function) => socketManager.off(event, callback)
  };
}