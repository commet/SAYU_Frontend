'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Clock, Pin, Lock } from 'lucide-react';
import Link from 'next/link';

interface Forum {
  id: string;
  name: string;
  description: string;
  slug: string;
  category: string;
  topic_count: number;
  last_activity: string;
}

interface ForumListProps {
  className?: string;
}

export function ForumList({ className = '' }: ForumListProps) {
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForums();
  }, []);

  const fetchForums = async () => {
    try {
      const response = await fetch('/api/community/forums', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setForums(data);
      }
    } catch (error) {
      console.error('Failed to fetch forums:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatLastActivity = (dateStr: string) => {
    if (!dateStr) return 'No activity';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'artwork': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'exhibition': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'discussion': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-700 rounded w-20"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
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
      {forums.map((forum, index) => (
        <motion.div
          key={forum.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 hover:border-purple-500/30 transition-all duration-300"
        >
          <Link href={`/community/forums/${forum.slug}`}>
            <div className="p-6 cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white hover:text-purple-400 transition-colors">
                      {forum.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getCategoryColor(forum.category)}`}>
                      {forum.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {forum.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{forum.topic_count || 0} topics</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatLastActivity(forum.last_activity)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
      
      {forums.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Forums Available</h3>
          <p className="text-gray-500">Community forums will appear here once they're created.</p>
        </div>
      )}
    </div>
  );
}