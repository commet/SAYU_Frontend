'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Shield, Monitor, Smartphone, Tablet, Globe, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Session {
  tokenId: string;
  createdAt: string;
  lastUsed: string;
  userAgent: string;
  ipAddress: string;
  isCurrentSession: boolean;
}

export function SessionManager() {
  const { logoutAll } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (tokenId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/sessions/${tokenId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setSessions(sessions.filter(session => session.tokenId !== tokenId));
        toast.success('Session revoked successfully');
      } else {
        toast.error('Failed to revoke session');
      }
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="w-5 h-5" />;
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="w-5 h-5" />;
    } else {
      return <Monitor className="w-5 h-5" />;
    }
  };

  const getDeviceInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    // Detect browser
    if (ua.includes('chrome')) browser = 'Chrome';
    else if (ua.includes('firefox')) browser = 'Firefox';
    else if (ua.includes('safari')) browser = 'Safari';
    else if (ua.includes('edge')) browser = 'Edge';

    // Detect OS
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('linux')) os = 'Linux';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

    return `${browser} on ${os}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getLocationFromIP = (ipAddress: string) => {
    // This is a simplified version - in production you might want to use a proper IP geolocation service
    if (ipAddress === '127.0.0.1' || ipAddress === 'localhost' || ipAddress.startsWith('192.168.')) {
      return 'Local Network';
    }
    return 'Unknown Location';
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Active Sessions</h3>
        </div>
        {sessions.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={logoutAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Logout All Devices
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {sessions.map((session) => (
            <motion.div
              key={session.tokenId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`border rounded-lg p-4 ${
                session.isCurrentSession 
                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${session.isCurrentSession ? 'text-blue-600' : 'text-gray-500'}`}>
                    {getDeviceIcon(session.userAgent)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">
                        {getDeviceInfo(session.userAgent)}
                      </h4>
                      {session.isCurrentSession && (
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                          Current Session
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>{getLocationFromIP(session.ipAddress)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{session.ipAddress}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Last active: {formatDate(session.lastUsed)}</span>
                      </div>
                      
                      <div className="text-gray-500">
                        Created: {formatDate(session.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {!session.isCurrentSession && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession(session.tokenId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No active sessions found</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Sessions automatically expire after 7 days of inactivity</p>
          <p>• You can revoke access from any device at any time</p>
          <p>• Use "Logout All Devices" if you suspect unauthorized access</p>
        </div>
      </div>
    </div>
  );
}