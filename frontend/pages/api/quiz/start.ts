import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';

// Initialize Supabase admin client
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
    const { sessionType, language = 'ko', userPreferences } = req.body;
    
    // Get auth token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create quiz session
    const { data: session, error: sessionError } = await supabase
      .from('quiz_sessions')
      .insert({
        user_id: profile.id,
        session_id: sessionId,
        status: 'in_progress',
        language,
        current_question_index: 0,
        personality_scores: {}
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Failed to create quiz session:', sessionError);
      return res.status(500).json({ error: 'Failed to start quiz' });
    }

    // Get first question based on session type
    const questions = sessionType === 'exhibition' 
      ? exhibitionQuestions 
      : artworkQuestions.core;
    
    const firstQuestion = questions[0];

    // Transform question format for frontend
    const transformedQuestion = {
      id: firstQuestion.id,
      text: firstQuestion.text[language] || firstQuestion.text.ko,
      options: firstQuestion.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text[language] || opt.text.ko,
        description: opt.description?.[language] || opt.description?.ko
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.session_id,
        sessionType,
        totalQuestions: sessionType === 'exhibition' ? 14 : 12,
        currentQuestion: 1,
        question: transformedQuestion,
        progress: 0
      }
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}