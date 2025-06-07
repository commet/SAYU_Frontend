'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Share2, Heart } from 'lucide-react';

interface ShareAnalytics {
  platform: string;
  content_type: string;
  share_count: number;
  unique_content_shared: number;
}

interface ShareWidgetProps {
  className?: string;
}

export function ShareWidget({ className = '' }: ShareWidgetProps) {
  const [analytics, setAnalytics] = useState<ShareAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/social-share/analytics?timeframe=${timeframe}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch share analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalShares = () => {
    return analytics.reduce((total, item) => total + item.share_count, 0);
  };

  const getTopPlatform = () => {
    if (analytics.length === 0) return null;
    return analytics.reduce((prev, current) => 
      current.share_count > prev.share_count ? current : prev
    );
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return 'text-blue-400';
      case 'facebook': return 'text-blue-600';
      case 'linkedin': return 'text-blue-500';
      case 'reddit': return 'text-orange-500';
      case 'pinterest': return 'text-red-500';
      case 'native': return 'text-green-400';
      case 'copy_link': return 'text-gray-400';
      default: return 'text-purple-400';
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-lg rounded-xl p-6 border border-gray-800 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalShares = getTotalShares();
  const topPlatform = getTopPlatform();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900/50 backdrop-blur-lg rounded-xl border border-gray-800 ${className}`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Share2 className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Share Analytics</h3>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="365d">Last year</option>
          </select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-400">Total Shares</span>
            </div>
            <div className="text-2xl font-bold text-white">{totalShares}</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Top Platform</span>
            </div>
            <div className="text-lg font-semibold text-white capitalize">
              {topPlatform ? topPlatform.platform : 'N/A'}
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        {analytics.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Platform Breakdown</h4>
            {analytics.map((item, index) => (
              <motion.div
                key={`${item.platform}-${item.content_type}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${getPlatformColor(item.platform).replace('text-', 'bg-')}`}></div>
                  <div>
                    <div className={`font-medium capitalize ${getPlatformColor(item.platform)}`}>
                      {item.platform.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.content_type} content
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-semibold">{item.share_count}</div>
                  <div className="text-xs text-gray-400">
                    {item.unique_content_shared} unique
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-400 mb-2">No Shares Yet</h4>
            <p className="text-sm text-gray-500">
              Start sharing your discoveries to see analytics here
            </p>
          </div>
        )}

        {/* Sharing Tips */}
        <div className="mt-6 pt-6 border-t border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Sharing Tips</h4>
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <span>Share artworks that resonate with your aesthetic journey</span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <span>Post quiz results to connect with similar aesthetic types</span>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Share exhibition experiences to inspire others</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}