'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface LinkedAccount {
  provider: 'google' | 'github' | 'apple';
  linked: boolean;
  profileImage?: string;
}

export function OAuthAccountManager() {
  const { user, linkOAuthAccount, unlinkOAuthAccount } = useAuth();
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchLinkedAccounts();
    }
  }, [user]);

  const fetchLinkedAccounts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/oauth-accounts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch linked accounts:', error);
    }
  };

  const handleLink = async (provider: string) => {
    setLoading(provider);
    try {
      await linkOAuthAccount(provider);
    } catch (error) {
      setLoading(null);
    }
  };

  const handleUnlink = async (provider: string) => {
    setLoading(provider);
    try {
      await unlinkOAuthAccount(provider);
      await fetchLinkedAccounts();
      setLoading(null);
    } catch (error) {
      setLoading(null);
    }
  };

  const providerInfo = {
    google: {
      name: 'Google',
      icon: '🔵',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    github: {
      name: 'GitHub', 
      icon: '⚫',
      color: 'bg-gray-800 hover:bg-gray-900'
    },
    apple: {
      name: 'Apple',
      icon: '🍎',
      color: 'bg-black hover:bg-gray-900'
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
      
      {['google', 'github', 'apple'].map((provider) => {
        const account = accounts.find(a => a.provider === provider);
        const info = providerInfo[provider as keyof typeof providerInfo];
        const isLinked = account?.linked || false;
        const isLoading = loading === provider;

        return (
          <div key={provider} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{info.icon}</span>
              <div>
                <p className="font-medium text-white">{info.name}</p>
                <p className="text-sm text-gray-400">
                  {isLinked ? 'Connected' : 'Not connected'}
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => isLinked ? handleUnlink(provider) : handleLink(provider)}
              disabled={isLoading}
              variant={isLinked ? 'outline' : 'default'}
              className={!isLinked ? info.color : ''}
              size="sm"
            >
              {isLoading ? 'Processing...' : (isLinked ? 'Disconnect' : 'Connect')}
            </Button>
          </div>
        );
      })}
      
      <p className="text-sm text-gray-400 mt-4">
        Connect your social accounts for easier login and account recovery.
      </p>
    </div>
  );
}