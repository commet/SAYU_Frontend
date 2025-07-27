import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Import quiz questions
import exhibitionQuestions from '@/data/exhibitionQuestions.json';
import artworkQuestions from '@/data/artworkQuestions.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId, questionId, answer: choiceId, timeSpent } = req.body;

    // Verify user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Verify session ownership
    if (session.user_id !== profile.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Determine question dimension and score impact
    const dimension = getQuestionDimension(questionId);
    const scoreImpact = calculateScoreImpact(questionId, choiceId);

    // Record answer
    const { error: answerError } = await supabase
      .from('quiz_answers')
      .insert({
        session_id: sessionId,
        question_id: questionId,
        choice_id: choiceId,
        dimension,
        score_impact: scoreImpact
      });

    if (answerError) {
      console.error('Failed to record answer:', answerError);
      return res.status(500).json({ error: 'Failed to record answer' });
    }

    // Update session progress
    const currentQuestionIndex = session.current_question_index + 1;
    const updatedScores = await updatePersonalityScores(sessionId);

    const { error: updateError } = await supabase
      .from('quiz_sessions')
      .update({
        current_question_index: currentQuestionIndex,
        personality_scores: updatedScores
      })
      .eq('session_id', sessionId);

    if (updateError) {
      console.error('Failed to update session:', updateError);
    }

    // Determine session type and next question
    const isExhibition = questionId.startsWith('q');
    const language = session.language || 'ko';
    
    let nextQuestion = null;
    let isComplete = false;

    if (isExhibition) {
      if (currentQuestionIndex < exhibitionQuestions.length) {
        nextQuestion = exhibitionQuestions[currentQuestionIndex];
      } else {
        isComplete = true;
      }
    } else {
      // Artwork quiz with branching
      if (currentQuestionIndex < 8) {
        nextQuestion = artworkQuestions.core[currentQuestionIndex];
      } else if (currentQuestionIndex === 8) {
        const branch = await determineBranch(sessionId);
        nextQuestion = artworkQuestions[branch][0];
      } else if (currentQuestionIndex < 12) {
        const branch = await getCurrentBranch(sessionId);
        const branchIndex = currentQuestionIndex - 8;
        nextQuestion = artworkQuestions[branch][branchIndex];
      } else {
        isComplete = true;
      }
    }

    // Handle quiz completion
    if (isComplete) {
      await completeQuiz(sessionId, profile.id);
      
      return res.status(200).json({
        success: true,
        data: {
          complete: true,
          message: 'Quiz completed successfully'
        }
      });
    }

    // Transform next question
    const transformedQuestion = nextQuestion ? {
      id: nextQuestion.id,
      text: nextQuestion.text[language] || nextQuestion.text.ko,
      options: nextQuestion.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text[language] || opt.text.ko,
        description: opt.description?.[language] || opt.description?.ko
      }))
    } : null;

    res.status(200).json({
      success: true,
      data: {
        currentQuestion: currentQuestionIndex + 1,
        totalQuestions: isExhibition ? 14 : 12,
        question: transformedQuestion,
        progress: currentQuestionIndex / (isExhibition ? 14 : 12),
        complete: false
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions
function getQuestionDimension(questionId: string): string {
  const dimensionMap: Record<string, string> = {
    'q1': 'G-S', 'q2': 'G-S', 'q3': 'A-R', 'q4': 'A-R',
    'q5': 'M-E', 'q6': 'M-E', 'q7': 'F-C', 'q8': 'F-C'
  };
  return dimensionMap[questionId] || 'unknown';
}

function calculateScoreImpact(questionId: string, choiceId: string): Record<string, number> {
  const allQuestions = [...exhibitionQuestions, ...artworkQuestions.core];
  const question = allQuestions.find((q: any) => q.id === questionId);
  
  if (!question) return {};
  
  const option = question.options.find((opt: any) => opt.id === choiceId);
  return option?.weight || {};
}

async function updatePersonalityScores(sessionId: string): Promise<Record<string, number>> {
  const { data: answers } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('session_id', sessionId);

  const scores: Record<string, number> = { G: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
  
  if (answers) {
    for (const answer of answers) {
      if (answer.score_impact) {
        Object.entries(answer.score_impact as Record<string, number>).forEach(([dimension, weight]) => {
          if (dimension in scores) {
            scores[dimension] += weight;
          }
        });
      }
    }
  }

  return scores;
}

async function determineBranch(sessionId: string): Promise<string> {
  const { data: answers } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('session_id', sessionId);

  if (!answers) return 'mixed';

  const aCount = answers.filter(a => a.choice_id === 'A').length;
  const bCount = answers.filter(a => a.choice_id === 'B').length;
  
  if (aCount > bCount * 1.5) return 'painting';
  if (bCount > aCount * 1.5) return 'multidimensional';
  return 'mixed';
}

async function getCurrentBranch(sessionId: string): Promise<string> {
  const { data: session } = await supabase
    .from('quiz_sessions')
    .select('personality_scores')
    .eq('session_id', sessionId)
    .single();

  return (session?.personality_scores as any)?.branch || 'mixed';
}

async function completeQuiz(sessionId: string, userId: string): Promise<void> {
  // Update session status
  await supabase
    .from('quiz_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('session_id', sessionId);

  // Check if both quizzes are complete
  const { data: sessions } = await supabase
    .from('quiz_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed');

  if (sessions && sessions.length >= 2) {
    // Generate profile if both quizzes complete
    // This would be handled by a separate API endpoint
    console.log('Both quizzes complete, profile generation needed');
  }
}