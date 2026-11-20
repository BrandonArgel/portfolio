import type { SpotifyTrack } from '../types'

export const fetcher = async (url: string): Promise<SpotifyTrack | null> => {
  try {
    const res = await fetch(url)
    if (!res.ok || res.status === 204) {
      console.warn(`[spotify] Client poll returned non-OK status ${res.status}`)
      return null
    }
    return (await res.json()) as SpotifyTrack
  } catch (thrown) {
    console.warn('[spotify] Failed to fetch now-playing state:', thrown)
    return null
  }
}
