// Quiz Results API Functions
import { createClient } from '@/lib/supabase/client';

interface QuizResults {
  personalityType: string;
  scores: Record<string, number>;
  responses: any[];
  completedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Get current auth token from Supabase
async function getAuthToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

// Save quiz results to backend
export async function saveQuizResults(results: QuizResults) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/quiz/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(results)
    });

    if (!response.ok) {
      throw new Error('Failed to save quiz results');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saving quiz results:', error);
    throw error;
  }
}

// Get user's quiz results from backend
export async function getQuizResults() {
  try {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/quiz/results`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz results');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }
}

// Save quiz results with automatic backend sync if user is logged in
export async function saveQuizResultsWithSync(results: QuizResults) {
  // Always save to localStorage first
  localStorage.setItem('quizResults', JSON.stringify(results));
  
  // Try to save to backend if user is logged in
  const token = await getAuthToken();
  if (token) {
    try {
      await saveQuizResults(results);
      console.log('Quiz results saved to backend successfully');
    } catch (error) {
      console.error('Failed to save to backend, but localStorage save succeeded:', error);
      // Don't throw error - localStorage save is sufficient
    }
  }
  
  return results;
}

// Migrate localStorage results to backend (called after login)
export async function migrateLocalQuizResults() {
  try {
    const localResults = localStorage.getItem('quizResults');
    if (!localResults) {
      return null;
    }
    
    const results = JSON.parse(localResults);
    const savedResult = await saveQuizResults(results);
    
    // Optionally remove from localStorage after successful migration
    // localStorage.removeItem('quizResults');
    
    return savedResult;
  } catch (error) {
    console.error('Failed to migrate local quiz results:', error);
    throw error;
  }
}