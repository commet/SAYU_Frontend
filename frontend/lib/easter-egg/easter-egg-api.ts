/**
 * Easter Egg API Client
 * Handles communication with backend for persistent easter egg tracking
 */

// import { getAuthToken } from '@/lib/auth';

// Temporary auth token getter
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface EasterEggDiscovery {
  eggId: string;
  discoveredAt: Date;
}

export interface EasterEggProgress {
  discoveries: Array<{
    egg_id: string;
    discovered_at: string;
    notification_shown: boolean;
    name: string;
    description: string;
    rarity: string;
    icon: string;
    category: string;
  }>;
  statistics: {
    total_discoveries: number;
    common_discoveries: number;
    rare_discoveries: number;
    epic_discoveries: number;
    legendary_discoveries: number;
    total_points: number;
  };
  totalEggs: number;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  personality_type: string;
  discoveries: number;
  total_points: number;
  last_discovery: string;
}

class EasterEggAPI {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/easter-eggs${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async reportDiscovery(discovery: EasterEggDiscovery): Promise<void> {
    try {
      await this.fetchWithAuth('/discover', {
        method: 'POST',
        body: JSON.stringify({
          eggId: discovery.eggId,
          discoveredAt: discovery.discoveredAt.toISOString(),
        }),
      });
    } catch (error) {
      console.error('Failed to report easter egg discovery:', error);
      // Don't throw - we don't want to break the user experience
    }
  }

  async getProgress(): Promise<EasterEggProgress | null> {
    try {
      const data = await this.fetchWithAuth('/progress');
      return data;
    } catch (error) {
      console.error('Failed to fetch easter egg progress:', error);
      return null;
    }
  }

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/easter-eggs/leaderboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      return data.leaderboard || [];
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      return [];
    }
  }

  async syncLocalDiscoveries(localDiscoveries: string[]): Promise<void> {
    try {
      // Get server progress
      const progress = await this.getProgress();
      if (!progress) return;

      const serverDiscoveries = new Set(progress.discoveries.map(d => d.egg_id));
      
      // Find discoveries that are local but not on server
      const unsynced = localDiscoveries.filter(id => !serverDiscoveries.has(id));
      
      // Report each unsynced discovery
      for (const eggId of unsynced) {
        await this.reportDiscovery({
          eggId,
          discoveredAt: new Date(), // Use current time for sync
        });
      }
    } catch (error) {
      console.error('Failed to sync discoveries:', error);
    }
  }
}

export const easterEggAPI = new EasterEggAPI();