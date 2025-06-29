'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
  loading: boolean;
  setTokens: (accessToken: string, refreshToken: string) => void;
  linkOAuthAccount: (provider: string) => Promise<void>;
  unlinkOAuthAccount: (provider: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshPromise, setRefreshPromise] = useState<Promise<string | null> | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    // If there's already a refresh in progress, return that promise
    if (refreshPromise) {
      return refreshPromise;
    }

    const refreshTokenValue = localStorage.getItem('refreshToken');
    if (!refreshTokenValue) {
      return null;
    }

    const promise = (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refreshTokenValue })
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          return data.accessToken;
        } else {
          // Refresh failed, clear tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
          return null;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setUser(null);
        return null;
      } finally {
        setRefreshPromise(null);
      }
    })();

    setRefreshPromise(promise);
    return promise;
  }, [refreshPromise]);

  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    let token = localStorage.getItem('token');
    
    const makeRequest = async (authToken: string) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${authToken}`
        }
      });
    };

    if (!token) {
      throw new Error('No token available');
    }

    let response = await makeRequest(token);

    // If token expired, try to refresh
    if (response.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        response = await makeRequest(newToken);
      } else {
        throw new Error('Authentication failed');
      }
    }

    return response;
  }, [refreshToken]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`);
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Try to refresh token
        const newToken = await refreshToken();
        if (newToken) {
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${newToken}` }
            });
            if (res.ok) {
              const data = await res.json();
              setUser(data.user);
            }
          } catch (retryError) {
            console.error('Retry auth check failed:', retryError);
          }
        }
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) throw new Error('Login failed');

    const data = await res.json();
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    toast.success('Welcome back!');
    router.push(data.user.hasProfile ? '/journey' : '/quiz');
  };

  const register = async (formData: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!res.ok) throw new Error('Registration failed');

    const data = await res.json();
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
    toast.success('Welcome to SAYU!');
    router.push('/quiz');
  };

  const logout = async () => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue })
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/');
  };

  const logoutAll = async () => {
    try {
      await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout-all`, {
        method: 'POST'
      });
      toast.success('Logged out from all devices');
    } catch (error) {
      console.error('Logout all failed:', error);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/');
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    checkAuth();
  };

  const linkOAuthAccount = async (provider: string) => {
    try {
      const res = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/link/${provider}`, {
        method: 'POST'
      });
      
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      toast.error(`Failed to link ${provider} account`);
      throw error;
    }
  };

  const unlinkOAuthAccount = async (provider: string) => {
    try {
      await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/unlink/${provider}`, {
        method: 'DELETE'
      });
      toast.success(`${provider} account unlinked successfully`);
      await checkAuth(); // Refresh user data
    } catch (error) {
      toast.error(`Failed to unlink ${provider} account`);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      logoutAll, 
      refreshToken, 
      loading, 
      setTokens,
      linkOAuthAccount,
      unlinkOAuthAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
