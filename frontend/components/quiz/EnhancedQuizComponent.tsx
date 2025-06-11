'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Heart, Eye, Users, Lightbulb, 
  Timer, Sparkles, Camera, Palette, Map, Grid, Zap, Award 
} from 'lucide-react';

// Types
interface QuizOption {
  id: string;
  text: string;
  icon?: React.ReactNode;
  emoji?: string;
  weight: Record<string, number>;
  feedback?: string;
  description?: string;
  visual?: string;
  tags?: string[];
}

interface QuizQuestion {
  id: number;
  phase: string;
  type: string;
  title: string;
  description?: string;
  scenario?: string;
  scene?: any;
  options?: QuizOption[];
  sliders?: any[];
  styles?: any[];
  approaches?: any[];
  responses?: any[];
  artwork?: any;
  installation?: any;
  layouts?: any[];
}

interface PersonalityType {
  name: string;
  description: string;
  scene: {
    environment: string;
    behavior: string;
    visualMotif: string;
    avatar: string;
  };
  traits: string[];
  recommendations: string[];
}

interface QuizProps {
  onComplete: (result: any) => void;
}

// Personality Types Data
const personalityTypes: Record<string, PersonalityType> = {
  "LAEF": {
    name: "The Dreaming Wanderer",
    description: "A solitary soul who flows through galleries guided by intuition and emotion",
    scene: {
      environment: "Misty, ethereal gallery spaces",
      behavior: "Drifting between artworks like a ghost",
      visualMotif: "Floating clouds and soft lighting",
      avatar: "Lone figure with flowing movement"
    },
    traits: ["introspective", "intuitive", "emotionally responsive", "free-flowing"],
    recommendations: ["Abstract expressionism", "Installation art", "Symbolist paintings"]
  },
  "LAEC": {
    name: "The Structured Empath",
    description: "A methodical lone viewer who deeply feels art through organized exploration",
    scene: {
      environment: "Quiet, well-lit traditional galleries",
      behavior: "Systematic room-by-room emotional journey",
      visualMotif: "Geometric patterns with warm colors",
      avatar: "Solitary figure with purposeful steps"
    },
    traits: ["organized", "deeply feeling", "introspective", "methodical"],
    recommendations: ["Romantic period art", "Color field paintings", "Narrative sequences"]
  },
  "LAMF": {
    name: "The Intuitive Scholar",
    description: "A solitary intellectual who seeks meaning through fluid exploration",
    scene: {
      environment: "Library-like gallery with hidden corners",
      behavior: "Following conceptual threads between works",
      visualMotif: "Connecting lines and thought bubbles",
      avatar: "Contemplative figure with notebook"
    },
    traits: ["analytical", "intuitive", "independent", "curious"],
    recommendations: ["Conceptual art", "Surrealism", "Political art"]
  },
  "LAMC": {
    name: "The Systematic Philosopher",
    description: "A lone thinker who deconstructs art through structured analysis",
    scene: {
      environment: "Minimalist white cube spaces",
      behavior: "Careful examination of each piece in order",
      visualMotif: "Grid systems and analytical overlays",
      avatar: "Focused individual with measuring gaze"
    },
    traits: ["methodical", "intellectual", "independent", "precise"],
    recommendations: ["Minimalism", "Constructivism", "Documentary photography"]
  },
  "LREF": {
    name: "The Observant Drifter",
    description: "A detail-oriented solo explorer who discovers art through wandering",
    scene: {
      environment: "Realistic gallery with natural lighting",
      behavior: "Spontaneous close examination of details",
      visualMotif: "Magnifying glass effect on artworks",
      avatar: "Keen-eyed wanderer"
    },
    traits: ["observant", "independent", "detail-focused", "spontaneous"],
    recommendations: ["Hyperrealism", "Dutch Masters", "Nature photography"]
  },
  "LREC": {
    name: "The Emotional Realist",
    description: "A solitary viewer who connects emotionally with realistic art through structured viewing",
    scene: {
      environment: "Classical museum with emotional lighting",
      behavior: "Sequential emotional engagement with figurative works",
      visualMotif: "Hearts overlaying realistic scenes",
      avatar: "Contemplative figure before portraits"
    },
    traits: ["empathetic", "organized", "realistic", "introspective"],
    recommendations: ["Portrait galleries", "Social realism", "Narrative paintings"]
  },
  "LRMF": {
    name: "The Technical Explorer",
    description: "A detail-focused analyst who freely investigates artistic techniques alone",
    scene: {
      environment: "Artist studio recreation spaces",
      behavior: "Technical investigation following curiosity",
      visualMotif: "Deconstructed artwork layers",
      avatar: "Detective-like figure examining brushstrokes"
    },
    traits: ["technical", "curious", "independent", "investigative"],
    recommendations: ["Old Master drawings", "Technical studies", "Process art"]
  },
  "LRMC": {
    name: "The Methodical Critic",
    description: "A systematic solo analyzer focused on technical mastery and meaning",
    scene: {
      environment: "Academic gallery with study areas",
      behavior: "Structured critical analysis of each work",
      visualMotif: "Analytical frameworks and notes",
      avatar: "Scholar with systematic approach"
    },
    traits: ["critical", "systematic", "technical", "independent"],
    recommendations: ["Academic art", "Technical masterpieces", "Art history surveys"]
  },
  "SAEF": {
    name: "The Social Dreamweaver",
    description: "A group-oriented intuitive who shares emotional art experiences fluidly",
    scene: {
      environment: "Open, flowing social spaces",
      behavior: "Sharing feelings while moving between groups",
      visualMotif: "Interconnected emotion bubbles",
      avatar: "Social butterfly among clouds"
    },
    traits: ["social", "intuitive", "emotionally expressive", "fluid"],
    recommendations: ["Participatory art", "Immersive exhibitions", "Community projects"]
  },
  "SAEC": {
    name: "The Organized Empath",
    description: "A social viewer who shares structured emotional journeys through art",
    scene: {
      environment: "Well-organized group tour spaces",
      behavior: "Leading emotional discussions systematically",
      visualMotif: "Structured emotion maps",
      avatar: "Guide sharing feelings methodically"
    },
    traits: ["empathetic", "organized", "social", "structured"],
    recommendations: ["Themed exhibitions", "Emotional journey curation", "Group workshops"]
  },
  "SAMF": {
    name: "The Collaborative Philosopher",
    description: "A social thinker who explores abstract meanings through fluid group dialogue",
    scene: {
      environment: "Discussion-friendly abstract spaces",
      behavior: "Facilitating flowing intellectual exchanges",
      visualMotif: "Thought clouds merging",
      avatar: "Discussion leader in motion"
    },
    traits: ["intellectual", "social", "abstract", "dynamic"],
    recommendations: ["Conceptual group shows", "Philosophy and art", "Experimental spaces"]
  },
  "SAMC": {
    name: "The Structured Educator",
    description: "A systematic social analyzer who guides groups through symbolic interpretation",
    scene: {
      environment: "Educational gallery with clear paths",
      behavior: "Teaching symbolic meanings step-by-step",
      visualMotif: "Organized symbol systems",
      avatar: "Teacher with structured approach"
    },
    traits: ["educational", "systematic", "social", "analytical"],
    recommendations: ["Symbolic art history", "Curated educational tours", "Interpretive exhibitions"]
  },
  "SREF": {
    name: "The Social Observer",
    description: "A detail-sharing enthusiast who explores realistic art spontaneously with others",
    scene: {
      environment: "Bright, realistic gallery spaces",
      behavior: "Pointing out details while wandering with friends",
      visualMotif: "Shared observation bubbles",
      avatar: "Enthusiastic detail-spotter"
    },
    traits: ["observant", "social", "spontaneous", "detail-oriented"],
    recommendations: ["Group sketching sessions", "Realist exhibitions", "Photography walks"]
  },
  "SREC": {
    name: "The Emotional Docent",
    description: "A structured social guide who shares emotional connections to realistic art",
    scene: {
      environment: "Traditional galleries with tour routes",
      behavior: "Leading emotional tours through realistic works",
      visualMotif: "Emotional pathways through realism",
      avatar: "Empathetic tour guide"
    },
    traits: ["empathetic", "organized", "realistic", "social"],
    recommendations: ["Figurative art tours", "Emotional realism", "Portrait galleries"]
  },
  "SRMF": {
    name: "The Technical Collaborator",
    description: "A detail-focused social explorer who shares technical discoveries freely",
    scene: {
      environment: "Workshop-style galleries",
      behavior: "Discovering and sharing techniques spontaneously",
      visualMotif: "Technical discovery networks",
      avatar: "Collaborative researcher"
    },
    traits: ["technical", "collaborative", "explorative", "detail-focused"],
    recommendations: ["Technique workshops", "Artist demonstrations", "Collaborative analysis"]
  },
  "SRMC": {
    name: "The Systematic Lecturer",
    description: "A methodical social educator focused on technical analysis and meaning",
    scene: {
      environment: "Lecture hall gallery settings",
      behavior: "Systematic technical and contextual teaching",
      visualMotif: "Structured knowledge frameworks",
      avatar: "Professor with pointer"
    },
    traits: ["educational", "systematic", "technical", "social"],
    recommendations: ["Academic lectures", "Systematic art education", "Historical surveys"]
  }
};

export const EnhancedQuizComponent: React.FC<QuizProps> = ({ onComplete }) => {
  // State Management
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [dimensions, setDimensions] = useState({ L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 });
  const [personalityType, setPersonalityType] = useState<PersonalityType | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [streak, setStreak] = useState(0);

  // Quiz Questions based on SAYU's 4 axes
  const quizQuestions: QuizQuestion[] = useMemo(() => [
    // Intro Phase - Warm-up Questions
    {
      id: 1,
      phase: "intro",
      type: "scenario",
      title: "You're entering a new art exhibition for the first time",
      description: "As you step through the gallery entrance, what catches your attention?",
      scene: {
        background: "modern-gallery-entrance",
        ambiance: "bright and welcoming"
      },
      options: [
        {
          id: 'A',
          text: "The overall atmosphere and energy of the space",
          icon: <Palette className="w-6 h-6" />,
          weight: { A: 2, F: 1 },
          feedback: "You're drawn to the bigger picture and emotional atmosphere!",
          visual: "expansive-view"
        },
        {
          id: 'B',
          text: "Specific artworks and their technical details",
          icon: <Eye className="w-6 h-6" />,
          weight: { R: 2, C: 1 },
          feedback: "You appreciate concrete details and craftsmanship!",
          visual: "focused-detail"
        }
      ]
    },

    // Viewing Mode Assessment (L/S Axis)
    {
      id: 2,
      phase: "viewing-mode",
      type: "preference-slider",
      title: "Your ideal gallery experience",
      description: "How do you prefer to experience art?",
      sliders: [
        {
          id: "social-preference",
          leftOption: {
            text: "Exploring alone at my own pace",
            icon: "🚶‍♂️",
            weight: { L: 3 },
            description: "Introspective journey"
          },
          rightOption: {
            text: "Discussing with companions",
            icon: "👥",
            weight: { S: 3 },
            description: "Shared discoveries"
          }
        }
      ]
    },

    {
      id: 3,
      phase: "viewing-mode",
      type: "image-comparison",
      title: "Which gallery scene appeals to you more?",
      description: "Choose the environment where you'd feel most comfortable",
      options: [
        {
          id: 'lone',
          text: "Early morning, peaceful gallery",
          description: "Few visitors, contemplative atmosphere",
          weight: { L: 3 },
          tags: ["solitary", "introspective", "focused"]
        },
        {
          id: 'shared',
          text: "Opening night with many visitors",
          description: "Lively discussions and social energy",
          weight: { S: 3 },
          tags: ["social", "interactive", "dynamic"]
        }
      ]
    },

    // Perceptual Bias Assessment (A/R Axis)
    {
      id: 4,
      phase: "perceptual-bias",
      type: "artwork-reaction",
      title: "What draws you in this abstract painting?",
      artwork: {
        type: "abstract-expressionism",
        colorPalette: ["deep blues", "vibrant reds", "subtle grays"],
        texture: "dynamic brushstrokes"
      },
      options: [
        {
          id: 'atmospheric',
          text: "The mood and feeling it evokes",
          description: "Colors seem to dance with emotions",
          icon: <Heart className="w-5 h-5" />,
          weight: { A: 3 }
        },
        {
          id: 'realistic',
          text: "The technique and composition",
          description: "Analyzing brushwork and color theory",
          icon: <Grid className="w-5 h-5" />,
          weight: { R: 3 }
        }
      ]
    },

    {
      id: 5,
      phase: "perceptual-bias",
      type: "style-preference",
      title: "Which artistic approach resonates with you?",
      styles: [
        {
          id: 'atmospheric-style',
          name: "Symbolic & Impressionistic",
          description: "Art that suggests rather than defines",
          examples: ["Turner's landscapes", "Rothko's color fields"],
          weight: { A: 2, E: 1 },
          characteristics: ["ethereal", "suggestive", "emotional"]
        },
        {
          id: 'realistic-style',
          name: "Precise & Representational",
          description: "Art that captures reality accurately",
          examples: ["Vermeer's interiors", "Photorealism"],
          weight: { R: 2, M: 1 },
          characteristics: ["detailed", "accurate", "tangible"]
        }
      ]
    },

    // Reflection Style Assessment (E/M Axis)
    {
      id: 6,
      phase: "reflection-style",
      type: "emotional-mapping",
      title: "Standing before a powerful artwork",
      scenario: "You're facing a piece that clearly moves you. What happens next?",
      options: [
        {
          id: 'emotional-response',
          text: "I let the feelings wash over me",
          description: "Immersing in the emotional experience",
          weight: { E: 3 },
          emoji: "💭"
        },
        {
          id: 'meaning-analysis',
          text: "I seek to understand the artist's message",
          description: "Analyzing symbols and intentions",
          weight: { M: 3 },
          emoji: "🔍"
        }
      ]
    },

    {
      id: 7,
      phase: "reflection-style",
      type: "interpretation-exercise",
      title: "How do you process this installation?",
      installation: {
        description: "A room filled with mirrors and lights",
        elements: ["infinite reflections", "changing colors", "viewer participation"]
      },
      approaches: [
        {
          id: 'immersive',
          text: "Become part of the artwork",
          description: "Moving through space, feeling the light",
          weight: { E: 2, F: 1 }
        },
        {
          id: 'conceptual',
          text: "Decipher the artistic concept",
          description: "Understanding the theory behind it",
          weight: { M: 2, C: 1 }
        }
      ]
    },

    // Spatial Behavior Assessment (F/C Axis)
    {
      id: 8,
      phase: "spatial-behavior",
      type: "navigation-preference",
      title: "How do you explore a large museum?",
      scenario: "You have 3 hours in a major art museum",
      options: [
        {
          id: 'flow-exploration',
          text: "Wander freely, following my instincts",
          icon: <Map className="w-5 h-5" />,
          weight: { F: 3 },
          description: "Intuitive discovery"
        },
        {
          id: 'constructive-exploration',
          text: "Follow a planned route systematically",
          icon: <Grid className="w-5 h-5" />,
          weight: { C: 3 },
          description: "Methodical coverage"
        }
      ]
    },

    {
      id: 9,
      phase: "spatial-behavior",
      type: "exhibition-layout",
      title: "Your preferred exhibition design?",
      layouts: [
        {
          id: 'fluid-space',
          name: "Open, flowing galleries",
          description: "Spaces that merge and blend",
          weight: { F: 2, A: 1 }
        },
        {
          id: 'structured-space',
          name: "Clear, defined rooms",
          description: "Organized by theme or period",
          weight: { C: 2, R: 1 }
        }
      ]
    },

    // Integration Questions
    {
      id: 10,
      phase: "integration",
      type: "complex-scenario",
      title: "Your friend wants to visit a controversial exhibition with you",
      scenario: "The show challenges traditional art boundaries",
      responses: [
        {
          id: 'lone-atmospheric',
          text: "I'd prefer to see it alone first, to form my own impressions",
          weight: { L: 2, A: 1 }
        },
        {
          id: 'shared-realistic',
          text: "Great! We can discuss the artistic techniques together",
          weight: { S: 2, R: 1 }
        },
        {
          id: 'shared-emotional',
          text: "Yes! Sharing emotional reactions enriches the experience",
          weight: { S: 2, E: 1 }
        },
        {
          id: 'lone-meaning',
          text: "I need solitude to deeply analyze the artist's intentions",
          weight: { L: 2, M: 1 }
        }
      ]
    }
  ], []);

  // Handle answer selection with immediate feedback
  const handleAnswer = useCallback((questionId: number, selectedOption: any) => {
    // Update dimensions
    const newDimensions = { ...dimensions };
    if (selectedOption.weight) {
      Object.entries(selectedOption.weight).forEach(([dim, value]) => {
        newDimensions[dim as keyof typeof dimensions] += value as number;
      });
      setDimensions(newDimensions);
    }

    // Store response
    setResponses(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));

    // Show feedback
    if (selectedOption.feedback) {
      setFeedbackMessage(selectedOption.feedback);
      setShowFeedback(true);
      setTimeout(() => setShowFeedback(false), 2000);
    }

    // Update streak
    setStreak(prev => prev + 1);

    // Progress to next question
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        calculatePersonality();
      }
    }, 2500);
  }, [currentQuestion, dimensions, quizQuestions.length]);

  // Calculate final personality type
  const calculatePersonality = useCallback(() => {
    const type = 
      (dimensions.L > dimensions.S ? 'L' : 'S') +
      (dimensions.A > dimensions.R ? 'A' : 'R') +
      (dimensions.E > dimensions.M ? 'E' : 'M') +
      (dimensions.F > dimensions.C ? 'F' : 'C');
    
    const finalType = personalityTypes[type];
    setPersonalityType(finalType);
    setCurrentPhase('result');
    
    // Call onComplete with full results
    onComplete({
      personalityType: type,
      typeData: finalType,
      dimensions,
      responses,
      streak
    });
  }, [dimensions, responses, streak, onComplete]);

  // Scenario Question Component
  const ScenarioQuestion = React.memo(({ question }: { question: QuizQuestion }) => (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-3xl font-bold text-white mb-3 text-center"
        >
          {question.title}
        </motion.h2>
        
        {question.description && (
          <p className="text-gray-300 text-lg mb-8 text-center">
            {question.description}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {question.options?.map((option, index) => (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleAnswer(question.id, option)}
              className="group relative p-6 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl border border-white/20 hover:border-indigo-400/50 transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-indigo-500/20 rounded-full group-hover:bg-indigo-500/30 transition-colors">
                  {option.icon || option.emoji}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">
                {option.text}
              </h3>
              
              {option.description && (
                <p className="text-gray-400 text-sm">
                  {option.description}
                </p>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 to-purple-500/0 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 rounded-2xl transition-all duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  ));

  // Preference Slider Component
  const PreferenceSlider = React.memo(({ question }: { question: QuizQuestion }) => {
    const [sliderValue, setSliderValue] = useState(50);

    const handleSliderSubmit = () => {
      const slider = question.sliders?.[0];
      if (!slider) return;

      const weight: Record<string, number> = {};
      
      // Calculate weights based on slider position
      if (slider.leftOption.weight) {
        Object.entries(slider.leftOption.weight).forEach(([k, v]) => {
          weight[k] = (v as number) * (100 - sliderValue) / 100;
        });
      }
      if (slider.rightOption.weight) {
        Object.entries(slider.rightOption.weight).forEach(([k, v]) => {
          weight[k] = (weight[k] || 0) + (v as number) * sliderValue / 100;
        });
      }
      
      handleAnswer(question.id, { 
        weight,
        sliderValue,
        feedback: sliderValue > 50 ? "You lean towards shared experiences!" : "You prefer personal exploration!"
      });
    };

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-3 text-center">
            {question.title}
          </h2>
          <p className="text-gray-300 text-lg mb-8 text-center">
            {question.description}
          </p>

          {question.sliders?.map((slider) => (
            <div key={slider.id} className="space-y-8">
              <div className="flex justify-between mb-4">
                <div className="text-left">
                  <p className="text-white font-semibold flex items-center gap-2">
                    {slider.leftOption.icon} {slider.leftOption.text}
                  </p>
                  <p className="text-gray-400 text-sm">{slider.leftOption.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold flex items-center gap-2 justify-end">
                    {slider.rightOption.text} {slider.rightOption.icon}
                  </p>
                  <p className="text-gray-400 text-sm">{slider.rightOption.description}</p>
                </div>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${sliderValue}%, #374151 ${sliderValue}%, #374151 100%)`
                  }}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSliderSubmit}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
              >
                Continue <ChevronRight className="inline w-5 h-5 ml-2" />
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>
    );
  });

  // Generic Question Handler for other types
  const GenericQuestion = React.memo(({ question }: { question: QuizQuestion }) => {
    const handleOptionClick = (option: any) => {
      // Handle different question structures
      const optionData = {
        ...option,
        weight: option.weight || option.personality || {}
      };
      handleAnswer(question.id, optionData);
    };

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-lg rounded-3xl p-8 border border-white/10">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">{question.title}</h2>
          {question.description && <p className="text-gray-300 text-lg mb-8 text-center">{question.description}</p>}
          {question.scenario && <p className="text-gray-300 text-lg mb-8 text-center italic">{question.scenario}</p>}

          <div className="space-y-4">
            {(question.options || question.styles || question.approaches || question.responses || question.layouts || []).map((option: any, index: number) => (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleOptionClick(option)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 hover:border-indigo-400/50 transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-3">
                  {option.icon && <div className="mt-1">{option.icon}</div>}
                  {option.emoji && <span className="text-2xl">{option.emoji}</span>}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {option.text || option.name}
                    </h4>
                    {option.description && (
                      <p className="text-gray-400 text-sm mb-2">{option.description}</p>
                    )}
                    {option.tags && (
                      <div className="flex gap-2 flex-wrap">
                        {option.tags.map((tag: string) => (
                          <span key={tag} className="px-2 py-1 bg-indigo-500/20 rounded text-xs text-indigo-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {option.characteristics && (
                      <div className="flex gap-2 flex-wrap mt-2">
                        {option.characteristics.map((char: string) => (
                          <span key={char} className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                            {char}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  });

  // Render question based on type
  const renderQuestion = (question: QuizQuestion) => {
    switch (question.type) {
      case 'scenario':
      case 'image-comparison':
      case 'artwork-reaction':
      case 'navigation-preference':
        return <ScenarioQuestion question={question} />;
      case 'preference-slider':
        return <PreferenceSlider question={question} />;
      default:
        return <GenericQuestion question={question} />;
    }
  };

  // Real-time Personality Dimensions Display
  const PersonalityTracker = React.memo(() => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed top-4 right-4 bg-black/60 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hidden lg:block z-50"
    >
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Building Your Profile
      </h3>
      <div className="space-y-2 w-48">
        {[
          { axis: 'L/S', left: 'Lone', right: 'Shared', leftVal: dimensions.L, rightVal: dimensions.S },
          { axis: 'A/R', left: 'Atmospheric', right: 'Realistic', leftVal: dimensions.A, rightVal: dimensions.R },
          { axis: 'E/M', left: 'Emotional', right: 'Meaning', leftVal: dimensions.E, rightVal: dimensions.M },
          { axis: 'F/C', left: 'Flow', right: 'Constructive', leftVal: dimensions.F, rightVal: dimensions.C }
        ].map(({ axis, left, right, leftVal, rightVal }) => {
          const total = leftVal + rightVal || 1;
          const leftPercent = (leftVal / total) * 100;
          
          return (
            <div key={axis}>
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span>{left}</span>
                <span className="text-gray-500">{axis}</span>
                <span>{right}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${leftPercent}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {streak > 2 && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-4 flex items-center gap-2 text-yellow-400"
        >
          <Zap className="w-4 h-4" />
          <span className="text-sm font-semibold">{streak} streak!</span>
        </motion.div>
      )}
    </motion.div>
  ));

  // Results Display
  const ResultsDisplay = React.memo(() => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-lg rounded-3xl p-12 border border-white/20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <h2 className="text-5xl font-bold text-white mb-4">Your Art Personality</h2>
          <div className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full">
            <span className="text-3xl font-bold text-white">{personalityType?.name}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xl text-gray-300 text-center mb-8">
            {personalityType?.description}
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" /> Your Scene
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Environment: {personalityType?.scene.environment}</li>
                <li>• Behavior: {personalityType?.scene.behavior}</li>
                <li>• Visual Motif: {personalityType?.scene.visualMotif}</li>
                <li>• Avatar: {personalityType?.scene.avatar}</li>
              </ul>
            </div>

            <div className="bg-white/5 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" /> Your Traits
              </h3>
              <div className="flex flex-wrap gap-2">
                {personalityType?.traits.map((trait) => (
                  <span key={trait} className="px-3 py-1 bg-indigo-500/20 rounded-full text-sm text-indigo-300">
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Recommended Art Styles
            </h3>
            <div className="grid md:grid-cols-3 gap-3">
              {personalityType?.recommendations.map((rec) => (
                <div key={rec} className="p-3 bg-white/5 rounded-xl text-center text-gray-300">
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex gap-4 justify-center"
        >
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
            Share Your Type
          </button>
          <button className="px-6 py-3 bg-white/10 text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300">
            Explore Exhibitions
          </button>
        </motion.div>
      </div>
    </motion.div>
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {currentPhase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center max-w-3xl"
            >
              <motion.h1 
                initial={{ y: -30 }}
                animate={{ y: 0 }}
                className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
              >
                Discover Your Art Personality
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-300 mb-12"
              >
                Embark on a journey through art galleries to uncover your unique viewing style.
                Are you a Dreaming Wanderer, a Social Observer, or something entirely different?
              </motion.p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPhase('quiz')}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Begin Your Journey <ChevronRight className="inline w-5 h-5 ml-2" />
              </motion.button>
            </motion.div>
          )}

          {currentPhase === 'quiz' && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {renderQuestion(quizQuestions[currentQuestion])}
            </motion.div>
          )}

          {currentPhase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ResultsDisplay />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Personality Tracker (visible during quiz) */}
      {currentPhase === 'quiz' && <PersonalityTracker />}

      {/* Progress Indicator */}
      {currentPhase === 'quiz' && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-black/60 backdrop-blur-lg rounded-full px-6 py-3 border border-white/20">
            <div className="flex items-center gap-4">
              <Timer className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm font-medium">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <div className="w-32 h-1 bg-gray-700 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Toast */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-indigo-600/90 backdrop-blur-lg px-6 py-3 rounded-full text-white font-medium shadow-lg">
              <Sparkles className="inline w-4 h-4 mr-2" />
              {feedbackMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedQuizComponent;