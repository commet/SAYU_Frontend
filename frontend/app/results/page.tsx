'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { EmotionalCard, ArtworkCard, EmotionalButton } from '@/components/emotional/EmotionalCard';
import { Heart, Sparkles, Map, Share2, BookOpen, Palette } from 'lucide-react';
import '@/styles/emotional-palette.css';
import { personalityDescriptions } from '@/data/personality-descriptions';

interface QuizResults {
  personalityType: string;
  scores: Record<string, number>;
  responses: any[];
  completedAt: string;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [personality, setPersonality] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem('quizResults');
    if (storedResults) {
      const parsed = JSON.parse(storedResults);
      setResults(parsed);
      
      const type = searchParams.get('type') || parsed.personalityType;
      const personalityData = personalityDescriptions[type];
      setPersonality(personalityData);
    } else {
      router.push('/quiz');
    }
  }, [searchParams, router]);

  if (!results || !personality) {
    return (
      <div className="min-h-screen gradient-revelation flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white/50" />
        </motion.div>
      </div>
    );
  }

  const shareResult = () => {
    // Implementation for sharing
    setShowShareModal(true);
  };

  return (
    <div className="min-h-screen gradient-revelation" data-personality={results.personalityType}>
      {/* Hero Section - About You */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.390, 0.575, 0.565, 1.000] }}
          className="max-w-4xl w-full text-center text-white"
        >
          {/* Personality Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="mb-12"
          >
            <p className="text-xl mb-4 opacity-80">You are</p>
            <h1 className="text-5xl md:text-7xl font-serif mb-6">
              {personality.title}
            </h1>
            <p className="text-2xl opacity-90 italic">
              {personality.subtitle}
            </p>
          </motion.div>

          {/* Core Essence */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-10 mb-12"
          >
            <Heart className="w-12 h-12 mx-auto mb-6 text-white/80" />
            <p className="text-xl leading-relaxed mb-8">
              {personality.essence}
            </p>
            
            {/* Your Strengths */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {personality.strengths.map((strength: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="bg-white/5 rounded-2xl p-6"
                >
                  <div className="text-3xl mb-3">{strength.icon}</div>
                  <h3 className="font-medium mb-2">{strength.title}</h3>
                  <p className="text-sm opacity-80">{strength.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recognition */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-serif mb-6">You might recognize yourself in...</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {personality.recognition.map((item: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full"
                >
                  {item}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How This Extends to Life */}
      <section className="bg-[hsl(var(--gallery-white))] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--personality-accent))]" />
            <h2 className="text-4xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
              This extends beyond galleries
            </h2>
            <p className="text-xl text-[hsl(var(--journey-twilight))] max-w-3xl mx-auto">
              {personality.lifeExtension}
            </p>
          </motion.div>

          {/* Life Areas */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personality.lifeAreas.map((area: any, index: number) => (
              <EmotionalCard
                key={index}
                delay={index * 0.1}
                personality={results.personalityType}
                className="p-8"
              >
                <h3 className="text-xl font-medium mb-3">{area.title}</h3>
                <p className="opacity-80">{area.description}</p>
              </EmotionalCard>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      <section className="py-20 px-4 bg-gradient-to-b from-[hsl(var(--gallery-white))] to-[hsl(var(--gallery-pearl))]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Palette className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--personality-accent))]" />
            <h2 className="text-4xl font-serif mb-4 text-[hsl(var(--journey-midnight))]">
              Artists who speak your language
            </h2>
            <p className="text-xl text-[hsl(var(--journey-twilight))]">
              Based on your unique way of experiencing art
            </p>
          </motion.div>

          {/* Artist Recommendations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {personality.recommendedArtists.map((artist: any, index: number) => (
              <ArtworkCard
                key={index}
                image={artist.image}
                title={artist.name}
                artist={artist.period}
                description={artist.whyYouConnect}
                emotionalTag={artist.emotionalTag}
                personality={results.personalityType}
                delay={index * 0.1}
              />
            ))}
          </div>

          {/* Current Exhibitions */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-2xl font-serif mb-8 text-[hsl(var(--journey-midnight))]">
              Exhibitions waiting for you
            </h3>
            <EmotionalButton
              variant="primary"
              size="lg"
              personality={results.personalityType}
              onClick={() => router.push('/exhibitions')}
            >
              <Map className="w-5 h-5" />
              Explore Your Art Map
            </EmotionalButton>
          </motion.div>
        </div>
      </section>

      {/* Share Your Journey */}
      <section className="py-20 px-4 text-center bg-[hsl(var(--gallery-pearl))]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-serif mb-6 text-[hsl(var(--journey-midnight))]">
            Share your artistic soul
          </h2>
          <p className="text-lg mb-8 text-[hsl(var(--journey-twilight))] max-w-2xl mx-auto">
            Let others discover their own journey, or find kindred spirits who see the world as you do
          </p>
          <div className="flex justify-center gap-4">
            <EmotionalButton
              variant="primary"
              onClick={shareResult}
              personality={results.personalityType}
            >
              <Share2 className="w-5 h-5" />
              Share Your Type
            </EmotionalButton>
            <EmotionalButton
              variant="ghost"
              onClick={() => router.push('/community')}
              personality={results.personalityType}
            >
              <BookOpen className="w-5 h-5" />
              Find Your Tribe
            </EmotionalButton>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen gradient-revelation flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-12 h-12 text-white/50" />
        </motion.div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}