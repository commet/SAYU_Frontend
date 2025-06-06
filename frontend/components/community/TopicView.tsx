'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Eye, Clock, Pin, Lock, User, Reply, Flag, Share2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Topic {
  id: string;
  title: string;
  content: string;
  author_name: string;
  author_id: string;
  forum_name: string;
  forum_slug: string;
  view_count: number;
  like_count: number;
  user_liked: boolean;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
}

interface Reply {
  id: string;
  content: string;
  author_name: string;
  author_id: string;
  like_count: number;
  user_liked: boolean;
  parent_reply_id?: string;
  created_at: string;
}

interface TopicViewProps {
  topicId: string;
}

export function TopicView({ topicId }: TopicViewProps) {
  const { user } = useAuth();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
      fetchReplies();
    }
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const response = await fetch(`/api/community/topics/${topicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTopic(data);
      }
    } catch (error) {
      console.error('Failed to fetch topic:', error);
    }
  };

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/community/topics/${topicId}/replies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (error) {
      console.error('Failed to fetch replies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeTopic = async () => {
    if (!user || !topic) return;

    try {
      const response = await fetch(`/api/community/topics/${topicId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTopic(prev => prev ? {
          ...prev,
          user_liked: data.liked,
          like_count: prev.like_count + (data.liked ? 1 : -1)
        } : null);
      }
    } catch (error) {
      console.error('Failed to like topic:', error);
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/community/replies/${replyId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReplies(prev => prev.map(reply => 
          reply.id === replyId
            ? {
                ...reply,
                user_liked: data.liked,
                like_count: reply.like_count + (data.liked ? 1 : -1)
              }
            : reply
        ));
      }
    } catch (error) {
      console.error('Failed to like reply:', error);
    }
  };

  const handleSubmitReply = async () => {
    if (!user || !replyContent.trim() || submittingReply) return;

    setSubmittingReply(true);
    try {
      const response = await fetch(`/api/community/topics/${topicId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: replyContent })
      });

      if (response.ok) {
        setReplyContent('');
        await fetchReplies(); // Refresh replies
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setSubmittingReply(false);
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

  if (loading || !topic) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-8 border border-gray-800">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Topic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {topic.is_pinned && <Pin className="w-5 h-5 text-yellow-500" />}
                {topic.is_locked && <Lock className="w-5 h-5 text-red-500" />}
                <h1 className="text-2xl font-bold text-white">{topic.title}</h1>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{topic.author_name}</span>
                </div>
                <span>•</span>
                <span>{formatTimeAgo(topic.created_at)}</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{topic.view_count} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="prose prose-invert max-w-none mb-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {topic.content}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
            <button
              onClick={handleLikeTopic}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                topic.user_liked
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${topic.user_liked ? 'fill-current' : ''}`} />
              <span>{topic.like_count}</span>
            </button>
            
            <div className="flex items-center gap-2 text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span>{replies.length} replies</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Replies */}
      <div className="space-y-4">
        {replies.map((reply, index) => (
          <motion.div
            key={reply.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="bg-gray-900/30 backdrop-blur-lg rounded-xl border border-gray-800/50"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {reply.author_name?.charAt(0)?.toUpperCase()}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white">{reply.author_name}</span>
                    <span className="text-sm text-gray-400">{formatTimeAgo(reply.created_at)}</span>
                  </div>
                  
                  <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeReply(reply.id)}
                      className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                        reply.user_liked
                          ? 'bg-red-500/20 text-red-400'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${reply.user_liked ? 'fill-current' : ''}`} />
                      <span>{reply.like_count}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 px-3 py-1 text-sm text-gray-400 hover:text-white transition-colors">
                      <Reply className="w-4 h-4" />
                      <span>Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Form */}
      {user && !topic.is_locked && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800"
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Post a Reply</h3>
            
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 resize-none"
            />
            
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmitReply}
                disabled={!replyContent.trim() || submittingReply}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                {submittingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}