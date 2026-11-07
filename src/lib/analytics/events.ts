import { track as _track } from '@vercel/analytics/react'

// ── Vercel Analytics payload constraints ──────────────────────────────────────
// Vercel Analytics only accepts flat primitives (no nested objects or arrays).
export type AnalyticsPrimitive = string | number | boolean | null
export type EmptyAnalyticsPayload = Record<string, never>
export type AnalyticsPropertyRecord = Record<string, AnalyticsPrimitive>

/**
 * Compile-time constraint ensuring every event in a domain map only defines
 * flat primitive properties (`string | number | boolean | null`) or `Record<string, never>`.
 */
export type ValidateAnalyticsEventMap<T extends { [K in keyof T]: AnalyticsPropertyRecord }> = T

// ── Supported OAuth providers ─────────────────────────────────────────────────
// Keep in sync with src/config/o-auth-providers.ts
export type AuthProvider = 'google' | 'github' | 'facebook' | 'discord' | 'credentials'

// ── Blog analytics domain types ───────────────────────────────────────────────
export type BlogSharePlatform = 'whatsapp' | 'x' | 'linkedin' | 'instagram_or_native' | 'copy_link'

export type BlogInteractionLocation = 'card' | 'post_page'

export type BlogBookmarkAction = 'added' | 'removed'

export type BlogSortOption = 'latest' | 'oldest' | 'popular' | 'reading_time'

// ── Domain-scoped Event Maps ──────────────────────────────────────────────────

export interface AuthAnalyticsEvents {
  Login: { provider: AuthProvider }
  Signup: { provider: AuthProvider }
}

export interface UIAnalyticsEvents {
  Cookie_Accepted: EmptyAnalyticsPayload
  Cookie_Rejected: EmptyAnalyticsPayload
  Theme_Toggled: { theme: 'light' | 'dark' | 'system' }
  Create_Project_Clicked: EmptyAnalyticsPayload
}

export interface BlogAnalyticsEvents {
  // Blog image uploads (only the failure reason is sent, never file names or contents)
  Image_Upload_Failed: { reason: string; context: 'inline' | 'cover' }

  // Social sharing
  Blog_Post_Shared: {
    postId: string
    slug: string
    platform: BlogSharePlatform
    location: BlogInteractionLocation
  }

  // Bookmarks / Favorites
  Blog_Post_Bookmarked: {
    postId: string
    slug: string
    action: BlogBookmarkAction
    authenticated: boolean
    location: BlogInteractionLocation
  }

  // Feed discovery & filtering
  Blog_Category_Filtered: {
    categorySlug: string
  }
  Blog_Search_Performed: {
    queryLength: number
    resultsCount: number
  }
  Blog_Sort_Changed: {
    sortBy: BlogSortOption
  }
}

// ── Unified Event Catalogue ───────────────────────────────────────────────────
// Merges all domain event maps while enforcing flat primitive payloads at compile time.
export interface AnalyticsEventMap
  extends ValidateAnalyticsEventMap<AuthAnalyticsEvents>,
    ValidateAnalyticsEventMap<UIAnalyticsEvents>,
    ValidateAnalyticsEventMap<BlogAnalyticsEvents> {}

export type AnalyticsEventName = keyof AnalyticsEventMap

export type AnalyticsEventArgs<T extends AnalyticsEventName> =
  AnalyticsEventMap[T] extends EmptyAnalyticsPayload ? [] : [properties: AnalyticsEventMap[T]]

// ── Client-side Typed Wrapper (SSR-safe) ──────────────────────────────────────
// Events with `EmptyAnalyticsPayload` are called with no second arg.
// Events with actual properties require them — enforced at compile time.
export function track<T extends AnalyticsEventName>(name: T, ...args: AnalyticsEventArgs<T>): void {
  if (typeof window === 'undefined') {
    return
  }

  const properties = args[0] as Record<string, AnalyticsPrimitive> | undefined

  try {
    if (properties) {
      _track(name, properties)
    } else {
      _track(name)
    }
  } catch {
    // Never let analytics tracking break user interactions (e.g. ad-blockers).
  }
}
