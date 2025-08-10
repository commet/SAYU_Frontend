'use client'

import { useEffect, useState } from 'react'
import { useUser } from './use-user'
import { apiClient } from '@/lib/api-client'

interface UserProfile {
  id: string
  email: string
  personalityType?: string
  animalType?: string
  name?: string
  avatar?: string
}

export function useUserProfile() {
  const { user, loading: userLoading } = useUser()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || userLoading) {
      setLoading(userLoading)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        // Temporarily disable API call
        // const data = await apiClient.get<{ profile: UserProfile }>('/api/profile')
        
        // Use default profile data
        const profileData = {
          id: user.id || 'default',
          email: user.email || 'user@example.com',
          name: user.name || 'User',
          personalityType: 'LAEF',
          animalType: 'cat'
        }
        
        setProfile(profileData)
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
        setError('Failed to load profile')
        
        // Set default profile
        setProfile({
          id: user.id,
          email: user.email || '',
          personalityType: 'LAEF' // Default to Fox
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, userLoading])

  return { 
    user: profile, 
    loading, 
    error,
    personalityType: profile?.personalityType || 'LAEF'
  }
}