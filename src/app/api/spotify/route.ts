import { NextResponse } from 'next/server'
import { createAdaptedSpotifyTrack } from '@/features/spotify/adapters/spotify'
import { getNowPlaying } from '@/features/spotify/services/spotify.service'
import type { EndpointSpotifyTrack, SpotifyTrack } from '@/features/spotify/types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await getNowPlaying()

    if (response.status === 204 || response.status >= 400) {
      return NextResponse.json<SpotifyTrack>({ isPlaying: false })
    }

    const song: EndpointSpotifyTrack = await response.json()

    if (!song || !song.item || song.is_playing === false) {
      return NextResponse.json<SpotifyTrack>({ isPlaying: false })
    }

    const adaptedTrack = createAdaptedSpotifyTrack(song)

    return NextResponse.json<SpotifyTrack>(adaptedTrack)
  } catch (error) {
    console.error('Error fetching Spotify now playing:', error)
    return NextResponse.json<SpotifyTrack>({ isPlaying: false })
  }
}
