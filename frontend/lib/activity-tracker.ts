// Activity Tracking Service for SAYU
// Batches and optimizes activity tracking requests

export type ActivityType = 
  | 'view_artwork'
  | 'save_artwork'
  | 'like_artwork'
  | 'view_exhibition'
  | 'save_exhibition'
  | 'record_exhibition'
  | 'write_comment'
  | 'follow_user'
  | 'create_collection'
  | 'join_community'
  | 'complete_quiz'
  | 'profile_visit';

export interface Activity {
  activity_type: ActivityType;
  target_id?: string;
  target_type?: string;
  target_title?: string;
  target_subtitle?: string;
  target_image_url?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

class ActivityTracker {
  private queue: Activity[] = [];
  private timer: NodeJS.Timeout | null = null;
  private isOnline: boolean = true;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY = 5000; // 5 seconds
  private readonly STORAGE_KEY = 'sayu_activity_queue';

  constructor() {
    // Load queued activities from localStorage
    this.loadQueueFromStorage();
    
    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
      window.addEventListener('beforeunload', () => this.flush());
      
      this.isOnline = navigator.onLine;
    }
  }

  // Track a single activity
  track(activity: Activity) {
    // Add timestamp if not provided
    if (!activity.timestamp) {
      activity.timestamp = new Date().toISOString();
    }

    // Add to queue
    this.queue.push(activity);
    this.saveQueueToStorage();

    // Check if we should flush
    if (this.queue.length >= this.BATCH_SIZE) {
      this.flush();
    } else if (!this.timer) {
      this.startTimer();
    }
  }

  // Track common activities with convenience methods
  trackArtworkView(artwork: { id: string; title: string; artist?: string; image?: string }) {
    this.track({
      activity_type: 'view_artwork',
      target_id: artwork.id,
      target_type: 'artwork',
      target_title: artwork.title,
      target_subtitle: artwork.artist,
      target_image_url: artwork.image
    });
  }

  trackExhibitionView(exhibition: { id: string; title: string; venue?: string; image?: string }) {
    this.track({
      activity_type: 'view_exhibition',
      target_id: exhibition.id,
      target_type: 'exhibition',
      target_title: exhibition.title,
      target_subtitle: exhibition.venue,
      target_image_url: exhibition.image
    });
  }

  trackCollectionSave(collection: { id: string; name: string; artworkCount?: number }) {
    this.track({
      activity_type: 'create_collection',
      target_id: collection.id,
      target_type: 'collection',
      target_title: collection.name,
      metadata: { artworkCount: collection.artworkCount }
    });
  }

  trackQuizComplete(quizType: string, result?: string) {
    this.track({
      activity_type: 'complete_quiz',
      target_type: 'quiz',
      target_title: quizType,
      metadata: { result }
    });
  }

  // Flush the queue
  async flush() {
    if (this.queue.length === 0) return;
    
    // Clear timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Don't flush if offline
    if (!this.isOnline) {
      console.log('Offline - activities queued for later');
      return;
    }

    // Copy and clear queue
    const activities = [...this.queue];
    this.queue = [];
    this.saveQueueToStorage();

    try {
      // Send batch request
      const response = await fetch('/api/activities/track', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activities })
      });

      if (!response.ok) {
        // If failed, add back to queue
        this.queue.unshift(...activities);
        this.saveQueueToStorage();
        console.error('Failed to track activities:', response.statusText);
      } else {
        console.log(`Successfully tracked ${activities.length} activities`);
      }
    } catch (error) {
      // Network error - add back to queue
      this.queue.unshift(...activities);
      this.saveQueueToStorage();
      console.error('Error tracking activities:', error);
    }
  }

  // Start the flush timer
  private startTimer() {
    if (this.timer) return;
    
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, this.BATCH_DELAY);
  }

  // Handle going online
  private handleOnline() {
    this.isOnline = true;
    console.log('Back online - flushing activity queue');
    this.flush();
  }

  // Handle going offline
  private handleOffline() {
    this.isOnline = false;
    console.log('Gone offline - activities will be queued');
  }

  // Save queue to localStorage
  private saveQueueToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save activity queue:', error);
    }
  }

  // Load queue from localStorage
  private loadQueueFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
        // Start flush timer if queue has items
        if (this.queue.length > 0) {
          this.startTimer();
        }
      }
    } catch (error) {
      console.error('Failed to load activity queue:', error);
    }
  }

  // Get queue size (for debugging)
  getQueueSize() {
    return this.queue.length;
  }

  // Clear queue (for debugging)
  clearQueue() {
    this.queue = [];
    this.saveQueueToStorage();
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// Singleton instance
let trackerInstance: ActivityTracker | null = null;

export function getActivityTracker(): ActivityTracker {
  if (!trackerInstance && typeof window !== 'undefined') {
    trackerInstance = new ActivityTracker();
  }
  return trackerInstance!;
}

// Helper function for immediate tracking (no batching)
export async function trackActivityImmediate(activity: Activity): Promise<boolean> {
  try {
    const response = await fetch('/api/activities/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(activity)
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to track activity immediately:', error);
    return false;
  }
}