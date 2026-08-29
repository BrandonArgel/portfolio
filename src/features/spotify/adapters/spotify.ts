import type { EndpointSpotifyTrack, SpotifyTrack } from '@/features/spotify/types'

export const createAdaptedSpotifyTrack = (spotifyTrack: EndpointSpotifyTrack): SpotifyTrack => ({
  isPlaying: spotifyTrack.is_playing,
  timestamp: spotifyTrack.timestamp,
  context: spotifyTrack.context,
  progressMs: spotifyTrack.progress_ms,
  item: spotifyTrack.item,
  currentlyPlayingType: spotifyTrack.currently_playing_type,
  actions: spotifyTrack.actions,
})
