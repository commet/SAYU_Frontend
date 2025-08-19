// Feature Flag System for SAYU
// Enables gradual rollout of new features and A/B testing

interface FeatureFlag {
  key: string;
  enabled: boolean;
  rolloutPercentage?: number; // 0-100, for gradual rollouts
  userIdHash?: boolean; // Whether to use userId for consistent user experience
  description?: string;
  expiresAt?: Date;
}

// Current feature flags configuration
const FEATURE_FLAGS: FeatureFlag[] = [
  {
    key: 'realtime_dashboard_stats',
    enabled: true,
    rolloutPercentage: 100,
    userIdHash: true,
    description: 'Use real-time database stats instead of mock data'
  },
  {
    key: 'redis_caching',
    enabled: true,
    rolloutPercentage: 80,
    userIdHash: true,
    description: 'Enable Redis caching for better performance'
  },
  {
    key: 'supabase_realtime',
    enabled: false,
    rolloutPercentage: 0,
    userIdHash: true,
    description: 'Enable Supabase realtime subscriptions'
  },
  {
    key: 'exhibition_recommendations',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Show AI-powered exhibition recommendations'
  },
  {
    key: 'community_features',
    enabled: false,
    rolloutPercentage: 30,
    userIdHash: true,
    description: 'Enable community interaction features'
  },
  {
    key: 'advanced_analytics',
    enabled: false,
    rolloutPercentage: 10,
    userIdHash: true,
    description: 'Track detailed user analytics and behavior'
  },
  {
    key: 'mobile_optimizations',
    enabled: true,
    rolloutPercentage: 100,
    description: 'Enhanced mobile experience features'
  },
  {
    key: 'pgvector_similarity',
    enabled: false,
    rolloutPercentage: 0,
    userIdHash: true,
    description: 'Use pgvector for artwork similarity matching'
  }
];

// Simple hash function for consistent user-based rollouts
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100; // Return 0-99
}

// Check if a feature is enabled for a specific user
export function isFeatureEnabled(
  flagKey: string, 
  userId?: string | null,
  defaultValue = false
): boolean {
  try {
    const flag = FEATURE_FLAGS.find(f => f.key === flagKey);
    
    if (!flag) {
      console.warn(`⚠️ Feature flag '${flagKey}' not found, returning default: ${defaultValue}`);
      return defaultValue;
    }
    
    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }
    
    // Check expiration
    if (flag.expiresAt && new Date() > flag.expiresAt) {
      return false;
    }
    
    // If no rollout percentage set, return enabled state
    if (flag.rolloutPercentage === undefined) {
      return flag.enabled;
    }
    
    // Full rollout
    if (flag.rolloutPercentage >= 100) {
      return true;
    }
    
    // No rollout
    if (flag.rolloutPercentage <= 0) {
      return false;
    }
    
    // Gradual rollout based on user ID hash (for consistency)
    if (flag.userIdHash && userId) {
      const userHash = simpleHash(userId);
      const isInRollout = userHash < flag.rolloutPercentage;
      console.log(`🎲 Feature '${flagKey}' rollout check for user ${userId}: ${userHash}% < ${flag.rolloutPercentage}% = ${isInRollout}`);
      return isInRollout;
    }
    
    // Random rollout (less consistent but simpler)
    return Math.random() * 100 < flag.rolloutPercentage;
  } catch (error) {
    console.error(`Error checking feature flag '${flagKey}':`, error);
    return defaultValue;
  }
}

// Get all enabled features for a user (useful for debugging)
export function getEnabledFeatures(userId?: string | null): string[] {
  return FEATURE_FLAGS
    .filter(flag => isFeatureEnabled(flag.key, userId))
    .map(flag => flag.key);
}

// Feature flag hook for React components
export function useFeatureFlag(flagKey: string, userId?: string | null): boolean {
  return isFeatureEnabled(flagKey, userId);
}

// Admin function to get all flags (for debugging)
export function getAllFeatureFlags(): FeatureFlag[] {
  return FEATURE_FLAGS;
}

// Helper function to check multiple flags at once
export function areAllFeaturesEnabled(
  flagKeys: string[], 
  userId?: string | null
): boolean {
  return flagKeys.every(key => isFeatureEnabled(key, userId));
}

export function isAnyFeatureEnabled(
  flagKeys: string[], 
  userId?: string | null
): boolean {
  return flagKeys.some(key => isFeatureEnabled(key, userId));
}

// Environment-based overrides (useful for development)
if (typeof window !== 'undefined') {
  // Client-side: Check URL params for feature flag overrides
  const urlParams = new URLSearchParams(window.location.search);
  const flagOverrides = urlParams.get('flags');
  
  if (flagOverrides) {
    console.log('🚩 Feature flag overrides detected in URL:', flagOverrides);
    // Store in sessionStorage for persistence
    sessionStorage.setItem('feature_flag_overrides', flagOverrides);
  }
}

// Override function for testing and development
export function overrideFeatureFlag(flagKey: string, enabled: boolean): void {
  if (typeof window !== 'undefined') {
    const overrides = JSON.parse(
      sessionStorage.getItem('feature_flag_overrides_obj') || '{}'
    );
    overrides[flagKey] = enabled;
    sessionStorage.setItem('feature_flag_overrides_obj', JSON.stringify(overrides));
    console.log(`🔧 Feature flag override: ${flagKey} = ${enabled}`);
  }
}

// Get override for a specific flag
function getFeatureFlagOverride(flagKey: string): boolean | null {
  if (typeof window !== 'undefined') {
    const overrides = JSON.parse(
      sessionStorage.getItem('feature_flag_overrides_obj') || '{}'
    );
    return overrides[flagKey] ?? null;
  }
  return null;
}

// Modified isFeatureEnabled to check overrides first
const originalIsFeatureEnabled = isFeatureEnabled;
export { originalIsFeatureEnabled as isFeatureEnabledOriginal };

// Export updated version that checks overrides
export function isFeatureEnabledWithOverrides(
  flagKey: string,
  userId?: string | null,
  defaultValue = false
): boolean {
  // Check for development override first
  const override = getFeatureFlagOverride(flagKey);
  if (override !== null) {
    return override;
  }
  
  return originalIsFeatureEnabled(flagKey, userId, defaultValue);
}

// Replace the original function (for backward compatibility)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isFeatureEnabledTemp = isFeatureEnabled;
// @ts-ignore
isFeatureEnabled = isFeatureEnabledWithOverrides;
