interface GuestData {
  quizResults?: {
    personalityType: string
    scores: Record<string, number>
    responses: any[]
    completedAt: string
  }
  savedArtworks: string[]
  viewedArtworks: string[]
  preferences: {
    styles: string[]
    moods: string[]
    themes: string[]
  }
  milestones: {
    quizCompleted: boolean
    firstArtworkSaved: boolean
    profileStarted: boolean
    threeArtworksSaved: boolean
  }
}

const GUEST_DATA_KEY = 'sayu_guest_data'
const GUEST_ID_KEY = 'sayu_guest_id'

export class GuestStorage {
  private static guestId: string | null = null

  static getGuestId(): string {
    if (!this.guestId) {
      this.guestId = localStorage.getItem(GUEST_ID_KEY)
      if (!this.guestId) {
        this.guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem(GUEST_ID_KEY, this.guestId)
      }
    }
    return this.guestId
  }

  static getData(): GuestData {
    const stored = localStorage.getItem(GUEST_DATA_KEY)
    if (!stored) {
      return {
        savedArtworks: [],
        viewedArtworks: [],
        preferences: {
          styles: [],
          moods: [],
          themes: []
        },
        milestones: {
          quizCompleted: false,
          firstArtworkSaved: false,
          profileStarted: false,
          threeArtworksSaved: false
        }
      }
    }
    return JSON.parse(stored)
  }

  static updateData(updates: Partial<GuestData>) {
    const current = this.getData()
    const updated = { ...current, ...updates }
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(updated))
    
    // Check milestones
    this.checkMilestones(updated)
    
    return updated
  }

  static saveQuizResults(results: GuestData['quizResults']) {
    return this.updateData({ 
      quizResults: results,
      milestones: {
        ...this.getData().milestones,
        quizCompleted: true
      }
    })
  }

  static addSavedArtwork(artworkId: string) {
    const data = this.getData()
    if (!data.savedArtworks.includes(artworkId)) {
      data.savedArtworks.push(artworkId)
      
      // Update milestones
      if (data.savedArtworks.length === 1) {
        data.milestones.firstArtworkSaved = true
      } else if (data.savedArtworks.length >= 3) {
        data.milestones.threeArtworksSaved = true
      }
      
      return this.updateData(data)
    }
    return data
  }

  static removeSavedArtwork(artworkId: string) {
    const data = this.getData()
    data.savedArtworks = data.savedArtworks.filter(id => id !== artworkId)
    return this.updateData(data)
  }

  static addViewedArtwork(artworkId: string) {
    const data = this.getData()
    if (!data.viewedArtworks.includes(artworkId)) {
      data.viewedArtworks.push(artworkId)
      // Keep only last 50 viewed
      if (data.viewedArtworks.length > 50) {
        data.viewedArtworks = data.viewedArtworks.slice(-50)
      }
      return this.updateData(data)
    }
    return data
  }

  static updatePreferences(prefs: Partial<GuestData['preferences']>) {
    const data = this.getData()
    data.preferences = { ...data.preferences, ...prefs }
    return this.updateData(data)
  }

  private static checkMilestones(data: GuestData) {
    // Trigger conversion prompts based on milestones
    if (data.milestones.firstArtworkSaved && !data.milestones.profileStarted) {
      // Could trigger a subtle prompt to create profile
      window.dispatchEvent(new CustomEvent('guest-milestone', { 
        detail: { milestone: 'first_save' }
      }))
    }
    
    if (data.milestones.threeArtworksSaved) {
      window.dispatchEvent(new CustomEvent('guest-milestone', { 
        detail: { milestone: 'collection_started' }
      }))
    }
  }

  static clearData() {
    localStorage.removeItem(GUEST_DATA_KEY)
    localStorage.removeItem(GUEST_ID_KEY)
    this.guestId = null
  }

  static exportForUser() {
    // Format guest data for database migration
    const data = this.getData()
    return {
      personalityType: data.quizResults?.personalityType,
      personalityData: data.quizResults?.scores,
      savedArtworks: data.savedArtworks,
      preferences: data.preferences,
      analytics: {
        viewedArtworks: data.viewedArtworks,
        milestones: data.milestones
      }
    }
  }
}