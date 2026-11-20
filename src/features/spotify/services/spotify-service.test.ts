import { describe, expect, test } from 'bun:test'
import { getNowPlayingTrack } from './spotify-service'

const VALID_CREDS = {
  clientId: 'client-id',
  clientSecret: 'client-secret',
  refreshToken: 'refresh-token',
}

describe('getNowPlayingTrack', () => {
  test('returns MISSING_CREDENTIALS when env credentials are missing', async () => {
    const [err] = await getNowPlayingTrack({
      credentials: { clientId: '', clientSecret: 'secret', refreshToken: 'token' },
    })

    expect(err).toEqual({ reason: 'MISSING_CREDENTIALS' })
  })

  test('returns TOKEN_REFRESH_FAILED when token endpoint returns non-OK HTTP status', async () => {
    const [err] = await getNowPlayingTrack({
      credentials: VALID_CREDS,
      fetchImpl: async () => new Response('Unauthorized', { status: 401 }),
    })

    expect(err).toEqual({ reason: 'TOKEN_REFRESH_FAILED', status: 401 })
  })

  test('returns UPSTREAM_ERROR when currently-playing endpoint fails', async () => {
    let call = 0
    const [err] = await getNowPlayingTrack({
      credentials: VALID_CREDS,
      fetchImpl: async () => {
        call += 1
        if (call === 1) {
          return new Response(JSON.stringify({ access_token: 'abc' }), { status: 200 })
        }
        return new Response('Rate limited', { status: 429 })
      },
    })

    expect(err).toEqual({ reason: 'UPSTREAM_ERROR', status: 429 })
  })

  test('returns NETWORK_ERROR when fetch rejects', async () => {
    const networkFailure = new TypeError('Network unreachable')
    const [err] = await getNowPlayingTrack({
      credentials: VALID_CREDS,
      fetchImpl: async () => {
        throw networkFailure
      },
    })

    expect(err?.reason).toBe('NETWORK_ERROR')
  })

  test('returns INVALID_RESPONSE when Spotify JSON payload is malformed', async () => {
    let call = 0
    const [err] = await getNowPlayingTrack({
      credentials: VALID_CREDS,
      fetchImpl: async () => {
        call += 1
        if (call === 1) {
          return new Response(JSON.stringify({ access_token: 'abc' }), { status: 200 })
        }
        return new Response('not-json', { status: 200 })
      },
    })

    expect(err?.reason).toBe('INVALID_RESPONSE')
  })

  test('returns idle state on HTTP 204', async () => {
    let call = 0
    const [err, track] = await getNowPlayingTrack({
      credentials: VALID_CREDS,
      fetchImpl: async () => {
        call += 1
        if (call === 1) {
          return new Response(JSON.stringify({ access_token: 'abc' }), { status: 200 })
        }
        return new Response(null, { status: 204 })
      },
    })

    expect(err).toBeNull()
    expect(track).toEqual({ isPlaying: false })
  })

  test('adapts active playing track payload', async () => {
    let call = 0
    const [err, track] = await getNowPlayingTrack({
      credentials: VALID_CREDS,
      fetchImpl: async () => {
        call += 1
        if (call === 1) {
          return new Response(JSON.stringify({ access_token: 'abc' }), { status: 200 })
        }
        return new Response(
          JSON.stringify({
            is_playing: true,
            progress_ms: 12000,
            item: {
              name: 'Song Title',
              duration_ms: 180000,
              artists: [{ name: 'Artist' }],
              external_urls: { spotify: 'https://open.spotify.com/track/1' },
              album: { name: 'Album', images: [{ url: 'https://img.example/cover.jpg' }] },
            },
          }),
          { status: 200 },
        )
      },
    })

    expect(err).toBeNull()
    expect(track).toMatchObject({
      isPlaying: true,
      progressMs: 12000,
      item: { name: 'Song Title' },
    })
  })
})
