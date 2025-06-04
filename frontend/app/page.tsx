'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Users, 
  Zap, 
  Heart,
  Eye,
  Brain,
  Palette,
  Star,
  Check,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

// Interactive mini-quiz data
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
  },
  {
    id: 3,
    question: "What moves you most in art?",
    options: [
      { id: 'A', text: "The story and meaning behind the work", type: 'narrative' },
      { id: 'B', text: "The technical skill and craftsmanship", type: 'technical' },
      { id: 'C', text: "The emotional response it creates", type: 'emotional' },
      { id: 'D', text: "The innovative use of materials/methods", type: 'innovative' }
    ]
  }
];

// Personality results based on answers
const personalityInsights = {
  abstract_introspective_narrative: {
    type: "The Conceptual Thinker",
    description: "You seek deeper meaning and love exploring abstract concepts",
    traits: ["Analytical", "Thoughtful", "Meaning-seeking"],
    color: "from-purple-600 to-indigo-600"
  },
  realistic_social_emotional: {
    type: "The Empathetic Connector",
    description: "You connect with art through human stories and shared experiences",
    traits: ["Empathetic", "Social", "Emotionally-driven"],
    color: "from-pink-600 to-rose-600"
  },
  emotional_independent_innovative: {
    type: "The Intuitive Explorer",
    description: "You follow your instincts and love discovering new artistic frontiers",
    traits: ["Intuitive", "Independent", "Innovation-loving"],
    color: "from-cyan-600 to-blue-600"
  },
  // Fallback for any combination
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
      // Generate personality insight
      const key = newAnswers.slice(0, 3).join('_');
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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Art Enthusiast",
      text: "SAYU helped me discover artists I never would have found on my own. It's like having a personal curator!",
      rating: 5
    },
    {
      name: "Marcus Thompson", 
      role: "Museum Visitor",
      text: "Finally, a way to understand my art preferences. The AI recommendations are surprisingly accurate.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Gallery Regular", 
      text: "I love how it adapts to my taste over time. Each recommendation feels more personal than the last.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SAYU</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-purple-400">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                Sign Up Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20" />
          <div 
            className="w-full h-full" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
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
              {/* Headlines */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full px-4 py-2 mb-6"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-300 text-sm font-medium">AI-Powered Art Discovery</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                >
                  Discover Your
                  <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent block">
                    Aesthetic Soul
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
                >
                  Unlock your unique artistic personality through AI. Get personalized art recommendations that truly resonate with your aesthetic preferences.
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
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">2,500+ Art Explorers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">4.9/5 Rating</span>
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
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Your Journey (2 min)
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleFullQuiz}
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 w-full lg:w-auto"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Get Full Personality Profile
                    </Button>
                    <Button
                      onClick={handleGuestMode}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-4 rounded-xl w-full lg:w-auto"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Browse as Guest
                    </Button>
                  </div>
                )}
                <p className="text-sm text-gray-400">No credit card required • 100% free to start</p>
              </motion.div>
            </motion.div>

            {/* Right Side - Interactive Quiz */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
                <AnimatePresence mode="wait">
                  {!isQuizStarted ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">Interactive Preview</h3>
                      <p className="text-gray-300 mb-6">
                        Experience a taste of our personality analysis. Answer a few quick questions to see how SAYU works.
                      </p>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                          <Check className="w-5 h-5 text-green-400" />
                          <span>Instant personality insights</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Check className="w-5 h-5 text-green-400" />
                          <span>Personalized art recommendations</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                          <Check className="w-5 h-5 text-green-400" />
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
                          <span className="text-sm text-purple-400 font-medium">
                            Question {currentQuestion + 1} of {miniQuizQuestions.length}
                          </span>
                          <div className="flex gap-1">
                            {miniQuizQuestions.map((_, index) => (
                              <div
                                key={index}
                                className={`w-2 h-2 rounded-full ${
                                  index <= currentQuestion ? 'bg-purple-500' : 'bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6">
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
                            className="w-full text-left p-4 rounded-xl bg-gray-800/50 border border-gray-600 hover:border-purple-500 hover:bg-gray-800 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold group-hover:bg-purple-500 group-hover:text-white transition-all">
                                {option.id}
                              </div>
                              <span className="text-gray-300 group-hover:text-white transition-colors">
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
                        className={`w-20 h-20 bg-gradient-to-r ${personalityResult?.color} rounded-full flex items-center justify-center mx-auto mb-6`}
                      >
                        <Sparkles className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {personalityResult?.type}
                      </h3>
                      <p className="text-gray-300 mb-6">
                        {personalityResult?.description}
                      </p>
                      
                      <div className="flex flex-wrap justify-center gap-2 mb-6">
                        {personalityResult?.traits.map((trait: string, index: number) => (
                          <motion.span
                            key={trait}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm"
                          >
                            {trait}
                          </motion.span>
                        ))}
                      </div>

                      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-300">
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
            className="flex flex-col items-center gap-2 text-gray-400"
          >
            <span className="text-sm">Scroll to explore</span>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How SAYU Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to unlock your personalized art journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: Brain,
                title: "Take the Quiz",
                description: "Answer thoughtful questions about your aesthetic preferences and artistic inclinations",
                color: "from-purple-500 to-indigo-500"
              },
              {
                step: 2,
                icon: Sparkles,
                title: "Get Your Profile",
                description: "Receive your unique aesthetic personality from 128 possible types with AI-generated insights",
                color: "from-cyan-500 to-blue-500"
              },
              {
                step: 3,
                icon: Palette,
                title: "Explore & Discover",
                description: "Browse personalized art recommendations and chat with your AI curator",
                color: "from-pink-500 to-rose-500"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 h-full">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {item.step}. {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Art Lovers Choose SAYU
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              More than just art browsing - a complete aesthetic discovery platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "128 Personality Types",
                description: "Our proprietary system creates truly unique aesthetic profiles",
                highlight: "99% accurate"
              },
              {
                icon: Zap,
                title: "AI-Powered Curation",
                description: "Smart recommendations that evolve with your taste",
                highlight: "Always learning"
              },
              {
                icon: Heart,
                title: "Personal Art Curator",
                description: "Chat with AI that understands your aesthetic preferences",
                highlight: "24/7 available"
              },
              {
                icon: Eye,
                title: "Curated Galleries",
                description: "Handpicked artworks from world-class museums",
                highlight: "10k+ artworks"
              },
              {
                icon: Users,
                title: "Community Features",
                description: "Connect with others who share your aesthetic sensibilities",
                highlight: "Growing community"
              },
              {
                icon: Sparkles,
                title: "Continuous Discovery",
                description: "Daily recommendations and new artistic insights",
                highlight: "Fresh content"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 group hover:border-purple-500 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center group-hover:bg-purple-500 transition-all">
                    <feature.icon className="w-6 h-6 text-purple-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                      <span className="text-xs bg-purple-500/20 border border-purple-500/30 rounded-full px-2 py-1 text-purple-300">
                        {feature.highlight}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-900/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands discovering their aesthetic identity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-sm text-gray-400">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Discover Your
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent block">
                Aesthetic Identity?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of art lovers who've unlocked their unique artistic personality. 
              Start your journey in just 2 minutes.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => router.push('/quiz')}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-xl px-12 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Sparkles className="w-6 h-6 mr-3" />
                Start Your Free Journey
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
              
              <p className="text-sm text-gray-400">
                No signup required to start • Discover your type in 2 minutes • 100% free
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SAYU</span>
            </div>
            
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>© 2024 SAYU. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}