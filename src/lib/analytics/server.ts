import { track as _trackServer } from '@vercel/analytics/server'
import type { AnalyticsEventArgs, AnalyticsEventName, AnalyticsPrimitive } from './events'

/**
 * Server-side typed counterpart to `track`, backed by `@vercel/analytics/server`.
 * Safe to call inside Server Actions, Route Handlers, or Server Components.
 */
export async function trackServer<T extends AnalyticsEventName>(
  name: T,
  ...args: AnalyticsEventArgs<T>
): Promise<void> {
  const properties = args[0] as Record<string, AnalyticsPrimitive> | undefined

  try {
    if (properties) {
      await _trackServer(name, properties)
    } else {
      await _trackServer(name)
    }
  } catch {
    // Never let analytics tracking interrupt server execution.
  }
}
