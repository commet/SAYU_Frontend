// Simple in-memory rate limiter for API protection
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const entry = this.limits.get(identifier);

    if (!entry || now > entry.resetTime) {
      // New window or expired window
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry) return this.maxRequests;
    
    const now = Date.now();
    if (now > entry.resetTime) return this.maxRequests;
    
    return Math.max(0, this.maxRequests - entry.count);
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime + this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

// Export singleton instances for different API endpoints
export const chatbotRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
export const aiCouncilRateLimiter = new RateLimiter(5, 60000); // 5 requests per minute

// Cleanup old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    chatbotRateLimiter.cleanup();
    aiCouncilRateLimiter.cleanup();
  }, 300000);
}