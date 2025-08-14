'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearAuth() {
  const router = useRouter()

  useEffect(() => {
    // Clear all auth-related data
    console.log('🧹 Clearing all auth data...')
    
    // Clear localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sayu'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => {
      console.log(`Removing localStorage: ${key}`)
      localStorage.removeItem(key)
    })
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear cookies via document.cookie
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    console.log('✅ All auth data cleared')
    
    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold">Clearing authentication data...</h1>
        <p className="text-gray-600 mt-2">You will be redirected to login page shortly.</p>
      </div>
    </div>
  )
}