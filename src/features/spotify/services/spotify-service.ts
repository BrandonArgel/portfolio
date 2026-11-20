import { error, okay, type Result } from '@/utils/result'
import { createAdaptedSpotifyTrack } from '../adapters/spotify'
import type { EndpointSpotifyTrack, SpotifyTrack } from '../types'
import type { SpotifyError } from '../types/errors'

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_ENDPOINT = 'https://api.spotify.com/v1/me/player/currently-playing'

export interface SpotifyCredentials {
  clientId?: string
  clientSecret?: string
  refreshToken?: string
}

export type SpotifyFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>

export interface SpotifyServiceDeps {
  credentials?: SpotifyCredentials
  fetchImpl?: SpotifyFetch
}

function getDefaultCredentials(): SpotifyCredentials {
  return {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN,
  }
}

async function getAccessToken(
  credentials: { clientId: string; clientSecret: string; refreshToken: string },
  fetchImpl: SpotifyFetch,
): Promise<Result<string, SpotifyError>> {
  const basic = btoa(`${credentials.clientId}:${credentials.clientSecret}`)

  let response: Response
  try {
    response = await fetchImpl(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: credentials.refreshToken,
      }),
      cache: 'no-store',
    })
  } catch (thrown) {
    return error({ reason: 'NETWORK_ERROR', details: thrown })
  }

  if (!response.ok) {
    return error({ reason: 'TOKEN_REFRESH_FAILED', status: response.status })
  }

  let data: unknown
  try {
    data = await response.json()
  } catch (thrown) {
    return error({ reason: 'INVALID_RESPONSE', details: thrown })
  }

  const accessToken =
    typeof data === 'object' && data !== null && 'access_token' in data
      ? (data as { access_token: unknown }).access_token
      : null

  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    return error({ reason: 'TOKEN_REFRESH_FAILED' })
  }

  return okay(accessToken)
}

export async function getNowPlayingTrack(
  deps: SpotifyServiceDeps = {},
): Promise<Result<SpotifyTrack, SpotifyError>> {
  const creds = deps.credentials ?? getDefaultCredentials()
  const fetchImpl = deps.fetchImpl ?? fetch

  const clientId = creds.clientId?.trim()
  const clientSecret = creds.clientSecret?.trim()
  const refreshToken = creds.refreshToken?.trim()

  if (!clientId || !clientSecret || !refreshToken) {
    return error({ reason: 'MISSING_CREDENTIALS' })
  }

  const [tokenErr, accessToken] = await getAccessToken(
    { clientId, clientSecret, refreshToken },
    fetchImpl,
  )
  if (tokenErr) {
    return error(tokenErr)
  }

  let response: Response
  try {
    response = await fetchImpl(NOW_PLAYING_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store',
    })
  } catch (thrown) {
    return error({ reason: 'NETWORK_ERROR', details: thrown })
  }

  if (response.status === 204) {
    return okay({ isPlaying: false })
  }

  if (!response.ok) {
    return error({ reason: 'UPSTREAM_ERROR', status: response.status })
  }

  let rawSong: unknown
  try {
    rawSong = await response.json()
  } catch (thrown) {
    return error({ reason: 'INVALID_RESPONSE', details: thrown })
  }

  if (typeof rawSong !== 'object' || rawSong === null) {
    return error({ reason: 'INVALID_RESPONSE' })
  }

  const song = rawSong as EndpointSpotifyTrack
  if (!song.item || song.is_playing === false) {
    return okay({ isPlaying: false })
  }

  return okay(createAdaptedSpotifyTrack(song))
}
