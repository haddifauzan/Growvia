/**
 * Client-side in-memory SWR (Stale-While-Revalidate) Cache for Growvia
 * 
 * Provides instant 0ms page rendering on repeated menu navigation,
 * background revalidation, and smart cache invalidation on data mutations.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  isInvalidated?: boolean
}

class ClientCacheStore {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTtl = 3 * 60 * 1000 // 3 minutes default TTL

  /**
   * Retrieve cached data if present and not invalidated
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (entry.isInvalidated) return null
    return entry.data as T
  }

  /**
   * Save data into cache with fresh timestamp
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      isInvalidated: false
    })
  }

  /**
   * Check if a valid (non-invalidated) cache entry exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (entry.isInvalidated) return false
    return true
  }

  /**
   * Check if cache entry is older than TTL
   */
  isStale(key: string, customTtl?: number): boolean {
    const entry = this.cache.get(key)
    if (!entry) return true
    if (entry.isInvalidated) return true
    const ttl = customTtl ?? this.defaultTtl
    return Date.now() - entry.timestamp > ttl
  }

  /**
   * Mark one or more cache keys as invalidated (forces fresh fetch on next access)
   */
  invalidate(keys: string | string[]): void {
    const keyList = Array.isArray(keys) ? keys : [keys]
    keyList.forEach(k => {
      const entry = this.cache.get(k)
      if (entry) {
        entry.isInvalidated = true
      }
    })
  }

  /**
   * Clear all cache data (e.g. on logout or session reset)
   */
  clear(): void {
    this.cache.clear()
  }
}

export const clientCache = new ClientCacheStore()

// Cache Keys constants for consistent usage across views
export const CACHE_KEYS = {
  DASHBOARD_SUMMARY: 'growvia_dashboard_summary',
  EXPERIENCES: 'growvia_experiences_list',
  SKILLS: 'growvia_skills_list',
  CAREER_ACTIVE: 'growvia_career_active',
  LEARNING: 'growvia_learning_list',
  OPPORTUNITIES: 'growvia_opportunities_list',
  PORTFOLIO: 'growvia_portfolio_settings'
} as const

