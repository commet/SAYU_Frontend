'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Bell, 
  BellOff, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Star, 
  Palette,
  Calendar,
  Settings,
  X
} from 'lucide-react';
import { useSocket } from '@/lib/socket';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  sender?: {
    username: string;
    profile_image?: string;
  };
  timestamp: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const { language } = useLanguage();
  const { on, off } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for real-time notifications
    on('notification', handleNewNotification);
    
    return () => {
      off('notification', handleNewNotification);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNotifications(prev =>
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'reflection':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'exhibition':
        return <Palette className="w-4 h-4 text-purple-500" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return language === 'ko' ? '방금 전' : 'Just now';
    } else if (diffInHours < 24) {
      return language === 'ko' ? `${Math.floor(diffInHours)}시간 전` : `${Math.floor(diffInHours)}h ago`;
    } else {
      return format(date, 'MMM d', { locale: language === 'ko' ? ko : enUS });
    }
  };

  if (!isOpen) return null;

  return (
    <Card className="absolute right-0 top-12 w-80 max-h-96 z-50 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold">
            {language === 'ko' ? '알림' : 'Notifications'}
          </h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              {language === 'ko' ? '모두 읽음' : 'Mark all read'}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <ScrollArea className="max-h-80">
        {isLoading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
            <BellOff className="w-6 h-6 mb-2" />
            <p className="text-sm">
              {language === 'ko' ? '알림이 없습니다' : 'No notifications'}
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-primary/5' : ''
                }`}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                {/* Avatar or Icon */}
                {notification.sender ? (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={notification.sender.profile_image} />
                    <AvatarFallback>
                      {notification.sender.username[0]}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium leading-tight">
                        {notification.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}