'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar, 
  MapPin, 
  BarChart3,
  Heart,
  Star,
  Users,
  Lightbulb,
  Target,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ExhibitionReport {
  id: string;
  exhibition_name: string;
  venue: string;
  visit_date: string;
  generated_at: string;
  report_content: {
    summary: string;
    aesthetic_journey?: string;
    standout_moments?: string;
    discoveries?: string;
    emotional_journey?: string;
    recommendations?: string;
    reflection_questions?: string[];
    analytics: {
      artworks_viewed: number;
      avg_emotion_rating: number;
      avg_technical_rating: number;
      top_artworks?: Array<{
        title: string;
        artist: string;
        emotion_rating: number;
        technical_rating: number;
      }>;
      favorite_artists?: Array<{
        artist: string;
        count: number;
      }>;
    };
    metadata: {
      generated_at: string;
      user_type: string;
      archetype: string;
    };
  };
}

export default function ReportPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [report, setReport] = useState<ExhibitionReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const reportId = params.reportId as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && reportId) {
      fetchReport();
    }
  }, [user, loading, reportId, router]);

  const fetchReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/exhibition/${reportId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data.report);
      } else {
        toast.error('Failed to load report');
        router.push('/archive');
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Failed to load report');
      router.push('/archive');
    } finally {
      setLoadingReport(false);
    }
  };

  const shareReport = () => {
    if (navigator.share) {
      navigator.share({
        title: `Exhibition Report: ${report?.exhibition_name}`,
        text: report?.report_content.summary,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Report link copied to clipboard!');
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = generateReportText(report);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.exhibition_name.replace(/[^a-z0-9]/gi, '_')}_report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded!');
  };

  const generateReportText = (report: ExhibitionReport): string => {
    const content = report.report_content;
    return `
EXHIBITION REPORT
================

Exhibition: ${report.exhibition_name}
Venue: ${report.venue}
Visit Date: ${new Date(report.visit_date).toLocaleDateString()}
Generated: ${new Date(report.generated_at).toLocaleDateString()}

SUMMARY
-------
${content.summary}

${content.aesthetic_journey ? `
AESTHETIC JOURNEY
-----------------
${content.aesthetic_journey}
` : ''}

${content.standout_moments ? `
STANDOUT MOMENTS
---------------
${content.standout_moments}
` : ''}

${content.discoveries ? `
ARTISTIC DISCOVERIES
-------------------
${content.discoveries}
` : ''}

${content.emotional_journey ? `
EMOTIONAL JOURNEY
-----------------
${content.emotional_journey}
` : ''}

${content.recommendations ? `
FUTURE RECOMMENDATIONS
---------------------
${content.recommendations}
` : ''}

ANALYTICS
---------
Artworks Viewed: ${content.analytics.artworks_viewed}
Average Emotional Impact: ${content.analytics.avg_emotion_rating.toFixed(1)}/5
Average Technical Appreciation: ${content.analytics.avg_technical_rating.toFixed(1)}/5

${content.analytics.top_artworks ? `
Top Artworks:
${content.analytics.top_artworks.map((artwork, i) => 
  `${i + 1}. "${artwork.title}" by ${artwork.artist} (E:${artwork.emotion_rating}, T:${artwork.technical_rating})`
).join('\n')}
` : ''}

${content.reflection_questions ? `
REFLECTION QUESTIONS
-------------------
${content.reflection_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : ''}

Generated by SAYU - Your Aesthetic Journey Platform
    `.trim();
  };

  if (loading || loadingReport) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Report Not Found</h2>
          <Button onClick={() => router.push('/archive')} className="bg-purple-600 hover:bg-purple-700">
            Back to Archive
          </Button>
        </div>
      </div>
    );
  }

  const content = report.report_content;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Header */}
      <header className="p-6 border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => router.push('/archive')}
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Archive
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Exhibition Report</h1>
                <p className="text-gray-400 text-sm">
                  Generated {new Date(report.generated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={shareReport} variant="outline" className="border-gray-600 text-gray-400">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={downloadReport} variant="outline" className="border-gray-600 text-gray-400">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto">
        {/* Exhibition Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-xl p-6 border border-purple-700/50 mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-4">{report.exhibition_name}</h2>
          <div className="flex items-center gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {report.venue}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {new Date(report.visit_date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {content.metadata.archetype}
            </div>
          </div>
        </motion.div>

        {/* Analytics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{content.analytics.artworks_viewed}</div>
                <div className="text-sm text-gray-400">Artworks Explored</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold text-white">{content.analytics.avg_emotion_rating.toFixed(1)}/5</div>
                <div className="text-sm text-gray-400">Emotional Impact</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{content.analytics.avg_technical_rating.toFixed(1)}/5</div>
                <div className="text-sm text-gray-400">Technical Appreciation</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Report Content */}
        <div className="space-y-8">
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Executive Summary
            </h3>
            <p className="text-gray-300 leading-relaxed">{content.summary}</p>
          </motion.div>

          {/* Aesthetic Journey */}
          {content.aesthetic_journey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Personal Aesthetic Journey
              </h3>
              <p className="text-gray-300 leading-relaxed">{content.aesthetic_journey}</p>
            </motion.div>
          )}

          {/* Standout Moments */}
          {content.standout_moments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Standout Moments
              </h3>
              <p className="text-gray-300 leading-relaxed">{content.standout_moments}</p>
            </motion.div>
          )}

          {/* Top Artworks */}
          {content.analytics.top_artworks && content.analytics.top_artworks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Your Top Artworks
              </h3>
              <div className="space-y-3">
                {content.analytics.top_artworks.map((artwork, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">"{artwork.title}"</div>
                      <div className="text-gray-400 text-sm">by {artwork.artist}</div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-gray-300">{artwork.emotion_rating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-300">{artwork.technical_rating}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Discoveries */}
          {content.discoveries && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Artistic Discoveries
              </h3>
              <p className="text-gray-300 leading-relaxed">{content.discoveries}</p>
            </motion.div>
          )}

          {/* Emotional Journey */}
          {content.emotional_journey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                Emotional Journey
              </h3>
              <p className="text-gray-300 leading-relaxed">{content.emotional_journey}</p>
            </motion.div>
          )}

          {/* Recommendations */}
          {content.recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-green-400" />
                Future Recommendations
              </h3>
              <p className="text-gray-300 leading-relaxed">{content.recommendations}</p>
            </motion.div>
          )}

          {/* Reflection Questions */}
          {content.reflection_questions && content.reflection_questions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Reflection Questions
              </h3>
              <div className="space-y-3">
                {content.reflection_questions.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-gray-300 leading-relaxed">{question}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex justify-center gap-4 mt-12 pt-8 border-t border-gray-800"
        >
          <Button onClick={() => router.push('/archive')} className="bg-purple-600 hover:bg-purple-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Archive
          </Button>
          <Button onClick={() => router.push('/gallery')} variant="outline" className="border-gray-600 text-gray-400">
            Explore More Art
          </Button>
        </motion.div>
      </main>
    </div>
  );
}