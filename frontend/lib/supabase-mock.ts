// Mock Supabase client for local testing without Supabase

// Simple EventEmitter for browser environment
class EventEmitter {
  private events: Map<string, Array<(...args: any[]) => void>> = new Map();

  on(event: string, listener: (...args: any[]) => void): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners) return false;
    
    listeners.forEach(listener => {
      try {
        listener(...args);
      } catch (error) {
        console.error('Error in event listener:', error);
      }
    });
    return true;
  }

  removeListener(event: string, listener: (...args: any[]) => void): this {
    const listeners = this.events.get(event);
    if (!listeners) return this;
    
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    return this;
  }
}

class MockChannel extends EventEmitter {
  private presence: Map<string, any> = new Map();
  private subscribed = false;

  on(event: string, listener: (...args: any[]) => void): this;
  on(event: string, config: any, callback: (payload: any) => void): this;
  on(event: string, configOrListener: any, callback?: (payload: any) => void): this {
    if (typeof configOrListener === 'function') {
      // Standard EventEmitter call
      return super.on(event, configOrListener);
    } else {
      // Supabase-style call with config
      const config = configOrListener;
      if (event === 'broadcast' && callback) {
        super.on(`broadcast:${config.event}`, callback);
      } else if (event === 'presence' && config.event === 'sync' && callback) {
        super.on('presence:sync', callback);
      }
      return this;
    }
  }

  async subscribe(callback?: (status: string) => void): Promise<void> {
    this.subscribed = true;
    if (callback) {
      setTimeout(() => callback('SUBSCRIBED'), 100);
    }
  }

  async track(data: any): Promise<void> {
    this.presence.set(data.userId, data);
    
    // 동적 참여자 수 시뮬레이션 (3-8명 사이)
    const currentUsers = this.presence.size;
    const targetUsers = Math.floor(Math.random() * 6) + 3; // 3-8명
    
    // 점진적으로 사용자 추가/제거
    if (currentUsers < targetUsers) {
      for (let i = currentUsers; i < targetUsers; i++) {
        this.presence.set(`mock-user-${i}`, {
          userId: `mock-user-${i}`,
          aptType: ['LAEF', 'SAEC', 'LRMF', 'SREC'][Math.floor(Math.random() * 4)]
        });
      }
    }
    
    this.emit('presence:sync');
  }

  send(message: any): void {
    if (message.type === 'broadcast') {
      // Simulate broadcast to other users
      setTimeout(() => {
        this.emit(`broadcast:${message.event}`, { payload: message.payload });
      }, 50);
    }
  }

  presenceState(): Record<string, any> {
    const state: Record<string, any> = {};
    this.presence.forEach((value, key) => {
      state[key] = value;
    });
    return state;
  }
}

class MockSupabaseClient {
  private channels: Map<string, MockChannel> = new Map();

  channel(name: string, options?: any): MockChannel {
    if (!this.channels.has(name)) {
      this.channels.set(name, new MockChannel());
    }
    return this.channels.get(name)!;
  }

  removeChannel(channel: MockChannel): void {
    // Find and remove the channel
    for (const [name, ch] of this.channels.entries()) {
      if (ch === channel) {
        this.channels.delete(name);
        break;
      }
    }
  }

  from(table: string) {
    return {
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => ({ 
            data: this.getMockData(table, column, value), 
            error: null 
          })
        }),
        gte: (column: string, value: any) => ({
          lt: (column2: string, value2: any) => ({
            single: async () => ({ 
              data: this.getMockData(table), 
              error: null 
            })
          })
        }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            then: async (resolve: any) => {
              resolve({ data: [this.getMockData(table)], error: null });
            }
          })
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: async () => ({ 
            data: { ...data, id: Math.random().toString(36).substr(2, 9) }, 
            error: null 
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          then: async (resolve: any) => {
            resolve({ error: null });
          }
        })
      })
    };
  }

  private getMockData(table: string, column?: string, value?: any): any {
    if (table === 'art_pulse_sessions') {
      return {
        id: 'mock-session-1',
        daily_challenge_id: 'mock-challenge-1',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
        status: 'active',
        participant_count: 5
      };
    }
    if (table === 'art_pulse_participations') {
      return {
        id: 'mock-participation-1',
        session_id: 'mock-session-1',
        user_id: 'mock-user-1',
        apt_type: 'LAEF',
        joined_at: new Date().toISOString(),
        touch_data: [],
        resonance_data: { type: null, intensity: 5, focusAreas: [], dwellTime: 0 }
      };
    }
    return null;
  }
}

// Export based on environment
let supabase: MockSupabaseClient | any;

if (process.env.NEXT_PUBLIC_USE_MOCK_SUPABASE === 'true' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('Using mock Supabase client for local testing');
  supabase = new MockSupabaseClient();
} else {
  // Use real Supabase in production
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export { supabase };