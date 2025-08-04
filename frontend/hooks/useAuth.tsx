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
  const createAuthUser = (supabaseUser: User, userProfile: UserProfile | null): AuthUser => {
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
    
    return {
      id: supabaseUser.id,
      auth: supabaseUser,
      profile: userProfile,
      nickname: displayName,
      agencyLevel: userProfile?.personality_type || 'novice',
      journeyStage: userProfile ? 'active' : 'onboarding',
      hasProfile: !!userProfile,
      typeCode: userProfile?.personality_type || null,
      archetypeName: userProfile?.personality_type || null,
    };
  };

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile fetch error:', error);
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
      console.error('Profile creation error:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        // Get initial session
        console.log('useAuth - Getting initial session...');
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        
        // Get session
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('useAuth - getSession completed:', { session: session?.user?.email, error });
        
        if (error) {
          console.error('useAuth - Session error:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('useAuth - Initial session:', session);
        
        if (!mounted) return;
        
        setSession(session);
        
        if (session?.user) {
          console.log('useAuth - Session user found:', session.user.id);
          try {
            const profile = await fetchProfile(session.user.id);
            
            if (!mounted) return;
            
            if (!profile && session.user) {
              console.log('useAuth - No profile found, creating new profile');
              const newProfile = await createProfile(session.user);
              if (mounted) {
                setProfile(newProfile);
                setUser(createAuthUser(session.user, newProfile));
              }
            } else {
              console.log('useAuth - Profile found:', profile);
              if (mounted) {
                setProfile(profile);
                setUser(createAuthUser(session.user, profile));
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
          setLoading(false);
        }
      } catch (error) {
        console.error('useAuth - Initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      
      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id);
        
        if (!userProfile) {
          userProfile = await createProfile(session.user);
        }
        
        setProfile(userProfile);
        setUser(createAuthUser(session.user, userProfile));
      } else {
        setProfile(null);
        setUser(null);
      }
      
      setLoading(false);

      // Handle auth events
      console.log('Auth event:', event, 'Session:', !!session, 'User:', session?.user?.email);
      
      // Only redirect on explicit sign out, not on session refresh or token refresh
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to home');
        router.push('/');
      }
      // Remove automatic redirect on SIGNED_IN to prevent conflicts with callback redirect
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
    
    console.log('Sign in successful:', data);
    
    // Migrate localStorage quiz results to backend after successful login
    try {
      const { migrateLocalQuizResults } = await import('@/lib/quiz-api');
      await migrateLocalQuizResults();
      console.log('Quiz results migrated successfully');
    } catch (error) {
      console.error('Failed to migrate quiz results:', error);
      // Don't throw - login was successful
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
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