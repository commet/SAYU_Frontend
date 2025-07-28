import { useEffect, useState, createContext, useContext } from 'react';
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
  const supabase = createClient();

  // Helper function to create AuthUser from Supabase User and UserProfile
  const createAuthUser = (supabaseUser: User, userProfile: UserProfile | null): AuthUser => {
    return {
      auth: supabaseUser,
      profile: userProfile,
      nickname: userProfile?.username || null,
      agencyLevel: userProfile?.personality_type || 'novice',
      journeyStage: userProfile?.onboarding_completed ? 'active' : 'onboarding',
      hasProfile: !!userProfile,
      typeCode: userProfile?.personality_type || null,
      archetypeName: userProfile?.personality_type || null,
    };
  };

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
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
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_id: user.id,
          email: user.email!,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile creation error:', error);
      return null;
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(profile => {
          if (!profile && session.user) {
            createProfile(session.user).then(newProfile => {
              setProfile(newProfile);
              setUser(createAuthUser(session.user, newProfile));
            });
          } else {
            setProfile(profile);
            setUser(createAuthUser(session.user, profile));
          }
        });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

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
      if (event === 'SIGNED_IN') {
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
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
      .from('users')
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