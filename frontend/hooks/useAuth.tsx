import { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Database } from '@/lib/supabase/database.types';
import { AuthUser, UserProfile } from '@/types/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Helper function to create AuthUser from Supabase User and UserProfile
  const createAuthUser = (supabaseUser: User, userProfile: UserProfile | null, quizData?: any): AuthUser => {
    // Get display name from various sources in priority order:
    // 1. Profile username (if user set a custom nickname)
    // 2. OAuth provider name (Instagram, Facebook, etc.)
    // 3. Email username part
    let displayName = userProfile?.username || null;
    
    // If no custom username, check OAuth provider data
    if (!displayName && supabaseUser.user_metadata?.full_name) {
      displayName = supabaseUser.user_metadata.full_name;
    } else if (!displayName && supabaseUser.user_metadata?.name) {
      displayName = supabaseUser.user_metadata.name;
    } else if (!displayName && supabaseUser.user_metadata?.username) {
      displayName = supabaseUser.user_metadata.username;
    } else if (!displayName && supabaseUser.email) {
      // Fallback to email username part
      displayName = supabaseUser.email.split('@')[0];
    }
    
    // Get personality type from quiz data or profile
    const personalityType = quizData?.personality_type || userProfile?.personality_type || null;
    
    return {
      id: supabaseUser.id,
      auth: supabaseUser,
      profile: userProfile,
      nickname: displayName,
      agencyLevel: personalityType || 'novice',
      journeyStage: userProfile ? 'active' : 'onboarding',
      hasProfile: !!userProfile,
      typeCode: personalityType,
      archetypeName: personalityType,
      personalityType: personalityType,
      quizCompleted: !!quizData,
      aptType: personalityType,
    };
  };

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile found - this is expected for new users
          console.log('No profile found for user:', userId);
          return null;
        }
        
        console.error('Error fetching profile:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          statusCode: error.status,
          userId: userId
        });
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Profile fetch error:', error instanceof Error ? error.message : error);
      return null;
    }
  };

  // Fetch quiz results from database
  const fetchQuizResults = async (userId: string) => {
    try {
      // First find the user in users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, personality_type, quiz_completed')
        .eq('auth_id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError);
        return null;
      }

      if (!userData) {
        console.log('No user data found for auth_id:', userId);
        return null;
      }

      // Then fetch quiz results - skip if table doesn't exist or RLS blocks it
      try {
        const { data, error } = await supabase
          .from('quiz_results')
          .select('*')
          .eq('user_id', userData.id)
          .single();

        if (error) {
          // 406 = RLS policy issue, PGRST116 = no rows found - both are ok
          if (error.status !== 406 && error.code !== 'PGRST116') {
            console.error('Error fetching quiz results:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint,
              statusCode: error.status
            });
          }
          // If no quiz results, return user data which might have personality_type
          return userData.personality_type ? {
            personality_type: userData.personality_type,
            quiz_completed: userData.quiz_completed
          } : null;
        }
        
        console.log('Quiz results fetched from DB:', data?.personality_type);
        return data;
      } catch (err) {
        // Silently handle quiz_results table access issues
        return userData.personality_type ? {
          personality_type: userData.personality_type,
          quiz_completed: userData.quiz_completed
        } : null;
      }
    } catch (error) {
      console.error('Quiz fetch error:', error);
      return null;
    }
  };

  // Create user profile if it doesn't exist
  const createProfile = async (user: User) => {
    try {
      // Get the best available username from OAuth provider data
      let initialUsername = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.user_metadata?.username || 
                          user.email?.split('@')[0] || 
                          'User';
      
      console.log('Creating profile for user:', user.id, 'with username:', initialUsername);
      
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || `${user.id}@sayu.local`,
          username: initialUsername,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // If profile already exists, try to fetch it
        if (error.code === '23505') {
          return await fetchProfile(user.id);
        }
        return null;
      }

      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Profile creation error:', error instanceof Error ? error.message : error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let authInitialized = false;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        console.log('useAuth - Getting initial session...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        
        // Add small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('useAuth - getSession completed:', { session: session?.user?.email, error });
        
        if (error) {
          console.error('useAuth - Session error:', error);
          if (mounted) {
            setLoading(false);
            authInitialized = true;
          }
          return;
        }
        
        console.log('useAuth - Initial session:', session);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          console.log('useAuth - Session user found:', session.user.id);
          console.log('useAuth - User email:', session.user.email);
          try {
            const profile = await fetchProfile(session.user.id);
            const quizResults = await fetchQuizResults(session.user.id);
            
            if (!mounted) return;
            
            if (!profile && session.user) {
              console.log('useAuth - No profile found, creating new profile for:', session.user.email);
              const newProfile = await createProfile(session.user);
              if (mounted) {
                setProfile(newProfile);
                setUser(createAuthUser(session.user, newProfile, quizResults));
              }
            } else {
              console.log('useAuth - Profile found:', profile);
              console.log('useAuth - Quiz results:', quizResults?.personality_type);
              if (mounted) {
                setProfile(profile);
                setUser(createAuthUser(session.user, profile, quizResults));
              }
            }
          } catch (error) {
            console.error('useAuth - Profile error:', error);
          }
        } else {
          console.log('useAuth - No session found');
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          authInitialized = true;
          setLoading(false);
        }
      } catch (error) {
        console.error('useAuth - Initialization error:', error);
        if (mounted) {
          authInitialized = true;
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    // Set up session refresh interval
    const refreshInterval = setInterval(async () => {
      if (mounted) {
        const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
        if (!error && refreshedSession) {
          setSession(refreshedSession);
          console.log('🔄 Session refreshed automatically');
        }
      }
    }, 10 * 60 * 1000); // Refresh every 10 minutes

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, 'Session:', !!session, 'User:', session?.user?.email);
      
      // Handle token refresh events
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
        setSession(session);
        return;
      }
      
      // Wait for initial auth to complete before processing auth changes
      if (!authInitialized && event !== 'INITIAL_SESSION') {
        console.log('Auth not initialized yet, waiting...');
        return;
      }
      
      setSession(session);
      
      if (session?.user) {
        console.log('Processing auth change with user:', session.user.id);
        let userProfile = await fetchProfile(session.user.id);
        const quizResults = await fetchQuizResults(session.user.id);
        
        if (!userProfile) {
          console.log('Creating profile for auth change user');
          userProfile = await createProfile(session.user);
        }
        
        setProfile(userProfile);
        setUser(createAuthUser(session.user, userProfile, quizResults));
        
        // For OAuth login success, add small delay to ensure state is set
        if (event === 'SIGNED_IN') {
          setTimeout(() => {
            setLoading(false);
          }, 200);
        } else {
          setLoading(false);
        }
      } else {
        setProfile(null);
        setUser(null);
        setLoading(false);
      }
      
      // Only redirect on explicit sign out, not on session refresh or token refresh
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to home');
        router.push('/');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 Starting signIn process...');
    console.log('📧 Email:', email);
    console.log('🌐 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    try {
      console.log('🚀 Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📦 Supabase response received');
      console.log('❌ Error:', error);
      console.log('✅ Data:', data);

      if (error) {
        console.error('🔴 Sign in error:', error);
        console.error('🔴 Error message:', error.message);
        console.error('🔴 Error code:', error.status);
        throw error;
      }
      
      console.log('🎉 Sign in successful!');
      console.log('👤 User:', data.user?.email);
      console.log('🎫 Session:', !!data.session);
      
      // Migrate localStorage quiz results and guest data to backend after successful login
      try {
        const { migrateLocalQuizResults } = await import('@/lib/quiz-api');
        await migrateLocalQuizResults();
        console.log('Quiz results migrated successfully');
        
        // Also migrate guest collection data
        const { GuestStorage } = await import('@/lib/guest-storage');
        const guestData = GuestStorage.getData();
        
        if (guestData.savedArtworks.length > 0) {
          console.log(`Migrating ${guestData.savedArtworks.length} guest artworks to user account`);
          
          // Save guest collection to user's account
          try {
            const response = await fetch('/api/gallery/collection/migrate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: data.user.id,
                guestData: GuestStorage.exportForUser()
              })
            });
            
            if (response.ok) {
              console.log('Guest collection migrated successfully');
              // Clear guest data after successful migration
              GuestStorage.clearData();
            } else {
              console.error('Failed to migrate guest collection');
            }
          } catch (migrationError) {
            console.error('Guest data migration error:', migrationError);
          }
        }
      } catch (error) {
        console.error('Failed to migrate user data:', error);
        // Don't throw - login was successful
      }
    } catch (error) {
      console.error('🔴 Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    console.log('🔑 Starting signUp process...');
    console.log('📧 Email:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      console.error('🔴 Sign up error:', error);
      throw error;
    }
    
    console.log('✅ Sign up successful:', data);
    
    // If user is immediately available (no email confirmation required), migrate guest data
    if (data.user && data.session) {
      try {
        // Migrate guest data for immediate signups
        const { GuestStorage } = await import('@/lib/guest-storage');
        const guestData = GuestStorage.getData();
        
        if (guestData.savedArtworks.length > 0 || guestData.quizResults) {
          console.log('Migrating guest data after signup');
          
          const response = await fetch('/api/gallery/collection/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              guestData: GuestStorage.exportForUser()
            })
          });
          
          if (response.ok) {
            console.log('Guest data migrated after signup');
            GuestStorage.clearData();
          }
        }
      } catch (error) {
        console.error('Failed to migrate guest data after signup:', error);
        // Don't throw - signup was successful
      }
    }
    
    // Return success even if email confirmation is required
    return data;
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clear local state immediately for immediate UI update
      setUser(null);
      setProfile(null);
      setSession(null);
      
      // Clear user-related localStorage items
      const userDataKeys = [
        'token',
        'mockUser', 
        'activeSession',
        'sayu_visited_pages',
        'quizResults',
        'scenarioResponses',
        'lastQuizType',
        'artStylePreferences'
      ];
      
      userDataKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Cleared localStorage key: ${key}`);
        }
      });
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      console.log('Sign out successful - all user data cleared');
      
      // Redirect to home page after logout
      router.push('/');
    } catch (error) {
      console.error('Sign out failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) {
      throw new Error('No profile to update');
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);
  };

  const refreshUser = async () => {
    if (!session?.user) {
      console.log('refreshUser: No session or user');
      return;
    }

    try {
      console.log('refreshUser: Refreshing user data for:', session.user.id);
      
      // Fetch updated profile and quiz results
      const profile = await fetchProfile(session.user.id);
      const quizResults = await fetchQuizResults(session.user.id);
      
      if (profile) {
        console.log('refreshUser: Updated profile fetched:', profile);
        console.log('refreshUser: Quiz results:', quizResults?.personality_type);
        setProfile(profile);
        setUser(createAuthUser(session.user, profile, quizResults));
      } else {
        console.log('refreshUser: No profile found');
      }
    } catch (error) {
      console.error('refreshUser: Error refreshing user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// Export a helper to get fresh session
export async function getFreshSession() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    // Try to refresh
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
    return refreshedSession;
  }
  
  return session;
}