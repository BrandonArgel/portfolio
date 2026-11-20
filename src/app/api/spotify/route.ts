import { NextResponse } from 'next/server'
import { getNowPlayingTrack } from '@/features/spotify/services/spotify-service'
import type { SpotifyTrack } from '@/features/spotify/types'
import { assertNever } from '@/utils/result'

export const dynamic = 'force-dynamic'

export async function GET() {
  const [err, track] = await getNowPlayingTrack()

  if (err) {
    switch (err.reason) {
      case 'MISSING_CREDENTIALS':
        console.warn('[spotify] Missing Spotify OAuth credentials; returning idle track state.')
        break
      case 'TOKEN_REFRESH_FAILED':
        console.error(
          `[spotify] Failed to refresh Spotify access token (status: ${err.status ?? 'unknown'}).`,
        )
        break
      case 'UPSTREAM_ERROR':
        console.error(`[spotify] Upstream Spotify API returned status ${err.status}.`)
        break
      case 'NETWORK_ERROR':
        console.error('[spotify] Network failure while contacting Spotify API:', err.details)
        break
      case 'INVALID_RESPONSE':
        console.error('[spotify] Malformed JSON payload received from Spotify API:', err.details)
        break
      default:
        return assertNever(err)
    }

    return NextResponse.json<SpotifyTrack>({ isPlaying: false }, { status: 200 })
  }

  return NextResponse.json<SpotifyTrack>(track)
}
