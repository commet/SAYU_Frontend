import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizVisuals from './QuizVisuals';
import { immersiveQuestions } from '../../data/immersiveQuestions';

const ImmersiveQuiz = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({ L: 0, S: 0, A: 0, R: 0, M: 0, E: 0, F: 0, C: 0 });
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Adaptive question selection based on current scores
  const getNextQuestion = () => {
    const answeredAxes = {
      LS: answers.filter(a => a.axes.includes('L') || a.axes.includes('S')).length,
      AR: answers.filter(a => a.axes.includes('A') || a.axes.includes('R')).length,
      ME: answers.filter(a => a.axes.includes('M') || a.axes.includes('E')).length,
      FC: answers.filter(a => a.axes.includes('F') || a.axes.includes('C')).length
    };

    // Find axis with least questions
    const minAxis = Object.entries(answeredAxes).reduce((min, [axis, count]) => 
      count < min.count ? { axis, count } : min, { axis: null, count: Infinity }
    );

    // Filter questions for underrepresented axis
    const availableQuestions = immersiveQuestions.filter(q => {
      const isAnswered = answers.some(a => a.questionId === q.id);
      const hasTargetAxis = minAxis.count < 2 && q.targetAxes?.includes(minAxis.axis);
      return !isAnswered && (minAxis.count < 2 ? hasTargetAxis : true);
    });

    return availableQuestions[0] || immersiveQuestions[currentQuestion];
  };

  const handleChoice = async (choice) => {
    setSelectedChoice(choice.id);
    setIsTransitioning(true);

    // Calculate scores
    const newScores = { ...scores };
    Object.entries(choice.weight || {}).forEach(([axis, value]) => {
      newScores[axis] = (newScores[axis] || 0) + value;
    });
    setScores(newScores);

    // Record answer
    const answer = {
      questionId: immersiveQuestions[currentQuestion].id,
      choice: choice.id,
      axes: Object.keys(choice.weight || {})
    };
    setAnswers([...answers, answer]);

    // Transition to next question
    setTimeout(() => {
      if (currentQuestion < 9) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedChoice(null);
        setIsTransitioning(false);
      } else {
        calculateResult();
      }
    }, 1000);
  };

  const calculateResult = () => {
    const personality = [
      scores.L > scores.S ? 'L' : 'S',
      scores.A > scores.R ? 'A' : 'R',
      scores.M > scores.E ? 'M' : 'E',
      scores.F > scores.C ? 'F' : 'C'
    ].join('');

    const confidence = calculateConfidence(scores);
    
    onComplete({
      type: personality,
      scores,
      confidence,
      answers
    });
  };

  const calculateConfidence = (scores) => {
    const diffs = [
      Math.abs(scores.L - scores.S),
      Math.abs(scores.A - scores.R),
      Math.abs(scores.M - scores.E),
      Math.abs(scores.F - scores.C)
    ];
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return Math.min(avgDiff * 10, 100);
  };

  const question = getNextQuestion();

  return (
    <div className="immersive-quiz-container">
      <style jsx>{`
        .immersive-quiz-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 20px;
        }

        .quiz-progress {
          position: absolute;
          top: 20px;
          width: 90%;
          max-width: 600px;
        }

        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          transition: width 0.5s ease;
        }

        .question-container {
          text-align: center;
          margin-bottom: 60px;
        }

        .narrative {
          font-size: 24px;
          color: #fff;
          font-weight: 300;
          letter-spacing: 1px;
          margin-bottom: 10px;
          opacity: 0.9;
        }

        .sub-narrative {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          font-style: italic;
        }

        .choices-container {
          display: flex;
          gap: 40px;
          flex-wrap: wrap;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .narrative {
            font-size: 20px;
          }
          
          .choices-container {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>

      {/* Progress Bar */}
      <div className="quiz-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="question-container"
        >
          <h2 className="narrative">{question.narrative.ko}</h2>
          {question.subNarrative && (
            <p className="sub-narrative">{question.subNarrative.ko}</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Visual Choices */}
      <div className="choices-container">
        {question.choices.map((choice) => (
          <QuizVisuals
            key={choice.id}
            choice={choice}
            isSelected={selectedChoice === choice.id}
            onSelect={() => handleChoice(choice)}
            disabled={isTransitioning}
          />
        ))}
      </div>
    </div>
  );
};

export default ImmersiveQuiz;