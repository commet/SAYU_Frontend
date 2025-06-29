'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Sparkle, 
  ArrowRight, 
  Play, 
  Users, 
  Lightning, 
  Heart,
  Eye,
  Brain,
  Palette,
  Star,
  Check,
  CaretDown,
  FrameCorners
} from 'phosphor-react';
import Link from 'next/link';

const miniQuizQuestions = [
  {
    id: 1,
    question: "When you enter an art gallery, you're first drawn to:",
    options: [
      { id: 'A', text: "Bold, abstract compositions that challenge perception", type: 'abstract' },
      { id: 'B', text: "Realistic portraits that capture human emotion", type: 'realistic' },
      { id: 'C', text: "Colorful landscapes that evoke feelings", type: 'emotional' },
      { id: 'D', text: "Detailed technical masterpieces", type: 'analytical' }
    ]
  },
  {
    id: 2,
    question: "Your ideal art viewing experience is:",
    options: [
      { id: 'A', text: "Alone, taking time to deeply analyze each piece", type: 'introspective' },
      { id: 'B', text: "With friends, discussing and sharing reactions", type: 'social' },
      { id: 'C', text: "Guided tour with expert insights", type: 'learning' },
      { id: 'D', text: "Self-guided with audio descriptions", type: 'independent' }
    ]
  }
];

const personalityInsights = {
  abstract_introspective: {
    type: "The Conceptual Thinker",
    description: "You seek deeper meaning and love exploring abstract concepts",
    traits: ["Analytical", "Thoughtful", "Meaning-seeking"],
    color: "from-purple-600 to-indigo-600"
  },
  default: {
    type: "The Aesthetic Explorer",
    description: "You have a unique way of experiencing and appreciating art",
    traits: ["Curious", "Open-minded", "Aesthetically-aware"],
    color: "from-emerald-600 to-teal-600"
  }
};

export default function LandingPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [personalityResult, setPersonalityResult] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);

  const handleAnswer = (option: any) => {
    const newAnswers = [...answers, option.type];
    setAnswers(newAnswers);

    if (currentQuestion < miniQuizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      const key = newAnswers.slice(0, 2).join('_');
      const result = personalityInsights[key as keyof typeof personalityInsights] || personalityInsights.default;
      setPersonalityResult(result);
      setShowResult(true);
    }
  };

  const startQuiz = () => {
    setIsQuizStarted(true);
  };

  const handleFullQuiz = () => {
    router.push('/quiz');
  };

  const handleGuestMode = () => {
    router.push('/gallery?guest=true');
  };

  return (
    <div className="min-h-screen bg-background page-enter">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <FrameCorners size={24} weight="bold" className="text-primary-foreground" />
              </div>
              <span className="text-2xl font-display">SAYU</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="gallery-button-primary">
                  Get Started
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000000' stroke-width='0.5' opacity='0.3'%3E%3Cpath d='M60 10 L60 110 M10 60 L110 60'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Value Proposition */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border rounded-full px-4 py-2 mb-6"
                >
                  <Sparkle size={16} weight="fill" className="text-accent" />
                  <span className="text-sm font-medium">AI-Curated Art Experiences</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-display mb-6 leading-tight"
                >
                  Discover Your
                  <span className="block text-accent">
                    Aesthetic Identity
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed max-w-2xl"
                >
                  Experience art through the lens of your unique aesthetic personality. Our AI curator learns what moves you.
                </motion.p>
              </div>

              {/* Social Proof */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center lg:justify-start gap-6 mb-8"
              >
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-muted-foreground" />
                  <span className="text-muted-foreground">2,500+ Art Enthusiasts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={20} weight="fill" className="text-accent" />
                  <span className="text-muted-foreground">4.9/5 Rating</span>
                </div>
              </motion.div>

              {/* Primary CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                {!isQuizStarted ? (
                  <Button
                    onClick={startQuiz}
                    className="gallery-button-primary text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl"
                  >
                    <Play size={20} weight="fill" className="mr-2" />
                    Begin Your Journey
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleFullQuiz}
                      className="gallery-button-primary text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl w-full lg:w-auto"
                    >
                      <Sparkle size={20} weight="fill" className="mr-2" />
                      Discover Your Profile
                    </Button>
                    <Button
                      onClick={handleGuestMode}
                      variant="outline"
                      className="gallery-button-secondary text-lg px-8 py-4 rounded-lg w-full lg:w-auto"
                    >
                      <Eye size={20} className="mr-2" />
                      Explore Gallery
                    </Button>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">No credit card required • 100% free to start</p>
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Quiz */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="gallery-card p-8 shadow-xl">
                <AnimatePresence mode="wait">
                  {!isQuizStarted ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain size={40} className="text-primary" />
                      </div>
                      <h3 className="text-2xl font-display mb-4">Interactive Preview</h3>
                      <p className="text-muted-foreground mb-6">
                        Experience a taste of our personality analysis. Answer a few quick questions to see how SAYU works.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Check size={20} className="text-green-500" />
                          <span>Instant personality insights</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Check size={20} className="text-green-500" />
                          <span>Personalized art recommendations</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Check size={20} className="text-green-500" />
                          <span>AI curator conversations</span>
                        </div>
                      </div>
                    </motion.div>
                  ) : !showResult ? (
                    <motion.div
                      key="quiz"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-accent font-medium">
                            Question {currentQuestion + 1} of {miniQuizQuestions.length}
                          </span>
                          <div className="flex gap-1">
                            {miniQuizQuestions.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index <= currentQuestion ? 'bg-accent' : 'bg-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-xl font-display mb-6">
                          {miniQuizQuestions[currentQuestion].question}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        {miniQuizQuestions[currentQuestion].options.map((option, index) => (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleAnswer(option)}
                            className="w-full text-left p-4 rounded-xl bg-secondary/50 border hover:border-accent hover:bg-secondary transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                                {option.id}
                              </div>
                              <span className="text-foreground group-hover:text-foreground transition-colors">
                                {option.text}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
                      >
                        <Sparkle size={40} weight="fill" className="text-accent-foreground" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-display mb-2">
                        {personalityResult?.type}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {personalityResult?.description}
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {personalityResult?.traits.map((trait: string, index: number) => (
                          <motion.span
                            key={trait}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-accent text-sm"
                          >
                            {trait}
                          </motion.span>
                        ))}
                      </div>

                      <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6">
                        <p className="text-sm text-muted-foreground">
                          🎨 This is just a glimpse! Your full profile includes 128 unique personality types, 
                          AI-curated art recommendations, and personalized insights.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-muted-foreground"
          >
            <span className="text-sm">Scroll to explore</span>
            <CaretDown size={20} />
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}