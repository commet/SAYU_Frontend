'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Heart, Eye, Clock, Pin, Lock, User } from 'lucide-react';
import Link from 'next/link';

interface Topic {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  reply_count: number;
  like_count: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  last_reply_at: string;
  last_reply_author: string;
  created_at: string;
}

interface TopicListProps {
  forumId: string;
  className?: string;
}

export function TopicList({ forumId, className = '' }: TopicListProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forumId) {
      fetchTopics();
    }
  }, [forumId]);

  const fetchTopics = async () => {
    try {
      const response = await fetch(`/api/community/forums/${forumId}/topics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="flex gap-6">
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {topics.map((topic, index) => (
        <motion.div
          key={topic.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all duration-300"
        >
          <Link href={`/community/topics/${topic.id}`}>
            <div className="p-6 cursor-pointer">
              <div className="flex items-start gap-4">
                {/* Topic indicators */}
                <div className="flex flex-col gap-1 pt-1">
                  {topic.is_pinned && (
                    <Pin className="w-4 h-4 text-yellow-500" />
                  )}
                  {topic.is_locked && (
                    <Lock className="w-4 h-4 text-red-500" />
                  )}
                </div>
                
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white hover:text-purple-400 transition-colors mb-2 line-clamp-2">
                    {topic.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <User className="w-4 h-4" />
                    <span>by {topic.author_name}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(topic.created_at)}</span>
                  </div>
                  
                  {/* Preview of content */}
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                    {topic.content.length > 150 
                      ? `${topic.content.substring(0, 150)}...` 
                      : topic.content
                    }
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{topic.reply_count || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{topic.like_count || 0}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{topic.view_count || 0}</span>
                    </div>
                    
                    {topic.last_reply_author && (
                      <div className="flex items-center gap-2 ml-auto">
                        <Clock className="w-4 h-4" />
                        <span>Last reply by {topic.last_reply_author}</span>
                        <span>{formatTimeAgo(topic.last_reply_at)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Avatar placeholder */}
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {topic.author_name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
      
      {topics.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Topics Yet</h3>
          <p className="text-gray-500 mb-6">Be the first to start a discussion in this forum!</p>
          <button className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
            Create First Topic
          </button>
        </div>
      )}
    </div>
  );
}