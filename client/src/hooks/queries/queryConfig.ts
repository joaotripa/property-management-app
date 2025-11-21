/**
 * Standardized TanStack Query Configuration
 *
 * This file centralizes query staleTime policies across the application
 * following ARCHITECTURE.md guidelines for consistent cache behavior.
 *
 * StaleTime determines how long data is considered fresh before refetching.
 * GcTime (garbage collection) determines how long unused data stays in cache.
 */

/**
 * Query StaleTime Policies (in milliseconds)
 *
 * These values are chosen based on data characteristics:
 * - Frequently changing data = Lower staleTime
 * - Infrequently changing data = Higher staleTime
 * - Expensive to compute data = Higher staleTime
 */
export const STALE_TIME = {
  /**
   * 1 minute (60,000ms)
   * For data that changes frequently: properties list, property details, transactions
   */
  DEFAULT: 60 * 1000,

  /**
   * 2 minutes (120,000ms)
   * For computed/aggregated data: metrics, analytics
   * Higher staleTime because these are expensive to compute
   */
  METRICS: 2 * 60 * 1000,

  /**
   * 5 minutes (300,000ms)
   * For user profile and settings data
   * Changes infrequently, safe to cache longer
   */
  USER_DATA: 5 * 60 * 1000,

  /**
   * Infinite (never considered stale)
   * For reference data that rarely changes: categories, property types
   */
  REFERENCE_DATA: Infinity,

  /**
   * 0 (always stale, refetch every time)
   * For real-time data that must always be fresh
   */
  REAL_TIME: 0,
} as const;

/**
 * Garbage Collection Time (how long unused data stays in cache)
 */
export const GC_TIME = {
  /**
   * 30 minutes (1,800,000ms)
   * Default for most queries - balances memory vs performance
   */
  DEFAULT: 30 * 60 * 1000,

  /**
   * 1 hour (3,600,000ms)
   * For reference data and expensive computations
   */
  LONG: 60 * 60 * 1000,

  /**
   * 5 minutes (300,000ms)
   * For real-time or frequently changing data
   */
  SHORT: 5 * 60 * 1000,
} as const;

/**
 * Shared query options by data type
 * Use these for consistent behavior across similar queries
 */
export const QUERY_OPTIONS = {
  /**
   * Properties list queries
   */
  properties: {
    staleTime: STALE_TIME.DEFAULT,
    gcTime: GC_TIME.DEFAULT,
    refetchOnWindowFocus: false,
    retry: 1,
  },

  /**
   * Property details queries
   */
  propertyDetails: {
    staleTime: STALE_TIME.DEFAULT,
    gcTime: GC_TIME.DEFAULT,
    refetchOnWindowFocus: false,
    retry: 1,
  },

  /**
   * Property images queries
   */
  images: {
    staleTime: STALE_TIME.DEFAULT,
    gcTime: GC_TIME.DEFAULT,
    refetchOnWindowFocus: false,
    retry: 1,
  },

  /**
   * Analytics and metrics queries
   */
  analytics: {
    staleTime: STALE_TIME.METRICS,
    gcTime: GC_TIME.LONG,
    refetchOnWindowFocus: false,
    retry: 1,
  },

  /**
   * Transaction queries
   */
  transactions: {
    staleTime: STALE_TIME.DEFAULT,
    gcTime: GC_TIME.DEFAULT,
    refetchOnWindowFocus: false,
    retry: 1,
  },

  /**
   * User settings queries
   */
  userSettings: {
    staleTime: STALE_TIME.USER_DATA,
    gcTime: GC_TIME.LONG,
    refetchOnWindowFocus: false,
    retry: 1,
  },

  /**
   * Reference data (categories, property types, etc.)
   */
  referenceData: {
    staleTime: STALE_TIME.REFERENCE_DATA,
    gcTime: GC_TIME.LONG,
    refetchOnWindowFocus: false,
    retry: 1,
  },
} as const;
