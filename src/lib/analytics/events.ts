import { track as _track } from '@vercel/analytics/react'

// ── Supported OAuth providers ─────────────────────────────────────────────────
// Keep in sync with src/config/o-auth-providers.ts
export type AuthProvider = 'google' | 'github' | 'facebook' | 'discord' | 'credentials'

// ── Event catalogue ───────────────────────────────────────────────────────────
// Add every new event + its expected properties here.
// `Record<string, never>` means the event carries no extra metadata.
export interface AnalyticsEventMap {
  // Authentication
  Login: { provider: AuthProvider }
  Signup: { provider: AuthProvider }

  // Cookie consent
  Cookie_Accepted: Record<string, never>
  Cookie_Rejected: Record<string, never>

  // UI interactions
  Theme_Toggled: { theme: 'light' | 'dark' | 'system' }
  Create_Project_Clicked: Record<string, never>
}

export type AnalyticsEventName = keyof AnalyticsEventMap

// ── Typed wrapper ─────────────────────────────────────────────────────────────
// Events with `Record<string, never>` properties are called with no second arg.
// Events with actual properties require them — enforced at compile time.
export function track<T extends AnalyticsEventName>(
  name: T,
  ...args: AnalyticsEventMap[T] extends Record<string, never>
    ? []
    : [properties: AnalyticsEventMap[T]]
): void {
  _track(name, ...(args as [Record<string, string | number | boolean>]))
}
