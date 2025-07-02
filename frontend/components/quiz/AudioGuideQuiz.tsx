'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  narrativeQuestions, 
  getPersonalizedTransition,
  encouragingFeedback,
  type NarrativeQuestion
} from '@/data/narrative-quiz-questions';
import { 
  getBackgroundForQuestion, 
  getPhaseByQuestion, 
  fallbackGradients 
} from '@/data/quiz-backgrounds';
import { EmotionalButton, EmotionalToast } from '@/components/emotional/EmotionalCard';
import { 
  ChevronRight, ChevronLeft, Home, Play, Pause, 
  SkipBack, SkipForward, Volume2, Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageToggle from '@/components/ui/LanguageToggle';
import '@/styles/audio-guide.css';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const AudioGuideQuiz: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showGalleryMap, setShowGalleryMap] = useState(false);

  const question = narrativeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / narrativeQuestions.length) * 100;
  const audioGuideNumber = String(currentQuestion + 1).padStart(3, '0');

  // Gallery room based on question phase
  const galleryRoom = {
    'curiosity': 'Entrance Hall',
    'exploration': 'Main Gallery',
    'revelation': 'Reflection Room'
  }[question.act];

  const handleGoBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.push('/quiz');
    }
  };

  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };

  const handleChoice = async (optionId: string) => {
    const selectedOption = question.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    // Save response
    const newResponse: QuizResponse = {
      questionId: question.id,
      choice: optionId,
      weight: selectedOption.weight,
      emotional: selectedOption.emotional
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Update personality scores
    const newScores = { ...personalityScores };
    Object.entries(selectedOption.weight).forEach(([key, value]) => {
      newScores[key as keyof typeof newScores] += value;
    });
    setPersonalityScores(newScores);

    // Show encouraging feedback
    if (currentQuestion % 3 === 2) {
      const message = encouragingFeedback[Math.floor(Math.random() * encouragingFeedback.length)];
      setEncouragementMessage(message);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }

    // Transition to next question or complete
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (currentQuestion < narrativeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        completeQuiz(updatedResponses, newScores);
      }
    }, 800);
  };

  const completeQuiz = (allResponses: QuizResponse[], finalScores: typeof personalityScores) => {
    // Calculate personality type
    const type = [
      finalScores.L > finalScores.S ? 'L' : 'S',
      finalScores.A > finalScores.R ? 'A' : 'R',
      finalScores.E > finalScores.M ? 'E' : 'M',
      finalScores.F > finalScores.C ? 'F' : 'C'
    ].join('');

    // Store results
    localStorage.setItem('quizResults', JSON.stringify({
      personalityType: type,
      scores: finalScores,
      responses: allResponses,
      completedAt: new Date().toISOString()
    }));

    // Navigate to results
    router.push(`/results?type=${type}`);
  };

  const getTransitionText = () => {
    if (currentQuestion === 0) return question.narrative.setup;
    
    const previousResponse = responses[responses.length - 1];
    if (previousResponse) {
      return getPersonalizedTransition(
        currentQuestion,
        currentQuestion + 1,
        previousResponse.choice
      );
    }
    
    return question.narrative.transition || '';
  };
  
  const phase = getPhaseByQuestion(currentQuestion + 1);
  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);
  
  return (
    <div className="audio-guide-quiz-container">
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageToggle variant="glass" />
      </div>
      
      {/* Audio Guide Device */}
      <motion.div 
        className="audio-guide-device"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <div className="device-screen">
          <div className="guide-number">{audioGuideNumber}</div>
          <div className="guide-title">{galleryRoom}</div>
          <div className="waveform-container">
            {audioPlaying && (
              <div className="waveform-animation">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.05}s` }} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="device-controls">
          <button className="control-btn" onClick={handleGoBack} disabled={currentQuestion === 0}>
            <SkipBack size={20} />
          </button>
          <button 
            className="control-btn play-pause" 
            onClick={() => setAudioPlaying(!audioPlaying)}
          >
            {audioPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button className="control-btn" disabled={currentQuestion === narrativeQuestions.length - 1}>
            <SkipForward size={20} />
          </button>
        </div>
        
        <div className="device-footer">
          <button className="footer-btn" onClick={() => setShowGalleryMap(true)}>
            <Map size={16} />
          </button>
          <div className="volume-indicator">
            <Volume2 size={16} />
          </div>
          <button className="footer-btn" onClick={handleExitQuiz}>
            <Home size={16} />
          </button>
        </div>
      </motion.div>

      {/* Gallery Room Experience */}
      <div className={cn(
        "gallery-room-experience",
        `phase-${phase}`
      )}
      style={{
        backgroundImage: backgroundData.backgrounds && backgroundData.backgrounds.length > 0
          ? `url(${backgroundData.backgrounds[currentQuestion % backgroundData.backgrounds.length]})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Gradient Overlay */}
        <div className={cn(
          "gallery-overlay",
          backgroundData.overlay.color
        )} style={{ opacity: backgroundData.overlay.opacity }} />

        {/* Main Content */}
        <div className="gallery-content">
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="question-artwork-frame"
              >
                {/* Gallery Room Title */}
                <motion.div 
                  className="room-plaque"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3>{galleryRoom}</h3>
                  <p>Stop {currentQuestion + 1} of {narrativeQuestions.length}</p>
                </motion.div>

                {/* Narrative Setup */}
                {(question.narrative.setup || question.narrative.transition) && (
                  <motion.p
                    className="narrative-text"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {language === 'ko' && question.narrative.setup_ko ? 
                      (currentQuestion === 0 ? question.narrative.setup_ko : 
                       question.narrative.transition_ko || getTransitionText()) :
                      getTransitionText()
                    }
                  </motion.p>
                )}

                {/* Question as Artwork Title */}
                <motion.h2
                  className="question-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {language === 'ko' && question.question_ko ? question.question_ko : question.question}
                </motion.h2>

                {/* Choice Labels as Museum Plaques */}
                <motion.div 
                  className="choice-labels"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {question.options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <button
                        className="museum-label"
                        onClick={() => handleChoice(option.id)}
                      >
                        <div className="label-header">
                          <span className="label-number">{index === 0 ? 'A' : 'B'}</span>
                          <span className="label-indicator">Tap to select</span>
                        </div>
                        <div className="label-content">
                          <h4>{language === 'ko' && option.text_ko ? option.text_ko : option.text}</h4>
                          {option.subtext && (
                            <p className="label-subtext">
                              {language === 'ko' && option.subtext_ko ? option.subtext_ko : option.subtext}
                            </p>
                          )}
                        </div>
                        <div className="label-footer">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Atmosphere indicator */}
                {question.narrative.atmosphere && (
                  <motion.div
                    className="atmosphere-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.9 }}
                  >
                    <p>Gallery atmosphere: {question.narrative.atmosphere}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gallery Map Modal */}
      <AnimatePresence>
        {showGalleryMap && (
          <motion.div
            className="gallery-map-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGalleryMap(false)}
          >
            <motion.div
              className="map-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Gallery Journey Map</h3>
              <div className="map-rooms">
                <div className={`map-room ${question.act === 'curiosity' ? 'active' : ''}`}>
                  <span className="room-number">1-5</span>
                  <span className="room-name">Entrance Hall</span>
                </div>
                <div className={`map-room ${question.act === 'exploration' ? 'active' : ''}`}>
                  <span className="room-number">6-10</span>
                  <span className="room-name">Main Gallery</span>
                </div>
                <div className={`map-room ${question.act === 'revelation' ? 'active' : ''}`}>
                  <span className="room-number">11-15</span>
                  <span className="room-name">Reflection Room</span>
                </div>
              </div>
              <p className="current-location">You are here: Stop {currentQuestion + 1}</p>
              <button 
                className="close-map"
                onClick={() => setShowGalleryMap(false)}
              >
                Close Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement Toast */}
      <EmotionalToast
        message={encouragementMessage}
        emoji="✨"
        isVisible={showEncouragement}
      />
      
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="exit-confirm-modal"
            onClick={() => setShowExitConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="exit-confirm-content"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>End Gallery Tour?</h3>
              <p>Your progress will be lost. Are you sure you want to exit?</p>
              <div className="exit-buttons">
                <button onClick={() => router.push('/')} className="btn-exit">
                  Yes, exit tour
                </button>
                <button onClick={() => setShowExitConfirm(false)} className="btn-continue">
                  Continue tour
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};