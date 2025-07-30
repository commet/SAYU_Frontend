/**
 * Easter Egg Service
 * Tracks and manages user's easter egg discoveries
 */

import { 
  EasterEgg, 
  UserEasterEggProgress, 
  Badge,
  checkEasterEgg,
  getAllEasterEggs,
  getEasterEggById,
  getBadgeById,
  calculateUserPoints,
  getUserTitle,
  ACTION_EASTER_EGGS,
  TIME_EASTER_EGGS,
  COMMAND_EASTER_EGGS
} from '@/types/sayu-shared';
import { easterEggAPI } from './easter-egg-api';

export class EasterEggService {
  private static instance: EasterEggService;
  private progress: UserEasterEggProgress | null = null;
  private discoveryCallbacks: ((discovery: EasterEggDiscovery) => void)[] = [];

  private constructor() {
    this.loadProgress();
    this.setupEventListeners();
    this.startTimeBasedChecks();
  }

  static getInstance(): EasterEggService {
    if (!EasterEggService.instance) {
      EasterEggService.instance = new EasterEggService();
    }
    return EasterEggService.instance;
  }

  // Load user progress from localStorage
  private loadProgress() {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('easter_egg_progress');
    if (saved) {
      this.progress = JSON.parse(saved);
    } else {
      this.progress = this.createNewProgress();
    }
  }

  // Save progress to localStorage
  private saveProgress() {
    if (!this.progress || typeof window === 'undefined') return;
    localStorage.setItem('easter_egg_progress', JSON.stringify(this.progress));
  }

  // Create new progress object
  private createNewProgress(): UserEasterEggProgress {
    return {
      userId: this.generateUserId(),
      discoveredEggs: [],
      badges: [],
      titles: [],
      totalPoints: 0,
      statistics: {
        totalDiscoveries: 0,
        commonDiscoveries: 0,
        rareDiscoveries: 0,
        epicDiscoveries: 0,
        legendaryDiscoveries: 0
      }
    };
  }

  // Generate anonymous user ID
  private generateUserId(): string {
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Setup global event listeners
  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Track theme switches
    this.trackThemeSwitches();

    // Track Konami code
    this.trackKonamiCode();

    // Track page visits
    this.trackPageVisits();

    // Track quiz retakes
    this.trackQuizRetakes();
  }

  // Track theme switch count
  private trackThemeSwitches() {
    const originalSetAttribute = Element.prototype.setAttribute;
    let switchCount = parseInt(localStorage.getItem('theme_switch_count') || '0');

    Element.prototype.setAttribute = function(name: string, value: string) {
      if (name === 'data-theme' && this === document.documentElement) {
        switchCount++;
        localStorage.setItem('theme_switch_count', switchCount.toString());
        
        // Check theme switcher easter egg
        EasterEggService.getInstance().checkActionEasterEgg('theme_switcher', { count: switchCount });
      }
      return originalSetAttribute.call(this, name, value);
    };
  }

  // Track Konami code
  private trackKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    window.addEventListener('keydown', (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          this.checkSequenceEasterEgg('konami_code', { sequence: konamiCode });
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  // Track page visits for explorer easter egg
  private trackPageVisits() {
    if (!window.location.pathname.includes('/personality-types/')) return;

    const visitedTypes = JSON.parse(localStorage.getItem('visited_personality_types') || '[]');
    const currentType = window.location.pathname.split('/').pop();
    
    if (currentType && !visitedTypes.includes(currentType)) {
      visitedTypes.push(currentType);
      localStorage.setItem('visited_personality_types', JSON.stringify(visitedTypes));
      
      // Check explorer easter egg
      this.checkActionEasterEgg('explorer', { count: visitedTypes.length });
    }
  }

  // Track quiz retakes
  private trackQuizRetakes() {
    if (window.location.pathname === '/quiz') {
      const retakeCount = parseInt(localStorage.getItem('quiz_retake_count') || '0');
      localStorage.setItem('quiz_retake_count', (retakeCount + 1).toString());
      
      // Check perfectionist easter egg
      this.checkActionEasterEgg('perfectionist', { count: retakeCount + 1 });
    }
  }

  // Start time-based checks
  private startTimeBasedChecks() {
    if (typeof window === 'undefined') return;

    // Check time-based easter eggs on load
    this.checkTimeBasedEasterEggs();

    // Check every minute
    setInterval(() => {
      this.checkTimeBasedEasterEggs();
    }, 60000);
  }

  // Check time-based easter eggs
  private checkTimeBasedEasterEggs() {
    const now = new Date();
    const localHour = now.getHours();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Check night owl
    this.checkTimeEasterEgg('night_owl', { localHour });

    // Check early bird
    this.checkTimeEasterEgg('early_bird', { localHour });

    // Check halloween
    this.checkTimeEasterEgg('halloween_spirit', { month, day });

    // Check full moon (simplified - would need lunar calendar API for accuracy)
    const lunarPhase = this.getSimplifiedLunarPhase(now);
    this.checkTimeEasterEgg('full_moon', { lunarPhase });
  }

  // Simplified lunar phase calculation
  private getSimplifiedLunarPhase(date: Date): string {
    // This is a very simplified calculation
    // In production, use a proper lunar calendar API
    const dayOfMonth = date.getDate();
    if (dayOfMonth >= 14 && dayOfMonth <= 16) {
      return 'full';
    }
    return 'other';
  }

  // Check action-based easter egg
  public checkActionEasterEgg(eggId: string, context: any) {
    const egg = ACTION_EASTER_EGGS.find(e => e.id === eggId);
    if (!egg || !this.progress) return;

    if (this.progress.discoveredEggs.includes(eggId)) return;

    if (checkEasterEgg(egg, context)) {
      this.discoverEasterEgg(egg);
    }
  }

  // Check time-based easter egg
  private checkTimeEasterEgg(eggId: string, context: any) {
    const egg = TIME_EASTER_EGGS.find(e => e.id === eggId);
    if (!egg || !this.progress) return;

    if (this.progress.discoveredEggs.includes(eggId)) return;

    if (checkEasterEgg(egg, context)) {
      this.discoverEasterEgg(egg);
    }
  }

  // Check command-based easter egg
  public checkCommandEasterEgg(command: string) {
    const egg = COMMAND_EASTER_EGGS.find(e => 
      e.condition.type === 'chat_command' && e.condition.value === command
    );
    
    if (!egg || !this.progress) return;
    if (this.progress.discoveredEggs.includes(egg.id)) return;

    this.discoverEasterEgg(egg);
  }

  // Check sequence-based easter egg
  private checkSequenceEasterEgg(eggId: string, context: any) {
    const egg = getAllEasterEggs().find(e => e.id === eggId);
    if (!egg || !this.progress) return;

    if (this.progress.discoveredEggs.includes(eggId)) return;

    if (checkEasterEgg(egg, context)) {
      this.discoverEasterEgg(egg);
    }
  }

  // Discover an easter egg
  private discoverEasterEgg(egg: EasterEgg) {
    if (!this.progress) return;

    // Add to discovered eggs
    this.progress.discoveredEggs.push(egg.id);
    this.progress.lastDiscoveryAt = new Date();

    // Update statistics
    this.progress.statistics.totalDiscoveries++;
    switch (egg.rarity) {
      case 'common':
        this.progress.statistics.commonDiscoveries++;
        break;
      case 'rare':
        this.progress.statistics.rareDiscoveries++;
        break;
      case 'epic':
        this.progress.statistics.epicDiscoveries++;
        break;
      case 'legendary':
        this.progress.statistics.legendaryDiscoveries++;
        break;
    }

    // Process reward
    if (egg.reward.type === 'badge') {
      const badge = getBadgeById(egg.reward.id);
      if (badge) {
        this.progress.badges.push(badge.id);
        this.progress.totalPoints = calculateUserPoints(this.progress.badges);
      }
    }

    // Save progress
    this.saveProgress();

    // Notify callbacks
    const discovery: EasterEggDiscovery = {
      egg,
      timestamp: new Date(),
      userProgress: this.progress
    };
    
    this.discoveryCallbacks.forEach(callback => callback(discovery));

    // Send to backend (if user is logged in)
    this.reportDiscoveryToBackend(egg);
  }

  // Report discovery to backend
  private async reportDiscoveryToBackend(egg: EasterEgg) {
    try {
      await easterEggAPI.reportDiscovery({
        eggId: egg.id,
        discoveredAt: new Date()
      });
      const token = localStorage.getItem('token');
      if (!token) return; // Only report if user is logged in

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/easter-eggs/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eggId: egg.id,
          discoveredAt: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to report easter egg discovery:', error);
    }
  }

  // Sync with backend on login
  public async syncWithBackend() {
    if (!this.progress) return;
    
    try {
      // Get local discoveries
      const localDiscoveries = this.progress.discoveredEggs;
      
      // Sync with backend
      await easterEggAPI.syncLocalDiscoveries(localDiscoveries);
      
      // Fetch updated progress from backend
      const serverProgress = await easterEggAPI.getProgress();
      if (serverProgress) {
        // Merge server discoveries with local ones
        const serverEggIds = serverProgress.discoveries.map(d => d.egg_id);
        const allDiscoveries = [...new Set([...localDiscoveries, ...serverEggIds])];
        
        // Update local progress
        this.progress.discoveredEggs = allDiscoveries;
        this.progress.totalPoints = serverProgress.statistics.total_points;
        this.saveProgress();
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
    }
  }

  // Subscribe to discovery events
  public onDiscovery(callback: (discovery: EasterEggDiscovery) => void) {
    this.discoveryCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.discoveryCallbacks.indexOf(callback);
      if (index > -1) {
        this.discoveryCallbacks.splice(index, 1);
      }
    };
  }

  // Get user progress
  public getProgress(): UserEasterEggProgress | null {
    return this.progress;
  }

  // Get discovered eggs
  public getDiscoveredEggs(): EasterEgg[] {
    if (!this.progress) return [];
    
    return this.progress.discoveredEggs
      .map(id => getEasterEggById(id))
      .filter(egg => egg !== undefined) as EasterEgg[];
  }

  // Get earned badges
  public getBadges(): Badge[] {
    if (!this.progress) return [];
    
    return this.progress.badges
      .map(id => getBadgeById(id))
      .filter(badge => badge !== undefined) as Badge[];
  }

  // Get current title
  public getCurrentTitle(): { title: string; titleKo: string } {
    if (!this.progress) return { title: 'Art Beginner', titleKo: '예술 입문자' };
    return getUserTitle(this.progress.totalPoints);
  }

  // Track custom action
  public trackAction(action: string, data?: any) {
    // Store custom actions for future easter eggs
    const actions = JSON.parse(localStorage.getItem('custom_actions') || '{}');
    actions[action] = (actions[action] || 0) + 1;
    localStorage.setItem('custom_actions', JSON.stringify(actions));

    // Check relevant easter eggs
    switch (action) {
      case 'cursor_click':
        this.checkActionEasterEgg('butterfly_effect', { count: actions[action] });
        break;
      case 'favorite_artwork':
        if (data?.artworkId) {
          const favorites = JSON.parse(localStorage.getItem('favorite_counts') || '{}');
          favorites[data.artworkId] = (favorites[data.artworkId] || 0) + 1;
          localStorage.setItem('favorite_counts', JSON.stringify(favorites));
          
          if (favorites[data.artworkId] >= 3) {
            this.checkActionEasterEgg('art_lover', { count: favorites[data.artworkId] });
          }
        }
        break;
    }
  }

  // Check if easter egg is discovered
  public isDiscovered(eggId: string): boolean {
    return this.progress?.discoveredEggs.includes(eggId) || false;
  }

  // Get hints for undiscovered eggs
  public getHints(): string[] {
    const hints: string[] = [];
    const allEggs = getAllEasterEggs();
    
    allEggs.forEach(egg => {
      if (!this.isDiscovered(egg.id) && egg.hints) {
        hints.push(...egg.hints);
      }
    });
    
    // Return random subset of hints
    return hints.sort(() => Math.random() - 0.5).slice(0, 3);
  }
}

// Types
export interface EasterEggDiscovery {
  egg: EasterEgg;
  timestamp: Date;
  userProgress: UserEasterEggProgress;
}