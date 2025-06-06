'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Share2, Download, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ProfileCelebrationProps {
  profile: any;
  onComplete?: () => void;
}

export function ProfileCelebration({ profile, onComplete }: ProfileCelebrationProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if this is the first time showing celebration
    const hasShownCelebration = localStorage.getItem(`celebration_${profile.typeCode}`);
    if (!hasShownCelebration && profile.typeCode) {
      setShow(true);
      localStorage.setItem(`celebration_${profile.typeCode}`, 'true');
      
      // Trigger confetti
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981']
        });
      }, 500);
    }
  }, [profile]);

  const handleShare = async () => {
    const shareText = `I just discovered my aesthetic personality on SAYU! I'm a ${profile.archetypeName} (${profile.typeCode}). Discover yours at sayu.art`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SAYU Aesthetic Personality',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success('Share text copied to clipboard!');
    }
  };

  const handleDownloadProfile = () => {
    // Create a canvas with profile card
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(1, '#EC4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(profile.typeCode, canvas.width / 2, 200);

    ctx.font = '48px Arial';
    ctx.fillText(profile.archetypeName, canvas.width / 2, 280);

    ctx.font = '32px Arial';
    ctx.fillText('My Aesthetic Personality', canvas.width / 2, 350);

    // Add logo/branding
    ctx.font = '24px Arial';
    ctx.fillText('SAYU - Discover Your Aesthetic Soul', canvas.width / 2, 550);

    // Convert to image and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sayu-personality-${profile.typeCode}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    toast.success('Profile image downloaded!');
  };

  const handleContinue = () => {
    setShow(false);
    onComplete?.();
    router.push('/journey');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="bg-gradient-to-br from-purple-900 via-pink-900 to-blue-900 rounded-3xl max-w-2xl w-full p-8 text-center relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute top-10 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"
              animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-40 h-40 bg-pink-500 rounded-full blur-3xl"
              animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="mb-6"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Congratulations!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/90 mb-8"
            >
              You've discovered your unique aesthetic personality
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <Sparkles className="w-8 h-8 text-purple-300" />
                <h2 className="text-3xl font-bold text-white">{profile.typeCode}</h2>
                <Sparkles className="w-8 h-8 text-pink-300" />
              </div>
              <h3 className="text-2xl text-white/90 mb-2">{profile.archetypeName}</h3>
              <p className="text-white/70 max-w-md mx-auto">
                {profile.archetypeDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center mb-8"
            >
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadProfile}
                className="border-white/30 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Card
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}