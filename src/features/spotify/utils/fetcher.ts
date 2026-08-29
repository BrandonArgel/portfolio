import type { SpotifyTrack } from '../types'
export const fetcher = async (url: string): Promise<SpotifyTrack | null> => {
  const res = await fetch(url)
  if (!res.ok || res.status === 204) return null
  return res.json()
}
